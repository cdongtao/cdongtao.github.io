---
title: Spring 框架2
tags: [Spring]
categories: [架构]
---

## 依赖注入(Dependency Injection)
注入方式：
1.使用构造器注入(xml配置)
2.setter方式注入(xml配置,传统方式)
3.注解方式(流行springBoot)
>3种方式都是手工装配依赖对象


### 手工装配依赖对象 && 自动装配依赖对象 
1.手工装配依赖对象，在这种方式中又有两种编程方式
```
在xml配置文件中，通过在bean节点下配置，如
<bean id="orderService" class="cn.itcast.service.OrderServiceBean">
<constructor-arg index=“0” type=“java.lang.String” value=“xxx”/>//构造器注入
<property name=“name” value=“zhao/>//属性setter方法注入
</bean>
```
2. 中在java代码使用@Autowired或@Resource注解方式进行装配。但我们需要在xml配置文件中配置以下信息：
```
<beans xmlns="http://www.springframework.org/schema/beans"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xmlns:context="http://www.springframework.org/schema/context"
xsi:schemaLocation="http://www.springframework.org/schema/beans
http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
http://www.springframework.org/schema/context
http://www.springframework.org/schema/context/spring-context-2.5.xsd">
<context:annotation-config/>//开启注解
</beans>
```
这个配置隐式注册了多个对注释进行解析处理的处理器:AutowiredAnnotationBeanPostProcessor，CommonAnnotationBeanPostProcessor，PersistenceAnnotationBeanPostProcessor，RequiredAnnotationBeanPostProcessor
注： @Resource注解在spring安装目录的lib\j2ee\common-annotations.jar







