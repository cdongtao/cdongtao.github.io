---
title: Flyway
tags: [Plugin,Template]
categories: [Project]
---

## Flyway使用背景
### 存在问题
![1.png](/flyway/1.png "1.png")
### 解决问题
![2.png](/flyway/2.png "2.png")

### 工作原理
![3.png](/flyway/3.png "3.png")

### 迁移脚本的命名规则
![4.png](/flyway/4.png "4.png")

### 实现路径方式
![5.png](/flyway/5.png "5.png")

#### API的方式
![6.png](/flyway/6.png "6.png")

Java API方式写迁移功能
![7.png](/flyway/7.png "7.png")

#### springboot方式
![8.png](/flyway/8.png "8.png")

## SprintBoot Flyway具体使用
### 引入flyway的依赖：
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
        <version>5.0.3</version>
　　</dependency>

### springboot 2.xx,使用5版本以后
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
        <version>5.2.1</version>
    </dependency>

### 在classpath下新建/db/migration文件夹，并创建sql脚本文件：
```
    CREATE TABLE person (
        id int(11) NOT NULL AUTO_INCREMENT,
        first varchar(100) NOT NULL,
        last varchar(100) NOT NULL,
        dateofbirth DATE DEFAULT null,
        placeofbirth varchar(100) not null,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

### Flyway配置
```
    //设定需要flywary迁移的schema，大小写敏感，默认为连接默认的schema
    spring.flyway.schemas
    //是否开启flywary，默认true
    spring.flyway.enabled
    //设置迁移时的编码，默认UTF-8
    spring.flyway.encoding
    //迁移脚本的位置，默认db/migration
    spring.flyway.locations
    //目标数据库的密码
    spring.flyway.password
    //使用的元数据表名，默认为schema_version
    spring.flyway.tableflyway
    //迁移时使用的JDBC URL，如果没有指定的话，将使用配置的主数据源
    spring.flyway.url
    //迁移数据库的用户名
    spring.flyway.user
    //对执行迁移时基准版本的描述
    spring.flyway.baseline-description
    //当迁移时发现目标schema非空，而且带有没有元数据的表时，是否自动执行基准迁移，默认false
    spring.flyway.baseline-on-migrate
    //开始执行基准迁移时对现有的schema的版本打标签，默认值为1
    spring.flyway.baseline-version
    //检查迁移脚本的位置是否存在，默认false
    spring.flyway.check-location
    //当发现校验错误时是否自动调用clean，默认false
    spring.flyway.clean-on-validation-error
    //当读取元数据表时是否忽略错误的迁移，默认false
    spring.flyway.ignore-failed-future-migration
    //当初始化好连接时要执行的SQL
    spring.flyway.init-sqls
    //是否允许无序的迁移，默认false
    spring.flyway.out-of-order
    //设置每个placeholder的前缀，默认${
    spring.flyway.placeholder-prefix
    //是否要被替换，默认true
    spring.flyway.placeholder-replacementplaceholders
    //设置每个placeholder的后缀，默认}
    spring.flyway.placeholder-suffix
    //设置placeholder的value
    spring.flyway.placeholders.[placeholder name]
    //迁移文件的前缀，默认为V
    spring.flyway.sql-migration-prefix
    //迁移脚本的文件名分隔符，默认__
    spring.flyway.sql-migration-separator
    //迁移脚本的后缀，默认为.sql
    spring.flyway.sql-migration-suffix
    //迁移时使用的目标版本，默认为latest version
    spring.flyway.target
    //迁移时是否校验，默认为true
    spring.flyway.validate-on-migrate
```

### mvn命令格式
mvn flyway:{flyway-command}

#### migrate
mvn flyway:migrate
这个命令会搜索默认的脚本目录，检测并根据结果选择执行升级脚本。

#### clean
mvn flyway:clean
这个命令会清除指定schema下全部的对象，包括table、view、triggers...，让schema变成空的状态。

#### info
mvn flyway:info
这个命令显示指定schema的升级状态，当前的数据库的版本信息。

#### validate
mvn flyway:validate
这个命令用于校验，范围包括已升级的脚本是否更名，已升级的脚本内容是否修改。全部针对已升级的脚本进行的改动都会致使校验失败。
执行migrate会自动进行校验，若是失败将不会作任何的migrate。
flyway但愿用户提供的脚本是稳定的，以避免形成额外的复杂性和混乱。

#### baseline
mvn flyway:baseline
若是用户从一个已有的数据库导出脚本，做为flyway的升级脚本。已存在的数据库是不须要升级的。baseline用于将当前数据库标记为baseline，并记录version为1。这表示用户继续执行migrate命令时，会自动跳过V1版本对应的脚本。而对于空的数据库，由于没有执行baseline，因此能够正常的执行V1版本对应的脚本。

#### Repair
mvn flyway:repair
修复命令尽量不要使用, 修复场景有: 1. 移除失败的 migration 记录. 2.已经应用的 SQL 脚本被修改, 我们想重新应用该 SQL 脚本.
它主要做了两件事，移除所有失败的迁移（升级），重置校验和。手动修改flyway自动生成的baseline记录，将版本号改成其余的版本号，将自动跳过该版本及更早的版本。


