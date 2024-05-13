const express = require("express");
const router = express.Router();
const {protect} = require("../middleware/authMiddleware");
const {crearArticulo} = require('../controllers/articulosController');

router.post('/', protect, crearArticulo);

module.exports = router;
