import { describe, expect, it } from 'vitest';
import { generateOrderNumber, MAX_IMAGE_UPLOAD_BYTES, slugify, validateImageFile } from '@/utils';

describe('utils', () => {
  it('slugifies business names into clean store slugs', () => {
    expect(slugify("Abeba's Market! Addis")).toBe('abeba-s-market-addis');
  });

  it('generates the expected order number prefix', () => {
    expect(generateOrderNumber().startsWith('ORD-')).toBe(true);
  });

  it('validates image uploads by file type and size', () => {
    expect(validateImageFile(new File(['text'], 'notes.txt', { type: 'text/plain' }), 'Logo')).toBe('Logo must be an image file');
    expect(validateImageFile(new File([new Uint8Array(MAX_IMAGE_UPLOAD_BYTES + 1)], 'huge.png', { type: 'image/png' }), 'Logo')).toBe('Logo must be 5 MB or smaller');
    expect(validateImageFile(new File(['ok'], 'logo.png', { type: 'image/png' }), 'Logo')).toBeNull();
  });
});
