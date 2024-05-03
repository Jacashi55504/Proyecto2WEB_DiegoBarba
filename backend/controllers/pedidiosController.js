const asyncHandler = require("express-async-handler");
const Pedido = require("../models/pedidoModel");

const getPedidos = asyncHandler( async (req, res) => {
    const pedidos = await Pedido.find({user: req.user.id});
    res.status(200).json(pedidos);
});

const crearPedidos = asyncHandler( async (req, res) => {
    if(!req.body.descripcion){
        res.status(400);
        throw new Error('Falta descripcion');
    }
    const pedido = await Pedido.create({
        descripcion : req.body.descripcion,
        user: req.user.id
    })
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