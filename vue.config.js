const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");


function resolve(dir){
  return path.join(__dirname,dir)//path.join(__dirname)设置绝对路径
}
// Generate pages object
const pagesObj = {};

const chromeName = ["popup", "options", "background"];

chromeName.forEach(name => {
  pagesObj[name] = {
    entry: `src/${name}/index.js`,
    template: "public/index.html",
    filename: `${name}.html`,
    inject: true,
  };
});
// chromeName.forEach(name => {
//   pagesObj[name] = {
//     entry: `src/${name}/index.js`,
//     template: "public/index.html",
//     filename: `${name}.html`
//   };
// });
const plugins =
  process.env.NODE_ENV === "development"
    ? [
        {
          from: path.resolve("src/manifest.production.json"),
          to: `${path.resolve("dist")}/manifest.json`
        }
      ]
    : [
        {
          from: path.resolve("src/manifest.development.json"),
          to: `${path.resolve("dist")}/manifest.json`
        }
      ];

module.exports = {
  pages: pagesObj,
  configureWebpack: {
    plugins: [CopyWebpackPlugin(plugins)]
  },
  chainWebpack:(config)=>{
    config.resolve.alias
    .set('@',resolve('./src'))
    //set第一个参数：设置的别名，第二个参数：设置的路径
　　　　
}
};
