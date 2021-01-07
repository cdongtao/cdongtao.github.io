---
title: npm 命令参数的区别
tags: [npm]
categories: [FrontEnd]
---


## 常用命令：

    npm init :创建package.json这个文件
    npm run dev :执行npm script中的命令
    npm install moduleName ： 安装模块到项目目录下
    npm install moduleName -g： -g 将模块安装到全局，具体安装到磁盘哪个位置，要看npm config prefix的位置。查看：npm config ls,修改：npm config set prefix.
    npm install moduleName --save：（简写：-S） -save 将模块安装到项目目录下，并在package文件的dependencies属性写入依赖。
    npm install moduleName --save-dev ：（简写：-D） -save-dev 将模块安装到项目目录下，并在package文件的devDependencies属性写入依赖。


## 命令的区别

   npm install moduleName 命令
    1. 安装模块到项目node_modules目录下。
    2. 不会修改package.json文件。
    3. 运行 npm install 初始化项目时不会下载模块。

    npm install moduleName -g 命令
    1. 安装模块到全局，不会在项目node_modules目录中保存模块包。
    2. 不会修改package.json文件。
    3. 运行 npm install 初始化项目时不会下载模块。

    npm install moduleName --save 命令
    1. 安装模块到项目node_modules目录下。
    2. 会在package.json文件的dependencies 属性将模块依赖写入。
    3. 运行 npm install 初始化项目时，会将模块下载到项目目录下。
    4. 运行npm install --production或者注明NODE_ENV变量值为production时，会自动下载模块到node_modules目录中。

    npm install  moduleName --save-dev 命令
    1. 安装模块到项目node_modules目录下。
    2. 会在package.json文件的devDependencies 属性将模块依赖写入。
    3. 运行 npm install 初始化项目时，会将模块下载到项目目录下。
    4. 运行npm install --production或者注明NODE_ENV变量值为production时，不会自动下载模块到node_modules目录中。

## 总结
使用原则:运行时需要用到的包使用--save，否则使用--save-dev。
devDependencies 属性下的模块是我们在开发时需要用的，比如项目中使用的 gulp ，压缩css、js的模块。这些模块在我们的项目部署后是不需要的，所以我们可以使用 -save-dev 的形式安装。
像 express 这些模块是项目运行必备的，应该安装在 dependencies 属性下，所以我们应该使用 -save 的形式安装。