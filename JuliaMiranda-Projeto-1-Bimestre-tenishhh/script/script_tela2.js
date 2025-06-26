// as informações de cada tênis: nome, preço e imagem. Cada tênis tem um número (ID) que o identifica.
const tenisData = {
    1: { nome: 'ASICS Metarise 2 Paris', preco: 'R$ 1300,00', imagem: 'imagens/asics metarise.jpeg' },
    2: { nome: 'Nike Giannis Immortality 3', preco: 'R$ 560,00', imagem: 'imagens/giannis immortality.jpeg' },
    3: { nome: 'Nike Giannis Immortality 4', preco: 'R$ 600,00', imagem: 'imagens/Nike Giannis.jpeg' },
    4: { nome: 'Nike Kyrie 7', preco: 'R$ 1400,00', imagem: 'imagens/nike kyrie.jpeg' },
    5: { nome: 'Nike LeBron Witness 8', preco: 'R$ 900,00', imagem: 'imagens/nike lebron.jpeg' }
  };
  
  //Pega o ID do tênis que foi enviado pela URL (?tenis=3, por exemplo). 
  // Com esse ID, ele vai buscar a informação sobre o tênis. Isso cria uma variável tenis
  // com os dados completos desse produto, como nome, preço e imagem
  const params = new URLSearchParams(window.location.search);
  const idTenis = params.get('tenis');
  const tenis = tenisData[idTenis];
  
  //Se achou o tênis certo, coloca a imagem dele na tela usando a id="imagemTenis"
  if (tenis) {
    const img = document.getElementById('imagemTenis');
    img.src = tenis.imagem;
    img.alt = tenis.nome;
  }
  
  function voltar() {
    localStorage.removeItem('tempItem'); //Remove um item temporário do armazenamento
    window.location.href = 'index.html'; //voltar na pag anterior
  }
  
  //Pega a quantidade e o tamanho que o usuário escolheu
  function adicionarAoCarrinho() {
    // Verificar se o usuário está logado
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userEmail) {
        // Se não estiver logado, redirecionar para login
        alert('Você precisa estar logado para adicionar produtos ao carrinho.');
        window.location.href = 'login.html';
        return;
    }

    const quantidade = document.getElementById('quantidade').value;
    const tamanho = document.getElementById('tamanho').value;
  
    //Cria um objeto com as informações do tênis escolhido
    const item = {
      id: idTenis,
      nome: tenis.nome,
      preco: tenis.preco,
      imagem: tenis.imagem,
      quantidade: quantidade,
      tamanho: tamanho
    };
  
    //Busca o carrinho guardado no navegador (se existir). Adiciona o novo tênis ao carrinho. Salva tudo de novo no localStorage
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho.push(item);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
  
    alert('Produto adicionado ao carrinho!');
  }