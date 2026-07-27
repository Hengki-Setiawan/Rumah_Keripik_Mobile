import { by, device, element, expect, waitFor } from 'detox';

describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true });
  });

  afterAll(async () => {
    await device.uninstallApp();
  });

  it('should show login screen with all elements', async () => {
    await expect(element(by.text('Rumah Keripik'))).toBeVisible();
    await expect(element(by.text('Masuk ke akun Anda'))).toBeVisible();
    await expect(element(by.text('Masuk'))).toBeVisible();
    await expect(element(by.text('Belum punya akun? Daftar'))).toBeVisible();
  });

  it('should switch to registration mode', async () => {
    await element(by.text('Belum punya akun? Daftar')).tap();
    await expect(element(by.text('Nama lengkap'))).toBeVisible();
    await expect(element(by.text('Buat akun baru'))).toBeVisible();
    await expect(element(by.text('Sudah punya akun? Masuk'))).toBeVisible();
  });

  it('should validate empty phone', async () => {
    await element(by.text('Daftar')).tap();
    await expect(element(by.text('Nomor HP tidak valid'))).toBeVisible();
  });

  it('should validate short phone', async () => {
    await element(by.type('TextInput').atIndex(0)).typeText('A');
    await element(by.text('Daftar')).tap();
    await expect(element(by.text('Nomor HP tidak valid'))).toBeVisible();
  });

  it('should validate 4-digit PIN', async () => {
    await element(by.text('Sudah punya akun? Masuk')).tap();
    await element(by.type('TextInput').atIndex(0)).typeText('6281234567890');
    await element(by.text('Masuk')).tap();
    await expect(element(by.text('PIN harus 4 digit angka'))).toBeVisible();
  });

  it('should attempt login with valid form', async () => {
    await element(by.type('TextInput').atIndex(1)).typeText('1234');
    await element(by.text('Masuk')).tap();
    await waitFor(element(by.text('Rumah Keripik')))
      .toExist()
      .withTimeout(30000);
  });
});
