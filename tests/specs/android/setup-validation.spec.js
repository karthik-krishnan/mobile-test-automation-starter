// =============================================================================
// Android Setup Validation
// =============================================================================
// Three checks — that's all we need to confirm Appium + emulator are working:
//   1. Session opens and reports Android
//   2. An app can be launched (Settings — always present)
//   3. The Home key works and we can return to the app
// =============================================================================

describe('Android App Launch Validation', () => {

  it('should connect and report Android as the platform', async () => {
    const caps = await driver.getSession();
    console.log(`  ▶ Platform: ${caps.platformName}  Device: ${caps.deviceName || 'emulator'}`);
    expect(caps.platformName.toLowerCase()).toBe('android');
  });

  it('should launch the Settings app', async () => {
    await driver.activateApp('com.android.settings');
    await driver.pause(2000);
    const pkg = await driver.getCurrentPackage();
    console.log(`  ▶ Foreground package: ${pkg}`);
    expect(pkg).toBe('com.android.settings');
  });

  it('should press Home and return to Settings', async () => {
    // Press the Home key (keycode 3) — goes to the launcher
    await driver.pressKeyCode(3);
    await driver.pause(1500);
    const launcherPkg = await driver.getCurrentPackage();
    console.log(`  ▶ After Home: ${launcherPkg}`);
    expect(launcherPkg).toContain('launcher');

    // Bring Settings back
    await driver.activateApp('com.android.settings');
    await driver.pause(1500);
    const settingsPkg = await driver.getCurrentPackage();
    console.log(`  ▶ Back to:    ${settingsPkg}`);
    expect(settingsPkg).toBe('com.android.settings');
  });

});
