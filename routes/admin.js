const express = require('express')
const { default: mongoose } = require('mongoose')
const router = express.Router()
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const { eAdmin } = require('../helpers/eAdmin')


router.get('/categorias', eAdmin, async (req, res) => {

    try {
        
    const categorias = await Categoria.find()
    res.render('admin/categorias', {categorias: categorias})


} catch(err){
    req.flash('error_msg', 'Houve um erro ao listar as categorias.')
    res.redirect('/admin')

}
})

router.get('/categorias/nova', eAdmin, (req, res) => {
    res.render('admin/addcategoria')
})

router.post('/categorias/add', eAdmin, (req, res) => {
   

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: 'Nome invalido.'})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug invalido. Tente novamente.'})
    }

    if(req.body.nome.length < 3){
        erros.push({texto: 'Nome da categoria muito pequena. No minimo 3 caracteres.'})
    }

    if(req.body.slug.length < 3){
        erros.push({texto: 'Slug muito pequeno.'})
    }

    if(erros.length > 0){
        res.render('admin/addcategoria', {erros: erros})
    } else {
       
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch(() => {
            req.flash('error_msg', 'Houve um erro.')
            res.redirect('/admin/categorias/add')
        })

        }
    }

)

router.get('/categorias/edit/:id', async (req, res) => {
try{
const categoria = await Categoria.findOne({_id: req.params.id})
res.render('admin/editcategoria', {categoria: categoria})
} catch(err){
req.flash('error_msg', 'Falha ao encontrar as categorias.')
res.redirect('/admin/categorias')
}
})

router.post('/categorias/edit', eAdmin, async (req, res) => {
try {
const categoria = await Categoria.findOne({_id: req.body.id})
categoria.nome = req.body.nome
categoria.slug = req.body.slug

await categoria.save()
req.flash('success_msg', 'Categoria salva com sucesso!')
res.redirect('/admin/categorias')
} catch(err){
req.flash('error_msg', 'Erro ao salvar a categoria.')
res.redirect('/admin/categorias')
}
})

router.post('/categorias/deletar', eAdmin, async (req, res) => {
try {
await Categoria.deleteOne({_id: req.body.id})
res.redirect('/admin/categorias')
} catch(err){
req.flash('error_msg', 'Houve um erro ao deletar.')
res.redirect('/admin/categorias')
}
})

router.get('/postagens', eAdmin, async (req, res) => {
try {
const postagens = await Postagem.find().populate('categoria')
res.render('admin/postagem', {postagens: postagens})
} catch (err) {
req.flash('error_msg', 'Houve um erro ao listar as postagens.')
res.redirect('/admin/postagens')
}
})

router.get('/postagens/add', eAdmin, async (req, res) => {
try {
const categorias = await Categoria.find()
res.render('admin/addpostagem', {categorias: categorias})
} catch(err){
res.status(404).json({message: 'Falha ao listar as categorias'})
}
})

router.post('/postagens/nova', eAdmin, async (req, res) => {
try {
const { titulo, slug, descricao, conteudo, categoria } = req.body

const novaPostagem = new Postagem({
titulo,
slug,
descricao,
conteudo,
categoria
})

await novaPostagem.save()

req.flash('success_msg', 'Postagem criada com sucesso!')
res.redirect('/admin/postagens')
} catch (err) {
req.flash('error_msg', 'Houve um erro ao criar postagem.')
res.redirect('/admin/postagens')
}
})

router.get('/postagens/edit/:id', async (req, res) => {
try {
const postagem = await Postagem.findOne({_id: req.params.id})
const categoria = await Categoria.find()
res.render('admin/editpostagem', {postagem: postagem, categoria: categoria})
} catch (err) {
req.flash('error_msg', 'Houve um erro ao buscar os IDs.')
res.redirect('/admin/postagens')
}
})

router.post('/postagens/edit', eAdmin, async (req, res) => {
Postagem.findOne({_id: req.body.id}).then((postagem) => {
postagem.titulo = req.body.titulo,
postagem.slug = req.body.slug,
postagem.descricao = req.body.descricao,
postagem.conteudo = req.body.conteudo,
postagem.categoria = req.body.categoria
postagem.save().then(() => {
req.flash('success_msg', 'Postagem editada com sucesso!')
res.redirect('/admin/postagens')
}).catch((err) => {
req.flash('error_msg', 'Houve um erro ao processar a editacao.')
res.redirect('/admin/postagens')
})
})})

router.get('/postagens/deletar/:id', async (req, res) => {
try {
const postagem = await Postagem.findOneAndDelete({_id: req.params.id})
res.redirect('/admin/postagens')
} catch (err) {}
})
module.exports = router