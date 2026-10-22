import {test as base, Page} from '@playwright/test';
import {LoginPage} from '../pages/loginpage.ts';

type authFixture={
    loginPage: LoginPage;
    loggedPage: Page;
};

//Entregando a página estanciada no teste
export const test = base.extend.authFixture>({
    loginPage: async ({page}, use)=>{
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await use(loginPage);
    },
    //Entretando página logada
    loggedPage: async ({page}, use)=>{
        const loginPage = new LoginPage();
        await loginPage.goto();
        await loginPage.login('admin@system.com', 'AdminPassword123');
        await page.waitForURL(/painel\.html/);
        await use(page);
    }
});

export {expect} from "@playwright/test";