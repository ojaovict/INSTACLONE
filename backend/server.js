//importando o express
import express from "express";

//variavel app pra gerenciar o servidor e rotas
const app = express();

// CRIANDO PORTA DO SERVER
const PORT = 3000;

//aqui eu criei uma rota onde o app.get 
// recebe a requisição do HTTP pro GET
// "/" é o endereço principal do programa
//req tem os dados da aquisição
//res envia a resposta e o send envia e a mensagem de volta

//
app.get("/", (req, res) => {
    res.send("Bem-vindo à minha rede social!");
});
//
app.listen(PORT, () => {
    console.log(`Servidor funcionando na porta ${PORT}`);
});