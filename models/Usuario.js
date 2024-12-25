const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuarios = new Schema({
nome: {
    type: String,
    required: true
},
eAdmin: {
    type: Number,
    default: 0
},
email: {
    type: String,
    required: true
},
senha: {
    type: String,
    required: true
}
})

mongoose.model('usuarios', Usuarios)