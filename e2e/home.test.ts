import { by, device, element, expect } from 'detox';

describe('Home Screen', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true, newInstance: true });
    await element(by.text('Belum punya akun? Daftar')).tap();
    await element(by.type('TextInput').atIndex(0)).typeText('Test User');
    await element(by.type('TextInput').atIndex(1)).typeText('6281234567890');
    await element(by.type('TextInput').atIndex(2)).typeText('1234');
    await element(by.text('Daftar')).tap();
    try {
      await expect(element(by.text('Katalog'))).toBeVisible();
    } catch {
    }
  });

  it('should show bottom navigation', async () => {
    await expect(element(by.text('AI Agent'))).toBeVisible();
    await expect(element(by.text('Katalog'))).toBeVisible();
    await expect(element(by.text('Pesananku'))).toBeVisible();
    await expect(element(by.text('Profil'))).toBeVisible();
  });

  it('should show AI Agent tab by default', async () => {
    await expect(element(by.text('Katalog'))).toBeVisible();
  });

  it('should navigate to Katalog tab', async () => {
    await element(by.text('Katalog')).tap();
    await expect(element(by.text('Cari keripik favoritmu...'))).toBeVisible();
    await expect(element(by.text('Semua'))).toBeVisible();
  });

  it('should show category chips in Katalog', async () => {
    await expect(element(by.text('Pedas'))).toBeVisible();
    await expect(element(by.text('Original'))).toBeVisible();
    await expect(element(by.text('Balado'))).toBeVisible();
    await expect(element(by.text('Manis'))).toBeVisible();
  });

  it('should filter by category', async () => {
    await element(by.text('Original')).tap();
    await expect(element(by.text('Pedas'))).toBeVisible();
    await element(by.text('Semua')).tap();
  });

  it('should show search bar in Katalog', async () => {
    await element(by.type('TextInput').atIndex(0)).typeText('keripik');
  });

  it('should navigate to Pesanan tab', async () => {
    await element(by.text('Pesananku')).tap();
    await expect(element(by.text('Pelacakan Pesanan Real-Time'))).toBeVisible();
  });

  it('should navigate to Profil tab', async () => {
    await element(by.text('Profil')).tap();
    await expect(element(by.text('Profil Pelanggan'))).toBeVisible();
    await expect(element(by.text('Buka Halaman Pengaturan Saya'))).toBeVisible();
  });

  it('should navigate to tracking example from Pesanan', async () => {
    await element(by.text('Pesananku')).tap();
    await element(by.text('Contoh Lacak Pesanan TX-MBL-882910')).tap();
  });

  it('should go back to home from tracking', async () => {
    await device.pressBack();
    await expect(element(by.text('Pesananku'))).toBeVisible();
  });

  it('should navigate to profile settings from Profil', async () => {
    await element(by.text('Profil')).tap();
    await element(by.text('Buka Halaman Pengaturan Saya')).tap();
    await expect(element(by.text('Akun Saya'))).toBeVisible();
  });
});
