import { env } from './env';
import express from 'express';
import { createTracingMiddleware } from './middlewares';
import { createRouter as createAddressesRouter } from './modules/addresses/routes';

export const startServer = () => {
  const port = env.PORT;
  const app = express();

  app.use(createTracingMiddleware());

  app.use(createAddressesRouter({ db: null }));

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.listen(port, () => {
    console.log(`Hosted Express listening on http://localhost:${port}`);
  });
};
