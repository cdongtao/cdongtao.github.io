---
title: Java基础知识
tags: [Beans,Controller,面试知识]
categories: [Spring]
---
## Java的三大特性
* 封装(类对象):是指隐藏对象的属性和实现细节,仅对外提供公共访问方式。
* 继承(类):继承是面向对象最显著的一个特性。 继承是从已有的类中派生出新的类, 新的类能吸收已有类的数据属性和行为,并能扩展新的能力。
在JAVA中, 被继承的类叫父类(parent class)或超类(superclass), 继承父类的类叫子类(subclass)或派生类(derivedclass)。 因此, 子类是父类的一个专门用途的版本, 它继承了父类中定义的所有实例变量和方法, 并且增加了独特的元素 。
* 多态(接口):在面向对象语言中, 多态性是指一个方法可以有多种实现版本,即“一种定义, 多种实现”。 利用多态可以设计和实现可扩展的系统, 只要新类也在继承层次中。 新的类对程序的通用部分只需进行很少的修改, 或不做修改。 类的多态性表现为方法的多态性,方法的多态性主要有方法的重载和方法的覆盖。

## String/StringBuffer/StringBuilder
### String
　　String 是不可变的对象, 因此在每次对 String 类型进行改变的时候其实都等同于生成了一个新的 String 对象，然后将指针指向新的 String 对象，这样不仅效率低下，而且大量浪费有限的内存空间，所以经常改变内容的字符串最好不要用 String 。因为每次生成对象都会对系统性能产生影响，特别当内存中无引用对象多了以后， JVM 的 GC 就会开始工作，那速度是一定会相当慢的
### StringBuffer
　　线程安全,所有公开方法都加synchronized.任何对它指向的字符串的操作都不会产生新的对象。 每个StringBuffer对象都有一定的缓冲区容量，当字符串大小没有超过容量时，不会分配新的容量，当字符串大小超过容量时，会自动增加容量。

### StringBuilder
    线程不安全,不加synchronized.




## spring bean作用域有以下5个：
singleton: 单例模式,当spring创建applicationContext容器的时候,spring会欲初始化所有的该作用域实例,加上lazy-init就可以避免预处理;
prototype:原型模式,每次通过getBean获取该bean就会新产生一个实例,创建后spring将不再对其管理；(下面是在web项目下才用到的)
request:搞web的大家都应该明白request的域了吧,就是每次请求都新产生一个实例,<font color='red'>和prototype不同就是创建后,spring依然在监听管理;</font>
session:每次会话,同上
global session: 全局的web域,类似于servlet中的application

### Spring的Controller是单例还是多例？怎么保证并发的安全
#### 解决方案
* 不要在controller中定义成员变量。
* 万一必须要定义一个非静态成员变量时候,则通过注解@Scope(“prototype”),将其设置为多例模式。
* 在Controller中使用ThreadLocal存放变量


### Spring Bean循环依赖

[bean循环依赖](https://www.cnblogs.com/changemax/p/12311518.html)


