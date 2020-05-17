---
title: React简单入门
tags: [React]
categories: [FrontEnd]
---

## react

## 安装

1.安装脚手架：npm i -g create-react-app
2.新建demo：create-react-app react-demo
三个核心包：

    react--项目处理逻辑有关, 
    react-dom--虚拟dom渲染为真实dom,
    react-scripts--包括项目启动,文件监听,文件编译等      

注：使用yarn命令比npm好：npm下载包可能丢包

## 项目介绍
![react项目启动入口](/img/react项目启动入口.png "react项目启动入口")

1.index.js为项目入口文件
2.import react 必须在react-dom前

## JSX对象
    ReactDom.render(<h2>hello</h2>);
    <h2>hello</h2>为jsx对象=javescript+xml,虚拟dom,语法糖
    以前都是在html里(xml一种)插入这样标签<javescript>操作<javescript>才能写js代码
    现在是在javescript里不用标签加入html标签,相当js文件里定义了新的一种对象jsx能与js写一起

    注：
    1.jsx对象里插入js代码需要使用{js操作后返回jsx对象}；类似html中插入别的格式代码需要用标签声明//jsx中不确定地方都需要{}表达，jsx类似一个html是确定格式
    2.const ele = (<h2>hello</h2>);这样表达jsx对象需要用(jsx)包起来,括号不是强制但是能说明是一个模块属于同一个东西

## ReactDom.render(参数jsx对象,节点)介绍

## jsx写法
    
    const ele = (<h2>hello,{formatName(user)}</h2>);
    ReactDom.render(ele, document.querySelector('#root'));

## jsx对象中插值
    function getGreeting(user) {
      if (user) {
        return ele;
      }

      return (<h2>hello,react</h2>);
    }

    //函数返回的jsx对象不能直接使用在jsx位置,函数是为了在jsx内部使用，只能引进在jsx内部插入{函数/其他}
    ReactDom.render(<div>{getGreeting(user)}</div>, document.querySelector('#root'));

## react数值驱动视图
    只需要更新自己需要更新的地方

## 循环绑定jsx对象
    //数组循环绑定必须以数组map方法
    arr.map((item, index) => {
      //循环绑定的jsx对象必须存在不同key来区分不同标签
      return (<li key={index}>{item}</li>);
    }

## 创建组件两种方式
react 核心思想就是组件化开发(声明标签),其实就是写js,其实就是写函数
组件声明：函数/类首写字母一定要大写

## 函数声明组件
函数组件只包含一个 render 方法，并且不包含 state，使用函数组件就会更简单。不需要定义一个继承于 React.Component 的类，可以定义一个函数，这个函数接收 props 作为参数，然后返回需要渲染的元素。函数组件写起来并不像 class 组件那么繁琐，很多组件都可以使用函数组件来写。

    函数组件(少用):props对象存放使用时组件里的属性,可以利用propes.xxxx获取对应属性值
    function Welcomd(props) {
        //如果组件里没有属性,propos为null
        return (<h2>hello,{props.name}}</h2>);
    }
    ReactDom.render(<Welcomd name='welcom' />, document.querySelector('#root'));

## 类声明(常用)
 
    类声明组件:
    1.字母大写(ES6类方式实现); react使用组件时会认为小开头的都是标签
    2.继承基类:React.component实现,constructor不是必须的
    3.必须使用render函数,返回jsx对象,进行渲染
    4.组件接受jsx属性props对象
    5.类声明可以让父子组件通讯,函数声明麻烦,而且函数声明组件没有状态维护
    6.多值传递{...this.props.user}
    7.数据流单向,在App组件中子组件Admin可以获取当前组件信息多个属性{...this.props.xxx}/或单个属性{this.props.xxx},
    作为信息传递到Admin中用{this.props.xxx}获取
    8.样式通过className使用导入已经定义好的css文件;图片也可以通过导入使用变量名方式使用

    export default class App extends Component {
         constructor(props) {
           super(props);
           this.user={
               name:'1',
               age:'2'
           }
         }

        render() {
            return (
                //可以将user 解构出来所有属性传递给admin组件
                <Admin {...this.props.user}/>
            )
        }
    }

## 复用组件

    1.将多个组件进行整合,例如调用两次以上的相同组件
    2.结构非常复杂时需要组件拆分为小组件
    3.会存在父子关系的数据传递

## 父子组件通信
存在this指向问题:ES6箭头函数可以解决；

### 父--->子单向数据流驱动:
    
    当前使用组件可以通过调用子组件给子组件设置属性方式传值(单值传递/多值传递);
### 子--->父传递(不建议使用):

    在父组件中设置一个函数(更改父子组件状态),然后将这个函数以传值方式传递给子组件,子组件可以通过props获取着父组件函数,从而在子组件内部控制父组件状态

## 组件状态
注：不允许自身修改props,必须提升到父级组件中修改驱动才符合单向数据流;但可以维护自身state状态

    export default class tst extends Component {
        constructor(props) {
            super(props);
            //定制当前组件的状态,只要这些状态值变化,当前的render函数重新渲染
            this.state={
                name:'1',
                age:1
            }
        }
        
        add(){
            //setState()是异步操作;
            this.setstate({
                name:this.state.age+1;
            });
            //由于异步没拿到更新后的数据2,取数据速度比更新块
            console.log(this.state.age);//1

            //同步化:前一个函数是修改state状态,第二函数为状态修改后回调函数最新状态prevProps在后一个箭头函数使用
            this.setState((prevState,prevProps)=>({
                name:prevState.age+1;}),()=>({console.log(prevProps.age)
            }))
        }
        render() {return (jsx对象 )};
    }

### 在构造器中定制状态
    定制当前组件的状态,只要这些状态值变化,当前的render函数重新渲染
    
### 修改组件state
    处理在构造函数里初始化修改state的值,其他地方修改state唯一方法就是使用setState()方法
    setState()是异步操作,传对象无法处理最新状态，以函数方法使用可以避免这个问题
    例子1(少用):在组件里定义函数如上面add函数,函数内部使用this.setState(参数为对象)方法修改
    例子2:this.setState(参数为箭头函数返回：对象要用(对象)返回)：
    this.setState((prevState,prevProps)=>({}),()=>({}))

### 解决组件事件调用函数this指向问题

    1.在定义构造器时，将函数绑定给着对象：this.add = this.add.bind(this);
    2.修改add为箭头函数 add()=>{}后 onclick={this.add()}
    3.onclick ={(e)=>{this.add(e)}}//可以传参
    2.(不推荐)在onclick ={this.add.bind(this)}


## 组件的状态生命周期
react生命周期包括三个阶段：初始化阶段,运行中阶段,销毁阶段,不懂生命周期触发不同的钩子函数

![生命周期](/img/生命周期.png "生命周期")
![生命周期2](/img/生命周期2.png "生命周期2")
![生命周期运转结果](/img/生命周期运转结果.png "生命周期运转结果")
                
        export default class LifeCircle extends Component {

        static defaultProps = {
            //0.加载默认属性
            firt: console.log('0.加载默认属性'),
            name: '小马哥',
            age: 18
        }

        constructor(props) {
            super(props);
            console.log('1.初始化 加载默认的状态');
            this.state = {
            count: 0
            }
        }

        componentWillMount() {
            console.log('2.父组件(WillMount)将要被挂载');
        }

        componentDidMount() {
            //当前方法中发起AJXS请求，获取数据,数据驱动视图
            console.log('4.父组件(DidMount)挂载完成');
        }

        render() {
            console.log('组件(render)了');
            return (
            <div>
                <h2>当前的值：{this.state.count}</h2>
                <Button onClick={this.handleClick} > 按钮</Button>
                <SubCount count={this.state.count}></SubCount>
            </div>
            )
        }

        handleClick = () => {
            this.setState((prevstate, preveprops) => ({
            age: console.log('触发点击监听事件开始:更新状态'),
            count: prevstate.count + 1
            }), () => {
            console.log('点击监听事件完成时状态：' + (this.state.count));
            })
        }

        shouldComponentUpdate(nextProps, nextState) {
            //重要:性能优化点
            console.log('5.状态变化后根据奇偶性判断,组件是否要更新render');
            if (nextState.count % 2 === 0) {
            return true;
            } else {
            return false;
            }
        }

        componentWillUpdate() {
            console.log('7.组件将要更新render')
        }

        componentDidUpdate() {
            console.log('8.组件已经更新render完成')
        }

        componentWillUnmount() {
            //卸载定时器
            console.log('10.卸载');
        }
        }


        class SubCount extends Component {
            componentWillReceiveProps(newProps) {
                console.log('由于父组件状态变化通知子组件将要接受属性', newProps);
            }

            render() {
                return (
                <div>{this.props.count}</div>
                )
            }
        }


## 受控组件
受控组件:受状态控制的组件

    1.定义控制组件变化得状态对象
    2.将对应控件上发生变化得地方绑定对应状态值,用函数去监听该控件的变化,函数内部处理使得状态变化达到让组件渲染

如：为了输入时,值发生变化使得相应控件发生变化渲染,需要把状态绑定到该会发生变化得地方;

    export default class controlinpu extends Component {
        constructor(props) {
            super(props);
            //设置控制状态对象
            this.state = {
            age: 0
            }
        }

        //监听控件变化,将实时将变化得值赋给控件状态,这样可以实时更新渲染
        handlChange = (e) => {
            let age = e.target.value;
            this.setState({ age });
        }

        render() {
            return (
            <div>
                //组件状态绑定在对应控件上
                <input tpye="text" value={this.state.age} onChange={this.handlChange}></input>
            </div>
            )
        }
    }

## 非受控组件
非受控组件:不受状态控制的组件：不需要绑定状态在控件上

    export default class controlinpu extends Component {
        constructor(props) {
            super(props);
            //设置控制状态对象
            this.state = {
            age: 0
            }
        }

        //监听控件变化,将实时将变化得值赋给控件状态,这样可以实时更新渲染
        handlChange = (e) => {
            let age = e.target.value;
            this.setState({ age });
        }

        render() {
            return (
                <div>
                    //组件状态不绑定在对应控件上
                    <input tpye="text" onChange={this.handlChange}></input>
                    <h2>{this.state.val}</h2>
                </div>
            )
        }
    }



    












