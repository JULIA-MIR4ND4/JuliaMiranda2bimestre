// Função para validar força da senha
function validarSenha(senha) {
    if (senha.length < 6) {
        return { valida: false, mensagem: 'A senha deve ter pelo menos 6 caracteres' };
    }
    
    let forca = 0;
    if (senha.length >= 8) forca++;
    if (/[A-Z]/.test(senha)) forca++;
    if (/[a-z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[^A-Za-z0-9]/.test(senha)) forca++;

    if (forca < 2) {
        return { 
            valida: false, 
            mensagem: 'Senha fraca. Use pelo menos 6 caracteres com letras e números' 
        };
    }

    return { valida: true, mensagem: '' };
}

// Função para fazer login
async function fazerLogin(email, senha) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            // Salvar dados do usuário
            localStorage.setItem('userEmail', data.email);
            localStorage.setItem('userType', data.tipo);
            
            // Verificar se é administrador
            if (data.tipo === 'adm') {
                // Redireciona diretamente para o painel do administrador
                window.location.href = 'admin.html';
            } else {
                alert('Login realizado com sucesso!');
                window.location.href = 'index.html';
            }
        } else {
            if (data.message === 'Usuário não encontrado' || data.message === 'Email ou senha incorretos') {
                alert('Usuário não encontrado. Por favor, crie uma conta antes de fazer login.');
            } else {
                alert(data.message || 'Email ou senha incorretos');
            }
        }
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro de conexão. Tente novamente.');
    }
}

// Função para registrar usuário
async function registrarUsuario(email, senha) {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha, tipo: 'cliente' })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Conta criada com sucesso! Faça login para continuar.');
            
            // Limpar campos do formulário de registro
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerSenha').value = '';
            document.getElementById('confirmSenha').value = '';
            
            // Preencher campos do login com os dados do novo usuário
            document.getElementById('loginEmail').value = email;
        } else {
            alert(data.message || 'Erro ao criar conta');
        }
    } catch (error) {
        console.error('Erro ao registrar:', error);
        alert('Erro de conexão. Tente novamente.');
    }
}

// Voltar para a página inicial
function voltar() {
    window.location.href = 'index.html';
}

// Event listeners quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        if (confirm('Você já está logado. Deseja continuar para a página inicial?')) {
            window.location.href = 'index.html';
            return;
        }
    }

    // Formulário de login
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const senha = document.getElementById('loginSenha').value;
        
        if (!email || !senha) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        
        fazerLogin(email, senha);
    });

    // Formulário de registro
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('registerEmail').value.trim();
        const senha = document.getElementById('registerSenha').value;
        const confirmSenha = document.getElementById('confirmSenha').value;
        
        if (!email || !senha || !confirmSenha) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        
        if (senha !== confirmSenha) {
            alert('As senhas não coincidem');
            return;
        }
        
        // Validar força da senha
        const validacao = validarSenha(senha);
        if (!validacao.valida) {
            alert(validacao.mensagem);
            return;
        }
        
        registrarUsuario(email, senha);
    });
});