---
title: JIRA 7.8 版本的安装与破解
tags: [Tool,Jira]
categories: [PluginTool]
---
## [JIRA 7.8 版本的安装与破解](https://www.cnblogs.com/houchaoying/p/9096118.html)
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