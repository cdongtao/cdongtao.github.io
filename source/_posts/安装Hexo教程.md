---
title: 安装Hexo教程
date: 2020-01-16 22:09:05
tags: Hexo安装
categories: Hexo安装
---

# 安装步骤：

1. 首先安装
   `cnpm(Node.js)`
2. 然后安装 hexo  
   `cnpm install hexo-cli -g`
3. 初始化一个 hexo 项目  
   `hexo init blog`
4. 常用命令
```
	清理缓存文件:hexo clean 
	生成静态文件:hexo generate or hexo g
	启动本地服务器:hexo server or hexo s
	部署站点，在本地生成.deploy_git文件夹，并将编译后的文件上传至 GitHub:hexo deploy or hexo d
```


5. 添加配置文件

```
	cnpm install --save
	hexo-renderer-jade
	hexo-renderer-scss
	hexo-generator-feed
	hexo-generator-sitemap
	hexo-browsersync
	hexo-generator-archive
```

5. 安装
   `cnpm install`

# 添加 theme 文件:

- 在 github 上找出自己喜欢的一个主题
- 用 git 命令 clone 下来
- 将文件放到 themes 文件夹，然后修改 hexo 文件的\_config.yml
- 将 themes 文件夹里面的那个主题名称添加到 theme 这个标签之后
- 可以在 theme 文件夹里面修改\_config.yml 这个文件来获得想要的效果

# [设置主题 theme doc 教程](http://theme-next.iissnan.com/theme-settings.html#author-sites)

- [对 theme 目录下\_config.yml 的 tag/categories/archives 标签进行释放](https://www.jianshu.com/p/3a05351a37dc)
- [设置 RSS 标签教程](https://www.jianshu.com/p/a79422ab2013)需要安装：
  `cnpm install hexo-generator-feed --save`
- [日历功能教程](https://www.jianshu.com/p/b9665a8e8282)：
  [教程](https://www.jianshu.com/p/5f19fc242c36):
  需要安装为：
  `cnpm install hexo-generator-calendar --save`
- 主题内容设置：[Hexo+Next 个人博客主题优化](https://www.jianshu.com/p/efbeddc5eb19)
- 设置好配置文件后,search 功能安装：
  `cnpm install hexo-generator-searchdb --save`
