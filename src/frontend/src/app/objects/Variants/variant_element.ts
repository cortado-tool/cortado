import { VARIANT_Constants } from 'src/app/constants/variant_element_drawer_constants';
import {
  setParent,
  isElementWithActivity,
  SelectableState,
  updateSelectionAttributesForGroup,
} from './infix_selection';

export class PerformanceStats {
  public min: number;
  public max: number;
  public mean: number;
  public median: number;
  public stdev: number | undefined = 0;
  public n: number;

  constructor(dict) {
    if (dict) {
      this.min = dict['min'];
      this.max = dict['max'];
      this.mean = dict['mean'];
      this.median = dict['median'];
      this.stdev = dict['stdev'] || 0;
      this.n = dict['n'];
    }
  }
}

export abstract class VariantElement {
  public expanded: boolean = false;
  public serviceTime: PerformanceStats;
  public waitingTime: PerformanceStats;
  public waitingTimeStart: PerformanceStats;
  public waitingTimeEnd: PerformanceStats;
  public selected: boolean = false;
  public infixSelectableState: SelectableState = SelectableState.Selectable;
  public isAnyInfixSelected: boolean = false;

  public height;
  width;

  public inspectionMode = false;

  public parent;

  constructor(performance: any = undefined) {
    this.serviceTime = performance?.service_time;
    this.waitingTime = performance?.wait_time;
    this.waitingTimeStart = performance?.wait_time_start;
    this.waitingTimeEnd = performance?.wait_time_end;
    this.parent = null;
  }

  public asSequenceGroup(): SequenceGroup {
    let self: unknown = this;
    return <SequenceGroup>self;
  }

  public asParallelGroup(): ParallelGroup {
    let self: unknown = this;
    return <ParallelGroup>self;
  }

  public asLeafNode(): LeafNode {
    let self: unknown = this;
    return <LeafNode>self;
  }

  public asLoopGroup(): LoopGroup {
    let self: unknown = this;
    return <LoopGroup>self;
  }

  public setExpanded(expanded: boolean) {
    this.expanded = expanded;
  }

  public getExpanded(): boolean {
    return this.expanded;
  }

  // Creates a deep copy of a Variant Element
  public copy(): VariantElement {
    if (this instanceof ParallelGroup) {
      return this.asParallelGroup().copy();
    } else if (this instanceof SequenceGroup) {
      return this.asSequenceGroup().copy();
    } else {
      return this.asLeafNode().copy();
    }
  }

  public getElements() {
    if (this instanceof ParallelGroup) {
      return this.asParallelGroup().getElements();
    } else if (this instanceof SequenceGroup) {
      return this.asSequenceGroup().getElements();
    } else {
      return null;
    }
  }

  public setElements(children: VariantElement[]) {
    if (this instanceof ParallelGroup) {
      this.asParallelGroup().setElements(children);
      setParent(this);
    } else if (this instanceof SequenceGroup) {
      this.asSequenceGroup().setElements(children);
      setParent(this);
    }
  }

  public getHeadLength() {
    return (
      Math.tan((VARIANT_Constants.ARROW_HEAD_ANGLE / 360) * Math.PI * 2) *
      (this.getHeight() / 2)
    );
  }

  public getMarginX() {
    return VARIANT_Constants.MARGIN_X;
  }

  public getMarginY() {
    return VARIANT_Constants.MARGIN_Y;
  }

  public abstract getHeight(): number;
  public abstract getWidth(includeWaiting): number;

  public abstract recalculateWidth(includeWaiting): number;
  public abstract recalculateHeight(includeWaiting): number;

  public abstract updateWidth(includeWaiting);

  public abstract serialize(l?): Object;

  public abstract updateSelectionAttributes(): void;
  public abstract getActivities(): Set<string>;

  public updateConformance(confValue: number): void {
    //pass
  }

  public setInfixSelectableState(
    state: SelectableState,
    recursive: boolean = false
  ): void {
    this.infixSelectableState = state;

    if (
      recursive &&
      (this instanceof ParallelGroup || this instanceof SequenceGroup)
    ) {
      for (let elem of this.elements) {
        elem.setInfixSelectableState(state, recursive);
      }
    }
  }

  public setRootAnyInfixSelected(selected) {
    if (this.parent !== null) {
      this.parent.setRootAnyInfixSelected(selected);
    } else {
      this.isAnyInfixSelected = selected;
    }
  }

  public setAllChildrenSelected(): void {
    this.setSelectedStateRecursive(true);
  }

  public setAllChildrenUnselected(): void {
    this.setSelectedStateRecursive(false);
  }

  public setSelectedStateRecursive(selected: boolean): void {
    this.selected = selected;
    if (this instanceof SequenceGroup || this instanceof ParallelGroup) {
      for (let child of this.elements) {
        child.setSelectedStateRecursive(selected);
      }
    }
  }

  public isVisibleParentSelected(): boolean {
    if (this.parent === null || this.parent.parent === null) return false;

    if (this.parent instanceof InvisibleSequenceGroup)
      return this.parent.isVisibleParentSelected();

    return this.parent.selected;
  }

  public resetSelectionStatus(): void {
    this.setRootAnyInfixSelected(false);
    this.setAllChildrenUnselected();
    this.setInfixSelectableState(SelectableState.Selectable, true);
  }

  public updateSurroundingSelectableElements() {
    return;
  }

  public abstract asString(): string;
  public abstract deleteActivity(
    activityName: string
  ): [VariantElement[], boolean];
  public abstract renameActivity(
    activityName: string,
    newActivityName: string
  ): void;
}

export class SequenceGroup extends VariantElement {
  public getActivities(): Set<string> {
    const res: Set<string> = new Set<string>();

    this.elements.forEach((e) => e.getActivities().forEach((a) => res.add(a)));

    return res;
  }

  public renameActivity(activityName: string, newActivityName: string) {
    this.elements.forEach((e) => {
      e.renameActivity(activityName, newActivityName);
    });
  }

  public deleteActivity(activityName: string): [VariantElement[], boolean] {
    let newElems: VariantElement[] = [];

    for (let elem of this.elements) {
      if (!(elem instanceof WaitingTimeNode)) {
        const [variantElements, isFallthrough] =
          elem.deleteActivity(activityName);

        if (isFallthrough) {
          // Found a Fallthrough Stop Early
          return [[], true];
        } else {
          // We append the result
          if (variantElements) {
            newElems = newElems.concat(variantElements);
            variantElements.forEach((e) => (e.parent = this));
          }
        }
      }
    }

    if (
      newElems.length > 1 ||
      (newElems.length === 1 &&
        !this.parent &&
        !(this instanceof InvisibleSequenceGroup))
    ) {
      this.elements = newElems;
      return [[this], false];
    } else if (newElems.length === 1) {
      if (newElems[0] instanceof ParallelGroup) {
        return [newElems[0].elements, false];
      } else {
        return [newElems, false];
      }
    } else {
      return [null, false];
    }
  }

  public asString(): string {
    return (
      '->(' +
      this.elements
        .filter((v) => {
          return !(v instanceof WaitingTimeNode);
        })
        .map((v) => {
          return v.asString();
        })
        .join(', ') +
      ')'
    );
  }

  constructor(public elements: VariantElement[], performance: any = undefined) {
    super(performance);
  }

  public setExpanded(expanded: boolean) {
    super.setExpanded(expanded);

    for (let el of this.elements) {
      el.setExpanded(expanded);
    }
  }

  public setElements(elements: VariantElement[]) {
    this.elements = elements;
  }

  public getElements() {
    return this.elements;
  }

  public getHeight(): number {
    if (this.height) {
      return this.height;
    }
    return this.recalculateHeight();
  }

  public getWidth(includeWaiting = false): number {
    if (this.width) {
      return this.width;
    }
    return this.recalculateWidth(includeWaiting);
  }

  public getServiceTime(): Object {
    throw new Error('Method not implemented.');
  }

  public getWaitingTime(): Object {
    throw new Error('Method not implemented.');
  }

  public updateWidth(includeWaiting) {
    for (let el of this.elements) {
      el.updateWidth(includeWaiting);
    }
  }

  public copy(): SequenceGroup {
    const res = new SequenceGroup(this.elements.map((e) => e.copy()));
    res.expanded = this.expanded;
    return res;
  }

  public recalculateHeight(): number {
    this.elements.forEach((el) => (el.height = undefined));
    this.height =
      Math.max(...this.elements.map((el: VariantElement) => el.getHeight())) +
      this.getMarginY() * 2;
    return this.height;
  }

  public recalculateWidth(includeWaiting = false): number {
    this.elements.forEach((el) => (el.width = undefined));
    this.width =
      this.elements
        .filter((el) => !(el instanceof WaitingTimeNode) || includeWaiting)
        .map((el: VariantElement) => el.getWidth(includeWaiting))
        .reduce((a: number, b: number) => a + b) +
      2 * this.getMarginX() +
      this.getHeadLength() -
      this.elements[0].getHeadLength();
    return this.width;
  }

  public serialize(l = 1): any {
    return {
      follows: this.elements
        .map((e) => e.serialize(l))
        .flat()
        .filter((e) => e !== null),
    };
  }

  public updateSelectionAttributes(): void {
    updateSelectionAttributesForGroup(this);
  }

  public updateSurroundingSelectableElements(): void {
    let children = this.elements.filter((c) => isElementWithActivity(c));

    // If no children is partly selected, then selection happens on this level
    // Then calculate the next selectable elements
    let first = -1;
    let last = children.length;
    // First selected child
    for (let i = 0; i < children.length; i++) {
      if (children[i].selected) {
        first = i;
        children[first].infixSelectableState = SelectableState.Unselectable;
        break;
      }
    }
    // Last selected child
    for (let i = children.length - 1; i >= 0; i--) {
      if (children[i].selected) {
        last = i;
        children[last].infixSelectableState = SelectableState.Unselectable;
        break;
      }
    }

    // Adding two new selectable elements, disabling selection in lower levels
    if (first > 0) {
      children[first - 1].setInfixSelectableState(
        SelectableState.Selectable,
        false
      );
    }
    if (last < children.length - 1) {
      children[last + 1].setInfixSelectableState(
        SelectableState.Selectable,
        false
      );
    }
  }

  public updateConformance(confValue: number): void {
    this.elements.forEach((el) => el.updateConformance(confValue));
  }
}

export class ParallelGroup extends VariantElement {
  public getActivities(): Set<string> {
    const res: Set<string> = new Set<string>();

    this.elements.forEach((e) => e.getActivities().forEach((a) => res.add(a)));

    return res;
  }

  public renameActivity(activityName: string, newActivityName: string) {
    this.elements.forEach((e) => {
      e.renameActivity(activityName, newActivityName);
    });
  }

  public deleteActivity(activityName: string): [VariantElement[], boolean] {
    let newElems = [];

    for (let elem of this.elements) {
      if (!(elem instanceof WaitingTimeNode)) {
        const [variantElements, isFallthrough] =
          elem.deleteActivity(activityName);

        if (isFallthrough) {
          // Found a Fallthrough Stop Early
          return [[], true];
        } else {
          // We append the result
          if (variantElements) {
            newElems = newElems.concat(variantElements);
            variantElements.forEach((e) => (e.parent = this));
          }
        }
      }
    }

    if (newElems.length > 1) {
      this.elements = newElems;
      return [[this], false];
    } else if (newElems.length === 1) {
      if (newElems[0] instanceof SequenceGroup) {
        return [newElems[0].elements, false];
      } else {
        return [newElems, false];
      }
    } else {
      return [null, false];
    }
  }

  constructor(public elements: VariantElement[], performance: any = undefined) {
    super(performance);
  }

  public asString(): string {
    return (
      '+(' +
      this.elements
        .filter((v) => {
          return !(v instanceof WaitingTimeNode);
        })
        .map((v) => {
          return v.asString();
        })
        .join(', ') +
      ')'
    );
  }

  public setExpanded(expanded: boolean) {
    super.setExpanded(expanded);

    for (let el of this.elements) {
      el.setExpanded(expanded);
    }
  }

  public setElements(elements: VariantElement[]) {
    this.elements = elements;
  }

  public getElements() {
    return this.elements;
  }

  public getHeight(): number {
    if (this.height) {
      return this.height;
    }
    return this.recalculateHeight();
  }

  public getWidth(includeWaiting = false): number {
    if (this.width) {
      return this.width;
    }
    return this.recalculateWidth(includeWaiting);
  }

  public copy(): ParallelGroup {
    const res = new ParallelGroup(this.elements.map((e) => e.copy()));
    res.expanded = this.expanded;
    return res;
  }

  public updateWidth(includeWaiting) {
    let headLength = this.getHeadLength();
    for (let el of this.elements) {
      el.width = this.width - VARIANT_Constants.MARGIN_X - 2 * headLength;
    }

    for (let el of this.elements) {
      el.updateWidth(includeWaiting);
    }
  }

  public recalculateHeight(): number {
    this.elements.forEach((el) => (el.height = undefined));
    this.height =
      this.elements
        .map((el: VariantElement) => el.getHeight() + this.getMarginY())
        .reduce((a: number, b: number) => a + b) + VARIANT_Constants.MARGIN_Y;
    return this.height;
  }

  public recalculateWidth(includeWaiting = false): number {
    this.elements.forEach((el) => (el.width = undefined));
    let headLength = this.getHeadLength();
    this.width =
      Math.max(
        ...this.elements
          .filter((el) => !(el instanceof WaitingTimeNode) || includeWaiting)
          .map((el: VariantElement) => el.getWidth(includeWaiting))
      ) +
      VARIANT_Constants.MARGIN_X +
      2 * headLength;
    return this.width;
  }

  public serialize(l = 1) {
    return {
      parallel: this.elements
        .map((e) => e.serialize(l))
        .flat()
        .filter((e) => e !== null),
    };
  }

  public updateSelectionAttributes(): void {
    updateSelectionAttributesForGroup(this);
  }

  public updateSurroundingSelectableElements(): void {
    let children = this.elements.filter((c) => isElementWithActivity(c));
    children.forEach((c) => {
      if (!c.selected) {
        c.setInfixSelectableState(SelectableState.Selectable, false);
      } else {
        c.setInfixSelectableState(SelectableState.Unselectable, false);
      }
    });
  }

  public updateConformance(confValue: number): void {
    this.elements.forEach((el) => el.updateConformance(confValue));
  }
}

export class LoopGroup extends VariantElement {
  public getActivities(): Set<string> {
    return this.elements[0].getActivities();
  }

  public renameActivity(activityName: string, newActivityName: string) {
    this.elements[0].renameActivity(activityName, newActivityName);
  }

  // TODO niklas: check if correct
  public deleteActivity(activityName: string): [VariantElement[], boolean] {
    let res = this.elements[0].deleteActivity(activityName);
    if (res[0].length == 0) {
      return [null, res[1]];
    }

    return [[new LoopGroup(res[0])], res[1]];
  }

  constructor(public elements: VariantElement[], performance: any = undefined) {
    super(performance);
  }

  public asString(): string {
    return 'L(' + this.elements[0].asString() + ')';
  }

  public setExpanded(expanded: boolean) {
    super.setExpanded(expanded);

    for (let el of this.elements) {
      el.setExpanded(expanded);
    }
  }

  public setElements(elements: VariantElement[]) {
    this.elements = elements;
  }

  public getElements() {
    return this.elements;
  }

  public getHeight(): number {
    return this.elements[0].getHeight() * 2;
  }

  public getWidth(includeWaiting = false): number {
    return this.elements[0].getWidth(includeWaiting);
  }

  public copy(): LoopGroup {
    const res = new LoopGroup(this.elements.map((e) => e.copy()));
    res.expanded = this.expanded;
    return res;
  }

  public updateWidth(includeWaiting) {
    let headLength = this.getHeadLength();
    for (let el of this.elements) {
      el.width = this.width - VARIANT_Constants.MARGIN_X - 2 * headLength;
    }

    for (let el of this.elements) {
      el.updateWidth(includeWaiting);
    }
  }

  public recalculateHeight(includeWating = false): number {
    return this.elements[0].recalculateHeight(includeWating) * 2;
  }

  public recalculateWidth(includeWaiting = false): number {
    return this.elements[0].recalculateWidth(includeWaiting);
  }

  public serialize(l = 1) {
    return {
      loop: this.elements
        .map((e) => e.serialize(l))
        .flat()
        .filter((e) => e !== null),
    };
  }

  public updateSelectionAttributes(): void {
    updateSelectionAttributesForGroup(this);
  }

  public updateSurroundingSelectableElements(): void {
    let children = this.elements.filter((c) => isElementWithActivity(c));
    children.forEach((c) => {
      if (!c.selected) {
        c.setInfixSelectableState(SelectableState.Selectable, false);
      } else {
        c.setInfixSelectableState(SelectableState.Unselectable, false);
      }
    });
  }
}

export class LeafNode extends VariantElement {
  public getActivities(): Set<string> {
    return new Set<string>(this.activity);
  }

  public renameActivity(activityName: string, newActivityName: string) {
    this.activity = this.activity.map((a) => {
      return a === activityName ? newActivityName : a;
    });
  }

  public deleteActivity(activityName: string): [VariantElement[], boolean] {
    if (this.activity.includes(activityName)) {
      if (this.activity.length > 1) {
        return [[this], true];
      } else {
        return [null, false];
      }
    }

    return [[this], false];
  }

  public textLength: number = 10;

  public asString(): string {
    return this.activity.join(';');
  }

  constructor(
    public activity: string[],
    performance: any = undefined,
    public conformance: number[] = undefined
  ) {
    super(performance);
  }

  public getHeight(): number {
    this.height =
      this.activity.length *
      (VARIANT_Constants.FONT_SIZE + 2 * VARIANT_Constants.MARGIN_Y);
    return this.height;
  }

  public getWidth(
    includeWaiting = false,
    full_text_width: boolean = false
  ): number {
    if (this.width) {
      return this.width;
    }
    if (this.expanded || includeWaiting) {
      this.width = VARIANT_Constants.LEAF_WIDTH_EXPANDED;
    } else if (full_text_width) {
      this.width = this.activity[0].length * VARIANT_Constants.CHAR_WIDTH;
    } else {
      this.width = VARIANT_Constants.LEAF_WIDTH;
    }
    this.width += VARIANT_Constants.MARGIN_X;

    this.width = Math.max(
      this.width * 0.75 + this.getHeadLength() * 2,
      this.width - this.getHeadLength() * 2
    );

    return this.width;
  }

  public updateWidth() {}

  public recalculateHeight(): number {
    this.height = VARIANT_Constants.LEAF_HEIGHT;
    return this.height;
  }

  public copy(): LeafNode {
    const res = new LeafNode([...this.activity]);
    res.expanded = this.expanded;
    return res;
  }

  public recalculateWidth(): number {
    if (this.expanded) {
      this.width = VARIANT_Constants.LEAF_WIDTH_EXPANDED;
    } else {
      this.width = VARIANT_Constants.LEAF_WIDTH;
    }
    this.width += VARIANT_Constants.MARGIN_X;
    return this.width;
  }

  public serialize(l = 1) {
    return { leaf: this.activity };
  }

  public updateSelectionAttributes(): void {
    // pass
  }

  public updateConformance(confValue: number): void {
    this.conformance = new Array(this.activity.length).fill(confValue);
  }
}

export class WaitingTimeNode extends VariantElement {
  public getActivities(): Set<string> {
    return new Set<string>();
  }

  public renameActivity(activityName: string, newActivityName: string) {}

  public deleteActivity(activityName: string): [VariantElement[], boolean] {
    return [null, false];
  }

  public asString(): string {
    return '';
  }

  constructor(waitingTime: PerformanceStats) {
    super({ wait_time: waitingTime });
  }

  public getHeight(): number {
    return VARIANT_Constants.LEAF_HEIGHT;
  }

  public getWidth(): number {
    if (this.width) {
      return this.width;
    }
    this.width = VARIANT_Constants.WAITING_WIDTH + VARIANT_Constants.MARGIN_X;

    return this.width;
  }

  public updateWidth() {}

  public recalculateHeight(): number {
    this.height = VARIANT_Constants.LEAF_HEIGHT;
    return this.height;
  }

  public recalculateWidth(): number {
    if (this.expanded) {
      this.width = VARIANT_Constants.LEAF_WIDTH_EXPANDED;
    } else {
      this.width = VARIANT_Constants.LEAF_WIDTH;
    }
    this.width += VARIANT_Constants.MARGIN_X;
    return this.width;
  }

  public serialize(l = 1) {
    return null;
  }

  public updateSelectionAttributes(): void {
    // pass
  }
}

export class InvisibleSequenceGroup extends SequenceGroup {
  public asString(): string {
    return this.elements
      .filter((e) => {
        return !(e instanceof WaitingTimeNode);
      })[0]
      .asString();
  }

  public deleteActivity(activityName: string): [VariantElement[], boolean] {
    return this.elements
      .filter((e) => {
        return !(e instanceof WaitingTimeNode);
      })[0]
      .deleteActivity(activityName);
  }

  public getMarginX() {
    return 0;
  }

  public getMarginY() {
    return 0;
  }

  public setInfixSelectableState(
    state: SelectableState,
    recursive = false
  ): void {
    this.infixSelectableState = state;

    for (let child of this.elements) {
      if (isElementWithActivity(child)) {
        child.setInfixSelectableState(state, recursive);
      }
    }
  }

  public updateWidth(includeWaiting = false) {
    let waiting = includeWaiting ? 1 : 0;
    let waitingLengths = this.elements
      .filter((e) => e instanceof WaitingTimeNode)
      .map((e) => e.getWidth(true))
      .reduce((a, b) => a + b, 0);
    this.elements
      .filter((e) => !(e instanceof WaitingTimeNode))
      .forEach((e) => (e.width = this.width - waitingLengths * waiting));
    return this.width;
  }

  public serialize(l = 1) {
    return this.elements.map((e) => e.serialize(l)).filter((e) => e !== null);
  }
}

export class StartGroup extends VariantElement {
  public updateSelectionAttributes(): void {}

  public getActivities(): Set<string> {
    return new Set<string>();
  }
  public asString(): string {
    return 'END';
  }
  public deleteActivity(activityName: string): [VariantElement[], boolean] {
    return [[this], false];
  }
  public renameActivity(activityName: string, newActivityName: string): void {}
  public calculateSelectableElements(): void {}

  public getHeight(): number {
    return VARIANT_Constants.LEAF_HEIGHT;
  }

  public getWidth(includeWaiting: any): number {
    return 25;
  }

  public recalculateWidth(includeWaiting: any): number {
    return 25;
  }

  public recalculateHeight(includeWaiting: any): number {
    return VARIANT_Constants.LEAF_HEIGHT;
  }

  public updateWidth(includeWaiting: any) {}

  public serialize(l = 1): Object {
    return { start: true };
  }
}

export class EndGroup extends VariantElement {
  public updateSelectionAttributes(): void {}

  public getActivities(): Set<string> {
    return new Set<string>();
  }
  public asString(): string {
    return 'START';
  }
  public deleteActivity(activityName: string): [VariantElement[], boolean] {
    return [[this], false];
  }
  public renameActivity(activityName: string, newActivityName: string): void {}

  public calculateSelectableElements(): void {}

  public getHeight(): number {
    return VARIANT_Constants.LEAF_HEIGHT;
  }

  public getWidth(includeWaiting: any): number {
    return 25;
  }

  public recalculateWidth(includeWaiting: any): number {
    return 25;
  }

  public recalculateHeight(includeWaiting: any): number {
    return VARIANT_Constants.LEAF_HEIGHT;
  }
  public updateWidth(includeWaiting: any) {}

  public serialize(l = 1): Object {
    return { end: true };
  }
}

export function deserialize(obj: any): VariantElement {
  if ('follows' in obj) {
    return new SequenceGroup(
      obj['follows'].map((e: any) => deserialize(e)).filter((e) => e),
      obj['performance']
    );
  } else if ('parallel' in obj) {
    return new ParallelGroup(
      obj['parallel'].map((e: any) => deserialize(e)).filter((e) => e),
      obj['performance']
    );
  } else if ('leaf' in obj) {
    return new LeafNode(
      obj['leaf'].map((el) => {
        return typeof el === 'string' ? el : el[0];
      }),
      obj['performance'],
      obj['leaf'].map((el) => {
        return typeof el === 'string' ? undefined : el[1];
      })
    );
  } else if ('loop' in obj) {
    return new LoopGroup(
      obj['loop'].map((e: any) => deserialize(e)),
      obj['performance']
    );
  }
}

export function injectWaitingTimeNodes(variants: VariantElement[]) {
  variants.forEach((v) => injectWaitingTimeNodesVariant(v));
}

export function injectWaitingTimeNodesVariant(variant: VariantElement) {
  if (variant instanceof SequenceGroup) {
    variant
      .asSequenceGroup()
      .elements.filter((v) => !(v instanceof LeafNode))
      .forEach((e) => injectWaitingTimeNodesVariant(e));

    for (let i = 0; i < variant.asSequenceGroup().elements.length; i++) {
      let v = variant.asSequenceGroup().elements[i];

      if (v.waitingTime?.mean !== undefined) {
        let wait = new WaitingTimeNode(v.waitingTime);
        v.waitingTime = undefined;
        variant.elements.splice(i, 0, wait);
        i += 1;
      }
    }
  }

  if (variant instanceof ParallelGroup) {
    variant
      .asParallelGroup()
      .elements.filter((v) => !(v instanceof LeafNode))
      .forEach((e) => injectWaitingTimeNodesVariant(e));

    for (let i = 0; i < variant.asSequenceGroup().elements.length; i++) {
      let v = variant.asParallelGroup().elements[i];
      let waitGroup = [v];
      if (v.waitingTimeStart?.mean !== undefined) {
        let wait = new WaitingTimeNode(v.waitingTimeStart);
        waitGroup.splice(0, 0, wait);
      }

      if (v.waitingTimeEnd?.mean !== undefined) {
        let wait = new WaitingTimeNode(v.waitingTimeEnd);
        waitGroup.splice(waitGroup.length, 0, wait);
      }
      variant.elements[i] = new InvisibleSequenceGroup(waitGroup);
    }
  }
}
