import { Variant } from './variant';
import {
  InvisibleSequenceGroup,
  LeafNode,
  ParallelGroup,
  SequenceGroup,
  VariantElement,
  WaitingTimeNode,
} from './variant_element';

export enum SelectableState {
  Selectable = 0,
  Unselectable = 1,
  None = 2,
}

export enum InfixType {
  PROPER_INFIX = 1,
  PREFIX = 2,
  POSTFIX = 3,
  NOT_AN_INFIX = 4,
}

export const isElementWithActivity = (elem: VariantElement) => {
  return (
    elem instanceof ParallelGroup ||
    elem instanceof SequenceGroup ||
    elem instanceof LeafNode
  );
};

const areAllChildrenSelected = (elem: VariantElement) => {
  if (elem instanceof LeafNode) {
    return elem.selected;
  }

  if (elem instanceof ParallelGroup || elem instanceof SequenceGroup) {
    for (let e of elem.elements) {
      if (!isElementWithActivity(e)) {
        continue;
      }
      if (!e.selected) {
        return false;
      }
    }

    return true;
  } else {
    // Waiting Time Node, etc...
    return true;
  }
};

export const someChildrenSelected = (elem: VariantElement) => {
  if (elem instanceof LeafNode) {
    return elem.selected;
  } else if (elem instanceof ParallelGroup || elem instanceof SequenceGroup) {
    for (let child of elem.elements) {
      if (!isElementWithActivity(child)) {
        continue;
      }
      if (someChildrenSelected(child)) {
        return true;
      }
    }

    return false;
  } else {
    // Waiting Time Node, etc...
    return false;
  }
};

export const updateSelectionAttributesForGroup = (group: any) => {
  updateSelectedAttributesForGroup(group);
  updateSelectableAttributesForGroup(group);
};

const updateSelectedAttributesForGroup = (group: any) => {
  let children = group.elements.filter((c) => isElementWithActivity(c));
  group.isAnyInfixSelected = false;

  for (let child of children) {
    if (!(child instanceof LeafNode)) {
      updateSelectedAttributesForGroup(child);
    } else {
      if (child.selected) {
        group.setRootAnyInfixSelected(true);
      }
    }
  }

  group.selected = areAllChildrenSelected(group);
};

const updateSelectableAttributesForGroup = (group: any) => {
  let children = group.elements.filter((c) => isElementWithActivity(c));

  let nothingIsSelected = !someChildrenSelected(group);

  if (nothingIsSelected) {
    group.setInfixSelectableState(SelectableState.Selectable, true);
    return;
  }

  // initialize all elements with not selectable state
  for (let child of children) {
    child.setInfixSelectableState(SelectableState.None, true);
  }

  // First, check if a child is only partly selected
  // If yes, set all other children to be not selectable and call this function on that child
  for (let child of children) {
    let childIsCompletelySelected: boolean = child.selected;
    if (childIsCompletelySelected || !someChildrenSelected(child)) {
      continue;
    }

    if (someChildrenSelected(child)) {
      child.setInfixSelectableState(SelectableState.Selectable);
      updateSelectableAttributesForGroup(child);
      return;
    }
  }

  group.updateSurroundingSelectableElements();
};

export const setParent = (root: VariantElement) => {
  if (root instanceof ParallelGroup || root instanceof SequenceGroup) {
    for (let child of root.elements) {
      child['parent'] = root;
      setParent(child);
    }
  }
};

export const getLowestSelectionActionableElement = (elem: VariantElement) => {
  if (
    elem.infixSelectableState !== SelectableState.None ||
    elem.parent == null
  ) {
    // Selectable or unselectable or root
    return elem;
  } else {
    return getLowestSelectionActionableElement(elem.parent);
  }
};

export const getSelectedChildren = (elem: VariantElement) => {
  if (elem instanceof LeafNode && elem.selected) {
    let ret = elem.copy();
    ret.selected = false;
    ret.infixSelectableState = SelectableState.Selectable;
    return ret;
  } else if (elem instanceof SequenceGroup || elem instanceof ParallelGroup) {
    let copyElem;
    if (elem instanceof SequenceGroup) {
      copyElem = new SequenceGroup([]);
    } else if (elem instanceof ParallelGroup) {
      copyElem = new ParallelGroup([]);
    }
    copyElem.selected = false;
    copyElem.infixSelectableState = SelectableState.Selectable;

    for (let child of elem.elements) {
      if (!(child instanceof WaitingTimeNode) && someChildrenSelected(child)) {
        let newPushedChild;
        if (!(child instanceof InvisibleSequenceGroup)) {
          newPushedChild = child;
        } else {
          newPushedChild = child.elements[1]; // InvisibleSequenceGroup has one leaf child at this position
        }
        copyElem.elements.push(getSelectedChildren(newPushedChild));
      }
    }
    setParent(copyElem);
    return copyElem;
  }
};

// Sometimes selecting trace infix creates variant elements with only one child on many tree levels
// The following function fixes the problem by reducing tree levels
export const removeIntermediateGroupsWithSingleElements = (
  elem: VariantElement
) => {
  if (elem instanceof LeafNode) {
    return elem;
  } else if (elem instanceof SequenceGroup || elem instanceof ParallelGroup) {
    if (elem.elements.length == 1) {
      let onlyChild = removeIntermediateGroupsWithSingleElements(
        elem.elements[0]
      );
      return onlyChild;
    } else {
      let newChildren = elem.elements.map(
        removeIntermediateGroupsWithSingleElements
      );
      elem.setElements(newChildren);
      return elem;
    }
  }
};

export const getInfixTypeForSelectedInfix = (variant: Variant) => {
  let children = variant.variant.getElements();
  if (
    children[0].selected &&
    (variant.infixType === InfixType.NOT_AN_INFIX ||
      variant.infixType === InfixType.PREFIX)
  ) {
    return InfixType.PREFIX;
  }

  if (
    children[children.length - 1].selected &&
    (variant.infixType === InfixType.NOT_AN_INFIX ||
      variant.infixType === InfixType.POSTFIX)
  ) {
    return InfixType.POSTFIX;
  }

  return InfixType.PROPER_INFIX;
};
