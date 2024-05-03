const mongoose = require("mongoose")

const pedidoSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    descripcion: {
        type: String,
        required: [true, "Por favor ingrese una descripcion"]
    }
}, {
    timestamps: true
})
module.exports = mongoose.model("Pedido", pedidoSchema)