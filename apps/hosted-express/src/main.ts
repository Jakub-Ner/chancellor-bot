import { env } from './env';
import express from 'express';

const app = express();
const port = 8080;

app.get('/', (req, res) => {
  console.log('using', { env: env.MAILPIT__URL });
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
