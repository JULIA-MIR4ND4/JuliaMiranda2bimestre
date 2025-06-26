// Função para validar cartão (algoritmo de Luhn)
function validarCartao(numero) {
  //remove tudo que não for número, transforma em array e inverte a ordem, transforma os caracteres em números,
  //Para cada número:Se estiver em posição ímpar (na contagem do Luhn), multiplica por 2.
  //Se o resultado for maior que 9, subtrai 9.
  //Soma todos os valores. Se a soma for divisível por 10 , o cartão é válido
    const digits = numero.replace(/\D/g, '').split('').reverse().map(d => parseInt(d, 10));
    let soma = 0;
    digits.forEach((d, i) => {
      if (i % 2 === 1) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      soma += d;
    });
    return soma % 10 === 0;
  }
  
  const precoFinal = localStorage.getItem('precoFinal') || "R$ 0,00"; //recupera o preço final

  //Mostra ou esconde os campos para Pix ou Cartão, dependendo do que o usuário escolheu. 
  // Se for Pix, chama a função para gerar o QR Code
  function mostrarOpcaoPagamento(tipo) {
    document.getElementById('pixOpcao').style.display = tipo === 'pix' ? 'block' : 'none';
    document.getElementById('cartaoOpcao').style.display = tipo === 'cartao' ? 'block' : 'none';
  
    if (tipo === 'pix') {
      gerarQRCodePix();
    }
  }
  
  //Pega o valor do Pix. Define os dados do pagamento. Usa uma função chamada formatField() para montar 
  // cada parte do código Pix com o tamanho certo. Monta todas as informações do Pix. 
  // Calcula o código de verificação para o Pix. Junta tudo e monta o link da imagem do QR Code.
  function gerarQRCodePix() {
    const precoTexto = precoFinal;
    const valor = precoTexto.replace("R$", "").replace(",", ".").trim();
    const chavePix = 'telma.miranda@email.com';
    const nomeRecebedor = 'Telma Miranda';
    const cidade = 'SAO PAULO';
    const descricao = 'Pagamento Tênis Vôlei';
  
    function formatField(id, value) {
      const length = value.length.toString().padStart(2, '0');
      return id + length + value;
    }
  
    let payloadSemCRC =
      formatField("00", "01") +
      formatField("26",
        formatField("00", "BR.GOV.BCB.PIX") +
        formatField("01", chavePix) +
        formatField("02", descricao)
      ) +
      formatField("52", "0000") +
      formatField("53", "986") +
      formatField("54", valor) +
      formatField("58", "BR") +
      formatField("59", nomeRecebedor) +
      formatField("60", cidade) +
      formatField("62", formatField("05", "*")) +
      "6304";
  
    function crc16(str) {
      let crc = 0xFFFF;
      for (let c = 0; c < str.length; c++) {
        crc ^= str.charCodeAt(c) << 8;
        for (let i = 0; i < 8; i++) {
          if ((crc & 0x8000) !== 0) {
            crc = (crc << 1) ^ 0x1021;
          } else {
            crc <<= 1;
          }
          crc &= 0xFFFF;
        }
      }
      return crc.toString(16).toUpperCase().padStart(4, '0');
    }
  
    const payloadFinal = payloadSemCRC + crc16(payloadSemCRC);
    const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(payloadFinal)}&size=200x200`;
    document.getElementById('qrcode').src = qrCodeURL; // mostra o qrcode
    document.getElementById('valorPix').innerText = `Valor: R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;// mostra o valor
  }
  
  function finalizarPagamento() {
    const tipoPagamento = document.querySelector('input[name="pagamento"]:checked');
    if (!tipoPagamento) {
      alert("Escolha uma forma de pagamento."); //Verifica se o usuário escolheu cartão ou Pix: Se não escolheu, mostra um alerta.
      return;
    }
  
    if (tipoPagamento.value === 'cartao') { //Se for cartão:
      const numeroCartao = document.getElementById('numeroCartao').value; //Pega o número do cartão
      if (!validarCartao(numeroCartao)) { //Valida com a função validarCartao()
        alert("Número de cartão inválido.");// Se estiver incorreto, avisa o usuário.
        return;
      }
      alert("Pagamento com cartão realizado com sucesso!"); // Se estiver certo, mostra mensagem de sucesso
    }
  
    if (tipoPagamento.value === 'pix') {
      alert("Pagamento via Pix confirmado com sucesso!"); //Apenas mostra mensagem de sucesso
    }
  
    // Após finalizar o pagamento, desloga o usuário e redireciona para index
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('adminNeedsChoice');
    localStorage.removeItem('carrinho');
    alert('Pagamento realizado! Você será deslogado.');
    window.location.href = 'index.html';
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