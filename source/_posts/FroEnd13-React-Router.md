---
title: React-Router
tags: [React,Router]
categories: [FrontEnd]
---
## Rounter
### Router库
    react-Router
    react-Router-dom
    react-Router-active

### 使用react-Router组件路由
    包含<BrowerRouter> 与 <HashRouter>web常用web项目组件

#### <BrowerRouter>
    基于HTML5 History API 实现(pushState,replaceState等)
　　需要Web服务器额外配置:在服务器端设置返回首页配置，防止用户直接输入不同url回车,这样后端请求返回对应路径的html,如果没有设置首页就会返回404;

#### <HashRouter>
    使用url的#/xxxx的hash部分作为路由信息
    主要兼容老版本浏览器

## 路由匹配规则
   路由匹配规则:遍历每一个router,匹配成功都会宣称出来组件
### 约束匹配规则
    <switch>组件:匹配到一个就不再匹配,类似switch语法，把根路径"/"放在最后,类似默认跳转路径
    Router的exact属性:表示与path的值完全匹配才渲染该组件

### Router属性
    path属性:
        定义字符串固定路径：localhost:8080/user
        定义变量路径：localhost:8080/user/:user(:为变量标识符,user为变量)
        可以通过const {match} = props; const uservalue = match.params.user(变量名)获取
    match属性:在下一级属性对象里props.match，获取上一级路径信息为match.path,match.params.XXX获取上一级路径里的变量值

## Router里组件渲染方式区别
component渲染方式区别：
### <Rounter component>
    <Rounter  path='/act' component={Home}/>
    <Rounter path='/act' component ={()=><Home/>}/>:
    　　　此方式每一次render调用都会生成新的内联函数赋值给component,虽然每一次生成联函数值一样，但是新函数，在内存地址都是新的(类似多次调用函数返回一个函数地址,每一次都是不一样),导致Home组件都要先卸载再重新挂载(造成不必要内存开销),造成组件内部状态丢失不能共享.

### <Rounter render>(推荐)
    <Rounter  path='/act' render={(props) => <Home (...props)/>}/>:
         防止组件状态丢失,可以共享状态,还可以传递其他属性,

### <Rounter children>
     <Rounter path='/act' children={(props) => <div> props.mathc?'active':'inactive'}/></div>:
    与render区别在于,props里含有match属性,而且不管这个路径Router有没有匹配成功都会渲染children组件,区别再于match只有匹配到当前Router才有属性


         
