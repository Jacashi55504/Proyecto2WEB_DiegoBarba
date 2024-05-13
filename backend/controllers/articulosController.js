const asyncHandler = require("express-async-handler");
const Articulo=require("../models/articuloModel")

const crearArticulo = asyncHandler(async (req, res) => {
    const { nombre, precio } = req.body;
    const articuloExistente = await Articulo.findOne({ nombre });
    if (articuloExistente) {
        res.status(400);
        throw new Error('Un artículo con este nombre ya existe');
    }
    const nuevoArticulo = await Articulo.create({
        nombre,
        precio
    });
    res.status(201).json(nuevoArticulo);
});

module.exports = { crearArticulo };