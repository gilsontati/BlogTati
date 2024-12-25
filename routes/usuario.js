const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/registro', (req, res) => {
res.render('usuarios/registro')
})

router.post('/registro', async (req, res) => {

var erros = []

if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
erros.push({texto: 'Campo do nome vazio. Preenche-o'})
}

if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
erros.push({texto: 'Campo do email vazio. Preenche-o'})        
}

if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
erros.push({texto: 'Campo da senha vazio. Preenche-o'})
}

if(req.body.nome.length < 4){
erros.push({texto: 'Nome muito curto. No minimo 8 caracteres.'})
}

if(req.body.senha.length < 3){
erros.push({texto: 'Nome muito curto. No minimo 8 caracteres.'})
}

if(req.body.senha != req.body.senha2) {
erros.push({texto: 'A senhas sao diferentes. Verifique novamente as senhas.'})
}

if(erros.length > 0) {
res.render('usuarios/registro', {erros: erros})
} else {
Usuario.findOne({email: req.body.email}).then((usuario) => {
if(usuario) {
erros.push({texto: 'Ja existe uma conta com o mesmo email.'})
}

const novoUsuario = new Usuario ({
nome: req.body.nome,
email: req.body.email,
senha: req.body.senha,
eAdmin: 1
})

bcrypt.genSalt(10, (erro, salt) => {
bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
if(erro) {
req.flash('error_msg', 'Houve um erro durante o salvamento.')
res.redirect('/usuario/registro')
} else {

novoUsuario.senha = hash
novoUsuario.save().then(() => {
req.flash('success_msg', 'Conta criada com sucesso.')
res.redirect('/usuario/login')
}).catch(() => {
req.flash('error_msg', 'Houve um erro durante o salvamento.')
res.redirect('/')
}) 
}
})
})

}).catch()
}







})

router.get('/login', (req, res) => {
res.render('usuarios/login')
})

router.post('/login', (req, res, next) => {

passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/usuario/login',
    failureFlash: true
})(req, res, next)
})

router.get('/logout', (req, res, next) => {
req.logout((erro) => {
if(erro) {
return next(erro)
}
req.flash('success_msg', 'Deslogado com sucesso!')
res.redirect('/')
})

})
module.exports = router