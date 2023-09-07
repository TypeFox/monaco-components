import { editor } from 'monaco-editor';

export const LangiumMonarchContent = {
    keywords: [
        'bigint',
        'boolean',
        'current',
        'Date',
        'entry',
        'extends',
        'false',
        'fragment',
        'grammar',
        'hidden',
        'import',
        'infer',
        'infers',
        'interface',
        'number',
        'returns',
        'string',
        'terminal',
        'true',
        'type',
        'with',
    ],
    operators: [
        '->',
        ',',
        ';',
        ':',
        '!',
        '?',
        '?=',
        '.',
        '..',
        '@',
        '*',
        '&',
        '+',
        '+=',
        '<',
        '=',
        '=>',
        '>',
        '|',
    ],
    symbols:
        /->|,|;|:|!|\?|\?=|\.|\.\.|\(|\)|\[|\[\]|\]|\{|\}|@|\*|&|\+|\+=|<|=|=>|>|\|/,

    tokenizer: {
        initial: [
            {
                regex: /\/(?![*+?])(?:[^\r\n[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+\//,
                action: { token: 'string' },
            },
            {
                regex: /\^?[_a-zA-Z][\w_]*/,
                action: {
                    cases: {
                        '@keywords': { token: 'keyword' },
                        '@default': { token: 'ID' },
                    },
                },
            },
            { regex: /"[^"]*"|'[^']*'/, action: { token: 'string' } },
            { include: '@whitespace' },
            {
                regex: /@symbols/,
                action: {
                    cases: {
                        '@operators': { token: 'operator' },
                        '@default': { token: '' },
                    },
                },
            },
        ],
        whitespace: [
            { regex: /\s+/, action: { token: 'white' } },
            { regex: /\/\*/, action: { token: 'comment', next: '@comment' } },
            { regex: /\/\/[^\n\r]*/, action: { token: 'comment' } },
        ],
        comment: [
            { regex: /[^/*]+/, action: { token: 'comment' } },
            { regex: /\*\//, action: { token: 'comment', next: '@pop' } },
            { regex: /[/*]/, action: { token: 'comment' } },
        ],
    },
};

export const LangiumTheme = {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {},
    semanticHighlighting: true,
    semanticTokenColors: {
        newOperator: '#d4d4d4#',
        stringLiteral: '#ce9178',
        customLiteral: '#D4D4D4',
        numberLiteral: '#b5cea8'
    }
} as editor.IStandaloneThemeData;