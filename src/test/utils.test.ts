import { describe, expect, it } from 'vitest';
import { generateOrderNumber, slugify } from '@/utils';

describe('utils', () => {
  it('slugifies business names into clean store slugs', () => {
    expect(slugify("Abeba's Market! Addis")).toBe('abeba-s-market-addis');
  });

  it('generates the expected order number prefix', () => {
    expect(generateOrderNumber().startsWith('ORD-')).toBe(true);
  });
});
