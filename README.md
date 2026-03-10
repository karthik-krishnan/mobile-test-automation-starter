# Mobile Test Environment

Local setup for running Appium tests against an **Android emulator** and **iOS Simulator** on macOS. A single script starts everything; two commands run the tests.

---

## Prerequisites

Install these **once** before running anything. Each tool only needs to be installed one time.

### 1. Android Studio
Downloads the Android SDK, emulator, and all required command-line tools.

👉 **Download:** https://developer.android.com/studio

After installing, open Android Studio once and let it finish its first-launch SDK setup before running `local-setup.sh`.

---

### 2. Xcode
Required for the iOS Simulator and the `xcrun` command-line tools.

👉 **Install:** Open the **Mac App Store** and search for **Xcode**

After installing, open Xcode once to accept the licence agreement. You can quit it immediately after.

---

### 3. Node.js (LTS)
Required to run the test runner (WebdriverIO).

👉 **Download:** https://nodejs.org — click the large **LTS** button

---

## Start the Environment

Run this from the root of the repo:

```bash
bash local-setup.sh
```

This will:
- Start (or reuse) an Android emulator
- Start (or reuse) an iOS Simulator
- Install Appium and its drivers if not already installed
- Start the Appium server on port 4723

**First run** takes 2–5 minutes — it downloads a ~1 GB Android system image. Every run after that is fast; the script skips anything already running.

When everything is ready you'll see:

```
╔══════════════════════════════════════════════╗
║   ✅  Everything is ready!                   ║
╠══════════════════════════════════════════════╣
║   Appium:   http://localhost:4723            ║
║   Android:  emulator-5554                   ║
║   iOS UDID: XXXXXXXX-XXXX-XXXX-XXXX-...    ║
╚══════════════════════════════════════════════╝
```

---

## Run the Tests

Install test dependencies first (one-time only):

```bash
cd tests && npm install
```

**Android tests:**

```bash
npm run test:android
```

**iOS tests:**

```bash
npm run test:ios
```

### What the tests validate

Each suite runs 3 checks:

1. Appium connects to the device and reports the correct platform
2. The Settings app launches successfully
3. The Home button works and the app returns to the foreground

---

## Stop Everything

```bash
bash local-setup.sh stop
```

This kills the Appium server and any emulator/simulator processes started by the setup script.

---

## Troubleshooting

**Appium won't start or tests can't connect:**
```bash
cat /tmp/appium.log
```

**Android emulator won't boot:**
```bash
cat /tmp/android-emulator.log
```

**Check what's currently running:**
```bash
adb devices                          # should show emulator-5554
curl http://localhost:4723/status    # should return {"ready":true,...}
appium driver list --installed       # should list uiautomator2 and xcuitest
```

**Change the Appium port** (if 4723 is in use):
```bash
APPIUM_PORT=4724 bash local-setup.sh
APPIUM_PORT=4724 npm run test:android
```

---

## Project Structure

```
mobile_simulator_env/
├── local-setup.sh          # starts Android emulator, iOS Simulator, and Appium
├── tests/
│   ├── package.json        # test dependencies (WebdriverIO + Mocha)
│   ├── wdio.android.conf.js  # WebdriverIO config for Android
│   ├── wdio.ios.conf.js      # WebdriverIO config for iOS
│   ├── wdio.conf.js          # default config (same as android, used by npm test)
│   ├── specs/
│   │   ├── android/
│   │   │   └── setup-validation.spec.js
│   │   └── ios/
│   │       └── setup-validation.spec.js
│   └── screenshots/        # failure screenshots (auto-created on test failure)
└── logs/                   # container / CI logs
```
