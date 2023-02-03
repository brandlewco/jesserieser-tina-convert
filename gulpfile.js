/**
 * This is an example gulpfile.js for orchestrating a Webpack build alongside the Hugo static site generator.
 *
 * This example assumes you already have Webpack installed and configured in your project.
 *
 * To get started, install Gulp and BrowserSync with the following command:
 * npm install gulp browser-sync
 *
 * Then add this file to your project and name it gulpfile.js
 */

 const gulp = require("gulp");
 const webpack = require("webpack");
 const webpackConfig = require("./webpack.common.js"); // this should be the relative path to your Webpack config
 const util = require("util");
 const execFile = util.promisify(require("child_process").execFile);
 const browserSync = require("browser-sync").create();
 
 /**
  * Run webpack to build assets as specified in webpack config
  */
 function assets(cb) {
   return new Promise((resolve, reject) => {
     webpack(webpackConfig, (err, stats) => {
       if (err) {
         return reject(err);
       }
       if (stats.hasErrors()) {
         return reject(new Error(stats.compilation.errors.join("\n")));
       }
       resolve();
     });
   });
 }
 
 /**
  * returns a gulp task to run the ssg build depending on environment specified.
  *
  * @param string env production|development
  */
 function ssg(env) {
   if (env === "production") {
     return (hugo = cb => execFile("hugo"));
   }
   return (hugo = cb => execFile("hugo", ["-D", "-F"]));
 }
 
 /**
  * run dev server
  */
 function serve(cb) {
   browserSync.init(
     {
       server: "../dist", // this should be the relative path to the location where your SSG builds the HTML
       port: 8080,
       host: "0.0.0.0" // bind to 0.0.0.0:8080 to work with Forestry's Instant Previews
     },
     cb
   );
 }
 
 function reload(cb) {
   browserSync.reload();
   cb();
 }
 
 function watch(cb) {
   return gulp.watch(
     "**/*", // watch everything...
     {
       ignored: [
         // ...except for things generated by the build process.
         "dist/**/*",
       ]
     },
     // when something changes, rebuild + reload
     gulp.series(assets, ssg("development"), reload)
   );
 }
 
 exports.build = gulp.series(assets, ssg("production"));
 exports.develop = gulp.series(assets, ssg("development"), serve, watch);