import { describe, expect, it } from 'vitest';
import { renderTemplate, templateFieldIds, toParagraphs } from './template.js';

describe('renderTemplate', () => {
	it('fills in values', () => {
		expect(renderTemplate('Dear {{ name }}, re {{ref}}.', { name: 'Ana', ref: '12' })).toBe(
			'Dear Ana, re 12.'
		);
	});
	it('leaves blanks for missing values', () => {
		expect(renderTemplate('Hi {{name}}!', {})).toBe('Hi !');
	});
	it('keeps {{#if}} blocks only when a value is given', () => {
		const t = 'A{{#if ref}} (ref {{ref}}){{/if}}.';
		expect(renderTemplate(t, { ref: '9' })).toBe('A (ref 9).');
		expect(renderTemplate(t, { ref: '  ' })).toBe('A.');
	});
	it('supports {{#unless}} and simple nesting', () => {
		const t = '{{#unless ref}}No reference.{{/unless}}{{#if a}}[{{#if b}}b{{/if}}]{{/if}}';
		expect(renderTemplate(t, { a: '1', b: '1' })).toBe('No reference.[b]');
		expect(renderTemplate(t, { ref: 'x', a: '1' })).toBe('[]');
	});
	it('lists the fields a template uses', () => {
		expect(templateFieldIds('{{a}} {{#if b}}{{c}}{{/if}} {{#unless d}}{{/unless}}').sort()).toEqual(
			['a', 'b', 'c', 'd']
		);
	});
});

describe('toParagraphs', () => {
	it('splits on blank lines and keeps line breaks', () => {
		expect(toParagraphs('One\ntwo\n\n\n\nThree')).toEqual([['One', 'two'], ['Three']]);
	});
	it('drops paragraphs left empty by a removed block', () => {
		expect(toParagraphs('A\n\n   \n\nB')).toEqual([['A'], ['B']]);
	});
});
