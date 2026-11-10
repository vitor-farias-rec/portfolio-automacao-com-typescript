// Importando dependências
import {test, expect, vi} from 'vitest';
// Simulando login
function loginLento(usuario:string): Promise<string>{
    return new Promise ((resolve)=>{
        setTimeout(()=>{
            resolve(`BEM VINDO, ${usuario}!`);
        },5000);
    });
}

test('Simular login usando fake timers', async ()=>{

    //Ligando contador de tempo simulado
    vi.useFakeTimers ();
    console.log('⌛ INICIANDO CENÁRIO DE TESTE ;D')

    // Chamando promisse de usuario sem await ainda
    const promessaLogin = loginLento('Vitor Pontes');

    // Configurando avanço de 5 segundos
    vi.advanceTimersByTime(5000);

    const resultado = await promessaLogin;

    // Verificar resultado
    expect(resultado). toBe('BEM VINDO, Vitor Pontes!');

    console.log('Sucesso! Teste executado dentro dos parâmetros especificados.');

    // Desligando o contador de tempo simulado
    vi.useRealTimers();
})