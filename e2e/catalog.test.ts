import { by, device, element, expect } from 'detox';

describe('Catalog & Cart Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true, newInstance: true });
    try {
      await device.pressBack();
    } catch {}
    await element(by.text('Katalog')).tap();
  });

  it('should show product cards', async () => {
    await expect(element(by.text('Beli Pack'))).toExist();
  });

  it('should add product to cart', async () => {
    await element(by.text('Beli Pack')).first().tap();
    await expect(element(by.text('Ditambah'))).toExist();
  });

  it('should show cart count badge', async () => {
    await expect(element(by.text('1 Item di Keranjang'))).toBeVisible();
  });

  it('should navigate to cart', async () => {
    await element(by.text('1 Item di Keranjang')).tap();
    await expect(element(by.text('Keranjang'))).toBeVisible();
  });

  it('should show cart items', async () => {
    await expect(element(by.text('Pilih Pembayaran'))).toBeVisible();
  });
});
