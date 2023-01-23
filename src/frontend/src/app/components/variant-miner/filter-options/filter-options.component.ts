import { SubvariantPattern } from 'src/app/objects/Variants/variant-miner-types';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-filter-options',
  templateUrl: './filter-options.component.html',
  styleUrls: ['./filter-options.component.css'],
})
export class FilterOptionsComponent {
  constructor() {}

  @Input()
  checks: Array<Choice>;
}

export class Choice {
  desc: string;
  value: boolean;
  filterFnc: (p: SubvariantPattern) => boolean;

  constructor(
    desc: string,
    value: boolean,
    filterFnc: (p: SubvariantPattern) => boolean
  ) {
    this.desc = desc;
    this.value = value;
    this.filterFnc = filterFnc;
  }
}
