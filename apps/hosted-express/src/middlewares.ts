import { RequestHandler } from 'express';
import { SpanStatusCode } from '@opentelemetry/api';
import { tracer } from '@chancellor-bot/telemetry';

export function createTracingMiddleware(): RequestHandler {
  return async (req, res, next) => {
    await tracer.startActiveSpan('http.request', async (span) => {
      try {
        span.setAttribute('http.method', req.method);
        span.setAttribute('http.route', req.path);
        span.setAttribute('http.scheme', req.protocol);
        span.setAttribute('http.host', req.get('host') || 'unknown');
        span.setAttribute(
          'http.user_agent',
          req.get('user-agent') || 'unknown',
        );

        res.on('finish', () => {
          span.setAttribute('http.status_code', res.statusCode);
          if (res.statusCode >= 500) {
            span.setStatus({ code: SpanStatusCode.ERROR });
          }
          span.end();
        });

        next();
      } catch (error) {
        span.recordException(error as Error);
        span.end();
        next(error);
      }
    });
  };
}
