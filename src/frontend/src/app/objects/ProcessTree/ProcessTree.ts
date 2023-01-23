import { PerformanceStats } from '../Variants/variant_element';

export class ProcessTree {
  constructor(
    public label: string,
    public operator: ProcessTreeOperator,
    public children: ProcessTree[],
    public id: number,
    public frozen: boolean,
    public performance: TreePerformance,
    public conformance: TreeConformance,
    public parent: ProcessTree
  ) {}

  public equals(other: ProcessTree) {
    if (!other) {
      return false;
    }
    let equals = this.label == other.label && this.operator == other.operator;
    equals &&= this.children?.length == other.children?.length;

    if (!equals) {
      return false;
    }

    for (let i = 0; i < this.children?.length; i++) {
      equals &&= this.children[i].equals(other.children[i]);
    }

    return equals;
  }

  public static fromObj(treeObj) {
    const tree = new ProcessTree(
      treeObj['label'],
      treeObj['operator'],
      [],
      treeObj['id'],
      treeObj['frozen'],
      treeObj['performance'],
      treeObj['conformance'],
      null
    );
    if (treeObj['children']) {
      treeObj['children'].forEach((c) => {
        tree.children.push(ProcessTree.fromObj(c));
      });

      tree.children.forEach((child) => (child.parent = tree));
    }
    return tree;
  }

  public copy(parentRelation: boolean = true): ProcessTree {
    const children = this.children.map((child) => child.copy(parentRelation));

    const parent = parentRelation ? this.parent : null;

    return new ProcessTree(
      this.label,
      this.operator,
      children,
      this.id,
      this.frozen,
      this.performance,
      this.conformance,
      parent
    );
  }

  toString() {
    if (this.operator) {
      return `${this.operator} ( ${this.children
        .map((n) => n.toString())
        .join(' ')} )`;
    } else {
      return this.label === ProcessTreeOperator.tau
        ? this.label + ','
        : "'" + this.label + "'" + ',';
    }
  }

  public hasPerformance() {
    return (
      this.performance?.service_time ||
      this.performance?.cycle_time ||
      this.performance?.waiting_time ||
      this.performance?.idle_time
    );
  }
}

export class TreePerformance {
  service_time: PerformanceStats;
  waiting_time: PerformanceStats;
  cycle_time: PerformanceStats;
  idle_time: PerformanceStats;

  constructor(dict: any = {}) {
    this.service_time = new PerformanceStats(dict.service_time);
    this.waiting_time = new PerformanceStats(dict.waiting_time);
    this.cycle_time = new PerformanceStats(dict.cycle_time);
    this.idle_time = new PerformanceStats(dict.idle_time);
  }
}

export interface TreeConformance {
  weighted_equally: WeightedConformanceValue;
  weighted_by_counts: WeightedConformanceValue;
}

export interface WeightedConformanceValue {
  value: number;
  weight: number;
}

// TODO
export enum ProcessTreeOperator {
  sequence = '\u2794',
  choice = '\u2715',
  loop = '\u21BA',
  parallelism = '\u2227',
  tau = '\u03C4',
}

export class ProcessTreeSyntaxInfo {
  correctSyntax = true;
  warnings: string[] = [];
  errors: string[] = [];
}

export function checkSyntax(
  pt: ProcessTree,
  res = new ProcessTreeSyntaxInfo()
): ProcessTreeSyntaxInfo {
  if (pt.label && pt.children.length > 0) {
    res.correctSyntax = false;
    res.errors.push('an activity node cannot have child nodes');
  }
  if (
    pt.operator &&
    pt.operator !== ProcessTreeOperator.loop &&
    pt.children.length === 0
  ) {
    res.correctSyntax = false;
    res.errors.push(
      'a tree operator (' +
        ProcessTreeOperator.sequence +
        ',' +
        ProcessTreeOperator.choice +
        ',' +
        ProcessTreeOperator.parallelism +
        ',' +
        ') must have at least one child node'
    );
  }
  if (
    pt.children.length !== 2 &&
    pt.operator &&
    pt.operator === ProcessTreeOperator.loop
  ) {
    res.correctSyntax = false;
    res.errors.push(
      'a loop operator (' +
        ProcessTreeOperator.loop +
        ') must have exactly two children'
    );
  }
  if (
    pt.children.length === 1 &&
    pt.operator &&
    pt.operator !== ProcessTreeOperator.loop
  ) {
    res.warnings.push(
      'a tree operator (' +
        ProcessTreeOperator.sequence +
        ',' +
        ProcessTreeOperator.choice +
        ',' +
        ProcessTreeOperator.parallelism +
        ',' +
        ') contains only one child node'
    );
  }
  if (pt.children) {
    pt.children.forEach((subtree) => {
      const subtreeRes = checkSyntax(subtree);
      res.warnings = res.warnings.concat(subtreeRes.warnings);
      res.errors = res.errors.concat(subtreeRes.errors);
      res.correctSyntax = res.correctSyntax && subtreeRes.correctSyntax;
    });
  }
  return res;
}
