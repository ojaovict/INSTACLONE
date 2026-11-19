// Importando o Express
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import banco from './banco.js';
// Criando a aplicação
const app = express();
app.use(express.json());

// Definindo a porta
const PORT = 3000;

// Criando a rota principal
app.get('/', (req, res) => {
    res.send('Olá! Bem-vindo ao Instaclone!');
});
// Rota de login
app.post('/api/login', (req, res) => {

});

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor funcionando na porta ${PORT}`);
});