---
title: 搭建单元测试
tags: [UnitTest]
categories: [SpringBoot]
---

## [点击可以查找Manven依赖](https://search.maven.org/)

## [Junit-单元测试](vogella.com/tutorials/JUnit/article.html#junittesting)
[JUnit 5官方文档](https://junit.org/junit5/docs/current/user-guide/#overview) 
JUnit 5= JUnit Platform + JUnit Jupiter + JUnit Vintage
* JUnit Platform是在JVM上启动测试框架的基础
* JUnit Jupiter是JUnit5扩展的新的编程模型和扩展模型，用来编写测试用例。Jupiter子项目为在平台上运行Jupiter的测试提供了一个TestEngine(测试引擎)
* JUnit Vintage提供了一个在平台上运行JUnit 3和JUnit 4的TestEngine

```
<dependency>
      <groupId>org.junit.platform</groupId>
      <artifactId>junit-platform-launcher</artifactId>
      <version>1.0.1</version>
      <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-engine</artifactId>
    <version>5.0.1</version>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.junit.vintage</groupId>
    <artifactId>junit-vintage-engine</artifactId>
    <version>4.12.1</version>
    <scope>test</scope>
</dependency>
```

## [Mockito-模拟数据](https://www.vogella.com/tutorials/Mockito/article.html)
[Unit-tests-with-Mockito](https://github.com/xitu/gold-miner/blob/master/TODO/Unit-tests-with-Mockito.md)
[Mockito框架](http://mockito.github.io/)

Mock作用:
* 验证这个对象的某些方法的调用情况,调用了多少次,参数是什么等等
* 指定这个对象的某些方法的行为,返回特定的值,或者是执行特定的动作
* spy与mock的唯一区别就是默认行为不一样:spy对象的方法默认调用真实的逻辑,mock对象的方法默认什么都不做,或直接返回默认值

## MockServer



## Sonarlint-质量控制
### SonarLint插件安装
IDEA菜单栏选择File->Settings，左边栏选择Plugins--->下载SonarLint(可能需要翻墙)

### IDEA SonarLint使用
* 安装SonarLint插件重启后，IDEA Tool Windows部分会出现SonarLint View。如果没有出现，选择菜单View->Tool Windows->SonarLint会显示

#### 激活SonarLint在线检测


#### 安装sonarqube检测
[SonarQube部署及代码质量扫描入门教程](https://cloud.tencent.com/developer/article/1484850)
[Sonar代码质量与技术债](https://www.jianshu.com/p/ecde17e91711)
[Jenkins+SonarQube+Gitlab搭建自动化持续代码扫描质平台](https://mp.weixin.qq.com/s/V_IpoSDcWr37BE3sWKTbyw)
[SonarQube 搭建代码质量管理平台（一）](https://www.jianshu.com/p/7d1c0f5dcc78)
[SonarQube 搭建代码质量管理平台（二）](https://www.jianshu.com/p/dd2b2be06d38)

## Jacoco-覆盖率
###  在 pom.xml中引入Jacoco与Junit依赖
```
<dependencies>
    <dependency>
        <groupId>org.jacoco</groupId>
        <artifactId>jacoco-maven-plugin</artifactId>
        <version>0.8.2</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.12</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

###  
在构建配置中设置Jacoco规则与引入maven surefire plugin
1.maven-surefire-plugin：该插件也可以称为测试运行器(Test Runner)，它能兼容JUnit 3、JUnit 4以及TestNG，在pom中如不显式配置就会用默认配置。在默认情况下，该插件的test目标会自动执行测试源码路径（默认为src/test/java/）下所有符合一组命名模式的测试类。这组模式为：
|默认包含的测试类|	默认排除的测试类|
|---------------|-----------------|
|/＊Test.java <br> /Test＊.java <br> /＊TestCase.java <br>|Abstract＊TestCase.java|

2.Jacoco规则为（以下第三点配置为例子）
- 在<configuration>中配置具体生成的jacoco-unit.exec的目录，同步通过<include>指定；
- 在<rules>中配置对应的覆盖率检测规则；
- 在<executions>中配置执行步骤：
  1.prepare-agent(即构建jacoco-unit.exec)；
  2.check(即根据在<rules>定义的规矩进行检测)；
  3.package(生成覆盖率报告，默认生成在target/site/index.html)

### 配置pom.xml
[参考文件](https://blog.csdn.net/weixin_40514600/article/details/102583631)
```
<build>
    <finalName>guns</finalName>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.1</version>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                </configuration>
            </plugin>
 
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>2.18.1</version>
                <configuration>
               	    <!-- 不跳过测试 -->
                    <skipTests>false</skipTests>
                </configuration>
            </plugin>
 
            <plugin>
                <groupId>org.jacoco</groupId>
                <artifactId>jacoco-maven-plugin</artifactId>
                <version>0.8.2</version>
                 <configuration>
                    <skip>false</skip>
                    <destFile>target/coverage-reports/jacoco-unit.exec</destFile>
                    <dataFile>target/coverage-reports/jacoco-unit.exec</dataFile>
                    <includes>
                        <include>**/stylefeng/guns/**</include>
                        <!--<include>**/service/impl/*.class</include>-->
                    </includes>
                    <!-- rules里面指定覆盖规则 -->
                    <rules>
                        <rule implementation="org.jacoco.maven.RuleConfiguration">
                            <element>BUNDLE</element>
                            <limits>　　
                                <!-- 指定方法覆盖到50% -->
                                <limit implementation="org.jacoco.report.check.Limit">
                                    <counter>METHOD</counter>
                                    <value>COVEREDRATIO</value>
                                    <minimum>0.01</minimum>
                                </limit>
                                <!-- 指定分支覆盖到50% -->
                                <limit implementation="org.jacoco.report.check.Limit">
                                    <counter>BRANCH</counter>
                                    <value>COVEREDRATIO</value>
                                    <minimum>0.01</minimum>
                                </limit>
                                <!-- 指定类覆盖到100%，不能遗失任何类 -->
                                <limit implementation="org.jacoco.report.check.Limit">
                                    <counter>CLASS</counter>
                                    <value>MISSEDCOUNT</value>
                                    <maximum>100</maximum>
                                </limit>
                            </limits>
                        </rule>
                    </rules>
                </configuration>
                <executions>
                    <!-- 在maven的initialize阶段，将Jacoco的runtime agent作为VM的一个-->
                    <!-- 参数 传给被测程序，用于监控JVM中的调用。 -->
                    <execution>
                        <id>jacoco-initialize</id>
                        <goals>
                            <goal>prepare-agent</goal>
                        </goals>
                    </execution>
                    <!--这个check:对代码进行检测，控制项目构建成功还是失败-->
                    <execution>
                        <id>check</id>
                        <goals>
                            <goal>check</goal>
                        </goals>
                    </execution>
                    <!--这个report:对代码进行检测，然后生成index.html在-->
                    <!--target/site/index.html 中可以查看检测的详细结果-->
                    <execution>
                        <configuration>
                        	 <!-- 指定覆盖率报告的生成位置 -->
                            <outputDirectory>${basedir}/target/coverage-reports</outputDirectory>
                        </configuration>
                        <id>default-report</id>
                        <phase>prepare-package</phase>
                        <goals>
                            <goal>report</goal>
                        </goals>
                    </execution>
                </executions>
 
            </plugin>
        </plugins>
```

###  项目根目录下运行mvn命令
mvn clean install

###  查看
访问target目下的index.html,查看覆盖率报告



