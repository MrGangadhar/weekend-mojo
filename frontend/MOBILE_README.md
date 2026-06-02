Capacitor mobile build notes

Steps to produce an Android app (Windows):

1. Ensure you have Node.js and Android Studio installed.
2. From the `frontend` folder, install deps:

```bash
cd frontend
npm install
```

3. Initialize Capacitor (one-time):

```bash
npm run cap:init
```

4. Add Android platform and open in Android Studio:

```bash
npm run cap:add:android
npm run cap:open:android
```

5. Or use the helper to build and open after a web build:

```bash
npm run build:android
```

Notes:
- The web build output is `dist` (Vite). Capacitor copies `dist` into the native project.
- For live-web dev, you can set a development `server.url` in `capacitor.config.json` to your dev server, but Android emulator must reach that host (use 10.0.2.2).
- WebSockets and API endpoints must be accessible from the device/emulator (use HTTPS for production).
- Publishing to Play Store requires signing the APK/AAB from Android Studio.
