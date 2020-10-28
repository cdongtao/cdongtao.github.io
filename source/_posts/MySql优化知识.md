
---
title: MySql优化知识
tags: [Mysql,面试知识,Mysql优化]
categories: [Database]
---
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

## MySQL查看执行计划
MySQL 使用 explain + sql 语句查看 执行计划
* EXPLAIN SELECT * FROM user WHERE nid = 3;

![Mysql-Explain](/img/Mysql-Explain.png "Mysql-Explain")
其中最重要的字段为:id、type、key、rows、Extra

### 字段解析
#### id
select查询的序列号,包含一组数字,表示查询中执行select子句或操作表的顺序

* id相同:执行顺序由上至下
![explain-id1](/img/explain-id1.png "id1")

* id不同:如果是子查询,id的序号会递增,id值越大优先级越高,越先被执行 
![explain-id2](/img/explain-id2.png "id2")

* id存在部分相同(两种情况同时存在):id如果相同,可以认为是一组,从上往下顺序执行；在所有组中,id值越大,优先级越高,越先执行 
![explain-id3](/img/explain-id3.png "id3")

#### select_type
* SIMPLE:简单的select查询,查询中不包含子查询或者union
* PRIMARY:查询中包含任何复杂的子部分,最外层查询则被标记为primary
* SUBQUERY:在select 或 where列表中包含了子查询
* DERIVED:在from列表中包含的子查询被标记为derived(衍生),mysql或递归执行这些子查询,把结果放在零时表里 
* UNION:若第二个select出现在union之后,则被标记为union；若union包含在from子句的子查询中,外层select将被标记为derived 
* UNION RESULT:使用union查询后的结果
![explain-union-result](/img/explain-union-result.png "union-result")

#### type
&emsp;&emsp;system:表仅有一行(系统表).这是const联接类型的一个特例
&emsp;&emsp;const:常量,表最多有一个匹配行,因为仅有一行,在这行的列值可被优化器剩余部分认为是常数,const表很快,因为它们只读取一次
&emsp;&emsp;eq_ref:搜索时使用primary key 或 unique类型
&emsp;&emsp;ref:根据索引查找一个或多个值
&emsp;&emsp;index_merge:合并索引,使用多个单列索引搜索
&emsp;&emsp;range:对索引列进行范围查找
&emsp;&emsp;index:全索引表扫描
&emsp;&emsp;ALL:全数据表扫描

访问类型,sql查询优化中一个很重要的指标,结果值从好到坏的性能依次是
* <font color='red'>system/const > eq_ref > ref > ref_or_null > index_merge > range > index > all,性能在 range 之下基本都可以进行调优</font>

* 1.system:表只有一行记录(等于系统表),这是const类型的特例,平时不会出现,可以忽略不计
* 2.const:表示通过索引一次就找到了,const用于比较primary key 或者 unique索引.因为只需匹配一行数据,所有很快.如果将主键置于where列表中,mysql就能将该查询转换为一个const
![explain-system-const](/img/explain-system-const.png "explain-system-const")
* 3.eq_ref:唯一性索引扫描，对于每个索引键，表中只有一条记录与之匹配.常见于主键 或 唯一索引扫描.
![explain-eq_ref](/img/explain-eq_ref.png "explain-eq_ref")
注意:ALL全表扫描的表记录最少的表如t1表
* 4.ref:非唯一性索引扫描，返回匹配某个单独值的所有行.本质是也是一种索引访问，它返回所有匹配某个单独值的行，然而他可能会找到多个符合条件的行，所以它应该属于查找和扫描的混合体 
![explain-ref](/img/explain-ref.png "explain-ref")
* 5.range:只检索给定范围的行，使用一个索引来选择行.key列显示使用了那个索引.一般就是在where语句中出现了bettween、<、>、in等的查询.这种索引列上的范围扫描比全索引扫描要好.只需要开始于某个点，结束于另一个点，不用扫描全部索引 
![explain-range](/img/explain-range.png "explain-range")
* 6.index:Full Index Scan，index与ALL区别为index类型只遍历索引树.这通常为ALL块，应为索引文件通常比数据文件小.(Index与ALL虽然都是读全表，但index是从索引中读取，而ALL是从硬盘读取)
![explain-index](/img/explain-index.png "explain-index")
* 7.ALL:Full Table Scan，遍历全表以找到匹配的行 
![explain-all](/img/explain-all.png "explain-all")

#### ref
ref:显示索引的那一列被使用了，如果可能，是一个常量const.

#### rows
rows:根据表统计信息及索引选用情况，大致估算出找到所需的记录所需要读取的行数

#### table
table:正在访问的表名

#### possible_keys && Key
possible_keys:查询涉及到的字段上存在索引，则该索引将被列出，但不一定被查询实际使用
key:实际使用的索引,如果为NULL,则没有使用索引.查询中如果使用了覆盖索引，则该索引仅出现在key列表中
![explain-key](/img/explain-key.png "explain-key")

#### key_len
key_len:表示索引中使用的字节数，查询中使用的索引的长度(最大可能长度)，并非实际使用长度，理论上长度越短越好.key_len是根据表定义计算而得的，不是通过表内检索出的

#### limit
limit:匹配后就不会继续进行扫描

#### extra
extra:不适合在其他字段中显示，但是十分重要的额外信息
* Using filesort:mysql会对结果使用一个外部索引排序,而不是按索引次序从表里读取行,也就是说mysql无法利用索引完成的排序操作成为“文件排序” .mysql有两种文件排序算法,这两种排序方式都可以在内存或者磁盘上完成,explain不会告诉你mysql将使用哪一种文件排序,也不会告诉你排序会在内存里还是磁盘上完成.
![explain-Using-filesort](/img/explain-Using-filesort.png "explain-Using-filesort")
由于索引是先按email排序、再按address排序，所以查询时如果直接按address排序，索引就不能满足要求了，mysql内部必须再实现一次“文件排序”

* Using temporary:mysql 对查询结果排序时会使用临时表.
使用临时表保存中间结果，也就是说mysql在对查询结果排序时使用了临时表，常见于order by 和 group by 
![explain-Using-temporary](/img/explain-Using-temporary.png "Using-temporary")

* Using index:此值表示mysql将使用覆盖索引,以避免访问表.表示相应的select操作中使用了覆盖索引(Covering Index)，避免了访问表的数据行，效率高 
如果同时出现Using where，表明索引被用来执行索引键值的查找(参考上图);如果没用同时出现Using where，表明索引用来读取数据而非执行查找动作
![explain-Using-index](/img/explain-Using-index.png "Using-index")

Covering Index:覆盖索引,也叫索引覆盖.就是select列表中的字段，只用从索引中就能获取，不必根据索引再次读取数据文件，换句话说查询列要被所建的索引覆盖. 
注意: 
a、如需使用覆盖索引，select列表中的字段只取出需要的列，不要使用select * 
b、如果将所有字段都建索引会导致索引文件过大，反而降低crud性能

* Range checked for each record(index map: N):没有好用的索引,新的索引将在联接的每一行上重新估算,N是显示在possible_keys列中索引的位图,并且是冗余的

* Impossible WHERE:where子句的值总是false，不能用来获取任何元祖
![explain-Impossible-where](/img/explain-Impossible-where.png "explain-Impossible-where")

* Using where :mysql 将在存储引擎检索行后再进行过滤,许多where条件里涉及索引中的列,当(并且如果)它读取索引时,就能被存储引擎检验,因此不是所有带where子句的查询都会显示“Using where”.有时“Using where”的出现就是一个暗示:查询可受益于不同的索引.

* Using join buffer :使用了链接缓存

* select tables optimized away :在没有group by子句的情况下，基于索引优化MIN/MAX操作或者对于MyISAM存储引擎优化COUNT(*)操作，不必等到执行阶段在进行计算，查询执行计划生成的阶段即可完成优化

* distinct :优化distinct操作，在找到第一个匹配的元祖后即停止找同样值得动作

#### 综合Case
![explain-综合Case](/img/explain-综合Case.png "explain-综合Case")
执行顺序 
* 1.(id = 4)[select id, name from t2]:select_type 为union，说明id=4的select是union里面的第二个select.
* 2.(id = 3)、[select id, name from t1 where address = ‘11’]:因为是在from语句中包含的子查询所以被标记为DERIVED(衍生)，where address = ‘11’ 通过复合索引idx_name_email_address就能检索到，所以type为index.
* 3.(id = 2)、[select id from t3]:因为是在select中包含的子查询所以被标记为SUBQUERY.
* 4.(id = 1)、[select d1.name, … d2 from … d1]:select_type为PRIMARY表示该查询为最外层查询，table列被标记为 “derived3”表示查询结果来自于一个衍生表(id = 3 的select结果).
* 5.(id = NULL)、[ … union … ]:代表从union的临时表中读取行的阶段，table列的 “union 1, 4”表示用id=1 和 id=4 的select结果进行union操作.