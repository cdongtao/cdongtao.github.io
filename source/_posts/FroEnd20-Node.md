---
title: nvm安装（Windows篇）
tags: [Node-JS]
categories: [FrontEnd]
---

## nvm
* node version manager（node版本管理工具）.通过将多个node 版本安装在指定路径，然后通过 nvm 命令切换时，就会切换我们环境变量中 node 命令指定的实际执行的软件路径。
使用场景：比如我们手上同时在做好几个项目，这些项目的需求都不太一样，导致了这些个项目需要依赖的nodejs版本也不同，这种情况下，我们就可以通过nvm来切换nodejs的版本，而不需要频繁地下载/卸载不同版本nodejs来满足当前项目的要求
* [windows系统下的nvm 安装](https://github.com/coreybutler/nvm-windows/releases)

## 常用nvm命令
* nvm list 命令 - 显示版本列表
```
nvm list // 显示已安装的版本（同 nvm list installed）
nvm list installed // 显示已安装的版本
nvm list available // 显示所有可以下载的版本
```

* nvm install 命令 - 安装指定版本nodejs
```
nvm install 14.5.0 // 安装14.5.0版本node
nvm install latest // 安装最新版本node
```

* nvm use 命令 - 使用指定版本node
nvm use 14.5.0 // 使用14.5.0版本node

* nvm uninstall 命令 - 卸载指定版本 node
nvm uninstall 14.5.0 // 卸载14.5.0版本node

## 其他命令
1. nvm arch ：显示node是运行在32位还是64位系统上的
2. nvm on ：开启nodejs版本管理
3. nvm off ：关闭nodejs版本管理
4. nvm proxy [url] ：设置下载代理。不加可选参数url，显示当前代理。将url设置为none则移除代理。
5. nvm node_mirror [url] ：[默认node镜像](https://nodejs.org/dist/)如果不写url，则使用默认url。设置后可至安装目录settings.txt文件查看，也可直接在该文件操作。
6. nvm npm_mirror [url] ：[默认npm镜像](https://github.com/npm/cli/archive/]如果不写url，则使用默认url。设置后可至安装目录settings.txt文件查看，也可直接在该文件操作。
7. nvm root [path] ：设置存储不同版本node的目录。如果未设置，默认使用当前目录。
8. nvm version ：显示nvm版本。version可简化为v。

