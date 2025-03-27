import gulp from "gulp";
import ejs from "gulp-ejs";
import rename from "gulp-rename";
import browserSync from "browser-sync";
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import sourcemaps from "gulp-sourcemaps";
import cleanCSS from "gulp-clean-css";
import uglify from "gulp-uglify";
import rev from "gulp-rev";
import revReplace from "gulp-rev-replace";
import fs from "fs";
import autoprefixer from "gulp-autoprefixer";
import groupCssMediaQueries from "gulp-group-css-media-queries"; // パッケージをインポート
import { navData, cardData } from "./src/data/data.js"; // ✅ データをインポート

const bs = browserSync.create();
const sass = gulpSass(dartSass);

// EJS Compilation Task
const CompileEjs = () => {
  let manifest = {};
  if (fs.existsSync("rev-manifest.json")) {
    manifest = JSON.parse(fs.readFileSync("rev-manifest.json", "utf8"));
  }

  return gulp
    .src("src/views/index.ejs")
    .pipe(
      ejs(
        {
          title: "サイトタイトル",
          navData,
          cardData,
          cssPath: manifest["css/main.css"] || "css/main.css",
          jsPath: manifest["js/index.js"] || "js/index.js",
        },
        {},
        { ext: ".html" }
      )
    )
    .pipe(rename({ extname: ".html" }))
    .pipe(gulp.dest("dist"));
};

// SCSS Compilation and Cache Busting Task
const CompileSass = () => {
  return gulp
    .src("src/styles/main.scss")
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer({ overrideBrowserslist: ["last 2 versions"], grid: true, cascade: false }))
    .pipe(cleanCSS())
    .pipe(groupCssMediaQueries()) // メディアクエリをグループ化
    .pipe(rev())
    .pipe(rename("main.css"))
    .pipe(sourcemaps.write(".")) // ソースマップを同じフォルダに出力
    .pipe(gulp.dest("dist/css"))
    .pipe(rev.manifest("rev-manifest.json", { merge: true }))
    .pipe(gulp.dest(".")); // マニフェストをルートディレクトリに出力
};

// JavaScript Minification and Cache Busting Task
const MinifyJs = () => {
  return gulp
    .src("src/js/index.js")
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rev())
    .pipe(rename("index.js"))
    .pipe(sourcemaps.write(".")) // ソースマップを同じフォルダに出力
    .pipe(gulp.dest("dist/js"))
    .pipe(rev.manifest("rev-manifest.json", { merge: true }))
    .pipe(gulp.dest(".")); // マニフェストをルートディレクトリに出力
};


// 画像コピータスク
const CopyImages = () => {
  return gulp
    .src("src/img/**/*",{encoding: false}) // src/img 配下のすべてのファイルを取得
    .pipe(gulp.dest("dist/img")); // dist/img にコピー
};

// ファビコンコピータスク
const CopyFavicon = () => {
  return gulp
    .src("favicon.ico") // ルートディレクトリに配置しているファビコンを取得
    .pipe(gulp.dest("dist")); // dist フォルダにコピー
};


// HTML Cache Busting Links
const RevUpdateHtml = () => {
  const manifest = gulp.src("rev-manifest.json", { allowEmpty: true });
  return gulp
    .src("dist/**/*.html")
    .pipe(revReplace({ manifest }))
    .pipe(gulp.dest("dist"));
};

// Server and File Watcher
const Server = () => {
  bs.init({
    server: {
      baseDir: "dist", // サーバーのルートディレクトリ
    },
    open: true,
    notify: false,
  });

  // ファイル変更を監視して自動更新
  gulp.watch("src/views/**/*.ejs", gulp.series(CompileEjs, RevUpdateHtml)).on("change", bs.reload);
  gulp.watch("src/styles/**/*.scss", gulp.series(CompileSass, RevUpdateHtml)).on("change", bs.reload);
  gulp.watch("src/js/**/*.js", gulp.series(MinifyJs, RevUpdateHtml)).on("change", bs.reload);
};

// Build Task
export const build = gulp.series(CompileSass, MinifyJs, CompileEjs, RevUpdateHtml, CopyImages, CopyFavicon);

// Watch Task
export const watch = gulp.series(build, Server);

// Default Task
export default watch;
