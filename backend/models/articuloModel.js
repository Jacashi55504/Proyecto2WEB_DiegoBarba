const mongoose = require('mongoose');

const articuloSchema = mongoose.Schema({
  nombre: { 
    type: String, required: true
 },
  precio: { 
    type: Number, required: true 
}
  
});

const Articulo = mongoose.model('Articulo', articuloSchema);

module.exports = Articulo;
