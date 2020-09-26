---
title: Mysql基础知识1
tags: [Mysql,面试知识]
categories: [Database]
---

## 数据库事务四大特性
* 原子性(Atomicity):一个事务执行过程中包含的各操作要么都成功,要么都不成功
* 隔离性(Isolation):一个事务的执行不能其它事务干扰;即一个事务内部的操作及使用的数据对其它并发事务是隔离的,并发执行的各个事务之间不能互相干扰
* 一致性(Durability):事务执行的结果必须是使数据库从一个一致性状态变到另一个一致性状态;因此当数据库只包含成功事务提交的结果时,就说数据库处于一致性状态;如果数据库系统运行中发生故障,有些事务尚未完成就被迫中断,这些未完成事务对数据库所做的修改有一部分已写入物理数据库,这时数据库就处于一种不正确的状态,或者说是不一致的状态
* 持久性(Consistency):指一个事务一旦提交,它对数据库中的数据的改变就应该是永久性的;接下来的其它操作或故障不应该对其执行结果有任何影响

## 数据库事务传播机制
### 事务传播机制(7种)
#### REQUIRED
    @Transactional(propagation=Propagation.REQUIRED)
    如果外层调用方法,本身有事务,那就加入该事务,没有就新建一个事务

#### REQUIRES_NEW
    @Transactional(propagation=Propagation.REQUIRES_NEW)
    不管是否存在事务,都创建一个新的事务,原来的挂起,新的执行完毕,继续执行老的事务

#### SUPPORTS
    @Transactional(propagation=Propagation.SUPPORTS)
    如果外层调用方法存在事务,则加入该事务;如果外层调用方法没有事务,则以非事务运行

#### NOT_SUPPORTED
    @Transactional(propagation=Propagation.NOT_SUPPORTED)
    以非事务运行,如果外层调用方法存在事务,则事务就挂起;

#### MANDATORY
    @Transactional(propagation=Propagation.MANDATORY)
    必须以事务运行执行,否则抛出异常

#### NEVER
    @Transactional(propagation=Propagation.NEVER)
    不支持事务,如果存在事务,则抛出异常(与Propagation.MANDATORY相反)

#### NESTED
    @Transactional(propagation=Propagation.NESTED)
    如果当前存在事务,则在嵌套事务内执行,类似数据库事务保存点;如果当前没有事务,则执行与PROPAGATION_REQUIRED类似的操作;

### 传播机制嵌套事务回滚(3种)情况
假设一个在事A方法,A方法内部套着一个存在事务B方法
#### A/B方法在同一个类
    同一类内的调用,方法存在事务存在问题
    
#### A/B方法不在同一个类影响(如下3种)
    不同类内的方法事务调用存在问题:关键分析被调用事务使用与主动调用方式

##### REQUIRED
    外层调用方法和内层调用方法,有异常一起回滚,没问题一起提交

##### REQUIRES_NEW
    两个事务相互独立,互不干扰:外层的异常不会干扰内层,内层的异常不会干扰外层

##### NESTED
    外层异常可以干扰内存回滚,内层异常不会干扰外层

## 事务隔离级别(4种)
### 隔离级别解决的问题
| 隔离级别|脏读|不可重复读|幻读|
|-------|-------|-------|------|
|Read Uncommitted|YES|YES|YES|
|Read Committed|NO|YES|YES|
|Repeatable Read|NO|NO|YES|
|Serializable|NO|NO|NO|

### Read Uncommitted(未提交读)
set session transaction isolation level read uncommitted;
查看隔离级别是否设置成功
select @@transaction_isolation （mysql版本 8.0 以后）
select @@tx_isolation （mysql版本 8.0 之前）

|加锁表达|ReadUncommitted(未提交读)|
|-------|-------|
| ![未提交读](/img/ReadUncommitted.png "未提交读")|<font color='red'> A:启动事务,此时数据为初始状态<br>B:启动事务,更新数据,但不提交<br>A:再次读取数据,发现数据已经被修改了,这就是所谓的“脏读”<br>B:回滚事务<br>A:再次读数据,发现数据变回初始状态</font>|

### Read Committed(已提交读)
set session transaction isolation level read committed;

|加锁表达|ReadUncommitted(未提交读)|
|-------|-------|
| ![读取已提交](/img/ReadCommitted.png "读取已提交")|<font color='red'> A:启动事务,此时数据为初始状态<br>B:启动事务,更新数据,但不提交<br>A:再次读数据,发现数据未被修改<br>B:提交事务<br>A:再次读取数据,发现数据已发生变化,说明B提交的修改被事务中的A读到了,这就是所谓的“不可重复读”</font>|

已提交读隔离级别解决了脏读的问题,但是出现了不可重复读的问题,即事务A在两次查询的数据不一致,因为在两次查询之间事务B更新了一条数据。已提交读只允许读取已提交的记录,但不要求可重复读。
### Repeatable Read(可重复读)
|加锁表达|RepeatableRead(可重复读)|
|-------|-------|
| ![可重复读](/img/RepeatableRead.png "可重复读")|<font color='red'> A:启动事务,此时数据为初始状态<br>B:启动事务,更新数据,但不提交<br>A:再次读数据,发现数据未被修改<br>B:提交事务<br>A:再次读取数据,发现数据依然未发生变化,这说明这次可以重复读了<br>B:插入一条新的数据,并提交<br>A:再次读取数据,发现数据依然未发生变化,虽然可以重复读了,但是却发现读的不是最新数据,这就是所谓的“幻读”<br>A:提交本次事务,再次读取数据,发现读取正常了<br></font>|

可重复读隔离级别只允许读取已提交记录,而且在一个事务两次读取一个记录期间,其他事务部的更新该记录。但该事务不要求与其他事务可串行化。例如,当一个事务可以找到由一个已提交事务更新的记录,但是可能产生幻读问题(注意是可能,因为数据库对隔离级别的实现有所差别)。像以上的实验,就没有出现数据幻读的问题

### Serializable(可串行化)
|加锁表达|ReadUncommitted(未提交读)|
|-------|-------|
| ![可串行化](/img/Serializable.png "可串行化")|<font color='red'> A:启动事务,此时数据为初始状态<br>B:发现B此时进入了等待状态,原因是因为A的事务尚未提交,只能等待(此时,B可能会发生等待超时)<br>A:提交事务<br>B:发现插入成功</font>|

serializable完全锁定字段,若一个事务来查询同一份数据就必须等待,直到前一个事务完成并解除锁定为止。是完整的隔离级别,会锁定对应的数据表格,因而会有效率的问题。

### MCVV(简化分析)
#### MVCC是解决了什么问题?
MVCC即Multi-Version Concurrency Control(多版本并发控制),只在READ COMMITTED和READ COMMITTED两个隔离级别下工作。其他两个隔离级别够和MVCC不兼容, 因为READ UNCOMMITTED总是读取最新的数据行, 而不是符合当前事务版本的数据行。而 SERIALIZABLE则会对所有读取的行都加锁。Serializable(可串行化)隔离级别,虽然不会出错,但是效率实在太低了,不能并发;在MYSQL中,MyISAM使用的是表锁,InnoDB使用的是行锁.而InnoDB的事务分为四个隔离级别,<font color='red'>其中默认的隔离级别REPEATABLE READ需要两个不同的事务相互之间不能影响,而且还能支持并发,这点悲观锁是达不到的,所以REPEATABLE READ采用的就是乐观锁,而乐观锁的实现采用的就是MVCC控制并发(认为是行级锁一个变种);正是因为有了MVCC,才造就InnoDB强大的事务处理能力(注:MVCC实现非堵塞读操作,写操作也只锁定必要行数据,防止写-写冲突)</font>

### MVCC原理分析(入门简化版本)
<font color='red'>InnoDB的MVCC,是通过在每行记录后面保存两个隐藏的列来实现的,这两个列分别是保存了行的创建时间(系统版本号)和行的删除时间(系统版本号)</font>这里存储的并不是实际的时间值,而是系统版本号(可以理解为事务的ID),每开始一个新的事务,系统版本号就会自动递增,事务开始时刻的系统版本号会作为事务的ID.下面看一下在REPEATABLE READ/READ COMMITTED隔离级别下,MVCC具体是如何操作的。

#### INSERT
* insert操作:将新插入的行保存当前版本号为行版本号

|执行事务ID=1|执行事务ID=1结果|
|--------|--------|
|start transaction; <br>insert into yang values(NULL,'yang');<br>insert into yang values(NULL,'long');<br>insert into yang values(NULL,'fei');<br>commit;|![insert-Mvcc](/img/insert-Mvcc.png "insert-Mvcc")|

#### SELECT操作
* SELECT操作:InnoDB会根据以下两个条件检查每行记录:
<font color='red'>1.InnoDB只会查找版本(DB_TRX_ID)早于当前事务版本的数据行(也就是,当前事务的系统版本号>=记录里数据行的创建系统版本号)，这样可以确保事务读取的行，要么是在事务开始前已经存在的，要么是事务自身插入或者修改过的.
* 2.当前事务版本号 < 行的删除版本(DB_ROLL_PTR)或未定义(未更新过)(这可以确保事务读取到的行，在事务开始之前未被删除)
只有条件1、2同时满足的记录:记录里数据行的创建系统版本号 <= 当前事务的系统版本号 < 行的删除版本(DB_ROLL_PTR)，才能返回作为查询结果</font>

假设在执行这个事务ID=2的第一行,这时有另一个事务ID=3往这个表里插入了一条数据; 第三个事务ID为3

|执行事务ID=2|执行事务ID=3|执行事务ID=3结果|
|------------|-----------|-----------|
|start transaction; <br>select * from yang; <br>select * from yang; <br>commit;|start transaction;<br>insert into yang values(NULL,'tian');<br>commit;|![select-mvcc1](/img/select-mvcc1.png "select-mvcc1")|

然后接着执行事务ID=2中的第二行,由于id=4的数据的创建时间(事务ID为3),执行当前事务的ID=2,而InnoDB只会查找事务ID小于等于当前事务ID的数据行,所以数据id=4行并不会在执行事务ID=2中的第二行时被检索出来,在事务ID=2中的两条select 语句检索出来的数据如下:

|执行事务ID=2结果|
|-----------|
|![select-mvcc2](/img/select-mvcc2.png "select-mvcc2")|

#### DELETE操作
* delete操作:将删除的行保存当前版本号为删除标识

假设在执行这个事务ID=2的第一行,假设事务执行完事务ID=3后，接着又执行了事务ID=4; 

|执行事务ID=4|执行事务ID=4结果|
|-----------|-----------|
|start transaction; <br>delete from yang where id=1;<br>commit;|![deleted-mvcc1](/img/deleted-mvcc1.png "deleted-mvcc1")|

接着执行事务ID=2的事务第二行,根据SELECT 检索条件可以知道,它会检索创建时间(创建事务的ID)小于当前事务ID的行和删除时间(删除事务的ID)大于当前事务的行,而id=4的行上面已经说过,而id=1的行由于删除时间(删除事务的ID)大于当前事务的ID,所以事务ID=2的第二行select * from yang也会把id=1的数据检索出来.所以,事务ID=2中的两条select 语句检索出来的数据都如下:

|执行事务ID=2结果|
|-----------|
|![deleted-mvcc2](/img/deleted-mvcc2.png "deleted-mvcc2")|

#### UPDATE操作
* update操作:变为insert和delete操作的组合，insert的行保存当前版本号为行版本号，delete则保存当前版本号到原来的行作为删除标识

假设在执行完事务ID=2的第一行时,其它用户执行了事务ID=3,ID=4,这时，又有一个用户对这张表执行了ID=5,UPDATE事务后,继续执行事务ID=2,根据select 语句的检索条件

|执行事务ID=5|执行事务ID=5结果|执行事务ID=2结果|
|-----------|-----------|-----------|
|start transaction; <br>update yang set name='Long' where id=2;<br>commit;|![update-mvcc1](/img/update-mvcc1.png "update-mvcc1")|![update-mvcc2](/img/update-mvcc2.png "update-mvcc2")|

注:<font color='red'>由于旧数据并不真正的删除，所以必须对这些数据进行清理，innodb会开启一个后台purge线程执行清理工作，具体的规则是将删除版本号小于当前系统版本的行删除</font>

### MCVV深入分析
#### MVCC可见性比较算法(Mysql)
![MVCC算法](/img/MVCC算法.png "MVCC算法")

### Undo log工作过程
在不考虑redo log 的情况下利用undo log工作的简化过程为:
![undolog](/img/undolog.png "undolog")
注:<font color='red'>undo log的持久化必须在在数据持久化之前，这样才能保证系统崩溃时，可以用undo log来回滚事务</font>

### Innodb中的隐藏列
Innodb通过undo log保存了已更改行的旧版本的信息的快照。
InnoDB的内部实现中为每一行数据增加了三个隐藏列用于实现MVCC
![innodb隐藏列](/img/innodb隐藏列.png "innodb隐藏列")

#### REPEATABLE READ与READ COMMITTED区别

## Mysql锁粒度
乐观锁:
悲观锁:
X锁(排他锁 Exclusive Lock):写锁
S锁(共享锁Share lock):读锁
间隙锁:
表级锁:
行级锁:


