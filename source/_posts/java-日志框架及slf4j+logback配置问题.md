---
title: 日志框架及slf4j+logback配置问题
tags: [log,Template]
categories: [Project]
---

## 问题现象
```
log4j:WARN No appenders could be found for logger (org.example.App).
log4j:WARN Please initialize the log4j system properly.
log4j:WARN See http://logging.apache.org/log4j/1.2/faq.html#noconfig for more info.
```
```
SLF4J: Class path contains multiple SLF4J bindings.
SLF4J: Found binding in [jar:file:/C:/Users/jiang/.m2/repository/ch/qos/logback/logback-classic/1.2.3/logback-classic-1.2.3.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: Found binding in [jar:file:/C:/Users/jiang/.m2/repository/org/slf4j/slf4j-log4j12/1.7.30/slf4j-log4j12-1.7.30.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: See http://www.slf4j.org/codes.html#multiple_bindings for an explanation.
SLF4J: Actual binding is of type [ch.qos.logback.classic.util.ContextSelectorStaticBinder]
```
1. DUBBO日志打印不正常的情况？
2. Mybatis SQL日志打印不出来的情况？
3. JPA/Hibernate SQL日志无法打印的情况？
4. 复杂项目中，很多框架内部日志无法打印的情况？
5. Tomcat工程，日志文件打印了多份，catalina.out和其他文件？
6. SpringBoot项目，日志文件打印了多份的问题？
7. 各种日志配置问题……

### 分析问题：日志框架的冲突
上面的这些问题，基本都是由于多套日志框架共存或配置错误导致的。那么为什么会出现共存或者冲突呢？
一般是以下几种原因：
1. 项目手动引用了各种日志框架的包 - 比如同时引用了log4j/log4j2/logback/jboss-logging/jcl等
2. 包管理工具的传递依赖（Transitive Dependencies）导致，比如依赖了dubbo，但是dubbo依赖了zkclient，可zkclient又依赖了log4j，此时如果你的项目中还3有其他日志框架存在并有使用，那么就会导致多套共存
3. 同一个日志框架多版本共存

### 解决方案
Java 中的日志框架分为两种，分别为日志抽象/门面，日志实现
#### 日志抽象/门面
日志抽象/门面，他们不负责具体的日志打印，如输出到文件、配置日志内容格式等。他们只是一套日志抽象，定义了一套统一的日志打印标准，如Logger对象，Level对象。

slf4j（Simple Logging Facade for Java）和jcl（Apache Commons Logging）这两个日志框架就是JAVA中最主流的日志抽象了。还有一个jboss-logging，主要用于jboss系列软件，比如hibernate之类。像 jcl已经多年不更新了（上一次更新时间还是14年），目前最推荐的是使用 slf4j

#### 日志实现
Java 中的日志实现框架，主流的有以下几种：
log4j - Apache（老牌日志框架，不过多年不更新了，新版本为log4j2） log4j2 - Apache（log4j 的新版本，目前异步IO性能最强，配置也较简单） logback - QOS（slf4j就是这家公司的产品） jul（java.util.logging） - jdk内置 在程序中，可以直接使用日志框架，也可以使用日志抽象+日志实现搭配的方案。不过一般都是用日志抽象+日志实现，这样更灵活，适配起来更简单。   
目前最主流的方案是slf4j+logback/log4j2，不过如果是jboss系列的产品，可能用的更多的还是jboss-logging，毕竟亲儿子嘛。像JPA/Hibernate这种框架里，内置的就是jboss-logging

### SpringBoot + Dubbo 日志框架冲突的例子
比如我有一个“干净的”spring-boot项目，干净到只有一个spring-boot-starter依赖，此时我想集成dubbo，使用zookeeper作为注册中心，此时我的依赖配置是这样：
```
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
  </dependency>
  <dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-starter</artifactId>
    <version>2.7.9</version>
  </dependency>
  <dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-registry-zookeeper</artifactId>
    <version>2.7.9</version>
  </dependency>
</dependencies>
```
现在启动这个spring-boot项目，会发现一堆红色错误：
SLF4J: Class path contains multiple SLF4J bindings.
SLF4J: Found binding in [jar:file:/C:/Users/jiang/.m2/repository/ch/qos/logback/logback-classic/1.2.3/logback-classic-1.2.3.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: Found binding in [jar:file:/C:/Users/jiang/.m2/repository/org/slf4j/slf4j-log4j12/1.7.30/slf4j-log4j12-1.7.30.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: See http://www.slf4j.org/codes.html#multiple_bindings for an explanation.
SLF4J: Actual binding is of type [ch.qos.logback.classic.util.ContextSelectorStaticBinder]
----------------------------------人肉分割线----------------------------------------
log4j:WARN No appenders could be found for logger (org.apache.dubbo.common.logger.LoggerFactory).
log4j:WARN Please initialize the log4j system properly.
log4j:WARN See http://logging.apache.org/log4j/1.2/faq.html#noconfig for more info.

从错误提示上看，错误内容分为两个部分：
1. slf4j报错，提示找到多个slf4j的日志绑定
2. log4j报错，提示log4j没有appender配置

#### 原因
出现这个错误，就是因为dubbo的传递依赖中含有log4j，但是spring-boot的默认配置是slf4j+logback。在依赖了dubbo相关包之后，现在项目中同时存在logback/jcl(apache commons-logging)/log4j/jul-to-slf4j/slf4j-log4j/log4j-to-slf4j
#### 依赖图
![日志依赖](/springBoot/003.png "日志依赖")

　　这个时候就乱套了，slf4j-log4j是log4j的slf4j实现，作用是调用slf4j api的时候使用log4j输出；而log4j-to-slf4j的作用是将log4j的实现替换为slf4j，这样一来不是死循环了，而且还有logback的存在，logback默认实现了slf4j的抽象，而slf4j-log4j也是一样实现了slf4j的抽象，logback，项目里共存了两套slf4j的实现，那么在使用slf4j接口打印的时候会使用哪个实现呢？
　　答案是“第一个”，也就是第一个被加载的Slf4j的实现类，但这种依靠ClassLoader加载顺序来保证的日志配置顺序是非常不靠谱的。如果想正常使用日志，让这个项目里所有的框架都正常打印日志，必须将日志框架统一。不过这里的统一并不是至强行修改，而是用“适配/中转”的方式。现在项目里虽然有slf4j-log4j的配置，但这个配置是适配log4j2用的，而我们的依赖了只有log4j1，实际上这个中转是无效的。但logback是有效的，而且是spring-boot项目的默认配置，这次就选择logback作为项目的统一日志框架吧。

#### log4j报错解决
　　现在项目里存在log4j(1)的包，而且启动时又报log4j的错误，说明某些代码调用了log4j的api。但我们又不想用log4j，所以需要先解决log4j的问题。
由于有log4j代码的引用，所以直接删除log4j一定是不可行的。slf4j提供了一个log4j-over-slf4j的包，这个包复制了一份log4j1的接口类（Logger等），同时将实现类修改为slf4j了。
　　所以将log4j的（传递）依赖排除，同时引用log4j-over-slf4j，就解决了这个log4j的问题。现在来修改下pom中的依赖（查看依赖图可以使用maven的命令，或者是IDEA自带的Maven Dependencies Diagram，再或者Maven Helper之类的插件）

```
<dependency>
  <groupId>org.apache.dubbo</groupId>
  <artifactId>dubbo-registry-zookeeper</artifactId>
  <version>2.7.9</version>
  <scope>compile</scope>
  <!--排除log4j-->
  <exclusions>
    <exclusion>
      <artifactId>log4j</artifactId>
      <groupId>log4j</groupId>
    </exclusion>
  </exclusions>
</dependency>
<!--增加log4j-slf4j -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>log4j-over-slf4j</artifactId>
    <version>1.7.30</version>
</dependency>
```

#### SLF4J报错解决
解决了log4j的问题之后，现在还有slf4j有两个实现的问题，这个问题处理就更简单了。由于我们计划使用logback，那么只需要排除/删除slf4j-log4j这个实现的依赖即可

```
<dependency>
  <groupId>org.apache.dubbo</groupId>
  <artifactId>dubbo-registry-zookeeper</artifactId>
  <version>2.7.9</version>
  <scope>compile</scope>
  <exclusions>
    <exclusion>
      <artifactId>log4j</artifactId>
      <groupId>log4j</groupId>
    </exclusion>
    <exclusion>
      <artifactId>slf4j-log4j12</artifactId>
      <groupId>org.slf4j</groupId>
    </exclusion>
  </exclusions>
</dependency>
```

修改完成，再次启动就没有错误了，轻松解决问题

### 日志框架适配大全图解
上面只是介绍了一种转换的方式，但这么多日志框架，他们之间是可以互相转换的。不过最终目的都是统一一套日志框架，让最终的日志实现只有一套，这么多的日志适配/转换方式，全记住肯定是有点难。为此我画了一张可能是全网最全的日志框架适配图（原图尺寸较大，请点击放大查看），如果再遇到冲突，需要将一个日志框架转换到另一款的时候，只需要按照图上的路径，引入相关的依赖包即可
![日志框架图解](/springBoot/004.png "日志框架图解")

比如想把slf4j，适配/转换到log4j2。按照图上的路径，只需要引用log4j-slf4j-impl即可。
如果想把jcl，适配/转换到slf4j，只需要删除jcl包，然后引用jcl-over-slf4j即可。
图上的箭头，有些标了文字的，是需要额外包进行转换的，有些没有标文字的，是内置了适配的实现。其实内置实现的这种会更麻烦，因为如果遇到共存基本都需要通过配置环境变量/配置额外属性的方式来指定一款日志实现。
目前slf4j是适配方案中，最核心的那个框架，算是这个图的中心枢纽。只要围绕slf4j做适配/转化，就没有处理不了的冲突

## 总结
解决日志框架共存/冲突问题其实很简单，只要遵循几个原则：
1. 统一使用一套日志实现
2. 删除多余的无用日志依赖
3. 如果有引用必须共存的话，那么就移除原始包，使用“over”类型的包（over类型的包复制了一份原始接口，重新实现）
4. 不能over的，使用日志抽象提供的指定方式，例如jboss-logging中，可以通过org.jboss.logging.provider环境变量指定一个具体的日志框架实现







