import {
  unaryOperator,
  binaryOperator,
  binarylogicalOperator,
  groupOperator,
  unarylogicalOperator,
} from './vql-constants';
import * as Monaco from 'monaco-editor';

export function getVQLTokenizer(): Monaco.languages.IMonarchLanguage {
  return {
    defaultToken: 'text',

    wordPattern:
      /(-?\d*\.\d\w*)|([^\`\~\!\#\%\^\&\*\(\)\-\=\+\{\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,

    logicalOperator: groupOperator.concat(
      unarylogicalOperator,
      binarylogicalOperator
    ),

    operator: unaryOperator.concat(binaryOperator),

    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    quantifier: ['=', '>', '<', '~'],

    // we include these common regular expressions
    brackets: [
      { open: '{', close: '}', token: 'delimiter.curly' },
      { open: '[', close: ']', token: 'delimiter.bracket' },
      { open: '(', close: ')', token: 'delimiter.parenthesis' },
    ],

    tokenizer: {
      root: [
        { include: '@whitespace' },
        { include: '@numbers' },

        [/[,;]/, 'delimiter'],
        [/[{}\[\]()]/, '@brackets'],

        [
          /@symbols/,
          {
            cases: {
              '@logicalOperator': 'logicalOperator',
              '@quantifier': 'quantifier',
              '@default': 'text',
            },
          },
        ],

        [
          /[a-zA-Z]\w*/,
          {
            cases: {
              '@logicalOperator': 'logicalOperator',
              '@operator': 'operator',
              '@default': 'identifier',
            },
          },
        ],
        [
          /'/,
          { token: 'string.quote', bracket: '@open', next: '@activityName' },
        ],
      ],

      numbers: [
        [/-?0x([abcdef]|[ABCDEF]|\d)+[lL]?/, 'number.hex'],
        [/-?(\d*\.)?\d+([eE][+\-]?\d+)?[jJ]?[lL]?/, 'number'],
      ],
      whitespace: [[/\s+/, 'white']],

      activityName: [
        [/([^'\\]|\\.)*(?!')$/, 'string.invalid'],
        [/([^\\']+)/, { token: 'activites.$1' }],
        [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
      ],
    },
  };
}

export const vqlConfig: Monaco.languages.LanguageConfiguration = {
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '<', close: '>' },
    { open: "'", close: "'" },
    { open: '"', close: '"' },
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: "'", close: "'", notIn: ['string', 'comment'] },
    { open: '"', close: '"', notIn: ['string', 'comment'] },
  ],
  brackets: [
    ['(', ')'],
    ['{', '}'],
  ],
  colorizedBracketPairs: [
    ['(', ')'],
    ['{', '}'],
  ],
};
