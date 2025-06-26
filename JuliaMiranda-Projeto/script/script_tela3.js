window.onload = function () { //quando a página terminar de carregar, execute essa função
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || []; // pega os dados do carrinho salvos, transforma em um array de objetos
    const container = document.getElementById('itensCarrinho');
    let precoTotal = 0;
  
    //Começa um laço de repetição que roda para cada item do carrinho, tira o "R$" e troca vírgula por ponto, para virar um número
    //converte para número decimal, multiplica pelo número de unidades, soma esse valor no precoTotal
    carrinho.forEach(item => { 
      const precoUnitario = parseFloat(item.preco.replace('R$', '').replace(',', '.'));
      const precoCalculado = precoUnitario * parseInt(item.quantidade);
      precoTotal += precoCalculado;
  
      //Cria uma div nova para o produto. Adiciona a classe produto-carrinho (para estilização com CSS).
      //Adiciona a imagem, nome, preço, quantidade e tamanho com HTML. 
      // Coloca esse novo produto dentro do container q ja existe (no HTML).
      const produtoDiv = document.createElement('div');
      produtoDiv.classList.add('produto-carrinho');
      produtoDiv.innerHTML = `
        <img src="${item.imagem}" alt="${item.nome}">
        <div class="produto-info">
          <strong>${item.nome}</strong>
          <span>Preço Total: R$ ${precoCalculado.toFixed(2).replace('.', ',')}</span>
          <span>Quantidade: ${item.quantidade}</span>
          <span>Tamanho: ${item.tamanho}</span>
        </div>
      `;
      container.appendChild(produtoDiv);
    });
  
    document.getElementById('precoTotal').innerText = `R$ ${precoTotal.toFixed(2).replace('.', ',')}`;
  };
  
  //Ele pega o preço total, salva com o nome 'precoFinal' e vai para a próxima página
  function finalizarPedido() {
    const precoFinalTexto = document.getElementById('precoTotal').innerText;
    localStorage.setItem('precoFinal', precoFinalTexto);
    window.location.href = 'tela4.html';
  }
  let carrinho = [];

window.onload = function () {
    // Verificar se o usuário está logado
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        alert('Você precisa fazer login para acessar o carrinho');
        window.location.href = 'login.html';
        return;
    }

    carregarCarrinho();
    exibirCarrinho();
};

function carregarCarrinho() {
    carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
}

function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function exibirCarrinho() {
    const container = document.getElementById('itensCarrinho');
    container.innerHTML = '';
    let precoTotal = 0;

    if (carrinho.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; font-size: 1.2rem; padding: 2rem;">Seu carrinho está vazio</p>';
        document.getElementById('precoTotal').innerText = 'R$ 0,00';
        return;
    }

    carrinho.forEach((item, index) => {
        const precoUnitario = item.precoNumerico || parseFloat(item.preco.replace('R$', '').replace(',', '.'));
        const precoCalculado = precoUnitario * parseInt(item.quantidade);
        precoTotal += precoCalculado;

        const produtoDiv = document.createElement('div');
        produtoDiv.classList.add('produto-carrinho');
        produtoDiv.innerHTML = `
            <img src="${item.imagem}" alt="${item.nome}">
            <div class="produto-info">
                <strong>${item.nome}</strong>
                <span>Preço unitário: R$ ${precoUnitario.toFixed(2).replace('.', ',')}</span>
                <span>Preço total: R$ ${precoCalculado.toFixed(2).replace('.', ',')}</span>
                <span>Tamanho: ${item.tamanho}</span>
                <div class="quantidade-controls">
                    <button onclick="diminuirQuantidade(${index})">-</button>
                    <span>Qtd: ${item.quantidade}</span>
                    <button onclick="aumentarQuantidade(${index})">+</button>
                    <button class="remover-item" onclick="removerItem(${index})">Remover</button>
                </div>
            </div>
        `;
        container.appendChild(produtoDiv);
    });

    document.getElementById('precoTotal').innerText = `R$ ${precoTotal.toFixed(2).replace('.', ',')}`;
}

function aumentarQuantidade(index) {
    carrinho[index].quantidade++;
    salvarCarrinho();
    exibirCarrinho();
}

function diminuirQuantidade(index) {
    if (carrinho[index].quantidade > 1) {
        carrinho[index].quantidade--;
        salvarCarrinho();
        exibirCarrinho();
    } else {
        if (confirm('Deseja remover este item do carrinho?')) {
            removerItem(index);
        }
    }
}

function removerItem(index) {
    if (confirm(`Tem certeza que deseja remover "${carrinho[index].nome}" do carrinho?`)) {
        carrinho.splice(index, 1);
        salvarCarrinho();
        exibirCarrinho();
        
        if (carrinho.length === 0) {
            alert('Carrinho vazio! Redirecionando para a página inicial.');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }
}

function finalizarPedido() {
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    const precoFinalTexto = document.getElementById('precoTotal').innerText;
    localStorage.setItem('precoFinal', precoFinalTexto);
    window.location.href = 'tela4.html';
}