const path = require('path')
const webpack = require('webpack')
const gulp = require('gulp')
const rename = require('gulp-rename')
const del = require('del')
const minimist = require('minimist')

// 获取命令参数 判断是哪个小程序
const agrs = minimist(process.argv.slice(2))
const appType = agrs.app_type || 'a' 

const paths = {
    src: {
        main: './src/**/*',
        pagesFiles: [`./src/pages-common/**/*`, `./src/pages-${appType}/**/*`],
        entry: `./src/app-${appType}.mina`, // 入口文件
        projectConfig: `./src/project.config.${appType}.json`, 
    },
    temp: {
        main: `./temp-${appType}`,
        pages: `./temp-${appType}/pages`,
    },
    dist: {
        main: './dist-' + appType,
    },
}


// 获取tina默认的webpack配置
const webpackConfig = require('./webpack.config')
webpackConfig.context = path.join(__dirname, paths.temp.main) // 替换tina默认webpack配置
webpackConfig.output.path = path.join(__dirname, paths.dist.main) // 替换tina默认的输出路径

function delDist(cb) { // 删除dist包里面除了 app.json|project.config.json 以外的全部文件
    return del(paths.dist.main + '/!(app.json|project.config.json)**', cb)
}

function delTemp(cb) { // 删除temp包里面的全部文件
    return del(paths.temp.main + '/**/*', cb)
}

function copyConfig() { // 复制当前小程序的project.config.js, 写入到temp文件夹里面
    return gulp.src(paths.src.projectConfig)
        .pipe(rename({
            basename: 'project.config',
        }))
        .pipe(gulp.dest(paths.dist.main))
}

function watchConfig() { // 开启配置文件变化的监听
    gulp.watch(paths.src.projectConfig, gulp.series(copyConfig))
    return copyConfig() // 第一次打包时候执行
}

function copySource() { // 将src下面的全部文件除了pages文件以外全部拷贝到temp目录下
    return gulp.src([paths.src.main, '!./src/pages-*/**/*'], {nodir: true})
        .pipe(gulp.dest(paths.temp.main))
}

function watchSource() { // 开启资源变化的监听
    gulp.watch(paths.src.main, gulp.series(copySource))
    return copySource()
}

function copyPages() { // 拿到pages-common 以及 对应的小程序pages包，打包到temp文件夹的pages中
    return gulp.src(paths.src.pagesFiles)
      .pipe(gulp.dest(paths.temp.pages))
}

function watchPages() { // 开启页面变化的监听
    gulp.watch(paths.src.pagesFiles, gulp.series(copyPages))
    return copyPages()
}

function copyApp() { // 拿到当前小程序对应的入口文件, 如app-a.mina, 将其改名为app.mina, 然后复制到temp
    return gulp.src(paths.src.entry)
      .pipe(rename({
        basename: 'app',
      }))
      .pipe(gulp.dest(paths.temp.main))
  }
  
function watchApp() { // 监听入口文件的变化
    gulp.watch(paths.src.entry, gulp.series(copyApp))
    return copyApp()
}

function watchWebpack(cb) {
    webpack(webpackConfig).watch({ // webpack打包
        aggregateTimeout: 600,
    }, (err, status) => {
        if (err) {
            console.log('webpack err' + err)
            throw err
        }
        cb()
    })
}

function buildWebpack(cb) {
    webpack(webpackConfig, (err, stats) => {
      if (err || stats.hasErrors()) {
        console.error(err);
        throw err
      }
      cb()
    });
  }

gulp.task('dev', gulp.series(
    gulp.parallel(
        delDist,
        delTemp,
    ),
    gulp.parallel(
        watchConfig,
        watchSource,
        watchPages,
        watchApp,
    ),
    watchWebpack
))

gulp.task('build', gulp.series(
    gulp.parallel(
        delDist,
        delTemp,
    ),
    gulp.parallel(
        watchConfig,
        watchSource,
        watchPages,
        watchApp,
    ),
    buildWebpack
))
