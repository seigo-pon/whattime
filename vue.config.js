module.exports = {
  publicPath: "./",
  assetsDir: "",
  outputDir: "docs",
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        productName: "What Time",
        appId: "jp.sample.seigo.whattime",
        extraResources: [
          "src/assets/*",
        ]
      }
    }
  }
}