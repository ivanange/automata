const path = require("path");

module.exports = {
  lintOnSave: false,
  outputDir: "./gui/public",
  chainWebpack: config => {
    config
      .entry("app")
      .clear()
      .add("./gui/src/main.js")
      .end();
    config.resolve.alias
      .set("@", path.join(__dirname, "./gui/src"));
    config.module
      .rule('worker')
      .test(/worker\.js$/)
      .use("worker-loader")
      .loader("worker-loader?inline=true")
      .end();
    //config.module.rule('js').exclude.add(/worker\.js$/);

    //config.module.rule('worker').use("babel-loader").loader("babel-loader")
  }
};