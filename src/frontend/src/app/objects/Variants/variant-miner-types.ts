import { InfixType } from 'src/app/objects/Variants/infix_selection';
import { VariantElement } from 'src/app/objects/Variants/variant_element';
import { ProcessTree } from '../ProcessTree/ProcessTree';

export class MiningConfig {
  size: number;
  min_sup: number;
  strat: number;
  loop: number;
  algo: number;
  artifical_start: boolean;

  constructor(size, min_sup, strat, loop, algo, art_start) {
    this.size = size;
    this.min_sup = min_sup;
    this.strat = strat;
    this.loop = loop;
    this.algo = algo;
    this.artifical_start = art_start;
  }

  serialize() {
    return {
      size: this.size,
      min_sup: this.min_sup,
      strat: this.strat,
      algo: this.algo,
      loop: this.loop,
      algo_type: 0,
      artifical_start: this.artifical_start,
    };
  }
}

export enum FrequentMiningStrategy {
  TraceTransaction = 1,
  VariantTransaction = 2,
  TraceOccurence = 3,
  VariantOccurence = 4,
}

export enum FrequentMiningCMStrategy {
  ClosedMaximal = 1,
  OnlyMaximal = 2,
}

export enum FrequentMiningAlgorithm {
  ValidTreeMiner = 1,
  ClosedMaximalMiner = 2,
}

export enum VariantSortKey {
  size = 'size',
  id = 'id',
  support = 'support',
  conformance = 'conformance',
  maximal = 'maximal',
  closed = 'closed',
}

export enum VariantFilterKey {
  size = 'size',
  support = 'support',
  id = 'id',
  deviation = 'deviation',
  child_parent_confidence = 'child_parent_confidence',
  subpattern_confidence = 'subpattern_confidence',
  cross_support_confidence = 'cross_support_confidence',
  maximal = 'maximal',
  closed = 'closed',
}

export class SubvariantPattern {
  id: number;
  size: number;
  variant: VariantElement;
  support: number;
  child_parent_confidence: number;
  subpattern_confidence: number;
  cross_support_confidence: number;
  maximal: boolean;
  valid: boolean;
  closed: boolean;
  bids: Set<number>;
  activities: Set<string>;

  calculationInProgress;

  alignment: VariantElement | undefined;
  deviations: number | undefined;
  isTimeouted: boolean;
  isConformanceOutdated: boolean;
  usedTreeForConformanceChecking: ProcessTree;

  infixType: InfixType;

  constructor(
    id: number,
    size: number,
    variant: VariantElement,
    support: number,
    child_parent_confidence: number,
    subpattern_confidence: number,
    cross_support_confidence: number,
    maximal: boolean,
    valid: boolean,
    closed: boolean,
    infixType: InfixType,
    bids: Set<number>
  ) {
    this.id = id;
    this.size = size;
    this.variant = variant;
    this.support = support;
    this.child_parent_confidence = child_parent_confidence;
    this.subpattern_confidence = subpattern_confidence;
    this.cross_support_confidence = cross_support_confidence;
    this.maximal = maximal;
    this.valid = valid;
    this.closed = closed;
    this.infixType = infixType;
    this.bids = bids;
    this.activities = this.variant.getActivities();
  }
}
