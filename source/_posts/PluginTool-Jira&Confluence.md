---
title: Jira & Confluence
tags: [Tool,Jira,Confluence]
categories: [PluginTool]
---
## Atlassian产品线全破解
点击查看README:[atlassian-agent](https://github.com/cdongtao/atlassian-agent)

## [JIRA(7.12.0)和Confluence(6.13.0)](https://my.oschina.net/wuweixiang/blog/3014644)
### 在Docker下安装JIRA-7.12.0
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

### 在Docker下安装Confluence(6.13.0)
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

## [Jira(7.10.0)](https://www.jianshu.com/p/093cf14361ed)与[Confluence(6.9.0)](https://www.jianshu.com/p/bda2638fdbc2)与[Crowd(3.2.1)](https://www.jianshu.com/p/963910d01795)

1. JDK1.8已经Mysql自己准备
2. JIRA版本: 7.10.0:[点击官方下载地址](https://www.atlassian.com/software/jira/download) && atlassian-extras-3.2.jar
3. confluence：6.9.0：[点击官方下载地址](https://www.atlassian.com/software/confluence/download) && atlassian-extras-decoder-v2-3.3.0.jar && patch工具 
4. Crowd: 3.2.1:[点击官方下载地址](https://www.atlassian.com/software/crowd/download) && atlassian-extras-3.2.jar
[所有文件链接:](https://pan.baidu.com/s/1wF8MJ4nq5aZQvGlHqtEMSw) - 密码:6xzf

### Jira(7.10.0)
#### 传统方式安装和启动准备
* CentOS 7.x
* JDK 1.8（配置好JAVA_HOME）
* MYSQL 5.7.X（二进制安装或者Docker镜像）
```
## 解压安装包
cd your-path
tar -xvf atlassian-jira-software-7.10.0.tar.gz
mv /your-path/atlassian-jira-software-7.10.0-standalone/ /your-path/atlassian-jira-7.10.0
## 配置环境变量JIRA_HOME
vim ~/.zshrc #看大家用的什么系统，环境文件有所不同
export JIRA_HOME=/tmp/jira-home
## mysql的驱动Jar去官网下载一个适合5.7的即可
cp mysql-connector-java-5.1.45.jar /your-path/atlassian-jira-7.10.0/atlassian-jira/WEB-INF/lib
# 请复制atlassian-extras-3.2.jar到/your-path/atlassian-jira-7.10.0/atlassian-jira/WEB-INF/lib
cp atlassian-extras-3.2.jar /your-path/atlassian-jira-7.10.0/atlassian-jira/WEB-INF/lib
## 启动
/your-path/atlassian-jira-7.10.0/bin/start-jira.sh
# 默认是8080端口，在浏览器打开http://localhost:8080
```

#### Docker方式安装
由于jira官方已经在docker有镜像，我们在官方镜像上面加入自定义的内容即可，[官方的7.10.0的Dockerfile的Repo地址](https://github.com/cptactionhank/docker-atlassian-jira-software/tree/7.10.0)，我们需要的是红框的2个文件，后面需要修改为自己Dockerfile来使用：
![0001](/jira/0001.png "0001")

我在本地建立了一个Docker Build目录，包含下面几个文件
* Dockerfile（上面的官方repo下载）
* atlassian-jira-software-7.10.0.tar.gz（官方二进制包，主要是Dockerfile里面的Curl自动下载的速度实在是慢的可以，我在提前下载好，COPY进去，这块不是非必须用这个包，可以依赖Dockerfile的Curl到官方下载安装包）
* atlassian-extras-3.2.jar（百度网盘工具包）
* docker-entrypoint.sh（上面的官方repo下载）
* 修改Dockerfile
```
FROM openjdk:8-alpine

# Configuration variables.
ENV JIRA_HOME     /var/atlassian/jira
ENV JIRA_INSTALL  /opt/atlassian/jira
ENV JIRA_VERSION  7.10.0

# [新增]
COPY atlassian-jira-software-${JIRA_VERSION}.tar.gz /tmp/atlassian-jira-software-${JIRA_VERSION}.tar.gz
COPY atlassian-extras-3.2.jar /tmp/atlassian-extras-3.2.jar
# [新增]
RUN mkdir -p ${JIRA_INSTALL}
RUN tar -xzvf /tmp/atlassian-jira-software-${JIRA_VERSION}.tar.gz -C ${JIRA_INSTALL} --strip-components=1 --no-same-owner \
    && mv ${JIRA_INSTALL}/atlassian-jira/WEB-INF/lib/atlassian-extras-3.2.jar ${JIRA_INSTALL}/atlassian-jira/WEB-INF/lib/atlassian-extras-3.2.jar.bak \
    && mv /tmp/atlassian-extras-3.2.jar ${JIRA_INSTALL}/atlassian-jira/WEB-INF/lib \
    && rm -rf /tmp/atlassian-jira-software-${JIRA_VERSION}.tar.gz

# Install Atlassian JIRA and helper tools and setup initial home
# directory structure.
RUN set -x \
    && apk add --no-cache curl xmlstarlet bash ttf-dejavu libc6-compat \
    && mkdir -p                "${JIRA_HOME}" \
    && mkdir -p                "${JIRA_HOME}/caches/indexes" \
    && chmod -R 700            "${JIRA_HOME}" \
    && chown -R daemon:daemon  "${JIRA_HOME}" \
    && mkdir -p                "${JIRA_INSTALL}/conf/Catalina" \
    && curl -Ls                "https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-java-5.1.38.tar.gz" | tar -xz --directory "${JIRA_INSTALL}/lib" --strip-components=1 --no-same-owner "mysql-connector-java-5.1.38/mysql-connector-java-5.1.38-bin.jar" \
    && rm -f                   "${JIRA_INSTALL}/lib/postgresql-9.4.1212.jar" \ # [修改] 之前的要删除的jar发现lib没有
    && curl -Ls                "https://jdbc.postgresql.org/download/postgresql-42.2.1.jar" -o "${JIRA_INSTALL}/lib/postgresql-42.2.1.jar" \
    && chmod -R 700            "${JIRA_INSTALL}/conf" \
    && chmod -R 700            "${JIRA_INSTALL}/logs" \
    && chmod -R 700            "${JIRA_INSTALL}/temp" \
    && chmod -R 700            "${JIRA_INSTALL}/work" \
    && chown -R daemon:daemon  "${JIRA_INSTALL}/conf" \
    && chown -R daemon:daemon  "${JIRA_INSTALL}/logs" \
    && chown -R daemon:daemon  "${JIRA_INSTALL}/temp" \
    && chown -R daemon:daemon  "${JIRA_INSTALL}/work" \
    && sed --in-place          "s/java version/openjdk version/g" "${JIRA_INSTALL}/bin/check-java.sh" \
    && echo -e                 "\njira.home=$JIRA_HOME" >> "${JIRA_INSTALL}/atlassian-jira/WEB-INF/classes/jira-application.properties" \
    && touch -d "@0"           "${JIRA_INSTALL}/conf/server.xml"

# Use the default unprivileged account. This could be considered bad practice
# on systems where multiple processes end up being executed by 'daemon' but
# here we only ever run one process anyway.
USER daemon:daemon

# Expose default HTTP connector port.
EXPOSE 8080

# Set volume mount points for installation and home directory. Changes to the
# home directory needs to be persisted as well as parts of the installation
# directory due to eg. logs.
VOLUME ["/var/atlassian/jira", "/opt/atlassian/jira/logs"]

# Set the default working directory as the installation directory.
WORKDIR /var/atlassian/jira

COPY "docker-entrypoint.sh" "/"
ENTRYPOINT ["/docker-entrypoint.sh"]

# Run Atlassian JIRA as a foreground process by default.
CMD ["/opt/atlassian/jira/bin/start-jira.sh", "-fg"]
```
#### 执行build
```
cd /your-docker-build-path
docker build -t michael/atlassian-jira:7.10.0 .
```

#### 启动镜像（配套如果使用MYSQL，建议Docker Compose启动Jira + MYSQL）
```
docker run -d --rm --name=jira -p 8080:8080 \
-v /Users/liuyang/CodeMonkey/workspace/docker-workspace/jira/home:/var/atlassian/jira \
-v /Users/liuyang/CodeMonkey/workspace/docker-workspace/jira/logs:/opt/atlassian/jira/logs \
michael/atlassian-jira:7.10.0
```

#### 配置
![0002](/jira/0002.png "0002")

* 配置数据库
![0003](/jira/0003.png "0003")

* 设置应用程序的属性
![0004](/jira/0004.png "0004")

* 指定许可证（需要先去官网注册新账号，相当于注册一个试用的code，生成许可证）
![0005](/jira/0005.png "0005")
![0006](/jira/0006.png "0006")

* 配置管理员相关信息
![0007](/jira/0007.png "0007")
![0008](/jira/0008.png "0008")

### Confluence(6.9.0)
#### 传统方式安装和启动准备
* CentOS 7.x
* JDK 1.8（配置好JAVA_HOME）
* MYSQL 5.7.X（二进制安装或者Docker镜像）
```
## 解压安装包
cd your-path
tar -xvf atlassian-confluence-6.9.0.tar.gz
## 指定工作目录
vi /your-path/atlassian-confluence-6.9.0/confluence/WEB-INF/classes/confluence-init.properties
# 在文件中加入 confluence.home=/your-home-path/
## 用下载的atlassian-extras-decoder-v2-3.3.0.jar覆盖原有Jar
cp -aR /your-path/atlassian-extras-decoder-v2-3.3.0.jar /your-path/atlassian-confluence-6.9.0/confluence/WEB-INF/lib/
## mysql的驱动Jar去官网下载一个适合5.7的即可
cp mysql-connector-java-5.1.45.jar /your-path/atlassian-confluence-6.9.0/confluence/WEB-INF/lib
## 启动
/your-path/atlassian-confluence-6.9.0/bin/start-confluence.sh
# 默认是8090端口，在浏览器打开http://localhost:8090
```

#### Docker方式安装
由于官方已经有镜像，我们在官方镜像上面加入自定义的内容即可，[官方的6.9.0的Dockerfile的Repo地址](https://github.com/cptactionhank/docker-atlassian-confluence/tree/6.9.0)，我们需要的是红框的2个文件，后面需要修改使用，
![0009](/jira/0009.png "0009")

建立了一个Docker Build目录，包含下面几个文件
* Dockerfile（上面的官方repo下载）
* atlassian-confluence-6.9.0.tar.gz（官方二进制包，主要是Dockerfile里面的Curl自动下载的速度实在是慢的可以，我在提前下载好，COPY进去，这块不是非必须用这个包，可以依赖Dockerfile的Curl到官方下载安装包）
* atlassian-extras-decoder-v2-3.3.0.jar（百度网盘工具包）
* docker-entrypoint.sh（上面的官方repo下载）
* 修改Dockerfile
```
FROM openjdk:8-alpine

# Setup useful environment variables
ENV CONF_HOME     /var/atlassian/confluence
ENV CONF_INSTALL  /opt/atlassian/confluence
ENV CONF_VERSION  6.9.0

ENV JAVA_CACERTS  $JAVA_HOME/jre/lib/security/cacerts
ENV CERTIFICATE   $CONF_HOME/certificate

# [新增] 把build目录的必要文件复制到镜像内
COPY atlassian-confluence-${CONF_VERSION}.tar.gz /tmp/atlassian-confluence-${CONF_VERSION}.tar.gz
COPY atlassian-extras-decoder-v2-3.3.0.jar /tmp/atlassian-extras-decoder-v2-3.3.0.jar

# [新增] 创建Install目录，解压安装包，替换工具Jar包，删除安装包压缩文件
RUN mkdir -p ${CONF_INSTALL}
RUN tar -xzvf /tmp/atlassian-confluence-${CONF_VERSION}.tar.gz -C ${CONF_INSTALL} --strip-components=1 --no-same-owner \
    && mv ${CONF_INSTALL}/confluence/WEB-INF/lib/atlassian-extras-decoder-v2-3.3.0.jar ${CONF_INSTALL}/confluence/WEB-INF/lib/atlassian-extras-decoder-v2-3.3.0.jar.bak \
    && mv /tmp/atlassian-extras-decoder-v2-3.3.0.jar ${CONF_INSTALL}/confluence/WEB-INF/lib \
    && rm -rf /tmp/atlassian-confluence-${CONF_VERSION}.tar.gz

# Install Atlassian Confluence and helper tools and setup initial home
# directory structure.
RUN set -x \
    && apk --no-cache add curl xmlstarlet bash ttf-dejavu libc6-compat gcompat \
    && mkdir -p                "${CONF_HOME}" \
    && chmod -R 700            "${CONF_HOME}" \
    && chown daemon:daemon     "${CONF_HOME}" \
    && mkdir -p                "${CONF_INSTALL}/conf" \
    && curl -Ls                "https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-java-5.1.44.tar.gz" | tar -xz --directory "${CONF_INSTALL}/confluence/WEB-INF/lib" --strip-components=1 --no-same-owner "mysql-connector-java-5.1.44/mysql-connector-java-5.1.44-bin.jar" \
    && chmod -R 700            "${CONF_INSTALL}/conf" \
    && chmod -R 700            "${CONF_INSTALL}/temp" \
    && chmod -R 700            "${CONF_INSTALL}/logs" \
    && chmod -R 700            "${CONF_INSTALL}/work" \
    && chown -R daemon:daemon  "${CONF_INSTALL}/conf" \
    && chown -R daemon:daemon  "${CONF_INSTALL}/temp" \
    && chown -R daemon:daemon  "${CONF_INSTALL}/logs" \
    && chown -R daemon:daemon  "${CONF_INSTALL}/work" \
    && echo -e                 "\nconfluence.home=$CONF_HOME" >> "${CONF_INSTALL}/confluence/WEB-INF/classes/confluence-init.properties" \
    && xmlstarlet              ed --inplace \
        --delete               "Server/@debug" \
        --delete               "Server/Service/Connector/@debug" \
        --delete               "Server/Service/Connector/@useURIValidationHack" \
        --delete               "Server/Service/Connector/@minProcessors" \
        --delete               "Server/Service/Connector/@maxProcessors" \
        --delete               "Server/Service/Engine/@debug" \
        --delete               "Server/Service/Engine/Host/@debug" \
        --delete               "Server/Service/Engine/Host/Context/@debug" \
                               "${CONF_INSTALL}/conf/server.xml" \
    && touch -d "@0"           "${CONF_INSTALL}/conf/server.xml" \
    && chown daemon:daemon     "${JAVA_CACERTS}"

# Use the default unprivileged account. This could be considered bad practice
# on systems where multiple processes end up being executed by 'daemon' but
# here we only ever run one process anyway.
USER daemon:daemon

# Expose default HTTP connector port.
EXPOSE 8090 8091

# Set volume mount points for installation and home directory. Changes to the
# home directory needs to be persisted as well as parts of the installation
# directory due to eg. logs.
VOLUME ["/var/atlassian/confluence", "/opt/atlassian/confluence/logs"]

# Set the default working directory as the Confluence home directory.
WORKDIR /var/atlassian/confluence

COPY docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]

# Run Atlassian Confluence as a foreground process by default.
CMD ["/opt/atlassian/confluence/bin/start-confluence.sh", "-fg"]
```

#### 执行build
```
cd /your-docker-build-path
docker build -t michael/atlassian-confluence:6.9.0 .
```

#### 启动镜像（配套如果使用MYSQL，建议Docker Compose启动Confluence + MYSQL）
docker run -d --rm --name=wiki -p 8090:8090 -p 8091:8091 \
-v /your-confluence-path/home:/var/atlassian/confluence \
-v /your-confluence-path/logs:/opt/atlassian/confluence/logs \
michael/atlassian-confluence:6.9.0 

#### 配置
* 选择产品安装
![0010](/jira/0010.png "0010")
* 点击下一步（省略了一步，授权码填写，用keygen，你懂得）
![0011](/jira/0011.png "0011")
* 选择配置数据库
![0012](/jira/0012.png "0012")
* 配置数据库并测试（我选择的是MYSQL，这里需要修改MYSQL事务隔离级别，改成transaction-isolation = READ-COMMITTED，读取已提交，Confluence要求的，会检查）
![0013](/jira/0013.png "0013")
![0014](/jira/0014.png "0014")
* 选择红框选项（Confluence有多种用户管理方式，为了单纯介绍Confluence，暂时不展开；剩余方式有：Jira数据库、Crowd数据库、LDAP数据库等等）
![0015](/jira/0015.png "0015")
![0016](/jira/0016.png "0016")

### Crowd(3.2.1)
#### Docker方式安装
由于官方已经有镜像，我们在官方镜像上面加入自定义的内容即可，[官方3.2.1镜像Repo](https://bitbucket.org/atlassian-docker/docker-atlassian-crowd/src/3.2.1/)，我们需要的是红框的2个文件，如下（Repo托管是bitbucket）
![0017](/jira/0017.png "0017")

建立了一个Docker Build目录，包含下面几个文件
* Dockerfile（上面的官方repo下载）
* atlassian-crowd-3.2.1.tar.gz（官方二进制包，主要是Dockerfile里面的Curl自动下载的速度实在是慢的可以，我在提前下载好，COPY进去，这块不是非必须用这个包，可以依赖Dockerfile的Curl到官方下载安装包）
* atlassian-extras-3.2.jar（百度网盘工具包）
* mysql-connector-java-5.1.45.jar（Mysql官网下载一个）
* entrypoint.sh（上面的官方repo下载）
* 修改Dockerfile
```
FROM openjdk:8-jdk-alpine
MAINTAINER Dave Chevell

ENV RUN_USER            daemon
ENV RUN_GROUP           daemon

# https://confluence.atlassian.com/crowd/important-directories-and-files-78676537.html
ENV CROWD_HOME          /var/atlassian/application-data/crowd
ENV CROWD_INSTALL_DIR   /opt/atlassian/crowd

VOLUME ["${CROWD_HOME}"]

# Expose HTTP port
EXPOSE 8095

WORKDIR $CROWD_HOME

CMD ["/entrypoint.sh", "-fg"]
ENTRYPOINT ["/sbin/tini", "--"]

RUN apk add --no-cache wget curl openssh bash procps openssl perl ttf-dejavu tini

COPY entrypoint.sh              /entrypoint.sh

ARG CROWD_VERSION=3.2.1

COPY atlassian-crowd-${CROWD_VERSION}.tar.gz /tmp/atlassian-crowd-${CROWD_VERSION}.tar.gz
COPY atlassian-extras-3.2.jar /tmp/atlassian-extras-3.2.jar
COPY mysql-connector-java-5.1.45.jar /tmp/mysql-connector-java-5.1.45.jar

RUN mkdir -p                             ${CROWD_INSTALL_DIR} \
    && tar -xzvf /tmp/atlassian-crowd-${CROWD_VERSION}.tar.gz -C ${CROWD_INSTALL_DIR} --strip-components=1 --no-same-owner \
    && mv ${CROWD_INSTALL_DIR}/crowd-webapp/WEB-INF/lib/atlassian-extras-3.2.jar ${CROWD_INSTALL_DIR}/crowd-webapp/WEB-INF/lib/atlassian-extras-3.2.jar.bak \
    && mv /tmp/atlassian-extras-3.2.jar ${CROWD_INSTALL_DIR}/crowd-webapp/WEB-INF/lib \
    && mv /tmp/mysql-connector-java-5.1.45.jar ${CROWD_INSTALL_DIR}/crowd-webapp/WEB-INF/lib \
    && rm -rf /tmp/atlassian-crowd-${CROWD_VERSION}.tar.gz \
    && chown -R ${RUN_USER}:${RUN_GROUP} ${CROWD_INSTALL_DIR}/ \
    && sed -i -e 's/-Xms\([0-9]\+[kmg]\) -Xmx\([0-9]\+[kmg]\)/-Xms\${JVM_MINIMUM_MEMORY:=\1} -Xmx\${JVM_MAXIMUM_MEMORY:=\2} \${JVM_SUPPORT_RECOMMENDED_ARGS} -Dcrowd.home=\${CROWD_HOME}/g' ${CROWD_INSTALL_DIR}/apache-tomcat/bin/setenv.sh \
    && sed -i -e 's/port="8095"/port="8095" secure="${catalinaConnectorSecure}" scheme="${catalinaConnectorScheme}" proxyName="${catalinaConnectorProxyName}" proxyPort="${catalinaConnectorProxyPort}"/' ${CROWD_INSTALL_DIR}/apache-tomcat/conf/server.xml
```

#### 执行build
```
cd /your-docker-build-path
docker build -t michael/atlassian-crowd:3.2.1 .
```

#### 启动镜像（配套如果使用MYSQL，建议Docker Compose启动Jira + MYSQL）
```
docker run -d --rm --name="crowd" \
-v /your-path/crowd:/var/atlassian/application-data/crowd  \
-p 8095:8095 \
-e "JVM_MINIMUM_MEMORY=384m"
-e "JVM_MAXIMUM_MEMORY=768m"
michael/atlassian-crowd:3.2.1
```

#### 配置
* 打开http://ip:8095，点击Set up Crowd
![0018](/jira/0018.png "0018")
* 用百度网盘的包，进行操作，进入下一步
* 选择New installation
![0019](/jira/0019.png "0019")
* 配置数据库
![0020](/jira/0020.png "0020")
* 其他信息确认
![0021](/jira/0021.png "0021")
* 默认管理员信息
![0022](/jira/0022.png "0022")

## [JIRA(7.8)详细版本](https://www.cnblogs.com/houchaoying/p/9096118.html)
### 准备环境
jira的运行是依赖java环境的，也就是说需要安装jdk并且要是1.8以上版本
![01](/jira/01.png "01")

除此之外，我们还需要安装MySQL，为jira创建对应的数据库、用户名和密码，如下：
注意：建库名jira,字符集为UTF-8
```
mysql -uroot -p'kans123QWE' -e "create database jira default character set utf8 collate utf8_bin;grant all on jira.* to 'jira@’%' identified by 'jirapasswd';"
```
![02](/jira/01.png "02")
![03](/jira/01.png "03")
![04](/jira/01.png "04")

### 下载并安装jira。
查看Linux系统是多少位的下载相应的版本
![05](/jira/05.png "05")

[jira 的下载网站](https://www.atlassian.com/software/jira/download)
![06](/jira/06.png "06")

wget  https://downloads.atlassian.com/software/jira/downloads/atlassian-jira-software-7.8.1-x64.bin
![07](/jira/07.png "07")

### 开始安装jira
![08](/jira/08.png "08")
![09](/jira/09.png "09")
![10](/jira/10.png "10")
![11](/jira/11.png "11")
![12](/jira/12.png "12")

通过上图，我们可以很明显的看出jira安装到了/opt/atlassian/jira和/var/atlassian/application-data/jira目录下，并且jira监听的端口是8080。
jira的主要配置文件，存放在/opt/atlassian/jira/conf/server.xml文件中
 vim /opt/atlassian/jira/conf/server.xml
![13](/jira/13.png "13")

### 启动
![14](/jira/14.png "14")
![15](/jira/15.png "15")
现在我们先关闭jira，然后把破解包里面的atlassian-extras-3.2.jar和mysql-connector-java-5.1.39-bin.jar两个文件复制到/opt/atlassian/jira/atlassian-jira/WEB-INF/lib/目录下。
其中atlassian-extras-3..2.jar是用来替换原来的atlassian-extras-3.2.jar文件，用作破解jira系统的。
而mysql-connector-java-5.1.39-bin.jar是用来连接mysql数据库的驱动软件包。

### 安装破解
![16](/jira/16.png "16")

在/opt/atlassian/jira/atlassian-jira/WEB-INF/lib/这个目录下，找到atlassian-extras-的包看看是3点几的 然后现在对应的破解包，替换这个
![17](/jira/17.png "17")

替换
![18](/jira/18.png "18")

放置连接mysql数据库的包
![19](/jira/19.png "19")

然后启动 就可以ip:8080访问了
![20](/jira/20.png "20")

ip:8080页面安装
![21](/jira/21.png "21")

![22](/jira/22.png "22")

填写好后测试连接一下看看是否成功，在下一步
![23](/jira/23.png "23")

然后下一步，因为要初始化数据库 要等会
![24](/jira/24.png "24")


而连接数据库的配置是/var/atlassian/application-data/jira/dbconfig.xml，如下：
cat /var/atlassian/application-data/jira/dbconfig.xml
![25](/jira/25.png "25")

下面的配置就比较简单了，自定义也可以，默认也可以。
![26](/jira/26.png "26")

注意：上图中的Mode中，我们在此使用的是Private（私有）模式，在这个模式下，用户的创建需要由管理员创建。而在Public（共用）模式下，用户是可以自己进行注册。
下面这个页面是需要我们输入jira的license，如下：
![27](/jira/27.png "27")

注意：上图中的Server ID：BSG9-24QF-8M40-O1CT
因为我们没有正式的license，所以需要我们在jira官网注册一个账号，然后利用这个账号申请一个可以试用30天的license，点击生成jira许可证。如下：
![28](/jira/28.png "28")

注意：这个图中的Server ID就是我们上面刚刚截图的Server ID。
![29](/jira/29.png "29")

点击yes 上面的key 就会自动复制到你的许可征
![30](/jira/30.png "30")

密码我设的lilili用户lili
![31](/jira/31.png "31")

![32](/jira/32.png "32")

![33](/jira/33.png "33")

![34](/jira/34.png "34")

 创建第一个项目，如下：
![35](/jira/35.png "35")
![36](/jira/36.png "36")
![37](/jira/37.png "37")
![38](/jira/38.png "38")
![39](/jira/39.png "39")

到此 jira 7.8的安装就好了，现在看看jira的破解
破解jira，其实我们已经破解了在前面复制atlassian-extras-3.1.2.jar到/opt/atlassian/jira/atlassian-jira/WEB-INF/lib/目录下时，再次启动jira时就已经破解了。我们现在登陆到jira中查看授权信息，如下：
![40](/jira/40.png "40")
![41](/jira/41.png "41")

通过上图，我们可以很明显的看到jira我们可以使用到2033年，。到此有关jira的安装、破解就已经全部结束。
如何修改内存？
vim /opt/atlassian/jira/bin/setenv.sh
![42](/jira/42.png "42")

### 日志查看
tail -f /opt/atlassian/jira/logs/catalina.out

## [jira(8.0.2)](https://www.cnblogs.com/qiangyuzhou/p/10530937.html)
### 环境
* centos7.4
* java1.8
* jira版本：8.0.2
* mysql ：mariadb

### 软件下载
破解包： atlassian-extras-3.2.jar
连接mysql驱动：mysql-connector-java-5.1.42.jar
[软件可以到官网下载最新版本](https://www.atlassian.com/software/jira/download)：jira-8.0.2
[下载地址](https://pan.baidu.com/s/1-P3V47GUhEuZB3wVlOIpvg) 提取码:rjxd 

### 安装步骤
#### mysql安装
```
yum -y install mariadb mariadb-server
systemctl start mariadb
systemctl enablemariadb
```
* mysql操作：
首先是设置密码，会提示先输入密码
Enter current password for root (enter fornone):<–初次运行直接回车

* 设置密码
Set root password? [Y/n] <– 是否设置root用户密码，输入y并回车或直接回车
New password: <– 设置root用户的密码
Re-enter new password: <– 再输入一次你设置的密码

* 其他配置
Remove anonymous users? [Y/n] <– 是否删除匿名用户，回车
Disallow root login remotely? [Y/n] <–是否禁止root远程登录,回车,
Remove test database and access to it?[Y/n] <– 是否删除test数据库，回车
Reload privilege tables now? [Y/n] <– 是否重新加载权限表，回车
退出重新登录ok

* mysql配置文件修改
接下来配置MariaDB的字符集:

1. -> 首先是配置文件/etc/my.cnf，在[mysqld]标签下添加
```
init_connect='SET collation_connection =utf8_unicode_ci'
init_connect='SET NAMES utf8'
character-set-server=utf8
collation-server=utf8_unicode_ci
skip-character-set-client-handshake
max_allowed_packet=256M
transaction-isolation=READ-COMMITTED
```

2. ->接着配置文件/etc/my.cnf.d/client.cnf，在[client]中添加
default-character-set=utf8

3. -> 然后配置文件/etc/my.cnf.d/mysql-clients.cnf，在[mysql]中添加
default-character-set=utf8

* 初始化数据及授权：
```
create database jira default character set utf8 collate utf8_bin;
grant all on jira.* to 'jira@’%' identified by 'jira';
flush privileges;
```

#### jdk安装
[官方软件下载](https://download.oracle.com/otn-pub/java/jdk/8u201-b09/42970487e3af4f5aa5bca3f542482c60/jdk-8u201-linux-x64.tar.gz)
下载完成后进行解压到:/usr/local/java
配置：
```
vim /etc/profile
export JAVA_HOME=/usr/local/java
export PATH=$JAVA_HOME/bin:$PATH
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib

cd /usr/bin
ln -s -f  /usr/local/java/bin/javac
ln -s  -f /usr/local/java/jre/bin/java
```

### jira(8.0.2)安装

1. 将/opt/atlassian/jira/atlassian-jira/WEB-INF/lib  中的atlassian-extras-3.2.jar删除
2. copy最新的破解包到此目录：/opt/atlassian/jira/atlassian-jira/WEB-INF/lib

mysql数据库选择5.6
主机名：ip
数据库名：jira
密码：jira

测试正常后，进入授权码页面，https://my.atlassian.com/product
选择jira soft 生产授权码

安装完成，重启jira
/etc/init.d/jira stop
/etc/init.d/jira start