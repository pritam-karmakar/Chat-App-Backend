import dotenv from 'dotenv';
dotenv.config();

const Dbconfig = {
  development: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
    dialectOptions: {
      server: process.env.MYSQL_HOST,
      options: {
        encrypt: true,
        trustServerCertificate: true
      }
    }
  },
  production: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
    dialectOptions: {
      server: process.env.MYSQL_HOST,
      options: {
        encrypt: true,
        trustServerCertificate: true
      }
    }
  }
};

export default Dbconfig;