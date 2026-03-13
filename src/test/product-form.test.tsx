import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/apiClient';
import { ProductForm } from '@/features/products/components/product-form';
import type { Product } from '@/types/seranet';
import { renderWithApp } from '@/test/test-utils';

const baseProduct = {
  id: 'product_existing',
  created_date: new Date().toISOString(),
  updated_date: new Date().toISOString(),
  merchant_id: 'merchant_1',
  name: 'Existing Product',
  description: 'Existing description',
  price: 3200,
  stock_quantity: 4,
  image_url: 'https://example.com/existing-1.jpg',
  image_urls: ['https://example.com/existing-1.jpg', 'https://example.com/existing-2.jpg'],
  category: 'home',
  is_active: true,
} satisfies Product & { image_url: string };

describe('product form multi-image flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('requires at least one image for product creation and submits uploaded images', async () => {
    const createSpy = vi.spyOn(apiClient.products, 'create').mockResolvedValue({
      ...baseProduct,
      id: 'product_created',
      name: 'Coffee Set',
      price: 4200,
      stock_quantity: 3,
      image_url: 'https://example.com/upload-1.jpg',
      image_urls: ['https://example.com/upload-1.jpg', 'https://example.com/upload-2.jpg'],
    });
    const uploadSpy = vi.spyOn(apiClient.uploads, 'uploadProductImage')
      .mockResolvedValueOnce({ file_url: 'https://example.com/upload-1.jpg' })
      .mockResolvedValueOnce({ file_url: 'https://example.com/upload-2.jpg' });

    renderWithApp(
      <ProductForm open onOpenChange={() => {}} />,
    );

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Coffee Set' } });
    fireEvent.change(screen.getByLabelText('Price (ETB)'), { target: { value: '4200' } });
    fireEvent.change(screen.getByLabelText('Stock Quantity'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Product' }));

    await waitFor(() => expect(screen.getByText('Add at least 1 product image')).toBeInTheDocument());
    expect(createSpy).not.toHaveBeenCalled();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement | null;
    expect(fileInput).not.toBeNull();
    if (!fileInput) {
      throw new Error('Expected product image file input to exist');
    }
    fireEvent.change(fileInput, { target: { files: [new File(['one'], 'one.png', { type: 'image/png' })] } });
    fireEvent.change(fileInput, { target: { files: [new File(['two'], 'two.png', { type: 'image/png' })] } });

    await waitFor(() => expect(uploadSpy).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByRole('button', { name: 'Create Product' }));

    await waitFor(() =>
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Coffee Set',
          price: 4200,
          stock_quantity: 3,
          image_urls: ['https://example.com/upload-1.jpg', 'https://example.com/upload-2.jpg'],
        }),
      ),
    );
  });

  it('lets merchants remove images while keeping one primary image during edit', async () => {
    const updateSpy = vi.spyOn(apiClient.products, 'update').mockResolvedValue(baseProduct);

    renderWithApp(
      <ProductForm product={baseProduct} open onOpenChange={() => {}} />,
    );

    expect(screen.getByText('Primary image')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0]!);
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() =>
      expect(updateSpy).toHaveBeenCalledWith(
        'product_existing',
        expect.objectContaining({
          image_urls: ['https://example.com/existing-2.jpg'],
        }),
      ),
    );
  });
});
