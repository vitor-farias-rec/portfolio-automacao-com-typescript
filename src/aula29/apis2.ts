export {};

const BASE_URL = 'https://jsonplaceholder.typicode.com';

// DEFINIR contrato de tipo
type Post = {
    userId: number;
    id: number;
    title: string;
    body: string;
};

// PUT /posts/1
async function substituirPut(id: number) {
    console.log(`--- 1. PUT /posts/${id} ---`);
    const enviado: Post = {
        id,
        userId: 1,
        title: 'Titulo via PUT',
        body: 'Conteudo via PUT',
    };
    console.log('Body enviado:', enviado);
    const res = await fetch(`${BASE_URL}/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(enviado),
    });
    const recebido: Post = await res.json();
    console.log(`✅ Status: ${res.status}`);
    console.log('Body recebido:', recebido);
}

// PUT /posts/1
async function substituirPutParcial(id: number) {
    console.log(`--- 1b. PUT /posts/${id} (payload incompleto) ---`);
    const enviado = { title: 'So o titulo via PUT' };
    console.log('Body enviado:', enviado);
    const res = await fetch(`${BASE_URL}/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(enviado),
    });
    const recebido = await res.json();
    console.log(`✅ Status: ${res.status}`);
    console.log('Body recebido:', recebido);
}

// PATCH /posts/1
async function atualizarPatch(id: number) {
    console.log(`--- 2. PATCH /posts/${id} ---`);
    const enviado = { title: 'MEU TITULO SUPER ATUALIZADO' };
    console.log('Body enviado:', enviado);
    const res = await fetch(`${BASE_URL}/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(enviado),
    });
    const recebido: Post = await res.json();
    console.log(`✅ Status: ${res.status}`);
    console.log('Body recebido:', recebido);
}

// DELETE /posts/1
async function deletarPost(id: number) {
    console.log(`--- 3. DELETE /posts/${id} ---`);
    console.log('Body enviado: N/A');
    const res = await fetch(`${BASE_URL}/posts/${id}`, {
        method: 'DELETE',
    });
    const recebido = await res.json();
    console.log(`✅ Status: ${res.status}`);
    console.log('Body recebido:', recebido);
}

async function chamarReqs() {
    await substituirPut(1);
    await substituirPutParcial(1);
    await atualizarPatch(1);
    await deletarPost(1);
}

chamarReqs();