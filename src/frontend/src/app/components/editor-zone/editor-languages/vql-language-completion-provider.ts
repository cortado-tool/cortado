import {
  groupOperator,
  unarylogicalOperator,
  unaryOperator,
  binaryOperator,
  binarylogicalOperator,
} from './vql-constants';
import * as Monaco from 'monaco-editor';

export function getVQLCompletionProvider(activityNames) {
  activityNames = Array.from(activityNames);

  return function createProposals(range) {
    // returning a static list of proposals, not even looking at the prefix (filtering is done by the Monaco editor),
    // here you could do a server side lookup

    const suggetions = [];

    activityNames.forEach((element) => {
      suggetions.push({
        label: element,
        kind: Monaco.languages.CompletionItemKind.Text,
        documentation: 'Activity Name',
        insertText: element,
        range: range,
      });
    });

    unarylogicalOperator.forEach((element) => {
      suggetions.push({
        label: element,
        kind: Monaco.languages.CompletionItemKind.Snippet,
        documentation: 'Logical Operator',
        insertText: element + '(${1:Expression})',
        range: range,
        insertTextRules:
          Monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      });
    });

    binarylogicalOperator.forEach((element) => {
      suggetions.push({
        label: element,
        kind: Monaco.languages.CompletionItemKind.Snippet,
        documentation: 'Logical Operator',
        insertText: element + ' ${1:Expression}',
        range: range,
        insertTextRules:
          Monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      });
    });

    groupOperator.forEach((element) => {
      suggetions.push({
        label: element,
        kind: Monaco.languages.CompletionItemKind.Snippet,
        documentation: 'Group Operator',
        insertText: element + " {${1:'Activity'}, ${2:'Activity'}}",
        range: range,
        insertTextRules:
          Monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      });
    });

    binaryOperator.forEach((element) => {
      suggetions.push({
        label: element,
        kind: Monaco.languages.CompletionItemKind.Snippet,
        documentation: 'Binary Operator',
        insertText: element + ' $0',
        range: range,
        insertTextRules:
          Monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      });
    });

    unaryOperator.forEach((element) => {
      suggetions.push({
        label: element,
        kind: Monaco.languages.CompletionItemKind.Snippet,
        documentation: 'Unary Operator',
        insertText: element + ' $0',
        range: range,
        insertTextRules:
          Monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      });
    });

    return suggetions;
  };
}
