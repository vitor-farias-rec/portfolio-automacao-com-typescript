export {};

const BASE_URL = 'https://jsonplaceholder.typicode.com';
// DEFINIR contratos de tipo
type Post = {
    userId:number;
    id?: number; //campo opcional
    title: string;
    body: string;
};
type Coment ={
    postId: number;
    id: number;
    name: string;
    email: string;
    body: string;
};

// GET /posts
async function listarPost(){
    console.log(`--- 1. GET /posts ---`);
    const res = await fetch(`${BASE_URL}/posts`);
    const dados: Post[] = await res.json();
    console.log(`✅ Status: ${res.status}`);
    console.log(`Lidos ${dados.length} posts. Exemplo do primeiro:`, dados[0]);
}

//GET /posts/1
async function buscarPorId(id:number){
    console.log(`--- 2. GET /posts/1 ---`);
    const res = await fetch(`${BASE_URL}/posts/${id}`);
    const dados: Post = await res.json();
    console.log(`✅ Status: ${res.status}`);
    console.log(`Post ${id}:`, dados);
}

//GET /posts/1/comments
async function listarComent(postId: number){
    console.log(`--- 3. GET /posts/1/comment ---`);
    const res = await fetch(`${BASE_URL}/posts/${postId}/comments`);
    const dados: Coment[] = await res.json();
    console.log(`✅ Status: ${res.status}`);
    console.log(`O post ${postId} tem ${dados.length} comentários. Exemplo do primeiro:`, dados[0]);
}

// POST /posts
async function criarPost(novo: Post) {
    console.log(`--- 4. POST /posts ---`);
    const res = await fetch(`${BASE_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(novo),
    });
    const dados: Post = await res.json();
    console.log(`✅ Status: ${res.status}`);
    console.log('Post criado:', dados);
}

async function chamarReqs() {
    await listarPost();
    await buscarPorId(1);
    await listarComent(1);
    await criarPost({ userId: 1, title: 'Meu post', body: 'Conteúdo de teste' });
}

chamarReqs();