---
title: JaveScript基础语法
tags: [JaveScript]
categories: [FrontEnd]
---

## 数据类型
### 6种数据类型
Object类型(对象)：Function,Array,Date,RegExp...
原始类型(5种)：number,String,boolean,null,undefine

### 隐式转换
如果存在隐式转换,转换时可能存在临时变量


#### + 与 -
+：字符串+数字-->返回字符串
-：字符串-数字-->返回数字

####  == 与 ===(绝对等号)
使用 == 返回true:两边类型自动发生隐式转换,转换完成再比较
    
    "123" == 123 ：数字转字符串
    0 == false：0转为false
    null == undefined
    new Object() == new Object():
    [1,2] == [1,2]

使用 ===:两边类型不发生隐式转换，直接比较两边类型以及内容

   特殊：NaN 与 NaN自身比较都不相等

判断对象是否相等：JS是使用引用判断,两个空对象比较也不是相同的对象 


### 5种检测类型
1.typeof :适合基本类型判断 注：typeof null === "object"  
2.instanceof : 适合判断对象 [1,2] instanceof Array//不同iframe与window判断失效
3.Object.prototype.toString :遇到null与undefined失效(IE678返回object)
4.constructor :
5.duck type :取对象的特征：如数组类型取length或者push这些函数方法


## 对象
对象中包含一系列属性,这些属性是无序的。每个属性都有一个字符串key和对应的value。
### 创建对象

    1.空对象添加属性:var obj = new Object();(var obj={};)obj.x =1;obj.y=2;
    2.函数式对象声明:function obj(){x=1,y=2};默认带有prototype指向原型链（类似继承的父类）的对象属性

#### (new/原型链)创建对象
![原型链](/img/原型链.png "原型链")

    1.当赋值时，会直接给当前对象添加属性；//A.原型链上没有对应属性set或get方法存在,否则当前属性不会添加到当前对象；B.原型链指向对应属性不可操作，需要用定义对象属性标签的方法来给这个对象添加属性(见下面A/B两图)
    2.delete可以删除当前对象的属性,而不会删原型链上的属性
    3.读取属性值时,如果当前对象没有该属性就向上(原型链)查找；
    4.遍历方法in：包括当前对象以及原型链 或Object.keys(对象)遍历对象所有可枚举属性
    5.obj.hasOwnProperty('w'):只判断当前对象中是否存在'w'属性

A.原型链上没有对应属性set或get方法存在,也需要给当前对象添加一样属性
![set或get与原型链关系](/img/set或get与原型链关系.png "set或get与原型链关系")

B.原型链指向对应属性不可操作,也需要给当前对象添加一样属性
![原型链属性不可操作](/img/原型链属性不可操作.png "原型链属性不可操作")



#### Object.create创建对象
![create方式创建对象](/img/create方式创建对象.png "create方式创建对象")

    注:obj的原型链是指向使用create时的对象{x:1}(Create就是为obj定义指向的原型链对象):为null对象时，null对象没有向上原型链

#### 控制对象属性的标签
![属性标签](/img/属性标签.png "属性标签")

属性访问权限的控制的属性标签：writable(控制是否可写),enumerable(设置遍历是否被读到),configuralbe(控制是否被删除),value,get/set
获取某个对象里的属性所有标签对象：

    var descriptor =Object.getOwnPropertyDescriptor(Object,'prototype');
    descriptor.configurable;//false 不允许删除

设置对象某个属性标签
![定义对象属性标签](/img/定义对象属性标签.png "定义对象属性标签")

属性标签组合作用：
![属性标签组合作用](/img/属性标签组合作用.png "属性标签组合作用")

#### 对象标签
1.原型链标签；获取类的原型链类:var pro = obj._proto_;
2.class标签：

    var toString = Object.prototype.toString;
    function getType(o){return toString.call(o).slice(8,-1);};//slice截取方法
3.extensible标签

    var obj = {x : 1, y : 2};
    Object.isExtensible(obj); //true是否可以继承
    Object.preventExtensions(obj);//阻止继承
    Object.isExtensible(obj); // false
    obj.z = 1;
    obj.z; // undefined, add new property failed
    Object.getOwnPropertyDescriptor(obj, 'x');
    // Object {value: 1, writable: true, enumerable: true, configurable: true}

    Object.seal(obj);//阻止扩展且不可修改:在preventExtensions基础上防止删除
    Object.getOwnPropertyDescriptor(obj, 'x');
    // Object {value: 1, writable: true, enumerable: true, configurable: false}
    Object.isSealed(obj); // true

    Object.freeze(obj);//不可写,不可改,不可删
    Object.getOwnPropertyDescriptor(obj, 'x');
    // Object {value: 1, writable: false, enumerable: true, configurable: false}
    Object.isFrozen(obj); // true

4.序列化

    var obj = {x : 1, y : true, z : [1, 2, 3], nullVal : null};
    JSON.stringify(obj); // "{"x":1,"y":true,"z":[1,2,3],"nullVal":null}"
    
    1.//对象转Json:undefined转化后不出现,NaN转化后变为null,注意时间格式
    obj = {val : undefined, a : NaN, b : Infinity, c : new Date()};
    JSON.stringify(obj); // "{"a":null,"b":null,"c":"2015-01-20T14:15:43.910Z"}"

    2.//json转对象
    obj = JSON.parse('{"x" : 1}');
    obj.x; // 1

    3.自定义对象转json格式
    var obj = {x : 1,y : 2,
        o : {o1 : 1,o2 : 2,
                toJSON : function () {
                    return this.o1 + this.o2;
                }
            }
    };
    JSON.stringify(obj); // "{"x":1,"y":2,"o":3}"

## 表达式与运算符
### 表达式
    表达式是一种JS短语,可以使JS解释器用来产生一个值。

1.原始表达式：

    常量，直接数值量，关键字，变量

2.初始化表达式：

    数组初始化：new Array(1,,,2) === [1,undefined,undefined,2];
    对象初始化：new Obeject()

3.函数表达式:
    
    常用：function name(){};//函数声明,不限制调用位置
    常用：var fun = function name(){};//函数表达式,必须在使用之前
    特殊：(function name(){};)();

4.属性访问表达式：
    
    var obj={x:1,y:2};  
    访问属性：obj['x'] === obj.x

5.函数调用表达式:
    
    使用函数名调用：func();

6.对象创建表达式：
    
    创建对象构造器:new Func(1,2);
    new Object();

### 运算符
1.一元运算符:+num
2.二元运算符:a+b
3.三元运算符：c?a:b

特殊运算符：
1.逗号运算符：逗号隔开表达式,从左到右依次计算表达式的值，取最右边的结果为运算结果

    var V=(1,2,3);//V =3;
2.delete 运算符:删除对象里的属性

    var obj = {x:1};
    delete obj.x;//返回true的含义：如果对象里有x属性就删除;或者对象本身不存在x；
    在IE9后存在对象定义属性值defineProperty标签
    //定义为fasle就不能用delete
    Object.defineProperty(obj,'x',{configurable:false,value:1});

3.in运算符

    window添加属性：(全局变量)
    winddow.x =1 ;
    //判断为true/false是否有这样的key
    var m = 'x' in window;

4.new运算符

    function Foo(){}//定义对象
    Foo.prototype.x=1;//添加x在对象原型链上
    var obj=new Foo();
    var value = obj.x;//1
    obj.hasOwnProperty('x');//false,判断对象本身属性
    obj._proto_.hasOwnProperty('x')//true,判断对象原型链上的属性
注：对象属性分本身定义属性与原型链上属性(属于原始类(最顶端)的属性类)

5.this(window浏览器/对象本身)

    var obj= {
        func:function(){
            return this;
        }
    }
    var va = obj.func;//返回obj对象本身(this)



## 语句
1.块级没有作用域

    for(var i=0,,){}
    var b = i;//能拿到i的值

    function foo(){
        var a =1;
    }
    foo();
    console.log(typeof a);//undifined,取不到值

2.var

    var a=b=1;//b被隐式创建全局变量
    function foo(){
        var a=b=1;
    }

    foo();
    console.log(typeof a);//'undefined'
    console.log(typeof b);//'number'

3.for...in

    var p
    var obj={x:1,y:2}
    for(p in obj){}
    1.顺序不确定
    2.如果遍历对象的属性有enumable为false时不会遍历到
    3.for in 受原型链影响,向上访问对象的原型链

## 数组

### 数组基本操作
1.定义数组:动态的，无需指定大小

    var arr = new Array[10];//只有一个参数为数组长度
    var arr = new Array[1,2];//arr = [1,2]

2.操作数组方法
arr.push('2');//数组最后追加,数组长度+1
arr.pop(); //数组最后一位被删,且数组长度-1
arr.unshift(0);//数组前面追加,数组长度+1
arr.shift(); //数组前面追加,数组长度-1

3.遍历数组

    for(var i = 0;..)
    设置原型链：Array.prototype.x 
    for(p in arr)//同样遍历原型链,通过arr.hasOwnProperty(i)判断

### 数组方法
创建出来的数组都会继承数组原型链(Array.prototype)上的方法:
    
    1.数组转字符串(原数组不改变):var arr = [1, 2, 3];
        arr.join(); // "1,2,3"；默认以逗号(,)将数组拼接为字符串
        arr.join("_"); // "1_2_3"
    2.反转(原数组改变)：arr.reverse(); // [3, 2, 1]
    3.排序(原数组改变):arr = [13, 24, 51, 3];
        arr.sort(); // [13, 24, 3, 51]
    自定义排序方法:arr.sort(function(a, b) {
                    return a - b;
                }); // [3, 13, 24, 51]
    4.合并(原数组不改变):var arr = [1, 2, 3];
    arr.    concat(4, 5); // [1, 2, 3, 4, 5]
    5.返回部分数组(原数组不改变):var arr = [1, 2, 3, 4, 5];
        arr.slice(1, 3); //(1, 3)左闭右开截取数组 [2, 3]
        arr.slice(-4, -3); // [2]
    6.返回部分数组(原数组改变):var arr = [1, 2, 3, 4, 5];
        arr.splice(2); // returns [3, 4, 5]   arr; // [1, 2];
        arr.splice(2, 2); // returns [3, 4]   arr; // [1, 2, 5];
        arr.splice(1, 1, 'a', 'b'); // returns [2]  arr; // [1, "a", "b", 3, 4, 5]
    7.for each遍历数组：
        var arr = [1, 2, 3, 4, 5];
        arr.forEach(function(x, index, a){
            //x为必需元素,index为可选数组下标,a为可选当前元素所属的数组对象
            console.log(x + '|' + index + '|' + (a === arr));
        });
    8.隐射(原数组不改变)：var arr = [1, 2, 3];
        arr.map(function(x) {
            //x为遍历数组的元素
            return x + 10;
        }); // [11, 12, 13]
    9.过滤(原数组不改变)：var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        arr.filter(function(x, index) {
            //x为元素标签,index为元素下标
            return index % 3 === 0 || x >= 8;
        }); // returns [1, 4, 7, 8, 9, 10]
    10.数组判断:var arr = [1, 2, 3, 4, 5];
        //数组每一个元素都满足返回true(类似与条件)
        arr.every(function(x) {
            return x < 10;
        }); // true
        //存在一个满足条件就返回true(类似或条件)
        arr.some(function(x) {
            return x === 3;
        }); // true
    11.累加器(原数组不改变)：var arr = [1, 2, 3];
        //x=1,y=2,返回值作为下次x的值3，y=3,依次累加
        var sum = arr.reduce(function(x, y) {
            return x + y
        }); // 6
    12.检索:arr.indexOf(a,b)//返回符合满足条件的元素下标
        a为检索的元素,b为检索下标开始位置
    13.判断数组
        [] instanceof Array; // true
        ({}).toString.apply([]) === '[object Array]'; // true
        [].constructor === Array; // true

## 函数及其作用域
函数既是对象也是函数
### 函数声明：

    函数声明被前置：与调用位置无关
    function add(a,b){}
### 函数表达式

    1.//函数赋值给变量：匿名函数(与调用位置有关)
    var add = function (a,b){}
    2.//少用:匿名式函数表达式(与调用位置有关)且存在兼容性问题
    var add = function foo(a,b){}
    3.//作为对象返回
    return function(){};
    4.//立即执行,(fun)()后面括号里可以传参执行或者不传
    (function add(a,b){return a+b;})(1,2);//返回3
   
###  函数构造器

    //(存在作用域问题,少用)
    new Function ('a','b','return a+b;');
    add(1,2);
    //可以立即执行new Function ('a','b','return a+b;')();

### this       
1.全局的this为window(浏览器)

    this.a=33;//(window.a === this.a) 
    
2.一般函数返回this对象为window对象(浏览器)

    function f(){return this;}//(f() === window)
    
3.方法里指向对象的this

    var o={prop:37,
        f:function(){
            return this.prop;//指向当前调用对象o的prop属性
        }};

    var o={prop:37};
    function fun(){
        //如果单独调用fun()函数,this返回的是window对象
        return this.prop;}
    //将fun()函数绑定给o对象
    o.f=fun;//此时调用o.f()则this返回o对象

4.对象原型链上的this

    var o={f:function(){return this.a+this.b}}
    var p= Object.create(o);//p原型链指向o对象
    p.a = 1;p.b = 4;
    

call/apply/bind

### 闭包现象


### 作用域

全局/函数/eval

作用域链


