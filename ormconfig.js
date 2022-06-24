module.exports = {
  type: 'mssql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  //schema: process.env.DB_SCHEMA,
  synchronize: false,
  entities: ['src/infrastructure/database/entities/**/*.ts'],
  options: {
    enableArithAbort: false
  },
  migrations: ['migration/*.ts'],
  cli: {
    migrationsDir: 'migration'
  }
};
