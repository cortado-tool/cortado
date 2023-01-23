import { ProcessTree } from 'src/app/objects/ProcessTree/ProcessTree';

export function renameProcessTreeLeafs(
  tree: ProcessTree,
  activityName: string,
  newActivityName: string
): ProcessTree {
  if (tree.label && tree.label === activityName) {
    tree.label = newActivityName;
  } else {
    tree.children.forEach((c) =>
      renameProcessTreeLeafs(c, activityName, newActivityName)
    );
  }

  return tree;
}

export function getSetOfActivitiesInProcessTree(
  tree: ProcessTree
): Set<string> {
  if (tree) {
    let res: Set<string> = new Set();
    if (tree.children && tree.children.length > 0) {
      tree.children.forEach((c) => {
        res = new Set([...res, ...getSetOfActivitiesInProcessTree(c)]);
      });
    } else if (tree.label) {
      res.add(tree.label);
    }
    return res;
  } else {
    return new Set();
  }
}
