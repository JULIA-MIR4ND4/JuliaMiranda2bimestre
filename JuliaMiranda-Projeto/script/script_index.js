function goToDetails(id) {
    // Aqui você pode redirecionar para a tela 2 com base no ID do tênis
    window.location.href = `tela2.html?tenis=${id}`;
  }

  function goToCarrinho() {
    // Sempre exige login para acessar o carrinho
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        alert('Você precisa fazer login para acessar o carrinho!');
        window.location.href = 'login.html';
        return;
    }
    window.location.href = "tela3.html";
  }

  // Adiciona menu/modal para gerente escolher ação
window.addEventListener('DOMContentLoaded', function() {
    const userType = localStorage.getItem('userType');
    const adminNeedsChoice = localStorage.getItem('adminNeedsChoice');
    if (userType === 'adm' && adminNeedsChoice === 'true') {
        mostrarMenuGerente();
    }
});

function mostrarMenuGerente() {
    // Cria modal simples
    const modal = document.createElement('div');
    modal.id = 'modalGerente';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.innerHTML = `
        <div style="background:#fff;padding:32px 24px;border-radius:8px;text-align:center;max-width:90vw;">
            <h2>Bem-vindo, gerente!</h2>
            <p>O que deseja fazer?</p>
            <button id="btnComprar" style="margin:8px 16px;">Comprar como cliente</button>
            <button id="btnEditar" style="margin:8px 16px;">Editar Produtos/Pessoas</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('btnComprar').onclick = function() {
        localStorage.removeItem('adminNeedsChoice');
        document.body.removeChild(modal);
    };
    document.getElementById('btnEditar').onclick = function() {
        localStorage.removeItem('adminNeedsChoice');
        window.location.href = 'admin.html';
    };
}

// Função para exibir produtos dinamicamente
async function carregarProdutos() {
    const main = document.querySelector('.products');
    main.innerHTML = '<p>Carregando produtos...</p>';
    try {
        const response = await fetch('/api/products');
        const produtos = await response.json();
        if (!Array.isArray(produtos) || produtos.length === 0) {
            main.innerHTML = '<p>Nenhum produto cadastrado.</p>';
            return;
        }
        main.innerHTML = '';
        produtos.forEach(produto => {
            const div = document.createElement('div');
            div.className = 'product';
            div.onclick = () => goToDetails(produto.id);
            div.innerHTML = `
                <img src="${produto.imagem}" alt="${produto.nome}">
                <h2>${produto.nome}</h2>
                <p>R$ ${Number(produto.preco).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            `;
            main.appendChild(div);
        });
    } catch (e) {
        main.innerHTML = '<p>Erro ao carregar produtos.</p>';
    }
}

// Função para deslogar usuário
function deslogarUsuario() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('adminNeedsChoice');
    localStorage.removeItem('carrinho');
}

// Função para deslogar usuário e redirecionar para a tela inicial
function deslogarUsuarioERedirecionar() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('adminNeedsChoice');
    localStorage.removeItem('carrinho');
    window.location.href = 'index.html';
}

// Ao acessar a index, não exige mais login automático
window.addEventListener('DOMContentLoaded', function() {
    carregarProdutos();
    // Adiciona botão se for gerente
    const userType = localStorage.getItem('userType');
    if (userType === 'adm') {
        let footer = document.querySelector('.footer');
        if (footer && !document.getElementById('btnPainelAdmin')) {
            const btn = document.createElement('button');
            btn.id = 'btnPainelAdmin';
            btn.textContent = 'Voltar ao Painel do Administrador';
            btn.style.marginLeft = '16px';
            btn.onclick = function() {
                window.location.href = 'admin.html';
            };
            footer.appendChild(btn);
        }
    }
});