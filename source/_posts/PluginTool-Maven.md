---
title: Maven 基础知识
tags: [Plugin]
categories: [Project]
---

## Maven
### scope
在一个maven项目中，如果存在编译需要而发布不需要的jar包，可以用scope标签，值设为provided。如下：
```
    <dependency>
        <groupId>javax.servlet.jsp</groupId>
        <artifactId>jsp-api</artifactId>
        <version>2.1</version>
        <scope>provided</scope>
        <classifier />
    </dependency>
```
scope的其他参数如下：
* compile:如编译时期找不到对应的引用
    默认值。compile表示对应依赖会参与当前项目的编译、测试、运行等，是一个比较强的依赖。打包时通常会包含该依赖，部署时会打包到lib目录下。比如：spring-core这些核心的jar包。
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
* provided
    provided适合在编译和测试的环境，和compile功能相似，但provide仅在编译和测试阶段生效，provide不会被打包，项目与项目之间也不具有传递性。比如：上面讲到的spring-boot-devtools、servlet-api等，前者是因为不需要在生产中热部署，后者是因为容器已经提供，不需要重复引入。
    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>javax.servlet-api</artifactId>
        <scope>provided</scope>
    </dependency>

* runtime:如1/0时的判断,只有执行到这行代码才知道错误
    runntime仅仅适用于运行和测试环节，在编译环境下不会被使用。比如编译时只需要JDBC API的jar，而只有运行时才需要JDBC驱动实现。
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.20</version>
        <scope>runtime</scope>
    </dependency>
* test
    scope为test表示依赖项目仅参与测试环节，在编译、运行、打包时不会使用。最常见的使用就是单元测试类了：
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.12</version>
        <scope>test</scope>
    </dependency>
* system
system范围依赖与provided类似，不过依赖项不会从maven仓库获取，而需要从本地文件系统提供。使用时，一定要配合systemPath属性。不推荐使用，尽量从Maven库中引用依赖。
    <dependency>
        <groupId>sun.jdk</groupId>
        <artifactId>tools</artifactId>
        <version>1.5.0</version>
        <scope>system</scope>
        <systemPath>${java.home}/../lib/tools.jar</systemPath>
    </dependency>

* optional
* 这里的optional元素设置为true表示何意？optional是Maven依赖jar时的一个选项，表示该依赖是可选的，项目之间依赖不传递。不设置optional（默认）或者optional是false，表示传递依赖。
```
//A的pom文件。
<project .....>
    <groupId>A</groupId>
    <artifactId>A</artifactId>
    <version>1.0-SNAPSHOT</version>

    <dependencies>
        <dependency>
            <groupId>joda-time</groupId>
            <artifactId>joda-time</artifactId>
            <version>2.9.9</version>
        </dependency>
    </dependencies>
</project>
//B的pom文件直接引入A项目会继承A引入的包:
<project ....>
    <groupId>B</groupId>
    <artifactId>B</artifactId>
    <version>1.0-SNAPSHOT</version>
    <dependencies>
        <dependency>
            <groupId>A</groupId>
            <artifactId>A</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
    </dependencies>
</project>
```
在A工程对joda-time添加optional选项<optional>true</optional>，这时在B工程中，joda-time依赖包会消失.
如果B想引这个包，需要在A项目中设optional为false或者去除optional，或者在B项目重新引入调用。

### parent
```
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>A</groupId>
    <artifactId>A</artifactId>
    <version>1.0-SNAPSHOT</version>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>joda-time</groupId>
                <artifactId>joda-time</artifactId>
                <version>2.9.9</version>
                <optional>true</optional>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>

<project .....>
    <groupId>B</groupId>
    <artifactId>B</artifactId>
    <version>1.0-SNAPSHOT</version>

    <parent>
        <groupId>A</groupId>
        <artifactId>A</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>


</project>
```
A中加入 <optional>true</optional>，则B不会继承到 jar 包。

```
    //B再去引用的话，还是可以正常引用joda-time包，optional选项在统一控制版本的情况下会失效。
    <dependencies>
        <dependency>
            <groupId>joda-time</groupId>
            <artifactId>joda-time</artifactId>
        </dependency>
    </dependencies>B
```



