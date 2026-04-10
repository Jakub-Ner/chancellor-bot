import { Router } from 'express';
import { AddressesDependencies } from './types';
import { AddressesController } from './controller';
import { inject } from '../../utils/inject';

export const createRouter = (deps: AddressesDependencies): Router => {
  const router = Router();

  const handle = inject(AddressesController, deps);

  router.get('/addresses', handle('listAddresses'));
  router.get('/addresses/:address/mails', handle('listMailsForAddress'));

  return router;
};
