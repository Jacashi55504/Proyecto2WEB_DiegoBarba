const asyncHandler = require("express-async-handler");
const Pedido = require("../models/pedidoModel");
const Articulo = require("../models/articuloModel");

const getPedidos = asyncHandler(async (req, res) => {
    const pedidos = await Pedido.find({ user: req.user.id }).populate('articulos');
    res.status(200).json(pedidos);
});

const crearPedidos = asyncHandler(async (req, res) => {
    if (!req.body.articulos || !req.body.cantidades || !req.body.precios) {
        res.status(400);
        throw new Error('Faltan artículos, cantidades o precios');
    }

    const articulosObjectId = await Promise.all(req.body.articulos.map(async (nombreArticulo, index) => {
        let articulo = await Articulo.findOne({ nombre: nombreArticulo });
        if (!articulo) {
            const precio = parseInt(req.body.precios[index], 10);
            articulo = await Articulo.create({ nombre: nombreArticulo, precio: precio });
        }
        return articulo._id;
    }));

    const total = await calcularTotalPedido(req.body.articulos, req.body.cantidades);

    const pedido = await Pedido.create({
        user: req.user.id,
        articulos: articulosObjectId,
        cantidades: req.body.cantidades,
        total
    });

    res.status(201).json(pedido);
});

const calcularTotalPedido = async (articulos, cantidades) => {
    try {
        if (!Array.isArray(articulos)) {
            throw new Error('Los artículos deben ser proporcionados como un array');
        }

        const precios = await Promise.all(articulos.map(async (nombreArticulo) => {
            const articulo = await Articulo.findOne({ nombre: nombreArticulo });
            if (!articulo) {
                throw new Error(`Artículo con nombre "${nombreArticulo}" no encontrado`);
            }
            return articulo.precio;
        }));

        const total = precios.reduce((acc, precio, index) => acc + (precio * cantidades[index]), 0);

        return total;
    } catch (error) {
        console.error("Error al calcular el precio total del pedido:", error);
        throw new Error('Error al calcular el precio total del pedido');
    }
};

const modificarPedidos = asyncHandler(async (req, res) => {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
        res.status(404);
        throw new Error('No se encontró el pedido');
    }

    // Recalcular el total del pedido
    const articulosObjectId = await Promise.all(req.body.articulos.map(async (nombreArticulo, index) => {
        let articulo = await Articulo.findOne({ nombre: nombreArticulo });
        if (!articulo) {
            const precio = parseInt(req.body.precios[index], 10);
            articulo = await Articulo.create({ nombre: nombreArticulo, precio: precio });
        }
        return articulo._id;
    }));

    const total = await calcularTotalPedido(req.body.articulos, req.body.cantidades);

    pedido.articulos = articulosObjectId;
    pedido.cantidades = req.body.cantidades;
    pedido.total = total;

    await pedido.save();

    res.status(200).json(pedido);
});


const borrarPedidos = asyncHandler(async (req, res) => {
    const pedidoDeleted = await Pedido.findById(req.params.id);
    if (!pedidoDeleted) {
        res.status(404);
        throw new Error('No se encontró el pedido');
    }
    await Pedido.deleteOne(pedidoDeleted);
    res.status(200).json({ message: `Se eliminó el pedido: ${req.params.id}` });
});

const borrarArticuloPedido = asyncHandler(async (req, res) => {
    const pedido = await Pedido.findById(req.params.pedidoId).populate('articulos');
    if (!pedido) {
        res.status(404);
        throw new Error('Pedido no encontrado');
    }

    const articuloIndex = pedido.articulos.findIndex(articuloId => articuloId._id.toString() === req.params.articuloId);
    if (articuloIndex === -1) {
        res.status(404);
        throw new Error('Artículo no encontrado en el pedido');
    }

    pedido.articulos.splice(articuloIndex, 1);
    pedido.cantidades.splice(articuloIndex, 1);

    if (pedido.articulos.length === 0) {
        await Pedido.deleteOne({ _id: req.params.pedidoId });
        res.status(200).json({ message: 'Pedido eliminado porque no quedan artículos' });
    } else {
        const total = await calcularTotalPedido(pedido.articulos.map(articulo => articulo.nombre), pedido.cantidades);
        pedido.total = total;
        await pedido.save();
        res.status(200).json({ message: 'Artículo eliminado del pedido', pedido });
    }
});



module.exports = {
    getPedidos, crearPedidos, modificarPedidos, borrarPedidos, borrarArticuloPedido
};
