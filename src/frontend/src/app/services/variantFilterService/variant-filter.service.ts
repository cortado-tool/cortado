import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class VariantFilterService {
  private _variantFilters: BehaviorSubject<Map<string, VariantFilter>> =
    new BehaviorSubject<Map<string, VariantFilter>>(
      new Map<string, VariantFilter>()
    );

  get variantFilters$(): Observable<Map<string, VariantFilter>> {
    return this._variantFilters.asObservable();
  }

  set variantFilters(filters: Map<string, VariantFilter>) {
    this._variantFilters.next(filters);
  }

  get variantFilters() {
    return this._variantFilters.value;
  }

  constructor() {}

  addVariantFilter(filter_name: string, bids: Set<number>, tooltip) {
    const newFilterMap = new Map<string, VariantFilter>(this.variantFilters);
    const filter = new VariantFilter(filter_name, bids, tooltip);

    newFilterMap.set(filter_name, filter);

    this.variantFilters = newFilterMap;
  }

  removeVariantFilter(filter_name) {
    const newFilterMap = new Map<string, VariantFilter>(this.variantFilters);
    newFilterMap.delete(filter_name);
    this.variantFilters = newFilterMap;
  }

  clearAllFilters() {
    const newFilterMap = new Map<string, VariantFilter>(this.variantFilters);
    this.variantFilters = newFilterMap;
  }
}

export class VariantFilter {
  bids: Set<number>;
  name: string;
  tooltip: string;

  constructor(name, bids, tooltip) {
    this.name = name;
    this.bids = bids;
    this.tooltip = tooltip;
  }
}
