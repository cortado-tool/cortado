import { ProcessTree } from 'src/app/objects/ProcessTree/ProcessTree';

export function markNodeAsFrozen(node: ProcessTree) {
  node.frozen = true;
  if (node.children) {
    node.children.forEach((child) => {
      markNodeAsFrozen(child);
    });
  }
}

export function markNodeAsNonFrozen(node: ProcessTree) {
  node.frozen = false;

  if (node.parent && node.parent.frozen) {
    markNodeAsNonFrozen(node.parent);
    return;
  }
  if (node.children) {
    node.children.forEach((child) => {
      markNodeAsNonFrozen(child);
    });
  }
}
