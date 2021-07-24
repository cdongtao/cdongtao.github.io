---
title: Spring boot 配置文件位置
tags: [config,Template]
categories: [Project]
---

## Spring boot 的Application.properties 配置文件可以是以下几个地方：
classpath:/,classpath:/config/,file:./,file:./config/.

但要注意的是加载的顺序是倒过来的：
file:./config/
file:./
classpath:/config/
classpath:/

可以通过spring.config.location增加自定义的配置文件存放目录，比如：
classpath:/custom-config/,file:./custom-config/

那么最终的寻找路径是：
file:./custom-config/
classpath:custom-config/
file:./config/
file:./
classpath:/config/
classpath:/

可以通过spring.config.name 修改默认的配置文件名称，比如：
$ java -jar myproject.jar --spring.config.name=myproject

可以通过spring.config.location指定配置文件，比如：
$ java -jar myproject.jar --spring.config.location=classpath:/default.properties,classpath:/override.properties

可以通过spring.config.location指定配置文件的位置，比如：
$ java -jar myproject.jar --
spring.config.additional-location=classpath:/custom-config/,file:./custom-config/







