/* eslint-env node */
const {
  withAppBuildGradle,
  withAndroidManifest,
  createRunOncePlugin,
} = require('@expo/config-plugins');

const withAndroidBuildVariants = (config) => {
  const appName = config.name;
  const packageName = config.android?.package;
  if (!packageName) {
    throw new Error(
      '[expo-config-plugin-android-variants] Could not find android.package in app.config.js'
    );
  }

  // --- 步驟 1: 修改 build.gradle ---
  config = withAppBuildGradle(config, (modConfig) => {
    const buildGradle = modConfig.modResults.contents;
    const devAppName = `${appName} (Dev)`;
    const escapedDevAppName = JSON.stringify(devAppName);

    const startComment = `// [expo-config-plugin-android-variants] - Start`;
    const endComment = `// [expo-config-plugin-android-variants] - End`;

    if (buildGradle.includes(startComment)) {
      return modConfig;
    }

    const customConfig = `
    ${startComment}
    applicationIdSuffix ".dev"
    resValue "string", "app_name", ${escapedDevAppName}
    ${endComment}
  `;

    // **使用正則表達式來確保我們只修改 buildTypes 中的 debug 區塊**
    const insertionRegex = /(buildTypes\s*{[\s\S]*?debug\s*{)/;
    if (insertionRegex.test(buildGradle)) {
      modConfig.modResults.contents = buildGradle.replace(
        insertionRegex,
        `$1${customConfig}`
      );
    } else {
      console.warn(
        `[expo-config-plugin-android-variants] Warning: Could not find \`buildTypes.debug\` block in build.gradle.`
      );
    }

    return modConfig;
  });

  // --- 步驟 2: 修改 AndroidManifest.xml ---
  return withAndroidManifest(config, (modConfig) => {
    const mainActivity =
      modConfig.modResults.manifest.application[0].activity.find(
        (activity) => activity.$['android:name'] === '.MainActivity'
      );

    if (mainActivity && mainActivity['intent-filter']) {
      const dynamicSchemeData = {
        $: { 'android:scheme': '\${applicationId}' },
      };

      const browsableFilter = mainActivity['intent-filter'].find(
        (filter) =>
          filter.category &&
          filter.category.some(
            (c) => c.$['android:name'] === 'android.intent.category.BROWSABLE'
          )
      );

      if (browsableFilter) {
        if (!browsableFilter.data) {
          browsableFilter.data = [];
        }

        const schemeExists = browsableFilter.data.some(
          (d) => d.$['android:scheme'] === '\${applicationId}'
        );

        if (!schemeExists) {
          browsableFilter.data.push(dynamicSchemeData);
        }
      }
    }

    return modConfig;
  });
};

module.exports = createRunOncePlugin(
  withAndroidBuildVariants,
  '@sora8964/expo-config-plugin-android-variants',
  '1.0.4'
);