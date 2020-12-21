---
title: 消息队列-RabbitMQ安装与使用
tags: [消息队列,RabbitMQ]
categories: [SpringCloud,Spring]
---
[RabbitMQ：RabbitMQ初体验](https://www.cnblogs.com/everyingo/p/12881577.html)
[微服务之消息总线](https://www.jianshu.com/p/bdddca222c63)
RabbitMQ 七战 Kafka,五胜二负,差异立现！(https://mp.weixin.qq.com/s/c_o5HIsQKVQmC6aiCtU8bg)

延迟队列实现,定时任务,关闭订单(https://mp.weixin.qq.com/s/XtjPANZhbgvDYz06Q41CgQ)
SpringBoot + RabbitMQ (保证消息100%投递成功并被消费)(https://mp.weixin.qq.com/s/de68BUMUQVNPYFWDEM8ChQ)
SpringBoot+RabbitMQ (保证消息100%投递成功并被消费(https://mp.weixin.qq.com/s/G-DbD3F6gbJY_ubXyfg5DA)

## 消息中间件
* 消息(Message)是指在应用间传送的数据。消息可以非常简单,比如：只包含文本字符串,JSON等,也可以很复杂,如内嵌对象。
* 消息队列中间件(Message Queue Middleware,简称为MQ)是指利用高效可靠消息传递机制进行与平台无关的数据交流,并基于数据通信来进行分布式系统的集成。通过提供消息传递和消息排队模型,它可以在分布式环境下扩展进程间的通信。
* 消息队列中间件,也可以称为消息队列或者消息中间件。一般有两种模式：点对点(P2P)模式,发布/订阅(Pub/Sub)模式。点对点模式：基于队列,生产者发送消息到队列,消费者从队列中接受消息,队列的存在使得消息的异步传输称为可能。发布/订阅模式：定义了如何向一个内容节点(主题topic,可认为是消息传递中介)发布和订阅消息,消息发布者将消息发布到某个主题,而消息订阅者则从主题中订阅消息。主题使得消息的订阅者与消息的发布者保持独立,不需要进行接触即可保证消息的传递,发布/订阅模式在消息的一对多广播时采用。
* 目前开源的消息中间件,比较主流的有：RabbitMQ,Kafka,ActiveMQ,RocketMQ等。面向消息的中间件(简称为MOM)提供了松散耦合的灵活方式集成应用程序的一种机制。它们提供了基于存储和转发的应用程序中间的异步数据发送,即应用程序彼此不直接通信,而是与作为中介的消息中间件通信。消息中间件提供了有保证的消息发送。应用程序开发人员无须了解远程过程调用(RPC)和网络通信协议的细节

### 消息中间件的作用
在不同的应用场景下可以展现不同的作用。
* 解耦：在项目启动之初来预测会碰到什么需求是极其困难的。消息中间件在处理过程中间插入了一个隐含的,基于数据的接口层,两边的处理过程都要实现这一接口,这允许你独立地扩展或修改两边的处理过程,只要确保它们遵守同样的皆苦约束即可。
* 削峰：在访问量剧增的情况下,应用仍然需要继续发挥作用,但是这样的突发流量并不常见。如果以能处理这类峰值为标准而投入资源,无疑是巨大的浪费。使用消息中间件能够使关键组件支撑突发访问压力,不会因为突发的超负荷请求而完全崩溃。MQ-client提供拉模式,定时或者批量拉取,可以起到削平流量,下游自我保护的作用(MQ需要做的);要想提升整体吞吐量,需要下游优化,例如批量处理等方式(消息接收方需要做的);如果并发量过高/请求量过高,需要通过MQ的队列来削峰
* 异步通信：在很多时候应用不想也不需要立即处理消息。消息中间件提供了异步处理机制,允许应用把一些消息放入消息中间件中,但并不立即处理它,在之后需要的时候再慢慢处理。
* 冗余(存储)：有些情况下,处理数据的过程会失败。消息中间件可以把数据进行持久化直到它们已经被完全处理,通过这一方式规避了数据丢失风险。在把一个消息从消息中间件中删除之前,需要你的处理系统明确地指出改消息已经被处理完成,从而确保你的数据被安全地保存直到你使用完毕。
* 扩展性：因为消息中间件解耦了应用的处理过程,所以提高消息入队和处理的效率是很容易的,只要另外增加处理过程即可,不需要改变代码,也不需要调节参数。
* 可恢复性：当系统一部分组件失效时,不会影响到整个系统。消息中间件降低了进程间的耦合度,所以即使一个处理消息的进程挂掉,加入消息中间件中的消息仍然可以在系统恢复后进行处理。
* 顺序保证：在大多数使用场景下,数据处理的顺序很重要,大部分消息中间件支持一定程度上的顺序性。
* 缓冲：在任何重要的系统中,都会存在需要不同处理时间元素。消息中间件通过一个缓冲层来帮助任务高效率地执行,写入消息中间件的处理会尽可能快速。该缓冲层有助于控制和优化数据流经过系统的速度。


## RabbitMQ的安装及使用 
### RabbitMQ
RabbitMQ是基于AMQP协议的,通过使用通用协议就可以做到在不同语言之间传递,RabbitMQ时采用Erlang语言实现AMQP的消息中间件,它最初起源于金融系统,用于在分布式系统中存储转发消息。

### RabbitMQ具体特点
* 可靠性：RabbitMQ使用一些机制来保证可靠性,如持久化,传输确认及发布确认等。
* 灵活的路由：在消息进入队列之前,通过交换器来路由消息。对于典型的路由功能,RabbitMQ已经提供了一些内置的交换器来实现。针对更复杂的路由功能,可以将多个交换器绑定在一起,也可以通过插件机制来实现自己的交换器。
* 扩展性：多个RabbitMQ节点可以组成一个集群,也可以根据实际业务情况动态地扩展集群中节点。
* 高可用性：队列可以在集群中的机器上设置镜像,使得在部分节点出现问题的情况下队列仍然可用。
* 多种协议：RabbitMQ除了原生支持AMQP协议,还支持STOMP,MQTT等多种消息中间件协议。
* 多语言客户端：RabbitMQ几乎支持所有常用语言,比如Java,Python,Ruby,PHP,C#,JavaScript等。
* 管理界面：RabbitMQ提供了一易用的用户界面,使得用户可以监控和管理消息,集群中的节点等。
* 插件机制：RabbitMQ提供了许多插件,以实现从多方面扩展,当然也可以编写自己的插件。

### 安装Erlang环境
#### 下载安装Erlang
在安装RabbitMQ之前需要安装Erlang,建议使用较新版本Erlang,这样可以获得较多更新和改进,[点击进入官网下载](https://www.erlang.org/downloads)
```
 [root@instance-5x tar.gz]# tar -zxvf otp_src_20.0.tar.gz -C /usr/local/src
 [root@instance-5x tar.gz]# cd /usr/local/src/otp_src_20.0/
 [root@instance-5x otp_src_20.0]# ./configure --prefix=/usr/local/erlang
 [root@instance-5x otp_src_20.0]# make
 [root@instance-5x otp_src_20.0]# make install
 ```
<font color="red">出现报错信息：No curses library functions found。需要安装ncurses</font>
[root@instance-5x otp_src_20.0]# yum  install  ncurses-devel

#### 配置环境变量
```
 [root@instance-5x otp_src_20.0]# vim /etc/profile
 export ERLANG_HOME=/usr/local/erlang
 PATH=$PATH:$JAVA_HOME/bin:$ERLANG_HOME/bin
 [root@instance-5x otp_src_20.0]# . /etc/profile
```

#### 验证Erlang是否安装成功
```
//输入erl命令来
[root@instance-5x otp_src_20.0]# erl
Erlang/OTP 20 [erts-9.0] [source] [64-bit] [smp:1:1] [ds:1:1:10] [async-threads:10] [hipe] [kernel-poll:false]
Eshell V9.0  (abort with ^G)
```

### RabbitMQ的安装
#### 下载安装RabbitMQ
[RabbitMQ官网下载地址](https://www.rabbitmq.com/releases/rabbitmq-server/)
[root@instance-5x tar.gz]# tar -xvf rabbitmq-server-generic-unix-3.6.10.tar /usr/local/

#### 配置环境变量
```
export RABBITMQ_HOME=/usr/local/rabbitmq_server-3.6.10
PATH=$PATH:$JAVA_HOME/bin:$ERLANG_HOME/bin:$RABBITMQ_HOME/sbin
[root@instance-5x otp_src_20.0]# . /etc/profile
```
#### 运行RabbitMQ服务与验证
[root@instance-5x otp_src_20.0]# rabbitmq-server  -detached
* rabbitmq-server 命令后面添加一个“-detached” 参数是为了能够让RabbitMQ服务以守护进程的方式在后台运行,这样就不会因为当前Shell窗口的关闭而影响服务

#### 验证RabbitMQ是否正常
rabbitmqctl status 命令查看RabbitMQ是否正常启动
* [root@instance-5x tar.gz]# rabbitmqctl  status


### Java配置RabbitMQ及其使用
#### maven依赖
```
<dependency>
     <groupId>com.rabbitmq</groupId>
     <artifactId>amqp-client</artifactId>
     <version>4.2.1</version>
</dependency>
```
#### 设置账户
默认情况下,访问RabbitMQ服务的用户名和密码都是“guest”,这个账户有限制,默认只能通过本地网络(如 localhost)访问,远程网络访问受限,所以在实现生产和消费消息之前,需要另外添加一个用户,并设置相应的访问权限。
添加新用户,用户名为“root”,密码为“root123”
```
[root@instance-5x tar.gz]# rabbitmqctl add_user root root123
[root@instance-5x tar.gz]# rabbitmqctl setpermissions -p / root ".*" ".*" ".*"
[root@instance-5x tar.gz]# rabbitmqctl set_user_tags root administrator
```

#### 连接RabbitMQ工具类代码：
```
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import java.io.IOException;
import java.util.concurrent.TimeoutException;

public class ConnectionUtil {

    private static ConnectionFactory factory;

    static {
        factory = new ConnectionFactory();
        factory.setHost("a.x.y.z");
        factory.setPort(5672);
        factory.setUsername("username");
        factory.setPassword("password");

    }

    public static Connection getConnection() throws IOException, TimeoutException {
        return factory.newConnection();
    }
}
```

#### Productor(生产者代码)
```
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.MessageProperties;
import java.io.IOException;
import java.util.concurrent.TimeoutException;

public class RabbitMqProducer {
    private static String EXCHANGE_NAME = "exchage_demo";
    private static String QUEUE_NAME = "queue_demo";
    private static String ROUTING_KEY = "routingkey_demo";

    public static void main(String[] args) throws IOException, TimeoutException {
        Connection connection = ConnectionUtil.getConnection();
        Channel channel = connection.createChannel();
        //创建一个type="direct",持久化,非自动删除得交换机
        channel.exchangeDeclare(EXCHANGE_NAME, "direct", true, false, null);
        //创建一个持久化,非排他的,非自动删除队列
        channel.queueDeclare(QUEUE_NAME, true, false, false, null);
        //将交换机与队列通过路由键(其实是绑定键,只不过direct类型下绑定键(bindingkey)和路由键(routingkey)一致才可以到达)绑定
        channel.queueBind(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);
        //发送一条持久化的消息
        String message = "hello world d!";
        channel.basicPublish(EXCHANGE_NAME, ROUTING_KEY, MessageProperties.PERSISTENT_TEXT_PLAIN, message.getBytes());
        //关闭资源
        channel.close();
        connection.close();

        System.out.println("finished...");

    }
}
```

#### Consumer(消费者)
```
import com.rabbitmq.client.*;
import java.io.IOException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class RabbitMqConsumer {

    private static String QUEUE_NAME = "queue_demo";

    public static void main(String[] args) throws IOException, TimeoutException, InterruptedException {

        //创建连接
        Connection connection = ConnectionUtil.getConnection();

        //创建信道
        final Channel channel = connection.createChannel();

        //设置客户端最多接受未被ack的消息个数
        channel.basicQos(64);

        Consumer consumer = new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                super.handleDelivery(consumerTag, envelope, properties, body);

                System.out.println("recv message:" + new String(body));

                try {
                    TimeUnit.SECONDS.sleep(1);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                channel.basicAck(envelope.getDeliveryTag(), false);
            }
        };

        channel.basicConsume(QUEUE_NAME, consumer);
        //等待回调资源执行完毕后关掉资源
        TimeUnit.SECONDS.sleep(5);

        //关闭资源
        channel.close();
        connection.close();

        System.out.println("finished...");
    }
}
```
#### direct类型
```
import com.mine.rabbitmq.rabbitmqbegin.util.ConnectionUtil;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.QueueingConsumer;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

public class ExchangeDirectConsumer {

    public static void main(String[] args) throws IOException, TimeoutException, InterruptedException {

        Connection connection = ConnectionUtil.getConnection();

        Channel channel = connection.createChannel();

        String exchange = "exchange_direct_test001";
        String exchange_type = "direct";
        String queue = "queue_test_001";
        String routing_key = "routing_test001";

        channel.exchangeDeclare(exchange, exchange_type, true, false, false, null);

        channel.queueDeclare(queue, false, false, false, null);

        channel.queueBind(queue, exchange, routing_key);

        QueueingConsumer consumer = new QueueingConsumer(channel);

        channel.basicConsume(queue, true, consumer);

        while (true) {
            QueueingConsumer.Delivery delivery = consumer.nextDelivery();

            String msg = new String(delivery.getBody());

            System.out.println("收到消息：" + msg);
        }
    }
}

```

#### topic类型
```
import com.mine.rabbitmq.rabbitmqbegin.util.ConnectionUtil;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.QueueingConsumer;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

public class ExchangeTopicConsumer {

    public static void main(String[] args) throws IOException, TimeoutException, InterruptedException {
        Connection connection = ConnectionUtil.getConnection();

        Channel channel = connection.createChannel();

        String exchange = "exchange_topic_test002";

        String exchange_type = "topic";

        String queue = "queue_topic_test002";

        //切换的时候需要注意解绑
        //String routing_key = "routing_topic.#";

        String routing_key = "routing_topic.*";

        channel.exchangeDeclare(exchange, exchange_type, true, false, false, null);

        channel.queueDeclare(queue, false, false, false, null);

        channel.queueBind(queue, exchange, routing_key);

        QueueingConsumer consumer = new QueueingConsumer(channel);

        channel.basicConsume(queue, true, consumer);

        while (true) {
            QueueingConsumer.Delivery delivery = consumer.nextDelivery();

            String msg = new String(delivery.getBody());

            System.out.println("收到消息：" + msg);
        }

    }
}
```

#### fanout类型
```
import com.mine.rabbitmq.rabbitmqbegin.util.ConnectionUtil;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.QueueingConsumer;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

public class ExchangeFanoutConsumer {

    public static void main(String[] args) throws IOException, InterruptedException, TimeoutException {
        Connection connection = ConnectionUtil.getConnection();

        Channel channel = connection.createChannel();

        String exchange = "exchange_fanout_test003";

        String exchange_type = "fanout";

        String queue = "queue_fanout_test003";

        channel.exchangeDeclare(exchange, exchange_type, true, false, false, null);

        channel.queueDeclare(queue, false, false, false, null);

        channel.queueBind(queue, exchange, "");

        QueueingConsumer consumer = new QueueingConsumer(channel);

        channel.basicConsume(queue, true, consumer);

        while (true) {
            QueueingConsumer.Delivery delivery = consumer.nextDelivery();

            String msg = new String(delivery.getBody());

            System.out.println("收到消息：" + msg);
        }
    }
}
```

#### 默认交换机情况
```
import com.mine.rabbitmq.rabbitmqbegin.util.ConnectionUtil;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.QueueingConsumer;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.TimeoutException;

public class Consumer {

    public static void main(String[] args) throws IOException, TimeoutException, InterruptedException {
        Connection connection = ConnectionUtil.getConnection();

        Channel channel = connection.createChannel();

        String queue = "queue_default";

        //没有声明绑定指定交换机,则选择默认交换机,当向默认交换机(direct类型)发送消息routingKey等于队列名称时,消息可以路由到当先队列
        channel.queueDeclare(queue, true, false, false, null);

        QueueingConsumer consumer = new QueueingConsumer(channel);

        channel.basicConsume(queue, true, consumer);

        while (true) {
            QueueingConsumer.Delivery delivery = consumer.nextDelivery();
            String msg = new String(delivery.getBody());
            System.out.println("收到消息：" + msg);

            Map<String, Object> headers = delivery.getProperties().getHeaders();

            System.out.println("headers get my1 value:" + headers.get("my1"));
        }
    }
}


import com.mine.rabbitmq.rabbitmqbegin.util.ConnectionUtil;
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;

public class Producer {

    public static void main(String[] args) throws IOException, TimeoutException {
        Connection connection = ConnectionUtil.getConnection();

        Channel channel = connection.createChannel();

        String queue = "queue_default";

        Map<String, Object> headers = new HashMap<>();
        headers.put("my1", "val1");
        headers.put("my2", "val2");
        AMQP.BasicProperties properties = new AMQP.BasicProperties.Builder()
                .deliveryMode(2)
                .contentEncoding("utf-8")
                .expiration("10000")
                .headers(headers)
                .build();

        String msg = "message info";

        //默认交换机(direct类型,routingKey和队列名称相同即可路由到)
        channel.basicPublish("", queue, properties, msg.getBytes());

        //记得要关闭相关的连接
        channel.close();
        connection.close();
    }
}
```

#### 使用交换器和队列
##### exchangeDeclare方法详解
```
 Exchange.DeclareOk exchangeDeclare(String exchange, String type,boolean durable,boolean autoDelete,boolean internal,Map<String, Object> arguments) throws IOException;
```
这个方法的返回值是Exchange.DeclareOK,用来标识成功声明了一个交换器。各个参数详细说明如下：
* exchange：交换器的名称。
* type：交换器的类型,常见的如fanout,direct,topic等。
* durable：设置是否持久化。durable设置true表示持久化,反之是非持久化。持久化可以将交换机存盘,在服务器重启的时候不会丢失相关信息。
* autoDelete：设置是否自动删除。autoDelete设置true则表示自动删除。自动删除的前提是至少有一个队列或者交换器与这个交换器绑定,之后所有与这个交换器绑定的队列或者交换器都与此解绑。注意不能错误地把这个参数 理解为：“当与此交换器连接的客户端都断开时,RabbitMQ会自动删除本交换器”。
* internal：设置是否时内置的。如果设置为true,则表示是内置的交换器,客户端程序无法直接发送消息到这和交换器中,只能通过交换器路由到交换器这种方式。
* arguments：其他一些结构化参数,比如alternate-exchange等。

##### queueDeclare方法详解
```
 Queue.DeclareOk queueDeclare(String queue, boolean durable, boolean exclusive, boolean autoDelete, Map<String, Object> arguments) throws IOException;
```
* queue：队列的名称。
* durable：设置是否持久化。为true则设置队列为持久化。持久化的队列会存盘,在服务器重启的时候可以保证不丢失相关信息。
* exclusive：设置是否排他。为true则设置队列为排他的,如果一个队列被声明为排他队列,该队列仅对首次声明它的连接可见,并在连接断开时自动删除。
这里需要注意三点：
1. 排他队列是基于连接(Connection)可见的,同一个连接的不同信道(Channel)是可以同时访问同一连接创建的排他队列；
2. “首次”是指如果一个连接已经声明了一个排他队列,其他连接是不允许建立同名的排他队列,这个与普通队列不同；
3. 即使该队列是持久化的,一旦连接关闭或者客户端退出,该排他队列都会被自动删除,这种队列适用于一个客户端同时发送和读取消息的应用场景。
* autoDelete：设置是否自动删除。为true则设置队列为自动删除。自动删除的前提是：至少有一个消费者连接到这个队列,之后所有与这个队列连接的消费者都断开时,才会自动删除。不能把这个参数错误地理解为：“当连接到此队列的所有客户端断开时,这个队列自动删除”,因为生产者客户端创建这个队列,或者没有消费者客户端与这个队列连接时,都不会自动删除这个队列。
* arguments：设置队列的其他一些参数,如x-message-ttl,x-expires,x-max-leanth,x-max-length-bytes,x-dead-letter-ecchange,x-dead-letter-routing-key,x-max-priority等。

##### queueBind方法详解
```
 Queue.BindOk queueBind(String queue, String exchange, String routingKey, Map<String, Object> arguments) throws IOException;
```
* queue：队列名称。
* exchange：交换器的名称。
* routingKey：用来绑定队列和交换器的路由键。
* arguments：定义绑定的一些参数。
不仅可以将队列和交换器绑定起来,也可以将已经被绑定的队列和交换器进行解绑。具体方法如下：
```
Queue.UnbindOk queueUnbind(String queue, String exchange, String routingKey, Map<String, Object> arguments) throws IOException;
```

##### exchangeBind方法详解
不仅可以将交换器与队列绑定,也可以将交换器与交换器绑定：
```
Exchange.BindOk exchangeBind(String destination, String source, String routingKey, Map<String, Object> arguments) throws IOException;
```
绑定之后,消息从source交换器转发到destination交换器,某种程度上来说destination交换器可以看作一个队列。


#### Productor端发送消息接口
```
void basicPublish(String exchange, String routingKey, boolean mandatory, boolean immediate, BasicProperties props, byte[] body)throws IOException;
```
* exchange：交换器的名称,指明消息需要发送到哪个交换器中。如果设置为空字符串,则消息会被发送到RabbitMQ默认的交换器中。
* routingKey：路由键,交换器根据路由键将消息存储到相应的队列之中。
* body：消息体(payload),真正需要发送的消息。
* mandatory：当mandatory参数设置为true时,交换器无法根据自身的类型和路由键找到一个符合条件的队列,那么RabbitMQ会调用Basic.Return命令将消息返回给生产者。当mandatory参数设置为false时,出现上述情形,则消息直接被丢弃。(mandatory参数告诉服务器至少将消息路由到一个队列中,否则将消息返回给生产者。)
* immediate：immediate参数设置为true时,如果交换器在将消息路由到队列时发现队列上并不存在任何消费者,那么这条消息将不会存入队列中。当与路由键匹配的所有队列都没有消费者时,该消息会通过Basic.Return返回至生产者。(immediate参数告诉服务器,如果该消息关联的队列上有消费者,则立刻投递；如果所有匹配的队列上都没有消费者,则直接将消息返还给生产者,不用将消息存入队列而等待消费者了。)
* props：消息的基本属性集
```
    private String contentType;
    private String contentEncoding;
    private Map<String,Object> headers;
    private Integer deliveryMode;
    private Integer priority;
    private String correlationId;
    private String replyTo;
    private String expiration;
    private String messageId;
    private Date timestamp;
    private String type;
    private String userId;
    private String appId;
    private String clusterId;
```

#### MQ端设置
##### mandatory参数/immediate参数/备份交换器
* mandatory参数
1. 当mandatory参数设置为true时,交换器无法根据自身的类型和路由键找到一个符合条件的队列,那么RabbitMQ会调用Basic.Return命令将消息返回给生产者。
2. 当mandatory参数设置为false时,出现上述情形,则消息直接被丢弃。(mandatory参数告诉服务器至少将消息路由到一个队列中,否则将消息返回给生产者。)
那么生产者如何获取到没有被正确路由到合适队列的消息呢？这时候可以通过调用channel.addReturnListener来添加ReturnListener监视器实现。
示例代码：
```
import com.mine.rabbitmq.rabbitmqbegin.util.ConnectionUtil;
import com.rabbitmq.client.*;
import java.io.IOException;
import java.util.concurrent.TimeoutException;

public class Producer {

    public static void main(String[] args) throws IOException, TimeoutException {
        Connection connection = ConnectionUtil.getConnection();
        Channel channel = connection.createChannel();
        String exchange = "exchange_test_return";
        String routing_key = "return.save";
        String routing_key_error = "abc.save";

        channel.addReturnListener(new ReturnListener() {
            @Override
            public void handleReturn(int replyCode, String replyText, String exchange, String routingKey, AMQP.BasicProperties properties, byte[] body) throws IOException {
                System.out.println("---------handle  return----------");
                System.out.println("replyCode: " + replyCode);
                System.out.println("replyText: " + replyText);
                System.out.println("exchange: " + exchange);
                System.out.println("routingKey: " + routingKey);
                System.out.println("properties: " + properties);
                System.out.println("body: " + new String(body));
            }
        });

        //发送一条消息
        String msg = "message info return";
        String msg_error = "message info error return";

        //交换器无法根据自身的类型和路由键找到一个符合条件的队列 mandatory设置为true,消息才会返回给生产者,否则直接丢弃。
        channel.basicPublish(exchange, routing_key, true,null, msg.getBytes());
        channel.basicPublish(exchange, routing_key_error, true,null, msg_error.getBytes());


        //记得要关闭相关的连接
        //channel.close();
        //connection.close();
    }
}

import com.mine.rabbitmq.rabbitmqbegin.util.ConnectionUtil;
import com.rabbitmq.client.*;
import java.io.IOException;
import java.util.concurrent.TimeoutException;

public class Consumer {

    public static void main(String[] args) throws IOException, TimeoutException, InterruptedException {
        Connection connection = ConnectionUtil.getConnection();
        Channel channel = connection.createChannel();
        String exchange = "exchange_test_return";
        String queue = "queue_test_return";
        String routing_key = "return.#";

        channel.exchangeDeclare(exchange, "topic", false, false, false, null);
        channel.queueDeclare(queue, true, false, false, null);
        channel.queueBind(queue, exchange, routing_key);

        com.rabbitmq.client.Consumer consumer = new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                super.handleDelivery(consumerTag, envelope, properties, body);
                System.out.println("消费端:" + new String(body));
            }
        };
        
        channel.basicConsume(queue, true, consumer);
    }
}
```

2. immediate：immediate参数设置为true时,如果交换器在将消息路由到队列时发现队列上并不存在任何消费者,那么这条消息将不会存入队列中。当与路由键匹配的所有队列都没有消费者时,该消息会通过Basic.Return返回至生产者。(immediate参数告诉服务器,如果该消息关联的队列上有消费者,则立刻投递；如果所有匹配的队列上都没有消费者,则直接将消息返还给生产者,不用将消息存入队列而等待消费者了。)
RabbitM

3. 备份交换器,英文名称为 Alternate Exchange,简称AE,或者更直白地称之为“备胎交换器”。生产者在发送消息的时候如果不设置 mandatory参数,那么消息在未被路由的情况下将会丢失;如果设置了 mandatory参数,那么需要添加 Returnlistener的编程逻辑,生产者的代码将变得复杂。如果既不想复杂化生产者的编程逻辑,又不想消息丢失,那么可以使用备份交换器,这样可以将未被路由的消息存储在 RabbitMQ中,再在需要的时候去处理这些消息。可以通过在声明交换器(调用 channe1. exchange Declare方法)的时候添加alternate- exchange参数来实现,也可以通过策略( Policy)的方式实现。如果两者同时使用,则前者的优先级更高,会覆盖掉 Policy的设置
```
  Map<string,Object> args=new HashMap<string,Object>();
  args.put("alternate-exchange","myAe");
  channel.exchangeDeclare("normalExchange",direct", true, false, args);
  channel.exchangeDeclare("myAe","fanout", true, false, null);
  channel.queueDeclare("normalQueue", true, false, false, null);
  channel.queueBind("normal Queue","normalExchange","normalKey");
  channel.queueDeclare("unroutedQueue", true, false, false, null);
  channel.queueBind("unroutedQueue","myAe","");
```

![备份交换器](/rabbitMq/备份交换器.png "备份交换器")
对于备份交换器,总结了以下几种特殊情况:
* 如果设置的备份交换器不存在,客户端和 RabbitMQ服务端都不会有异常出现,此时消息会丢失。
* 如果备份交换器没有绑定仼何队列,客户端和 RabbitMQ服务端都不会有异常出现,此时消息会丢失。
* 如果备份交换器没有任何匹配的队列,客户端和 RabbitMQ服务端都不会有异常出现,此时消息会丢失。
* 如果备份交换器和 mandatory参数一起使用,那么 mandatory参数无效。

##### 消费端限流
* channel设置Qos的值
假设一个场景,首先,我们 RabbitMQ服务器有上万条未处理的消息,我们随便打开一个消费者客户端,会出现下面情况：巨量的消息瞬间全部推送过来,但是我们单个客户端无法同时处理这么多数据!
RabbitMQ提供了一种qos(服务质量保证)功能,即在非自动确认消息的前提下,如果一定数目的消息(通过基于 consume或者 channel设置Qos的值)未被确认前,不进行消费新的消息。
```
 void basicQos(int prefetchCount) throws IOException;
```
* prefetchCount：prefetch Count:会告诉 RabbitMQ不要同时给一个消费者推送多于N个消息,即一旦有N个消息还没有ack,则该 consumer将 block掉,直到有消息ack。
```
        String exchangeName = "test_qos_exchange";
		String queueName = "test_qos_queue";
		String routingKey = "qos.#";
		
		channel.exchangeDeclare(exchangeName, "topic", true, false, null);
		channel.queueDeclare(queueName, true, false, false, null);
		channel.queueBind(queueName, exchangeName, routingKey);
		
		//1 限流方式  第一件事就是 autoAck设置为 false
		
		channel.basicQos(0, 1, false);
		Boolean autoAck=false;
		channel.basicConsume(queueName, autoAck, new MyConsumer(channel));
```

* 弃用QueueingConsumer
QueueingConsumer本身有几个大缺陷,需要在使用时特别注意。首当其冲的就是内存溢出的问题,如果由于某些原因,队列之中堆积了比较多的消息,就可能导致消费者客户端内存溢出假死,于是发生恶性循环,队列消息不断堆积而得不到消化。
QueueingConsumer还包含(但不仅限于)以下一些缺陷:

QueueingConsumer会拖累同一个 Connection下的所有信道,使其性能降低。
同步递归调用 QueueingConsumer会产生死锁。
RabbitMQ的自动连接恢复机制(automatic connection recovery)不支持 QueueingConsumer的这种形式。
QueueingConsumer不是事件驱动的。

##### 设置消息的TTL


#### Consumer端消费消息接口
RabbitMQ的消费模式分为两种：推(Push)模式和拉(Pull)模式。推模式采用Basic.Consume进行消费,而拉模式则是调用Basic.Get进行消费
##### 推模式
接受消息一般通过实现Consumer接口或者继承DefaultConsumer类来实现。当调用与Consumer相关的API方法时,不同的订阅采用不同的消费者标签(consumerTag)来区分彼此,在同一个Channel中的消费者也需要通过唯一的消费者标签以作区分：
```
Consumer consumer = new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                super.handleDelivery(consumerTag, envelope, properties, body);

                System.out.println("recv message:" + new String(body));

                try {
                    TimeUnit.SECONDS.sleep(1);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                channel.basicAck(envelope.getDeliveryTag(), false);
            }
        };
        boolean autoAck = false;
        channel.basicConsume(QUEUE_NAME, autoAck, "myConsumer", consumer);
```

channel.basicConsume方法详解：
```
String basicConsume(String queue, boolean autoAck, String consumerTag, boolean noLocal, boolean exclusive, Map<String, Object> arguments, Consumer callback) throws IOException;
```
* queue：队列名称；
* autoAck：设置是否自动确认。建议设置成false,即不自动确认。
* consumerTag：消费者标签,用来区分多个消费者。
* noLocal：设置为true则表示不能将同一个Connection中生产者发送的消息传送给这个Connection中的消费者。
* exclusive：设置是否排他。
* arguments：设置消费者的其他参数。
* callback：设置消费者的回调函数。用来处理RabbitMQ推送过来的消息,比如DefaultConsumer,使用时需要客户端重写(override)其中的方法。
和生产者一样,消费者客户端同样需要考虑线程安全问题。消费者客户端的这些callback会被分配到与Channel不同的线程池上,这意味着消费者客户端可以安全地调用这些阻塞方法,比如channel.queueDeclare,channel.basicCancel等。每个channel都拥有自己独立的线程。最常用的做法是一个Channel对应一个消费者,也就是意味着消费者都彼此之间没有任何关联。当然也可以在一个Channel中维持多个消费者,但是需要注意一个问题,如果Chanel中的一个消费者一直在运行,那么其他消费者的callback会被”耽搁“

##### 拉模式
通过channel.basicGet方法可以单条地获取消息,其返回值是GetRespone。
```
GetResponse basicGet(String queue, boolean autoAck) throws IOException;
```
Basic.Consume将信道(Channel)置为接收模式,直到取消队列的订阅为止.在接收模式期间,RabbitMQ会不断的推送消息给消费者,消息数量受Basic.Qos限制.如果只想从队列获取单条消息而不是持续订阅,建议还是使用Basic.get进行消费。但是不能将Basic.Get放在一个循环里代替Basic.Consume,这样会严重影响RabbitMQ的性能.如果实现高吞吐量,消费者理使用Basic.Consume方法

## 如何确保消息不丢失
### Productor端:生产确认
在使用RabbitMQ的时候,可以通过消息持久化操作来解决因为服务器的异常崩溃而导致的消息丢失,除此之外,还会遇到一个问题,当消息的生产者将消息发送出去之后,消息到底有没有正确地到达服务器呢？如果不进行特殊配置,默认情况下发送消息的操作是不会返回任何信息给生产者的,也就是默认情况下生产者是不知道消息有没有正确地到服务器。如果在消息到达服务器之前已经丢失,持久化操作也解决不了这个问题。
* RabbitMQ针对这个问题,提供了两种解决方式：
* 同步方式:通过事务机制实现。
* 异步方式:通过发送方确认(publisher confirm)机制实现。

#### 事务机制
RabbitMQ客户端中与事务机制相关的方法有三个：
* channel.txSelect：用于将当前信道设置成事务模式。
* channel.txRollback：用于提交事务。
* channel.txRollback：用于事务回滚。

开启事务机制与不开启相比多了四个步骤：
* 客户端发送Tx.Select,将信道设置为事务模式。
* Broker回复Tx.Select-Ok,确认已将信道设置为事务模式。
* 在发送完消息之后,客户端发送Tx.COmmit提交事务。
* Broker回复Tx-Commit-Ok,确认事务提交。
```
    try {
        channel.txSelect();
        channel.basicPublish("exchange_name", "routing_key", null, "msg info".getBytes());
        int result = 1 / 0;
        channel.txCommit();
    } catch (Exception e) {
        e.printStackTrace();
        channel.txRollback();
    }
```
事务确实能够解决消息发送方和RabbitMQ之间消息确认的问题,只有消息成功被RabbitMQ接收,事务才能提交成功,否则便可以在捕获异常之后进行事务回滚,与此同时可以进行消息重发。当时使用事务机制会“吸干”RabbitMQ的性能。

#### 发送方确认机制
生产者将信道设置成confirm(确认)模式,一旦信道进入confirm模式,所有在该信道上面发布的消息都会被指派一个唯一的ID(从1开始),一旦消息被投递到所有匹配的队列之后。RabbitMQ就会发送一个确认(Basic.Ack)给生产者(包含消息的唯一ID),这就使得生产者知晓消息已经正确到达了目的地了。如果消息和队列是可持久化的,那么确认消息会在消息写入磁盘之后发出。RabbitMQ回传给生产者的确认消息中的deliveryTag包含了确认消息的序号,此外RabbitMQ也可以设置channel.basicAck方法中的multiple参数,表示到这个序号之前的所有消息都已经得到了处理。
发送方确认机制最大的好处在于它是异步的,相比事务机制在一条消息发送之后会使发送端阻塞。

如何实现Confirm确认消息：
* 在channel上开启确认模式：channel.confirmSelect()。
* 在channel上添加监听：addConfirmListener,监听成功和失败的返回结果,根据具体的结果对消息进行重新发送,或记录日志等后续处理。

生产端代码示例：
```
import com.mine.rabbitmq.rabbitmqbegin.util.ConnectionUtil;
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.ConfirmListener;
import com.rabbitmq.client.Connection;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;

public class Producer {

    public static void main(String[] args) throws IOException, TimeoutException {
        Connection connection = ConnectionUtil.getConnection();

        Channel channel = connection.createChannel();
        String exchange = "exchange_test_confirm";
        String routing_key = "confirm.save";

        //指定我们的消息投递模式: 消息的确认模式
        channel.confirmSelect();

        //发送一条消息
        String msg = "message info confirm";
        channel.basicPublish(exchange, routing_key, null, msg.getBytes());

        //添加一个确认监听
        channel.addConfirmListener(new ConfirmListener() {
            @Override
            public void handleAck(long deliveryTag, boolean multiple) throws IOException {
                System.out.println("-----------------ack-------------------");
                System.out.println("deliveryTag:" + deliveryTag);
                System.out.println("multiple:" + multiple);

            }

        //handleNack(no ack)出现情况有：磁盘写满,队列到达上限等
            @Override
            public void handleNack(long deliveryTag, boolean multiple) throws IOException {
                System.out.println("-----------------no ack-------------------");
                System.out.println("deliveryTag:" + deliveryTag);
                System.out.println("multiple:" + multiple);
            }
        });

        //记得要关闭相关的连接
        //channel.close();
        //connection.close();
    }
}
```

消费端代码示例：
```
import com.mine.rabbitmq.rabbitmqbegin.util.ConnectionUtil;
import com.rabbitmq.client.*;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class Consumer {

    public static void main(String[] args) throws IOException, TimeoutException, InterruptedException {
        Connection connection = ConnectionUtil.getConnection();

        Channel channel = connection.createChannel();

        String exchange = "exchange_test_confirm";

        String queue = "queue_test_confirm";

        String routing_key = "confirm.#";


        channel.exchangeDeclare(exchange, "topic", false, false, false, null);

        channel.queueDeclare(queue, true, false, false, null);

        channel.queueBind(queue, exchange, routing_key);

        com.rabbitmq.client.Consumer consumer = new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                super.handleDelivery(consumerTag, envelope, properties, body);

                System.out.println("消费端:" + new String(body));
            }
        };
        
        channel.basicConsume(queue, true, consumer);
    }
}
```

### MQ端设置(持久化)
* 交换器的持久化与队列持久化
交换器的持久化是通过声明队列时,将durable参数设置为true实现的。如果交换器不设置持久化,那么rabbitmq服务重启之后,相关的交换器元数据(代表交换机的结构数据)将会丢失,不过消息不会丢失,只是不能将消息发送到这个交换器中了,建议将交换器设置为持久化
```
queueDeclare(queue, durable, exclusive, autoDelete,  arguments)
channel.queueDeclare(q_name, true, false, false, map);
```
元数据： 表示数据的数据,例如数据的类型,长度,存放位置等关于数据的信息用来管理和维护数据；例如：书的文本就是书的数据,而书名、作者、版权数据都是书的元数据。元数据并不一定就是用来检索的,也可用于内部的管理,如图书馆系统可以为书定义被借次数这个元数据,以了解书的被借阅情况,确定是否要增加副本数。元数据的使用,可以大大提高系统的检索和管理的效率
* 消息的持久化
队列的持久化只能保证其队列本身的元数据不会被丢失,但是不能保证消息不会被丢失。所以消息本身也需要被持久化,可以在投递消息前设置AMQP.BasicProperties的属性deliveryMode为2即可：
```
AMQP.BasicProperties low = new AMQP.BasicProperties.Builder().deliveryMode(2).build();
```
设置了队列和消息的持久化,当 RabbitS服务重启之后,消息依旧存在。单单只设置队列持久化,重启之后消息会丢失;单单只设置消息的持久化,重启之后队列消失,继而消息也丢失。单单设置消息持久化而不设置队列的持久化显得毫无意义。
### Consumer端:消费确认与拒绝
为了保证消息从队列可靠地达到消费者,RabbitMQ提供了消息确认机制(message acknowledgment)。消费者在订阅队列时,可以指定autoAck参数,
* 当autoAck等于false时,RabbitMQ会等待消费者显示地回复确认信号后才从内存(或者磁盘)中移去消息(实质上是先打上删除标记,之后再删除)。
* 当autoAck等于true时,RabbitMQ会自动把发送出去的消息设置为确认,然后从内存(或者磁盘)中删除,而不管消费者是否真正地消费到了这些消息。

采用消息确认机制后,只有设置autoAck参数为false,消费者 就有足够的时间处理消息(任务),不用担心处理消息过程中消费者进程挂掉后消息丢失的问题,因为RabbitMQ会一直等待持有消息直到消费者显示调用Basic.Ack命令为止。当autoAck参数置为false,对于RabbitMQ服务器而言,队列中的消息分为两个部分：一部分时等待投递给消费者的消息；一部分时已经投递给消费者,但是还没有收到消费者确认信号的消息。如果RabbitMQ一直没有收到消费者的确认信号,并且消费此消息的消费者已经断开连接,则RabbitMQ 会安排该消息重新进入队列,等待投递给下一个消费者,当然也有可能还是原来的那个消费者。RabbitMQ不会为未确认的消息设置过期时间,它判断此消息是否需要重新投递给消费者的唯一依据是消费该消息的消费者连接是否已经断开,这么设计的原因是RabbitMQ允许消费者消费一条消息的时间可以很久很久。

<font color="red">在消费者接收到消息后,如果想明确拒绝当前的消息而不是确认,那么应该怎么做呢？RabbitMQ在2.0.0版本开始引入了Basic.Reject这个命令,消费者客户端可以调用与其对应的channel.basicReject方法来告诉RabbitMQ拒绝这个消息</font>
```
void basicReject(long deliveryTag, boolean requeue) throws IOException;
```

* deliveryTag：可以看作消息的编号,它是一个64位的长整型值。
* requeue：设置为true时,RabbitMQ会重新将这条消息存入队列,以便可以发送给下一个订阅的消费者；如果设置为false,则RabbitMQ会立即把消息从队列中移除,而不会把它发送给新的消费者。
<font color="blue">Basic.Reject命令一次只能拒绝一条消息,如果想要批量拒绝消息,则可以使用Basic.Nack这个命令</font>






### 过期时间
#### 设置消息的TTL(过期时间)
设置消息TTL的两种方法：
* 通过队列属性设置,队列中所有消息都有相同的过期时间。
* 对消息本身进行单独设置,每条消息的TTL可以不同。

如果两种方法一起使用,则消息的TTL以两者之间较小的那个数值为准。
消息在队列中的生存时间一旦超时设置的TTL值时,就会变成“死信”(Dead Message),消息者将无法再收到该消息(不绝对,可通过配置“死信”交换器路由到相应的队列)

* 队列属性设置
通过队列属性设置消息TTL的方法是在channel.queueDeclare方法中加入x-message-ttl参数实现的,单位是毫秒
```
    Map<String, Object> arguments = new HashMap<>();
    //设置队列消息过期时间为6s
    arguments.put("x-message-ttl", 6000);
    channel.queueDeclare("queue_name", true, false, false, arguments);
```

* 消息单独设置
针对每条消息设置TTL的方法是再channel.basicPublish方法中加入expiration的属性参数,单位是毫秒
```
AMQP.BasicProperties properties = new AMQP.BasicProperties.Builder().deliveryMode(2).contentEncoding("utf-8").expiration("10000").headers(headers).build();
String msg = "message info";
channel.basicPublish("exchange_name", "queue_name", properties, msg.getBytes());
```
对于第一种设置队列TTL属性的方法,一旦消息过期,就会从队列中抹去,而在第二种方法中,即使消息过期,也不会马上从队列中抹去,因为每条消息是否过期是在即将投递到消费者之前判断的。

* 为什么这两种方法处理的方式不一样？
第一种方法里,队列中已过期的消息肯定在队列头部,RabbitMQ只要定期从队头开始扫描是否有过期的消息即可。
第二种方法里,每条消息的过期时间不同,如果要删除所有过期消息势必要扫描整个队列,所以不如等到此消息即将被消费时再判定是否过期,如果过期再进行删除即可。

#### 设置队列的TTL(过期时间)
通过channel.queueDeclare方法中的x-expires参数可以控制队列被自动删除前处于未使用状态的时间。未使用的意思是队列上没有任何的消费者,队列也没有被重新声明,并且在过期时间段内也未调用过Basic.Get命令。
RabbitMQ会确保在过期时间到达后将队列删除,但是不保障删除的动作有多及时。在RabbitMQ重启后,持久化的队列的过期时间会被重新计算。
```
    Map<String, Object> arguments = new HashMap<>();
    //创建一个过期时间为1分钟的队列(表示如果1分钟之内未使用则会被删除)
    arguments.put("x-expires", 60000);
    channel.queueDeclare("queue_name", true, false, false, arguments);
```

### 死信队列
DLX,全称为Dead-Letter-Exchange,可以称为死信交换器,当消息在一个队列中变成死信(dead message)之后,它能被重新发送到另一个交换器中,这个交换器就是DLX,绑定DLX的队列就称为死信队列。
消息变成死信一般是由于这几种情况：

* 消息被拒绝(Basic.Reject/Basic.Nack),并且设置requeue参数为false。
* 消息过期。
* 队列达到最大长度。
DLX也是一个正常的交换器,和一般交换器没有区别,它能在任何的队列上被指定,实际上就是设置某个队列的属性。当这个队列中存在死信时,RabbitMQ就会自动地将这个消息重新发布到设置的DLX上去,进而被路由到另一个队列,即死信队列。可以监听这个队列中的消息以进行相应的处理,这个特性与将消息的TTL设置为0配合使用可以弥补immediate参数的功能。
通过channel.queueDeclare方法中设置x-dead-letter-exchange参数来为这个队列添加DLX：
```
 //创建DLX：dlx_exchange
        channel.exchangeDeclare("dlx_exchange", "direct");

        Map<String, Object> arguments = new HashMap<>();
        //为队列添加DLX
        arguments.put("x-dead-letter-exchange", "dlx_exchange");
        //也可以为这个DLX指定路由键，如果没有特殊指定，则使用原队列的路由键
        arguments.put("x-dead-letter-routing-key", "dlx-routing-key");

        channel.queueDeclare("queue_name", false, false, false, arguments);
```
```
public class Send {
    final static String NOREMAL_EXCHANGE = "normal_exchange";
    final static String NOREMAL_QUEUE= "normal_queue";
    final static String DLX_EXCHANGE= "dlx_exchange";
    final static String DLX_QUEUE= "dlx_queue";

    public static void main(String[] args) {
        Connection connection = null;
        Channel channel;
        try {
            connection = ConnectionUtils.getConnection();
            channel = connection.createChannel();

            //正常交换器
            channel.exchangeDeclare(NOREMAL_EXCHANGE, BuiltinExchangeType.DIRECT, true);
            //创建死信交换器
            channel.exchangeDeclare(DLX_EXCHANGE, BuiltinExchangeType.DIRECT, true);

            //设置正常队列参数，添加死信队列
            Map<String, Object> arguments = new HashMap<>();
            //队列消息过期时间
            arguments.put("x-message-ttl", 1000);
            //设置死信队列
            arguments.put("x-dead-letter-exchange", DLX_EXCHANGE);
            //设置DLX路由键，不设置，则使用原队列的路由键
            arguments.put("x-dead-letter-routing-key", DLX_QUEUE);
            channel.queueDeclare(NOREMAL_QUEUE, true, false, false, arguments);
            channel.queueBind(NOREMAL_QUEUE, NOREMAL_EXCHANGE, NOREMAL_QUEUE);

            channel.queueDeclare(DLX_QUEUE, true, false, false, null);
            channel.queueBind(DLX_QUEUE,DLX_EXCHANGE,DLX_QUEUE);

            channel.basicPublish(NOREMAL_EXCHANGE, NOREMAL_QUEUE, MessageProperties.PERSISTENT_TEXT_PLAIN, "死信队列".getBytes("utf-8"));
        } catch (IOException e) {
            e.printStackTrace();
        } catch (TimeoutException e) {
            e.printStackTrace();
        } finally {
            if (connection != null) {
                try {
                    connection.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```

### 延迟队列
延迟队列存储的对象是对应的延迟消息，所谓“延迟消息”是指当消息被发送以后，并不想让消费者立刻拿到消息，而是等待特定时间后，消费者才能拿到这个消息进行消费。
RabbitMQ本身没有直接支持延迟队列的功能，但是可以通过DLX(死信队列)和TTL(过期时间)模拟出延迟队列的功能。
![延迟队列](/rabbitMq/延迟队列.png "延迟队列")

### 优先级队列
具有高优先级的队列具有高的优先权，优先级高的消息具备优先被消费的特权。
可以通过设置队列的x-max-priority参数来实现：
```
    Map<String, Object> arguments = new HashMap<>();
    arguments.put("x-max-priority", 10);
    channel.queueDeclare("queue_name", false, false, false, arguments);
```
上面代码配置一个队列的最大优先级。在此之后，需要在发送消息中设置消息当前的优先级。
```
    AMQP.BasicProperties properties = new AMQP.BasicProperties.Builder().priority(5).build();
    String msg = "message info";
    channel.basicPublish("exchange_name", "queue_name", properties, msg.getBytes());
```
上面的代码中设置消息的优先级为5.默认最低为0，最高为队列设置的最大优先级。优先级高的消息可以被优先消费，这个这个也是有前提的：如果在消费者的消费速度大于生产者的速度且Broker中没有消息堆积的情况下，对发送的消息设置优先级也就没有上面实际意义。