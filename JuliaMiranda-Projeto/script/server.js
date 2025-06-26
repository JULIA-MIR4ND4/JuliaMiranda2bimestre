const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
// Caminhos absolutos para os arquivos CSV dentro da pasta JuliaMiranda-Projeto
const CSV_FILE = path.join(__dirname, '../products.csv'); // Arquivo CSV de produtos
const USERS_FILE = path.join(__dirname, '../users.csv'); // Arquivo CSV de usuários

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..'))); // Serve arquivos estáticos corretamente

// Banco de dados em memória
let products = []; // Produtos
let users = []; // Usuários
let nextId = 1; // Próximo ID

// Função para carregar produtos do CSV
function loadProductsFromCSV() {
    try {
        if (fs.existsSync(CSV_FILE)) {
            const data = fs.readFileSync(CSV_FILE, 'utf8');
            const lines = data.split('\n').filter(line => line.trim() !== '');

            if (lines.length > 0) {
                products = lines.slice(1).map(line => {
                    const [id, nome, preco, imagem] = line.split(',');
                    return {
                        id: parseInt(id),
                        nome,
                        preco: parseFloat(preco),
                        imagem
                    };
                });

                if (products.length > 0) {
                    nextId = Math.max(...products.map(p => p.id)) + 1;
                }
            }
            console.log('Produtos carregados do arquivo CSV');
        } else {
            // Cria arquivo CSV de produtos com dados iniciais
            const initialData = `id,nome,preco,imagem\n1,ASICS Metarise 2 Paris,1300.00,imagens/asics metarise.jpeg\n2,Nike Giannis Immortality 3,560.00,imagens/giannis immortality.jpeg\n3,Nike Giannis Immortality 4,600.00,imagens/Nike Giannis.jpeg\n4,Nike Kyrie 7,1400.00,imagens/nike kyrie.jpeg\n5,Nike LeBron Witness 8,900.00,imagens/nike lebron.jpeg`;
            
            fs.writeFileSync(CSV_FILE, initialData);
            nextId = 6;
            console.log('Arquivo CSV de produtos criado com dados iniciais');
            loadProductsFromCSV(); // Recarrega após criar
        }
    } catch (error) {
        console.error('Erro ao carregar produtos do CSV:', error);
    }
}

// Função para carregar usuários do CSV
function loadUsersFromCSV() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            const lines = data.split('\n').filter(line => line.trim() !== '');

            if (lines.length > 0) {
                users = lines.slice(1).map(line => {
                    const [email, senha, tipo] = line.split(',');
                    return { email, senha, tipo };
                });
            }
            console.log('Usuários carregados do arquivo CSV');
        } else {
            // Cria arquivo CSV de usuários vazio
            fs.writeFileSync(USERS_FILE, 'email,senha,tipo\n');
            console.log('Arquivo CSV de usuários criado');
        }
    } catch (error) {
        console.error('Erro ao carregar usuários do CSV:', error);
    }
}

// Função para salvar produtos no CSV
function saveProductsToCSV() {
    try {
        let csvData = 'id,nome,preco,imagem\n';
        products.forEach(product => {
            csvData += `${product.id},${product.nome},${product.preco},${product.imagem}\n`;
        });

        fs.writeFileSync(CSV_FILE, csvData);
        console.log('Produtos salvos no CSV');
    } catch (error) {
        console.error('Erro ao salvar produtos no CSV:', error);
    }
}

// Função para salvar usuários no CSV
function saveUsersToCSV() {
    try {
        let csvData = 'email,senha,tipo\n';
        users.forEach(user => {
            csvData += `${user.email},${user.senha},${user.tipo}\n`;
        });

        fs.writeFileSync(USERS_FILE, csvData);
        console.log('Usuários salvos no CSV');
    } catch (error) {
        console.error('Erro ao salvar usuários no CSV:', error);
    }
}

// Carregar dados ao iniciar
loadProductsFromCSV();
loadUsersFromCSV();

// ROTAS DE PRODUTOS

// Obter todos os produtos
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Obter produto por ID
app.get('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Produto não encontrado' });
    }
});

// Buscar produto por nome
app.get('/api/products/search/:nome', (req, res) => {
    const nome = req.params.nome.toLowerCase();
    const foundProducts = products.filter(p => 
        p.nome.toLowerCase().includes(nome)
    );
    res.json(foundProducts);
});

// Criar novo produto
app.post('/api/products', (req, res) => {
    const { nome, preco, imagem } = req.body;

    if (!nome || preco === undefined) {
        return res.status(400).json({ message: 'Nome e preço são obrigatórios' });
    }

    const newProduct = {
        id: nextId++,
        nome,
        preco: parseFloat(preco),
        imagem: imagem || 'imagens/default.jpeg'
    };

    products.push(newProduct);
    saveProductsToCSV();
    res.status(201).json(newProduct);
});

// Atualizar produto
app.put('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, preco, imagem } = req.body;

    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Produto não encontrado' });
    }

    if (!nome || preco === undefined) {
        return res.status(400).json({ message: 'Nome e preço são obrigatórios' });
    }

    const updatedProduct = {
        id,
        nome,
        preco: parseFloat(preco),
        imagem: imagem || products[productIndex].imagem
    };

    products[productIndex] = updatedProduct;
    saveProductsToCSV();
    res.json(updatedProduct);
});

// Excluir produto
app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Produto não encontrado' });
    }

    products.splice(productIndex, 1);
    saveProductsToCSV();
    res.status(204).send();
});

// ROTAS DE USUÁRIOS

// Registro de usuário
app.post('/api/register', (req, res) => {
    const { email, senha, tipo = 'cliente' } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Verificar se usuário já existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({ message: 'Usuário já cadastrado' });
    }

    // Validar força da senha
    if (senha.length < 6) {
        return res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres' });
    }

    const newUser = { email, senha, tipo };
    users.push(newUser);
    saveUsersToCSV();

    res.status(201).json({ message: 'Usuário criado com sucesso', email, tipo });
});

// Login de usuário
app.post('/api/login', (req, res) => {
    console.log("chegou")
    // Remove espaços extras do início/fim do email e senha
    const email = req.body.email ? req.body.email.trim() : '';
    const senha = req.body.senha ? req.body.senha.trim() : '';

    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Procura usuário ignorando espaços extras
    const user = users.find(u => u.email.trim() === email && u.senha.trim() === senha);
    
    if (user) {
        res.json({ message: 'Login realizado com sucesso', email: user.email, tipo: user.tipo });
    } else {
        res.status(401).json({ message: 'Email ou senha incorretos' });
    }
});

// Login como gerente (hardcoded para segurança)
app.post('/api/login-manager', (req, res) => {
    const { email, senha } = req.body;

    // Credenciais fixas do gerente
    if (email === 'gerente@loja.com' && senha === 'admin123') {
        res.json({ message: 'Login de gerente realizado com sucesso', email, tipo: 'gerente' });
    } else {
        res.status(401).json({ message: 'Credenciais de gerente incorretas' });
    }
});

// Buscar usuário por email
app.get('/api/users/search/:email', (req, res) => {
    const email = req.params.email;
    const user = users.find(u => u.email === email);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'Usuário não encontrado' });
    }
});

// Atualizar tipo de usuário (cliente <-> adm)
app.put('/api/users/:email', (req, res) => {
    const email = req.params.email;
    const { tipo } = req.body;
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    if (tipo !== 'adm' && tipo !== 'cliente') {
        return res.status(400).json({ message: 'Tipo inválido' });
    }
    users[userIndex].tipo = tipo;
    saveUsersToCSV();
    res.json({ message: 'Tipo de usuário atualizado com sucesso', email, tipo });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
    saveProductsToCSV();
    saveUsersToCSV();
    process.exit();
});
