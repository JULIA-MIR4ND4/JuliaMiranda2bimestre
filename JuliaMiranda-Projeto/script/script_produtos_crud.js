// Verificar se o usuário é administrador
document.addEventListener('DOMContentLoaded', function() {
    const userType = localStorage.getItem('userType');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userEmail || userType !== 'adm') {
        alert('Acesso negado. Você não tem permissão para acessar esta página.');
        window.location.href = 'index.html';
        return;
    }
});

// Variável global para armazenar o produto sendo editado
let produtoEditando = null;

// Mostrar seção de adicionar produto
function mostrarAdicionar() {
    ocultarTodasSecoes();
    document.getElementById('adicionarSection').style.display = 'block';
}

// Mostrar seção de excluir produto
function mostrarExcluir() {
    ocultarTodasSecoes();
    document.getElementById('excluirSection').style.display = 'block';
}

// Mostrar seção de editar produto
function mostrarEditar() {
    ocultarTodasSecoes();
    document.getElementById('editarSection').style.display = 'block';
}

// Ocultar todas as seções
function ocultarTodasSecoes() {
    document.getElementById('adicionarSection').style.display = 'none';
    document.getElementById('excluirSection').style.display = 'none';
    document.getElementById('editarSection').style.display = 'none';
    document.getElementById('produtoExcluir').style.display = 'none';
    document.getElementById('produtoEditar').style.display = 'none';
}

// Cancelar ação atual
function cancelarAcao() {
    ocultarTodasSecoes();
    limparFormularios();
}

// Limpar todos os formulários
function limparFormularios() {
    document.getElementById('adicionarForm').reset();
    document.getElementById('buscarExcluir').value = '';
    document.getElementById('buscarEditar').value = '';
    document.getElementById('editarForm').reset();
    produtoEditando = null;
}

// Adicionar novo produto
document.getElementById('adicionarForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nomeAdd').value.trim();
    const preco = parseFloat(document.getElementById('precoAdd').value);
    const inputImagem = document.getElementById('imagemAdd');
    
    if (!nome || isNaN(preco) || preco <= 0) {
        alert('Por favor, preencha todos os campos corretamente');
        return;
    }
    if (!inputImagem.files[0]) {
        alert('Selecione uma imagem para o produto');
        return;
    }
    try {
        // Primeiro faz upload da imagem
        const formData = new FormData();
        formData.append('imagem', inputImagem.files[0]);
        const uploadResp = await fetch('/api/upload-imagem', {
            method: 'POST',
            body: formData
        });
        const uploadData = await uploadResp.json();
        if (!uploadData.success) {
            alert(uploadData.message || 'Erro ao enviar imagem');
            return;
        }
        // Depois envia os dados do produto
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, preco, imagem: uploadData.caminho })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Produto adicionado com sucesso!');
        } else {
            alert(data.message || 'Erro ao adicionar produto');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão. Tente novamente.');
    }
});

// Buscar produto para excluir
async function buscarProdutoExcluir() {
    const nome = document.getElementById('buscarExcluir').value.trim();
    
    if (!nome) {
        alert('Por favor, digite o nome do produto para buscar');
        return;
    }
    
    try {
        const response = await fetch(`/api/products/search/${encodeURIComponent(nome)}`);
        const produtos = await response.json();
        
        if (produtos.length === 0) {
            alert('Nenhum produto encontrado com esse nome');
            document.getElementById('produtoExcluir').style.display = 'none';
            return;
        }
        
        // Se encontrou produtos, pega o primeiro que contém o nome
        const produto = produtos[0];
        
        document.getElementById('infoProdutoExcluir').innerHTML = `
            <p><strong>Nome:</strong> ${produto.nome}</p>
            <p><strong>Preço:</strong> R$ ${produto.preco.toFixed(2)}</p>
            <p><strong>Imagem:</strong> ${produto.imagem}</p>
        `;
        
        // Armazenar o ID do produto para exclusão
        document.getElementById('produtoExcluir').setAttribute('data-produto-id', produto.id);
        document.getElementById('produtoExcluir').style.display = 'block';
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao buscar produto. Tente novamente.');
    }
}

// Confirmar exclusão do produto
async function confirmarExclusao() {
    const produtoId = document.getElementById('produtoExcluir').getAttribute('data-produto-id');
    
    if (!produtoId) {
        alert('Erro: ID do produto não encontrado');
        return;
    }
    
    if (!confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/products/${produtoId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Produto excluído com sucesso!');
            // Remove deslogar automático após salvar alterações no CRUD de produtos
            // Basta não chamar mais deslogarAoSalvarCrud() após adicionar, editar ou excluir produto
        } else {
            const data = await response.json();
            alert(data.message || 'Erro ao excluir produto');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão. Tente novamente.');
    }
}

// Buscar produto para editar
async function buscarProdutoEditar() {
    const nome = document.getElementById('buscarEditar').value.trim();
    
    if (!nome) {
        alert('Por favor, digite o nome do produto para buscar');
        return;
    }
    
    try {
        const response = await fetch(`/api/products/search/${encodeURIComponent(nome)}`);
        const produtos = await response.json();
        
        if (produtos.length === 0) {
            alert('Nenhum produto encontrado com esse nome');
            document.getElementById('produtoEditar').style.display = 'none';
            return;
        }
        
        // Se encontrou produtos, pega o primeiro que contém o nome
        const produto = produtos[0];
        produtoEditando = produto;
        
        // Preencher formulário de edição
        document.getElementById('nomeEdit').value = produto.nome;
        document.getElementById('precoEdit').value = produto.preco;
        document.getElementById('imagemEdit').value = produto.imagem;
        
        document.getElementById('produtoEditar').style.display = 'block';
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao buscar produto. Tente novamente.');
    }
}

// Salvar alterações do produto
document.getElementById('editarForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!produtoEditando) {
        alert('Erro: Nenhum produto selecionado para edição');
        return;
    }
    const nome = document.getElementById('nomeEdit').value.trim();
    const preco = parseFloat(document.getElementById('precoEdit').value);
    const inputImagem = document.getElementById('imagemEdit');
    let imagem = produtoEditando.imagem; // valor padrão
    if (inputImagem.files && inputImagem.files[0]) {
        // Se o usuário selecionou uma nova imagem, faz upload
        const formData = new FormData();
        formData.append('imagem', inputImagem.files[0]);
        const uploadResp = await fetch('/api/upload-imagem', {
            method: 'POST',
            body: formData
        });
        const uploadData = await uploadResp.json();
        if (!uploadData.success) {
            alert(uploadData.message || 'Erro ao enviar imagem');
            return;
        }
        imagem = uploadData.caminho;
    }
    if (!nome || isNaN(preco) || preco <= 0) {
        alert('Por favor, preencha todos os campos corretamente');
        return;
    }
    try {
        const response = await fetch(`/api/products/${produtoEditando.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, preco, imagem })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Produto atualizado com sucesso!');
        } else {
            alert(data.message || 'Erro ao atualizar produto');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão. Tente novamente.');
    }
});

// Voltar ao painel administrativo
function voltarAdmin() {
    window.location.href = 'admin.html';
}

// Após salvar alterações no CRUD de produtos, desloga o usuário e redireciona para index
function deslogarAoSalvarCrud() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('adminNeedsChoice');
    localStorage.removeItem('carrinho');
    alert('Alterações salvas! Você foi deslogado. Faça login novamente para continuar.');
    window.location.href = 'index.html';
}