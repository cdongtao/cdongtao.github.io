---
title: MPA与SPA及SEO,SSR问题解决
tags: [React,SEO,SSR]
categories: [FrontEnd]
---

## MPA(Multi-page Application)与SPA(Single-page Application)
MPA (Multi-page Application):传统JS,JQ,JSP
多页面应用:
    优点：首屏加载快，只需要当前的一个页面内容;SEO(Search Engine Optimization)效果好,便于搜索引擎爬虫爬数据
    缺点：每一次url变化,要重新加载要切换到服务器重新返回不同的页面，所以导致每次页面切换不流畅;页面间传递数据,依赖URL、cookie或者localStorge, 实现麻烦 	

SPA (Single-page Application):
单页面应用:VUE,React,Angular
    spa开发由于是只有一个页面，所以其内部是组件化的,各模块之间的跳转其实就是组件之间的切换
    优点：由于首次加载时已经把所有的组件都加载运行过，所以之后的组件切换就非常流畅,前后端分离,减轻服务器压力,增强用户体验,
　  缺点：SEO(Search Engine Optimization)效果差,由于是组件间化开发，每个功能模块都是必不可少的，所以在项目的第一次运行中，需要下载加载各组件，所以第一次加载就相对比较耗时，这就是spa开发中首屏加载过慢的主要原因
    SEO优化:Vue实现预渲染的方式是通过prerender-spa-plugin插件实现:npm install --save prerender-spa-plugin

### SSR(Server Side Render)服务器端渲染
#### 何会出现SSR?
##### 解决SEO问题：
　　纯前端的项目，由于需要页面加载完成后再去拉取数据进行渲染，大部分搜索引擎没法读取页面内容。特别是SPA项目，更是无法读取到每个路由页面的页面Tite。
##### 首屏渲染速度：
　　纯前端项目，先要加载Js，再通过Js去加载数据，这两部分网络传输都需要时间，所以难以避免出现页面白屏时间，体验不友好。
### SSR带来哪些挑战？
多维护一层server：
    要用SSR，你就得准备一个node server（express，koa...），这就不可避免地加大了性能、运维等挑战。
代码兼容：
    浏览器里的好多代码在server side render过程中是会报错的，所以你得花很多精力去处理其中的兼容性。
技术限制：
　　虽然现在Vue、React 等流行框架都出台了相应的SSR解决方案，但如果你不用这些框架怎么呢，自己撸一套？还有就算用这些解决方案，难免也有些限制让人束手束脚，踩坑不可避免。
终上所述，SSR很有用不错，但也不可避免地加大了很多开发和维护的成本

## 不用SSR如何解决SEO问题？
注:用Prerender：(这里不是指webpack的那个prerender插件!)
[一个开源prerender项目的链接](https://github.com/prerender/prerender)

### 具体的思路就是：
　　1.部署一个独立的prerender的server（上面贴出来的，现成的只需要配置、部署一下），这个独立的server就是专门为各种爬虫做预渲染，可以被多个项目共用。
　　2.在你的前端项目的nginx上加一段配置，通过useragent检测，如果是爬虫，就将地址代理到这个server，这个server会将页面渲染好了返回给爬虫。如果前端项目是通过express等渲染，也有prerender相应的中间件代理到这个server。只需要部署一个prerender server，然后所有的前端项目都可以用它！
注：这个prerender开源项目以前使用 phantomjs，后面用 chrome 的无头浏览器改写，当然牛逼的人自己撸一个也不是很麻烦。

## 解决首屏渲染问题
### 方法一
单独搭一个前端渲染 server，但是这个server其实不必要SSR那么复杂
    用koa写一个node server
    server 创建一个路由做两件事：把页面返回给浏览器、把页面对应的初始化JSON数据放在页面上一起返回。
    页面直接用JSON数据渲染。
但是这种方法还是要多维护一层server，不是很推荐，所有推荐后面的这种方法

### 方法二
通过js的方式初始化数据
后端写一个接口，专门用来初始化页面数据(`api/init-page.js?page=xx&a=xx&b=xx`), 但是接口返回的内容是js的方式：`window.initData={}`。
前端进入页面的时候动态加载初始化数据js：`var page = 'a'; document.write('<script src="api/init-page.js?page=' + page +'></script>')`。
这样，页面加载完成的时候，初始化数据也加载完成，可server段渲染差不多。和调接口的区别：html文档头部加载出来之后即开始调用数据，数据出来之后才会渲染页面，类似服务端渲染`页面加载中`的过程。

###　首屏渲染时间对比：
服务端渲染：请求发送时间 + 服务器渲染时间 + 页面返回时间。
通过js的方式初始化数据：请求发送时间 +页面返回时间 + js加载时间。



