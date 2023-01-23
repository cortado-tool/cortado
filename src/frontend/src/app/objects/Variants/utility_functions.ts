import {
  LeafNode,
  VariantElement,
} from 'src/app/objects/Variants/variant_element';

export function findPathToSelectedNode(
  start: VariantElement,
  end
): Array<VariantElement> {
  const path = searchPath(start, end);

  function searchPath(parent: VariantElement, element): Array<VariantElement> {
    if (parent.getElements().indexOf(element) > -1) {
      return [parent, element];
    } else if (!(parent instanceof LeafNode)) {
      for (let child of parent.getElements()) {
        if (!(child instanceof LeafNode)) {
          const res = searchPath(child, element);

          if (res.length > 0) {
            return [parent].concat(res);
          }
        }
      }
    }

    return [];
  }

  return path;
}
