import { DatabaseSync } from 'node:sqlite'

// Abre o arquivo do banco
const banco = new DatabaseSync('banco.db')

// Cria a tabela de usuários
banco.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        nome TEXT NOT NULL DEFAULT '',
        bio TEXT NOT NULL DEFAULT '',
        foto TEXT NOT NULL DEFAULT 'sem-foto.svg'
    );
`)

// Cria a tabela de publicações
banco.exec(`
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
        imagem TEXT NOT NULL,
        legenda TEXT NOT NULL DEFAULT ''
    );
`)

// Exporta a conexão
export default banco