import { ProcessTree } from '../ProcessTree/ProcessTree';
import { InfixType } from './infix_selection';
import { VariantElement } from './variant_element';

export interface IVariant {
  id: string;
  bid: number; //Positive Numbers indicate Log Variants, Negative Number User Variants
  count: number;
  length: number;
  number_of_activities: number;
  variant: VariantElement;
  isSelected: boolean;
  isDisplayed: boolean;
  isAddedFittingVariant: boolean;
  percentage: number;
  calculationInProgress: boolean | undefined;
  userDefined: boolean;
  alignment: VariantElement | undefined;
  deviations: number | undefined;
  isTimeouted: boolean;
  isConformanceOutdated: boolean;
  usedTreeForConformanceChecking: ProcessTree;
  nSubVariants: number;
  infixType: InfixType;
  fragmentStatistics: any;
  collapsedVariantId: string;
}
