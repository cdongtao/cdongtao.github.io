---
title: React总结
tags: [React]
categories: [FrontEnd]
---
## setSate总结
### setState的4种方式：

    class Index extends Component {
        state={
            count:1
        }
         //添加下面方法测试
        render() {
            console.log('render');
            return (
                <div>
                    <h1>currentState:{this.state.count}</h1>
                    <button onClick={this.test1}>测试1</button>
                    <button onClick={this.test2}>测试2</button>
                    <button onClick={this.test3} style={{color:'red'}}>测试3</button>
                    <button onClick={this.test4}>测试4</button>
                </div>
            )
        }
    }
#### 通过回调函数的形式

    test1 = () => {
        this.setState((state,props)=>({
            count:state.count+1
        }));
        console.log('test1 setState()之后',this.state.count);
    }

#### 通过对象的方式

    (注意：此方法多次设置会合并且只调用一次！)
    test2 = () => {
        this.setState({
            count:this.state.count+1
        });
        console.log('test2 setState()之后',this.state.count);
    }

#### 回调函数更新
    test3 = () => {
        // 在第二个callback拿到更新后的state
        this.setState({
            count:this.state.count+1
        },()=>{// 在状态更新且页面更新(render)后执行
            console.log('test4 setState()之后',this.state.count);
        });
    }

#### 直接修改state的值(错误做法)

    不能直接修改state的值，此方法强烈不建议！！！因为不会触发重新render
    test4 = () => {
        this.state.count += 1;
    }
    

### setState()更新状态是异步还是同步：
需要判断执行setState的位置
#### 同步
在react控制的回调函数中：生命周期钩子/react事件监听回调

    class Index extends Component {
        state={
            count:1
        }

        //react事件监听回调中，setState()是异步状态
        update1 = () => {
            console.log('update1 setState()之前',this.state.count);
            this.setState((state,props)=>({
                count:state.count+1
            }));
            console.log('update1 setState()之后',this.state.count);
        }
        
        //react生命周期钩子中，setState()是异步更新状态
        componentDidMount() {
            console.log('componentDidMount setState()之前',this.state.count);
            this.setState((state,props)=>({
                count:state.count+1
            }));
            console.log('componentDidMount setState()之后',this.state.count);
        }
        
        render() {
            console.log('render');
            return (
                <div>
                    <h1>currentState:{this.state.count}</h1>
                    <button onClick={this.update1}>测试1</button>
                </div>
            )
        }
    }   

#### 异步
非react控制的异步回调函数中：定时器回调/原生事件监听回调/Promise  

    class Index extends Component {
        state={
            count:1
        }

        render() {
            console.log('render');
            return (
                <div>
                    <h1 ref='count'>currentState:{this.state.count}</h1>
                    <button onClick={this.update1}>测试1</button>
                    <button onClick={this.update2}>测试2</button>
                    <button onClick={this.update3}>测试3</button>
                </div>
            )
        }
    }

###### 定时器回调

        update1 = () => {
            setTimeout(()=>{
                console.log('setTimeout setState()之前',this.state.count);//1
                this.setState((state,props)=>({
                    count:state.count+1
                }));
                console.log('setTimeout setState()之后',this.state.count);//2
            });
        }

###### 原生事件回调

        update2 = () => {
            const h1 = this.refs.count;
            h1.onclick = () => {
                console.log('onClick setState()之前',this.state.count);//1
                this.setState((state,props)=>({
                    count:state.count+1
                }));
                console.log('onClick setState()之后',this.state.count);//2
            }
        }

###### Promise回调

        update3 = () => {
            Promise.resolve().then(value=>{
                console.log('Promise setState()之前',this.state.count);//1
                this.setState((state,props)=>({
                    count:state.count+1
                }));
                console.log('Promise setState()之后',this.state.count);//2
            });
        }

### 异步的setState()多次调用的问题：
#### 多次调用，处理方法：
setState({})：合并更新一次状态，只调用一次render()更新界面，多次调用会合并为一个，后面的值会覆盖前面的值。
setState(fn)：更新多次状态，只调用一次render()更新界面，多次调用不会合并为一个，后面的值会覆盖前面的值。

#### 如何得到setState异步更新后的状态数据：
在setState()的callback回调函数中

```
class Index extends Component {
    state={
        count:1
    }
    update1 = () => {
        console.log('update1 setState()之前',this.state.count);
        this.setState((state,props)=>({
            count:state.count+1
        }));
        console.log('update1 setState()之后',this.state.count);
        console.log('update1 setState()之前2',this.state.count);
        this.setState((state,props)=>({
            count:state.count+1
        }));
        console.log('update1 setState()之后2',this.state.count);
    }
    update2 = () => {
        console.log('update2 setState()之前',this.state.count);
        this.setState({
            count:this.state.count+1
        });
        console.log('update2 setState()之后',this.state.count);
        console.log('update2 setState()之前2',this.state.count);
        this.setState({
            count:this.state.count+1
        });
        console.log('update2 setState()之后2',this.state.count);
    }
    update3 = () => {
        console.log('update3 setState()之前',this.state.count);
        this.setState({
            count:this.state.count+1
        });
        console.log('update3 setState()之后',this.state.count);
        console.log('update3 setState()之前2',this.state.count);
        this.setState((state,props)=>({
            count:state.count+1
        }));// 这里需要注意setState传参为函数模式时，state会确保拿到的是最新的值
        console.log('update3 setState()之后2',this.state.count);
    }
    update4 = () => {
        console.log('update4 setState()之前',this.state.count);
        this.setState((state,props)=>({
            count:state.count+1
        }));
        console.log('update4 setState()之后',this.state.count);
        console.log('update4 setState()之前2',this.state.count);
        this.setState({
            count:this.state.count+1
        });// 这里需要注意的是如果setState传参为对象且在最后，那么会与之前的setState合并
        console.log('update4 setState()之后2',this.state.count);
    }
    render() {
        console.log('render');
        return (
            <div>
                <h1>currentState:{this.state.count}</h1>
                <button onClick={this.update1}>测试1</button>
                <button onClick={this.update2}>测试2</button>
                <button onClick={this.update3}>测试3</button>
                <button onClick={this.update4}>测试4</button>
            </div>
        )
    }
}
```

### react中常见的setState面试题（setState执行顺序）
```  
// setState执行顺序
class Index extends Component {
    state={
        count:0
    }
    componentDidMount() {
        this.setState({count:this.state.count+1});
        this.setState({count:this.state.count+1});
        console.log(this.state.count);// 2 => 0
        this.setState(state=>({count:state.count+1}));
        this.setState(state=>({count:state.count+1}));
        console.log(this.state.count);// 3 => 0
        setTimeout(() => {
            this.setState({count:this.state.count+1});
            console.log('setTimeout',this.state.count);// 10 => 6
            this.setState({count:this.state.count+1});
            console.log('setTimeout',this.state.count);// 12 => 7
        });
        Promise.resolve().then(value=>{
            this.setState({count:this.state.count+1});
            console.log('Promise',this.state.count);// 6 => 4
            this.setState({count:this.state.count+1});
            console.log('Promise',this.state.count);// 8 => 5
        });
    }
    render() {
        console.log('render',this.state.count);// 1 => 0  // 4 => 3 // 5 => 4 // 7 => 5 // 9 => 6 // 11 => 7
        return (
            <div>
                <h1>currentState:{this.state.count}</h1>
                <button onClick={this.update1}>测试1</button>
                <button onClick={this.update2}>测试2</button>
                <button onClick={this.update3}>测试3</button>
                <button onClick={this.update4}>测试4</button>
            </div>
        )
    }
}
```


### 总结：
#### react中setState()更新状态的2种写法
    1）setState(updater，[callback])
    updater：为返回stateChange对象的函数：(state,props)=>stateChange，接收的state和props都保证为最新的

    2）setState(stateChange，[callback])
    stateChange为对象，callback是可选的回调函数，在状态更新且界面更新后才执行

#### 注意：
    对象是函数方式的简写方式
    如果新状态不依赖于原状态，则使用对象方式；
    如果新状态依赖于原状态，则使用函数方式；
    如果需要在setState()后获取最新的状态数据，在第二个callback函数中获取


## 组件里使用context总结
context 通过组件数提供了一个传递数据的方法，从而避免了在每一个层级手动的传递 props 属性。
在一个典型的 React 应用中，数据是通过 props 属性由上向下（由父及子）的进行传递的，但这对于某些类型的属性而言是极其繁琐的（例如：地区偏好，UI主题），这是应用程序中许多组件都所需要的。 Context 提供了一种在组件之间共享此类值的方式，而不必通过组件树的每个层级显式地传递 props 

### context的使用PropTypes例子
        
    // 顶级组件，在配置context的值
    import React from 'react';
    import PropTypes from 'prop-types';
    class MessageList extends React.Component {
    getChildContext() {
        // 设置context中color的具体值
        return {color: "purple"};
    }

    render() {
        const children = this.props.messages.map((message) =>
        <Message text={message.text} />
        );
        return <div>{children}</div>;
    }
    }

    MessageList.childContextTypes = {
        // 指定context中存在color，对应的值为字符串类型
        color: PropTypes.string
    };

    // 中间的组件
    import React from 'react';
    class Message extends React.Component {
    render() {
        return (
        <div>
            {this.props.text} <Button>Delete</Button>
        </div>
        );
    }
    }

    //使用context中值的组件
    import React from 'react';
    import PropTypes from 'prop-types';
    class Button extends React.Component {
    render() {
        return (
        // context中的值具体的使用
        <button style={{background: this.context.color}}>
            {this.props.children}
        </button>
        );
    }
    }

    Button.contextTypes = {
        color: PropTypes.string
    };

### context的使用Provider/Consumer例子

[例子](https://blog.csdn.net/wu_xianqiang/article/details/89842338)


## Node.js工作线程共享对象
[Worker Thread文档](https://nodejs.org/api/worker_threads.html)
[工作线程共享对象/存储(Nodejs worker threads shared object/store)](https://www.it1352.com/1653728.html)
[nodejs中函数共享作用域导致的内存泄漏](https://blog.csdn.net/q511545671/article/details/78351741)
[Node.js的线程和进程详解](https://segmentfault.com/a/1190000017985766)

## nodejs 全局变量和全局对象
### 全局对象

所有模块都可以调用
    1）global：表示Node所在的全局环境，类似于浏览器中的window对象。
    2）process：指向Node内置的process模块，允许开发者与当前进程互动。
    例如你在DOS或终端窗口直接输入node，就会进入NODE的命令行方式（REPL环境）。退出要退出的话，可以输入 process.exit();
    3）console：指向Node内置的console模块，提供命令行环境中的标准输入、标准输出功能。
    通常是写console.log()，无须多言

### 全局函数：

1）定时器函数：共有4个，分别是setTimeout(), clearTimeout(), setInterval(), clearInterval()。
2）require：用于加载模块。

### 全局变量：

1）_filename：指向当前运行的脚本文件名。
2）_dirname：指向当前运行的脚本所在的目录。

### 准全局变量

模块内部的局部变量，指向的对象根据模块不同而不同，但是所有模块都适用，可以看作是伪全局变量，主要为module, module.exports, exports等。

module变量指代当前模块。module.exports变量表示当前模块对外输出的接口，其他文件加载该模块，实际上就是读取module.exports变量。
module.id 模块的识别符，通常是模块的文件名。
module.filename 模块的文件名。
module.loaded 返回一个布尔值，表示模块是否已经完成加载。
module.parent 返回使用该模块的模块。
module.children 返回一个数组，表示该模块要用到的其他模块。

这里需要特别指出的是，exports变量实际上是一个指向module.exports对象的链接，等同在每个模块头部，有一行这样的命令。
var exports = module.exports;

这造成的结果是，在对外输出模块接口时，可以向exports对象添加方法，但是不能直接将exports变量指向一个函数：

exports.自定义模块 = function (x){ console.log(x);};
上面这样的写法是无效的，因为它切断了exports与module.exports之间的链接。但是，下面这样写是可以的。