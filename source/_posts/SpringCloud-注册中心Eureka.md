---
title: 注册中心-Eureka基础知识
tags: [Eureka,注册中心,面试知识]
categories: [SpringCloud]
---
## Eurka工作原理流程
![Eureka原理图](/img/Eureka原理图.png "Eureka原理图")
Eureka Server：提供服务注册和发现,多个Eureka Server之间会同步数据,做到状态一致（最终一致性）
Service Provider：服务提供方,将自身服务注册到Eureka,从而使服务消费方能够找到
Service Consumer：服务消费方,从Eureka获取注册服务列表,从而能够消费服务; Eureka Server 节点都宕掉,服务消费者依然可以使用缓存中的信息找到服务提供者,但是当服务有更改的时候会出现信息不一致。
　　本篇文章讲了 Eureka 核心概念、Eureka 自我保护机制和 Eureka 集群原理。通过分析 Eureka 工作原理,通过一些列的机制,完美地解决了注册中心的稳定性和高可用性。Eureka 为了保障注册中心的高可用性,容忍了数据的非强一致性,服务节点间的数据可能不一致, Client-Server 间的数据可能不一致。比较适合跨越多机房、对注册中心服务可用性要求较高的使用场景。
## Eureka比ZooKeeper比较
## CAP理论
CAP定义:一致性(Consistency)、可用性(Availability)、分区容错性(Partition tolerance)
CAP原则又称CAP定理,指的是在一个分布式系统中,这三个要素最多只能同时实现两点,不可能三者兼顾。
### Zookeeper
Zookeeper保证CP 当向注册中心查询服务列表时,我们可以容忍注册中心返回的是几分钟以前的注册信息,但不能接受服务直接down掉不可用。也就是说,服务注册功能对可用性的要求要高于一致性。<font color='red'>但是zk会出现这样一种情况,当master节点因为网络故障与其他节点失去联系时,剩余节点会重新进行leader选举。问题在于,选举leader的时间太长,30 ~ 120s, 且选举期间整个zk集群都是不可用的,这就导致在选举期间注册服务瘫痪。(这就是失去可用性(Availability))</font>在云部署的环境下,因网络问题使得zk集群失去master节点是较大概率会发生的事,虽然服务能够最终恢复,但是漫长的选举时间导致的注册长期不可用是不能容忍的。
### Eureka
Eureka保证AP Eureka看明白了这一点,因此在设计时就优先保证可用性。Eureka各个节点都是平等的,几个节点挂掉不会影响正常节点的工作,剩余的节点依然可以提供注册和查询服务。而Eureka的客户端在向某个Eureka注册或时如果发现连接失败,则会自动切换至其它节点,只要有一台Eureka还在,就能保证注册服务可用(保证可用性),只不过查到的信息可能不是最新的(不保证强一致性)。除此之外,Eureka还有一种自我保护机制,如果在15分钟内超过85%的节点都没有正常的心跳,那么Eureka就认为客户端与注册中心出现了网络故障,进入自我保护模式

### 自我保护护模
#### 问题
在默认配置中EurekaServer服务在一定时间（默认为90秒）没接受到某个服务的心跳连接后,EurekaServer会注销该服务。但是会存在当网络分区发生故障,导致该时间内没有心跳连接,但该服务本身还是健康运行的情况。Eureka通过“自我保护模式”来解决这个问题。

#### 解决方法
EurekaServer在运行期间会去统计心跳,如果在15分钟内超过85%的节点都没有正常的心跳,会将这些实例保护起来,让这些实例不会过期,但是在保护期内如果服务刚好这个服务提供者非正常下线了,此时服务消费者就会拿到一个无效的服务实例,此时会调用失败,对于这个问题需要服务消费者端要有一些容错机制,如重试,断路器等。
* Eureka 不再从注册列表中移除因为长时间没收到心跳而应该过期的服务
* Eureka 仍然能够接受新服务的注册和查询请求,但是不会被同步到其它节点上(即保证当前节点依然可用)
* 当网络稳定时,当前实例新的注册信息会被同步到其它节点中

### Eureka不足的地方： 
1.Eureka consumer本身有缓存,服务状态更新滞后,最常见的状况就是,服务下线了但是服务消费者还未及时感知,此时调用到已下线服务会导致请求失败,只能依靠consumer端的做容错机制来保证。如重试,断路器等

## Eureka集群原理
![Eureka集群原理](/img/Eureka集群原理.png "Eureka集群原理")
　　看看Eureka集群的工作原理。我们假设有三台 Eureka Server 组成的集群,第一台 Eureka Server 在北京机房,另外两台 Eureka Server 在深圳和西安机房。这样三台 Eureka Server 就组建成了一个跨区域的高可用集群,只要三个地方的任意一个机房不出现问题,都不会影响整个架构的稳定性。
　　从图中可以看出 Eureka Server 集群相互之间通过 Replicate 来同步数据,相互之间不区分主节点和从节点,所有的节点都是平等的。在这种架构中,节点通过彼此互相注册来提高可用性,每个节点需要添加一个或多个有效的 serviceUrl 指向其他节点。如果某台 Eureka Server 宕机,Eureka Client 的请求会自动切换到新的 Eureka Server 节点。当宕机的服务器重新恢复后,Eureka 会再次将其纳入到服务器集群管理之中。当节点开始接受客户端请求时,所有的操作都会进行节点间复制,将请求复制到其它 Eureka Server 当前所知的所有节点中。
　　另外 Eureka Server 的同步遵循着一个非常简单的原则：只要有一条边将节点连接,就可以进行信息传播与同步。所以,如果存在多个节点,只需要将节点之间两两连接起来形成通路,那么其它注册中心都可以共享信息。每个 Eureka Server 同时也是 Eureka Client,多个 Eureka Server 之间通过 P2P 的方式完成服务注册表的同步。
　　Eureka Server 集群之间的状态是采用异步方式同步的,所以不保证节点间的状态一定是一致的,不过基本能保证最终状态是一致的。
　　注:在Eureka高可用架构中，Eureka Server也可以作为Client向其他server注册，多节点相互注册组成Eureka集群，集群间相互视为peer。Eureka Client向Server注册、续约、更新状态时，接受节点更新自己的服务注册信息后，逐个同步至其他peer节点。
　　Piont to Point(P2P):如果server-A向server-B节点单向注册，则server-A视server-B为peer节点，server-A接受的数据会同步给server-B，但server-B接受的数据不会同步给server-A。
### Eureka分区
Eureka 提供了 Region 和 Zone 两个概念来进行分区,这两个概念均来自于亚马逊的 AWS:
region：可以理解为地理上的不同区域,比如亚洲地区,中国区或者深圳等等。没有具体大小的限制。根据项目具体的情况,可以自行合理划分 region。
zone：可以简单理解为 region 内的具体机房,比如说 region 划分为深圳,然后深圳有两个机房,就可以在此 region 之下划分出 zone1、zone2 两个 zone。
上图中的 us-east-1c、us-east-1d、us-east-1e 就代表了不同的 Zone。Zone 内的 Eureka Client 优先和 Zone 内的 Eureka Server 进行心跳同步,同样调用端优先在 Zone 内的 Eureka Server 获取服务列表,当 Zone 内的 Eureka Server 挂掉之后,才会从别的 Zone 中获取信息。

### Eureka保证AP
　Eureka Server 各个节点都是平等的,几个节点挂掉不会影响正常节点的工作,剩余的节点依然可以提供注册和查询服务。而 Eureka Client 在向某个 Eureka 注册时,如果发现连接失败,则会自动切换至其它节点。只要有一台 Eureka Server 还在,就能保证注册服务可用(保证可用性),只不过查到的信息可能不是最新的(不保证强一致性)。

## [Eureka缓存机制](https://www.cnblogs.com/yixinjishu/p/10871243.html)
![Eureka缓存机制](/img/Eureka缓存机制.png "Eureka缓存机制")

### Eureka Server缓存机制
Eureka Server存在三个变量：(registry、readWriteCacheMap、readOnlyCacheMap)保存服务注册信息，默认情况下定时任务每30s将readWriteCacheMap同步至readOnlyCacheMap，每60s清理超过90s未续约的节点，Eureka Client每30s从readOnlyCacheMap更新服务注册信息，而UI则从registry更新服务注册信息

|      缓存           | 类型                      |  说明                           |
| -----------------   | -----------------------  | --------------------------------|
| registry            | ConcurrentHashMap        |实时更新，类AbstractInstanceRegistry成员变量，UI端请求的是这里的服务注册信息|
| readWriteCacheMap   | Guava Cache/LoadingCache |   实时更新，类ResponseCacheImpl成员变量，缓存时间180秒    |
| readOnlyCacheMap    | ConcurrentHashMap        |   周期更新，类ResponseCacheImpl成员变量，默认每30s从readWriteCacheMap更新，Eureka client默认从这里更新服务注册信息，可配置直接从readWriteCacheMap更新    |

#### 缓存相关配置

| 配置                                             | 默认 | 说明 |
| ----------------------------------------------- | ------| ------ |
| eureka.server.useReadOnlyResponseCache          | true  | Client从readOnlyCacheMap更新数据，false则跳过readOnlyCacheMap直接从readWriteCacheMap更新 |
| eureka.server.responsecCacheUpdateIntervalMs    | 30000 | readWriteCacheMap更新至readOnlyCacheMap周期，默认30s |
| eureka.server.evictionIntervalTimerInMs         | 60000 | 清理未续约节点(evict)周期，默认60s |
| eureka.instance.leaseExpirationDurationInSeconds| 90    | 清理未续约节点超时时间，默认90s |

#### 关键类

| 类名                                                 | 说明                                                 | 
| ---------------------------------------------------- | --------------------------------------------------- | 
| com.netflix.eureka.registry.AbstractInstanceRegistry | 保存服务注册信息，持有registry和responseCache成员变量 |
| com.netflix.eureka.registry.ResponseCacheImpl        | 持有readWriteCacheMap和readOnlyCacheMap成员变量      |

### Eureka Client缓存机制
Eureka Client存在两种角色：服务提供者和服务消费者，作为服务消费者一般配合Ribbon或Feign（Feign内部使用Ribbon）使用。Eureka Client启动后，作为服务提供者立即向Server注册，默认情况下每30s续约(renew)；作为服务消费者立即向Server全量更新服务注册信息，默认情况下每30s增量更新服务注册信息；Ribbon延时1s向Client获取使用的服务注册信息，默认每30s更新使用的服务注册信息，只保存状态为UP的服务。
#### 二级缓存

|缓存	          |类型	              |说明                               |
|----------------|-------------------|-----------------------------------|
|localRegionApps |AtomicReference    |周期更新，类DiscoveryClient成员变量，Eureka Client保存服务注册信息，启动后立即向Server全量更新，默认每30s增量更新
|upServerListZoneMap|ConcurrentHashMap|周期更新，类LoadBalancerStats成员变量，Ribbon保存使用且状态为UP的服务注册信息，启动后延时1s向Client更新，默认每30s更新

#### 缓存相关配置

|配置	|默认	|说明|
|---------------------------------------------|------|----------|
|eureka.instance.leaseRenewalIntervalInSeconds|	30 |Eureka Client 续约周期，默认30s|
|eureka.client.registryFetchIntervalSeconds   |	30 |Eureka Client 增量更新周期，默认30s(正常情况下增量更新，超时或与Server端不一致等情况则全量更新)|
|ribbon.ServerListRefreshInterval             |	30000 |Ribbon 更新周期，默认30s|

#### 关键类

|类名	|说明|
|---------------------------------------------------|---------------------|
|com.netflix.discovery.DiscoveryClient              |Eureka Client 负责注册、续约和更新，方法initScheduledTasks()分别初始化续约和更新定时任务|
|com.netflix.loadbalancer.PollingServerListUpdater	|Ribbon 更新使用的服务注册信息，start初始化更新定时任务|
|com.netflix.loadbalancer.LoadBalancerStats	|Ribbon，保存使用且状态为UP的服务注册信息|

#### 默认配置下服务消费者(Eureka Client)最长感知时间
![Eureka缓存时间](/img/Eureka缓存时间.png "Eureka缓存时间")
![Eureka最大缓存时间](/img/Eureka最大缓存时间.png "Eureka最大缓存时间")
考虑如下情况
0s时服务未通知Eureka Client直接下线；
29s时第一次过期检查evict未超过90s；
89s时第二次过期检查evict未超过90s；
149s时第三次过期检查evict未续约时间超过了90s，故将该服务实例从registry和readWriteCacheMap中删除；
179s时定时任务从readWriteCacheMap更新至readOnlyCacheMap;
209s时Eureka Client从Eureka Server的readOnlyCacheMap更新；
239s时Ribbon从Eureka Client更新。
因此，极限情况下服务消费者最长感知时间将无限趋近240s。

