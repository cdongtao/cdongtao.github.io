---
title: React实战理解
tags: [Redux,React,Immutable]
categories: [FrontEnd]
---
## 组件类型分类
![展示型组件和容器型组件](/img/展示型组件和容器型组件.png "展示型组件和容器型组件")

## store 机制
![Store机制](/img/Store机制.png "Store机制")

## reducer 基本机制
![Reducer机制](/img/Reducer机制.png "Reducer机制")

## redux 基本思想
![Redux基本思想](/img/Redux基本思想.png "Redux基本思想")
 
## react-redux使用
![react-redux](/img/react-redux.png "react-redux")


## 项目文件目录结构3种模式
### 按文件功能类型划分
　　文件类型是一个component（展示组件），container（容器组件），在redux状态管理当中有，action，reducer等，这些不同角色的文件都放在一个单独的文件夹目录里，这种样式的结构也是React官方所推荐的结构;使用这种结构组织项目，每当增加一个新功能的时候，需要再containers，components文件夹下增加这个功能需要的组件，还需要再actions，reducers文件夹下分别添加Redux管理这个功能使用到的action，reducer，此时如果actionType放在另外一个文件夹，还需要在这个文件夹下增加新的actionType，所以开发一个新的功能，需要再这些文件夹下频繁的切换已修改不同的文件。如果项目比较小，问题不大，如果对于一个规模比较大的项目使用这种项目结构非常的麻烦。
    注:这类展示因为状态都在同一个文件,不存在按页面功能划分导致状态分离在不同文件管理问题

![项目结构-类型模式](/img/项目结构-类型模式.png "项目结构-类型模式")
![按类型划分](/img/按类型划分.png "按类型划分")

### 按页面功能划分
　　既一个页面功能对应一个文件夹，这个页面功能所用到的container，component，action，reducer等文件都放在这个文件夹下。如下为按照页面功能划分的项目结构示列.这种结构好处很明显，一个页面功能使用到的组件，状态和行为都在同一个文件夹下，方便开发和维护，同时易于扩展，github上很多的脚手架也选择了这种目录结构，不足之处是依然同按角色划分面临同样的问题，改变一个功能需要频繁的在reducer，action，actionType等不同文件夹间切换。<font color='red'>另外redux将整个的应用状态放在一个store中来管理，不同功能模块之间可以共享store中的公共部分状态(项目越复杂，这种场景会越多)，共享的状态应该放到哪一个页面文件夹下也是一个问题，这些问题归根结底是因为redux中状态管理逻辑并不是根据页面功能划分的，页面功能划分会导致公共状态分离在不同文件,功能模块耦合情况下,状态变化会存在相互影响</font>
![项目结构-按功能划分](/img/项目结构-按功能划分.png "项目结构-按功能划分")
![按功能划分](/img/按功能划分.png "项目结构-按功能划分")

### 按照store状态管理(Duck模式)
　　ducks指的是一种新的redux项目目录结构，它提倡将相关的reducer，action，actionType和action creaters写在一个文件里面，$\color{red}${本质上是以应用状态作为划分模块的依据，而不是以页面的功能作为划分模块的依据，}$这样，管理相同状态的依赖都在同一个文件中，无论哪个容器组件需要这部分状态，只需要引入管理这个状态的模块文件即可 
![项目结构-Duck模式](/img/项目结构-Duck模式.png "项目结构-Duck模式")
![Duck模式](/img/Duck模式.png "Duck模式")

#### action的工厂模式
　　在前两种结构中，当container需要使用actions时，可以通过import * as actions from 'path/to/actions.js'的方式一次性的把一个action的文件中中所有的action creates都引入进来。但在使用Ducks结构时，action creater和reducer定义在同一个文件中，import*的导入方式会把reducer也导入进来(如果action types也被export ，那么还会导入action type)。为了解决这个问题。我们可以把action creators和action types定义到一个命名空间中
![工厂模式定义action](/img/工厂模式定义action.png "工厂模式定义action")

## state设计
### 两种错误设计方式
以API为设计State的依据
以页面UI为设计State的依据

### state设计原则
store类似前端的数据库,每一个reducer对应数据库的表,reducer对象对应数据,设计state就如设计数据库一样
![数据库三范式](/img/数据库三范式.png "数据库三范式")
![State设计原则](/img/State设计原则.png "State设计原则")

注：state设计尽量扁平化,避免嵌套过深
UI State：具有松散兴特点

## 高阶函数
高阶函数定义：将函数作为参数或者返回值是函数的函数。
高阶函数分两种：
    常见的 sort,reduce 等函数
    返回值是函数的函数
```    
    function add(a) {
        return function(b) {
            return a + b
        }
    }
    
    var add3 = add(3) //add3表示一个指向函数的变量 可以当成函数调用名来用
    add3(4) === 3 + 4 //true
```
柯里化函数等价为add函数在es6写法
    let add = a => b => a + b
柯里化函数的功能
    可以惰性求值
    可以提前传递部分参数

## Selector函数
Selector函数定义：
     读取Redux中的state的封装函数(以函数形式读取redux中state),在ontainer,Componets组件使用Selector函数读取state使用,达到解耦作用,这样如果某天修改了state的变量名,直接在函数中修改即可(多个地方使用一个函数)
![Selector函数](/img/Selector函数.png "Selector函数")

## Middleware(中间件)
### MiddleWare原理
![MiddleWare原理](/img/MiddleWare原理.png "MiddleWare原理")
### Middleware源码
![Middleware源码.png](/img/Middleware源码.png "Middleware源码")

## Store_Enhancer(少用)
### Store_Enhancer作用
        可以增加store的dispatch,getState等功能,类似在一个函数处理前先添加函数进行处理
![Store_Enhancer作用](/img/Store_Enhancer作用.png "Store_Enhancer作用")
### Store_Enhancer结构
![Store_Enhancer结构](/img/Store_Enhancer结构.png "Store_Enhancer结构")


## Store_Enhancer(少用) 与 Middleware区别
![Store_Enhancer与Middleware区别](/img/Store_Enhancer与Middleware区别.png "Store_Enhancer与Middleware区别")
Store_Enhancer作用:
        底层的抽象(更接近底层操作,存在更改底层逻辑风险),可以增加store的dispatch,getState等功能,类似在一个函数处理前先添加函数进行处理
Middleware:
        高层的抽象,进行约束行为,不容易改变底层逻辑

## React常用库
### Immutable
[Immutable collections for JavaScript](https://github.com/immutable-js/immutable-js)
定义：Immutable Data 就是一旦创建,就不能再被更改的数据。对 Immutable 对象的任何修改或添加删除操作都会返回一个新的 Immutable 对象
Immutable 实现的原理是 Persistent Data Structure(持久化数据结构),也就是使用旧数据创建新数据时,要保证旧数据同时可用且不变。同时为了避免 deepCopy 把所有节点都复制一遍带来的性能损耗,Immutable 使用了 Structural Sharing···· (结构共享),即如果对象树中一个节点发生变化,只修改这个节点和受它影响的父节点,其它节点则进行共享。
![Immutable原理](/img/Immutable原理.gif "Immutable原理")

#### 为什么要在React.js中使用Immutable

它是一个完全独立的库,无论基于什么框架都可以用它。意义在于它弥补了 Javascript 没有不可变数据结构的问题，由于是不可变的,可以放心的对对象进行任意操作。在 React 开发中,频繁操作state对象或是 store ,配合 immutableJS 快、安全、方便，熟悉 React.js 的都应该知道, React.js 是一个 UI = f(states) 的框架,为了解决更新的问题, React.js 使用了 virtual dom , virtual dom 通过 diff 修改 dom ,来实现高效的 dom 更新。但是有一个问题。当 state 更新时,如果数据没变,你也会去做 virtual dom 的 diff ,这就产生了浪费。这种情况其实很常见。当然你可能会说,你可以使用 PureRenderMixin 来解决呀, PureRenderMixin 是个好东西,我们可以用它来解决一部分的上述问题。但 PureRenderMixin 只是简单的浅比较,不使用于多层比较。那怎么办？自己去做复杂比较的话,性能又会非常差。方案就是使用 immutable.js 可以解决这个问题。因为每一次 state 更新只要有数据改变,那么 PureRenderMixin 可以立刻判断出数据改变,可以大大提升性能

#### 与React搭配使用，关键点是shouldComponentUpdate

熟悉 React 的都知道，React 做性能优化时有一个避免重复渲染的大招，就是使用 shouldComponentUpdate()，但它默认返回 true，即始终会执行 render() 方法，然后做 Virtual DOM 比较，并得出是否需要做真实 DOM 更新，尽管React的虚拟算法复杂度已经有了很多优化，但是在大规模组件更新时，依然会是个不必要的损耗。会带来很多无必要的渲染并成为性能瓶颈。我们常用的Purecomponent的秘密其实是在shouldComponentUpdate中做了前后state和props的浅比较，如果不小心组件props的引用问题，这里会导致出现很多Bug。虽然第一层数据没变，但引用变了，就会造成虚拟 DOM 计算的浪费。第一层数据改变，但引用没变，会造成不渲染，所以需要很小心的操作数据。Object.assign可以实现不可变数据,唯一的就是性能问题

#### Immutable 优点

    Immutable 降低了 Mutable 带来的复杂度:可变（ Mutable ）数据耦合了 Time 和 Value 的概念，造成了数据很难被回溯
    节省内存:Immutable.js 使用了 Structure Sharing 会尽量复用内存，甚至以前使用的对象也可以再次被复用。没有被引用的对象会被垃圾回收
    Undo/Redo，Copy/Paste，甚至时间旅行这些功能做起来小菜一碟,因为每次数据都是不一样的，只要把这些数据放到一个数组里储存起来，想回退到哪里就拿出对应数据即可，很容易开发出撤销重做这种功能。
    并发安全:传统的并发非常难做，因为要处理各种数据不一致问题，因此『聪明人』发明了各种锁来解决。但使用了 Immutable 之后，数据天生是不可变的，并发锁就不需要了。
    拥抱函数式编程:Immutable 本身就是函数式编程中的概念，纯函数式编程比面向对象更适用于前端开发。因为只要输入一致，输出必然一致，这样开发的组件更易于调试和组装。

#### Immutable 缺点
    需要学习新的 API
    增加了资源文件大小
    容易与原生对象混淆

## Reselect库
    npm install reselect;
    作用：减少State计算,可以在state值没有改变情况下,不渲染页面(有的页面只要改变就需要渲染,其实state值并不变);
    如果计算state并不是非常复杂,或不是redux性能有问题,或为了优化，尽量不用

### 未引入reselect
    State未更新值,但需要渲染
![reselect作用1](/img/reselect作用1.png "reselect作用1")
### 引入reselect
    State未更新值,但不需要渲染
![reselect作用2](/img/reselect作用2.png "reselect作用2")
