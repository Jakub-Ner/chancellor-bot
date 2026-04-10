import { RequestHandler } from 'express';

type ControllerConstructor<T, D> = new (deps: D) => T;

export const inject =
  <T, D>(Controller: ControllerConstructor<T, D>, dependencies: D) =>
    (method: keyof T): RequestHandler =>
      (req, res, next) => {
        const instance = new Controller(dependencies);
        const handler = instance[method];

        if (typeof handler === 'function') {
          return handler.bind(instance)(req, res, next);
        }

        console.warn(
          `Method ${String(method)} is not a function on ${Controller.name}`,
        );
        res.status(500).send('Internal Server Error');
      };
