---
title: 安装hexo的一些注意事项
date: 2020-01-16 22:09:05
tags: 个人记录
categories : Hexo安装
---

# 安装步骤：
1. 首先安装 
	`cnpm(Node.js)`
2. 然后安装hexo    
	`cnpm install hexo-cli -g`
3. 初始化一个hexo项目  
	`hexo init blog`
4. 添加配置文件
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

# 添加theme文件:
* 在github上找出自己喜欢的一个主题
* 用git命令clone下来
* 将文件放到themes文件夹，然后修改hexo文件的_config.yml
* 将themes文件夹里面的那个主题名称添加到theme这个标签之后
* 可以在theme文件夹里面修改_config.yml这个文件来获得想要的效果

# [设置主题theme doc教程](http://theme-next.iissnan.com/theme-settings.html#author-sites)
*  [对theme目录下_config.yml的tag/categories/archives标签进行释放](https://www.jianshu.com/p/3a05351a37dc)
*  [设置RSS标签教程](https://www.jianshu.com/p/a79422ab2013)需要安装： 
	`cnpm install hexo-generator-feed --save`
*  [日历功能教程](https://www.jianshu.com/p/b9665a8e8282)：需要安装为：
	`cnpm install hexo-generator-calendar --save`
*  主题内容设置：[Hexo+Next个人博客主题优化](https://www.jianshu.com/p/efbeddc5eb19)
*  设置好配置文件后,search功能安装：
	`cnpm install hexo-generator-searchdb --save`



