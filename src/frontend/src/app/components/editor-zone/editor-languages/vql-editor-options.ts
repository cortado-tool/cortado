import * as Monaco from 'monaco-editor';

export const vqlEditorOptions: Monaco.editor.IStandaloneEditorConstructionOptions =
  {
    language: 'VQL',
    lineNumbers: 'off',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    readOnly: false,
    automaticLayout: true,
    theme: 'VQLTheme',
    wordWrap: 'on',
    matchBrackets: 'always',
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 0,
    fontSize: 12,
    lineHeight: 16,
    fixedOverflowWidgets: true,
    overflowWidgetsDomNode: document.getElementById(
      'monaco-editor-overflow-widgets-root'
    )!,
    minimap: { enabled: false },
    bracketPairColorization: {
      enabled: true,
      independentColorPoolPerBracketType: true,
    },
    scrollbar: {
      useShadows: true,
      verticalHasArrows: false,
      horizontalHasArrows: false,
      horizontal: 'auto',
      vertical: 'auto',
      verticalScrollbarSize: 5,
      horizontalScrollbarSize: 5,
    },
    dragAndDrop: true,
  };
