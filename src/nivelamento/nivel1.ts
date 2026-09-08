// formas de tipar
// forma 1
let idade:number;
// forma 2
const nome = 'Seu Zezo';
// forma 3 não recomendado por ser redundante
const sobreNome:string = 'da Silva';
// tipagem especiais
type usuario = {'nick':string, 'age':number }

let jogador: usuario = {nick: 'Ricardo', age:18};

let jogadorVelho:usuario = {nick: 'Toin', age:76};

function verificarIdade(usuarioAtual: usuario){
    if (usuarioAtual.age>=21){
        console.log(`✅ Acesso liberado: O jogador ${usuarioAtual.nick} tem ${usuarioAtual.age} anos e pode jogar!`);
    }else{
        console.log(`❌ Acesso Negado: O jogador ${usuarioAtual.nick} tem ${usuarioAtual.age} anos e não pode jogar!`);
    }
};
verificarIdade(jogador);
verificarIdade(jogadorVelho);