---
title: ES6
tags: [ECMAScript6]
categories: [FrontEnd]
---

##  let && const关键字
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

### 字符串模板

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

### 函数
    
    1.带参数默认值的函数
    function add(a, b = 20) {
        return a + b;
    }
    console.log(add(30));

    2.默认的表达式也可以是一个函数
    function add(a, b = getVal(5)) {
        return a + b;
    }

    3.剩余参数：由三个点...和一个紧跟着的具名参数指定 ...keys
    function pick(obj, ...keys) {
    // ...keys 解决了arguments 的问题
    let result = Object.create(null);
    for (let i = 0; i < keys.length; i++) {
        result[keys[i]] = obj[keys[i]];
    }
    return result;

    4.扩展运算符...
    剩余运算符：主要用于形参上,把多个独立的合并到一个数组中
    扩展运算法：针对数组,将数组分割，并将各个项作为分离的参数传给函数

    // 处理数组中的最大值，使用apply
    const arr = [10, 20, 50, 30, 90, 100, 40];
    console.log(Math.max.apply(null,arr));

    es6 扩展运算法更方便
    console.log(Math.max(...arr));

    5.的箭头函数
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
    
    6.返回是对象
    let getObj = id => {
        return {
            id: id,
            name:'小马哥'
        }
    }
    //去掉return得加上小括号,如果是基本类型返回可以去掉括号
    let getObj = id => ({id:id,name:"小马哥"});

    7.this问题
    // ES6 没有this绑定
    // ES5 中this指向：取决于调用该函数的上下文对象

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

    //箭头函数解决this问题
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

    使用箭头函数的注意事项
    //没有作用域链，this指向了window，arguments不是window属性
    1:使用箭头函数 函数内部没有arguments.
    2.箭头函数不能使用new关键字来实例化对象
    let Person = ()=>{};
    // function函数 也是一个对象，但是箭头函数不是一个对象，它其实就是一个语法糖
    let p = new Person();

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

    A.对象完全解构:将对象属性与变量名一致
    let {type,name,age} = node;
    console.log(type,name);

    B.不完全解构:只解构出对象里一部分属性
    let {type,age} = node;
    
    C.剩余运算符:将对象剩下的属性存入对象res中
    let {name,...res} = node;
    console.log(res);//是一个对象

    D.默认值解构
    let {a,b = 30} = {a:20};

    2.对数组解构
    let arr = [1,2,3];
    let [a,b] = arr;
    console.log(a,b);
    // 可嵌套:解构是对应嵌套数据结构
    let [a,[b],c] = [1,[2],3];

## 扩展的对象的功能
    es6直接写入变量和函数，作为对象的属性和方法
    1.属性名跟属性值一样
    const name ='q';
    const age = '12';
    const person = {
         name,//等价于name:name
         age,//age:age
         sayName(){//sayName:function(){}
             console.log(this.name);
         }
    }

    2.返回对象的属性名跟变量名一样
    function fn(x,y) {
       return {x,y};
     }

    3.对象定义
    onst obj = {};
    obj.isShow = true;
    const name = 'a';
    obj[name+'bc'] = 123;
    console.log(obj);//abc =123

    4.对象的方法
    比较两个值是否严格相等,解决NaN===NaN出错
    特殊例子：console.log(NaN === NaN);//false
    console.log(Object.is(NaN, NaN));//true
    
    5.对象的合并
    // Object.assign(target,obj1,obj2....)
    // 返回合并之后的新对象
    let newObj = Object.assign({}, { a: 1 }, { b: 2 });
    console.log(newObj);