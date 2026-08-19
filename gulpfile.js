const gulp = require("gulp");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const header = require('gulp-header');
const fs = require("fs");
const pkgJSON = require("./package.json");

const comment = 
`/**
* @name ${pkgJSON.name}
* @version ${pkgJSON.version}
* @copyright ${new Date().getFullYear()} 
* @author ${pkgJSON.author}
* @license ${pkgJSON.license}
*/
`;

const minify = name =>
  gulp
    .src(`./src/${name}.js`)
    .pipe(concat(`${name}.min.js`))
    // .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(uglify())
    .pipe(header(comment))
    .pipe(gulp.dest("dist"));

gulp.task("compile:olum", () => minify("olum"));
gulp.task("compile:vdom", () => minify("vdom"));
gulp.task("compile:transition", () => minify("transition"));
gulp.task("compile", gulp.parallel(["compile:olum", "compile:vdom", "compile:transition"]));

gulp.task("copy", () => gulp.src(["./src/olum.js", "./src/vdom.js", "./src/transition.js"]).pipe(header(comment)).pipe(gulp.dest("dist")));

gulp.task("version", (done) => {
  const file = "./src/olum.js";
  const src = fs.readFileSync(file, "utf8");
  const out = src.replace(/(version:\s*")(?:\{olum_version\}|[^"]*)(")/, `$1${pkgJSON.version}$2`);
  if (out !== src) fs.writeFileSync(file, out);
  done();
});

gulp.task("default", gulp.series(["version", "copy", "compile"]));
