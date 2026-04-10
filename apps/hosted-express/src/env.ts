import type { CoercedEnvSchema } from '../env.d.ts';

export const env = process.env as unknown as CoercedEnvSchema;
