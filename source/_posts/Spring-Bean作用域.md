---
title: Beans作用域
tags: [Beans,Controller]
categories: [Spring]
---

## Spring的Controller是单例还是多例？怎么保证并发的安全
### 解决方案
* 不要在controller中定义成员变量。
* 万一必须要定义一个非静态成员变量时候，则通过注解@Scope(“prototype”)，将其设置为多例模式。
* 在Controller中使用ThreadLocal存放变量

## spring bean作用域有以下5个：
singleton: 单例模式，当spring创建applicationContext容器的时候，spring会欲初始化所有的该作用域实例，加上lazy-init就可以避免预处理;
prototype： 原型模式，每次通过getBean获取该bean就会新产生一个实例，创建后spring将不再对其管理；(下面是在web项目下才用到的)
request： 搞web的大家都应该明白request的域了吧，就是每次请求都新产生一个实例，和prototype不同就是创建后，接下来的管理，spring依然在监听;
session: 每次会话，同上;
global session: 全局的web域，类似于servlet中的application。

