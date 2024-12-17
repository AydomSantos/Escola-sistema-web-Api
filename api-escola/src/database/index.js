const Sequelize = require('sequelize');
const dotenv = require('dotenv');
const AlunoModel = require('../models/Aluno.js');
const TurmaModel = require('../models/Turma.js');
const MatriculaModel = require('../models/Matricula.js');

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Configuração de conexão com o banco de dados principal
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    } : {
      connectTimeout: 100000, // Timeout de conexão
    },
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Testar a conexão com o banco de dados
sequelize.authenticate()
  .then(() => console.log('Conexão bem-sucedida com o banco de dados!'))
  .catch(err => {
    console.error('Erro ao conectar ao banco de dados:', err.message);
    process.exit(1);
  });

// Definir os modelos
const models = [AlunoModel, TurmaModel, MatriculaModel];

// Inicializando os modelos
models.forEach(model => model.init(sequelize));

// Associando os modelos
models.forEach(model => {
  if (model.associate) {
    model.associate(sequelize.models);
  }
});

// Sincronização do banco de dados (apenas em ambiente de desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  sequelize.sync()
    .then(() => {
      console.log('Banco de dados sincronizado');
    })
    .catch(error => {
      console.error('Erro ao sincronizar o banco de dados:', error);
    });
} else {
  console.log('Sincronização desativada no ambiente de produção.');
}

module.exports = sequelize;
