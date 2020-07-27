---
title: FroEnd10-测试工具Jest/enzyme.md
tags: [Jest中间件,测试中间件]
categories: [FrontEnd]
---

## 简介
Jest 是Facebook的一个专门进行Javascript单元测试的工具，这些应用当然也包括了 React 应用。它的优点之一是自带了对 React 的支持，同时也很容易支持其它框架。
[Javascript单元测试工具-Jest 学习笔记](https://segmentfault.com/a/1190000008628067)
[基于Jest+Enzyme的React单元测试](基于Jest+Enzyme的React单元测试)

### 安装
npm i jest -D（安装到本地）
npm i jest -g（安装到全局）

### 基本配置解读 
在package.json添加配置项"jest" : { 配置项 }
```
     "jest": {
    "transform": {
      ".(ts|tsx)": "ts-jest"
    },
    "testEnvironment": "node",
    "testRegex": "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
    "moduleFileExtensions": [
      "ts",
      "tsx",
      "js"
    ],
    "coveragePathIgnorePatterns": [
      "/node_modules/",
      "/test/"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 90,
        "functions": 95,
        "lines": 95,
        "statements": 95
      }
    },
    "collectCoverageFrom": [
      "src/*.{js,ts}"
    ]
  }
  ```

#### 配置项的作用
```
    transform:简单地说就是一种转换器配置
    "transform": {
        ".(ts|tsx)": "ts-jest",//表示的就是ts-jest工具把.ts和.tsx文件内容转换成js，因为我们现在基本上也都是用ts去编写测试代码，所以要配置转换器
        }

    testEnvironment:测试环境，默认值是：jsdom，可修改为node
    "testEnvironment": "node",//表示它是一个类浏览器的测试环境，我们可以使用浏览器环境中的一些API

    testMatch:设置识别哪些文件是测试文件（glob形式），与testRegex互斥，不能同时写
    testMatch: ['\*\*/\_\_tests\_\_/\*\*/\*.js?(x)','\*\*/?(*.)(spec|test).js?(x)']

    testRegex:要测试文件的正则表达式//表示test目录下所有以.test.ts和.spec.ts的文件都需要跑测试
    "testRegex": "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",

    moduleFileExtensions:模块文件扩展名，当你去引入一个模块并没有指定拓展名的时候，它会依次尝试去添加这些扩展名去拟引入模块文件
    "moduleFileExtensions": ["ts", "tsx","js",'js','json','jsx','node'],//表示优先找.ts的模块，其次是.tsx和.js

    coverageThreshold:测试覆盖率的阈值设定，当我们的测试覆盖率达不到阈值的时候，测试会失败
    //表示全局的代码分支覆盖率要达到90%以上，方法覆盖率达到95%，代码行数覆盖率达到95%，声明语句达到95%
    "coverageThreshold": {"global": {"branches": 90,"functions": 95,"lines": 95,"statements": 95}},

    collectCoverageFrom:收集指定文件的测试覆盖率（即使你没为这些文件编写测试，它的值为glob patterns类型）
    "collectCoverageFrom": ["src/*.{js,ts}"]//表示收集src目录以及所有组目录中的js和ts文件的测试覆盖率

    rootDir:默认值：当前目录，一般是package.json所在的目录。
    rootDir: ' '

    setupFileAfterEnv:测试框架安装后立即执行的代码文件列表
    //表示每次跑具体测试代码之前会先运行/test/boot.ts中的代码
    //<rootDir>表示当前项目的根目录
    "setupFileAfterEnv": ["<rootDir>/test/boot.ts"]

    一般配置：
    module.exports = {
        testMatch: ['<rootDir>/test/\*\*/\*.js'],
        testEnvironment: 'jsdom',
        rootDir: '',
        moduleFileExtensions: ['js','json','jsx','node']
    }
```
### config配置文件
[官方文档](https://facebook.github.io/jest/docs/en/cli.html)
jest.config.js
新建jest.config.js并添加配置项module.exports = { 配置项 }

### 运行
npx jest（安装到本地的前提下）
jest（安装到全局的前提下） 修改"script" 中的"test" 为"jest"后使用npm run test

### 基本语法
分组（Test Group）：descripe(描述语,function)
测试用例（Test Case）：test(描述语,function)
断言（Assert）：expect(运行需测试的方法并返回实际结果).toBe(预期结果)
```
        // for example
        Pencil.query =(name, url)=> {  //方法，返回捕获
            // ?hello=test&wonghan=handsome
            var reg = new RegExp('(?:\\?|&)' + name + '=(.*?)(?:&|$)')
            var ret = reg.exec(url) || []
            return ret[1]
        }
        test('query',()=>{  // testCase
            // 断言
            expect(Pencil.query('hello', '?hello=test')).toBe('test')
            expect(Pencil.query('hello', '?hello2=test')).toBe(undefined)  
            //可以写多个`ecpect()`
        })
        test('query2',()=>{
            expect(Pencil.query('hello/test', '?hello/test=test')).toBe('test')
        }) 
            //可以写多个`test()`
        describe('test query',()=>{
            test('query3',()=>{  // testCase
                // assert
                expect(Pencil.query('hello', '?hello=test')).toBe('test')
                expect(Pencil.query('hello', '?hello2=test')).toBe(undefined)
            })
        })
```
#### Jest Matcher
Matchers俗称断言库，例如上面的expect().toBe()便是其中之一，其他常见用法如下：

1.相等断言
toBe(value)： 比较数字、字符串
toEqual(value)： 比较对象、数组
toBeNull()
toBeUndefined()

2.包含断言
toHaveProperty(keyPath, value)： 是否有对应的属性
toContain(item)： 是否包含对应的值，括号里写上数组、字符串
toMatch(regexpOrString)： 括号里写上正则

3.逻辑断言
toBeTruthy()
toBeFalsy()
在JavaScript中，有六个falsy值：false，0，''，null， undefined，和NaN。其他一切都是Truthy。

toBeGreaterThan(number)： 大于
toBeLessThan(number)： 小于

4.not
取反，用法见下面例子
```
    // for example
    test('matchers',()=>{
        const a = {
            hello: 'jest',
            hi :{
                name: 'jest'
            }
        }
    const b = {
        hello: 'jest',
        hi:{
            name: 'jest'
        }
    }
    // 以下结果均为true
    expect(a).toEqual(b)
    expect([1,2,3]).toEqual([1,2,3])
    expect(null).toBeNull()
    expect([1,2,3]).toContain(1)
    expect(b).toHaveProperty('hi')
    expect('123').toContain('2')
    expect('123').toMatch(/^\d+$/)
    expect('123').not.toContain('4')
    })
```

### 常见踩坑
1. Unexpected token import
Jest 默认只支持你所使用的 node.js 版本所支持的 JS 特性，例如 import export 就不支持，所以要么你的代码使用系统 node.js 兼容的语法写 (也就是使用 require)，要么在这里使用 Babel 转义一下。

在 Jest 中使用 Babel 很简单，只需要安装 babel-jest 并新建一个 .babelrc 加入你想要的配置就行了，Jest 会自动使用 babel-jest。这里我们简单地使用 babel-preset-env 即可，对应的 .babelrc 是:
{
  "presets": ["env"]
}
在大多数时候你的项目本身就已经在使用 .babelrc 了，所以这一步甚至也省略掉了。