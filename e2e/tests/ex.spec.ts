import {test, expect} from '../fixtures/auth.fixtures';

test('usuario já logado', async ({loggedPage}) =>{
    await expect(loggedPage).toHaveURL(/painel\.html/);
});