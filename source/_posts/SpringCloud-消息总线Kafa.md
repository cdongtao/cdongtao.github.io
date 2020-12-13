---
title: Kafka
tags: [消息,Kafka]
categories: [SpringBoot,SpringCloud,Spring]
---

## Kafka是什么？
Kafka是分布式实时流处理平台。在这个平台上，可以：
* 发布与订阅消息
* 作为消息中间件使用(类比于一个有入水口和出水口的大型蓄水池)
* 对实时流数据传输具有可靠保证

### Kafka解决什么问题？
![解耦1](/Kafka/解耦1.png "解耦1")
![解耦2](/Kafka/解耦2.png "解耦2")
* 解耦:让系统解耦,不再相互依赖
* 削峰:
* 异步:
### Kafka在大数据体系中的位置
![大数据位置](/Kafka/大数据位置.png "大数据位置")

### Kafka一共提供了如下四类核心API
![四大核心API](/Kafka/四大核心API.png "四大核心API")
Kafka所起的作用是：消息中间件、消息引擎、消息队列等
* Producer API：生产者API
* Consumer API：消费者API
* Streams API：流式处理API
* Connector API：与各其他数据库系统对接API

## Kafka集群的安装、部署与配置
### Kafka集群HA(高可用)模式部署的原理
* 任何分布式系统都有HA(Hight Availability)模式，即高可用性模式。
* Kafka的HA机制主要是通过数据复制和领袖选举来保证的

假设用三台服务器部署Kafka集群，其整体架构应该如下所示
![高可用架构图](/Kafka/高可用架构图.png "高可用架构图")

这里网上很多其他教程中ZooKeeper只有一个实例，这其实是不对的。ZooKeeper应该需要多个实例才能真正做到高可用性。具体表现为两个方面的高可用性：

* ZK集群的高可用性：
　　当ZooKeeper集群中有一个结点挂掉的话，会立刻有新的ZK结点代替该挂掉的结点。集群版的Zookeeper之间实际上是互为备份的，这样保证了ZK的整体服务不会有问题。
* Kafka集群的高可用性
　　当Kafka中有一个实例挂掉的话，ZooKeeper服务会立刻从剩下的实例中选出一个作为新的领袖结点，从而代替挂掉的实例，实现了Kafka集群的高可用性。

ZooKeeper是一个分布式的，开放源码的分布式应用程序协调服务，是Google的Chubby一个开源的实现，是Hadoop和Hbase的重要组件。它是一个为分布式应用提供一致性服务的软件，提供的功能包括：配置维护、域名服务、分布式同步、组服务等。
### Kafka与ZooKeeper的关系
那么为什么搭建Kafka集群一定需要ZooKeeper呢？从以上其实可以看出：Kafka集群实际上是利用了外部的ZooKeeper集群来解决其分布式一致性问题。如下图所示
![kafka与ZK](/Kafka/kafka与ZK.png "kafka与ZK")

我们可以简单的认为Kafka将ZooKeeper做数据库用了(哨兵)，用于管理producer，broker和consumer之间的协同调用。
一般分布式系统中状态一致性的维护有以下两种方式：
* P2P自己维护，例如Redis集群
* 通过第三方系统(ZooKeeper)维护，例如Kafka集群

### Kafka集群的故障转移
在高可用性分布式系统中，故障转移一般是以“心跳”或者“会话”的机制来实现的。Kafka的故障转移方式则是采用会话机制：每个Kafka实例启动后，都会以会话形式把自己注册到ZooKeeper服务中。一旦该实例运转现问题，它与ZooKeeper的会话便不能维持从而超时失效，此时Kafka集群会选举出另一个实例来完全代替这个实例继续提供服务，并且这一切换过程对外界服务完全透明。下图表明的是Kafka在ZooKeeper中保存的相关信息及其作用：
![故障转移](/Kafka/故障转移.png "故障转移")


### Kafka集群搭建
Kafka集群的搭建过程，一共分为三个步骤
#### Step1：下载Kafka包
示例采用的Kafka版本为kafka_2.11-2.0.0。注意这个版本号前面的2.11表明的是编译该Kafka所用的Scala语言的版本号，后面的2.0.0才是Kafka的真正版本号。
```
1# 下载包
2wget https://mirrors.tuna.tsinghua.edu.cn/apache/kafka/2.0.0/kafka_2.11-2.0.0.tgz
3# 解压缩
4tar -zxvf kafka_2.11-2.0.0.tgz
5cd kafka_2.11-2.0.0
```

#### Step2：修改配置文件
要修改的配置文件名称为：server.properties，修改的内容如下：
```
1broker.id=2 # 用唯一的数字进行区分
2listeners=PLAINTEXT://99.99.99.99:9092 # 本机IP
3advertised.listeners=PLAINTEXT://99.99.99.99:9092  # 本机IP
4zookeeper.connect=99.99.99.99:2181,99.99.99.98:2181,99.99.99.97:2181 # zookeeper的集群地址
5log.dirs=/home/work/kafka-logs # 数据存放地址
6log.retention.hours=1 # 数据保留的时间
```
#### Step3：启动Kafka
* 启动之前确保ZooKeeper进程存在，且处于正常状态
* 在每台机器上逐一启动（重要）
启动和关闭命令如下：
```
1# 启动Kafka
2bin/kafka-server-start.sh config/server.properties > kafka_start.log 2>&1 &
3# 关闭Kafka
4bin/kafka-server-stop.sh
```

## Kafka监控的安装、部署与配置
* 监控工具用的是：Kafka-Manager
* [点击源码下载](https://github.com/yahoo/kafka-manager)
* [点击编译好的包下载](https://blog.wolfogre.com/posts/kafka-manager-download/)：非常感谢作者的维护

### Step1：下载编译好的项目并解压
```
1# 下载编译好的包
2wget "https://github.com/wolfogre/kafka-manager-docker/releases/download/1.3.3.23/kafka-manager-1.3.3.23.zip"
3# 下载安装压缩与解压缩的包
4sudo yum install zip
5sudo yum install unzip
6# 解压缩
7unzip kafka-manager-1.3.3.23.zip
```
### Step2：修改配置文件
修改配置文件conf/application.conf
```
1kafka-manager.zkhosts="99.99.99.99:2181,99.99.99.98:2181,99.99.99.97:2181"
2basicAuthentication.enabled=true  # 开启访问认证 
3basicAuthentication.username="admin"  # 设置访问用户名
4basicAuthentication.password="admin"  # 设置访问密码
```
### Step3：启动监控进程
```
# 启动监控
bin/kafka-manager -Dconfig.file=./conf/application.conf -Dhttp.port=8081 > kafka_manager_start.log 2>&1 &
# 关闭监控
1ps aux | grep kafka-manager | grep -v grep | awk '{print $2}' | xargs kill
```

### Step4：访问监控地址
* 可以查看Kafka集群的监控:http://localhost:8081

## Kafka原理详解
* Kafka中的基本概念
* broker：一个独立的Kafka服务器称为一个broker
* 集群：多个broker组成一个Kafka集群
* 消息(Message)：Kafka中的数据单元，通过<tpoic、partition、offset>三元组，可以找到在Kafka中唯一对应的一条消息
* 批次：消息被分批次写入Kafka，批次就是一组消息
* 副本(Replica)：冗余机制，防止数据丢失。分为领导者副本（leader replica）与追随者副本（follower replica）
* 消息模式：消息被序列化的方式：Json、XML、Apache Avro
* 提交：更新分区当前位置的操作叫作提交
* 主题(Topic)：不同的主题，类比MySQL数据库中不同的表格
* 分区(Partition)：一个主题的消息可以设置多个分区
* 生产者：创建消息，消息的输入
* 消费者：读取消息，消息的输出

### 消息复制与分区
![消息复制与分区](/Kafka/消息复制与分区.png "消息复制与分区")
* 一个主题可以包含多个分区。Kafka无法在整个主题范围内保证消息的顺序，但可以保证消息在单个分区内的顺序。
* Kafka在物理上把Topic分成一个或多个Partition，每个Partiton在物理上对应一个文件夹，该文件夹下存储这个Partition的所有消息和索引文件。
* Kafka通过分区设计可以实现数据冗余和伸缩，分区可以分布在不同的服务器上，以此为高并发提供可能。
* 消息复制指的是每一个分区都可能会有一个或者多个副本，其中有一个副本会被推选为领袖节点，其余的落选的为从节点。其中领袖节点将会跟踪与其保持同步的副本列表，该列表称为ISR（In-Sync Replica）。

Kafka默认提供了很智能的leader选举算法，可以在集群的所有机器上以均等机会分散各个分区的leader节点，从而整体上实现了负载均衡。Kafka保证同一个分区的多个副本一定不会分配在同一台物理机上。如下图所示：
![分区原理](/Kafka/分区原理.png "分区原理")


### 数据的清理
* 对于Kafka来说，磁盘是最重要的子系统。所有的消息都保存在磁盘上，所以Kafka的性能严重依赖磁盘的性能。
* 对于超过时间周期的数据，Kafka会对其进行清理

### Kafka的高性能

Kafka的吞吐性能可达到千万级，相比于其他的系统，Kafka为什么有如此优秀的性能表现呢？原因有以下几点：
* Kafka大量使用操作系统页缓存，内存操作速度快且命中率高
* Kafka不直接参与物理I/O操作，而是交由最擅长此事的操作系统来完成
* 采用追加写入方式，摒弃了缓慢的磁盘随机读写操作
* 使用以sendfile为代表的零拷贝技术加强了网络间的数据传输效率
## Kafka配置文件详解
Kafka中一共有四类配置，分别如下：
1. broker configs：server.properties（主要）
2. zookeeper configs：zookeeper.properties（主要）
3. consumer configs ：consumer.properties（生产者配置文件）
4. producer configs：producer.properties（消费者配置文件）其中broker和zookeeper是主要的配置文件。

### Kafka的配置文件
Kafka的配置文件对应名称为：server.properties，其示例及字段解释如下：
* broker.id=0 # 用唯一的数字进行区分实例，从0开始
* host.name=99.99.99.99 #本机的IP地址
* zookeeper.connect=99.99.99.99:2181,99.99.99.98:2181,99.99.99.97:2181 # Zookeeper的集群地址
* log.dirs=/ssd1/kafka-logs-1,/ssd2/kafka-logs-2,/ssd3/kafka-logs-3 # 数据存放地址
* num.network.threads=24 # broker处理消息的线程数
* num.io.threads=60 # broker处理磁盘IO的线程数
* socket.send.buffer.bytes=102400
* socket.receive.buffer.bytes=102400
* socket.request.max.bytes=104857600
* num.partitions=3 # 创建topic时的默认分区数
* num.recovery.threads.per.data.dir=8
* offsets.topic.replication.factor=3
* transaction.state.log.replication.factor=3
* transaction.state.log.min.isr=3
* log.retention.hours=96 # 日志保留时间为四天
* log.segment.bytes=107374182
* log.retention.check.interval.ms=300000 # 文件大小检查时间周期
* zookeeper.connection.timeout.ms=6000 # zookeeper的心跳时间间隔
* group.initial.rebalance.delay.ms=3
// 新增修改的配置
* auto.create.topics.enable=false   # 不允许自动创建Topic
* auto.leader.rebalance.enable=true   # 允许自动平衡数据
* background.threads=15 # 后台任务的线程数
* delete.topic.enable=true # 允许通过客户端删除topic
* leader.imbalance.check.interval.seconds=300 # 检查leader是否不平衡的时间间隔，5分钟检查一次
* leader.imbalance.per.broker.percentage=10 # leader的不平衡比例，如果超过这个比例，会对分区进行重新平衡
* default.replication.factor=2 # 创建Topic时的默认副本数，表示一份数据，有两份
* controlled.shutdown.enable=true # 优雅的重启，关闭一台机器的时候将leader转移到其他机器

其中对于磁盘容量的规划与以下因素有关：
* 新增消息数
* 消息留存时间
* 平均消息大小
* 副本数
* 是否启动压缩

### ZooKeeper的配置文件
ZooKeeper的配置文件对应名称为：zookeeper.properties，其示例及字段解释如下：
* dataDir=/ssd1/zookeeper # 数据存储目录
* clientPort=2181 # zookeeper 对外服务的接口
* maxClientCnxns=0 # 最大客户端连接数量
* tickTime=2000 # 最小时间单元（毫秒）
* initLimit=10 # 领袖节点同步最新数据的最长时间，10个时间单元
* syncLimit=5 # 心跳机制的时间间隔，5个时间单元
* server.1=99.99.99.99:2888:3888 # 第一个端口是主从同步的通信端口，第二个端口是领袖选举的端口
* server.2=99.99.99.98:2888:3888
* server.3=99.99.99.97:2888:3888

## Kafka命令行操作
本节主要讲解Kafka常用的命令行操作及其示例
Topic的创建、删除与查看
//创建一个副本数为1，分区数为3的Topic，名称为test
* bin/kafka-topics.sh --create --zookeeper 99.99.99.99:2181 --replication-factor 1 --partitions 3 --topic test
// 创建一个副本数为1，分区数为3，日志保留6小时的Topic，名称为test2
* bin/kafka-topics.sh --create --zookeeper 99.99.99.99:2181 --replication-factor 1 --partitions 3 --topic test --config delete.retention.ms=21600000
// 删除Topic
* bin/kafka-topics.sh --delete --zookeeper 99.99.99.99:2181 --topic test
// 查看指定Topic的所有信息
* bin/kafka-topics.sh --describe --zookeeper 99.99.99.99:2181 --topic test 
// 列出所有的Topic 注意Zookeeper后面的IP地址可以写集群里面任一Zookeeper的地址和端口
* bin/kafka-topics.sh --list --zookeeper 99.99.99.99:2181

### 生产者与消费者客户端使用示例
```
# 生产者
bin/kafka-console-producer.sh --broker-list 99.99.99.99:9092 --topic test
# 消费者
bin/kafka-console-consumer.sh --bootstrap-server 99.99.99.99:9092 --topic test --from-beginning
```
这些所有Kafka脚本工具虽然实现了各自不同的功能，但底层都是使用kafka-run-class.sh脚本来实现的
### 列出所有的消费者
bin/kafka-consumer-groups.sh --bootstrap-server 99.99.99.99:9092 --list
### 查看分区里面最新的消息
```
# 注意这里写机器的IP地址和域名都可以,查看指定Topic，指定分区的最新消息。
bin/kafka-console-consumer.sh --bootstrap-server 99.99.99.99:9092 --topic test --offset latest --partition 0
```
### 生产者吞吐量测试
```
bin/kafka-producer-perf-test.sh --num-records 100000 --topic test --producer-props bootstrap.servers=99.99.99.99:9092,99.99.99.98:9092,99.99.99.97:9092 --throughput 5000 --record-size 102400 --print-metrics
```
### 消费者吞吐量测试
```
bin/kafka-consumer-perf-test.sh --topic test --messages 100000 --num-fetch-threads 10 --threads 10 --broker-list 99.99.99.99:9092,99.99.99.98:9092,99.99.99.97:9092 --group perf-consumer-30108
```

## Kafka生产者
消息发送机制,发送消息有以下三种方式：
* 发送并忘记：发送消息，但不关心它是否真正到达
* 同步发送：阻塞发送确保消息到达
* 异步发送：非阻塞发送，不一定确保消息达到，但有重试机制
注:Kafka异步发送消息比同步发送消息要快，一般采用异步发送消息

其中消息发送中的键有两个用途：
* 可以作为消息的附加信息
* 可以用来决定消息该被写入到主题的哪个分区（hash指定），拥有相同键的消息将被写到同一个分区

### 生产者Python代码示例
```
 import time
 import json

 from kafka import KafkaProducer
 
 producer = KafkaProducer(bootstrap_servers=["99.99.99.99:9092","99.99.99.98:9092","99.99.99.97:9092"], retries=5, client_id="1", acks=1)
 
 topic = "test"
 
 for number in range(100):
    time.sleep(1)
    message = "Hello {0}".format(number)
    future = producer.send(topic,  json.dumps(message).encode('utf-8'))
    result = future.get(timeout=10)
    print (result.topic)
    print (result.partition)
    print (result.offset)
```
以上Kafka生产者中，有几个重要参数，说明如下：
* acks参数制定了必须要有多少个分区副本收到消息，生产者才会认为消息写入是成功的
* buffer.memory设置生产者内存缓冲区的大小
* comperssion.type指定消息压缩方式
* retries重试机制
* batch.size每一批次发送消息的大小

## Kafka消费者
### 消费者和消费者群组
Kafka消费者经常会做一些高延迟的操作，比如把数据写到数据库或HDFS，或者使用数据进行比较耗时的计算。在这些情况下，单个消费者无法跟上数据生成的速度，所以可以增加更多的消费者，让它们分担负载，每个消费者只处理部分分区的消息。我们有必要为主题创建大量的分区，在负载增长时可以加入更多的消费者。不过不要让消费者的数量超过主题分区的数量。
![消费者与消费者群](/Kafka/消费者与消费者群.png "消费者与消费者群")

### 提交与偏移量
* 一个消费者关闭或者崩溃则离开消费者群组，原本应该被它读取的消息由其它消费者接收，前提是他们属于同一个消费者群组。
* 分区的所有权从一个消费者转移到另一个消费者称之为<font color ="red">再均衡（rebalance）</font>。这个过程中，消费者群组无法处理消息。
* 分区的所有权通过消费者向broker发送心跳来维持，同时消费者的心跳行为也用来维持和群组的从属关系。如果消费者停止发送心跳的时间足够长，导致会话过期，则群组协调器认为它已经死亡，触发再均衡。
注:Kafka的再均衡机制会导致一定程度的重复消费问题，解决办法是将消费者与分区绑定。
以下详细说明Kafka的再均衡过程
![rebalance](/Kafka/rebalance.png "rebalance")

### 消费者Python代码示例
```
from kafka import KafkaConsumer
import time
topic = "test"
consumer = KafkaConsumer(topic, group_id="consumer1", client_id="2", bootstrap_servers=["99.99.99.99:9092","99.99.99.98:9092","99.99.99.97:9092"])
for message in consumer:
print (message.topic, message.partition, message.offset, message.key, message.value)
```
以上Kafka消费者中，有几个重要参数，说明如下：

* group.id属性，它指定了消费者所属群组的名字
* 消费者根据消费者群组id来唯一区分和隔离
* 如果多个消费者进程属于同一个消费群组（groupid）他们之间不会重复消费数据。

## Kafka Streams
Kafka Streams是Kafka的流式计算的API，Kafka利用这类API可以进行简单的类似于Storm和Flink一样的流式计算处理。流式计算对每一条消息，一共有如下三种处理方式：

* 最多一次（at most once）：消息可能丢失，但不会被重复处理
* 最小一次（at least once）：消息不会丢失，但可能被处理多次
* 精确一次（exactly once）：消息一定会被处理且只会被处理一次

水印（watermark）通常被用在流式处理领域（Storm、Flink等），以表征元素或事件在基于时间层面上的进度。一个比较经典的表述为：流式系统保证水印t时刻，事件时间（event time）= t' 且 t' <= t的所有事件都已经到达或被观测到。

利用Kafka Streams演示word count示例程序
```
# 创建一个文件数据流
echo -e "all streams lead to kafka\nhello kafka streams\njoin kafka summit" > file-input.txt
# 创建一个Topic
bin/kafka-topics.sh --create --zookeeper 99.99.99.99:2181 --replication-factor 1 --partitions 3 --topic streams-file-input
# 启动流式计算的处理程序
bin/kafka-run-class.sh org.apache.kafka.streams.examples.wordcount.WordCountDemo
# 将文件数据流发送到创建的Topic中，此时流式计算会显示各个单词的数目
bin/kafka-console-producer.sh --broker-list 99.99.99.99:9092 --topic streams-file-input < file-input.txt
```

## Kafka Connect
Kafka Connect使Kafka可以和各种数据对接，Kafka Connect与Flume的功能一样
* Source负责导入数据到Kafka
* Sink负责从Kafka导出数据

利用Kafka Connect演示从一个文件导入数据到另一个文件：
```
// 通过配置文件配置数据输入和输出源
/bin/connect-standalone.sh config/connect-standalone.properties config/connect-file-source.properties config/connect-file-sink.properties
```
##  [Kafka集群的监控与运维](https://zhuanlan.zhihu.com/p/92590719)
* Kafka的监控:Kafka-Manager是用Scala语言写的。
* Kafka提供了丰富的JMX指标用于实时监控集群运行的健康程度，Kafka-Manager的监控原理就是通过轮询JMX来实时获取这些指标，然后可视化的显示出整个集群的状态。但是在使用它们时，必须要在启动broker前先设置好JMX端口。如下所示：

//直接在环境变量里面设置
export JMX_PORT=9999