---
title: Assert关键字
tags: [Assert]
categories: [SpringBoot]
---


## Assert作用
Junit测试框架中Assert类就是实现断言的工具，主要作用如下：单元测试用于判断某个特定条件下某个方法的行为；执行单元测试为了证明某段代码的执行结果和期望的一致，下面介绍Junit测试库中几种常用的断言
## 陷阱
assert关键字用法简单，但是使用assert往往会让你陷入越来越深的陷阱中。应避免使用。笔者经过研究，总结了以下原因：
* assert关键字需要在运行时候显式开启才能生效，否则你的断言就没有任何意义。而现在主流的Java IDE工具默认都没有开启-ea断言检查功能。这就意味着你如果使用IDE工具编码，调试运行时候会有一定的麻烦。并且，对于Java Web应用，程序代码都是部署在容器里面，你没法直接去控制程序的运行，如果一定要开启-ea的开关，则需要更改Web容器的运行配置参数。这对程序的移 植和部署都带来很大的不便。
* 用assert代替if是陷阱之二。assert的判断和if语句差不多，但两者的作用有着本质的区别：assert关键字本意上是为测试 调试程序时使用的，但如果不小心用assert来控制了程序的业务流程，那在测试调试结束后去掉assert关键字就意味着修改了程序的正常的逻辑。
* assert断言失败将面临程序的退出。这在一个生产环境下的应用是绝不能容忍的。一般都是通过异常处理来解决程序中潜在的错误。但是使用断言就很危险，一旦失败系统就挂了。

## 用法
* assertEquals(expected, actual)：查看两个对象是否相等。类似于字符串比较使用的equals()方法；
* assertNotEquals(first, second)：查看两个对象是否不相等。
* expected为用户期望某一时刻对象的值，actual为某一时刻对象实际的值。如果这两值相等的话（通过对象的equals方法比较），说明代码运行是正确的。
* assertNull(object)：查看对象是否为空。
* assertNotNull(object)：查看对象是否不为空。
* assertSame(expected, actual)：查看两个对象的引用是否相等，类似于使用“==”比较两个对象；
* assertNotSame(unexpected, actual)：查看两个对象的引用是否不相等，类似于使用“!=”比较两个对象。
* assertTrue(String message, boolean condition) 要求condition == true，查看运行的结果是否为true；
* assertFalse(String message, boolean condition) 要求condition == false，查看运行的结果是否为false。
    以判断某个条件是真还是假，如果和预期的值相同则测试成功，否则测试失败。
* assertArrayEquals(String message, XXX[] expecteds,XXX [] actuals) 要求expected.equalsArray(actual)，即查看两个数组是否相等。
* assertThat(String reason, T actual, Matcher matcher) ：要求matcher.matches(actual) == true，使用Matcher做自定义的校验。








