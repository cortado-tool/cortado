import { VARIANT_Constants } from 'src/app/constants/variant_element_drawer_constants';
import {
  isElementWithActivity,
  SelectableState,
  setParent,
  updateSelectionAttributesForGroup,
} from './infix_selection';
import { Choice } from 'src/app/components/variant-miner/variant-miner.component';

export class PerformanceStats {
  public min: number;
  public max: number;
  public mean: number;
  public median: number;
  public stdev: number | undefined = 0;
  public n: number;

  constructor(dict) {
    if (dict) {
      this.min = dict.min;
      this.max = dict.max;
      this.mean = dict.mean;
      this.median = dict.median;
      this.stdev = dict.stdev || 0;
      this.n = dict.n;
    }
  }
}

export abstract class VariantElement {
  public expanded = false;
  public serviceTime: PerformanceStats;
  public waitingTime: PerformanceStats;
  public waitingTimeStart: PerformanceStats;
  public waitingTimeEnd: PerformanceStats;
  public selected = false;
  public infixSelectableState: SelectableState = SelectableState.Selectable;
  public isAnyInfixSelected = false;

  public height;
  width;

  public inspectionMode = false;

  public parent;

  public id;

  constructor(performance: any = undefined) {
    this.serviceTime = performance?.service_time;
    this.waitingTime = performance?.wait_time;
    this.waitingTimeStart = performance?.wait_time_start;
    this.waitingTimeEnd = performance?.wait_time_end;
    this.parent = null;
  }

  equals(variantElement: VariantElement) {
    let equals = false;

    if (
      (this instanceof SequenceGroup &&
        variantElement instanceof SequenceGroup) ||
      (this instanceof ParallelGroup &&
        variantElement instanceof ParallelGroup) ||
      (this instanceof LoopGroup && variantElement instanceof LoopGroup) ||
      (this instanceof RepeatGroup && variantElement instanceof RepeatGroup) ||
      (this instanceof OptionalGroup &&
        variantElement instanceof OptionalGroup) ||
      (this instanceof SkipGroup && variantElement instanceof SkipGroup) ||
      (this instanceof LeafNode && variantElement instanceof LeafNode) ||
      (this instanceof WaitingTimeNode &&
        variantElement instanceof WaitingTimeNode) ||
      (this instanceof StartNode && variantElement instanceof StartNode) ||
      (this instanceof EndNode && variantElement instanceof EndNode)
    ) {
      equals = ((a, b) =>
        a.size === b.size && [...a].every((value) => b.has(value)))(
        this.getActivities(),
        variantElement.getActivities()
      );
    } else if (
      this instanceof InvisibleSequenceGroup &&
      variantElement instanceof InvisibleSequenceGroup
    ) {
      if (this.asString() === variantElement.asString()) {
        equals = true;
      }
    }

    return equals;
  }

  public asSequenceGroup(): SequenceGroup {
    const self: unknown = this;
    return self as SequenceGroup;
  }

  public asParallelGroup(): ParallelGroup {
    const self: unknown = this;
    return self as ParallelGroup;
  }

  public asRepeatGroup(): RepeatGroup {
    const self: unknown = this;
    return self as RepeatGroup;
  }

  public asOptionalGroup(): OptionalGroup {
    const self: unknown = this;
    return self as OptionalGroup;
  }

  public asChoiceGroup(): ChoiceGroup {
    let self: unknown = this;
    return <ChoiceGroup>self;
  }

  public asFallthroughGroup(): FallthroughGroup {
    let self: unknown = this;
    return <FallthroughGroup>self;
  }

  public asLeafNode(): LeafNode {
    const self: unknown = this;
    return self as LeafNode;
  }

  public asEndNode(): EndNode {
    const self: unknown = this;
    return self as EndNode;
  }

  public asStartNode(): StartNode {
    const self: unknown = this;
    return self as StartNode;
  }

  public asWildcardNode(): WildcardNode {
    const self: unknown = this;
    return self as WildcardNode;
  }

  public asAnythingNode(): AnythingNode {
    const self: unknown = this;
    return self as AnythingNode;
  }

  public asLoopGroup(): LoopGroup {
    const self: unknown = this;
    return self as LoopGroup;
  }

  public asSkipGroup(): SkipGroup {
    const self: unknown = this;
    return self as SkipGroup;
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
    // pass
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
      for (const elem of this.elements) {
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
      for (const child of this.elements) {
        child.setSelectedStateRecursive(selected);
      }
    }
  }

  public isVisibleParentSelected(): boolean {
    if (this.parent === null || this.parent.parent === null) {
      return false;
    }

    if (this.parent instanceof InvisibleSequenceGroup) {
      return this.parent.isVisibleParentSelected();
    }

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

    for (const elem of this.elements) {
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

  constructor(
    public elements: VariantElement[],
    performance: any = undefined,
    public id: number = undefined
  ) {
    super(performance);
  }

  public setExpanded(expanded: boolean) {
    super.setExpanded(expanded);

    for (const el of this.elements) {
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
    for (const el of this.elements) {
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
    this.height = Math.max(
      ...this.elements.map((el: VariantElement) => el.getHeight())
    );
    if (!(this.parent instanceof SkipGroup))
      this.height += this.getMarginY() * 2;
    return this.height;
  }

  public recalculateWidth(includeWaiting = false): number {
    this.elements.forEach((el) => (el.width = undefined));
    this.width = this.elements
      .filter((el) => !(el instanceof WaitingTimeNode) || includeWaiting)
      .map((el: VariantElement) => el.getWidth(includeWaiting))
      .reduce((a: number, b: number) => a + b);
    if (!(this.parent instanceof SkipGroup))
      this.width +=
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
    const children = this.elements.filter((c) => isElementWithActivity(c));

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

export class RepeatGroup extends VariantElement {
  public repeatCountMin: number = 1;
  public repeatCountMax: number = 200;

  public setRepeatCountMin(count: number) {
    this.repeatCountMin = count;
  }

  public getRepeatCountMin(): number {
    return this.repeatCountMin;
  }

  public setRepeatCountMax(count: number) {
    this.repeatCountMax = count;
  }

  public getRepeatCountMax(): number {
    return this.repeatCountMax;
  }

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

    for (const elem of this.elements) {
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

  constructor(
    public elements: VariantElement[],
    performance: any = undefined,
    public id: number = undefined
  ) {
    super(performance);
  }

  public asString(): string {
    return (
      'Re(' +
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

    for (const el of this.elements) {
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

  public copy(): RepeatGroup {
    const res = new RepeatGroup(this.elements.map((e) => e.copy()));
    res.parent = this.parent;
    res.expanded = this.expanded;
    res.repeatCountMin = this.repeatCountMin;
    res.repeatCountMax = this.repeatCountMax;
    return res;
  }

  public updateWidth(includeWaiting) {
    if (this.parent instanceof ParallelGroup) {
      for (const el of this.elements) {
        if (el instanceof ChoiceGroup) {
          el.width =
            this.width - VARIANT_Constants.MARGIN_X - 2 * this.getHeadLength();
        } else {
          el.width =
            this.width -
            2 * VARIANT_Constants.MARGIN_X -
            2 * this.getHeadLength();
        }
      }
    }

    for (const el of this.elements) {
      el.updateWidth(includeWaiting);
    }
  }

  public recalculateHeight(): number {
    this.elements.forEach((el) => (el.height = undefined));
    this.height = Math.max(
      ...this.elements.map((el: VariantElement) => el.getHeight())
    );
    if (!(this.parent instanceof SkipGroup))
      this.height += this.getMarginY() * 2;

    this.height +=
      2 * VARIANT_Constants.MARGIN_Y + 2 * VARIANT_Constants.FONT_SIZE_OPERATOR;

    return this.height;
  }

  public recalculateWidth(includeWaiting = false): number {
    this.elements.forEach((el) => (el.width = undefined));
    this.width = this.elements
      .filter((el) => !(el instanceof WaitingTimeNode) || includeWaiting)
      .map((el: VariantElement) => el.getWidth(includeWaiting))
      .reduce((a: number, b: number) => a + b);
    if (!(this.parent instanceof SkipGroup))
      this.width +=
        2 * this.getMarginX() +
        this.getHeadLength() -
        this.elements[0].getHeadLength();

    this.width += 2 * VARIANT_Constants.MARGIN_X;

    return this.width;
  }

  // Optional Group will be on top of Repeatable Group if both are selected
  public serialize(l = 1) {
    let parent = null;
    let filterElements = this.elements;
    if (this.elements.length > 1) {
      let parentSequence = new SequenceGroup(this.elements);
      filterElements = [parentSequence];
    }
    const elements = filterElements
      .map((e) => e.serialize(l))
      .flat()
      .filter((e) => e !== null);
    parent = {
      loop: elements,
      repeat_count_min: this.repeatCountMin,
      repeat_count_max: this.repeatCountMax,
    };
    return parent;
  }

  public updateSelectionAttributes(): void {
    updateSelectionAttributesForGroup(this);
  }

  public updateSurroundingSelectableElements(): void {
    const children = this.elements.filter((c) => isElementWithActivity(c));
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

export class OptionalGroup extends VariantElement {
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

    for (const elem of this.elements) {
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

  constructor(
    public elements: VariantElement[],
    performance: any = undefined,
    public id: number = undefined
  ) {
    super(performance);
  }

  public asString(): string {
    return (
      'Opt(' +
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

    for (const el of this.elements) {
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

  public copy(): OptionalGroup {
    const res = new OptionalGroup(this.elements.map((e) => e.copy()));
    res.parent = this.parent;
    res.expanded = this.expanded;
    return res;
  }

  public updateWidth(includeWaiting) {
    if (this.parent instanceof ParallelGroup) {
      for (const el of this.elements) {
        if (el instanceof ChoiceGroup) {
          el.width =
            this.width - VARIANT_Constants.MARGIN_X - 2 * this.getHeadLength();
        } else {
          el.width =
            this.width -
            2 * VARIANT_Constants.MARGIN_X -
            2 * this.getHeadLength();
        }
      }
    }

    for (const el of this.elements) {
      el.updateWidth(includeWaiting);
    }
  }

  public recalculateHeight(): number {
    this.elements.forEach((el) => (el.height = undefined));
    this.height = Math.max(
      ...this.elements.map((el: VariantElement) => el.getHeight())
    );
    if (!(this.parent instanceof SkipGroup))
      this.height += this.getMarginY() * 2;

    this.height +=
      2 * VARIANT_Constants.MARGIN_Y + 2 * VARIANT_Constants.FONT_SIZE_OPERATOR;
    return this.height;
  }

  public recalculateWidth(includeWaiting = false): number {
    this.elements.forEach((el) => (el.width = undefined));
    this.width = this.elements
      .filter((el) => !(el instanceof WaitingTimeNode) || includeWaiting)
      .map((el: VariantElement) => el.getWidth(includeWaiting))
      .reduce((a: number, b: number) => a + b);
    if (!(this.parent instanceof SkipGroup))
      this.width +=
        2 * this.getMarginX() +
        this.getHeadLength() -
        this.elements[0].getHeadLength();
    this.width += 2 * VARIANT_Constants.MARGIN_X;
    return this.width;
  }

  // Optional Group will be on top of Repeatable Group if both are selected
  public serialize(l = 1) {
    let parent = null;
    let filterElements = this.elements;
    if (this.elements.length > 1) {
      let parentSequence = new SequenceGroup(this.elements);
      filterElements = [parentSequence];
    }
    const elements = filterElements
      .map((e) => e.serialize(l))
      .flat()
      .filter((e) => e !== null);
    parent = { optional: elements };
    return parent;
  }

  public updateSelectionAttributes(): void {
    updateSelectionAttributesForGroup(this);
  }

  public updateSurroundingSelectableElements(): void {
    const children = this.elements.filter((c) => isElementWithActivity(c));
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

    for (const elem of this.elements) {
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

  constructor(
    public elements: VariantElement[],
    performance: any = undefined,
    public id: number = undefined
  ) {
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

    for (const el of this.elements) {
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
    const headLength = this.getHeadLength();
    for (const el of this.elements) {
      el.width = this.width - VARIANT_Constants.MARGIN_X - 2 * headLength;
    }

    for (const el of this.elements) {
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
    const headLength = this.getHeadLength();
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
    const children = this.elements.filter((c) => isElementWithActivity(c));
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

export class FallthroughGroup extends VariantElement {
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
      'x(' +
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

  public copy(): FallthroughGroup {
    const res = new FallthroughGroup(this.elements.map((e) => e.copy()));
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
      fallthrough: this.elements
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

export class ChoiceGroup extends VariantElement {
  public isCollapsed: boolean = false;

  public getCollapsed(): boolean {
    return this.isCollapsed;
  }

  public setCollapsed(collapsed: boolean) {
    this.isCollapsed = collapsed;
  }

  public toggleCollapsed() {
    this.isCollapsed = !this.isCollapsed;
  }

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
      'v(' +
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

  public copy(): ChoiceGroup {
    const res = new ChoiceGroup(this.elements.map((e) => e.copy()));
    res.parent = this.parent;
    res.expanded = this.expanded;
    return res;
  }

  public updateWidth(includeWaiting) {
    let numberOfElements = this.elements.length;
    if (this.isCollapsed) {
      numberOfElements = 1;
    }
    let headLength = this.getHeadLength();
    for (let el of this.elements) {
      el.width =
        this.width -
        VARIANT_Constants.MARGIN_X -
        2 * headLength -
        (2 *
          ((VARIANT_Constants.LEAF_HEIGHT + VARIANT_Constants.MARGIN_Y) *
            numberOfElements +
            VARIANT_Constants.MARGIN_Y)) /
          2.8;
    }

    for (let el of this.elements) {
      el.updateWidth(includeWaiting);
    }
  }

  public recalculateHeight(): number {
    if (this.isCollapsed) {
      this.height = this.elements[0].getHeight() + 2 * this.getMarginY();
      return this.height;
    }
    this.elements.forEach((el) => (el.height = undefined));
    this.height =
      this.elements
        .map((el: VariantElement) => el.getHeight() + this.getMarginY())
        .reduce((a: number, b: number) => a + b) + VARIANT_Constants.MARGIN_Y;
    return this.height;
  }

  public recalculateWidth(includeWaiting = false): number {
    let numberOfElements = this.elements.length;
    if (this.isCollapsed) {
      // For the collapsed view, we have to readjust
      numberOfElements = 1;
    }
    this.elements.forEach((el) => (el.width = undefined));
    let headLength = this.getHeadLength();
    this.width =
      Math.max(
        ...this.elements
          .filter((el) => !(el instanceof WaitingTimeNode) || includeWaiting)
          .map((el: VariantElement) => el.getWidth(includeWaiting))
      ) +
      VARIANT_Constants.MARGIN_X +
      2 * headLength +
      (2 *
        ((VARIANT_Constants.LEAF_HEIGHT + VARIANT_Constants.MARGIN_Y) *
          numberOfElements +
          VARIANT_Constants.MARGIN_Y)) /
        2.8;
    return this.width;
  }

  public serialize(l = 1) {
    return {
      choice: this.elements
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

  public deleteActivity(activityName: string): [VariantElement[], boolean] {
    const res = this.elements[0].deleteActivity(activityName);
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

    for (const el of this.elements) {
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
    const headLength = this.getHeadLength();
    for (const el of this.elements) {
      el.width = this.width - VARIANT_Constants.MARGIN_X - 2 * headLength;
    }

    for (const el of this.elements) {
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
    const children = this.elements.filter((c) => isElementWithActivity(c));
    children.forEach((c) => {
      if (!c.selected) {
        c.setInfixSelectableState(SelectableState.Selectable, false);
      } else {
        c.setInfixSelectableState(SelectableState.Unselectable, false);
      }
    });
  }
}

export class SkipGroup extends VariantElement {
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
    // TODO check if correct
    return [[], true];
  }

  public asString(): string {
    return 'skip(' + this.elements.map((v) => v.asString()).join(', ') + ')';
  }

  constructor(public elements: VariantElement[], performance: any = undefined) {
    super(performance);
  }

  public setExpanded(expanded: boolean) {
    super.setExpanded(expanded);

    for (const el of this.elements) {
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
    for (const el of this.elements) {
      el.updateWidth(includeWaiting);
    }
  }

  public copy(): SkipGroup {
    const res = new SkipGroup(this.elements.map((e) => e.copy()));
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
        .map((el: VariantElement) => {
          if (el instanceof SequenceGroup) {
            return el.elements
              .filter(
                (el) => !(el instanceof WaitingTimeNode) || includeWaiting
              )
              .map((el: VariantElement) => el.getWidth(includeWaiting))
              .reduce((a: number, b: number) => a + b);
          } else {
            return el.getWidth(includeWaiting);
          }
        })
        .reduce((a: number, b: number) => a + b) +
      2 * this.getMarginX() +
      this.getHeadLength() -
      this.elements[0].getHeadLength();
    this.width +=
      (this.elements.length - 1) *
      (VARIANT_Constants.SKIP_WIDTH + 2 * VARIANT_Constants.SKIP_MARGIN);
    return this.width;
  }

  public serialize(l = 1): any {
    return {
      skip: this.elements
        .map((e) => e.serialize(l))
        .flat()
        .filter((e) => e !== null),
    };
  }

  public updateSelectionAttributes(): void {
    updateSelectionAttributesForGroup(this);
  }

  public updateConformance(confValue: number): void {
    this.elements.forEach((el) => el.updateConformance(confValue));
  }
}

export class LeafNode extends VariantElement {
  constructor(
    public activity: string[],
    performance: any = undefined,
    public conformance: number[] = undefined,
    public id: number = undefined
  ) {
    super(performance);
  }

  public textLength = 10;

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

  public asString(): string {
    return this.activity.join(';');
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
      if (this.activity.length > 1) {
        this.width =
          VARIANT_Constants.LEAF_WIDTH_EXPANDED + 2 * this.getHeadLength();
      } else {
        this.width = VARIANT_Constants.LEAF_WIDTH_EXPANDED;
      }
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
    //this.width += VARIANT_Constants.MARGIN_X;
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

    for (const child of this.elements) {
      if (isElementWithActivity(child)) {
        child.setInfixSelectableState(state, recursive);
      }
    }
  }

  public updateWidth(includeWaiting = false) {
    const waiting = includeWaiting ? 1 : 0;
    const waitingLengths = this.elements
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

export class StartNode extends VariantElement {
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
    if (this.width) {
      return this.width;
    }
    this.width = VARIANT_Constants.LEAF_WIDTH_EXPANDED;
    this.width += VARIANT_Constants.MARGIN_X;

    this.width = Math.max(
      this.width * 0.75 + this.getHeadLength() * 2,
      this.width - this.getHeadLength() * 2
    );

    return this.width;
  }

  public recalculateWidth(includeWaiting: any): number {
    if (this.expanded) {
      this.width = VARIANT_Constants.LEAF_WIDTH_EXPANDED;
    } else {
      this.width = VARIANT_Constants.LEAF_WIDTH;
    }
    //this.width += VARIANT_Constants.MARGIN_X;
    return this.width;
  }

  public recalculateHeight(includeWaiting: any): number {
    return VARIANT_Constants.LEAF_HEIGHT;
  }

  public updateWidth(includeWaiting: any) {}

  public serialize(l = 1): Object {
    return { start: true };
  }

  public copy(): StartNode {
    const res = new StartNode();
    res.expanded = this.expanded;
    return res;
  }
}

export class EndNode extends VariantElement {
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
    if (this.width) {
      return this.width;
    }
    this.width = VARIANT_Constants.LEAF_WIDTH_EXPANDED;
    this.width += VARIANT_Constants.MARGIN_X;

    this.width = Math.max(
      this.width * 0.75 + this.getHeadLength() * 2,
      this.width - this.getHeadLength() * 2
    );

    return this.width;
  }

  public recalculateWidth(includeWaiting: any): number {
    if (this.expanded) {
      this.width = VARIANT_Constants.LEAF_WIDTH_EXPANDED;
    } else {
      this.width = VARIANT_Constants.LEAF_WIDTH;
    }
    //this.width += VARIANT_Constants.MARGIN_X;
    return this.width;
  }

  public recalculateHeight(includeWaiting: any): number {
    return VARIANT_Constants.LEAF_HEIGHT;
  }

  public updateWidth(includeWaiting: any) {}

  public serialize(l = 1): Object {
    return { end: true };
  }

  public copy(): EndNode {
    const res = new EndNode();
    res.expanded = this.expanded;
    return res;
  }
}

export class AnythingNode extends VariantElement {
  public activity: string[];

  constructor(
    performance: any = undefined,
    public conformance: number[] = undefined,
    public id: number = undefined
  ) {
    super(performance);
    this.activity = ['...'];
  }

  public textLength = 10;

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

  public asString(): string {
    return this.activity.join(';');
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
      if (this.activity.length > 1) {
        this.width =
          VARIANT_Constants.LEAF_WIDTH_EXPANDED + 2 * this.getHeadLength();
      } else {
        this.width = VARIANT_Constants.LEAF_WIDTH_EXPANDED;
      }
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

  public copy(): AnythingNode {
    const res = new AnythingNode([...this.activity]);
    res.expanded = this.expanded;
    return res;
  }

  public recalculateWidth(): number {
    if (this.expanded) {
      this.width = VARIANT_Constants.LEAF_WIDTH_EXPANDED;
    } else {
      this.width = VARIANT_Constants.LEAF_WIDTH;
    }
    //this.width += VARIANT_Constants.MARGIN_X;
    return this.width;
  }

  public serialize(l = 1) {
    return { anything: true };
  }

  public updateSelectionAttributes(): void {
    // pass
  }

  public updateConformance(confValue: number): void {
    this.conformance = new Array(this.activity.length).fill(confValue);
  }
}

export class WildcardNode extends VariantElement {
  public activity: string[];

  constructor(
    performance: any = undefined,
    public conformance: number[] = undefined,
    public id: number = undefined
  ) {
    super(performance);
    this.activity = ['WILDCARD'];
  }

  public textLength = 10;

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

  public asString(): string {
    return this.activity.join(';');
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
      if (this.activity.length > 1) {
        this.width =
          VARIANT_Constants.LEAF_WIDTH_EXPANDED + 2 * this.getHeadLength();
      } else {
        this.width = VARIANT_Constants.LEAF_WIDTH_EXPANDED;
      }
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

  public copy(): WildcardNode {
    const res = new WildcardNode([...this.activity]);
    res.expanded = this.expanded;
    return res;
  }

  public recalculateWidth(): number {
    if (this.expanded) {
      this.width = VARIANT_Constants.LEAF_WIDTH_EXPANDED;
    } else {
      this.width = VARIANT_Constants.LEAF_WIDTH;
    }
    //this.width += VARIANT_Constants.MARGIN_X;
    return this.width;
  }

  public serialize(l = 1) {
    return { wildcard: true };
  }

  public updateSelectionAttributes(): void {
    // pass
  }

  public updateConformance(confValue: number): void {
    this.conformance = new Array(this.activity.length).fill(confValue);
  }
}

export function deserialize(obj: any): VariantElement {
  if ('follows' in obj) {
    return new SequenceGroup(
      obj.follows.map((e: any) => deserialize(e)).filter((e) => e),
      obj.performance,
      obj.id
    );
  } else if ('parallel' in obj) {
    return new ParallelGroup(
      obj.parallel.map((e: any) => deserialize(e)).filter((e) => e),
      obj.performance,
      obj.id
    );
  } else if ('choice' in obj) {
    return new ChoiceGroup(
      obj.choice.map((e: any) => deserialize(e)).filter((e) => e),
      obj.performance
    );
  } else if ('fallthrough' in obj) {
    return new FallthroughGroup(
      obj.fallthrough.map((e: any) => deserialize(e)).filter((e) => e),
      obj.performance
    );
  } else if ('leaf' in obj) {
    return new LeafNode(
      obj.leaf.map((el) => {
        return typeof el === 'string' ? el : el[0];
      }),
      obj.performance,
      obj.leaf.map((el) => {
        return typeof el === 'string' ? undefined : el[1];
      }),
      obj.id
    );
  } else if ('loop' in obj) {
    return new LoopGroup(
      obj.loop.map((e: any) => deserialize(e)),
      obj.performance
    );
  } else if ('skip' in obj) {
    return new SkipGroup(
      obj.skip.map((e: any) => deserialize(e)),
      obj.performance
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
      const v = variant.asSequenceGroup().elements[i];

      if (v.waitingTime?.mean !== undefined) {
        const wait = new WaitingTimeNode(v.waitingTime);
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
      const v = variant.asParallelGroup().elements[i];
      const waitGroup = [v];
      if (v.waitingTimeStart?.mean !== undefined) {
        const wait = new WaitingTimeNode(v.waitingTimeStart);
        waitGroup.splice(0, 0, wait);
      }

      if (v.waitingTimeEnd?.mean !== undefined) {
        const wait = new WaitingTimeNode(v.waitingTimeEnd);
        waitGroup.splice(waitGroup.length, 0, wait);
      }
      variant.elements[i] = new InvisibleSequenceGroup(waitGroup);
    }
  }
}

export type GroupsWithChildElements =
  | ParallelGroup
  | ChoiceGroup
  | FallthroughGroup
  | SequenceGroup
  | LoopGroup
  | SkipGroup;
