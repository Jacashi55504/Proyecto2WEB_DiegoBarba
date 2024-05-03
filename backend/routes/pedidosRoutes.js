const express = require("express");
const router = express.Router();
const {protect} = require("../middleware/authMiddleware");

const {borrarPedidos}=require('../controllers/pedidiosController')
const {crearPedidos}=require('../controllers/pedidiosController')
const {modificarPedidos}=require('../controllers/pedidiosController')
const{getPedidos}=require('../controllers/pedidiosController')

router.get('/', protect, getPedidos);
router.post('/', protect, crearPedidos);
router.put('/:id', protect, modificarPedidos);
router.delete('/:id', protect, borrarPedidos);

module.exports = router;
