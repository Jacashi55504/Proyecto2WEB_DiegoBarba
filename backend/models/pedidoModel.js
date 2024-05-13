const mongoose = require("mongoose")
const Articulo =require('./articuloModel')

const pedidoSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    articulos: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Articulo'
    }],
    cantidades:[{
        type:Number

    }],    
    total:{
        type:Number, 
        default:0
    }},
 {
    timestamps: true
});
module.exports = mongoose.model("Pedido", pedidoSchema)