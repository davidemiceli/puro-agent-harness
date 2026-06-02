import { describe, it, expect, beforeEach } from 'vitest';
import { isIgnored } from './helpers';


let ignore;

describe('Standard Wildcards (*)', () => {
    beforeEach(() => {
        ignore = isIgnored('*.log\nnode_modules');
    });

    it('should ignore files matching a simple extension', () => {
        expect(ignore('error.log')).toBe(true);
        expect(ignore('logs/error.log')).toBe(true);
        expect(ignore('error.log.txt')).toBe(false);
    });

    it('should ignore directories anywhere in the path when unanchored', () => {
        expect(ignore('node_modules')).toBe(true);
        expect(ignore('src/node_modules/index.js')).toBe(true);
    });
});

describe('Root Anchoring (/)', () => {
    beforeEach(() => {
        ignore = isIgnored('/config.json\n/dist/');
    });

    it('should ignore files only at the root', () => {
        expect(ignore('config.json')).toBe(true);
        expect(ignore('src/config.json')).toBe(false);
    });

    it('should ignore root directories and their contents', () => {
        expect(ignore('dist')).toBe(true);
        expect(ignore('dist/bundle.js')).toBe(true);
        expect(ignore('old/dist/bundle.js')).toBe(false);
    });
});

describe('Deep Wildcards (**)', () => {
    beforeEach(() => {
        ignore = isIgnored('docs/**/archived');
    });

    it('should match deep paths spanning multiple directories', () => {
        expect(ignore('docs/2023/v1/archived')).toBe(true);
        expect(ignore('docs/archived')).toBe(false); // ** matches at least one char in your logic
    });
});

describe('Edge Cases and Comments', () => {
    it('should ignore empty lines and comments', () => {
        const content = `
            # This is a comment
            target
            
            *.tmp
        `;
        ignore = isIgnored(content);
        expect(ignore('target')).toBe(true);
        expect(ignore('file.tmp')).toBe(true);
        expect(ignore('# This is a comment')).toBe(false);
    });

    it('should handle special regex characters in filenames literally', () => {
        ignore = isIgnored('build+assets');
        expect(ignore('build+assets/file.js')).toBe(true);
        expect(ignore('buildassets')).toBe(false); // ensures '+' was escaped
    });
});