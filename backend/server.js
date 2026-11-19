
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import banco from './banco.js'

const app = express()
const PORTA = 3000

// Segredo usado para assinar os tokens
const SEGREDO = 'segredo-do-instaclone'

// Configurações do servidor
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// Configuração do envio de arquivos
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads',
    filename: (req, arquivo, avisar) => {
      avisar(null, Date.now() + path.extname(arquivo.originalname))
    },
  }),
})

// Porteiro: verifica se a pessoa está logada
function exigirLogin(req, res, next) {
  const cabecalho = req.headers.authorization

  if (!cabecalho) {
    return res.status(401).json({
      erro: 'Faça login para continuar.',
    })
  }

  const token = cabecalho.split(' ')[1]

  try {
    const dados = jwt.verify(token, SEGREDO)
    req.usuarioId = dados.id
    next()
  } catch {
    return res.status(401).json({
      erro: 'Sessão inválida. Faça login de novo.',
    })
  }
}

// Busca os dados públicos de uma pessoa
function buscarPessoa(id) {
  return banco
    .prepare(`
      SELECT id, usuario, nome, bio, foto
      FROM usuarios
      WHERE id = ?
    `)
    .get(id)
}

// POST /login -> confere usuário e senha e devolve um token
app.post('/login', (req, res) => {
  const usuario = req.body.usuario
  const senha = req.body.senha

  if (!usuario || !senha) {
    return res.status(400).json({
      erro: 'Informe o usuário e a senha.',
    })
  }

  const pessoa = banco
    .prepare('SELECT * FROM usuarios WHERE usuario = ?')
    .get(usuario)

  if (!pessoa || !bcrypt.compareSync(senha, pessoa.senha)) {
    return res.status(401).json({
      erro: 'Usuário ou senha incorretos.',
    })
  }

  const token = jwt.sign(
    { id: pessoa.id },
    SEGREDO,
    { expiresIn: '7d' }
  )

  res.json({ token: token })
})

// GET /feed -> devolve 10 posts aleatórios
app.get('/feed', exigirLogin, (req, res) => {
  const posts = banco
    .prepare(`
      SELECT
        posts.id,
        posts.imagem,
        posts.legenda,
        usuarios.usuario AS autor,
        usuarios.foto AS fotoAutor
      FROM posts
      JOIN usuarios ON usuarios.id = posts.usuario_id
      ORDER BY RANDOM()
      LIMIT 10
    `)
    .all()

  res.json(posts)
})

// GET /perfil -> dados da pessoa logada e seus posts
app.get('/perfil', exigirLogin, (req, res) => {
  const pessoa = buscarPessoa(req.usuarioId)

  pessoa.posts = banco
    .prepare(`
      SELECT id, imagem, legenda
      FROM posts
      WHERE usuario_id = ?
      ORDER BY id DESC
    `)
    .all(req.usuarioId)

  res.json(pessoa)
})

// POST /posts -> publica uma foto nova
app.post('/posts', exigirLogin, upload.single('imagem'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      erro: 'Escolha uma foto para publicar.',
    })
  }

  const legenda = req.body.legenda || ''

  const resultado = banco
    .prepare(`
      INSERT INTO posts (usuario_id, imagem, legenda)
      VALUES (?, ?, ?)
    `)
    .run(req.usuarioId, req.file.filename, legenda)

  const novo = {
    id: resultado.lastInsertRowid,
    imagem: req.file.filename,
    legenda: legenda,
  }

  res.status(201).json(novo)
})

// PATCH /perfil -> altera nome, bio e foto de perfil
app.patch('/perfil', exigirLogin, upload.single('foto'), (req, res) => {
  const nome = (req.body.nome || '').trim()
  const bio = (req.body.bio || '').trim()

  if (nome === '') {
    return res.status(400).json({
      erro: 'O nome não pode ficar vazio.',
    })
  }

  banco
    .prepare('UPDATE usuarios SET nome = ?, bio = ? WHERE id = ?')
    .run(nome, bio, req.usuarioId)

  // Só troca a foto se uma nova foi enviada
  if (req.file) {
    banco
      .prepare('UPDATE usuarios SET foto = ? WHERE id = ?')
      .run(req.file.filename, req.usuarioId)
  }

  res.json(buscarPessoa(req.usuarioId))
})

// Liga o servidor
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`)
})
