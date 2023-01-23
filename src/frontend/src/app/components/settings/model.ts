import { TimeUnit } from 'src/app/objects/TimeUnit';

export class Configuration {
  timeoutCVariantAlignmentComputation: number;
  timeGranularity: TimeUnit;
  minTracesVariantDetectionMultiprocessing: number;
  isNSequentializationReductionEnabled: boolean;
  numberOfSequentializationsPerVariant: number;
}
