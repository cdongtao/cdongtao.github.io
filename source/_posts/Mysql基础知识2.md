---
title: Mysql基础知识2
tags: [Mysql,面试知识]
categories: [Database]
---
## MySQL的基本架构
<font color='red'>在 MySQL 5.5 以后,默认的存储引擎为 InnoDB,且只有 InnoDB 引擎支持事务和数据崩溃恢复,因此所有内容均是基于 InnoDB 存储引擎为前提</font>
![MySQL的基本架构](/img/MySQL的基本架构.png "MySQL的基本架构")

思考一下下面两个问题:
* 1.MySQL 有四大特性：ACID,其中 D 指的是持久性(Durability),它的含义是 MySQL 的事务一旦提交,它对数据库的改变是永久性的,即数据不会丢失,那么 MySQL 究竟是如何实现的呢？
* 2.MySQL 数据库所在服务器宕机或者断电后,会出现数据丢失的问题吗？如果不丢失,它又是如何来实现数据不丢失的呢？

### Redo Log && Redo Log Buffer
#### Redo Log
　　　MySQL 在更新数据时,为了减少磁盘的随机 IO,因此并不会直接更新磁盘上的数据,而是先更新 Data Buffer 中缓存页的数据,等到合适的时间点,再将这个缓存页持久化到磁盘.而 Data Buffer 中所有缓存页都是处于内存当中的,当 MySQL 宕机或者机器断电,内存中的数据就会丢失,因此 MySQL 为了防止缓存页中的数据在更新后出现数据丢失的现象,引入了 redo log 机制.
　　　当进行增删改操作时,MySQL 会在更新 Data Buffer 中的缓存页数据时,会记录一条对应操作的 redo log 日志,这样如果出现 MySQL 宕机或者断电时,如果有缓存页的数据还没来得及刷入磁盘,那么当 MySQL 重新启动时,可以根据 redo log 日志文件,进行数据重做,将数据恢复到宕机或者断电前的状态,保证了更新的数据不丢失,因此 redo log 又叫做重做日志.它的本质是保证事务提交后,更新的数据不丢失.
　　　redo log 日志文件是持久化在磁盘上的,磁盘上可以有多个redo log文件,MySQL 默认有 2 个 redo log 文件,每个文件大小为 48MB,这两个文件默认存放在 MySQL 数据目录的文件夹下,这两个文件分别为 ib_logfile0 和 ib_logfile1.(本人电脑上安装的 MySQL 时,指定存放数据的目录是：/usr/local/mysql/data,因此这两个 redo log 文件所在的磁盘路径分别是：/usr/local/mysql/data/ib_logfile0 和/usr/local/mysql/data/ib_logfile1).可以通过如下命令来查看 redo log 文件相关的配置.

* <font color='red'>查询命令:show variables like 'innodb_log%'</font>
![redo_log设置参数](/img/redo_log设置参数.png "redo_log设置参数")
* innodb_log_files_in_group 表示的是有几个 redo log 日志文件.
* innodb_log_file_size 表示的是每个 redo log 日志文件的大小为多大.
* innodb_log_group_home_dir 表示的是 redo log 文件存放的目录,在这里./表示的是相对于 MySQL 存放数据的目录,这些参数可以根据实际需要自定义修改.

#### Redo Log Buffer
　　　当一条 SQL 更新完Data Buffer的缓存页后,就会记录一条 redo log 日志,前面提到了 redo log 日志是存储在磁盘上的,那么此时是不是立马就将 redo log 日志写入磁盘呢？显然不是的,而是先写入一个叫做 redo log buffer 的缓存中,<font color='red'>redo log buffer 是一块不同于Data Buffer的内存缓存区,在 MySQL 启动的时候,向内存中申请的一块redo log内存区域(在电脑cpu中的内存,与Mysql实例内存同级,而data buffer 是处于申请Mysql实例内存后,在实例里的内存区域),它是 redo log 日志缓冲区,默认大小是 16MB,由参数 innodb_log_buffer_size 控制(前面的截图中可以看到)</font>
　　　redo log buffer 内部又可以划分为许多 redo log block,每个 redo log block 大小为 512 字节.我们写入的 redo log 日志,最终实际上是先写入在 redo log buffer 的 redo log block 中,然后在某一个合适的时间点,将这条 redo log 所在的 redo log block 刷入到磁盘中.<font color='red'>这个合适的时间点究竟是什么时候呢？</font>

##### Redo Log Buffer刷入磁盘时间点
```
* 1.MySQL 正常关闭的时候;
* 2.MySQL 的后台线程每隔一段时间定时的讲 redo log buffer 刷入到磁盘,默认是每隔 1s 刷一次;
* 3.当 redo log buffer 中的日志写入量超过 redo log buffer 内存的一半时,即超过 8MB 时,会触发 redo log buffer 的刷盘;
* 4.当事务提交时,根据配置的参数 innodb_flush_log_at_trx_commit 来决定是否刷盘。
    I.参数配置为 0,表示事务提交时,不进行 redo log buffer 的刷盘操作;
    II.参数配置为 1,表示事务提交时,会将此时事务所对应的 redo log 所在的 redo log block 从内存写入到磁盘,同时调用 fysnc,确保数据落入到磁盘;
    III.参数配置为 2,表示只是将日志写入到操作系统的缓存,而不进行 fysnc 操作。(进程在向磁盘写入数据时,是先将数据写入到操作系统的缓存中：os cache,再调用 fsync 方法,才会将数据从 os cache 中刷新到磁盘上)
```

### Undo Log


### Bin Log


### Redo Log 与 Undo Log区别
*  binlog 记录的是逻辑日志,是 MySQL 的 Server 层记录的.binlog 中记录的是 SQL 语句(实际上并不一定为 SQL 语句,这与 binlog 的格式有关,如果指定的是 STATEMENT 格式,那么 binlog 中记录的就是 SQL 语句),也就是逻辑日志;
*  redo log 中记录的是物理日志,是 InnoDB 引擎记录的.redo log 中则记录的是对磁盘上的某个表空间的某个数据页的某一行数据的某个字段做了修改,修改后的值为多少,它记录的是对物理磁盘上数据的修改,因此称之为物理日志.

### 如何保证数据不丢失
#### 分析数据库执行过程redo log工作机制
1.MySQL Server 层的执行器调用 InnoDB 存储引擎的数据更新接口;
2.存储引擎更新 Data Buffer中的缓存页,
3.同时存储引擎记录一条 redo log 到 redo log buffer 中,并将该条 redo log 的状态标记为 prepare 状态;
4.接着存储引擎告诉执行器,可以提交事务了。执行器接到通知后,会写 binlog 日志,然后提交事务;
5.存储引擎接到提交事务的通知后,将 redo log 的日志状态标记为 commit 状态;
6.接着根据 innodb_flush_log_at_commit 参数的配置,决定是否将 redo log buffer 中的日志刷入到磁盘。

　　将 redo log 日志标记为 prepare 状态和 commit 状态,这种做法称之为两阶段事务提交,它能保证事务在提交后,数据不丢失。为什么呢？redo log 在进行数据重做时,只有读到了 commit 标识,才会认为这条 redo log 日志是完整的,才会进行数据重做,否则会认为这个 redo log 日志不完整,不会进行数据重做。
　　例如,如果在 redo log 处于 prepare 状态后,Data Buffer中的缓存页(脏页)也还没来得及刷入到磁盘,写完 biglog 后就出现了宕机或者断电,此时提交的事务是失败的,那么在 MySQL 重启后,进行数据重做时,在 redo log 日志中由于该事务的 redo log 日志没有 commit 标识,那么就不会进行数据重做,磁盘上数据还是原来的数据,也就是事务没有提交,这符合我们的逻辑。
    <font color='red'>实际上要严格保证数据不丢失,必须得保证 innodb_flush_log_at_trx_commit 配置为 1</font>
　　如果配置成 0,则 redo log 即使标记为 commit 状态了,由于此时 redo log 处于 redo log buffer 中,如果断电,redo log buffer 内存中的数据会丢失,此时如果恰好 buffer pool 中的脏页也还没有刷新到磁盘,而 redo log 也丢失了,所以在 MySQL 重启后,由于丢失了一条 redo log,因此就会丢失一条 redo log 对应的重做日志,这样断电前提交的那一次事务的数据也就丢失了。
　　如果配置成 2,则事务提交时,会将 redo log buffer(实际上是此次事务所对应的那条 redo log 所在的 redo log block )写入磁盘,但是操作系统通常都会存在 os cache,所以这时候的写只是将数据写入到了 os cache,如果机器断电,数据依然会丢失。
　　如果配置成 1,则表示事务提交时,就将对应的 redo log block 写入到磁盘,同时调用 fsync,fsync 会将数据强制从 os cache 中刷入到磁盘中,因此数据不会丢失。
　　从效率上来说,0 的效率最高,因为不涉及到磁盘 IO,但是会丢失数据;而 1 的效率最低,但是最安全,不会丢失数据。2 的效率居中,会丢失数据。在实际的生产环境中,通常要求是的是“双 1 配置”,即将 innodb_flush_log_at_trx_commit 设置为 1,另外一个 1 指的是写 binlog 时,将 sync_binlog 设置为 1,这样 binlog 的数据就不会丢失(后面的文章中会分析 binlog 相关的内容)。

#### 为什么引入Redo Log 这一机制?
　　有人可能会想,既然生产环境一般建议将 innodb_flush_log_at_trx_commit 设置为 1,也就是说每次更新数据时,最终还是要将 redo log 写入到磁盘,也就是还是会发生一次磁盘 IO,而我为什么不直接停止使用 redo log,而在每次更新数据时,也不要直接更新内存了,直接将数据更新到磁盘,这样也是发生了一次磁盘 IO,何必引入 redo log 这一机制呢？
　　首先引入 redo log 机制是十分必要的。因为写 redo log 时,我们将 redo log 日志追加到文件末尾,虽然也是一次磁盘 IO,但是这是顺序写操作(不需要移动磁头);而对于直接将数据更新到磁盘,涉及到的操作是将 buffer pool 中缓存页写入到磁盘上的数据页上,由于涉及到寻找数据页在磁盘的哪个地方,这个操作发生的是随机写操作(需要移动磁头),相比于顺序写操作,磁盘的随机写操作性能消耗更大,花费的时间更长,因此 redo log 机制更优,能提升 MySQL 的性能。
　　从另一方面来讲,通常一次更新操作,我们往往只会涉及到修改几个字节的数据,而如果因为仅仅修改几个字节的数据,就将整个数据页写入到磁盘(无论是磁盘还是 buffer pool,他们管理数据的单位都是以页为单位),这个代价未免也太了(每个数据页默认是 16KB),而一条 redo log 日志的大小可能就只有几个字节,因此每次磁盘 IO 写入的数据量更小,那么耗时也会更短。综合来看,redo log 机制的引入,在提高 MySQL 性能的同时,也保证了数据的可靠性。

#### 总结
```
1.MySQL 有四大特性：ACID,其中 D 指的是持久性(Durability),它的含义是 MySQL 的事务一旦提交,它对数据库的改变是永久性的,即数据不会丢失,那么 MySQL 究竟是如何实现的呢？
  MySQL 通过 redo log 机制,以及两阶段事务提交(prepare 和 commit)来保证了事务的持久性.
2.MySQL 数据库所在服务器宕机或者断电后,会出现数据丢失的问题吗？
  如果不丢失,它又是如何来实现数据不丢失的呢？MySQL 中,只有当 innodb_flush_log_at_trx_commit 参数设置为 1 时,才不会出现数据丢失情况,当设置为 0 或者 2 时,可能会出现数据丢失.
```

## Mysql数据存储原理计算
存储单位: 磁盘以扇区为单位=512字节  系统文件文件=4K   Mysql以页为单位=16k

### 计算B+树容量
```
求高度为H=2时,计算B+树容量?
1.设:存储一条数据大小=1k,索引键值(默认int类型)=8字节,指针(*P)=6字节
2.非叶子节点存储索引与指针数=16*1024/(8+6)=1170   //一页为单位可以包含指针数,指针向下指可以是指针,可以是数据
3.叶子节点包含数据数量=16K/1K=16     //一页为单位可以存储16条数据
4.H=2时,可以包含数据=1170(非叶子节点) * 16(叶子节点)=18000;
    H=3时,可以包含数据=1170(非叶子节点) * 1170(非叶子节点) * 16(叶子节点)=2100w
```

### 索引结构(算法)
#### 为什么选B+树做索引?
<font color='red'>提高效率核心是减少访问I/O次数</font>
* B+树:索引(O(log(n)))
* B树:每个节点存储结构(真实数据+key(索引)+指针(*P)),相比B+树(key+(*p))存储结构,B树节点跟多导致树会更高,I/O次数也更多,效率更低;
* 二叉树(二叉查找树):每个节点下面只有两个字节点,时间复杂度为O(log2n),只有左右子树,相同数据量,二叉树高度比B+树高,I/0次数也就更多;
* 红黑叔:每一次写入数据都可能需要反转,变色,还可能要迭代会上一级节点向下遍历,来回操作访问I/O次数变多,效率降低;
* hash索引: 仅仅能满足"=","IN"和"<=>"查询,不能使用范围查询(只有Memory存储引擎支持hash索引)

### 索引类型
#### 普通索引
普通索引是最基本的索引,它没有任何限制,值可以为空;仅加速查询;可以通过以下几种方式来创建或删除:
    CREATE INDEX index_name ON table(column(length))
    ALTER TABLE table_name ADD INDEX index_name ON (column(length))
    DROP INDEX index_name ON table

#### 唯一索引
唯一索引与普通索引类似,不同的就是:索引列的值必须唯一,但允许有空值;如果是组合索引,则列值的组合必须唯一;简单来说:唯一索引是加速查询 + 列值唯一(可以有null);以通过以下几种方式来创建:
    CREATE UNIQUE INDEX indexName ON table(column(length))
    ALTER TABLE table_name ADD UNIQUE indexName ON (column(length))

#### 主键索引
主键索引是一种特殊的唯一索引,一个表只能有一个主键,不允许有空值;简单来说:主键索引是加速查询 + 列值唯一(不可以有null)+ 表中只有一个
CREATE TABLE mytable( ID INT NOT NULL, username VARCHAR(16) NOT NULL, PRIMARY KEY(ID) );

#### 组合索引
组合索引指在多个字段上创建的索引,只有在查询条件中使用了创建索引时的第一个字段,索引才会被使用;使用组合索引时遵循最左前缀集合;组合索引是多列值组成的一个索引,专门用于组合搜索,其效率大于索引合并
    ALTER TABLE `table` ADD INDEX name_city_age (name,city,age);

#### 全文索引
全文索引主要用来查找文本中的关键字,而不是直接与索引中的值相比较;fulltext索引跟其它索引大不相同,它更像是一个搜索引擎,而不是简单的where语句的参数匹配;fulltext索引配合match against操作使用,而不是一般的where语句加like;它可以在create table,alter table ,create index使用,不过目前只有char、varchar,text 列上可以创建全文索引;值得一提的是,在数据量较大时候,现将数据放入一个没有全局索引的表中,然后再用CREATE index创建fulltext索引,要比先为一张表建立fulltext然后再将数据写入的速度快很多;
    CREATE TABLE `table` (`id` int(11) NOT NULL AUTO_INCREMENT ,FULLTEXT (content));
    ALTER TABLE article ADD FULLTEXT index_content(content)
    CREATE FULLTEXT INDEX index_content ON article(content)

## Mysql优化基础
优化逻辑: <font color='red'>选择存储引擎---->建表---->建索引---->优化sql---->硬件</font>
    
### 选择存储引擎
#### 引擎种类
InnoDby存储引擎,MyIsAm存储引擎,Memory存储引擎
InnoDb引擎:如果数据量比较大,这是需要通过升级架构来解决,比如分表分库,读写分离,而不是单纯地依赖存储引擎

#### 常用引擎比较
| InnoDb引擎|MyIsAm引擎|
|-----------|------------|
|聚簇索引(主键索引和数据是在一起的)|非聚簇索引|
|支持事务(出错还可以回滚还原)|不支持事务|
|行级锁|全表锁|
|全表删除,行级删|全表删除,重建表|
|MVCC控制并发|不控制并发|
|适合读写改删操作|适合写入频繁操作|

聚簇索引:将数据存储与索引放到了一块,索引结构的叶子节点保存了行数据;如果表中没有主键或合适的唯一索引, 也就是无法生成聚簇索引的时候, InnoDB会帮我们自动生成聚集索引, 聚簇索引会使用DB_ROW_ID的值来作为主键; 如果表中有主键或者合适的唯一索引, 那么聚簇索引中也就不会包含 DB_ROW_ID了
非聚簇索引:将数据与索引分开存储,索引结构的叶子节点(指针)指向了保存在磁盘上数据对应的位置

聚集索引和非聚集索引的区别如下
1.聚簇索引只需要一次按Page加载数据到缓冲区(一次I/O),已经加载在缓冲区的数据后续不需要再一次(I/O);非聚簇索引结构原因导致数据每一次查找都需要从硬盘加载(I/O)

#### 为什么主键通常建议使用自增id
如果主键不是自增id,B+树不断地调整数据的物理地址、分页.但如果是自增的,索引结构相对紧凑,磁盘碎片少,效率也高;

### 为什么索引是int类型
建议使用int类型的自增,如果主键其他类型值占用的存储空间越大,也就节点会变多,增加B+树的高度,IO操作也会变多.

#### 为什么不适用UUid做聚簇索引
当使用主键为聚簇索引时,主键最好不要使用uuid,因为uuid的值太过离散,不适合排序且可能出线新增加记录的uuid,会插入在索引树中间的位置,导致索引树调整复杂度变大,消耗更多的时间和资源.

### 建表
使用三范式建表/反三范式适当冗余
#### 三范式建表
* 保证表字段原子性
* 完全依赖主键(消除除主键外,表字段对其他字段的唯一依赖)
    字段ABC:主键A->C,B->C //C同时唯一依赖A/B,要消除B->C,让主键唯一依赖
* 消除存在传递性依赖,适当增加中间表
    字段ABC:主键A->B,B->C //可以由A推出B,B推出C,消除C

### 建索引
    建立主键,常用字段为索引,还有考虑联合索引

### 优化sql
#### 使用索引注意
* Select:尽可能不使用select* 问题,select之后只写必要字段,增加索引覆盖率
* Where:使用满足最左匹配索引原则
* and:过于频繁使用and查询,合理使用复合索引,但是尽量少用
* or:防止一边无索引,导致全部查询
* order By:若无索引,则数据将从硬盘分批读取到内存中排序,最后合并结果
* join...in:条件中建立索引
* like:防止“%XXX%”全表查询,但是“XXX%”可以使用索引

注:复合索引原理(A and B)
    1.若AB都有索引树,先在A树找到再到B树找,取交集;
    2.若以A_B拼接成字符串后做成联合索引,则在索引结果中找A,然后二分法找B,但复合索引树高度I/O过多,导致性能效率问题

#### 看执行计划,查看索引使用情况
MySQL 使用 explain + sql 语句查看 执行计划,该执行计划不一定完全正确但是可以参考

