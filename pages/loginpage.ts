import {Page, Locator} from '@playwright/test';
// Recebe o pago no constructor
// Encapsula os seletores/UI
// Métodos claros para ex.: login(); fillEmail(); [...]
// Métodos retornam os locators para o teste apenas fazer o (Assert)
// Melhor porque se um seletor no HTML for atualizado em um único local no page object model

export class LoginPage{
    //locators 
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    readonly credentialsBox: Locator;
    
    constructor(private page:Page){
        this.emailInput = page.locator('#email');
        this.passwordInput = page.locator('#password');
        this.loginButton = page.locator('#loginButton');
        this.errorMessage = page.locator('#errorMessage');
        this.statusMessage = page.locator('#statusMessage');
        this.credentialsBox = page.locator('.credentials-info');
    }

    //Navegar para tela de login

    async goto(){
        await this.page.goto('https://alisonmelo.github.io/tioalison-pe-t4-fap26/projetos-base/01-sistema-login')
    }

    //Função/Método/Ação de login
    async login(username: string, password: string){
        await this.emailInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    //Preenchimento de email
    async fillEmail(email:string){
        await this.emailInput.fill(email);
    }
    //Preenchimento de senha
    async fillPassword(password:string){
        await this.passwordInput.fill(password);
    }
    //Click no botão de login
    async clickSubmit(){
        await this.loginButton.click();
    }
};