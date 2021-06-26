---
title: Log4j2日志使用
tags: [log,Template]
categories: [Project]
---

## Log4j2简介
Apache Log4j 2是 Log4j(1) 的升级版，比它的祖先 Log4j 1. x 有了很大的改进，和logback对比有很大的改进。除了内部设计的调整外，主要有以下几点的大升级：

* 更简化的配置
* 更强大的参数格式化
* 最夸张的异步性能

Log4j 2中，分为API(log4j-api） 和实现(log4j-core) 两个模块。API 和slf4j 是一个类型，属于日志抽象/门面，而实现部分，才是Log4j 2的核心。
1. org.apache.logging.log4j » log4j-api
2. org.apache.logging.log4j » log4j-core

## 优点
### 异步性能
![性能对比](/springBoot/005.png "性能对比")
从图上可以看出，log4j2的异步（全异步，非混合模式）下的性能，远超log4j1和logback，简直吊打。压力越大的情况下，吞吐上的差距就越大。在64线程测试下，log4j2的吞吐达到了180w+/s，而logback/log4j1只有不到20w，相差近十倍

### 零GC（Garbage-free）
从2.6版本开始（2016年），log4j2 默认就以零GC模式运行了。什么叫零GC呢？就是不会由于log4j2而导致GC。
log4j2 中各种Message对象，字符串数组，字节数组等全部复用 ，不重复创建，大大减少了无用对象的创建，从而做到“零GC”。

### 更高性能 I/O 写入的支持
log4j 还提供了一个MemoryMappedFileAppender，I/O 部分使用MemoryMappedFile来实现，可以得到极高的I/O性能。不过在使用MemoryMappedFileAppender之前，得确定你足够了解MemoryMappedFile的相关知识，否则不要轻易使用呦。

### 使用{}占位符格式化参数
在slf4j里，我们可以用{}的方式来实现“format”的功能（参数会直接toString替换占位符），
logger.debug("Logging in user {} with birthday {}", user.getName(), user.getBirthdayCalendar());

### 使用String.format的形式格式化参数
public static Logger logger = LogManager.getFormatterLogger("Foo");
```
logger.debug("Logging in user %s with birthday %s", user.getName(), user.getBirthdayCalendar());
logger.debug("Logging in user %1$s with birthday %2$tm %2$te,%2$tY", user.getName(), user.getBirthdayCalendar());
logger.debug("Integer.MAX_VALUE = %,d", Integer.MAX_VALUE);
logger.debug("Long.MAX_VALUE = %,d", Long.MAX_VALUE);
```

* 注意，如果想使用String.format的形式，需要使用LogManager.getFormatterLogger而不是LogManager.getLogger

### 使用logger.printf格式化参数
log4j2 的 Logger接口中，还有一个printf方法，无需创建LogManager.getFormatterLogger，就可以使用String.format的形式
```
logger.printf(Level.INFO, "Logging in user %1$s with birthday %2$tm %2$te,%2$tY", user.getName(), user.getBirthdayCalendar());

logger.debug("Opening connection to {}...", someDataSource);
```

### “惰性”打日志（lazy logging）
log4j2 的 logger 对象，提供了一系列lambda的支持，通过这些接口可以实现“惰性”打日志：
```
void debug(String message, Supplier<?>... paramSuppliers);
void info(String message, Supplier<?>... paramSuppliers);
void trace(String message, Supplier<?>... paramSuppliers);
void error(String message, Supplier<?>... paramSuppliers);

//等同于下面的先判断，后打印
logger.debug("入参报文：{}",() -> JSON.toJSONString(policyDTO));

if(logger.isDebugEnabled()){
    logger.debug("入参报文：{}",JSON.toJSONString(policyDTO));
}

```

## 引用log4j2的maven依赖
<font color =red>springboot默认是用logback的日志框架的，所以需要排除logback，不然会出现jar依赖冲突的报错。</font>
日志框架：slf4j
日志实现：log4j2
桥接包：log4j-slf4j-impl

桥接包log4j-slf4j-impl起到适配的作用，因为市面上的日志实现互不兼容，日志框架slf4j要想适用于日志实现log4j2，就需要使用桥接包。slf4j使用LoggerFactory创建Logger进行日志打印，底层实际上调用了log4j-slf4j-impl的StaticLoggerBinder类创建一个Log4jLoggerFactory，然后再由这个Log4jLoggerFactory创建一个Log4j2的Logger对象，这个Logger封装在log4j-slf4j-impl中的Log4jLogger里面，最后将Log4jLogger返回给slf4j，每次slf4j进行日志打印，实际上是log4j-slf4j-impl中的Log4jLogger调用log4j2进行日志打印
如果没有 log4j-slf4j-impl桥接包，slf4j将创建一个对象，里面都是空方法，所以不会打印出日志
```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <!-- 排除掉logging，不使用logback，改用log4j2 -->
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<!-- 日志实现 -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.14.1</version>
</dependency>
<!-- 日志框架(门面) -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-api</artifactId>
    <version>2.14.1</version>
</dependency>
<!-- 日志桥接包   桥接包的版本须对应log4j2的版本 -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j-impl</artifactId>
    <version>2.1</version>
</dependency>
```

* SpringBoot中引用
```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <!-- 排除掉logging，不使用logback，改用log4j2 -->
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
     <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>
```
log4j-api在log4j-core中已经有依赖了，直接依赖core即可
* 注意，引用log4j2时，需要注意项目中是否有多套日志框架共存/冲突，需要适配的问题。细节请参考上面的与其他日志抽象/门面适配


## 配置文件
```
<?xml version="1.0" encoding="UTF-8"?>
<!--Configuration后面的status，这个用于设置log4j2自身内部的信息输出，可以不设置，当设置成trace时，你会看到log4j2内部各种详细输出-->
<!--monitorInterval：Log4j能够自动检测修改配置 文件和重新配置本身，设置间隔秒数-->
<configuration monitorInterval="5">
    <!--日志级别以及优先级排序: OFF > FATAL > ERROR > WARN > INFO > DEBUG > TRACE > ALL -->

    <!--变量配置-->
    <Properties>
        <!-- 控制台默认输出格式,"%d":表示打印的时间 "%5level":日志级别, %thread 表示打印日志的线程 "%c":表示类 "%L":表示行号 "%msg" 表示打印的信息  %n 换行  %throwable 表示错误信息
        %style 和{bright,green} 结合表示展示颜色   %highlight 所以影响日志输出的性能 -->
        <Property name="LOG_PATTERN">
            [%d{yyyy-MM-dd HH:mm:ss:SSS}] | [%5level][%thread][%X{traceId}] -| %msg%n
        </Property>
        <!-- 定义日志存储的路径，不要配置相对路径 -->
        <property name="FILE_PATH" value="/logs" />
        <!--加项目名称做前缀-->
        <property name="FILE_NAME_PREFIX" value="temp" />
        <!--日志大小 MB or GB-->
        <property name="LOG_SIZE" value="20MB" />

    </Properties>

    <appenders>
        <console name="Console" target="SYSTEM_OUT">
            <!--输出日志的格式2 pattern="%highlight{%d{HH:mm:ss.SSS} [%t]  %-5level %logger{1.}:%L - %msg%n}{%throwable{short.fileName}}{FATAL=white,ERROR=red,WARN=blue, INFO=black, DEBUG=green, TRACE=blue}"-->
            <PatternLayout
                    pattern="[%style{%d{yyyy-MM-dd HH:mm:ss:SSS}}{bright,green}] | [%highlight{%5level}][%thread][%style{%c}{bright,yellow}] [%style{%L}{bright,blue}] -| %msg%n%style{%throwable}{red}"
                    disableAnsi="false" noConsoleNoAnsi="false"/>
            <!--控制台只输出level及其以上级别的信息(onMatch),其他的直接拒绝(onMismatch)-->
            <ThresholdFilter level="info" onMatch="ACCEPT" onMismatch="DENY"/>
        </console>

        <!--文件会打印出所有信息，这个log每次运行程序会自动清空，由append属性决定，适合临时测试用-->
        <!--append为TRUE表示消息增加到指定文件中，false表示消息覆盖指定的文件内容，默认值是true -->
        <File name="Filelog" fileName="${FILE_PATH}/test.log" append="false" >
            <PatternLayout pattern="${LOG_PATTERN}"/>
        </File>

        <!-- 这个会打印出所有的info及以下级别的信息，每次大小超过size，则这size大小的日志会自动存入按年份-月份建立的文件夹下面并进行压缩，作为存档-->
        <RollingFile name="RollingFileInfo" fileName="${FILE_PATH}/${FILE_NAME_PREFIX}_info.log" filePattern="${FILE_PATH}/${FILE_NAME_PREFIX}-INFO-%d{yyyy-MM-dd}_%i.log.gz">
            <!--控制台只输出level及以上级别的信息(onMatch),其他的直接拒绝(onMismatch),由上面级别排序可以找到,info包括warn，error-->
            <ThresholdFilter level="info" onMatch="ACCEPT" onMismatch="DENY"/>
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <Policies>
                <!--interval属性用来指定多久滚动一次，默认是1天-->
                <TimeBasedTriggeringPolicy interval="1"/>
                <SizeBasedTriggeringPolicy size="100MB"/>
            </Policies>
            <!-- DefaultRolloverStrategy属性如不设置，则默认为最多同一文件夹下7个文件开始覆盖保持最久那个-->
            <DefaultRolloverStrategy max="15"/>
        </RollingFile>

        <!-- 这个会打印出所有的warn及以下级别的信息，每次大小超过size，则这size大小的日志会自动存入按年份-月份建立的文件夹下面并进行压缩，作为存档-->
        <RollingFile name="RollingFileWarn" fileName="${FILE_PATH}/${FILE_NAME_PREFIX}_warn.log" filePattern="${FILE_PATH}/${FILE_NAME_PREFIX}-WARN-%d{yyyy-MM-dd}_%i.log.gz">
            <!--控制台只输出level及以上级别的信息(onMatch),其他的直接拒绝(onMismatch)-->
            <ThresholdFilter level="warn" onMatch="ACCEPT" onMismatch="DENY"/>
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <Policies>
                <!--interval属性用来指定多久滚动一次，默认是1天-->
                <TimeBasedTriggeringPolicy interval="1"/>
                <SizeBasedTriggeringPolicy size="100M"/>
            </Policies>
            <!-- DefaultRolloverStrategy属性如不设置，则默认为最多同一文件夹下7个文件开始覆盖保持最久那个-->
            <DefaultRolloverStrategy max="15"/>
        </RollingFile>

        <!-- 这个会打印出所有的error及以下级别的信息，每次大小超过size，则这size大小的日志会自动存入按年份-月份建立的文件夹下面并进行压缩，作为存档-->
        <RollingFile name="RollingFileError" fileName="${FILE_PATH}/${FILE_NAME_PREFIX}_error.log" filePattern="${FILE_PATH}/${FILE_NAME_PREFIX}-ERROR-%d{yyyy-MM-dd}_%i.log.gz">
            <!--控制台只输出level及以上级别的信息(onMatch),其他的直接拒绝(onMismatch)-->
            <ThresholdFilter level="error" onMatch="ACCEPT" onMismatch="DENY"/>
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <Policies>
                <!--interval属性用来指定多久滚动一次，默认是1天-->
                <TimeBasedTriggeringPolicy interval="1"/>
                <SizeBasedTriggeringPolicy size="100M"/>
            </Policies>
            <!-- DefaultRolloverStrategy属性如不设置，则默认为最多同一文件夹下7个文件开始覆盖保持最久那个-->
            <DefaultRolloverStrategy max="15"/>
        </RollingFile>

    </appenders>

    <!--Logger节点用来单独指定日志的形式，比如要为指定包下的class指定不同的日志级别等。-->
    <!--然后定义loggers，只有定义了logger并引入的appender，appender才会生效-->
    <loggers>
        <!--若是additivity设为false，则子Logger只会在自己定义的appender里输出，而不会在 root Logger 的appender里输出。-->
        <!--过滤掉mybatis的一些无用的DEBUG信息-->
        <logger name="org.mybatis" level="info" additivity="false">
            <AppenderRef ref="Console"/>
        </logger>
        <!--过滤掉spring的一些无用的DEBUG信息-->
        <Logger name="org.springframework" level="info" additivity="false">
            <AppenderRef ref="Console"/>
        </Logger>

        <root level="info">
            <appender-ref ref="Console"/>
            <appender-ref ref="Filelog"/>
            <appender-ref ref="RollingFileInfo"/>
            <appender-ref ref="RollingFileWarn"/>
            <appender-ref ref="RollingFileError"/>
        </root>
    </loggers>
</configuration>
```
### XML配置文件语法
```
<?xml version="1.0" encoding="UTF-8"?>;
<Configuration>
  <Properties>
    <Property name="name1">value</property>
    <Property name="name2" value="value2"/>
  </Properties>
  <filter  ... />
  <Appenders>
    <appender ... >
      <filter  ... />
    </appender>
    ...
  </Appenders>
  <Loggers>
    <Logger name="name1">
      <filter  ... />
    </Logger>
    ...
    <Root level="level">
      <AppenderRef ref="name"/>
    </Root>
  </Loggers>
</Configuration>
```
log4j 2.x版本不再支持像1.x中的.properties后缀的文件配置方式，2.x版本常用.xml后缀的文件进行配置，除此之外还包含.json和.jsn配置文件。log4j2虽然采用xml风格进行配置，依然包含三个组件,分别是 Logger(记录器)、Appender(输出目的地)、Layout(日志布局)。

* XML配置文件解析
1. 根节点Configuration有两个属性:status和monitorinterval,有两个子节点:Appenders和Loggers(表明可以定义多个Appender和Logger).
status用来指定log4j本身的打印日志的级别.
monitorinterval为log4j 2.x新特点自动重载配置。指定自动重新配置的监测间隔时间，单位是s,最小是5s。

2. Appenders节点，常见的有三种子节点:Console、RollingFile、File.
* Console节点用来定义输出到控制台的Appender.
　　 name:指定Appender的名字.
　　 target:SYSTEM_OUT 或 SYSTEM_ERR,一般只设置默认:SYSTEM_OUT.
　　 PatternLayout:输出格式，不设置默认为:%m%n.
* File节点用来定义输出到指定位置的文件的Appender.
　　name:指定Appender的名字.
　　fileName:指定输出日志的目的文件带全路径的文件名.
　　PatternLayout:输出格式，不设置默认为:%m%n.
* RollingFile节点用来定义超过指定大小自动删除旧的创建新的的Appender.
　　name:指定Appender的名字.
　　fileName:指定输出日志的目的文件带全路径的文件名.
　　PatternLayout:输出格式，不设置默认为:%m%n.
　　filePattern:指定新建日志文件的名称格式.
　　Policies:指定滚动日志的策略，就是什么时候进行新建日志文件输出日志.
　　TimeBasedTriggeringPolicy:Policies子节点，基于时间的滚动策略，interval属性用来指定多久滚动一次．
　　SizeBasedTriggeringPolicy:Policies子节点，基于指定文件大小的滚动策略，size属性用来定义
　　每个日志文件的大小.
　　DefaultRolloverStrategy:用来指定同一个文件夹下最多有几个日志文件时开始删除最旧的，
　　如果不做配置，默认是7

通过在子节点中加入<PatternLayout pattern="自定义信息格式"/>进行日志布局
```
    #模式符号 - 用途(附加说明);{可选附加选项}(附加选项说明)
    #  %c     - 日志名称(通常是构造函数的参数);{数字}("a.b.c" 的名称使用 %c{2} 会输出 "b.c")
    #  %C     - 调用者的类名(速度慢,不推荐使用);{数字}(同上)
    #  %d     - 日志时间;{SimpleDateFormat所能使用的格式}
    #  %F     - 调用者的文件名(速度极慢,不推荐使用)
    #  %l     - 调用者的函数名、文件名、行号(速度极其极其慢,不推荐使用)
    #  %L     - 调用者的行号(速度极慢,不推荐使用)
    #  %m     - 日志
    #  %M     - 调用者的函数名(速度极慢,不推荐使用)
    #  %n     - 换行符号
    #  %p     - 日志优先级别(DEBUG, INFO, WARN, ERROR)
    #  %r     - 输出日志所用毫秒数
    #  %t     - 调用者的进程名
    #  %x     - Used to output the NDC (nested diagnostic context) associated with the thread that generated the logging event.
    #  %X     - Used to output the MDC (mapped diagnostic context) associated with the thread that generated the logging event.
    #
    #模式修饰符 - 对齐 - 最小长度 - 最大长度 - 说明
    # %20c        右      20         ~
    # %-20c      左       20         ~
    # %.30c       ~       ~          30
    # %20.30c     右      20         30
    # %-20.30c   左       20         30
```

3. Loggers节点，常见的有两种:Root和Logger.
* Root节点用来指定项目的根日志，如果没有单独指定Logger，那么就会默认使用该Root日志输出
　　AppenderRef：Logger的子节点，用来指定该日志输出到哪个Appender,如果没有指定，就会默认继承自Root.如果指定了，那么会在指定的这个Appender和Root的Appender中都会输出，此时我们可以设置Logger的additivity="false"只在自定义的Appender中进行输出
* Logger节点用来单独指定日志的形式，比如要为指定包下的class指定不同的日志级别等。
　　name:用来指定该Logger所适用的类或者类所在的包全路径,继承自Root节点.


## 使用
Logger logger = LogManager.getLogger(Log4j2Test.class);
logger.error(...);
logger.warn(...);
logger.info(...);
logger.debug(...);
logger.trace(...);

如果是配合slf4j使用也是可以的，只需要按照前面说的，提前做好适配，然后使用slf4j的api即可。不过如果是新系统的话，建议直接上log4j2的api吧，可以享受所有log4j2的功能，使用slf4j之类的api时，上面说的参数格式化之类的功能就无法使用了。

## 全异步配置(重点)
### 方式1
1. 启动类加入：
    System.setProperty("Log4jContextSelector", "org.apache.logging.log4j.core.async.AsyncLoggerContextSelector");
2. 推荐配置log4j2 全异步（all async），在你的启动脚本中增加一个系统变量的配置：
-Dlog4j2.contextSelector=org.apache.logging.log4j.core.async.AsyncLoggerContextSelector

### 方式2
1. 引入依赖
```
<!--log4j2异步AsyncLogger需要这个依赖,否则AsyncLogger日志打印不出来-->
<dependency>
    <groupId>com.lmax</groupId>
    <artifactId>disruptor</artifactId>
    <version>3.4.4</version>
</dependency>
```

2. 配置文件引入
 <!--日志级别level以及优先级排序: OFF > FATAL > ERROR > WARN > INFO > DEBUG > TRACE > ALL -->
<!--AsyncLogger 异步记录日志,Log4j2中的AsyncLogger的内部使用了Disruptor框架,所以需要添加依赖disruptor-3.3.4-->
<!--注意：includeLocation="true" 可以解决 AsyncLogger异步Logger输出appender中的日志 类方法和行数信息显示不出来问题，但是会降低性能(it can make logging 30 - 100 times slower)，所以呢 注重性能这里就不显示打印日志的行数和所在方法,把这里的includeLocation="true 去掉。AsyncLogger 的additivity属性需要设置为false，这个异步需要依赖disruptor3.4，如果没有disruptor3.4依赖包,AsyncLogger日志会打印不出来-->

<AsyncLogger name="serverlogger" level="debug" additivity="false" includeLocation="true">
    <!--被当前Logger捕获到的日志信息level大于等于当前Logger的level属性时写入到 RollingFileInfo 里-->
    <!--每个Logger 可以设置多个appender ,如果有多个appender 会写入每个appender里-->
    <appender-ref ref="RollingFileInfo"/>
</AsyncLogger>

## 同步与异步的流程图
### 同步
![同步](/springBoot/006.png "同步")

### 异步
![异步](/springBoot/007.png "异步")
