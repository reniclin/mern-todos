import { Pool } from 'pg';
import {
  POSTGRESQL_USER,
  POSTGRESQL_HOST,
  POSTGRESQL_PORT,
  POSTGRESQL_DB,
  POSTGRESQL_PWD,
} from '../config';

const pool = new Pool({
  host: POSTGRESQL_HOST,
  port: POSTGRESQL_PORT,
  database: POSTGRESQL_DB,
  user: POSTGRESQL_USER,
  password: POSTGRESQL_PWD,
  ssl: {
    rejectUnauthorized: false   // 對 AWS RDS 無需自定義憑證
  }
});

export default pool;