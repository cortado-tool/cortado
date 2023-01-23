import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import {
  getVQLTokenizer,
  vqlConfig,
} from 'src/app/components/editor-zone/editor-languages/vql-language';
import { take } from 'rxjs/operators';
import { generateVQLTheme } from 'src/app/components/editor-zone/editor-languages/vql-language-theme';
import { ColorMapService } from '../colorMapService/color-map.service';
import { getVQLCompletionProvider } from 'src/app/components/editor-zone/editor-languages/vql-language-completion-provider';

import * as Monaco from 'monaco-editor';
import { EditorOptions } from 'src/app/components/variant-explorer/variant-query/variant-query.component';
import { LogService } from '../logService/log.service';

declare var monaco: typeof Monaco;
@Injectable({
  providedIn: 'root',
})
export class EditorService {
  loaded: boolean = false;
  completionProvider: Monaco.IDisposable;

  options: EditorOptions = new EditorOptions();

  private _monacoPath = 'assets/monaco-editor/min/vs';

  public loadingFinished: Subject<void> = new Subject<void>();

  constructor(
    private colorMapService: ColorMapService,
    private logService: LogService
  ) {
    this.colorMapService.colorMap$.subscribe((colormap: any) => {
      if (colormap && this.loaded) {
        this.updateVQLTheme();
      }
    });

    this.logService.activitiesInEventLog$.subscribe((act) => {
      if (this.colorMapService.colorMap && this.loaded) {
        this.updateVQLTheme();
      }
    });
  }

  private finishLoading() {
    if (!this.colorMapService.colorMap) {
      this.colorMapService.colorMap$.pipe(take(1)).subscribe(() => {
        this.finishLoading();
      });
      return;
    }

    // Register a tokens provider for the language
    monaco.languages.register({ id: 'VQL' });
    monaco.languages.setMonarchTokensProvider('VQL', getVQLTokenizer());
    monaco.languages.setLanguageConfiguration('VQL', vqlConfig);

    this.updateVQLTheme();

    this.loaded = true;
    this.loadingFinished.next();
  }

  public load() {
    const onGotAmdLoader = () => {
      let vsPath = this._monacoPath;
      (<any>window).amdRequire = (<any>window).require;
      (<any>window).amdRequire.config({ paths: { vs: vsPath } });

      // Load monaco
      (<any>window).amdRequire(
        ['vs/editor/editor.main'],
        () => {
          this.finishLoading();
        },
        (error) => console.error('Error loading monaco-editor: ', error)
      );
    };

    const loaderScript: HTMLScriptElement = document.createElement('script');
    loaderScript.type = 'text/javascript';
    loaderScript.src = `${this._monacoPath}/loader.js`;
    loaderScript.addEventListener('load', onGotAmdLoader);
    document.body.appendChild(loaderScript);
  }

  updateTheme() {
    const cMap: Map<string, string> = new Map<string, string>();

    this.colorMapService.colorMap.forEach((v, k) => {
      if (Object.keys(this.logService.activitiesInEventLog).includes(k)) {
        cMap.set(k, v);
      }
    });

    monaco.editor.defineTheme('VQLTheme', generateVQLTheme(cMap, this.options));
  }

  private updateVQLTheme() {
    // Define a new theme that matches the activity names and Colormap

    if (this.completionProvider) {
      this.completionProvider.dispose();
    }

    const createProposals = getVQLCompletionProvider(
      Object.keys(this.logService.activitiesInEventLog)
    );

    this.updateTheme();

    this.completionProvider = monaco.languages.registerCompletionItemProvider(
      'VQL',
      {
        provideCompletionItems: function (model, position) {
          var word = model.getWordUntilPosition(position);
          var range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          return {
            suggestions: createProposals(range),
          };
        },
      }
    );
  }
}
