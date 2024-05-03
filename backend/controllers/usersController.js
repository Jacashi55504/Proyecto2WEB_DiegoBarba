const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const register = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body
    if(!name || !email || !password){
        res.status(400);
        throw new Error("Faltan datos");
    }
    const userExist = await User.findOne({email});
    if(userExist){
        res.status(400);
        throw new Error("Ya existe un usuario con ese email");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    })
    res.status(201).json({
        message: "Usuario registrado exitosamente",
        user: user
    })
});
const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(user && (await bcrypt.compare(password, user.password))){
        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generarToken(user.id)
        })
    }
    else
    {
        res.status(401);
        throw new Error("Credenciales incorrectas");
    }
});
const generarToken = (idUsuario) => {
    return jwt.sign({idUsuario}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
} 
const showData = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});
//DELETE
const deleteUser =asyncHandler( async(req, res) => {
    const user= await User.findOne({email:req.params.email})
    
    if (!user){
        res.status(404)
        throw new Error('Usuario no existe')
    }
    await User.deleteOne(user)

    res.status(200).json({
        email: req.params.email,
        message: "Usuario borrado correctamente"
    })
})
//UPDATE
const updateUser =asyncHandler( async(req, res) => {
    const user =await User.findOne({email: req.params.email})
    if(!user){
        res.status(404)
        throw new Error('Usuario no existe ')
    }
    const userUpdated=await User.findOneAndUpdate({email:req.params.email}, req.body, {new:true})
    res.status(200).json(userUpdated)
})

module.exports = {
    register, login, showData, deleteUser, updateUser
}
