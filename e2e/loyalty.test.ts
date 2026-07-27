import { by, device, element, expect } from 'detox';

describe('Loyalty Points', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true, newInstance: true });
    try {
      await device.pressBack();
    } catch {}
  });

  it('should show loyalty info', async () => {
    await element(by.text('Profil')).tap();
    await element(by.text('Buka Halaman Pengaturan Saya')).tap();
    await expect(element(by.text('Akun Saya'))).toBeVisible();
  });
});
