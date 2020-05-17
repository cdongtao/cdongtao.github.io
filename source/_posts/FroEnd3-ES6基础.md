---
title: ES6(ECMAScript6)
tags: [ECMAScript6]
categories: [FrontEnd]
---

##  let && const关键字
const定义变量必须赋初始值，let不需要赋初始值
### let关键字作用

    1.let声明变量，没有变量提升
    2.是一个块作用域
    3.不能重复声明

### const关键字作用

    作用1:for循环是个经典例子
    const arr = [];
    //var i=0 与 let i =0 结果不一样
    for (let i = 0; i < 10; i++) {
        //数组存的是整个函数对象;
        arr[i] = function() {
            return i;
        }
    }
    //var i =0;var声明变为全局,导致每个函数最后取到i=10
    console.log(arr[5]());// var -> 10
    //let 声明只在当前的作用域有效
    console.log(arr[5]());// let->5

    作用2:不会污染全局变量
    let RegExp = 10;
    console.log(RegExp);
    console.log(window.RegExp);

    // 建议：在默认情况下用const,而只有在你知道变量值需要被修改的情况使用let

## 字符串模板
模板字符串（template string）是增强版的字符串，用反引号（`）标识。它可以当作普通字符串使用，也可以用来定义多行字符串，或者在字符串中嵌入变量。

     // 模板字符串：使用tab键上面的反引号``,插入变量时使用${变量名}
    const oBox = document.querySelector('.box');
    let id = 1,
    name = '小马哥';
    //JS
    // oBox.innerHTML = "<ul><li><p id=" + id + ">" + name + "</p></li></ul>";
    //ES6
    let htmlStr = `<ul>
        <li>
            <p id=${id}>${name}</p>
        </li>
    </ul>`;

    oBox.innerHTML = htmlStr;

## 函数
### 不同组件参数传递

     function calculateWinner(squaress) {
        //
     }

     handleClick = (num) => {
        //
     }
     
     //calculate={()=>calcuWinner} 返回传函数对象(地址)
     <Board calculate={()=>calcuWinner} squares={history.squares} onClick={num=>this.handleClick(num)} />
     
     //calculate={() => this.props.calculate(this.props.squares)} 返回一个函数对象(地址)
     <Square calculate={() => this.props.calculate(this.props.squares)} squares={this.props.squares}onClick={() => this.props.onClick(i)}/>
     
     //this.props.calculate()或this.props.onClick代表立即执行 this.props.calculate(this.props.squares)();
     <button className="square" onClick={this.props.onClick} />

    function a(){
        const c =1;
        return fucntion (k){
            return k+c;
        }
    }
    
    const A = a();//返回function 地址
    A(8)//立即执行后结果9


### 函数参数形式
#### 带参数存在默认值
    function add(a, b = 20) {
        return a + b;
    }
    console.log(add(30));

#### 参数默认值可以是一个函数
    function add(a, b = getVal(5)) {
        return a + b;
    }

### 剩余参数：由三个点...和一个紧跟着的具名参数指定 ...keys(类似数组)
    function pick(obj, ...keys) {
    // ...keys 解决了arguments 可以接受多个参数的问题
    let result = Object.create(null);
    for (let i = 0; i < keys.length; i++) {
        result[keys[i]] = obj[keys[i]];
    }
    return result;

### 扩展运算符...
    剩余运算符：主要用于形参上,把多个独立的值合并到一个数组中
    扩展运算法：针对数组,将数组分割，并将各个项作为分离的参数传给函数

    // 处理数组中的最大值，使用apply
    const arr = [10, 20, 50, 30, 90, 100, 40];
    console.log(Math.max.apply(null,arr));

    es6 扩展运算法更方便//将数组分割求最大值
    console.log(Math.max(...arr));

### 箭头函数
    使用=>来定义  
    function(){}等于与 (参数)=>{函数体}：括号代表函数形参,箭头代表return,大括号代表函数体；

    let add = function (a) {
        return a;
    }
    //无参数
    let add = () => "hello";
    //一个参数
    let add = a => a;
    //两个参数
    let add = (a, b) => {
        return a + b;
    }
    
### 返回是对象
    let getObj = id => {
        return {
            id: id,
            name:'小马哥'
        }
    }
    //去掉return得加上小括号,如果是基本类型返回可以去掉括号
    let getObj = id => ({id:id,name:"小马哥"});

### this问题
ES5 中this指向：取决于调用该函数的上下文对象;ES6 没有this绑定

    let PageHandle = {
        id: 123,
        init: function () {
            document.addEventListener('click',function(event) {
                // console.log(this);
                // 此时this指向document而不是PageHandle.doSomeThings
                // 需要定义完使用bind函数该表this指向,见下面
                this.doSomeThings(event.type);
            })
            //ES5解决方法:使用bind绑定(不建议使用)
            //document.addEventListener('click',function(event) {
            //    this.doSomeThings(event.type);
            //}.bind(this),false)
        },
        doSomeThings:function(type){
            console.log(`事件类型:${type},当前id:${this.id}`);
            
        }
    }
    PageHandle.init();

#### 箭头函数解决this问题
    let PageHandle = {
        id: 123,
        //对象内部定义函数不要使用箭头函数,如果使用箭头函数,那函数内的作用域失效,this向上查找为定义Pagehandle得对象window
        init: function () {
            // 箭头函数没有this指向，箭头函数内部this值只能通过查找作用域链来确定,
            //一旦使用箭头函数，当前就不存在作用域链(当前作用域失效,this为向上找到第一个对象)
            document.addEventListener('click', (event) => {
                // this.doSomeThings is not a function
                console.log(this);
                this.doSomeThings(event.type);
            }, false)
        },
        doSomeThings: function (type) {
            console.log(`事件类型:${type},当前id:${this.id}`);
        }
    }
    PageHandle.init();

#### 使用箭头函数的注意事项
    //没有作用域链，this指向了window，arguments不是window属性
    1:使用箭头函数 函数内部没有arguments.
    2.箭头函数不能使用new关键字来实例化对象
    let Person = ()=>{};
    // function函数 也是一个对象，但是箭头函数不是一个对象，它其实就是一个语法糖
    let p = new Person();


### 链判断运算符
如果读取对象内部的某个属性，往往需要判断一下该对象是否存在。

    比如，要读取message.body.user.firstName，安全的写法是写成下面这样
    const firstName = (message && message.body && message.body.user && message.body.user.firstName) 
                        || 'default';
    或者使用三元运算符?:，判断一个对象是否存在。
    const fooValue = fooInput ? fooInput.value : undefined
    
#### 链判断运算符有三种用法

    obj?.prop // 对象属性
    obj?.[expr] // 同上
    func?.(...args) // 函数或对象方法的调用

    a?.b  // 等同于  a == null ? undefined : a.b

    a?.[x] // 等同于 a == null ? undefined : a[x]

    a?.b()  // 等同于 a == null ? undefined : a.b()

    a?.()  // 等同于  a == null ? undefined : a()

### Null 判断运算符
#### Null 判断运算符 ||
读取对象属性的时候，如果某个属性的值是null或undefined，有时候需要为它们指定默认值。常见做法是通过||运算符指定默认值。但是属性的值如果为空字符串或false或0，默认值也会生效

    const headerText = response.settings.headerText || 'Hello, world!';
    const animationDuration = response.settings.animationDuration || 300;
    const showSplashScreen = response.settings.showSplashScreen || true;
    上面的三行代码都通过||运算符指定默认值，但是这样写是错的。

#### Null 判断运算符??
它的行为类似||，但是只有运算符左侧的值为null或undefined时，才会返回右侧的值。

    const headerText = response.settings.headerText ?? 'Hello, world!';
    const animationDuration = response.settings.animationDuration ?? 300;
    const showSplashScreen = response.settings.showSplashScreen ?? true;
    默认值只有在属性值为null或undefined时，才会生效

??有一个运算优先级问题，它与&&和||的优先级孰高孰低。现在的规则是，如果多个逻辑运算符一起使用，必须用括号表明优先级，否则会报错。

## 解构赋值

    解构赋值是对赋值运算符的一种扩展,它针对数组和对象来进行操作
    优点：代码书写上简洁易读
    1.对象解构:类似将对象拆散
    let node = {
        type:'iden',
        name:'foo',
        age:10
    }
    //ES5之前
    let type = node.type;
    let name = node.name;

### 对象完全解构:将对象属性与变量名一致
    let {type,name,age} = node;
    console.log(type,name);

### 不完全解构:只解构出对象里一部分属性
    let {type,age} = node;
    
### 剩余运算符:将对象剩下的属性存入对象res中
    let {name,...res} = node;
    console.log(res);//是一个对象

### 默认值解构
    let {a,b = 30} = {a:20};

    2.对数组解构
    let arr = [1,2,3];
    let [a,b] = arr;
    console.log(a,b);
    // 可嵌套:解构是对应嵌套数据结构
    let [a,[b],c] = [1,[2],3];

## 对象的扩展功能
es6直接写入变量和函数，作为对象的属性和方法
    
### 属性名跟属性值一样
    const name ='q';
    const age = '12';
    const person = {
         name,//等价于name:name
         age,//age:age
         sayName(){//sayName:function(){}
             console.log(this.name);
         }
    }

### 返回对象的属性名跟变量名一样
    function fn(x,y) {
       return {x,y};
     }

### 对象定义
    onst obj = {};
    obj.isShow = true;
    const name = 'a';
    obj[name+'bc'] = 123;
    console.log(obj);//abc =123

### 比较对象的是否一样方法：Object.is
    比较两个值是否严格相等,解决出错NaN===NaN// false，+0 === -0 //true
    特殊例子：console.log(NaN === NaN);//false
    console.log(Object.is(NaN, NaN));//true
    
### 对象的合并(给对象添加新属性)

    Object.assign(target,obj1,obj2....)
    // 返回合并之后的新对象
    let newObj = Object.assign({}, { a: 1 }, { b: 2 });
    console.log(newObj);

#### 注意

    浅拷贝：Object.assign方法实行的是浅拷贝，而不是深拷贝。也就是说，如果源对象某个属性的值是对象，那么目标对象拷贝得到的是这个对象的引用。 
    
    同名属性的替换：对于这种嵌套的对象，一旦遇到同名属性，Object.assign的处理方法是替换，而不是添加。
    
    数组的处理：Object.assign可以用来处理数组，但是会把数组视为对象
    Object.assign([1, 2, 3], [4, 5])   // [4, 5, 3]
    上面代码中，Object.assign把数组视为属性名为 0、1、2 的对象，因此源数组的 0 号属性4覆盖了目标数组的 0 号属性1

    取值函数的处理：Object.assign只能进行值的复制，如果要复制的值是一个取值函数，那么将求值后再复制。
    const source = {
    get foo() { return 1 }
    };
    const target = {};

    Object.assign(target, source)// { foo: 1 }
    上面代码中，source对象的foo属性是一个取值函数，Object.assign不会复制这个取值函数，只会拿到值以后，将这个值复制过去。
### Object.keys(),Object.values(),Object.entries(),Object.fromEntries()

    const obj = { foo: 'bar', baz: 42 };
    Object.values(obj)
    // ["bar", 42]

    const obj = { foo: 'bar', baz: 42 };
    Object.values(obj)
    // ["bar", 42]

    const obj = { foo: 'bar', baz: 42 };
    Object.entries(obj)
    // [ ["foo", "bar"], ["baz", 42] ]
    Object.entries方法的另一个用处是，将对象转为真正的Map结构。
    const obj = { foo: 'bar', baz: 42 };
    const map = new Map(Object.entries(obj));
    map // Map { foo: "bar", baz: 42 }

    Object.fromEntries()方法是Object.entries()的逆操作，用于将一个键值对数组转为对象。
    Object.fromEntries([
        ['foo', 'bar'],
        ['baz', 42]
    ])
    // { foo: "bar", baz: 42 }

## 数据类型Symbol
ES6 引入了一种新的原始数据类型Symbol，表示独一无二的值。它是 JavaScript 语言的第七种数据类型，前六种是：undefined、null、布尔值（Boolean）、字符串（String）、数值（Number）、对象（Object）

### 定义
    最大的用途：用来定义对象的私有变量
    //原始数据类型Symbol ,由它创建出来的变量值是独一无二,也就是指向地址是不一样
    const name = Symbol('name');
    const name2 = Symbol('name');
    console.log(name === name2);

### 用法
#### 如果用Symbol定义的对象中的变量，取值时一定要用[变量名]

    let s1 = Symbol("s1");
    let obj = {
        [s1]: "小马哥",
    };
    obj[s1] = '小马哥';
    console.log(obj[s1]);

#### symbol定义对象属性是无法被遍历到,类似私有化被锁

    for(let key in obj){
        console.log(key); 
    }
    //这样定义的属性无法读取到
    console.log(Object.keys(obj));

#### 获取Symbol定义对象属性方法

    1.获取Symbol声明的属性名（作为对象的key）
    let s = Object.getOwnPropertySymbols(obj);
    console.log(s[0]);

    //反射对象获取
    2.let m = Reflect.ownKeys(obj);
    console.log(m);

#### 实例：消除魔术字符串
魔术字符串指的是，在代码之中多次出现、与代码形成强耦合的某一个具体的字符串或者数值。风格良好的代码，应该尽量消除魔术字符串，改由含义清晰的变量代替。    

    const shapeType = {
    triangle: 'Triangle'
    };

    function getArea(shape, options) {
    let area = 0;
    switch (shape) {
        case shapeType.triangle:
        area = .5 * options.width * options.height;
        break;
    }
    return area;
    }

    getArea(shapeType.triangle, { width: 100, height: 100 });
    如果仔细分析，可以发现shapeType.triangle等于哪个值并不重要，只要确保不会跟其他shapeType属性的值冲突即可。因此，这里就很适合改用 Symbol 值。

    const shapeType = {
    triangle: Symbol()
    };

#### Symbol.for()/Symbol.keyFor() 
Symbol.for()它接受一个字符串作为参数，然后搜索有没有以该参数作为名称的 Symbol 值。如果有，就返回这个 Symbol 值，否则就新建一个以该字符串为名称的 Symbol 值，并将其注册到全局。

    let s1 = Symbol.for('foo');
    let s2 = Symbol.for('foo');

    s1 === s2 // true

Symbol.keyFor()方法返回一个已登记的 Symbol 类型值的key。

    let s1 = Symbol.for("foo");
    Symbol.keyFor(s1) // "foo"

    let s2 = Symbol("foo");
    Symbol.keyFor(s2) // undefined s2没有使用Symbol.for()为 Symbol 值登记的名字
    
## 集合set
Set 结构不会添加重复的值,Set 实例添加了两次NaN，但是只会加入一个。这表明，在 Set 内部，两个NaN是相等的。
另外，两个对象总是不相等的

### set：(去重)表示无重复值的有序列表

    // 去除数组的重复成员
    [...new Set(array)]
    //去除字符串里面的重复字符
    [...new Set('ababbc')].join('') //"abc"
### 基本操作

    let set = new Set();
    //查看set的原型_proto_自带的方法
    console.log(set);
    // 添加元素
    set.add(2);
    // 删除元素
    set.delete(2);
    // 校验某个值是否在set中
    console.log(set.has("4"));
    console.log(set.size);

### set转为数组

    let set2 = new Set([1, 2, 3, 3, 3, 4]);
    // 扩展运算符将set转换成数组
    let arr = [...set2];
    console.log(arr);

    Array.from方法可以将 Set 结构转为数组。
    const items = new Set([1, 2, 3, 4, 5]);
    const array = Array.from(items);
    
### 注意：set使用引用产生问题

    1.set中对象的引用无法被释放
    let set3 = new Set(),obj = {};
    set3.add(obj);
    // 释放当前的资源
    obj = null;
    console.log(set3);//集合还有对象

    //解决引用对象被释放
    let set4 = new WeakSet(),
    obj = {};
    set4.add(obj);
    // 释放当前的资源
    obj = null;
    console.log(set4);//集合里对象被释放

    WeakSet 与 set 的不同点
    1.不能传入非对象类型的参数
    2.不可迭代
    3.没有forEach()
    4.没有size属性

##  集合Map  
Map类型是键值对的有序列表，键和值是任意类型

    let map = new Map();
    map.set('name','张三');
    map.set('age',20);
    console.log(map.get('name'));
    console.log(map);
    map.has('name');//true
    map.delete('name');
    map.clear();
    console.log(map);
    //key 与 value类型不控制
    map.set(['a',[1,2,3]],'hello');
    console.log(map);
    //直接初始化
    let m = new Map([["a", 1],["c", 2],]);
    console.log(m);

### 遍历 Map 结构
任何部署了 Iterator 接口的对象，都可以用for...of循环遍历。Map 结构原生支持 Iterator 接口，配合变量的解构赋值，获取键名和键值就非常方便。

#### 遍历获取键值对key/value
    const map = new Map();
    map.set('first', 'hello');
    map.set('second', 'world');

    for (let [key, value] of map) {
    console.log(key + " is " + value);
    }

#### 遍历获取键名key
    for (let [key] of map) {
    // ...
    }

#### 获取键值value
    for (let [,value] of map) {
    // ...
    }

### 与其他数据结构的互相转换
#### Map 转为数组

    const myMap = new Map()
    myMap.set(true, 7)
    myMap.set({foo: 3}, ['abc']);
    [...myMap]
    // [ [ true, 7 ], [ { foo: 3 }, [ 'abc' ] ] ]

#### 数组转为Map

    new Map([ [true, 7],[{foo: 3}, ['abc']]])
    Map {true => 7,Object {foo: 3} => ['abc']}

#### Map 转为对象

    function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k,v] of strMap) {
        obj[k] = v;
    }
    return obj;
    }

    const myMap = new Map()
    myMap.set('yes', true)
    myMap.set('no', false);
    strMapToObj(myMap)
    // { yes: true, no: false }

#### 对象转为 Map
    
    let obj = {"a":1, "b":2};
    let map = new Map(Object.entries(obj));//先转为数组

#### Map 转为 JSON

    function strMapToJson(strMap) {
    return JSON.stringify(strMapToObj(strMap));
    }

    let myMap = new Map().set('yes', true).set('no', false);
    strMapToJson(myMap)
    // '{"yes":true,"no":false}'

#### JSON 转为 Map

    function jsonToStrMap(jsonStr) {
    return objToStrMap(JSON.parse(jsonStr));
    }

    jsonToStrMap('{"yes": true, "no": false}')
    // Map {'yes' => true, 'no' => false}


## 数组
### map()方法
遍历数组后,返回新数组

   const arr = ['a','b'];
   arr.map((value,index)=> {})


### Array.from()方法
    
    1.arguments转为数组：将伪数组转换成真正的数组
    function add() {
        // console.log(arguments);

        // es5转换:
        // let arr = [].slice.call(arguments);
        // console.log(arr);

        // es6写法：arguments转为数组
        let arr = Array.from(arguments);
        console.log(arr);
    }
    add(1, 2, 3);

    2.from转换：list转为数组
    let lis = document.querySelectorAll('li')
    //lis为list
    console.log(Array.from(lis));

    3.扩展运算符:list转为数组
    console.log([...lis]);

    4.from() 还可以接受第二个参数，用来对每个元素进行处理
    let liContents = Array.from(lis, ele => ele.textContent);
    // console.log(liContents);

### 数组方法与Array.of()方法

#### map()方法
    
    map((数组的值,数组下标)=>{return 处理})//返回新数组
    const arr = var arr = [1,2,3];
    const tt = arr.map((item,index) => {
        return item*2;
    });

    tt = [2,4,6];
    

#### 将任意的数据类型，转换成数组
    console.log(Array.of(3, 11, 20, [1, 2, 3], {id: 1}));

#### 遍历.keys()下标/.values()值/entries()   
    //返回一个遍历器(Iterator),可以使用for...of循环进行遍历
    console.log(['a','b'].keys());

    // keys() 对数组下标遍历
    for (let index of ['a', 'b'].keys()) {
        console.log(index);//0,1
    }

    // values() 对值遍历
    for (let ele of ['a', 'b'].values()) {
        console.log(ele);//a,b
    }

    // entries() 对数组下标与值对遍历
    for(let [index,ele] of ['a','b'].entries()){
        console.log(index,ele); 
    }
    let letter = ['a','b','c'];
    let it = letter.entries();
    console.log(it.next().value);

#### includes() 返回一个布尔值，表示某个数组是否包含给定的值
    console.log([1,2,3].includes(2));
    console.log([1,2,3].includes('4'));

    ES5之前:indexof()是否包含给定的值
    console.log([1,2,3].indexOf('2'));//存在返回大于1，否则返回-1

#### findIndex()找出第一个符合条件的数组成员的索引(下标)
    let numIndex = [1, 2, -10, -20, 9, 2].findIndex(n => n < 0)
    console.log(numIndex);//2

#### find()
    // find()找出第一个符合条件的数组的值
    let num = [1, 2, -10, -20, 9, 2].find(n => n < 0);//回调方法
    console.log(num);//-10

#### copywithin() 数组内部将制定位置的元素复制到其它的位置，返回当前数组
    // 从3位置往后的所有数值，替换从0位置往后的三个数值
    console.log([1, 2, 3, 8, 9, 10].copyWithin(0, 3));//[8,9,10,8,9,10]

### Iterator遍历器

    两个核心：
    1.迭代器是一个接口，能快捷的访问数据，通过Symbol.iterator来创建迭代器 通过迭代器的next()获取迭代之后的结果
    2.迭代器是用于遍历数据结构的指针(数据库的游标)

    使用迭代器:由数组对象获取迭代器
    const items = ["one", "two", "three"];
    1.由数组创建新的迭代器:控制台看数组对象proto原型里有Symbol.iterator函数对象
    const ite = items[Symbol.iterator]();//items[Symbol.iterator]返回函数,加括号立即执行
    //ite.next()返回{value: "one", done: false} done如果为false表示遍历继续 如果为true表示遍历完成
    console.log(ite.next()); 

## 解决异步问题的3种方式
    Generator  Promise  async  1.解决回调地域  2.使得异步操作显得更加方便
### Generator函数
#### A.作用功能:

    generator函数,可以通过yield关键字，将函数挂起(卡住)，为了改变执行流提供了可能，同时为了做异步编程(http请求)提供了方案
    
#### B.它普通函数的两点区别
    1.function后面 函数名之前有个*
    2.只能在函数内部使用yield表达式，让函数挂起,挂起时返回当前卡住的对象
   
    function* func() {
        console.log('one');
        yield 2;
        console.log('two');
        yield 3;
        console.log('end');   
    }

    let fn = func();//没进入函数体,func()返回一个遍历器对象 可以调用next()继续往下执行遇到yeild卡住返回卡住对象
    // console.log(o)
    console.log(fn.next());//执行到yield 2卡住;返回卡住yield 2{value: "2", done: false}
    console.log(fn.next());//从卡住yield 2执行到yield 3卡住;返回卡住yield 3{value: "3", done: false}
    console.log(fn.next());//从卡住yield 3继续往下执行{value: "undefined", done: false}

    总结：generator函数是分段执行的,yield语句是暂停执行,而next()恢复执行

#### C.yield传参
   
    function* add() {
        1.console.log("start");
        // x 可真的不是yield '2'的返回值，它是next()方法调用 恢复当前yield()执行传入的实参
        2.let x = yield "2";
        3.console.log("one:" + x);
        4.let y = yield "3";
        5.console.log("two:" + y);
        6.return x + y;  
    }
    const fn = add();//返回add()方法对象的一个遍历fn
    console.log(fn.next()); //执行到1,卡住在2,返回卡住时对象{value:'2',done:false}
    console.log(fn.next(20)); //传入参数,执行到卡住的2,执行3，返回卡住4的对象{value:'3',done:false}
    console.log(fn.next(30)); //{value:50,done:true}

#### .使用场景1：一般对象不具备为Interator接口,不具备Interator接口的对象提供了遍历操作

    function* objectEntries(obj) {
        // 获取对象的所有的key数组
        const propKeys = Object.keys(obj);
        for(const propkey of propKeys){
            yield [propkey,obj[propkey]];//卡住返回当前对象
            // 换成内部return拿不到结果
        }
    }
    
    const obj = {
        name:'小马哥',
        age:18
    }

    //给对象定义一个iterator函数属性：objectEntries
    obj[Symbol.iterator] = objectEntries;
    console.log(obj);

    //遍历返回每个key,value
    for(let [key,value] of objectEntries(obj)){
        console.log(`${key}:${value}`);  
    }   

#### E.主要针对异步编程(http请求)
应用1：

    问题:Generator 部署ajax操作，让异步代码同步化
    // 回调地狱：嵌套异步请求每一个请求都是异步,为了让嵌套变得同步()
    $.ajax({
        url: 'https://xxx',
        method: 'get',
        success(res) {
            console.log(res);
            // 嵌套请求
            $.ajax({ })
        }
    })

    解决方案://使用Generator解决嵌套异步变为同步(异步递归变为同步递归)
    1.先定义生成器函数
    function* main() {
        console.log('main');
        let res = yield request('https://xxxxx');
        console.log(res);

        // 执行后面的操作
        console.log('数据请求完成，可以继续操作');
    }
    2.执行生成器至嵌套函数挂起
    const ite = main();
    //先让生成器挂起即将请求
    ite.next();

    3.开始使得挂起嵌套函数执行:使得调用每个函数结束才会点另外个函数,变为有序同步(异步递归变为同步递归)
    function request(url) {
        $.ajax({
            url,
            method: 'get',
            success(res) {
                //执行挂起请求
                ite.next(res);
            }
        })
    }

应用2：在产生异步前挂起

    // 加载loading...页面
    // 数据加载完成...（异步操作）
    // loading关闭掉
    function loadUI() {
        console.log('加载loading...页面');
    }

    function hideUI() {
        console.log('隐藏loading...页面');
    }

    function* load() {
        loadUI();
        yield showData();
        hideUI();
    }

    let itLoad = load();
    //在执行到异步showData时挂起
    itLoad.next();

    function showData() {
        // 模拟异步操作
        setTimeout(() => {
            console.log('数据加载完成');
            //等定时器到了(异步函数处理完),继续执行挂起函数
            itLoad.next();
        }, 1000);
    }

###  Promise对象
Promise对象(类似封装了AJAX)相当于一个容器，对象保存着异步操作的事件请求返回的结果,然后通过对象方法处理相应结果
Promise有axios封装的库

#### Promise对象特点：
    1.对象的状态不受外界影响,处理异步操作三个状态：
        Pending(请求进行中:不常用) Resolved(请求成功调用的函数:常用) Rejected(请求失败调用的函数:常用)
    2.一旦状态改变，就不会再变，任何时候都可以得到这个结果

    例子:
    function timeOut(ms) {
        return new Promise((resolved,rejected)=>{
            //定时模拟异步请求
            setTimeout(() => {
                //异步请求成功后调用resolved函数返回Promise结果对象
                resolved('hello promise success!!')
            }, ms);
        })
    }

    //
    timeOut(2000).then((val)=>{console.log(val);

#### Promise对象then方法的使用
拓展知识:封装原生JS:[XMLHttpRequest—必知必会](https://www.jianshu.com/p/918c63045bc3/)

    const getJSON = function (url) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.onreadystatechange = handler;
                xhr.responseType = 'json';
                xhr.setRequestHeader('Accept', 'application/json');
                // 发送
                xhr.send();

                function handler() {

                    if (this.readyState === 4) {
                        if (this.status === 200) {
                            //返回promise对象
                            resolve(this.response.HeWeather6);
                        } else {
                            //返回promise对象
                            reject(new Error(this.statusText));
                        }
                    }

                }
            })
        }

    let a = getJSON('https://xxxxx').then((data) => {
            console.log(data);
            //return后的被自动封装为promise对象,可以继续使用then方法
            return data[0]
        }).then((obj)=>{console.log(obj);
    注:
        通url请求在resolve函数/reject函数返回promise对象,使用then(函数1，函数2)方法:第二个参数是可选的
        then(函数1，函数2)方法：then(resolve返回promise对象处理的函数,reject返回promise对象处理的函数)
    1.getJSON(url).then((data)=>{处理data},(err)=>{处理err});
    2.getJSON(url).then((data)=>{处理data});//一个函数参数,then只处理默认为resolve返回的对象
    3.getJSON(url).then(null,(err)=>{处理err});//then只处理reject返回的对象
    4.getJSON(url).then((data)=>{处理data},(err)=>{处理err}).catch((e)=>{处理异常e}).done().finally().
    
#### Promise对象reslove/reject方法的使用

    //resolve()能将现有的任何对象转换成promise对象
    let p = new Promise(resolve=>resolve('foo'));//等价于let p = Promise.resolve('foo');
    p.then((data)=>{ console.log(data); })
    ///reject()能将现有的任何对象转换成promise对象
    let p = new Promise(reject=>reject('foo'))
    p.then(null,(refuse)=>{ console.log(refuse); })

#### Promise对象all(参数为promise数组)方法的使用

    应用：一些游戏类的素材比较多，等待图片、flash、静态资源文件 都加载完成 才进行页面的初始化
    let promise1 = new Promise((resolve, reject) => {});
    let promise2 = new Promise((resolve, reject) => {});
    let promise3 = new Promise((resolve, reject) => {});

    let p4 = Promise.all([promise1, promise2, promise3])
    p4.then(()=>{
        // 三个都成功  才成功
    }).catch(err=>{
        // 如果有一个失败 则失败
    })

#### Promise对象race()方法的使用
race(请求函数(返回promise对象),超时的处理函数(返回promise对象)):某个异步请求设置超时时间，并且在超时后执行相应的操作

    // 1 请求图片资源
    function requestImg(imgSrc) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = function () {
                resolve(img);
            }

            //图片可以相对路径
            img.src = imgSrc;
        });
    }

    //2.超时处理函数
    function timeout() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('图片请求超时'));
            },3000);
        })
    }

    Promise.race([requestImg('https://dddd'),timeout()]).then(data=>{
        console.log(data);
        document.body.appendChild(data);
    }).catch(err=>{console.log(111)}).finally(console.log(222));
    
#### Promise对象catch()与finally()方法的使用

    new Promise(resolve=>{new Error('444');}).then(data => { console.log(000); }).catch(console.log(111)).finally(console.log(222));
    注:类似关闭io流那样
    //少用
    server.listen(3000).then(()=>{处理}).catch(console.log(err)).finally(server.stop());

### async函数
作用：使得异步操作更加方便,async它会返回一个Promise对象,然后调用then()方法,catch()方法,finally()
async是Generator的一个语法糖(比Generator更容易操作)
注：await只能在async函数内部使用

#### 使用

    async function f() {
        //await 返回一个promise对象,如果不是就会自动封装
        let s = await 'hello world';
        let data = await s.split('');
        return data;
    }

    // 如果async函数中有多个await 那么then函数会等待所有的await指令,运行完的结果,才去执行
    f().then(v => {console.log(v)}).catch(e => console.log(e));
     
#### 避免出异常导致后面无法操作

    async function f2() {
        try {
            await Promise.reject("出错了");
        } catch (error) {
            
        }
        return await Promise.resolve("hello");
    }
    
    f2().then((v) => console.log(v)).catch((e) => console.log(e));

#### 实际应用
    想获取和风天气现在now的数据

    const getJSON = function (url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.onreadystatechange = handler;
            xhr.responseType = "json";
            xhr.setRequestHeader("Accept", "application/json");
            // 发送
            xhr.send();

            function handler() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                resolve(this.response);
                } else {
                reject(new Error(this.statusText));
                }
            }
            }
        });
     };

    async function getNowWeather(url) {
        // 发送ajax 获取实况天气
        let res = await getJSON(url);
        console.log(res);
        // 获取HeWeather6的数据   获取未来3~7天的天气状况
        let arr = await res.HeWeather6;
        return arr[0].now;
    }

    getNowWeather("https://xxxx" ).then((now) => {
        console.log(now);
    });

## Class类及继承
### class类定义
#### ES5之前定义类
    构造函数与函数区别函数名的大小写区别：大写为构造函数，小写为函数
    
    function Person(name,age) {
        this.name = name;
        this.age = age;
    }
    //原型上添加方法
    Person.prototype.sayName = function() {
        return this.name;
    }
    let p1 = new Person('小马哥',28);
    console.log(p1);

#### ES6定义类

    class Person {
        // 实例化的时候会立即被调用
        constructor(name, age) {
            this.name = name;
            this.age = age;
        }

        //直接定义方法
    }

    //添加方法:通过Object.assign()方法一次性向类中添加多个方法
    Object.assign(Person.prototype, {
        sayName() {
            return this.name
        },
        sayAge() {
            return this.age
        }
    })

    let p1 = new Person('小马哥', 28);
    console.log(p1);

###  类的继承

    // 使用关键字 extends
    class Animal{
        constructor(name,age) {
            this.name = name;
            this.age = age;
        }
        sayName(){
            return this.name;
        }
        sayAge(){
            return this.age;
        }
    }

    class Dog extends Animal{
        constructor(name,age,color) {
            super(name,age);//等价于 Animal.call(this,name,age);
            this.color = color;
        }
        // 子类自己的方法
        sayColor(){
            return `${this.name}是${this.age}岁了,它的颜色是${this.color}`
        }
        // 重写父类的方法
        sayName(){
            return this.name + super.sayAge() + this.color;
        }
        
    }

    let d1 = new Dog('小黄',28,'red');
    console.log(d1.sayColor());
    console.log(d1.sayName());  

### 模块化
    export规定对外接口：defult 只能出现一次默认导出
    import时加大括号解构:
        {导出类没带defult对象,且名字一样;可以用 A as B 改变名字}
        defualt的对象：名字可以任意改变

    // ES6 module 
    import Person,{name,age,sayName as say} from './modules/index.js';
    (少用:导出所有)//import * as f from './modules/index.js'

    const p = new Person();
    // console.log(f.default);
    // console.log(name,age,sayName());

    输入模块的指定方法
    加载模块时，往往需要指定输入哪些方法。解构赋值使得输入语句非常清晰。
    const { SourceMapConsumer, SourceNode } = require("source-map");