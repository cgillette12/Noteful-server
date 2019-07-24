'use strict';
const knex = require('knex');
const app = require('./app');

const { PORT, PROD_MIGRATION_DB_URL} = require('./config');

const db = knex({
  client: 'pg',
  connection: PROD_MIGRATION_DB_URL
});

app.set('db', db);

app.listen(PORT,()=>{
  console.log(`Server listing at Http://localhost:${PORT}`);
});