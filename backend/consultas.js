import banco from './banco.js'

// Conta todas as publicações
const resultado = banco.prepare(`
    SELECT COUNT(*) AS total
    FROM posts
`).get()

// Exibe a quantidade
console.log(resultado)