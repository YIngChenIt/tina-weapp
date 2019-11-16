# tina + gulp + webpack 的多小程序集成方案

## 项目说明

小程序a的页面放在`pages-a`目录下, 小程序b的页面放在`pages-b`的目录下, 多个小程序的共有页面放在`pages-common`目录下

## 项目启动

`npm i`

`npm run dev:a` 开发环境编译小程序a, 生成的`dist-a`用法小程序开发者工具打开预览效果

`npm run dev:b` 开发环境编译小程序b, 生成的`dist-b`用法小程序开发者工具打开预览效果

`npm run build:a` 生产环境编译小程序a

`npm run build:b` 生产环境编译小程序b