// Importando a função utilitária de aguardar tempo(delay)

import {aguardar}from '../../utils/helpers';
// SIMULANDO UMA API DE LOGIN
function simularLogin(usuario: string, senha: string):Promise<string>{
    return new Promise((resolve, reject) =>{
        if(usuario === 'admin' && senha === '123456'){
            resolve ('token-secreto-aprovado');
        }else{
            reject('ERRO 401 - USUARIO OU SENHA INVÁLIDOS! ❌');
        }
    });
}

// FUNÇÃO PRINCIPAL TESTANDO COM ASYNC/AWAIT ;-D
async function executarCT(){
    console.log('⌛ INICIANDO CENÁRIO DE TESTE ;D')
    try{
        console.log('Passo 1: Abrindo tela de login');
        await aguardar(2000);
        console.log('Passo 2: Inserindo credenciais ...');
        await aguardar(3000);

        const token = await simularLogin('admin', '123456');
        console.log(`SUCESSO! USUÁRIO LOGADO TOKEN RECEBIDO: ${token}\n`)
    }catch(erro){
        console.error(`FALHA NO TESTE: ${erro}\n`);
    }finally{
        console.log('Passo final: Fechando navegador e limpando dados.');
    }
}

executarCT();