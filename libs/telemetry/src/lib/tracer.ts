import { trace } from '@opentelemetry/api';

const tracerName = process.env.SERVICE_NAME;
if (!tracerName) {
  throw new Error('SERVICE_NAME environment variable is not set');
}

export const tracer = trace.getTracer(tracerName);
