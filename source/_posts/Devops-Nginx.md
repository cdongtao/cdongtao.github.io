---
title: Nginx基础使用教程
tags: [Plugin,Nginx]
categories: [PluginTool]
---
[除了负载均衡，Nginx还可以做很多，限流、缓存、黑白名单等](https://www.toutiao.com/i6692127248272589315)
[Nginx 反向代理和负载均衡策略实战案例](https://mp.weixin.qq.com/s/ZhNzkNC2Kxs5OnRni21Z5w)

## Nginx基础使用教程
### 什么是 Nginx
Nginx (engine x) 是一款轻量级的 Web 服务器 、反向代理服务器及电子邮件（IMAP/POP3）代理服务器。
### 正向代理 && 反向代理
，反向代理隐藏真实服务端
#### 什么是正向代理
正向代理:意思是一个位于客户端和原始服务器(origin server)之间的服务器，为了从原始服务器取得内容，客户端向代理发送一个请求并指定目标(原始服务器)，然后代理向原始服务器转交请求并将获得的内容返回给客户端。客户端才能使用正向代理。<font color ="red">正向代理隐藏真实客户端</font>
* 例子:用浏览器访问 google网站时，被残忍的block，于是你可以在国外搭建一台代理服务器，让代理帮我去请求google.com，代理把请求返回的相应结构再返回给我。
![正向代理](/devops/1.png "正向代理")

#### 什么是反向代理
反向代理（Reverse Proxy）:是指以代理服务器来接受 internet 上的连接请求，然后将请求转发给内部网络上的服务器，并将从服务器上得到的结果返回给 internet 上请求连接的客户端，此时代理服务器对外就表现为一个反向代理服务器。<font color ="red">反向代理隐藏了真实的服务端</font>
* 例子:当我们请求 www.baidu.com 的时候，就像拨打10086一样，背后可能有成千上万台服务器为我们服务，但具体是哪一台，你不知道，也不需要知道，你只需要知道反向代理服务器是谁就好了，www.baidu.com 就是我们的反向代理服务器，反向代理服务器会帮我们把请求转发到真实的服务器那里去。Nginx就是性能非常好的反向代理服务器，用来做负载均衡。
![反向代理](/devops/2.png "反向代理")

### Nignx 安装
[Nignx下载](https://nginx.org/en/download.html)
[Nignx安装及配置教程](https://www.runoob.com/linux/nginx-install-setup.html)






