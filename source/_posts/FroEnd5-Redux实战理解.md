---
title: Redux实战理解
tags: [Redux]
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


## 项目结构3种模式
### 按类型划分
![项目结构-类型模式](/img/项目结构-类型模式.png "项目结构-类型模式")
![按类型划分](/img/按类型划分.png "按类型划分")

### 按功能划分
![项目结构-按功能划分](/img/项目结构-按功能划分.png "项目结构-按功能划分")
![按功能划分](/img/按功能划分.png "项目结构-按功能划分")

### Duck模式
![项目结构-Duck模式](/img/项目结构-Duck模式.png "项目结构-Duck模式")
![Duck模式](/img/Duck模式.png "Duck模式")


## state设计
### 两种错误设计方式
以API为设计State的依据
以页面UI为设计State的依据

### state设计原则
store类似前端的数据库，每一个reducer对应数据库的表,reducer对象对应数据,设计state就如设计数据库一样
![数据库三范式](/img/数据库三范式.png "数据库三范式")
![State设计原则](/img/State设计原则.png "State设计原则")

注：state设计尽量扁平化，避免嵌套过深
UI State：具有松散兴特点


