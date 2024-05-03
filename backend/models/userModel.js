const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Por favor ingrese un nombre"]
    },
    email: {
        type: String,
        required: [true, "Por favor ingrese un email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Por favor ingrese una contraseña"]
    },
    esAdmin: {
        type: Boolean,
        default: false
    }
},  {
    timestamps: true
});
module.exports = mongoose.model("User", userSchema);