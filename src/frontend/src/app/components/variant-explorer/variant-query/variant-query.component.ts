import { EditorService } from './../../../services/editorService/editor.service';
import { VariantFilterService } from './../../../services/variantFilterService/variant-filter.service';
import { LogService } from 'src/app/services/logService/log.service';
import { BackendService } from 'src/app/services/backendService/backend.service';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  Renderer2,
  AfterViewInit,
  HostListener,
  Input,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EditorZoneComponent } from '../../editor-zone/editor-zone.component';

import * as Monaco from 'monaco-editor';
import { generateVQLTheme } from '../../editor-zone/editor-languages/vql-language-theme';
import { VariantService } from 'src/app/services/variantService/variant.service';
declare var monaco: typeof Monaco;
@Component({
  selector: 'app-variant-query',
  templateUrl: './variant-query.component.html',
  styleUrls: ['./variant-query.component.scss'],
})
export class VariantQueryComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  variantQueryInput: FormGroup;
  variantQuery: FormControl;

  @ViewChild('queryEditor') queryEditor: ElementRef<HTMLTextAreaElement>;
  @ViewChild(EditorZoneComponent) editorZone: EditorZoneComponent;
  @ViewChild('queryEditorBackdrop')
  queryEditorBackdrop: ElementRef<HTMLDivElement>;

  @Input()
  active: boolean = false;

  @Input()
  options: EditorOptions = new EditorOptions();

  @Output()
  executeFilteredVariantsAction: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  queryfilteractive: boolean = false;

  apostropheString = '<span class="syntax-operator">\'</span>';

  activityNameRegEx = new RegExp(
    this.apostropheString + "([^']*)" + this.apostropheString,
    'g'
  );

  activityColorMap: Map<string, string>;

  activites: Set<string>;
  backendErrorMessage: boolean = false;
  backendErrorIndex: number;

  editorInstance: Monaco.editor.IStandaloneCodeEditor;

  private _destroy$ = new Subject();

  constructor(
    private renderer: Renderer2,
    private colorMapService: ColorMapService,
    private logService: LogService,
    private backendService: BackendService,
    private variantFilterService: VariantFilterService,
    private editorService: EditorService,
    private variantService: VariantService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.editorInstance) {
      this.editorService.options = this.options;
      this.editorService.updateTheme();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  ngOnInit() {
    (this.variantQuery = new FormControl('', {
      validators: [],
      updateOn: 'change',
    })),
      (this.variantQueryInput = new FormGroup({
        variantQuery: this.variantQuery,
      }));

    this.variantService.nameChanges.subscribe((v) => {
      if (v !== null) {
        let [oldName, newName] = v;
        this.onRenameActivity(oldName, newName);
      }
    });
  }

  ngAfterViewInit(): void {
    this.logService.activitiesInEventLog$
      .pipe(takeUntil(this._destroy$))
      .subscribe((act) => {
        this.activites = new Set(Object.keys(act));
      });

    this.variantFilterService.variantFilters$.subscribe((filter) => {
      this.queryfilteractive = filter.has('query filter');
    });
  }

  onSubmit() {
    this.backendService
      .variantQuery(this.variantQuery.value)
      .pipe(takeUntil(this._destroy$))
      .subscribe((res) => {
        if (!res.error) {
          this.variantFilterService.addVariantFilter(
            'query filter',
            new Set(res.ids as Array<number>),
            this.variantQuery.value
          );
        } else {
          this.variantQuery.setErrors({ backendError: res.error });
          this.backendErrorIndex = res.error_index;
        }
      });
  }

  resetQuery() {
    this.variantFilterService.removeVariantFilter('query filter');
  }

  executeRemovalActionOnFilteredVariants(removeFiltered: boolean) {
    this.executeFilteredVariantsAction.emit(removeFiltered);
  }

  onEditorChange(value) {
    this.editorZone.registerValidatorFunction(this.validateMonaco);
    this.editorZone.registerOnErrorStatusChange(this.onErrorStatusChange);
    this.editorZone.registerOnTouched(this.onErrorStatusChange);
    this.editorInstance = value;
  }

  @HostListener('window:keydown.control.enter', ['$event'])
  onRunQuery(e) {
    if (this.variantQuery.valid) {
      this.onSubmit();
    }
  }

  private onErrorStatusChange = function () {
    this.variantQuery.updateValueAndValidity();
  }.bind(this);

  private onRenameActivity(oldName: string, newName: string) {
    let model = this.editorZone.model;
    for (let match of model.findMatches(
      "'" + oldName + "'",
      true,
      true,
      true,
      null,
      true
    )) {
      model.applyEdits([{ range: match.range, text: "'" + newName + "'" }]);
    }
  }

  private validateMonaco = function (model: Monaco.editor.ITextModel) {
    const markers = [];
    // lines start at 1

    for (let match of model.findMatches(
      "'([^']*)'",
      true,
      true,
      true,
      null,
      true
    )) {
      if (!this.activites.has(match.matches[1])) {
        const actvityRange = match.range;
        markers.push({
          message:
            'Unknown Activity ' +
            match.matches[1] +
            ' in Line ' +
            actvityRange.startLineNumber,
          severity: monaco.MarkerSeverity.Warning,
          startLineNumber: actvityRange.startLineNumber,
          startColumn: actvityRange.startColumn + 1,
          endLineNumber: actvityRange.endLineNumber,
          endColumn: actvityRange.endColumn - 1,
        });
      }
    }

    const semicolon_matches = model.findMatches(
      ';',
      true,
      true,
      true,
      null,
      true
    );

    if (semicolon_matches.length > 1) {
      for (let match of semicolon_matches.slice(1)) {
        const semicolonRange = match.range;

        markers.push({
          message: 'Too many Semicolons',
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: semicolonRange.startLineNumber,
          startColumn: semicolonRange.startColumn,
          endLineNumber: semicolonRange.endLineNumber,
          endColumn: semicolonRange.endColumn,
        });
      }
    } else if (semicolon_matches.length > 0) {
      const semicolonRange = semicolon_matches[0].range;

      const firstWhiteSpace = model.getLineLastNonWhitespaceColumn(
        semicolonRange.endLineNumber
      );

      if (firstWhiteSpace !== semicolonRange.startColumn + 1) {
        markers.push({
          message: 'Input after Semicolon',
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: semicolonRange.endLineNumber,
          startColumn: semicolonRange.endColumn,
          endLineNumber: semicolonRange.endLineNumber,
          endColumn: model.getLineMaxColumn(semicolonRange.endLineNumber),
        });
      }
    } else {
      const line = model.getLineCount();
      const last = model.getLineMaxColumn(line);
      markers.push({
        message: 'Missing Semicolon',
        severity: monaco.MarkerSeverity.Warning,
        startLineNumber: line,
        startColumn: last,
        endLineNumber: line,
        endColumn: last,
      });
    }

    monaco.editor.setModelMarkers(model, 'owner', markers);
  }.bind(this);
}

export class EditorOptions {
  highlightActivityNames: boolean;

  constructor() {
    this.highlightActivityNames = true;
  }
}
