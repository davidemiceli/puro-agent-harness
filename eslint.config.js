import js from '@eslint/js';
import * as parser from '@typescript-eslint/parser';
import globals from 'globals';

const ignores = [
    'vite.config.js', 'electron/dist', 'out', 'node_modules/**'
];

export default [
    js.configs.recommended,
    { ignores },
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            parser: parser,
            globals: {
                '__APP_VERSION__': 'readonly',
                ...globals.browser,
                ...globals.node
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            // Force 4 spaces indentation
            'indent': ['error', 4, { 'SwitchCase': 1 }],
            // The 'No Parentheses' Rule
            'no-extra-parens': ['error', 'all', { 
                'ignoreJSX': 'none', 
                'nestedBinaryExpressions': false,
                'enforceForArrowConditionals': false
            }],
            // Underscore Discard & Unused Vars
            'no-unused-vars': ['warn', { 
                'varsIgnorePattern': '^_$', 
                'argsIgnorePattern': '^_$',
                'ignoreRestSiblings': true 
            }],
            // General code style preferences
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'no-undef': 'error',
        },
    },
];