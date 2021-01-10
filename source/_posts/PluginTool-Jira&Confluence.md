---
title: 安装Jira&Confluence
tags: [Tool,Jira,Confluence]
categories: [PluginTool]
---
## Atlassian产品线全破解
点击查看README:[atlassian-agent](https://github.com/cdongtao/atlassian-agent)

## [通过Docker安装JIRA和Confluence（破解版）](https://my.oschina.net/wuweixiang/blog/3014644)
### JIRA 7.12.0
#### 安装 mysql 5.7
```
    # 启动容器mysql
    docker run --name mysql \
    --restart always \
    -p 3306:3306 \
    -e MYSQL_ROOT_PASSWORD=zagame10086 \
    -v data_mysql_vol:/var/lib/mysql \
    -v conf_mysql_vol:/etc/mysql/conf.d \
    -v data_backup_vol:/backup \
    -d mysql:5.7
```
#### 配置数据库
MySQL所使用的配置文件my.cnf核心参数
```
[client]
default-character-set = utf8

[mysql]
default-character-set = utf8

[mysqld]
character_set_server = utf8
collation-server = utf8_bin
transaction_isolation = READ-COMMITTED
```
需要注意的是，Confluence需要使用utf8_bin，并将事务隔离策略设为READ-COMMITTED。

#### 创建表及用户
```
--创建jira数据库及用户
--drop database jira;
create database jira character set 'UTF8';
create user jira identified by 'jira';
grant all privileges on `jira`.* to 'jira'@'172.%' identified by 'jira' with grant option;
grant all privileges on `jira`.* to 'jira'@'localhost' identified by 'jira' with grant option;
flush privileges;

--创建confluence数据库及用户
--drop database confluence;
create database confluence character set 'UTF8';
create user confluence identified by 'confluence';
grant all privileges on `confluence`.* to 'confluence'@'%' identified by 'confluence' with grant option;
grant all privileges on `confluence`.* to 'confluence'@'localhost' identified by 'confluence' with grant option;
flush privileges;
--设置confluence字符集
alter database confluence character set utf8 collate utf8_bin;
-- confluence要求设置事务级别为READ-COMMITTED
set global tx_isolation='READ-COMMITTED';
--set session transaction isolation level read committed;
--show variables like 'tx%';
```

### 安装JIRA 7.12.0
JIRA 是一个缺陷跟踪管理系统，为针对缺陷管理、任务追踪和项目管理的商业性应用软件，开发者是澳大利亚的Atlassian。JIRA这个名字并不是一个缩写，而是截取自“Gojira”，日文的哥斯拉发音

#### 制作Docker破解容器
编写Dockerfile文件
```
FROM cptactionhank/atlassian-jira-software:7.12.0
USER root
# 将代理破解包加入容器
COPY "atlassian-agent.jar" /opt/atlassian/jira/
# 设置启动加载代理包
RUN echo 'export CATALINA_OPTS="-javaagent:/opt/atlassian/jira/atlassian-agent.jar ${CATALINA_OPTS}"' >> /opt/atlassian/jira/bin/setenv.sh
```
#### 更换文件
下载atlassian-agent.jar文件，放置在Dockerfile同目录下，例如：
```
- JIRA
  --Dockerfile
  --atlassian-agent.jar
```
#### 构建镜像，执行命令
docker build -t jira/jira:v7.12.0 .
结果如下：
```
Sending build context to Docker daemon  985.1kB
Step 1/4 : FROM cptactionhank/atlassian-jira-software:7.12.0
 ---> 1b29859343c2
Step 2/4 : USER root
 ---> Using cache
 ---> 31ea501d34b6
Step 3/4 : COPY "atlassian-agent.jar" /opt/atlassian/jira/
 ---> ce3a1f7cd53d
Step 4/4 : RUN echo 'export CATALINA_OPTS="-javaagent:/opt/atlassian/jira/atlassian-agent.jar ${CATALINA_OPTS}"' >> /opt/atlassian/jira/bin/setenv.sh
 ---> Running in 88440445ba9e
 ---> f247b9463dbb
Removing intermediate container 88440445ba9e
Successfully built f247b9463dbb
Successfully tagged jira/jira:v7.12.0
```
#### 启动容器，执行命令
```
    # 启动容器jira，并关联mysql和confluence容器
    docker run --name jira \
    --restart always \
    --link mysql:mysql \
    --link confluence:confluence \
    -p 9005:8080 \
    -v data_jira_var:/var/atlassian/jira \
    -v data_jira_opt:/opt/atlassian/jira \
    -d jira/jira:v7.12.0
```
或者
```
docker run --detach --publish 8080:8080 jira/jira:v7.12.0
```
访问http://127.0.0.1:8080,可见如下页面
![001](/jira/001.png "001")
![002](/jira/002.png "002")

<font color="red">必须</font>选择手动配置项目

![003](/jira/003.png "003")

<font color="red">必须</font>演示使用内置数据库（生产环境需配置独立数据库）

![005](/jira/005.png "005")
<font color="red">破解重点</font>

![004](/jira/004.png "004")

* 复制服务器ID:BY9B-GWD1-1C78-K2DE
* 在本地存放"atlassian-agent.jar"的目录下执行命令，生成许可证：
```
# 需替换邮箱（test@test.com）、名称（BAT）、
# 访问地址（http://192.168.0.89）、服务器ID（BY9B-GWD1-1C78-K2DE）
# 为你的信息

java -jar atlassian-agent.jar -d -m test@test.com -n BAT -p jira -o http://192.168.0.89 -s BY9B-GWD1-1C78-K2DE
```
![007](/jira/007.png "007")
将生成的许可证复制到页面，完成破解。
![006](/jira/006.png "006")
![008](/jira/008.png "008")

### 安装Confluence（6.13.0)
#### 编写Dockerfile文件
```
FROM cptactionhank/atlassian-confluence:6.13.0

USER root

# 将代理破解包加入容器
COPY "atlassian-agent.jar" /opt/atlassian/confluence/

# 设置启动加载代理包
RUN echo 'export CATALINA_OPTS="-javaagent:/opt/atlassian/confluence/atlassian-agent.jar ${CATALINA_OPTS}"' >> /opt/atlassian/confluence/bin/setenv.sh
```

#### 更换文件
下载atlassian-agent.jar文件，放置在Dockerfile同目录下，例如
- Confluence
  --Dockerfile
  --atlassian-agent.jar

#### 构建镜像，执行命令：
```
docker build -f Dockerfile -t confluence/confluence:6.13.0 .
```
或
```
# 启动容器confluence，并关联mysql和jira容器
docker run --name confluence \
    --restart always \
    --link mysql:mysql \
    --link jira:jira \
    -p 9006:8090 \
    -v data_confluence_vol:/home/confluence_data \
    -v data_confluence_opt:/opt/atlassian/confluence \
    -v data_confluence_var:/var/atlassian/confluence \
    -d confluence/confluence:6.13.0
```

#### 启动容器，执行命令
docker run --detach --publish 8090:8090 confluence/confluence:6.13.0

打开浏览器访问 http://127.0.0.1:9006 ，可见confluence页面，可切换中文操作，在请指定你的许可证关键字时，把服务器ID记下，使用atlassian-agent.jar算号破解！！！操作如下：
* 复制服务器ID:B6QG-R8VH-YCHH-8EY2
* 在本地存放"atlassian-agent.jar"的目录下执行命令，生成许可证：

生成confluence许可命令参照如下：
```
# 设置产品类型：-p conf， 详情可执行：java -jar atlassian-agent.jar 
java -jar atlassian-agent.jar -d -m test@test.com -n BAT -p conf -o http://192.168.0.89 -s BY9B-GWD1-1C78-K2DE
```

### 后台日志报错Establishing SSL connection without解决
原因：MySQL5.7.6以上版本要默认要求使用SSL连接，如果不使用需要通过设置useSSL=false来声明。
解决方案：在mysql连接字符串url中加入useSSL=true或者false即可
```
# Confluence找到配置文件/var/atlassian/confluence/confluence.cfg.xml修改mysql连接字符串如下：
jdbc:mysql://mysql/confluence?useUnicode=true&amp;characterEncoding=utf8&amp;useSSL=false

# Jira找到配置文件/var/atlassian/jira/dbconfig.xml修改mysql连接字符串如下：
jdbc:mysql://address=(protocol=tcp)(host=mysql)(port=3306)/jira?useUnicode=true&amp;characterEncoding=UTF8&amp;sessionVariables=default_storage_engine=InnoDB&amp;useSSL=false
```