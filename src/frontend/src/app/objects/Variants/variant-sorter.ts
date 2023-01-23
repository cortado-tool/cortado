import { SubvariantPattern } from './variant-miner-types';
import { Variant } from 'src/app/objects/Variants/variant';

export class VariantSorter {
  static sort(
    variants: Variant[] | SubvariantPattern[],
    sortKey: string,
    isAscendingOrder: boolean
  ): Variant[] | SubvariantPattern[] {
    let sortFn: any;
    sortFn = (a: Variant | SubvariantPattern, b: Variant | SubvariantPattern) =>
      VariantSorter.attributeSorting(a, b, sortKey);

    if (sortKey == 'conformance') {
      sortFn = VariantSorter.conformanceSorting;
    }

    if (sortKey == 'sub_variants') {
      sortFn = VariantSorter.subvariantsSorting;
    }

    return variants.sort(
      (a: Variant | SubvariantPattern, b: Variant | SubvariantPattern) =>
        VariantSorter.applyOrder(sortFn(a, b), isAscendingOrder)
    );
  }

  static attributeSorting(
    a: Variant | SubvariantPattern,
    b: Variant | SubvariantPattern,
    sortAttribute: string
  ) {
    if (a[sortAttribute] < b[sortAttribute]) {
      return -1;
    } else if (a[sortAttribute] > b[sortAttribute]) {
      return 1;
    } else {
      return a.id > b.id ? 1 : -1;
    }
  }

  static subvariantsSorting(a: Variant, b: Variant) {
    if (a.nSubVariants < b.nSubVariants) {
      return -1;
    } else if (a.nSubVariants > b.nSubVariants) {
      return 1;
    } else {
      return a.id > b.id ? 1 : -1;
    }
  }

  static conformanceSorting(
    a: Variant | SubvariantPattern,
    b: Variant | SubvariantPattern
  ) {
    if (a.calculationInProgress && !b.calculationInProgress) {
      return -1;
    } else if (!a.calculationInProgress && b.calculationInProgress) {
      return 1;
    } else if (a.isTimeouted && !b.isTimeouted) {
      return -1;
    } else if (b.isTimeouted && !a.isTimeouted) {
      return 1;
    } else if (a.isConformanceOutdated && !b.isConformanceOutdated) {
      return -1;
    } else if (!a.isConformanceOutdated && b.isConformanceOutdated) {
      return 1;
    } else if (a.deviations === undefined && b.deviations !== undefined) {
      return -1;
    } else if (b.deviations === undefined && a.deviations !== undefined) {
      return 1;
    } else if (a.deviations > b.deviations) {
      return -1;
    } else if (a.deviations < b.deviations) {
      return 1;
    }

    return a.id > b.id ? 1 : -1;
  }

  static applyOrder(sortFnResult: number, isAscendingOrder: boolean) {
    return isAscendingOrder ? sortFnResult : sortFnResult * -1;
  }
}
