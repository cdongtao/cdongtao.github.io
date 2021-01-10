---
title: Jira 8.0.2安装与破解
tags: [Tool,Jira]
categories: [PluginTool]
---
## [jira8.0.2安装与破解](https://www.cnblogs.com/qiangyuzhou/p/10530937.html)
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

### jira安装

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