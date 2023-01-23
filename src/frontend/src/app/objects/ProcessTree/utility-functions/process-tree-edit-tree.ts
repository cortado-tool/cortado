import {
  ProcessTree,
  ProcessTreeOperator,
} from 'src/app/objects/ProcessTree/ProcessTree';

export function delete_subtree(tree: ProcessTree, tree_to_delete: ProcessTree) {
  if (tree === tree_to_delete) {
    return;
  } else {
    if (tree.children) {
      let child_list: Array<ProcessTree> = [];

      for (let child of tree.children) {
        let res = delete_subtree(child, tree_to_delete);

        if (res) {
          child_list.push(res);
        }
      }

      tree.children = child_list;
    }
  }

  return tree;
}

export function createNewRandomNode(
  label: string,
  operator: ProcessTreeOperator,
  id: number = Math.floor(1000000000 + Math.random() * 900000000)
): ProcessTree {
  return new ProcessTree(label, operator, [], id, false, null, null, null);
}

export function insertNode(
  selectedNode: ProcessTree,
  newNode: ProcessTree,
  strat: NodeInsertionStrategy,
  operator: ProcessTreeOperator,
  label: string
) {
  switch (strat) {
    case NodeInsertionStrategy.BELOW: {
      selectedNode.children.push(newNode);
      newNode.parent = selectedNode;
      break;
    }

    case NodeInsertionStrategy.ABOVE: {
      newNode.children = [selectedNode];
      selectedNode.parent = newNode;
      break;
    }

    case NodeInsertionStrategy.LEFT: {
      const idx: number = selectedNode.parent.children.indexOf(selectedNode);
      selectedNode.parent.children.splice(idx, 0, newNode);
      newNode.parent = selectedNode.parent;
      break;
    }

    case NodeInsertionStrategy.RIGHT: {
      const idx: number = selectedNode.parent.children.indexOf(selectedNode);
      selectedNode.parent.children.splice(idx + 1, 0, newNode);
      newNode.parent = selectedNode.parent;
      break;
    }

    case NodeInsertionStrategy.CHANGE: {
      if (operator) {
        selectedNode.operator = operator;
        selectedNode.label = null;
      } else if (label) {
        selectedNode.label = label;
        selectedNode.operator = null;
      }
      break;
    }
  }
}

export enum NodeSeletionStrategy {
  NODE = 'Node',
  TREE = 'Tree',
}

export enum NodeInsertionStrategy {
  LEFT = 'Left',
  RIGHT = 'Right',
  ABOVE = 'Above',
  BELOW = 'Below',
  CHANGE = 'Change',
}
