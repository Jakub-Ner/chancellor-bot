import { RequestHandler } from 'express';
import { AddressesDependencies } from './types';

const notImplemented: RequestHandler = () =>
  console.warn('Not implemented yet');

export class AddressesController {
  // @ts-expect-error We'll use it later
  constructor(private deps: AddressesDependencies) { }

  public listAddresses: RequestHandler = (req, res, next) => {
    notImplemented(req, res, next);
  };

  public dupa = () => {
    console.log('dupa');
    return 'dupa';
  };

  public listMailsForAddress: RequestHandler = (req, res, next) => {
    notImplemented(req, res, next);
  };
}
