const gulp = require('gulp')

const { src, dest, parallel, series, watch } = require('gulp')
const del = require('del')
const browserSync = require('browser-sync')

const loadPlugins = require('gulp-load-plugins') //导出一个方法
const plugins = loadPlugins()

const sass = require('gulp-sass')(require('sass'))

//const babel = require('gulp-babel')
//const swig = require('gulp-swig')
//const imagemin = require('gulp-imagemin')

// yarn add gulp-load-plugins --dev

//热更新开发服务器 yarn add browser-sync --dev
const bs = browserSync.create()

const cwd = process.cwd()
//所在工作目录

let config = {
  //default
  build: {
    src: 'src',
    dist: 'dist',
    temp: 'temp',
    public: 'public',
    paths: {
      styles: 'assets/styles/*.scss',
      scripts: 'assets/scripts/*.js',
      pages: '*.html',
      images: 'assets/images/**',
      fonts: 'assets/fonts/**'
    }
  }
}

try {
  const loadConfig = require(`${cwd}/pages.config.js`)
  config = Object.assign({}, config, loadConfig)
} catch(e) {}

const clean = () => {
    return del([config.build.dist, config.build.temp])
}

const style = () => {
    return src(config.build.paths.styles, {base: config.build.src, cwd: config.build.src})
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({stream: true})) 

}

const script = () => {
    return src(config.build.paths.scripts, {base: config.build.src, cwd: config.build.src})
    .pipe(plugins.babel({ presets: [require('@babel/preset-env')]}))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({stream: true})) 
}
//require先到index.js所在目录找

//html yarn add gulp-plugins.swig --dev
//cnpm i -D gulp-plugins.imagemin@7.0.0


const page = () => {
    return src(config.build.paths.pages, {base: config.build.src, cwd: config.build.src})
    .pipe(plugins.swig({data: config.data}))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({stream: true})) 

}

//无损压缩
const image = () => {
    return src(config.build.paths.images, { base: config.build.src, cwd: config.build.src})
      .pipe(plugins.imagemin())
      .pipe(dest(config.build.dist))
  }


const font = () => {
    return src(config.build.paths.fonts, { base: config.build.src, cwd: config.build.src })
      .pipe(plugins.imagemin())
      .pipe(dest(config.build.dist))
  }

const extra = () => {
    return src('**', {base: config.build.public, cwd: config.build.public})
    .pipe(dest(config.build.dist))
}

//yarn add fs --dev
//yarn add del --dev

const serve = () => {
    watch(config.build.paths.styles, {cwd: config.build.src },style)
    watch(config.build.paths.scripts, {cwd: config.build.src }, script)
    watch(config.build.paths.pages, {cwd: config.build.src }, page)
    // watch('src/assets/images/**', image)
    // watch('src/assets/fonts/**',font)
    // watch('public/**', extra)
    //开发阶段没有区别，减少构建过程
    watch([
      config.build.paths.images, 
      config.build.paths.fonts, 
      
    ], {cwd: config.build.src }, bs.reload)

    watch('**',  {cwd: config.build.public },bs.reload )

    bs.init({
        notify: false, 
        port: 2080,
        //files: 'dist/**', 用了reload不需要files了
        //open: false, 自动打开
        server: {  
            baseDir: [config.build.temp, config.build.dist, config.build.public],
            routes: {
                '/node_modules': 'node_modules'
            }
            //优先于basedir
        }
    })
}

//yarn add gulp-htmlmin gulp-uglify gulp-clean-css --dev
//yarn add gulp-if --dev

const useref = () => {
    return src(config.build.paths.pages, {base: config.build.temp, cwd: config.build.temp })
    .pipe(plugins.useref({searchPath: [config.build.temp, '.']}) )
    //html js css
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({ 
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true
    })))
    .pipe(dest(config.build.dist)) //文件读写冲突可能
}

const compile = parallel(style, script, page)
const build = series(
    clean, 
    parallel(
        series(compile, useref), 
        image, 
        font, 
        extra
        ))
//prod
const develop = series(compile,serve)
//dev
module.exports = {
    clean,
    build,
    develop,
    
    
}

//yarn add gulp-useref --dev