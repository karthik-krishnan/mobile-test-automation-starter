// WebdriverIO config — iOS Simulator (local Mac only)
import { execSync }             from 'child_process';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname }        from 'path';
import { fileURLToPath }        from 'url';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const APPIUM_HOST = process.env.APPIUM_HOST || 'localhost';
const APPIUM_PORT = parseInt(process.env.APPIUM_PORT || '4723', 10);

// ── Auto-detect booted simulator UDID ────────────────────────────────────────
// Reads the UDID written by local-setup.sh, falls back to asking simctl directly.
// Override with IOS_UDID env var if you need a specific device.
function getSimulatorUdid() {
  if (process.env.IOS_UDID) return process.env.IOS_UDID;
  try {
    const saved = readFileSync('/tmp/ios-udid.txt', 'utf8').trim();
    if (saved) return saved;
  } catch (_) {}
  try {
    const out = execSync(
      "xcrun simctl list devices booted | grep -oE '[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}'",
      { encoding: 'utf8' }
    ).trim();
    if (out) return out.split('\n')[0];
  } catch (_) {}
  throw new Error('No booted iOS Simulator found. Run: bash local-setup.sh  first.');
}

// ── Auto-detect iOS version from booted simulator ────────────────────────────
// Parses simctl JSON output so we never have to hardcode the OS version.
function getSimulatorVersion(udid) {
  if (process.env.IOS_VERSION) return process.env.IOS_VERSION;
  try {
    const json    = execSync('xcrun simctl list devices booted -j', { encoding: 'utf8' });
    const data    = JSON.parse(json);
    for (const [runtime, devices] of Object.entries(data.devices || {})) {
      for (const device of devices) {
        if (device.udid === udid) {
          // runtime = "com.apple.CoreSimulator.SimRuntime.iOS-17-5"
          const m = runtime.match(/iOS-(\d+)-/i);
          if (m) return m[1];   // major version, e.g. "17"
        }
      }
    }
  } catch (_) {}
  return '18'; // safe fallback
}

const SIM_UDID   = getSimulatorUdid();
const IOS_VERSION = getSimulatorVersion(SIM_UDID);

export const config = {
  runner:   'local',
  hostname: APPIUM_HOST,
  port:     APPIUM_PORT,
  path:     '/',

  specs:   ['./specs/ios/**/*.spec.js', './specs/shared/**/*.spec.js'],
  exclude: [],

  capabilities: [{
    platformName:             'iOS',
    'appium:automationName':  'XCUITest',
    'appium:deviceName':      'iPhone Simulator',
    'appium:udid':            SIM_UDID,
    'appium:platformVersion': IOS_VERSION,
    'appium:bundleId':        'com.apple.Preferences',   // Settings — no IPA needed
    'appium:noReset':         true,
    'appium:newCommandTimeout':      120,
    'appium:wdaLaunchTimeout':       120000,
    'appium:wdaConnectionTimeout':   120000,
  }],

  framework:    'mocha',
  mochaOpts:    { ui: 'bdd', timeout: 120000 },
  reporters:    [['spec', { realtimeReporting: true }]],
  maxInstances: 1,
  connectionRetryTimeout: 180000,
  connectionRetryCount:   3,

  onPrepare() {
    console.log(`\n🍎  iOS tests → Appium at ${APPIUM_HOST}:${APPIUM_PORT}`);
    console.log(`    Simulator UDID: ${SIM_UDID}`);
    console.log(`    iOS version:    ${IOS_VERSION}\n`);
  },

  async afterTest(test, _ctx, { error }) {
    if (error) {
      const dir  = join(__dirname, 'screenshots');
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      const file = join(dir, `FAIL_ios_${test.title.replace(/\s+/g, '_')}_${Date.now()}.png`);
      try {
        await driver.saveScreenshot(file);
        console.log(`  📸 Screenshot: ${file}`);
      } catch (e) {
        console.log(`  ⚠️  Screenshot failed: ${e.message}`);
      }
    }
  },
};
