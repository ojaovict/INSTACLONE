// Importando o Express
import express from 'express';

// Criando a aplicação
const app = express();

// Definindo a porta
const PORT = 3000;

// Criando a rota principal
app.get('/', (req, res) => {
    res.send('Olá! Bem-vindo ao Instaclone!');
});

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor funcionando na porta ${PORT}`);
});