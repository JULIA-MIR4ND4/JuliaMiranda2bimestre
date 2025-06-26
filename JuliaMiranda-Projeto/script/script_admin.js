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

// Ir para a loja (comportamento normal de cliente)
function irParaLoja() {
    window.location.href = 'index.html';
}

// Mostrar opções de CRUD
function mostrarOpcoesCrud() {
    document.getElementById('crudOptions').style.display = 'block';
}

// Ocultar opções de CRUD
function ocultarOpcoesCrud() {
    document.getElementById('crudOptions').style.display = 'none';
}

// Gerenciar produtos
function gerenciarProdutos() {
    window.location.href = 'produtos_crud.html';
}

// Gerenciar usuários
function gerenciarUsuarios() {
    window.location.href = 'usuarios_crud.html';
}

// Logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userType');
        localStorage.removeItem('carrinho');
        window.location.href = 'index.html';
    }
}