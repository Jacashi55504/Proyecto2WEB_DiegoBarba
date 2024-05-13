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
    const pedidoUpdated = await Pedido.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(pedidoUpdated);
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

module.exports = {
    getPedidos, crearPedidos, modificarPedidos, borrarPedidos
};
