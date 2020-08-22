---
title: 存储过程百万级别优化
tags: [Procedure,Sql,Database]
categories: [Oracle]
---

## 存储过程优化步骤以及记录
### 优化步骤
* 定位并使用执行计划分析存储过程
* 查看表数据量和定义
* 改写sql查看执行计划
    考虑update开并行
    应用bulk collect优化

### 优化百万级别记录
#### 取消游标使用bulk collect优化
1.定位并使用执行计划分析存储过程
![procedure1](/img/procedure1.png "procedure1")
![procedure2](/img/procedure2.png "procedure2")
执行计划分析存储
![procedure3](/img/procedure3.png "procedure3")
<font color="red">发现update部分耗时比较多</font>
2.查看表数据量和定义
查看数量级为144万
![procedure4](/img/procedure4.png "procedure4")
表定义如下：
![procedure5](/img/procedure5.png "procedure5")

3.改写sql查看执行计划
<font color="red">因为update部分耗时比较多，所以考虑改写成select看有没走索引</font>
```
 //用了索引范围扫描
select updatetime，sendtootm from Tab_TempDriverScan
 where ScanWay = '1' and ShipmentNumber = v_shipmentnumber and LPN = idx.LPN and SKU = idx.SKU;
```
![procedure6](/img/procedure6.png "procedure6")

4.考虑update开并行
```
update /*+ parallel(Tab_TempDriverScan,8) */ Tab_TempDriverScan set UpdateTime = SYSDATE, SendToOTM = '1'
 where ScanWay = '1' and ShipmentNumber = v_shipmentnumber and LPN = idx.LPN and SKU = idx.SKU;
```
<font color="red">减少了12秒，但是还不是很理想</font>
![procedure7](/img/procedure7.png "procedure7")

5.应用bulk collect优化
改写如图
![procedure8](/img/procedure8.png "procedure8")
核心脚本
```
TYPE Tab_TempDriverScan_rec_type IS RECORD --声明记录类型
 (
 v_shipmentnumber Tab_TempDriverScan.shipmentnumber%TYPE,
 v_power_unit Tab_TempDriverScan.power_unit%TYPE,
 v_IsSend Tab_TempDriverScan.IsSend%TYPE);
 TYPE nested_Tab_TempDriverScan_type IS TABLE OF Tab_TempDriverScan_rec_type; --声明记录类型变量
 Tab_TempDriverScan_tab nested_Tab_TempDriverScan_type;
...................
LOOP
 fetch header1 BULK COLLECT
 into Tab_TempDriverScan_tab; --应用bulk collect
 EXIT WHEN header1%NOTFOUND;
........................
```
测试分析
![procedure9](/img/procedure9.png "procedure9")
<font color="red">这时候时间只需要0.06秒，性能获得了很大提升</font>

### bulk collect用法小结
采用bulk collect可以将查询结果一次性地加载到collections中，而不是通过cursor一条一条地处理。
可以在select into,fetch into,returning into语句使用bulk collect。
注意：在使用bulk collect时，所有的into变量都必须是collections

```
create table t_test as
  select object_id, object_name, object_type
    from dba_objects
   where wner = 'TEST';
```

#### 在select into语句中使用bulk collect

```
declare
  type object_list is table of t_test.object_name%type;
  objs object_list;
begin
  select object_name bulk collect
    into objs
    from t_test
   where rownum <= 100;
  for r in objs.first .. objs.last loop
    dbms_output.put_line(' objs(r)=' || objs(r));
  end loop;
end;
/
```

#### 在fetch into中使用bulk collect
```
declare
  type objecttab is table of t_test%rowtype;
  objs objecttab;
  cursor cob is
    select object_id, object_name, object_type
      from t_test
     where rownum <= 10;
begin
  open cob;
  fetch cob bulk collect
    into objs;
  close cob;
  for r in objs.first .. objs.last loop
    dbms_output.put_line(' objs(r)=' || objs(r).object_name);
  end loop;
end;
/
```
以上为把结果集一次fetch到collect中，我们还可以通过limit参数，来分批fetch数据，如下：
```
declare
  type objecttab is table of t_test%rowtype;
  objs objecttab;
  cursor cob is
    select object_id, object_name, object_type
      from t_test
     where rownum <= 10000;
begin
  open cob;
  loop
    fetch cob bulk collect
      into objs limit 1000;
    exit when cob%notfound;
    dbms_output.put_line('count:' || objs.count || ' first:' || objs.first ||
                         ' last:' || objs.last);
    for r in objs.first .. objs.last loop
      dbms_output.put_line(' objs(r)=' || objs(r).object_name);
    end loop;
  end loop;
  close cob;
end;
/
```
可以根据实际来调整limit参数的大小，来达到最优的性能。limit参数会影响到PGA的使用率。
#### 在returning into中使用bulk collect
```
declare
  type id_list is table of t_test.object_id%type;
  ids id_list;
  type name_list is table of t_test.object_name%type;
  names name_list;
begin
  delete from t_test
   where object_id <= 87510 returning object_id, object_name bulk collect into ids,
   names;
  dbms_output.put_line('deleted ' || sql%rowcount || ' rows:');
  for i in ids.first .. ids.last loop
    dbms_output.put_line('object #' || ids(i) || ': ' || names(i));
  end loop;
end;
```

#### 用于动态语句
```
declare
v_query_sql   varchar2(500);
type type_emp_table is table of emp%rowtype index by binary_integer;
v_emp_table type_emp_table;
begin
   v_query_sql := 'select * from emp';
   execute immediate v_query_sql bulk collect into v_emp_table;
   forall i in 1..v_emp_table.count
    insert into emp_bak values v_emp_table(i);
end;
```
```
 declare
v_query_sql   varchar2(500);
type type_emp_table is table of emp%rowtype index by binary_integer;
v_emp_table type_emp_table;
type type_ename_table is table of emp.ename%type index by binary_integer;
v_ename_table type_ename_table;
begin
   update emp set flag=1 where deptno=20 returning flag bulk collect into v_ename_table;   
    for i in 1..v_ename_table.count loop
       dbms_output.put_line(v_ename_table(i));
   end loop;
end;
```


