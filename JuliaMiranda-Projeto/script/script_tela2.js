// Pega o ID do tênis enviado pela URL (?tenis=3, por exemplo)
const params = new URLSearchParams(window.location.search);
const idTenis = params.get('tenis');

// Busca o produto do backend pelo ID e exibe na tela
document.addEventListener('DOMContentLoaded', () => {
    fetch(`/api/products/${idTenis}`)
        .then(response => {
            if (!response.ok) throw new Error('Produto não encontrado');
            return response.json();
        })
        .then(produto => {
            // Exibe imagem, nome e preço
            const img = document.getElementById('imagemTenis');
            img.src = produto.imagem;
            img.alt = produto.nome;
            document.getElementById('nomeTenis').textContent = produto.nome;
            document.getElementById('precoTenis').textContent = `R$ ${parseFloat(produto.preco).toFixed(2)}`;
        })
        .catch(err => {
            alert('Produto não encontrado!');
            window.location.href = 'index.html';
        });
});

function voltar() {
    localStorage.removeItem('tempItem');
    window.location.href = 'index.html';
}

function adicionarAoCarrinho() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        alert('Você precisa estar logado para adicionar produtos ao carrinho.');
        window.location.href = 'login.html';
        return;
    }
    const quantidade = document.getElementById('quantidade').value;
    const tamanho = document.getElementById('tamanho').value;
    // Busca o produto do backend para garantir dados atualizados
    fetch(`/api/products/${idTenis}`)
        .then(response => response.json())
        .then(produto => {
            const item = {
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                imagem: produto.imagem,
                quantidade: quantidade,
                tamanho: tamanho
            };
            let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
            carrinho.push(item);
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            alert('Produto adicionado ao carrinho!');
        })
        .catch(() => {
            alert('Erro ao adicionar produto ao carrinho.');
        });
}