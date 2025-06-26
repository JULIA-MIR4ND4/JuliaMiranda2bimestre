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

// Variável global para armazenar o usuário sendo editado
let usuarioEditando = null;

// Buscar usuário por email
async function buscarUsuario() {
    const email = document.getElementById('buscarUsuario').value.trim();
    
    if (!email) {
        alert('Por favor, digite o email do usuário para buscar');
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, digite um email válido');
        return;
    }
    
    try {
        const response = await fetch(`/api/users/search/${encodeURIComponent(email)}`);
        
        if (response.status === 404) {
            alert('Usuário não encontrado com este email');
            document.getElementById('usuarioSection').style.display = 'none';
            return;
        }
        
        if (!response.ok) {
            const data = await response.json();
            alert(data.message || 'Erro ao buscar usuário');
            return;
        }
        
        const usuario = await response.json();
        usuarioEditando = usuario;
        
        // Exibir informações do usuário
        document.getElementById('infoUsuario').innerHTML = `
            <div class="user-details">
                <p><strong>Email:</strong> ${usuario.email}</p>
                <p><strong>Tipo atual:</strong> ${usuario.tipo === 'adm' ? 'Administrador' : 'Cliente'}</p>
            </div>
        `;
        
        // Preencher o select com o tipo atual
        document.getElementById('tipoUsuario').value = usuario.tipo;
        
        // Mostrar a seção de edição
        document.getElementById('usuarioSection').style.display = 'block';
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão. Tente novamente.');
    }
}

// Salvar alterações do usuário
document.getElementById('editarUsuarioForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!usuarioEditando) {
        alert('Erro: Nenhum usuário selecionado para edição');
        return;
    }
    
    const novoTipo = document.getElementById('tipoUsuario').value;
    
    // Verificar se houve mudança
    if (novoTipo === usuarioEditando.tipo) {
        alert('Nenhuma alteração foi feita no tipo do usuário');
        return;
    }
    
    // Confirmar a alteração
    const tipoAtual = usuarioEditando.tipo === 'adm' ? 'Administrador' : 'Cliente';
    const novoTipoTexto = novoTipo === 'adm' ? 'Administrador' : 'Cliente';
    
    if (!confirm(`Tem certeza que deseja alterar o usuário ${usuarioEditando.email} de ${tipoAtual} para ${novoTipoTexto}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${encodeURIComponent(usuarioEditando.email)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tipo: novoTipo })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Usuário atualizado com sucesso!');
            
            // Atualizar a exibição das informações
            usuarioEditando.tipo = novoTipo;
            document.getElementById('infoUsuario').innerHTML = `
                <div class="user-details">
                    <p><strong>Email:</strong> ${usuarioEditando.email}</p>
                    <p><strong>Novo tipo:</strong> ${novoTipo === 'adm' ? 'Administrador' : 'Cliente'}</p>
                    <p class="success-message">✓ Alteração salva com sucesso!</p>
                </div>
            `;
            
        } else {
            alert(data.message || 'Erro ao atualizar usuário');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão. Tente novamente.');
    }
});

// Cancelar edição
function cancelarEdicao() {
    document.getElementById('usuarioSection').style.display = 'none';
    document.getElementById('buscarUsuario').value = '';
    document.getElementById('editarUsuarioForm').reset();
    usuarioEditando = null;
}

// Voltar ao painel administrativo
function voltarAdmin() {
    window.location.href = 'admin.html';
}

// Adicionar listener para Enter na busca
document.getElementById('buscarUsuario').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        buscarUsuario();
    }
});