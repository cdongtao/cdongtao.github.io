---
title: Css of Sass & Less
tags: [Css,Sass,Less]
categories: [FrontEnd]
---

## Sass
### 为什么要使用CSS预处理器？
作为前端开发人员，大家都知道，Js中可以自定义变量，而CSS仅仅是一个标记语言，不是编程语言，因此不可以自定义变量，不可以引用等等。
* CSS有具体以下几个缺点：
1. 语法不够强大，比如无法嵌套书写，导致模块化开发中需要书写很多重复的选择器；
2. 没有变量和合理的样式复用机制，使得逻辑上相关的属性值必须以字面量的形式重复输出，导致难以维护。
这就导致了我们在工作中无端增加了许多工作量。而使用CSS预处理器，提供 CSS 缺失的样式层复用机制、减少冗余代码，提高样式代码的可维护性。大大提高了我们的开发效率。但是，CSS预处理器也不是万金油，CSS的好处在于简便、随时随地被使用和调试。预编译CSS步骤的加入，让我们开发工作流中多了一个环节，调试也变得更麻烦了。更大的问题在于，预编译很容易造成后代选择器的滥用。
所以我们在实际项目中衡量预编译方案时，还是得想想，比起带来的额外维护开销，CSS预处理器有没有解决更大的麻烦。

### Sass语法
#### 嵌套规则
sass中可以把一套css样式嵌套到另一套样式当中，是sass出色的原因之一。父元素嵌套着子元素，层层关系，避免重复输写父元素，使得复杂的css也能在书写和阅读上更加清晰易管理。属性也可以进行嵌套
```
//属性嵌套 
nav {      
    border: { 
        //注意 border后面的
        style: solid; 
        width: 1px;      
        color: #ccc;      
    } 
}  //样式嵌套
 
 
#main p {   
    color: #00ff00;
    width: 97%;
    .redbox {
        background-color: #ff0000;     
        color: #000000;   
    } 
}
```
编译之后：
```
nav{ border: 1px solid #ccc;} 
#main p {color: #00ff00;width: 97%; } 
#main p .redbox { background-color: #ff0000; color: #000000; }
```

#### 引用父元素(&)
在写sass过程中，有时需要使用父元素，可是由于嵌套的格式，父元素嵌套着子元素，这时，可以用&来代替需要引用的父元素。
```
a { 　　　　
    &:hover { color: #ffb3ff; } 
}  
//相当于  a:hover{color: #ffb3ff}
```
#### 定义变量($)
在sass中可以定义变量，变量以美元符号开头，不在嵌套中定义的变量是全局变量，可以在任何地方使用，在嵌套中定义的变量只能在嵌套中使用。将局部变量转换为全局变量可以在Value后面添加[!global]
```
$blue : #1875e7;　 　　
div {        
    $height: 10px!global;       
    $width: 5px; 　　　
    color : $blue;      
    width: $width; 
}
```
#### 取定义得变量(#{?})
如果变量需要镶嵌在字符串中，要放在插值语句 #{ }里面，插值语句 #{ }可以sass中的任何地方使用。比如插值属性名，和插值属性值
```
$side : left; 　　
.rounded { 　　　　
border-#{$side}-radius: 5px; 
}
```
属性值可以是css里面的属性名，字sass中比较灵活，在定义的属性值中可以是css中的属性值，一遍我们使用
```
$color-red: #f00; 
$border-color: green; 
$side: left;//值是css属性名。  
border-#{$side}-radius: 5px;  //相当于border-left-radius: 5px;
```

#### 代码中使用算式
比如把一个宽为100%的元素分成3分，每份根本不知怎么分配，一点都不好计算。而sass可以直接运用算式可以很轻松的解决这个问题
```
body { 　　
    margin: (14px/2); 　　
    top: 50px + 100px; 　　
    right: $var * 10%; 
}
```

#### sass注释
sass中有时也要使用注释，支持/* */ 与 // 的注释，而他们之间却被编译之后却会有不同的效果
* /* comment */  //会保留到编译后的文件。
* 单行注释: comment  //只保留在SASS源文件中，编译后被省略。
* 在/*后面加一个感叹号，表示这是"重要注释"。即使是压缩模式编译，也会独占一行，保留这条注释，通常可以用于声明版权信息。
/*!  　　　　重要注释！ */

### 代码的重用  
#### 类的继承(@extend)
在写css的时候，通常会遇到两个元素样式一样的情况，但是其中一个元素又添加了额外的样式，在sass中可以直接使用@extend来引用另外另外一个元素完全的样式
```
.class1 { 　　　　
border: 1px solid #ddd; }  
 
.class2 { 　　　　
@extend .class1; 　　　　
font-size:120%; }
```

#### 混合模式(@mixin && @include)
既然可以用@extend引用一个元素的样式代码块，那会不会存在一个代码块，需要被多处使用？在写项目的过程中，肯定会有，比如flex样式，就经常重复写。在sass中，用@mixin 命令定义一个代码块， 解决了这个问题，使用@include命令调用这个代码块，使得定义好的代码块加入到项目中，避免了从复书写的麻烦和。让经常重复书写的代码块只需要写一次就好，多次被@include加到项目中。定义的代码块不会被编译，不会出现在.css文件中
```
@mixin flex { 　　　　
    float: left; 　　　　
    margin-left: 10px; 
} 
 
div { 　　　　
    @include flex; 
}
```

@mixin 强大之处不仅可以定义代码块，还可以加入一个或者多个参数，把它封装成一个“函数”，在调用的时候加入参数可以灵活多变地被调用，如果使用默认值可以不填参数项。
```
@mixin left($value: 10px) { 　　　　
    float: left; 　　　　
    margin-right: $value; 
}
```
调用的时候可以根据需要加入参数
```
div{     
    @include left(100px) 
}
```

#### 引入引用(@import)
```
@import "path/filename.scss"; //相当于 @import url(test.css);
```

### 高级用法
#### @if
@if就像js里面的判断语句if，判断是否符合条件，如果返回的结果是true，才会输出{}里面的代码块，否则不会输出
```
p {  
    @if 1 + 1 == 2 { border: 1px solid; }   
    @if 5 < 3 { border: 2px dotted; }   
    @if null  { border: 3px double; } 
} 
//编译后p {border: 1px solid; }
```
这个用法也可以用于自适应，判断屏幕的宽度，从而对应输出适应各种屏幕的样式代码块。
```
@if $container-width < 960{   
    width: $container-width - 300px;   
    background-color: red; 
}
```
#### @else
这个也是相当于js语法里面的else语句，如果 if 语句的条件为false，则执行该代码块。@if后面可以跟多个@if else，当@if else的判断全部都为false时，左后执行@else代码块
```
@if lightness($color) > 30% { 　　　　
    background-color: #000; 　　
} @else { 　　　　
    background-color: #fff; 　　
}
```
#### @for
@for也是相当于JavaScript for 循环，可以将代码快执行指定的次数，在这个格式里面，要存在一个变量，例子中就是$i，存在一个循环的范围，$i from 1 to 10，在这个范围里面循环执行{}里面的代码快
```
@for $i from 1 through 3 {   
    .item-#{$i} { width: 2em * $i; } 
}  
//编译为 
.item-1 {   width: 2em; } 
.item-2 {   width: 4em; } 
.item-3 {   width: 6em; }
```
#### @while
@while循环同样也等同于JavaScript while 循环，判断条件，符合则执行下面的代码快
```
$i: 6; 　　
@while $i > 0 { 　　　　
    .item-#{$i} { width: 2em * $i; } 　　　　
    $i: $i - 2; 　　
}
```
#### @each
@each等同与each（）方法，使每个匹配的元素都执行{}代码块。在@each用法里会存在一个值列表，更像是一个数组，将变量作用于数组的每一项，对应输出结果
```
@each $member in a, b, c, d { 　　　　
.#{$member} { 　　　　　　
background-image: url("/image/#{$member}.jpg"); 　　　　
  } 　　
}   
 
//编译后   
.a{background-image: url("/image/#{$member}.jpg");}   
.b{background-image: url("/image/#{$member}.jpg");}   
.c{background-image: url("/image/#{$member}.jpg");}   
.d{background-image: url("/image/#{$member}.jpg");}
```
#### 自定义函数
在sass中还可以使用@function自定义函数，和@mixin一样，可以使用一个或者多个参数，更像javascript中的function函数，@function定义的函数可以包含多条语句，需要使用@return输出
```
@function double($n) { 　　　　
    @return $n * 2; 　　
} 　　

#sidebar { 
    width: double(5px);
}   

//编译后   
#sidebar { 　　　　
    width: 10px; 　　
}
```


### 总结：
1.所有变量用$声明；
2.用&代替父元素。
3.镶嵌在属性中的变量用#{};

* 继承类名用： @extend .类名；
* 声明代码块用：@mixin 名 (变量参数){  }；
* 引用代码快：@include 名；
* 定义函数@function 函数名(变量参数){ @return 输出语句 }


## Less



## Sass和Less的比较
### 不同之处
#### Less环境较Sass简单
Cass的安装需要安装Ruby环境，Less基于JavaScript，是需要引入Less.js来处理代码输出css到浏览器，也可以在开发环节使用Less，然后编译成css文件，直接放在项目中，有less.app、SimpleLess、CodeKit.app这样的工具，也有在线编辑地址

#### Less使用较Sass简单
LESS 并没有裁剪 CSS 原有的特性，而是在现有 CSS 语法的基础上，为 CSS 加入程序式语言的特性。只要你了解 CSS 基础就可以很容易上手

#### 从功能出发，Sass较Less略强大一些
* sass有变量和作用域。
-$variable，like php；
-#｛$variable｝like ruby；
-变量有全局和局部之分，并且有优先级。


* sass有函数的概念；
-@function和@return以及函数参数（还有不定参）可以让你像js开发那样封装你想要的逻辑。
-@mixin类似function但缺少像function的编程逻辑，更多的是提高css代码段的复用性和模块化，这个用的人也是最多的。
-ruby提供了非常丰富的内置原生api。

* 进程控制：
-条件：@if @else；
-循环遍历：@for @each @while
-继承：@extend
-引用：@import

* 数据结构：
-$list类型=数组；
-$map类型=object；
其余的也有string、number、function等类型

#### Less与Sass处理机制不一样
前者是通过客户端处理的，后者是通过服务端处理，相比较之下前者解析会比后者慢一点

#### 关于变量在Less和Sass中的唯一区别就是Less用@，Sass用$。
 
### 相同之处
Less和Sass在语法上有些共性，比如下面这些：
* 混入(Mixins)——class中的class；
* 参数混入——可以传递参数的class，就像函数一样；
* 嵌套规则——Class中嵌套class，从而减少重复的代码；
* 运算——CSS中用上数学；
* 颜色功能——可以编辑颜色；
* 名字空间(namespace)——分组样式，从而可以被调用；
* 作用域——局部修改样式；
* JavaScript 赋值——在CSS中使用JavaScript表达式赋值

## 为什么选择使用Sass而不是Less
* Sass在市面上有一些成熟的框架，比如说Compass，而且有很多框架也在使用Sass，比如说Foundation。
* 就国外讨论的热度来说，Sass绝对优于LESS。
* 就学习教程来说，Sass的教程要优于LESS。在国内LESS集中的教程是LESS中文官网，而Sass的中文教程，慢慢在国内也较为普遍。
* Sass也是成熟的CSS预处理器之一，而且有一个稳定，强大的团队在维护。
* 同时还有Scss对sass语法进行了改良，Sass 3就变成了Scss(sassy css)。与原来的语法兼容，只是用{}取代了原来的缩进。
* bootstrap（Web框架）最新推出的版本4，使用的就是Sass





