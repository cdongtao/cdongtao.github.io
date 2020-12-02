---
title: MySql基础知识2
tags: [Mysql,面试知识]
categories: [Database]
---
## MySQL的基本架构
<font color='red'>在 MySQL 5.5 以后,默认的存储引擎为 InnoDB,且只有 InnoDB 引擎支持事务和数据崩溃恢复,因此所有内容均是基于 InnoDB 存储引擎为前提</font>
![MySQL的基本架构](/img/MySQL的基本架构.png "MySQL的基本架构")

思考一下下面两个问题:
* 1.MySQL 有四大特性:ACID,其中 D 指的是持久性(Durability),它的含义是 MySQL 的事务一旦提交,它对数据库的改变是永久性的,即数据不会丢失,那么 MySQL 究竟是如何实现的呢？
* 2.MySQL 数据库所在服务器宕机或者断电后,会出现数据丢失的问题吗？如果不丢失,它又是如何来实现数据不丢失的呢？

### Redo Log(重做日志)
#### Redo Log定义
redo log是InnoDB存储引擎层的日志,又称重做日志文件,用于记录事务操作的变化,记录的是数据页的物理修改(数据修改之后的值),不管事务是否提交都会记录下来.在实例和介质失败(media failure)时,redo log文件就能派上用场,如数据库掉电,InnoDB存储引擎会使用redo log恢复提交后的物理数据页(恢复数据页,且只能恢复到最后一次提交的位置),以此来保证数据的完整性.redo log日志的大小是固定的,即记录满了以后就从头循环写
#### 作用
确保事务的持久性.防止在发生故障的时间点,尚有脏页未写入磁盘,在重启mysql服务的时候,根据redo log进行重做,从而达到事务的持久性这一特性.
#### Redo Log Buffer
　　　当一条SQL更新完Data Buffer的缓存页后,就会记录一条 redo log 日志,前面提到了redo log日志是存储在磁盘上的,那么此时是不是立马就将 redo log 日志写入磁盘呢？显然不是的,而是先写入一个叫做 redo log buffer 的缓存中,<font color='red'>redo log buffer 是一块不同于Data Buffer的内存缓存区,在 MySQL 启动的时候,向内存中申请的一块redo log内存区域(在电脑cpu中的内存,与Mysql实例内存同级,而data buffer 是处于申请Mysql实例内存后,在实例里的内存区域),它是 redo log 日志缓冲区,默认大小是 16MB,由参数 innodb_log_buffer_size 控制(前面的截图中可以看到)</font>
　　　redo log buffer内部又可以划分为许多 redo log block,每个 redo log block 大小为 512 字节.我们写入的 redo log 日志,最终实际上是先写入在 redo log buffer 的 redo log block 中,然后在某一个合适的时间点,将这条 redo log 所在的 redo log block 刷入到磁盘中.<font color='red'>这个合适的时间点究竟是什么时候呢？</font>查看下面Redo Log CheckPoint
#### WAL技术(Write Ahead logging)
&emsp;&emsp;具体到InnoDB中,Write-Ahead Log是Redo Log.在InnoDB中,不 光事务修改的数据库表数据是异步刷盘的,连Redo Log的写入本身也是 异步的.如图6-7所示,在事务提交之后, Redo Log先写入到内存中的 Redo Log Buffer中,然后异步地刷到磁盘上的Redo Log.
![RedoLog刷盘](/img/RedoLog刷盘.png "RedoLog刷盘")
&emsp;&emsp;MySQL 在更新数据时,为了减少磁盘的随机 IO,因此并不会直接更新磁盘上的数据,而是先更新 Data Buffer 中缓存页的数据,等到合适的时间点,再将这个缓存页持久化到磁盘.而 Data Buffer 中所有缓存页都是处于内存当中的,当 MySQL 宕机或者机器断电,内存中的数据就会丢失,因此 MySQL 为了防止缓存页中的数据在更新后出现数据丢失的现象,引入了redo log 机制.
&emsp;&emsp;当进行增删改操作时,MySQL 会在更新 Data Buffer 中的缓存页数据时,会记录一条对应操作的 redo log 日志,这样如果出现 MySQL 宕机或者断电时,如果有缓存页的数据还没来得及刷入磁盘,那么当 MySQL 重新启动时,可以根据 redo log 日志文件,进行数据重做,将数据恢复到宕机或者断电前的状态,保证了更新的数据不丢失,因此redo log又叫做重做日志.它的本质是保证事务提交后,更新的数据不丢失.
&emsp;&emsp;redo log日志文件是持久化在磁盘上的,磁盘上可以有多个redo log文件,MySQL 默认有 2 个 redo log 文件,每个文件大小为 48MB,这两个文件默认存放在 MySQL 数据目录的文件夹下,这两个文件分别为 ib_logfile0 和 ib_logfile1.(本人电脑上安装的 MySQL 时,指定存放数据的目录是:/usr/local/mysql/data,因此这两个 redo log 文件所在的磁盘路径分别是:/usr/local/mysql/data/ib_logfile0 和/usr/local/mysql/data/ib_logfile1).可以通过如下命令来查看 redo log 文件相关的配置.

* <font color='red'>查询命令:show variables like 'innodb_log%'</font>
![redo_log设置参数](/img/redo_log设置参数.png "redo_log设置参数")
* innodb_log_files_in_group 表示的是有几个 redo log 日志文件.
* innodb_log_file_size 表示的是每个 redo log 日志文件的大小为多大.
* innodb_log_group_home_dir 表示的是 redo log 文件存放的目录,在这里./表示的是相对于 MySQL 存放数据的目录,这些参数可以根据实际需要自定义修改.

### Undo Log(回滚日志)
#### 定义
逻辑格式的日志,在执行undo的时候,仅仅是将数据从逻辑上恢复至事务之前的状态,而不是从物理页面上操作实现的,这一点是不同于redo log的.
* 什么时候产生:事务开始之前,将当前是的版本生成undo log,undo 也会产生 redo 来保证undo log的可靠性
* 什么时候释放:当事务提交之后,undo log并不能立马被删除,而是放入待清理的链表,由purge线程判断是否由其他事务在使用undo段中表的上一个事务之前的版本信息,决定是否可以清理undo log的日志空间.
#### 作用
保存了事务发生之前的数据的一个版本,可以用于回滚,同时可以提供多版本并发控制下的读(MVCC),也即非锁定读
#### 不同版本物理文件
* MySQL5.6之前,undo表空间位于共享表空间的回滚段中,共享表空间的默认的名称是ibdata,位于数据文件目录中.
* MySQL5.6之后,undo表空间可以配置成独立的文件,但是提前需要在配置文件中配置,完成数据库初始化后生效且不可改变undo log文件的个数
如果初始化数据库之前没有进行相关配置,那么就无法配置成独立的表空间了.
*关于MySQL5.7之后的独立undo 表空间配置参数如下:
&emsp;&emsp;innodb_undo_directory = /data/undospace/ –undo独立表空间的存放目录
&emsp;&emsp;innodb_undo_logs = 128 –回滚段为128KB
&emsp;&emsp;innodb_undo_tablespaces = 4 –指定有4个undo log文件
如果undo使用的共享表空间,这个共享表空间中又不仅仅是存储了undo的信息,共享表空间的默认为与MySQL的数据在相同目录下面,其属性由参数innodb_data_file_path配置.

undo是在事务开始之前保存的被修改数据的一个版本,产生undo日志的时候,同样会伴随类似于保护事务持久化机制的redolog的产生.默认情况下undo文件是保持在共享表空间的,也即ibdatafile文件中,当数据库中发生一些大的事务性操作的时候,要生成大量的undo信息,全部保存在共享表空间中的.因此共享表空间可能会变的很大,默认情况下,也就是undo 日志使用共享表空间的时候,被“撑大”的共享表空间是不会也不能自动收缩的.因此,mysql5.7之后的“独立undo 表空间”的配置就显得很有必要了

### Bin Log(备份日志)
#### 定义
逻辑格式的日志,可以简单认为就是执行过的事务中的sql语句.但又不完全是sql语句这么简单,而是包括了执行的sql语句(增删改)反向的信息,也就意味着delete对应着delete本身和其反向的insert；update对应着update执行前后的版本的信息；insert对应着delete和insert本身的信息.
在使用mysqlbinlog解析binlog之后一些都会真相大白.因此可以基于binlog做到类似于oracle的闪回功能,其实都是依赖于binlog中的日志记录.
* 格式1:statement格式,记原始的SQL语句, insert/delete/update.
* 格式2:RAW格式,记录每张表的每条记录的修 改前的值、修改后的值,类似(表,行,修改前的值,修改后的值).
* 什么时候产生:事务提交的时候,一次性将事务中的sql语句(一个事物可能对应多个sql语句)按照一定的格式记录到binlog中.这里与redo log很明显的差异就是redo log并不一定是在事务提交的时候刷新到磁盘,redo log是在事务开始之后就开始逐步写入磁盘.因此对于事务的提交,即便是较大的事务,提交(commit)都是很快的,但是在开启了bin_log的情况下,对于较大事务的提交,可能会变得比较慢一些.这是因为binlog是在事务提交的时候一次性写入的造成的,这些可以通过测试验证.
* 什么时候释放:binlog的默认是保持时间由参数expire_logs_days配置,也就是说对于非活动的日志文件,在生成时间超过expire_logs_days配置的天数之后,会被自动删除.
#### 作用
1.用于复制,在主从复制中,从库利用主库上的binlog进行重播,实现主从同步. 
2.用于数据库的基于时间点的还原.
#### 物理文件
配置文件的路径为:show variables like  "log_bin_basename";
binlog日志文件按照指定大小,当日志文件达到指定的最大的大小之后,进行滚动更新,生成新的日志文件.对于每个binlog日志文件,通过一个统一的index文件来组织

### Redo Log && Bin Log区别
* 日志层级不同:binlog 记录的是逻辑日志,是 MySQL 的 Server 层记录的;redo log 中记录的是物理日志,是 InnoDB 引擎记录的.
* 记录内容不同:binlog 中记录的是 SQL 语句(实际上并不一定为 SQL 语句,这与 binlog 的格式有关,如果指定的是 STATEMENT 格式,那么 binlog 中记录的就是 SQL 语句),也就是逻辑日志;redo log 中则记录的是对磁盘上的某个表空间的某个数据页的某一行数据的某个字段做了修改,修改后的值为多少,它记录的是对物理磁盘上数据的修改,因此称之为物理日志.
* 清理机制不同:两者日志产生的时间,可以释放的时间,在可释放的情况下清理机制,都是完全不同的
* 效率不同:恢复数据时候的效率,基于物理日志的redo log恢复数据的效率要高于语句逻辑日志的binlog
* 大小不同:redo log是循环写,日志空间大小固定；binlog是追加写,是指一份写到一定大小的时候会更换下一个文件,不会覆盖.
* 作用意义:binlog可以作为恢复数据使用,主从复制搭建,redo log作为异常宕机或者介质故障后的数据恢复使用.

### CheckPoint(同步/归档)磁盘时间点
#### Redo Log Buffer(Log Buffer)
1.MySQL 正常关闭的时候;
2.MySQL 的后台线程每隔一段时间定时的讲 redo log buffer 刷入到磁盘,默认是每隔 1s 刷一次;
3.当 redo log buffer 中的日志写入量超过 redo log buffer 内存的一半时,即超过 8MB 时,会触发 redo log buffer 的刷盘;
4.当事务提交时,Redo log根据配置的参数 innodb_flush_log_at_trx_commit 来决定是否刷盘.
* show variables like "innodb_flush_log_at_trx_commit";
    * I.参数配置为 0:跟事务提交无关,由mysql的main_thread每秒将 存储引擎log buffer中的redo日志写入到log file,并调用文件系统的fsync()刷新操作,将日志刷新到磁盘;<font color ='red'>存在一秒停顿才更新,如果断电可能存在丢失一秒的事务数据</font>
    * II.参数配置为 1:每次事务提交时,将存储引擎log buffer中的redo日志写入到log file,并调用文件系统的fsync()刷新操作,将日志刷新到磁盘;(这个最安全)
    * III.参数配置为 2:每次事务提交时,将存储引擎log buffer中的redo日志写入到log file,并由存储引擎的main_thread 每秒将调用文件系统的fsync()刷新操作,将日志刷新到磁盘.由于日志只是写进缓存里,每秒才fsync()刷新,宕机存在丢失一秒内缓存数据的
    <font color='red'>(进程在向磁盘写入数据时,是先将数据写入到操作系统的缓存中:os cache,再调用 fsync()刷新操作,才会将数据从 os cache 中刷新到磁盘上)</font>

![Redo-log-checkpoint](/img/Redo-log-checkpoint.jpg "Redo-log-checkpoint")
这是一组4个文件的redo log日志,checkpoint之前表示擦除完了的,即可以进行写的,擦除之前会更新到磁盘中,write pos是指写的位置,当write pos和checkpoint相遇的时候表明redo log已经满了,这个时候数据库停止进行数据库更新语句的执行,转而进行redo log日志同步到磁盘中log file.

##### Data Buffer
checkpoint是为了定期将db buffer的内容刷新到data file.当遇到内存不足、db buffer已满等情况时,需要将db buffer中的内容/部分内容(特别是脏数据)转储到data file中.在转储时,会记录checkpoint发生的‘时刻’.在故障回复时候,只需要redo/undo最近的一次checkpoint之后的操作.
#### Bin Log Buffer(Log Buffer)
sync_binlog参数来控制数据库的binlog刷到磁盘上去
show variables like "sync_binlog";
* I.设置为0,事务提交后,将二进制日志从缓冲写入磁盘,但是不进行刷新操作(fsync()),<font color ='red'>若操作系统宕机则会丢失部分二进制日志.</font>
* II.设置为1,每提交一次事务,存储引擎调用文件系统的fsync()刷新操作进行一次缓存的刷新,这种方式最安全,但性能较低.
* III.设置为N时,每写N次操作,存储引擎调用文件系统的fsync()刷新操作进行一次缓存的刷新.

默认,sync_binlog=0,表示MySQL不控制binlog的刷新,由文件系统自己控制它的缓存的刷新.这时候的性能是最好的,但是风险也是最大的.因为一旦系统Crash,在binlog_cache中的所有binlog信息都会被丢失.

如果sync_binlog>0,表示每sync_binlog次事务提交,MySQL调用文件系统的刷新操作将缓存刷下去.最安全的就是sync_binlog=1了,表示每次事务提交,MySQL都会把binlog刷下去,是最安全但是性能损耗最大的设置.这样的话,在数据库所在的主机操作系统损坏或者突然掉电的情况下,系统才有可能丢失1个事务的数据.但是binlog虽然是顺序IO,但是设置sync_binlog=1,多个事务同时提交,同样很大的影响MySQL和IO性能.虽然可以通过group commit的补丁缓解,但是刷新的频率过高对IO的影响也非常大.对于高并发事务的系统来说,“sync_binlog”设置为0和设置为1的系统写入性能差距可能高达5倍甚至更多.所以很多MySQL DBA设置的sync_binlog并不是最安全的1,而是100或者是0.这样牺牲一定的一致性,可以获得更高的并发和性能.

### 数据库执行过程Log工作机制
1.MySQL Server 层的执行器调用 InnoDB 存储引擎的数据更新接口;
2.存储引擎更新 Data Buffer中的缓存页,
3.同时存储引擎记录一条 redo log 到 redo log buffer 中,并将该条 redo log 的状态标记为 prepare 状态;
4.接着存储引擎告诉执行器,可以提交事务了.执行器接到通知后,会写 binlog 日志,然后提交事务;
5.存储引擎接到提交事务的通知后,将 redo log 的日志状态标记为 commit 状态;
6.接着根据 innodb_flush_log_at_commit 参数的配置,决定是否将 redo log buffer 中的日志刷入到磁盘.

* <font color='red'>为什么没有写data file,事务就提交了？</font>
&emsp;&emsp;在数据库的世界里,数据从来都不重要,日志才是最重要的,有了日志就有了一切.因为data buffer中的数据会在合适的时间 由存储引擎写入到data file,如果在写入之前,数据库宕机了,根据落盘的redo日志,完全可以将事务更改的数据恢复.好了,看出日志的重要性了吧.先持久化日志的策略叫做Write Ahead Log,即预写日志.
&emsp;&emsp;关于事务提交时,redo log和binlog的写入顺序,为了保证主从复制时候的主从一致(当然也包括使用binlog进行基于时间点还原的情况),是要严格一致的,MySQL通过两阶段提交过程来完成事务的一致性的,也即redo log和binlog的一致性的,理论上是先写redo log,再写binlog,两个日志都提交成功(刷入磁盘),事务才算真正的完成.

#### 如何保证数据不丢失
　　将 redo log 日志标记为 prepare 状态和 commit 状态,这种做法称之为两阶段事务提交,它能保证事务在提交后,数据不丢失.为什么呢？redo log 在进行数据重做时,只有读到了 commit 标识,才会认为这条 redo log 日志是完整的,才会进行数据重做,否则会认为这个 redo log 日志不完整,不会进行数据重做.
　　例如,如果在 redo log 处于 prepare 状态后,Data Buffer中的缓存页(脏页)也还没来得及刷入到磁盘,写完 biglog 后就出现了宕机或者断电,此时提交的事务是失败的,那么在 MySQL 重启后,进行数据重做时,在 redo log 日志中由于该事务的 redo log 日志没有 commit 标识,那么就不会进行数据重做,磁盘上数据还是原来的数据,也就是事务没有提交,这符合我们的逻辑.
    <font color='red'>实际上要严格保证数据不丢失,必须得保证 innodb_flush_log_at_trx_commit 配置为 1</font>
　　从效率上来说,0 的效率最高,因为不涉及到磁盘 IO,但是会丢失数据;而 1 的效率最低,但是最安全,不会丢失数据.2 的效率居中,会丢失数据.在实际的生产环境中,通常要求是的是“双 1 配置”,即将 innodb_flush_log_at_trx_commit 设置为 1,另外一个 1 指的是写 binlog 时,将 sync_binlog 设置为 1,这样 binlog 的数据就不会丢失.<font color='red'>在mysqld 服务崩溃或者服务器主机crash的情况下,binary log 只有可能丢失最多一个语句或者一个事务.但是鱼与熊掌不可兼得,双1,1 会导致频繁的io操作,因此该模式也是最慢的一种方式.</font>实际使用时,要考虑业务方对性能和安全性的需求,综合考量设置,两个参数.上图中是我们线上机器的参数.

#### 为什么引入Redo Log这一机制?
　　有人可能会想,既然生产环境一般建议将 innodb_flush_log_at_trx_commit 设置为 1,也就是说每次更新数据时,最终还是要将 redo log 写入到磁盘,也就是还是会发生一次磁盘 IO,而我为什么不直接停止使用 redo log,而在每次更新数据时,也不要直接更新内存了,直接将数据更新到磁盘,这样也是发生了一次磁盘 IO,何必引入 redo log 这一机制呢？
　　首先引入 redo log 机制是十分必要的.因为写 redo log 时,我们将 redo log 日志追加到文件末尾,虽然也是一次磁盘 IO,但是这是顺序写操作(不需要移动磁头);而对于直接将数据更新到磁盘,涉及到的操作是将 buffer pool 中缓存页写入到磁盘上的数据页上,由于涉及到寻找数据页在磁盘的哪个地方,这个操作发生的是随机写操作(需要移动磁头),相比于顺序写操作,磁盘的随机写操作性能消耗更大,花费的时间更长,因此 redo log 机制更优,能提升 MySQL 的性能.
　　从另一方面来讲,通常一次更新操作,我们往往只会涉及到修改几个字节的数据,而如果因为仅仅修改几个字节的数据,就将整个数据页写入到磁盘(无论是磁盘还是 buffer pool,他们管理数据的单位都是以页为单位),这个代价未免也太了(每个数据页默认是 16KB),而一条 redo log 日志的大小可能就只有几个字节,因此每次磁盘 IO 写入的数据量更小,那么耗时也会更短.综合来看,redo log 机制的引入,在提高 MySQL 性能的同时,也保证了数据的可靠性.

#### 总结
```
1.MySQL 有四大特性:ACID,其中 D 指的是持久性(Durability),它的含义是 MySQL 的事务一旦提交,它对数据库的改变是持久性的,即数据不会丢失,那么 MySQL 究竟是如何实现的呢？
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
