import { LogService } from 'src/app/services/logService/log.service';
import { ProcessTreeService } from './../../../services/processTreeService/process-tree.service';
import { BackendService } from 'src/app/services/backendService/backend.service';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  FormGroup,
} from '@angular/forms';
import {
  fadeInOutComponent,
  openCloseComponent,
} from 'src/app/animations/component-animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-expert-mode',
  templateUrl: './expert-mode.component.html',
  styleUrls: ['./expert-mode.component.scss'],
  animations: [fadeInOutComponent, openCloseComponent],
})
export class ExpertModeComponent implements OnInit, OnDestroy {
  syntax_tree_string: string = '';
  syntaxTreeInput: any;
  edit: boolean = true;
  allowRender: boolean = true;
  activityNameRegEx = new RegExp("'([^']*)'", 'g');
  backendErrorMessage: string;
  styled_tree_string: string = null;
  editorActive: boolean = false;

  imbalancedItems: Array<imbalancedItem>;

  @ViewChild('expertModeButton') expertModeButton: ElementRef;
  @ViewChild('textEditor') textEditor: ElementRef<HTMLDivElement>;

  currentlyDisplayedTreeInExpertMode;

  private _destroy$ = new Subject();

  constructor(
    private logService: LogService,
    private backendService: BackendService,
    private processTreeService: ProcessTreeService
  ) {}

  ngOnInit() {
    this.syntaxTreeInput = new FormGroup({
      syntax_tree: new FormControl('', {
        validators: [
          this.balancedParenthesisValidator(),
          this.unknownActivityNameValidator(),
          this.balancedApostropheValidator(),
        ],
        updateOn: 'change',
      }),
    });

    /* Handling the styling as the input changes, currently problematic due to issues with input cursor tracking

    this.syntax_tree.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    ).subscribe(res => {
                        res = this.strip_html(res);
                        this.syntax_tree.setValue(res, {emitEvent : false});
    })
    */

    // If the tree changes and expert mode is open, compute the syntax tree string
    this.processTreeService.currentDisplayedProcessTree$
      .pipe(takeUntil(this._destroy$))
      .subscribe((tree) => {
        this.collectCurrentTreeString(tree);
        this.backendErrorMessage = null;
      });

    this.processTreeService.currentTreeString$
      .pipe(takeUntil(this._destroy$))
      .subscribe((treeString) => {
        this.syntax_tree.setValue(treeString);
        this.highlightText();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  // Preconducts expert mode specific highlighting and passes the tree-string down to the tree-string-renderer-component
  highlightText() {
    this.styled_tree_string = this.highlightImbalancedParenthesis(
      this.syntax_tree.value
    );
  }

  toggleEditor(edit: boolean) {
    this.edit = edit;
    if (!edit) this.highlightText();
  }

  highlightImbalancedParenthesis(value: any) {
    let runningOffset = 0;

    if (this.imbalancedItems && this.imbalancedItems.length > 0) {
      this.imbalancedItems.sort((a, b) => a.index - b.index);

      for (let imbalancedItem of this.imbalancedItems) {
        const highlightedPara =
          '<span class="imbalanced-parenthesis">' +
          imbalancedItem.symbol +
          '</span>';
        value =
          value.slice(0, imbalancedItem.index + runningOffset) +
          highlightedPara +
          value.slice(imbalancedItem.index + runningOffset + 1, value.length);
        runningOffset += highlightedPara.length - 1;
      }
    }

    return value;
  }

  strip_html(value: any): string {
    const regex = new RegExp('<[^>]*>', 'g');
    value = value.replaceAll(regex, '');
    return value;
  }

  onSubmit() {
    this.allowRender = false;
    let treeString = this.syntax_tree.value;
    treeString = this.strip_html(treeString);

    const $pendingTreeParse = this.backendService.renderStringToPT(treeString);

    $pendingTreeParse
      .pipe(takeUntil(this._destroy$))
      .subscribe((result: any) => {
        if (!result.errors) {
          console.warn('Expert Mode Tree Update');
          this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
            result.tree
          );
          this.backendErrorMessage = null;
        } else {
          this.backendErrorMessage = result.errors;
          this.syntax_tree.markAsPristine();
        }
        this.allowRender = true;
      });
  }

  replaceRichTextPlaceholderChars(treeString: string): string {
    const richTextChar = new RegExp('&[\\w]+;', 'g');

    // Replace the &gt with >
    treeString = treeString.replace('&gt;', '>');

    // Remove all the unknown richTextChars
    treeString = treeString.replace(richTextChar, '');
    return treeString;
  }

  get syntax_tree(): FormControl {
    return this.syntaxTreeInput.get('syntax_tree')!;
  }

  toggleExpertMode() {
    this.editorActive = !this.editorActive;
    if (this.editorActive) {
      this.collectCurrentTreeString(
        this.processTreeService.currentDisplayedProcessTree
      );
    }
  }

  // If expert mode is open, compute the syntax tree string
  private collectCurrentTreeString(tree) {
    // Check if tree exists, if the expert mode is active and if it did change
    if (tree && tree !== this.currentlyDisplayedTreeInExpertMode) {
      this.backendService.computeTreeString(tree);
      this.currentlyDisplayedTreeInExpertMode = tree;
      this.edit = false;
    }
  }

  balancedParenthesisValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let stack = new Array<imbalancedItem>();
      let imbalanced = false;

      let imbalancedItems = new Array<imbalancedItem>();

      const popStack = function (
        checkSymbol: string,
        index: number,
        expected: string
      ) {
        let item = stack.pop();

        // If we have a mismatch, add it to the imbalanced Items
        if (item && item.symbol !== checkSymbol) {
          imbalancedItems.push(item);
          imbalanced = true;

          // If the stack is already empty we get a mismatch
        } else if (!item) {
          imbalancedItems.push(new imbalancedItem(expected, index));
          imbalanced = true;
        }
      };

      for (let i = 0; i < control.value.length; i++) {
        switch (control.value[i]) {
          case '(':
            stack.push(new imbalancedItem('(', i));
            break;
          case ')':
            popStack('(', i, ')');
            break;
          case '{':
            stack.push(new imbalancedItem('{', i));
            break;
          case '}':
            popStack('{', i, '}');
            break;
          case '[':
            stack.push(new imbalancedItem('[', i));
            break;
          case ']':
            popStack('[', i, ']');
            break;
          default:
            continue;
        }
      }

      if (stack.length > 0) {
        imbalancedItems.push(...stack);
        imbalanced = true;
      }

      this.imbalancedItems = imbalancedItems;

      return imbalanced ? { imbalanced: imbalancedItems } : null;
    };
  }

  unknownActivityNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let unknowActivities = new Set();

      const res = control.value.matchAll(this.activityNameRegEx);
      for (let match of res) {
        if (!this.logService.activitiesInEventLog[match[1]]) {
          unknowActivities.add({ index: match.index, name: match[1] });
        }
      }
      return unknowActivities.size > 0
        ? { unknowActivities: unknowActivities }
        : null;
    };
  }

  balancedApostropheValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let occurences = 0;

      if (control.value) {
        let matches = control.value.match(/'/g || []);

        if (matches) {
          occurences = matches.length;
        }
      }

      return occurences % 2 === 1 ? { apostrophe: true } : null;
    };
  }
}

class imbalancedItem {
  symbol: string;
  index: number;

  constructor(symbol: string, index: number) {
    this.symbol = symbol;
    this.index = index;
  }
}
