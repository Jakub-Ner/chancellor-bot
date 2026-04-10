import { SpanStatusCode } from '@opentelemetry/api';
import { tracer } from './tracer.js';

export async function tracedFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  return tracer.startActiveSpan(
    `http.${options?.method || 'GET'}`,
    async (span) => {
      try {
        span.setAttribute('http.url', url);
        span.setAttribute('http.method', options?.method || 'GET');

        const response = await fetch(url, options);

        span.setAttribute('http.status_code', response.status);
        span.setAttribute('http.flavor', '1.1');

        if (!response.ok) {
          span.setStatus({ code: SpanStatusCode.ERROR });
        }

        return response;
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (error as Error).message,
        });
        throw error;
      } finally {
        span.end();
      }
    },
  );
}
