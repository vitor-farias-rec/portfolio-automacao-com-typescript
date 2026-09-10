type produto = {'genero':string, 'quantidade':number}

let camisa: produto = {genero: 'Masculino', quantidade: 10}

let blusa: produto = {genero: 'Feminina', quantidade: 0}

function verificarEstoque(produtoAtual: produto){
    const liberado = produtoAtual.quantidade > 0
        ? `✅ Produto em estoque: A camisa ${produtoAtual.genero} tem ${produtoAtual.quantidade} peças no estoque`
        : `❌ Produto fora de estoque: A blusa ${produtoAtual.genero} tem ${produtoAtual.quantidade} peças, portanto está em falta!`;
        console.log(liberado);
}
verificarEstoque(camisa);
verificarEstoque(blusa);