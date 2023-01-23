import { InfixType, setParent } from 'src/app/objects/Variants/infix_selection';
import { Variant } from 'src/app/objects/Variants/variant';
import * as objectHash from 'object-hash';

export function compute_delete_activity_variants(
  activityName: string,
  cur_variants: Variant[]
): [Variant[], any[], any[], any[], any[]] {
  const fallthrough = [];
  const updateMap: Map<string, Variant[]> = new Map<string, Variant[]>();
  const changedStrings: Set<string> = new Set<string>();
  const delete_list = [];

  for (let variant of cur_variants) {
    let tmp;

    if (variant.variant.getActivities().has(activityName)) {
      const [variantElements, isFallthrough] =
        variant.variant.deleteActivity(activityName);

      if (isFallthrough) {
        fallthrough.push(variant.bid);
        continue;
      }

      if (variantElements) {
        tmp = variantElements[0].asString();
        changedStrings.add(tmp);

        if (updateMap.has(tmp)) {
          updateMap.get(tmp).push(variant);
        } else {
          updateMap.set(tmp, [variant]);
        }
      } else {
        delete_list.push(variant);
      }
    } else {
      tmp = variant.variant.asString();

      if (updateMap.has(tmp)) {
        updateMap.get(tmp).push(variant);
      } else {
        updateMap.set(tmp, [variant]);
      }
    }
  }

  const variants = apply_update_map(updateMap);

  let delete_member_list = [];
  let merge_list = [];

  for (let change of changedStrings) {
    if (updateMap.get(change).length == 1) {
      delete_member_list.push(updateMap.get(change)[0].bid);
    } else {
      merge_list.push(
        updateMap.get(change).map((v) => {
          return v.bid;
        })
      );
    }
  }

  return [variants, fallthrough, delete_member_list, merge_list, delete_list];
}

export function apply_update_map(updateMap: Map<string, Variant[]>): Variant[] {
  const variants: Variant[] = [];

  for (let [key, ls] of updateMap.entries()) {
    if (ls.length > 1) {
      let count = 0;
      let bids = [];
      let selected = false;
      let userAdded = false;

      for (let variant of ls) {
        bids.push(variant.bid);
        count += variant.count;
        selected = selected || variant.isSelected;
        userAdded = userAdded || variant.isAddedFittingVariant;
      }

      const variant: Variant = new Variant(
        count,
        ls[0].variant,
        selected,
        true,
        userAdded,
        0,
        false,
        false,
        false,
        true,
        0,
        InfixType.NOT_AN_INFIX
      );
      variant.bid = Math.min(...bids);
      variant.id = objectHash(ls[0].variant);

      variants.push(variant);
    } else {
      variants.push(ls[0]);
    }
  }

  return variants;
}

export function compute_rename_activity_variants(
  activityName: string,
  newActivityName: string,
  cur_variants: Variant[]
): [Variant[], any[], any[], Map<string, Variant[]>] {
  const updateMap: Map<string, Variant[]> = new Map<string, Variant[]>();
  const changedStrings: Set<string> = new Set<string>();

  for (let variant of cur_variants) {
    let change: boolean = false;

    if (variant.variant.getActivities().has(activityName)) {
      variant.variant.renameActivity(activityName, newActivityName);

      change = true;
    }

    const tmp = variant.variant.asString();

    if (updateMap.has(tmp)) {
      updateMap.get(tmp).push(variant);
    } else {
      updateMap.set(tmp, [variant]);
    }

    if (change) {
      changedStrings.add(tmp);
    }
  }

  const variants = apply_update_map(updateMap);

  let rename_list = [];
  let merge_list = [];

  for (let change of changedStrings) {
    if (updateMap.get(change).length == 1) {
      rename_list.push(updateMap.get(change)[0].bid);
    } else {
      merge_list.push(
        updateMap.get(change).map((v) => {
          return v.bid;
        })
      );
    }
  }

  return [variants, rename_list, merge_list, updateMap];
}

export function addVariantInformation(variants: Variant[]): Variant[] {
  variants.forEach((v, i) => {
    v.isConformanceOutdated = true;
    v.isTimeouted = false;
    v.isSelected = false;
    v.isDisplayed = true;
    v.isAddedFittingVariant = false;
    v.infixType = v.infixType;
    setParent(v.variant);
  });

  return variants;
}
