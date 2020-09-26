---
title: 注册中心-Dubbo
tags: [Dubbo,注册中心]
categories: [SpringCloud]
---

[SpringCloud与Dubbo对比](https://www.cnblogs.com/rmxd/p/11531989.html)
[dubbo和zookeeper的关系](https://www.cnblogs.com/iisme/p/10620125.html)
## Dubbo分布式服务框架特点
* Dubbo缺省协议:采用基于单一长连接和netty框架Reactor模型NIO异步通信，适合于小数据量大并发的服务调用，以及服务消费者机器数远大于服务提供者机器数的情况
### Dubbo框架3大功能
* Dubbo:是一个RPC框架,高性能和透明化的RPC远程服务调用方案,同时也是SOA框架,SOA服务治理方案
#### 作为RPC
支持各种传输协议,如dubbo,hession,json,fastjson,底层采用mina,netty长连接进行传输!典型的provider和cusomer模式
#### 作为SOA
具有服务治理功能,提供服务的注册和发现!用zookeeper实现注册中心!启动时候服务端会把所有接口注册到注册中心,并且订阅configurators,服务消费端订阅provide，configurators,routers,订阅变更时,zk会推送providers,configuators，routers,启动时注册长连接,进行通讯!proveider和provider启动后,后台启动定时器,发送统计数据到monitor(监控中心)提供各种容错机制和负载均衡策略

注:
* netty:一个基于nio的客户、服务器端编程框架,netty提供异步的,事件驱动的网络应用程序框架和工具,可以快速开发高可用的客户端和服务器
* 长连接与短连接：长连接：client方与server方先建立连接，连接建立后不断开，然后再进行报文发送和接收。这种方式下由于通讯连接一直存在。此种方式常用于P2P通信。短连接：Client方与server每进行一次报文收发交易时才进行通讯连接，交易完毕后立即断开连接。此方式常用于一点对多点通讯

## Dubbo架构图
![dubbo基本原理图](/img/dubbo基本原理图.png "dubbo基本原理图")
1.Consumer服务消费者，Provider服务提供者。Container服务容器。消费当然是invoke提供者了，invoke这条实线按照图上的说明当然同步的意思了，多说一句，在实际调用过程中，Provider的位置对于Consumer来说是透明的，上一次调用服务的位置(IP地址)和下一次调用服务的位置，是不确定的。这个地方就是实现了软负载
2.服务提供者先启动start，然后注册register服务
3.消费订阅subscribe服务，如果没有订阅到自己想获得的服务，它会不断的尝试订阅。新的服务注册到注册中心以后，注册中心会将这些服务通过notify到消费者
4.Monitor这是一个监控，图中虚线表明Consumer 和Provider通过异步的方式发送消息至Monitor，Consumer和Provider会将信息存放在本地磁盘，平均1min会发送一次信息。Monitor在整个架构中是可选的(图中的虚线并不是可选的意思)，Monitor功能需要单独配置，不配置或者配置以后，Monitor挂掉并不会影响服务的调用

## Dubbo远程调用架构
下面我们用一个精简的图来说明最重要的两种Invoker：服务提供Invoker和服务消费Invoker
![dubbo远程调用简图](/img/dubbo远程调用简图.png "dubbo远程调用简图")

### Dubbo远程调用源代码基本原理(7步):
1.client一个线程调用远程接口，生成一个唯一的ID（比如一段随机字符串，UUID等），Dubbo是使用AtomicLong从0开始累计数字的
2.将打包的方法调用信息（如调用的接口名称，方法名称，参数值列表等），和处理结果的回调对象callback，全部封装在一起，组成一个对象object
3.向专门存放调用信息的全局ConcurrentHashMap里面put(ID, object)
4.将ID和打包的方法调用信息封装成一对象connRequest，使用IoSession.write(connRequest)异步发送出去
5.当前线程再使用callback的get()方法试图获取远程返回的结果，在get()内部，则使用synchronized获取回调对象callback的锁， 再先检测是否已经获取到结果，如果没有，然后调用callback的wait()方法，释放callback上的锁，让当前线程处于等待状态。
6.服务端接收到请求并处理后，将结果（此结果中包含了前面的ID，即回传）发送给客户端，客户端socket连接上专门监听消息的线程收到消息，分析结果，取到ID，再从前面的ConcurrentHashMap里面get(ID)，从而找到callback，将方法调用结果设置到callback对象里。
7.监听线程接着使用synchronized获取回调对象callback的锁（因为前面调用过wait()，那个线程已释放callback的锁了），再notifyAll()，唤醒前面处于等待状态的线程继续执行（callback的get()方法继续执行就能拿到调用结果了），至此，整个过程结束

## Dubbo原理细节
### 初始化过程细节
上图中的第一步start，就是将服务装载容器中，然后准备注册服务。和Spring中启动过程类似，spring启动时，将bean装载进容器中的时候，首先要解析bean。所以dubbo也是先读配置文件解析服务。 
### 解析服务
* 基于dubbo.jar内的Meta-inf/spring.handlers配置，spring在遇到dubbo名称空间时，会回调DubboNamespaceHandler类。 
* 所有的dubbo标签，都统一用DubboBeanDefinitionParser进行解析，基于一对一属性映射，将XML标签解析为Bean对象。 
在ServiceConfig.export 或者ReferenceConfig.get 初始化时，将Bean对象转会为url格式，将所以Bean属性转成url的参数。 
然后将URL传给Protocol扩展点，基于扩展点的Adaptive机制，根据URL的协议头，进行不同协议的服务暴露和引用。

#### 只暴露服务端口
在没有使用注册中心的情况，这种情况一般适用在开发环境下，服务的调用这和提供在同一个IP上，只需要打开服务的端口即可。 
即，当配置 or ServiceConfig解析出的URL的格式为:Dubbo：//service-host/com.xxx.TxxService?version=1.0.0 
基于扩展点的Adaptiver机制，通过URL的“dubbo：//”协议头识别，直接调用DubboProtocol的export（）方法，打开服务端口。

#### 向注册中心暴露服务：
和上一种的区别：需要将服务的IP和端口一同暴露给注册中心。 
ServiceConfig解析出的url格式为:registry://registry-host/com.alibaba.dubbo.registry.RegistryService?export=URL.encode(“dubbo://service-host/com.xxx.TxxService?version=1.0.0”)
基于扩展点的Adaptive机制，通过URL的“registry://”协议头识别，调用RegistryProtocol的export方法，将export参数中的提供者URL先注册到注册中心，再重新传给Protocol扩展点进行暴露： Dubbo：//service-host/com.xxx.TxxService?version=1.0.0

## 服务暴露和消费的详细过程
### 服务提供者暴露一个服务的详细过程
服务提供者暴露服务的主过程：
![服务提供者暴露服务的主过程](/img/dubbo服务提供者暴露服务的主过程.png)
首先ServiceConfig类拿到对外提供服务的实际类ref(如：HelloWorldImpl),然后通过ProxyFactory类的getInvoker方法使用ref生成一个AbstractProxyInvoker实例,到这一步就完成具体服务到Invoker的转化。接下来就是Invoker转换到Exporter的过程。
Dubbo处理服务暴露的关键就在Invoker转换到Exporter的过程(如上图中的红色部分)，下面我们以Dubbo和RMI这两种典型协议的实现来进行说明：
Dubbo的实现：Dubbo协议的Invoker转为Exporter发生在DubboProtocol类的export方法，它主要是打开socket侦听服务，并接收客户端发来的各种请求，通讯细节由Dubbo自己实现。
RMI的实现：
RMI协议的Invoker转为Exporter发生在RmiProtocol类的export方法,它通过Spring或Dubbo或JDK来实现RMI服务，通讯细节这一块由JDK底层来实现，这就省了不少工作量。

### 服务消费者消费一个服务的详细过程
服务消费的主过程
![dubbo服务消费的主过程](/img/dubbo服务消费的主过程.png "dubbo服务消费的主过程")

首先ReferenceConfig类的init方法调用Protocol的refer方法生成Invoker实例(如上图中的红色部分)，这是服务消费的关键。
接下来把Invoker转换为客户端需要的接口(如：HelloWorld)。

## 面试问题
### 问题1
1.当前线程怎么让它“暂停”，等结果回来后，再向后执行?

答:首先生成一个对象obj，在一个全局map里put(ID,obj)存放起来，再用synchronized获取obj锁，再调用obj.wait()让当前线程处于等待状态，然后另一消息监听线程等到服 务端结果来了后，再map.get(ID)找到obj，再用synchronized获取obj锁，再调用obj.notifyAll()唤醒前面处于等待状态的线程。

### 问题2
2.正如前面所说，Socket通信是一个全双工的方式，如果有多个线程同时进行远程方法调用，这时建立在client server之间的socket连接上会有很多双方发送的消息传递，前后顺序也可能是乱七八糟的，server处理完结果后，将结果消息发送给client，client收到很多消息，怎么知道哪个消息结果是原先哪个线程调用的?

答:使用一个ID，让其唯一，然后传递给服务端，再服务端又回传回来，这样就知道结果是原先哪个线程的了。



