---
title: JaveScript 基础入门
tags: [JaveScript]
categories: [FrontEnd]
---


## JavaScript概念

JavaScript语言由浏览器直接解析,不需要编译的脚本语言.用于读取Html网页对象，来操作Html网页。
JavaScript入门篇中，我们学习了如何插入JS、输出内容及简单的DOM操作，JavaScript进阶篇让您进一步的了解JS的变量、数组、函数、语法、对象、事件、DOM操作，制作简单的网页动态效果。

>注意:
>1.JS是区分大小写的，如：classname和ClassName是不一样的。同时注意方法、属性、变量等的大小写吆。
>2.JS中的字符、符号等一定要在英文状态下输入吆。

## JaveScript入门基础

### 引用外部js文件
注意: javascript作为一种脚本语言可以放在html页面中任何位置，但是浏览器解释html时是按先后顺序的，所以前面的script就先被执行。比如进行页面显示初始化的js必须放在head里面，因为初始化都要求提前进行（如给页面body设置css等）；而如果是通过事件调用执行的function那么对位置没什么要求的。但是我们一般放在网页的head或者body部分。
```
<script src="script.js"></script>

"/" 表示根目录开始
"./" 表示同级目录开始
"../" 表示上一级目录开始；
```

### 变量

定义变量使用关键字var,语法如下：

    var 变量名
变量名可以任意取名，但要遵循命名规则:

    1.变量必须使用字母、下划线(_)或者美元符($)开始。
    2.然后可以使用任意多个英文字母、数字、下划线(_)或者美元符($)组成。
    3.不能使用JavaScript关键词与JavaScript保留字。

### 向HTML输出内容
document.write() 可用于直接向 HTML 输出流写内容。简单的说就是直接在网页中输出内容。

    1.输出内容用""括起，直接输出""号内的内容：document.write("I love JavaScript！");
    2.通过变量，输出内容：var mystr="hello";document.write(mystr);
    3.输出多项内容，内容之间用+号连接。var mystr="hello";document.write(mystr+"123");
    4.输出HTML标签，并起作用，标签使用""括起来。var mystr="hello";document.write(mystr+"<br>");


### 常用调试函数
    1.alert(字符串或变量); 
    2.confirm 对话框：var boolean = confirm(str);返回true/false：
    3.prompt 对话框::var context = prompt(str1, str2);返回值：点击确定按钮，文本框中的内容将作为函数返回值点击取消按钮，将返回null;str1要显示在消息对话框中的文本，不可修改;str2文本框中的内容，可以修改

### 新建窗口
注意：
1.新建的浏览器窗口/新建Tab窗口,运行结果考虑浏览器兼容问题
2.window窗口里放对象相当于此窗口的全局变量


    window.open([URL], [窗口名称], [参数字符串])
    例子:window.open('http://www.imooc.com','_blank','width=300,height=200,menubar=no,toolbar=no, status=no,scrollbars=yes');

### 关闭浏览器窗口

    window.close();   //关闭当前窗口
    <窗口对象>.close();   //关闭指定的窗口
    //将新打的窗口对象，存储在变量mywin中mywin.close();
    例子:mywin=window.open('http://www.imooc.com'); 


## 认识DOM

### DOM节点层次图
![DOM节点层次图](/img/DOM节点层次图.png "DOM节点层次图")


HTML文档可以说由节点构成的集合，三种常见的DOM节点:

    1. 元素节点：上图中<html>、<body>、<p>等都是元素节点，即标签。
    2. 文本节点:向用户展示的内容，如<li>...</li>中的JavaScript、DOM、CSS等文本。
    3. 属性节点:元素属性，如<a>标签的链接属性href="http://www.imooc.com"。

### DOM操作函数
#### 通过ID获取元素
学过HTML/CSS样式，都知道，网页由标签将信息组织起来，而标签的id属性值是唯一的，就像是每人有一个身份证号一样，只要通过身份证号就可以找到相对应的人。那么在网页中，我们通过id先找到标签，然后进行操作。
    注:获取的元素是一个对象，如想对元素进行操作，我们要通过它的属性或方法。
    var domObject = document.getElementById("id") 

#### innerHTML属性
注:innerHTML区分大小写,改变元素内容

    Object.innerHTML
    例子：Object idObject = document.getElementById("id")：
    idObject.innerHTML = "新内容";

#### 改变HTML样式
![HTML样式](/img/HTML样式.png "HTML样式")

    Object.style.property=new style;
    例子：mychar.style.color="red";
    显示和隐藏：display属性:显示或隐藏
    Object.style.display = block(none);s

#### 控制类名（className 属性）
className 属性设置或返回元素的class 属性
1.获取元素的class属性
2.改某元素的CSS外观








