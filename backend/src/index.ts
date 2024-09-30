import { APP_PORT, MONGODB_URL, MONGODB_CONNECT_OPTIONS } from './config';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import todoRouter from './routes/todoRouter';
import todoSqlRouter from './routes/todoSqlRouter';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// app.use(
//   cors({
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type'],
//   })
// );

app.use('/todo', todoRouter);
app.use('/todoSql', todoSqlRouter);

app.get('/', (req, res) => {
  res.status(200).send('Hello, This is TypeScript with Express!');
});

mongoose
  .connect(MONGODB_URL, MONGODB_CONNECT_OPTIONS)
  .then(() => {
    console.log('App is connected to MongoDB.');

    app.listen(APP_PORT, () => {
      console.log(`Server is running on http://localhost:${APP_PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });
