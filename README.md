# Expo Config Plugin: Android Variants

`@sora8964/expo-config-plugin-android-variants`

This is an [Expo Config Plugin](https://docs.expo.dev/guides/config-plugins/) that automatically configures Android build variants in `android/app/build.gradle`. It allows you to have debug and release builds of your app installed on the same device with different names and application IDs.

## The Problem

When developing a React Native app with Expo (Bare Workflow), it's crucial to be able to install a debug/development build alongside a production build from the app store. Manually editing `build.gradle` to add an `applicationIdSuffix` and change the app name is tedious and error-prone, as these changes are overwritten every time `npx expo prebuild --clean` is run.

This plugin automates that process.

## Installation

After creating this package, you will typically host it on GitHub or npm.

**To install from a private GitHub repository:**
```bash
npm install git+ssh://git@github.com:sora8964/expo-config-plugin-android-variants.git
```
*(Replace the URL with your actual repository URL)*

**To install from a local path for testing:**
```bash
# In your main project (e.g., galaxia-info), run:
npm install R:/sync/workspace/@sora8964/expo-config-plugin-android-variants
```

## Configuration

Add the package name to the `plugins` array in your `app.config.js`.

```js
// app.config.js
module.exports = {
  expo: {
    name: "Galaxia Info",
    slug: "galaxia-info",
    plugins: [
      // other plugins
      "@sora8964/expo-config-plugin-android-variants",
    ],
  },
};
```

## Usage

Once installed and configured, the plugin works automatically during `npx expo prebuild`.

After running the command, you can inspect `android/app/build.gradle`. The `buildTypes.debug` block will be modified to include the `applicationIdSuffix` and a `resValue` for the app name.

**Example result in `build.gradle`:**
```groovy
buildTypes {
    debug {
        signingConfig signingConfigs.debug
        // [expo-config-plugin-android-variants] - Start
        applicationIdSuffix ".dev"
        resValue "string", "app_name", "\"MY App (Dev)\""
        // [expo-config-plugin-android-variants] - End
    }
    // ...
}
```

This ensures that your debug build has the application ID `com.your.package.dev` and the display name "My App (Dev)", allowing it to coexist with the release version.