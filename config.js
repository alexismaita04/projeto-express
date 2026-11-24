// FATOR 3 (Config): este é o ÚNICO arquivo que lê variáveis de ambiente.
// O resto do código importa "config" daqui e nunca usa process.env diretamente.

// Lê o arquivo .env (se existir) e coloca cada linha dentro de process.env.
// Em produção normalmente não há arquivo .env: as variáveis vêm do servidor.
import 'dotenv/config';

const config = {
  nomeApp: process.env.APP_NAME || 'Projeto Express',
  ambiente: process.env.NODE_ENV || 'development', // development | staging | production
  porta: Number(process.env.PORT) || 3000,         // variáveis de ambiente são sempre texto

  // Dados de conexão do PostgreSQL (FATOR 4: o banco é um serviço de apoio).
  // Os nomes das chaves (host, port, user, password, database) são os que a biblioteca "pg" espera.
  // Usuário, senha e banco NÃO têm valor padrão de propósito: são segredos/dados de cada ambiente.
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};

export default config;
