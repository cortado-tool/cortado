import {
  ProcessTree,
  ProcessTreeOperator,
} from 'src/app/objects/ProcessTree/ProcessTree';

export function checkForLoadedTreeIntegrity(
  tree: ProcessTree,
  activities: string[]
): Set<string> {
  let unknownActivities = new Set<string>();

  if (tree === null) {
    return unknownActivities;
  }

  for (let subtree of tree.children) {
    // If it is a operator, recurse on the children
    if (!subtree.label) {
      unknownActivities = new Set<string>([
        ...unknownActivities,
        ...checkForLoadedTreeIntegrity(subtree, activities),
      ]);

      // If it is a leaf with unkown label add it to the set
    } else if (
      !(
        activities.indexOf(subtree.label) > -1 ||
        subtree.label === ProcessTreeOperator.tau
      )
    ) {
      unknownActivities.add(subtree.label);

      // Else continue
    }
  }

  return unknownActivities;
}

export function processTreesEqual(pt1: ProcessTree, pt2: ProcessTree): boolean {
  if (!pt1 || !pt2) {
    return false;
  }
  if (
    pt1['operator'] === pt2['operator'] &&
    pt1['label'] === pt2['label'] &&
    pt1['children'].length === pt2['children'].length
  ) {
    if (pt1['children'].length === 0) {
      return true;
    } else {
      let res = true;
      for (let i = 0; i < pt1['children'].length; i++) {
        res = res && processTreesEqual(pt1['children'][i], pt2['children'][i]);
      }
      return res;
    }
  } else {
    return false;
  }
}
