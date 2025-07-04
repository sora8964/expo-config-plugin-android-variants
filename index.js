/* eslint-env node */
const {
    withAppBuildGradle,
    createRunOncePlugin,
  } = require('@expo/config-plugins');
  
  const withAndroidBuildVariants = (config) => {
    // 從 app.config.js 讀取基礎應用程式名稱
    const appName = config.name;
  
    return withAppBuildGradle(config, (modConfig) => {
      // 加上 (Dev) 後綴並準備寫入 gradle 檔案
      const devAppName = `${appName} (Dev)`;
      // 使用 JSON.stringify 來確保字串被正確引號包圍並逸出特殊字元
      const escapedDevAppName = JSON.stringify(devAppName);
  
      const buildGradle = modConfig.modResults.contents;
  
      // --- 冪等性檢查 ---
      const startComment = `// [expo-config-plugin-android-variants] - Start`;
      const endComment = `// [expo-config-plugin-android-variants] - End`;
  
      // 如果設定已存在，則直接返回，避免重複添加
      if (buildGradle.includes(startComment)) {
        return modConfig;
      }
  
      // 定義要插入的客製化設定，並用註解包圍
      const customConfig = `
              ${startComment}
              applicationIdSuffix ".dev"
              resValue "string", "app_name", ${escapedDevAppName}
              ${endComment}
      `;
  
      // 找到 debug buildType 的區塊，並插入我們的設定
      const anchor = `signingConfig signingConfigs.debug`;
      if (buildGradle.includes(anchor)) {
        modConfig.modResults.contents = buildGradle.replace(
          anchor,
          `${anchor}${customConfig}`
        );
      } else {
        console.warn(
          `[expo-config-plugin-android-variants] Warning: Could not find anchor to insert debug config in build.gradle.`
        );
      }
  
      return modConfig;
    });
  };
  
  module.exports = createRunOncePlugin(
    withAndroidBuildVariants,
    '@sora8964/expo-config-plugin-android-variants',
    '1.0.0' // 您的套件版本號
  );