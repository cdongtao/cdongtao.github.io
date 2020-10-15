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
select @@transaction_isolation (mysql版本 8.0 以后)
select @@tx_isolation (mysql版本 8.0 之前)

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

“幻读”指在一次事务里面,多次查询之后,结果集的个数不一致的情况叫做幻读。而多或者少的那一行被叫做幻行
* 为什么要解决幻读？在高并发数据库系统中,需要保证事务与事务之间的隔离性,还有事务本身的一致性。

### Serializable(可串行化)
|加锁表达|ReadUncommitted(未提交读)|
|-------|-------|
| ![可串行化](/img/Serializable.png "可串行化")|<font color='red'> A:启动事务,此时数据为初始状态<br>B:发现B此时进入了等待状态,原因是因为A的事务尚未提交,只能等待(此时,B可能会发生等待超时)<br>A:提交事务<br>B:发现插入成功</font>|

serializable完全锁定字段,若一个事务来查询同一份数据就必须等待,直到前一个事务完成并解除锁定为止。是完整的隔离级别,会锁定对应的数据表格,因而会有效率的问题。

## MCVV(简化分析)
MVCC即Multi-Version Concurrency Control(多版本并发控制), MySQL的大多数事务型存储引擎实现的都不是简单的行级锁。基于提升并发性能的考虑,它们一般都同时实现了多版本并发控制(MVCC)。不仅是MySQL,包括Oracle、PostgreSQL等其他数据库系统也都实现了MVCC,但各自的实现机制不尽相同,因为MVCC没有一个统一的实现标准。可以认为MVCC是行级锁的一个变种,但是它在很多情况下避免了加锁操作,因此开销更低。虽然实现机制有所不同,但大都实现了非阻塞的读操作,写操作也只锁定必要的行。Mysql只在READ COMMITTED和READ COMMITTED两个隔离级别下工作。其他两个隔离级别和MVCC不兼容, 因为READ UNCOMMITTED总是读取最新的数据行, 而不是符合当前事务版本的数据行。而 SERIALIZABLE则会对所有读取的行都加锁。Serializable(可串行化)隔离级别,虽然不会出错,但是效率实在太低了,不能并发;在MYSQL中,MyISAM使用的是表锁,InnoDB使用的是行锁.而InnoDB的事务分为四个隔离级别,<font color='red'>其中默认的隔离级别REPEATABLE READ需要两个不同的事务相互之间不能影响,而且还能支持并发,这点悲观锁是达不到的,所以REPEATABLE READ采用的就是乐观锁,而乐观锁的实现采用的就是MVCC控制并发(认为是行级锁一个变种);正是因为有了MVCC,才造就InnoDB强大的事务处理能力(注:MVCC实现非堵塞读操作,写操作也只锁定必要行数据,防止写-写冲突)</font>

### Mysql的MVCC是解决了什么问题?
MVCC解决了在REPEATABLE READ和READ COMMITTED两个隔离级别下读同一行和写同一行的多个事务的并发读数据问题,并没解决重复读与幻读,幻读;

## MVCC原理分析(入门简化版本)
<font color='red'>InnoDB的MVCC,是通过在每行记录后面保存两个隐藏的列来实现的,这两个列分别是保存了行的创建时间(系统版本号)和行的删除时间(系统版本号)</font>这里存储的并不是实际的时间值,而是系统版本号(可以理解为事务的ID),每开始一个新的事务,系统版本号就会自动递增,事务开始时刻的系统版本号会作为事务的ID.下面看一下在REPEATABLE READ/READ COMMITTED隔离级别下,MVCC具体是如何操作的。

### INSERT
* insert操作:将新插入的行保存当前版本号为行版本号

|执行事务ID=1|执行事务ID=1结果|
|--------|--------|
|start transaction; <br>insert into yang values(NULL,'yang');<br>insert into yang values(NULL,'long');<br>insert into yang values(NULL,'fei');<br>commit;|![insert-Mvcc](/img/insert-Mvcc.png "insert-Mvcc")|

### SELECT操作
* SELECT操作:InnoDB会根据以下两个条件检查每行记录:
<font color='red'>1.InnoDB只会查找版本(DB_TRX_ID)早于当前事务版本的数据行(也就是,当前事务的系统版本号>=记录里数据行的创建系统版本号),这样可以确保事务读取的行,要么是在事务开始前已经存在的,要么是事务自身插入或者修改过的.
* 2.当前事务版本号 < 行的删除版本(DB_ROLL_PTR)或未定义(未更新过)(这可以确保事务读取到的行,在事务开始之前未被删除)
只有条件1、2同时满足的记录:记录里数据行的创建系统版本号 <= 当前事务的系统版本号 < 行的删除版本(DB_ROLL_PTR),才能返回作为查询结果</font>

假设在执行这个事务ID=2的第一行,这时有另一个事务ID=3往这个表里插入了一条数据; 第三个事务ID为3

|执行事务ID=2|执行事务ID=3|执行事务ID=3结果|
|------------|-----------|-----------|
|start transaction; <br>select * from yang; <br>select * from yang; <br>commit;|start transaction;<br>insert into yang values(NULL,'tian');<br>commit;|![select-mvcc1](/img/select-mvcc1.png "select-mvcc1")|

然后接着执行事务ID=2中的第二行,由于id=4的数据的创建时间(事务ID为3),执行当前事务的ID=2,而InnoDB只会查找事务ID小于等于当前事务ID的数据行,所以数据id=4行并不会在执行事务ID=2中的第二行时被检索出来,在事务ID=2中的两条select 语句检索出来的数据如下:

|执行事务ID=2结果|
|-----------|
|![select-mvcc2](/img/select-mvcc2.png "select-mvcc2")|

### DELETE操作
* delete操作:将删除的行保存当前版本号为删除标识

假设在执行这个事务ID=2的第一行,假设事务执行完事务ID=3后,接着又执行了事务ID=4; 

|执行事务ID=4|执行事务ID=4结果|
|-----------|-----------|
|start transaction; <br>delete from yang where id=1;<br>commit;|![deleted-mvcc1](/img/deleted-mvcc1.png "deleted-mvcc1")|

接着执行事务ID=2的事务第二行,根据SELECT 检索条件可以知道,它会检索创建时间(创建事务的ID)小于当前事务ID的行和删除时间(删除事务的ID)大于当前事务的行,而id=4的行上面已经说过,而id=1的行由于删除时间(删除事务的ID)大于当前事务的ID,所以事务ID=2的第二行select * from yang也会把id=1的数据检索出来.所以,事务ID=2中的两条select 语句检索出来的数据都如下:

|执行事务ID=2结果|
|-----------|
|![deleted-mvcc2](/img/deleted-mvcc2.png "deleted-mvcc2")|

### UPDATE操作
* update操作:变为insert和delete操作的组合,insert的行保存当前版本号为行版本号,delete则保存当前版本号到原来的行作为删除标识

假设在执行完事务ID=2的第一行时,其它用户执行了事务ID=3,ID=4,这时,又有一个用户对这张表执行了ID=5,UPDATE事务后,继续执行事务ID=2,根据select 语句的检索条件

|执行事务ID=5|执行事务ID=5结果|执行事务ID=2结果|
|-----------|-----------|-----------|
|start transaction; <br>update yang set name='Long' where id=2;<br>commit;|![update-mvcc1](/img/update-mvcc1.png "update-mvcc1")|![update-mvcc2](/img/update-mvcc2.png "update-mvcc2")|

注:<font color='red'>由于旧数据并不真正的删除,所以必须对这些数据进行清理,innodb会开启一个后台purge线程执行清理工作,具体的规则是将删除版本号小于当前系统版本的行删除</font>

## MCVV深入分析
### Innodb中的隐藏列
InnoDB的内部实现中为每一行数据增加了三个隐藏列用于实现MVCC
![innodb隐藏列](/img/innodb隐藏列.png "innodb隐藏列")
* DB_TRX_ID: 事务id(6byte),每处理一个事务,值自动加一;InnoDB中每个事务有一个唯一的事务ID叫做 transaction id。在事务开始时向InnoDB事务系统申请得到,是按申请顺序严格递增的.每行数据是有多个版本的,每次事务更新数据时都会生成一个新的数据版本,并且把transaction id赋值给这个数据行的DB_TRX_ID.
* DB_ROLL_PT: 回滚指针(7byte),指向当前记录的ROLLBACK SEGMENT 的undolog记录,通过这个指针获得之前版本的数据。该行记录上所有旧版本在 undolog 中都通过链表的形式组织．
* DB_ROW_ID:(隐含id,6byte,由innodb自动产生),我们可能听说过InnoDB下聚簇索引B+Tree的构造规则:如果声明了主键,InnoDB以用户指定的主键构建B+Tree,如果未声明主键,InnoDB 会自动生成一个隐藏主键,说的就是DB_ROW_ID。另外,每条记录的头信息(record header)里都有一个专门的bit(deleted_flag)来表示当前记录是否已经被删除

### redo log与undo log
#### redo log
redo log就是保存执行的SQL语句到一个指定的Log文件，当Mysql执行recovery时重新执行redo log记录的SQL操作即可。当客户端执行每条SQL（更新语句）时，redo log会被首先写入log buffer；当客户端执行COMMIT命令时，log buffer中的内容会被视情况刷新到磁盘。redo log在磁盘上作为一个独立的文件存在，即Innodb的log文件。
#### undo log
与redo log相反，undo log是为回滚而用，具体内容就是copy事务前的数据库内容（行）到undo buffer，在适合的时间把undo buffer中的内容刷新到磁盘。undo buffer与redo buffer一样，也是环形缓冲，但当缓冲满的时候，undo buffer中的内容会也会被刷新到磁盘；与redo log不同的是，磁盘上不存在单独的undo log文件，所有的undo log均存放在主ibd数据文件中（表空间），即使客户端设置了每表一个数据文件也是如此。

### Undo log工作过程
在不考虑redo log 的情况下利用undo log工作的简化过程为:
![undolog](/img/undolog.png "undolog")
注:<font color='red'>undo log的持久化必须在在数据持久化之前,这样才能保证系统崩溃时,可以用undo log来回滚事务</font>

### Undo log链分析
![transaction_MVCC](/img/transaction_MVCC.png "transaction_MVCC")
图的UPDATE(即操作2)来举例Undo log链的构建(假设第一行数据DB_ROW_ID=1)：
* 事务A对DB_ROW_ID=1这一行加排它锁
* 将修改行原本的值拷贝到Undo log中
* 修改目标值产生一个新版本,将DB_TRX_ID设为当前事务ID即100,将DB_ROLL_PT指向拷贝到Undo log中的旧版本记录
* 记录redo log, binlog

最终生成的Undo log链如下图所示:
![undo_log链](/img/undo_log链.png "undo_log链")
相比与UPDATE,INSERT和DELETE都比较简单:
* INSERT: 产生一条新的记录,该记录的DB_TRX_ID为当前事务ID
* DELETE: 特殊的UPDATE,在DB_TRX_ID上记录下当前事务的ID,同时将delete_flag设为true,在执行commit时才进行删除操作

### ReadView(一致性视图)判断当前版本数据项是否可见 
![判断当前版本数据项是否可见](/img/MVCC算法.png "判断当前版本数据项是否可见")
在innodb中,创建一个新事务的时候,innodb会将当前系统中的活跃事务列表(trx_sys->trx_list)创建一个副本(read view),副本中保存的是系统当前不应该被本事务看到的其他事务id列表。当用户在这个事务中要读取该行记录的时候,innodb会将该行当前的版本号与该read view进行比较。
具体的算法如下:

1.设该行的当前事务id为trx_id_0,read view中最早的事务id为trx_id_1, 最迟的事务id为trx_id_2。
2.如果trx_id_0< trx_id_1的话,那么表明该行记录所在的事务已经在本次新事务创建之前就提交了,所以该行记录的当前值是可见的。跳到步骤6.
3.如果trx_id_0>trx_id_2的话,那么表明该行记录所在的事务在本次新事务创建之后才开启,所以该行记录的当前值不可见.跳到步骤5。
4.如果trx_id_1<=trx_id_0<=trx_id_2, 那么表明该行记录所在事务在本次新事务创建的时候处于活动状态,从trx_id_1到trx_id_2进行遍历,如果trx_id_0等于他们之中的某个事务id的话,那么不可见。跳到步骤5.
5.从该行记录的DB_ROLL_PTR指针所指向的回滚段中取出最新的undo-log的版本号,将它赋值该trx_id_0,然后跳到步骤2.
6.将该可见行的值返回
#### ReadView(一致性视图)
InnoDB为每一个事务构造了一个数组m_ids用于保存快照读生成瞬间当前所有活跃事务(开始但未提交事务)的ID,将数组中事务ID最小值记为低水位m_up_limit_id,当前系统中已创建事务ID最大值+1记为高水位m_low_limit_id,构成如图所示:
![ReadView](/img/ReadView.png "ReadView")

一致性视图的流程如下:
* 当查询发生时根据以上条件生成ReadView,该查询操作遍历Undo log链,根据当前被访问版本(可以理解为Undo log链中每一个记录即一个版本,遍历都是从最新版本向老版本遍历)的DB_TRX_ID,如果DB_TRX_ID小于m_up_limit_id,则该版本在ReadView生成前就已经完成提交,该版本可以被当前事务访问。DB_TRX_ID在绿色范围内的可以被访问
* 若被访问版本的DB_TRX_ID大于m_up_limit_id,说明该版本在ReadView生成之后才生成,因此该版本不能被访问,根据当前版本指向上一版本的指针DB_ROLL_PT访问上一个版本,继续判断。DB_TRX_ID在蓝色范围内的都不允许被访问
* 若被访问版本的DB_TRX_ID在[m_up_limit_id, m_low_limit_id)区间内,则判断DB_TRX_ID是否等于当前事务ID,等于则证明是当前事务做的修改,可以被访问,否则不可被访问, 继续向上寻找。只有DB_TRX_ID等于当前事务ID才允许访问橙色范围内的版本
* 最后,还要确保满足以上要求的可访问版本的数据的delete_flag不为true,否则查询到的就会是删除的数据。
以上总结就是只有当前事务修改的未commit版本和所有已提交事务版本允许被访问

#### Read Committed与Repeatable Read的一致性视图(ReadView)区别
READ COMMITTD、REPEATABLE READ这两个隔离级别的一个很大不同就是生成ReadView的时机不同
#### Read Committed的ReadView
在read committed级别下,readview会在事务中的<font color='red'>每一个SELECT语句查询发送前生成(也可以在声明事务时显式声明START TRANSACTION WITH CONSISTENT SNAPSHOT)。</font>因此每次SELECT都可以获取到当前已提交事务和自己修改的最新版本。
#### Repeatable Read的ReadView
在repeatable read级别下,<font color='red'>每个事务只会在第一个SELECT语句查询发送前或显式声明处生成,其他查询操作都会基于这个ReadView。</font>这样就保证了一个事务中的多次查询结果都是相同的,因为他们都是基于同一个ReadView下进行MVCC机制的查询操作。

### 快照读(snapshot read)与当前读(current read)
MySQL数据库支持两种读操作快照读(snapshot read)和当前读(current read)解决幻读
#### 快照读(snapshot read)
* <font color='red'>所有的快照读都依赖MVCC机制,读取特定的历史版本数据;<font color='red'>简单的select不加X锁/S锁操作,属于快照读(当然也有例外select加锁,如select ... lock in share mode, select ... for update)</font>
* 作用:在快照读读情况下,mysql通过mvcc来避免幻读;innodb的默认事务隔离级别是rr(可重复读),它的实现技术是mvcc(MVCC只在读提交可重复读两种隔离级别下工作),基于版本的控制协议。快照读不仅可以保证innodb的可重复读,而且可以防止幻读。但是它防止的是快照读,也就是读取的数据虽然是一致的,但是数据是历史数据</font>

![snapshot-read](/img/snapshot-read.png "snapshot-read")

#### 当前读(current read)
MySQL InnoDB的可重复读并不保证避免幻读,当前读情况下,需要使用加锁读来保证。而这个加锁度使用到的机制就是next-key locks。
* <font color='red'>特殊的读操作(加锁读操作),读取当前最新的数据;insert/update/delete操作,需要加锁(X锁/S锁:select ... lock in share mode, select ... for update),属于当前读
* 作用:如何做到保证数据是一致的(也就是一个事务,其内部读取对应某一个数据的时候,数据都是一样的),同时读取的数据是最新的数据。mysql innodb提供了Next-Key Lock机制来避免幻读;这是由行锁和Gap锁组成,在使用范围条件检索并锁定记录时,InnoDB这种加锁机制会阻塞符合条件范围内键值的并发插入,这往往会造成严重的锁等待。Gap锁在InnoDB的唯一作用就是防止其它事务的插入操作,以此来达到防止幻读的发生,所以间隙锁不分什么共享锁与排它锁</font>

![current-read](/img/current-read.png "current-read")

#### 例子分析
比方说现在系统里有两个id分别为100、200的事务在执行:

|Transaction 100|Transaction 200|
|------------------------|-----------------------|
|BEGIN;<br>UPDATE t SET c = '关羽' WHERE id = 1;<br>UPDATE t SET c = '张飞' WHERE id = 1;|BEGIN;<br>操作(更新了一些别的表的记录)<br>UPDATE t SET c = '赵云' WHERE id = 1;<br>UPDATE t SET c = '诸葛亮' WHERE id = 1;|

![分析undo_log1](/img/分析undo_log1.png "分析undo_log1")

##### 使用READ COMMITTED隔离级别的事务

    BEGIN;
    //SELECT1：Transaction 100、200未提交
    SELECT * FROM t WHERE id = 1; # 得到的列c的值为'刘备'

这个SELECT1的执行过程如下:
* 在执行SELECT语句时会先生成一个ReadView，ReadView的m_ids列表的内容就是[100, 200]。
* 然后从版本链中挑选可见的记录，从图中可以看出，最新版本的列c的内容是'张飞'，该版本的trx_id值为100，在m_ids列表内，所以不符合可见性要求，根据roll_pointer跳到下一个版本。
* 下一个版本的列c的内容是'关羽'，该版本的trx_id值也为100，也在m_ids列表内，所以也不符合要求，继续跳到下一个版本。
* 下一个版本的列c的内容是'刘备'，该版本的trx_id值为80，小于m_ids列表中最小的事务id100，所以这个版本是符合要求的，最后返回给用户的版本就是这条列c为'刘备'的记录。
  
之后，我们把事务id为100的事务提交一下，就像这样：
![分析undo_log2](/img/分析undo_log2.png "分析undo_log2")

##### REPEATABLE READ隔离级别的事务

    //使用REPEATABLE READ隔离级别的事务中继续查找这个id为1的记录:
    BEGIN;
    //SELECT1：Transaction 100、200均未提交
    SELECT * FROM t WHERE id = 1; # 得到的列c的值为'刘备'
    //SELECT2：Transaction 100提交，Transaction 200未提交
    SELECT * FROM t WHERE id = 1; # 得到的列c的值仍为'刘备'

这个SELECT2的执行过程如下：
* 因为之前已经生成过ReadView了，所以此时直接复用之前的ReadView，之前的ReadView中的m_ids列表就是[100, 200]。
* 然后从版本链中挑选可见的记录，从图中可以看出，最新版本的列c的内容是'诸葛亮'，该版本的trx_id值为200，在m_ids列表内，所以不符合可见性要求，根据roll_pointer跳到下一个版本。
* 下一个版本的列c的内容是'赵云'，该版本的trx_id值为200，也在m_ids列表内，所以也不符合要求，继续跳到下一个版本。
* 下一个版本的列c的内容是'张飞'，该版本的trx_id值为100，而m_ids列表中是包含值为100的事务id的，所以该版本也不符合要求，同理下一个列c的内容是'关羽'的版本也不符合要求。继续跳到下一个版本。
* 下一个版本的列c的内容是'刘备'，该版本的trx_id值为80，80小于m_ids列表中最小的事务id100，所以这个版本是符合要求的，最后返回给用户的版本就是这条列c为'刘备'的记录。

也就是说两次SELECT查询得到的结果是重复的，记录的列c值都是'刘备'，这就是可重复读的含义。如果我们之后再把事务id为200的记录提交了，之后再到刚才使用REPEATABLE READ隔离级别的事务中继续查找这个id为1的记录，得到的结果还是'刘备'，具体执行过程自己分析一下。

##### MySQL InnoDB 引擎 RR 隔离级别是否解决了幻读
Mysql官方给出的幻读解释是：只要在一个事务中，第二次select多出了row就算幻读。
a事务先select，b事务insert确实会加一个gap锁，但是如果b事务commit，这个gap锁就会释放（释放后a事务可以随意dml操作），a事务再select出来的结果在MVCC下还和第一次select一样，接着a事务不加条件地update，这个update会作用在所有行上（包括b事务新加的），a事务再次select就会出现b事务中的新行，并且这个新行已经被update修改了，实测在RR级别下确实如此。
* T1 select 之后 update，会将 T2 中 insert 的数据一起更新，那么认为多出来一行，所以防不住幻读。但是其实这种方式是一种 bad case
![快照读转当前读](/img/快照读转当前读.png "快照读转当前读")

### Mysql的MVCC实现原理的深刻反思
#### 理想MVCC有下面几个特点
* 每行数据都存在一个版本，每次数据更新时都更新该版本
* 修改时Copy出当前版本, 然后随意修改，各个事务之间无干扰
* 保存时比较版本号，如果成功(commit)，则覆盖原记录, 失败则放弃copy(rollback)
* 就是每行都有版本号，保存时根据版本号决定是否成功，听起来含有乐观锁的味道, 因为这看起来正是，在提交的时候才能知道到底能否提交成功

#### InnoDB实现MVCC的方式是:
* 事务以排他锁的形式修改原始数据
* 把修改前的数据存放于undo log，通过回滚指针与主数据关联
* 修改成功（commit）啥都不做，失败则恢复undo log中的数据（rollback）

#### 二者最本质的区别是: 当修改数据时是否要排他锁定，如果锁定了还算不算是MVCC？
　　Innodb的实现真算不上MVCC,因为并没有实现核心的多版本共存,undo log中的内容只是串行化的结果,记录了多个事务的过程,不属于多版本共存。但理想的MVCC是难以实现的,当事务仅修改一行记录使用理想的MVCC模式是没有问题的,可以通过比较版本号进行回滚;但当事务影响到多行数据时,理想的MVCC据无能为力了。
　　比如,如果Transaciton1执行理想的MVCC,修改Row1成功,而修改Row2失败,此时需要回滚Row1,但因为Row1没有被锁定,其数据可能又被Transaction2所修改,如果此时回滚Row1的内容,则会破坏Transaction2的修改结果,导致Transaction2违反ACID。
    理想MVCC难以实现的根本原因在于企图通过乐观锁代替二段提交。修改两行数据,但为了保证其一致性,与修改两个分布式系统中的数据并无区别,
而二提交是目前这种场景保证一致性的唯一手段。二段提交的本质是锁定,乐观锁的本质是消除锁定,二者矛盾,故理想的MVCC难以真正在实际中被应
用,Innodb只是借了MVCC这个名字,提供了读的非阻塞而已

![mvcc总结](/img/mvcc总结.png "mvcc总结")

## 数据库锁粒度
### 乐观锁
　　乐观锁大多是基于数据版本记录机制实现，一般是给数据库表增加一个"version"字段。读取数据时，将此版本号一同读出，之后更新时，对此版本号加一。此时将提交数据的版本数据与数据库表对应记录的当前版本信息进行比对，如果提交的数据版本号大于数据库表当前版本号，则予以更新，否则认为是过期数据。不需要对数据加锁也能取准确数据;如MVCC;

### 悲观锁
    悲观锁依靠数据库提供的锁机制实现。MySQL中的共享锁和排它锁都是悲观锁。数据库的增删改操作默认都会加排他锁，而查询不会加任何锁
    
### X锁/写锁/排他锁(Exclusive Lock)
　　....for update 是加写锁,一行数据上只能有一个写锁,读写互斥;排它锁指的就是对于多个不同的事务，对同一个资源只能有一把锁。对某一资源加排它锁，自身可以进行增删改查，其他人无法进行加锁操作，更无法进行增删改操作。

### S锁/读锁/共享锁(Share lock)
　　....lock in share mode 是加读锁,一行数据上可以加多个读锁,读写互斥;共享锁指的就是对于多个不同的事务，对于一个资源共享同一个锁。对某一资源加共享锁，自身可可读该资源，其他人也可以读该资源(也可以再加共享锁，即共享锁共享多个内存)，但无法修改。要想修改就必须等所有共享锁都释放完之后。

### 表级锁:锁变表
　　表锁就是对一张表进行加锁，操作对象是数据表。Mysql大多数锁策略都支持(常见mysql innodb)，是系统开销最低但并发性最低的一个锁策略。事务t对整个表加读锁，则其他事务可读不可写，若加写锁，则其他事务增删改都不行。

#### Next-Key Lock
    行锁(Record Lock)与间隙锁(Gap Lock)组合起来用就叫做Next-Key Lock

#### 行锁
　　行锁就是给一行数据进行加锁，操作对象是数据表中的一行（共享锁和排他锁可能是行锁也可能是表锁，取决于对数据加锁的范围，是一行还是整个表）。是MVCC技术用的比较多的，但在MYISAM用不了，行级锁用mysql的储存引擎实现而不是mysql服务器。但行级锁对系统开销较大，处理高并发较好。

#### 间隙锁(Gap Lock)
 　　在索引记录之间的间隙中加锁，或者是在某一条索引记录之前或者之后加锁，并不包括该索引记录本身。gap lock的机制主要是解决可重复读模式下的幻读问题。锁加在不存在的空闲空间,可以是两个索引记录之间(1 < X < 3>>),也可能是第一个索引记录之前(X < 1)或最后一个索引之后的空间(X > 1)

    举例来说,假如user表中只有101条记录,其empid的值分别是 1,2,...,100,101,下面的SQL：
    select * from  user where user_id > 100 for update;
    是一个范围条件的检索,InnoDB不仅会对符合条件的user_id值为101的记录加锁,也会对user_id大于101(这些记录并不存在)的“间隙”加锁。
    产生幻读的原因是,行锁只能锁住行,但是新插入记录这个动作,要更新的是记录之间的“间隙”。因此,为了解决幻读问题,InnoDB 只好引入新的锁,也就是间隙锁

#### Record lock
单条索引记录上加锁，record lock锁住的永远是索引，而非记录本身，即使该表上没有任何索引，那么innodb会在后台创建一个隐藏的聚集主键索引，那么锁住的就是这个隐藏的聚集主键索引。所以说当一条sql没有走任何索引时，那么将会在每一条聚集索引后面加X锁，这个类似于表锁，但原理上和表锁应该是完全不同的。

#### Next-Key Lock 
行锁和间隙锁组合起来就叫Next-Key Lock

当前读、快照读，record lock(记录锁)、gap lock(间隙锁)、next-key lock;
本来只有串读隔离级别才可以解决幻读问题，而实际上由于快照读的特性使可重复读也解决了幻读问题。
当前读是因为innodb默认为它加入了间隙锁，防止在事务期间对相关数据集插入记录，从而避免出现幻读。
在RR级别下，快照读是通过MVVC(多版本控制)和undo log来实现的，当前读是通过加record lock(记录锁)和gap lock(间隙锁)来实现的。如果需要实时显示数据，还是需要通过手动加锁来实现。这个时候会使用next-key技术来实现。
在mysql中，提供了两种事务隔离技术，第一个是mvcc，第二个是next-key技术。这个在使用不同的语句的时候可以动态选择。不加lock inshare mode之类的快照读就使用mvcc。否则 当前读使用next-key。mvcc的优势是不加锁，并发性高。缺点是不是实时数据。next-key的优势是获取实时数据，但是需要加锁。


