// WebdriverIO config — Android (local emulator)
import { existsSync, mkdirSync } from 'fs';
import { join, dirname }         from 'path';
import { fileURLToPath }         from 'url';

const __dirname   = dirname(fileURLToPath(import.meta.url));
const APPIUM_HOST = process.env.APPIUM_HOST || 'localhost';
const APPIUM_PORT = parseInt(process.env.APPIUM_PORT || '4723', 10);

export const config = {
  runner:   'local',
  hostname: APPIUM_HOST,
  port:     APPIUM_PORT,
  path:     '/',

  specs:   ['./specs/android/**/*.spec.js'],
  exclude: [],

  capabilities: [{
    platformName:              'Android',
    'appium:automationName':   'UiAutomator2',
    'appium:deviceName':       'emulator-5554',
    // No platformVersion — works with any Android version on the emulator
    // No appPackage/appActivity — tests launch their own apps via activateApp()
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout':    300,
  }],

  framework:    'mocha',
  mochaOpts:    { ui: 'bdd', timeout: 60000 },
  reporters:    [['spec', { realtimeReporting: true }]],
  maxInstances: 1,
  connectionRetryTimeout: 120000,
  connectionRetryCount:   3,

  onPrepare() {
    console.log(`\n🤖  Android tests → Appium at ${APPIUM_HOST}:${APPIUM_PORT}\n`);
  },

  afterTest(test, _ctx, { error }) {
    if (error) {
      const dir  = join(__dirname, 'screenshots');
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      const file = join(dir, `FAIL_android_${test.title.replace(/\s+/g, '_')}_${Date.now()}.png`);
      driver.saveScreenshot(file).catch(() => {});
      console.log(`  📸 Screenshot: ${file}`);
    }
  },
};
