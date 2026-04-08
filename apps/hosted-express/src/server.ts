import { env } from './env';
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer(env.SERVICE_NAME);

export function startServer() {
  Bun.serve({
    port: env.PORT,
    routes: {
      '/': {
        GET: async (req) => {
          return tracer.startActiveSpan('handle-root-request', async (span) => {
            try {
              console.log('Received request');
              const data = await fetch('https://www.example.com', {
                headers: { 'User-Agent': 'Bun' },
              });
              return new Response('GET: Hello World ' + data.status);
            } catch (error) {
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: String(error),
              });
              throw error;
            } finally {
              span.end();
            }
          });
        },
        POST: async (req) => {
          console.log('Received request');
          return new Response('POST: Hello World');
        },
      },
    },
  });
  console.log(`Server is running on port ${env.PORT}`);
}
