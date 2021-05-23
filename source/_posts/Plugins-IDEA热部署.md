---
title: IDEA热部署
tags: [Plugin]
categories: [Project]
---

## spring-boot-devtools部署
* pom文件引入坐标
        <dependency>
	        <groupId>org.springframework.boot</groupId>
	        <artifactId>spring-boot-devtools</artifactId>
	        <optional>true</optional>
	    </dependency>
* pom文件增加下面配置
  <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <fork>true</fork><!--必须添加这个配置-->
                </configuration>
            </plugin>
        </plugins>
    </build>

* 在IDEA中设置开启自动编译
![IDEA自动编译](/plugins/1.png "1")
* Shift+Ctrl+Alt+/，选择Registry
选 compiler.automake.allow.when.app.running
重启项目就可以了

## Jrebel 实时编译和热部署

