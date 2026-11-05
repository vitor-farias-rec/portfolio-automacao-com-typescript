import {test, expect, request} from "@playwright/test";
const APIUrl = 'https://api-qa-fap2026.onrender.com/api';

test.describe(
    "Testes api no padrão AAR, com geração de massa para UI",
    ()=>{
        let authToken: string;
        let createProdID: string;
        const uniqueProdName = `Teclado Mecânico ${Date.now()}`;

        //ARRANGE (SETUP login Lojista)
        test.beforeAll(async({request}) =>{
            const loginRes = await request.post(`${APIurl/login, 
        {
            data:{
                email: 'lojista@system.com',
                password: 'SellerPass123'
            },
        }    
    );
    expect(loginRes.status()).toBe(200);
    const loginData = await loginRes.json();
    authToken = loginData.token;
    expect (authToken).toBeDefinied();
        })
    }
)