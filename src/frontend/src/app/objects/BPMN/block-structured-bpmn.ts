import { BPMN_Constant } from 'src/app/constants/bpmn_model_drawer_constants';
import { ProcessTree, ProcessTreeOperator } from '../ProcessTree/ProcessTree';

export abstract class Block_Structured_BPMN {
  private _members: Array<Block_Structured_BPMN>;
  private _width: number;
  private _height: number;

  _pt: ProcessTree;

  constructor(members: Array<Block_Structured_BPMN> = null, pt: ProcessTree) {
    this._members = members;
    this._pt = pt;
  }

  public get members(): Array<Block_Structured_BPMN> {
    return this._members;
  }
  public set members(value: Array<Block_Structured_BPMN>) {
    this._members = value;
  }

  public get width(): number {
    return this._width;
  }
  public set width(value: number) {
    this._width = value;
  }

  public get height(): number {
    return this._height;
  }
  public set height(value: number) {
    this._height = value;
  }

  abstract recalculateHeight();
  abstract recalculateWidth();
}

export class LoopBlock extends Block_Structured_BPMN {
  core_width;

  constructor(members: Array<Block_Structured_BPMN>, pt: ProcessTree) {
    super(members, pt);
    this.width = this.recalculateWidth();
    this.height = this.recalculateHeight();
  }

  public recalculateHeight(): number {
    return compute_height_vertical_group(this);
  }

  public recalculateWidth(): number {
    return compute_width_vertical_group(this);
  }
}

export class ChoiceBlock extends Block_Structured_BPMN {
  core_width;

  constructor(members: Array<Block_Structured_BPMN>, pt: ProcessTree) {
    super(members, pt);
    this.width = this.recalculateWidth();
    this.height = this.recalculateHeight();
  }

  public recalculateHeight(): number {
    return compute_height_vertical_group(this);
  }

  public recalculateWidth(): number {
    return compute_width_vertical_group(this);
  }
}

export class ParallelBlock extends Block_Structured_BPMN {
  core_width;

  constructor(members: Array<Block_Structured_BPMN>, pt: ProcessTree) {
    super(members, pt);
    this.width = this.recalculateWidth();
    this.height = this.recalculateHeight();
  }

  public recalculateHeight(): number {
    return compute_height_vertical_group(this);
  }

  public recalculateWidth(): number {
    return compute_width_vertical_group(this);
  }
}

export class SequenceBlock extends Block_Structured_BPMN {
  constructor(members: Array<Block_Structured_BPMN>, pt: ProcessTree) {
    super(members, pt);
    this.width = this.recalculateWidth();
    this.height = this.recalculateHeight();
  }

  public recalculateHeight(): number {
    if (this.members.length > 0) {
      this.height = Math.max(
        ...this.members.map((block: Block_Structured_BPMN) => block.height)
      );
    } else {
      this.height = BPMN_Constant.EVENT_HEIGHT;
    }

    return this.height;
  }

  public recalculateWidth(): number {
    if (this.members.length > 0) {
      this.width = this.members
        .map((block: Block_Structured_BPMN) => block.width)
        .reduce((a: number, b: number) => a + b);

      if (this.members.length > 1) {
        this.width +=
          (this.members.length - 1) * BPMN_Constant.HORIZONTALSPACING;
      }
    } else {
      this.width = 2 * BPMN_Constant.HORIZONTALSPACING;
    }

    return this.width;
  }
}

export class Event extends Block_Structured_BPMN {
  private _eventName: string;

  constructor(
    eventName: string,
    pt: ProcessTree,
    blockWidthCache: Map<string, number>
  ) {
    super(null, pt);
    this._eventName = eventName;
    this.width = this.recalculateWidth(blockWidthCache);
    this.height = this.recalculateHeight();
  }

  public get eventName(): string {
    return this._eventName;
  }

  public set eventName(value: string) {
    this._eventName = value;
  }

  recalculateHeight() {
    this.height = BPMN_Constant.EVENT_HEIGHT;
    return this.height;
  }

  recalculateWidth(blockWidthCache: Map<string, number> = null) {
    if (this.eventName === ProcessTreeOperator.tau) {
      this.width = BPMN_Constant.BASE_HEIGHT_WIDTH;
    } else {
      const width = blockWidthCache[this.eventName];

      this.width = width ? width : BPMN_Constant.EVENT_WIDTH;
    }

    return this.width;
  }
}

export function convertPTtoBlockstructuredBPMN(
  pt: ProcessTree,
  blockWidthCache: Map<string, number> = null
): Block_Structured_BPMN {
  let block: Block_Structured_BPMN;

  if (!pt) {
    return new Event(ProcessTreeOperator.tau, pt, blockWidthCache);
  }

  if (pt.operator) {
    const members = pt.children.map((c) =>
      convertPTtoBlockstructuredBPMN(c, blockWidthCache)
    );

    switch (pt.operator) {
      case ProcessTreeOperator.choice: {
        block = new ChoiceBlock(members, pt);
        break;
      }
      case ProcessTreeOperator.loop: {
        block = new LoopBlock(members, pt);
        break;
      }
      case ProcessTreeOperator.sequence: {
        block = new SequenceBlock(members, pt);
        break;
      }
      case ProcessTreeOperator.parallelism: {
        block = new ParallelBlock(members, pt);
        break;
      }
      default: {
        console.warn('ERROR NOT A KNOWN OPERATOR');
      }
    }
  } else {
    block = pt.label
      ? new Event(pt.label, pt, blockWidthCache)
      : new Event(ProcessTreeOperator.tau, pt, blockWidthCache);
  }

  return block;
}

function compute_height_vertical_group(model: any): number {
  if (model.members.length > 0) {
    model.height = model.members
      .map((block: Block_Structured_BPMN) => block.height)
      .reduce((a: number, b: number) => a + b);

    if (model.members.length > 1) {
      model.height +=
        (model.members.length - 1) * BPMN_Constant.VERTICALSPACING;
    }
  } else {
    model.height = BPMN_Constant.EVENT_HEIGHT;
  }

  return model.height;
}

function compute_width_vertical_group(model: any): number {
  if (model.members.length > 0) {
    model.width = Math.max(
      ...model.members.map((block: Block_Structured_BPMN) => block.width)
    );
  } else {
    model.width = 0;
  }

  model.core_width = model.width;

  model.width += 2 * BPMN_Constant.HORIZONTALSPACING;

  model.width += 4 * BPMN_Constant.OPERATOR_DIAGONAL_LENGTH;

  return model.width;
}
