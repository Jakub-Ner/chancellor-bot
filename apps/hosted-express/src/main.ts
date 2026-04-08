import {
  createTelemetrySDK,
  devExporter,
  traceExporter,
  type TelemetryConfig,
} from './configs/telemetry';
import { env } from './env';

const telemetryConfig: TelemetryConfig = {
  serviceName: env.SERVICE_NAME,
  serviceVersion: env.SERVICE_VERSION,
  otlpEndpoint: env.OTLP_ENDPOINT,
  environment: env.NODE_ENV,
};

const sdk = createTelemetrySDK({
  config: telemetryConfig,
  spanProcessors: [traceExporter(), devExporter()],
});

sdk.start();
console.log('OpenTelemetry initialized');

process.on('SIGTERM', async () => {
  await sdk.shutdown();
  console.log('OpenTelemetry shut down successfully');
  process.exit(0);
});

import { startServer } from './server';

startServer();
