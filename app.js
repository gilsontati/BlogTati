// Configuracao dos Modulos
const express = require('express')
const app = express()
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const session = require('express-session')
const path = require('path')
const flash = require('connect-flash')
const admin = require('./routes/admin')
const mongoose = require('mongoose')
require('./models/Postagem')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
const Postagem = mongoose.model('postagens')
const usuario = require('./routes/usuario')
const passport = require('passport')
require('./config/auth')(passport)
const { eAdmin } = require('./helpers/eAdmin')


//Config Session
app.use(session({
secret: 'blogtati',
resave: true,
saveUninitialized: true,
cookie: { maxAge: 24 * 60 * 60 * 1000 }
}))

//Config Passport
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

//Config Middleware
app.use((req, res, next) => {
res.locals.success_msg = req.flash('success_msg')
res.locals.error_msg = req.flash('error_msg')
res.locals.error = req.flash('error')
res.locals.user = req.user || null
next()
})
//Config handlebars
app.engine('handlebars', handlebars.engine({defaultLayout: 'main', runtimeOptions: {
allowedProtoMethods: true,
allowProtoMethodsByDefault: true,
allowedProtoProperties: true,
allowProtoPropertiesByDefault: true
}}))
app.set('view engine', 'handlebars')

// Config body Parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//Public
app.use(express.static('public'))

//Mongoose
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/blogtati').then(() => {
console.log('mongo conectado com sucesso!')
}).catch(() => {
console.log('Falha ao conectar o Mongo.')
})

//Rotas
app.use('/admin', admin)
app.use('/usuario', usuario)



app.get('/', async (req, res) => {
try {
const postagem = await Postagem.find().populate('categoria')
res.render('home', {postagem: postagem})
} catch (err) {
req.flash('error_msg', 'Houve um erro ao listar as postagens.')
res.redirect('/')
}
})

app.get('/postagens/:slug', async (req, res) => {
try {
const postagem = await Postagem.findOne({slug: req.params.slug})
if(postagem){
res.render('postagem/index', {postagem: postagem})
} else {
req.flash('error_msg', 'Falha ao encontrar o link.')
res.redirect('/')
}
} catch (err) {
req.flash('error_msg', 'Nao existe nenhuma postagem.', err)
res.redirect('/')
}
})

app.get('/categoria', async (req, res) => {
try {
const categoria = await Categoria.find()
res.render('postagem/categoria', {categoria: categoria})
} catch (err) {}
})

app.get('/categoria/:slug', (req, res) => {
Categoria.findOne({slug: req.params.slug}).then((categoria) => {
if(categoria) {
Postagem.find().then((postagem) => {
res.render('postagem/categorias', {postagem: postagem, categoria: categoria})
}).catch((err) => {
req.flash('error_msg', 'Houve um erro ao listar as postagens das categorias.')
res.redirect('/')
})
}
})
})

//Outros
const port = process.env.PORT || 8040
app.listen(port, () => {
console.log('Servidor rodando na porta', port) 
})