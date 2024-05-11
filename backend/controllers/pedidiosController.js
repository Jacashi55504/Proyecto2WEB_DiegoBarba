const asyncHandler = require("express-async-handler");
const Pedido = require("../models/pedidoModel");
const Articulo=require("../models/articuloModel")
const getPedidos = asyncHandler( async (req, res) => {
    const pedidos = await Pedido.find({user: req.user.id});
    res.status(200).json(pedidos);
});

const calcularTotalPedido = async (articulos, cantidades) => {
    try {
        // Obtener los precios de los artículos
        const precios = await Promise.all(articulos.map(async (nombre) => {
            const articulo = await Articulo.findOne({ nombre });
            console.log("art:",articulo)
            return articulo.precio;
        }));

        // Calcular el precio total sumando el precio de cada artículo multiplicado por su cantidad
        const total = precios.reduce((acc, precio, index) => {
            return acc + (precio * cantidades[index]);
        }, 0);

        // Devolver el precio total
        return total;
    } catch (error) {
        // Manejar cualquier error que ocurra durante la búsqueda de precios de los artículos
        throw new Error('Error al calcular el precio total del pedido');
    }
};

const crearPedidos = asyncHandler(async (req, res) => {
    if (!req.body.articulos || !req.body.cantidades) {
        res.status(400);
        throw new Error('Faltan artículos o cantidades');
    }

    // Calcular el precio total del pedido
    const total = await calcularTotalPedido(req.body.articulos, req.body.cantidades);

    // Crear el pedido
    const pedido = await Pedido.create({
        articulos: req.body.articulos,
        cantidades: req.body.cantidades,
        total,
        user: req.user.id
    });

    res.status(201).json(pedido);
});


const modificarPedidos = asyncHandler( async (req, res) => {
    const pedido = await Pedido.findById(req.params.id);
    if(!pedido){
        res.status(404);
        throw new Error('No se encontró la tarea');
    }
    const pedidoUpdated = await Pedido.findByIdAndUpdate(req.params.id, req.body, {new: true});
    res.status(200).json(pedidoUpdated);
});

const borrarPedidos = asyncHandler( async (req, res) => {
    const pedidoDeleted = await Pedido.findById(req.params.id);
    if(!pedidoDeleted){
        res.status(404);
        throw new Error('No se encontró la tarea');
    }
    await Pedido.deleteOne(pedidoDeleted);
    res.status(200).json({message: `Se eliminó la tarea: ${req.params.id}`});
});
module.exports = {
    getPedidos, crearPedidos, modificarPedidos, borrarPedidos
}