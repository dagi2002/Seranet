import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
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

  it('resets to blank values when switching from edit mode to add mode', async () => {
    renderWithApp(<ProductFormHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Edit' }));

    expect(screen.getByLabelText('Name')).toHaveValue('Existing Product');
    expect(screen.getByLabelText('Price (ETB)')).toHaveValue(3200);
    expect(screen.getAllByText(/image/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByLabelText('Name')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Open Add' }));

    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
    expect(screen.getByLabelText('Price (ETB)')).toHaveValue(0);
    expect(screen.getByLabelText('Stock Quantity')).toHaveValue(0);
    expect(screen.queryByText('Primary image')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Product' })).toBeInTheDocument();
  });

  it('reopens add mode as a clean form after creating a product', async () => {
    const createSpy = vi.spyOn(apiClient.products, 'create').mockResolvedValue({
      ...baseProduct,
      id: 'product_created_again',
      name: 'Fresh Product',
      image_url: 'https://example.com/upload-1.jpg',
      image_urls: ['https://example.com/upload-1.jpg'],
    });
    vi.spyOn(apiClient.uploads, 'uploadProductImage').mockResolvedValue({ file_url: 'https://example.com/upload-1.jpg' });

    renderWithApp(<ProductFormHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Add' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Fresh Product' } });
    fireEvent.change(screen.getByLabelText('Price (ETB)'), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText('Stock Quantity'), { target: { value: '2' } });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement | null;
    expect(fileInput).not.toBeNull();
    if (!fileInput) {
      throw new Error('Expected product image file input to exist');
    }
    fireEvent.change(fileInput, { target: { files: [new File(['one'], 'one.png', { type: 'image/png' })] } });

    await waitFor(() => expect(screen.getByText('Primary image')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Create Product' }));

    await waitFor(() =>
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Fresh Product',
          price: 150,
          stock_quantity: 2,
          image_urls: ['https://example.com/upload-1.jpg'],
        }),
      ),
    );
    await waitFor(() => expect(screen.queryByLabelText('Name')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Open Add' }));

    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
    expect(screen.getByLabelText('Price (ETB)')).toHaveValue(0);
    expect(screen.getByLabelText('Stock Quantity')).toHaveValue(0);
    expect(screen.queryByText('Primary image')).not.toBeInTheDocument();
  });
});

function ProductFormHarness() {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setProduct(baseProduct);
          setOpen(true);
        }}
      >
        Open Edit
      </button>
      <button
        type="button"
        onClick={() => {
          setProduct(null);
          setOpen(true);
        }}
      >
        Open Add
      </button>
      <ProductForm product={product} open={open} onOpenChange={setOpen} />
    </>
  );
}
