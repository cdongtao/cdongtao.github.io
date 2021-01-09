---
title: SpringBoot配置文件路径及路径问题
tags: [SpringBoot]
categories: [Spring]
---
## 配置文件
SpringBoot配置文件可以使用yml格式和properties格式
分别的默认命名为：application.yml. application.properties
### 默认存放存放目录
SpringBoot配置文件默认可以放到以下目录中，可以自动读取到：
1. 项目根目录下
2. 项目根目录中config目录下
3. 项目的resources目录下
4. 项目resources目录中config目录下

### 默认读取顺序
如果在不同的目录中存在多个配置文件，它的读取顺序是：
1. config/application.properties（项目根目录中config目录下）
2. config/application.yml
3. application.properties（项目根目录下）
4. application.yml
5. resources/config/application.properties（项目resources目录中config目录下）
6. resources/config/application.yml
7. resources/application.properties（项目的resources目录下）
8. resources/application.yml

注：
1. 如果同一个目录下，有application.yml也有application.properties，默认先读取application.properties。
2. 如果同一个配置属性，在多个配置文件都配置了，默认使用第1个读取到的，后面读取的不覆盖前面读取到的。
3. 创建SpringBoot项目时，一般的配置文件放置在“项目的resources目录下”

springboot启动会扫描一下位置的application.properties或者application.yml作为默认的配置文件
工程根目录:./config/
工程根目录：./
classpath:/config/
classpath:/

加载的优先级顺序是从上向下加载，并且所有的文件都会被加载，高优先级的内容会覆盖底优先级的内容，形成互补配置
也可以通过指定配置spring.config.location来改变默认配置，一般在项目已经打包后，我们可以通过指令
　　java -jar xxxx.jar --spring.config.location=D:/kawa/application.yml来加载外部的配置

## classpath具体指哪个路径
1. src 路径下的文件 在编译后都会放到 WEB-INF/classes 路径下。默认classpath 就是指这里
2. 用maven构建 项目时，resources 目录就是默认的classpath

### classpath与classpath* 的区别
#### classpath
1. classpath 是指web-inf 下classes目录
2. classes 是一个定位资源入口， 目录下用来存放：
   * 各种资源配置文件，eg.init.properties, log4j.properties, struts.xml
   * 存放模板文件 eg.actionerror.ftl
   * 编译后的class文件，对应的是项目开发时src目录编译文件

#### classpath*
仅包含class路径，还包括jar文件中(class路径)进行查找. 
一般java项目中 classpath存在与 WEB-INFO/目录。 当我们需要某个class时，系统会自动在CLASSPATH里面搜索，如果是jar，就自动从jar里面查找，如果是普通的目录，则在目录下面按照package进行查找.但与PATH不同的是，默认的CLASSPATH是不包含当前目录的，这也是CLASSPATH里面要包含一个点的道理了。

#### Tomcat的classpath
Tomcat下的Web应用有两个预置的classpath : WEB-INF/classes 和WEB-INF/lib启动项目，项目就会加载这两个目录里的数据。这是war包的规范.要改变预置的classpath比较麻烦，在Tomcat的配置文件里没有发现类似的配置，要实现自己的classloader才能达到目的。

一个在tomcat中运行的web应用.它的classpath都包括如下目录: 
我知道的有: 
1. %tomcat%/lib 
2. web-inf/lib 
3. web-inf/classes 
4. 环境变量里的classpath
总结：classpath这是一个定位资源的入口.classpath下 lib的优先级大于classes

## spring boot默认加载文件的路径
* /META-INF/resources/
* /resources/
* /static/
* /public/

从spring boot源码也可以看到
```
private static final String[] CLASSPATH_RESOURCE_LOCATIONS = {  
        "classpath:/META-INF/resources/", 
        "classpath:/resources/",  
        "classpath:/static/", 
        "classpath:/public/" };  
```