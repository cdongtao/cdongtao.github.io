---
title: React总结
tags: [React]
categories: [FrontEnd]
---

## setState的4种方式：

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
### 通过回调函数的形式

    test1 = () => {
        this.setState((state,props)=>({
            count:state.count+1
        }));
        console.log('test1 setState()之后',this.state.count);
    }

### 通过对象的方式

    (注意：此方法多次设置会合并且只调用一次！)
    test2 = () => {
        this.setState({
            count:this.state.count+1
        });
        console.log('test2 setState()之后',this.state.count);
    }

### 回调函数更新
    test3 = () => {
        // 在第二个callback拿到更新后的state
        this.setState({
            count:this.state.count+1
        },()=>{// 在状态更新且页面更新(render)后执行
            console.log('test4 setState()之后',this.state.count);
        });
    }

### 直接修改state的值(错误做法)

    不能直接修改state的值，此方法强烈不建议！！！因为不会触发重新render
    test4 = () => {
        this.state.count += 1;
    }
    

## setState()更新状态是异步还是同步：
需要判断执行setState的位置
### 同步
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

### 异步
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

#### 定时器回调

        update1 = () => {
            setTimeout(()=>{
                console.log('setTimeout setState()之前',this.state.count);//1
                this.setState((state,props)=>({
                    count:state.count+1
                }));
                console.log('setTimeout setState()之后',this.state.count);//2
            });
        }

#### 原生事件回调

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

#### Promise回调

        update3 = () => {
            Promise.resolve().then(value=>{
                console.log('Promise setState()之前',this.state.count);//1
                this.setState((state,props)=>({
                    count:state.count+1
                }));
                console.log('Promise setState()之后',this.state.count);//2
            });
        }

## 异步的setState()多次调用的问题：
### 多次调用，处理方法：
setState({})：合并更新一次状态，只调用一次render()更新界面，多次调用会合并为一个，后面的值会覆盖前面的值。
setState(fn)：更新多次状态，只调用一次render()更新界面，多次调用不会合并为一个，后面的值会覆盖前面的值。

### 如何得到setState异步更新后的状态数据：
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

## react中常见的setState面试题（setState执行顺序）
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


## 总结：
### react中setState()更新状态的2种写法
    1）setState(updater，[callback])
    updater：为返回stateChange对象的函数：(state,props)=>stateChange，接收的state和props都保证为最新的

    2）setState(stateChange，[callback])
    stateChange为对象，callback是可选的回调函数，在状态更新且界面更新后才执行

### 注意：
    对象是函数方式的简写方式
    如果新状态不依赖于原状态，则使用对象方式；
    如果新状态依赖于原状态，则使用函数方式；
    如果需要在setState()后获取最新的状态数据，在第二个callback函数中获取