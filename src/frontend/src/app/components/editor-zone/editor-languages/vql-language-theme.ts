import * as Monaco from 'monaco-editor';
import { EditorOptions } from '../../variant-explorer/variant-query/variant-query.component';

export function generateVQLTheme(
  colorMap: Map<string, string>,
  options: EditorOptions
): Monaco.editor.IStandaloneThemeData {
  const activityTokens = [];
  if (options.highlightActivityNames) {
    activityTokens.push({
      token: 'activites',
      foreground: 'ffc107',
      fontStyle: 'bold',
    });

    colorMap.forEach((v, k) => {
      // The replace is used, due to the tokenizer converting certain char into -, if there is a bug during Tokenizing start checking here
      activityTokens.push({
        token: 'activites.' + k.replace(/(<|_|>)/g, '-'),
        foreground: v,
      });
    });
  }

  return {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'quantifier', foreground: '008800', fontStyle: 'bold' },
      { token: 'string', foreground: 'FFFFFF' },
      { token: 'text', foreground: 'a0a0a0' },
      { token: 'identifier', foreground: 'a0a0a0' },
      { token: 'logicalOperator', foreground: '569cd6', fontStyle: 'bold' },
      { token: 'operator', foreground: '569cd6', fontStyle: 'underline' },
      { token: 'string.invalid', foreground: 'dc3545' },
      ...activityTokens,
    ],
    colors: {
      'editorBracketMatch.background': '00FF00',
      'editorBracketMatch.border': 'FF0000',
    },
  };
}
