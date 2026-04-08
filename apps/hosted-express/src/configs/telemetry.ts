import { NodeSDK } from '@opentelemetry/sdk-node';
import type { ExportResult } from '@opentelemetry/core';
import { ExportResultCode } from '@opentelemetry/core';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
  BatchSpanProcessor,
  ReadableSpan,
  SpanExporter,
  SimpleSpanProcessor,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { env } from '../env';

export interface TelemetryConfig {
  serviceName: string;
  serviceVersion: string;
  otlpEndpoint: string;
  environment: string;
}

interface DevConsoleExporterOptions {
  ignoredPrefixes?: string[];
  customPrinters?: Record<string, (value: unknown) => string>;
}
type SpanPrefix = string;
class DevConsoleSpanExporter implements SpanExporter {
  private ignoredPrefixes: SpanPrefix[];
  private customPrinters: Record<SpanPrefix, (value: unknown) => string>;

  constructor({
    ignoredPrefixes = [],
    customPrinters = {},
  }: DevConsoleExporterOptions) {
    this.ignoredPrefixes = ignoredPrefixes;
    this.customPrinters = customPrinters;
  }
  private applyCustomPrinters(
    filteredFields: Record<SpanPrefix, unknown>,
  ): void {
    for (const [prefix, printer] of Object.entries(this.customPrinters)) {
      if (prefix in filteredFields) {
        filteredFields[prefix] = printer(filteredFields[prefix]);
      }
    }
  }

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void,
  ): void {
    for (const span of spans) {
      const filteredFields = Object.fromEntries(
        Object.entries(span).filter(
          ([key]) =>
            !this.ignoredPrefixes.some((prefix) => key.startsWith(prefix)),
        ),
      );

      this.applyCustomPrinters(filteredFields);

      console.log(
        Bun.inspect(filteredFields, {
          colors: true,
          depth: 5,
        }),
      );
    }
    resultCallback({ code: ExportResultCode.SUCCESS });
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}

export const traceExporter = () =>
  new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: 'https://api.axiom.co/v1/traces',
      headers: {
        Authorization: `Bearer ${env.OTEL_AXIOM_TOKEN}`,
        'X-Axiom-Dataset': env.OTEL_AXIOM_DATASET,
      },
    }),
  );

export const devExporter = () =>
  new SimpleSpanProcessor(
    new DevConsoleSpanExporter({
      customPrinters: {
        startTime: (value) => convertTimestamp(value as [number, number]),
        endTime: (value) => convertTimestamp(value as [number, number]),
      },
      ignoredPrefixes: ['_', 'attributes', 'resource', 'instrumentationScope'],
    }),
  );

export interface CreateTelemetrySDKParams {
  config: TelemetryConfig;
  spanProcessors: SpanProcessor[];
}

export function createTelemetrySDK({
  config,
  spanProcessors,
}: CreateTelemetrySDKParams): NodeSDK {
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: config.serviceName,
    [ATTR_SERVICE_VERSION]: config.serviceVersion,
    'deployment.environment': config.environment,
    'telemetry.sdk.language': 'javascript',
    'telemetry.sdk.runtime': 'bun',
  });

  // diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  const sdk = new NodeSDK({
    resource,
    spanProcessors,
    instrumentations: [getNodeAutoInstrumentations()],
  });

  return sdk;
}

const convertTimestamp = (value: [number, number]) => {
  const [seconds, nanoseconds] = value as [number, number];
  return new Date(seconds * 1e3 + nanoseconds / 1e6).toISOString();
};
