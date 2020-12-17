---
title: 消息队列-RabbitMQ
tags: [消息队列,RabbitMQ]
categories: [SpringCloud,Spring]
---

[微服务之消息总线](https://www.jianshu.com/p/bdddca222c63)
RabbitMQ 七战 Kafka，五胜二负，差异立现！(https://mp.weixin.qq.com/s/c_o5HIsQKVQmC6aiCtU8bg)

延迟队列实现，定时任务，关闭订单(https://mp.weixin.qq.com/s/XtjPANZhbgvDYz06Q41CgQ)

SpringBoot + RabbitMQ （保证消息100%投递成功并被消费）(https://mp.weixin.qq.com/s/de68BUMUQVNPYFWDEM8ChQ)

SpringBoot+RabbitMQ （保证消息100%投递成功并被消费(https://mp.weixin.qq.com/s/G-DbD3F6gbJY_ubXyfg5DA)

## RabbitMQ
RabbitMQ是基于AMQP协议的，通过使用通用协议就可以做到在不同语言之间传递
### 消息中间件作用:
1.削峰:
  * MQ-client提供拉模式，定时或者批量拉取，可以起到削平流量，下游自我保护的作用（MQ需要做的）
  * 要想提升整体吞吐量，需要下游优化，例如批量处理等方式（消息接收方需要做的）
  * 如果并发量过高/请求量过高,需要通过MQ的队列来削峰
2.解耦:传统架构模式下,由服务主动推送消息,服务一旦增多,调用关系变得复杂.消息中间件可以有效解耦
3.异步:生产者主要推送至MQ,再由消费者监听消费

### AMQP协议
* server：又称broker，接受客户端连接，实现AMQP实体服务。
* connection：连接和具体broker网络连接。
* channel：网络信道，几乎所有操作都在channel中进行，channel是消息读写的通道。客户端可以建立多个channel，每个channel表示一个会话任务。
* message：消息，服务器和应用程序之间传递的数据，由properties和body组成。properties可以对消息进行修饰，比如消息的优先级，延迟等高级特性；body是消息实体内容。
* Virtual host：虚拟主机，用于逻辑隔离，最上层消息的路由。一个Virtual host可以若干个Exchange和Queue，同一个Virtual host不能有同名的Exchange或Queue。
* Exchange：交换机，接受消息，根据路由键转发消息到绑定的队列上。
* banding：Exchange和Queue之间的虚拟连接，binding中可以包括routing key
* routing key：一个路由规则，虚拟机根据他来确定如何路由 一条消息。
* Queue：消息队列，用来存放消息的队列






