
---
title: MySql优化1
tags: [Mysql,面试知识,Mysql优化,生产问题]
categories: [Database]
---
## Insert into select语句锁表
### 初始化建表
* 订单表

```
CREATE TABLE `order_today` (
  `id` varchar(32) NOT NULL COMMENT '主键',
  `merchant_id` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '商户编号',
  `amount` decimal(15,2) NOT NULL COMMENT '订单金额',
  `pay_success_time` datetime NOT NULL COMMENT '支付成功时间',
  `order_status` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '支付状态  S：支付成功、F：订单支付失败',
  `remark` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '备注',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间 -- 修改时自动更新',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_merchant_id` (`merchant_id`) USING BTREE COMMENT '商户编号'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

* 订单记录表
```
CREATE TABLE order_record like order_today;
```
### 模拟生产环境
![今日订单表数据](/sql/今日订单表数据.png "今日订单表数据")

把8号之前的数据都迁移到order_record表中去。
```
INSERT INTO order_record SELECT
    * 
FROM
    order_today 
WHERE
    pay_success_time < '2020-03-08 00:00:00';
```
在navicat中运行迁移的sql,同时开另个一个窗口插入数据，模拟下单。
![sql1](/sql/sql1.png "sql1")
![sql2](/sql/sql2.png "sql2")
![sql3](/sql/sql3.png "sql3")

从上面可以发现一开始能正常插入，但是后面突然就卡住了，并且耗费了23s才成功，然后才能继续插入。这个时候已经迁移成功了，所以能正常插入了。

### 分析原因
在默认的事务隔离级别下：insert into order_record select * from order_today 加锁规则是：order_record表锁，order_today逐步锁（扫描一个锁一个）。
分析执行过程。
![sql4](/sql/sql4.png "sql4")
通过观察迁移sql的执行情况你会发现order_today是全表扫描，也就意味着在执行insert into select from 语句时，mysql会从上到下扫描order_today内的记录并且加锁，这样一来不就和直接锁表是一样了。

这也就可以解释，为什么一开始只有少量用户出现支付失败，后续大量用户出现支付失败，初始化订单失败等情况，因为一开始只锁定了少部分数据，没有被锁定的数据还是可以正常被修改为正常状态。由于锁定的数据越来越多，就导致出现了大量支付失败。最后全部锁住，导致无法插入订单，而出现初始化订单失败。
* 解决方案
由于查询条件会导致order_today全表扫描，什么能避免全表扫描呢，很简单嘛，给pay_success_time字段添加一个idx_pay_suc_time索引就可以了，由于走索引查询，就不会出现扫描全表的情况而锁表了，只会锁定符合条件的记录。

```
INSERT INTO order_record SELECT
    * 
FROM
    order_today FORCE INDEX (idx_pay_suc_time)
WHERE
    pay_success_time <= '2020-03-08 00:00:00';
```
![sql5](/sql/sql5.png "sql5")

### 总结
使用insert into tablA select * from tableB语句时，一定要确保tableB后面的where，order或者其他条件，都需要有对应的索引，来避免出现tableB全部记录被锁定的情况

## 深入分析总结
### 前提
insert into ... select 由于SELECT表引起的死锁情况分析
说法一：在RR隔离级别下 INSERT SELECT 会对 SELECT 表中符合条件的数据加上 LOCK_S 锁。
说法二：（主键自增锁模式应该为0或1）

情景一：insert into table1 ...select * from table2：table1锁表，table2逐步锁（扫描一个锁一个）
情景二：insert into table1 ...select * from table2 order by 主键：table1锁表，table2逐步锁（扫描一个锁一个）
情景三：insert into table1 ...select * from table2 order by 非主键：table1锁表，table2一开始就锁全表

insert into ... select容易造成死锁的原因，后面的select语句对后表会逐步加s锁，前面的insert数量不一定，导致锁住另一个表整表auto-inc锁。 锁越多越容易出现死锁问题

### 模拟下面两个并发事务:
![sql6](/sql/sql6.png "sql6")

#### 场景一
TX1：执行update将表b主键id=2999的记录加上LOCK_X
TX2：执行insert...select语句b表上的记录(996,997,998,999,2995,2996,2997,2998,2999)会申请加上LOCK_S, 但是id=2999已经加上LOCK_X,显然不能获得只能等待.
TX1：执行update需要获得表b主键id=999的LOCK_X显然这个记录已经被TX2加锁LOCK_S，只能等待，触发死锁检测

如下图红色记录为不能获得锁的记录:
![sql7](/sql/sql7.png "sql7")

#### 场景二
这种情况比较极端只能在高并发上出现
TX1：执行update将表b主键id=2999的记录加上LOCK_X
TX2：执行insert...select语句b表上的记录(996,997,998,999,2995,2996,2997,2998,2999)会申请加上LOCK_S，因为上锁是有一个逐步加锁的过程,假设此时加锁到2997前那么TX2并不会等待
TX1：执行update需要获得表b主键id=999的LOCK_X显然这个记录已经被TX2加锁LOCK_S，只能等待
TX2：继续加锁LOCK_S 2997、2998、2999 发现2999已经被TX1加锁LOCK_X，只能等待，触发死锁检测

如下图红色记录为不能获得锁的记录:
![sql8](/sql/sql8.png "sql8")