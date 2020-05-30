---
title:  Eslint规范
tags: [webpack,Eslint]
categories: [FrontEnd]
---


## 添加包
  
  npm install eslint --save-dev
  npm install eslint-config-airbnb --save-dev //Airbnb的标准（配置文件的extends里没用airbnb的话可以不装）
  npm install eslint-plugin-import --save-dev  //Airbnb标准必需。用来校验 import 的，比如不能加 .js 后缀
  npm install eslint-plugin-jsx-a11y --save-dev //Airbnb标准必需
  npm install eslint-plugin-react --save-dev  //支持 react 语法
  npm install babel-eslint --save-dev  //兼容ES处于实验性阶段的语法，如类属性用”=“赋值
  npm install eslint-loader --save-dev //在webpack中解析
  npm install eslint-plugin-babel //兼容处于实验阶段的特征
  npm install eslint-plugin-vue

## 创建修改.eslintrc文件

### 创建
eslint --init 命令自动生成，也可以自己新建。
.eslintrc.js - 使用 .eslintrc.js 然后输出一个配置对象
.eslintrc（已弃用） 

### 修改
添加规则；rules中的值0、1、2分别表示不开启检查、警告、错误
#### plugin属性 
ESLint 支持使用第三方插件（以eslint-plugin-开头的npm包），在使用插件之前，必须使用 npm 安装。如eslint-plugin-react、eslint-plugin-vue等

#### extends属性
一个配置文件可以被基础配置中的已启用的规则继承。可以使用以下规则继承：

1. "extends": "eslint:recommended",
2. "extends": "standard",   //使用别人写好的规则包（以eslint-config-开头的npm包），如eslint-config-standard
3. "extends": "eslint:all"  //使用"eslint:all"，继承Eslint中所有的核心规则项
4. "extends": "airbnb",    //使用Eslint插件中命名的配置:airbnb标准公认最好
   1. 设置多个标准

  plugins: [
    'react'
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],


#### rules属性(根据自己的需要进行配置)
##### Eslint部分核心规则

  "rules": {
      //这些规则与 JavaScript 代码中可能的错误或逻辑错误有关
      "for-direction":2,//强制 “for” 循环中更新子句的计数器朝着正确的方向移动
      "getter-return":2,//强制在 getter 属性中出现一个 return 语句
      "no-await-in-loop":2,//禁止在循环中 出现 await
      "no-compare-neg-zer":2,//禁止与 -0 进行比较
      "no-cond-assign":[ 2, "always"],//禁止在条件语句中出现赋值操作符
      "no-console":2,
      "no-constant-condition":2,//禁止在条件中使用常量表达式
      "no-control-regex":2,//禁止在正则表达式中使用控制字符
      "no-debugger":2,//禁用 debugger
      "no-dupe-args":2,//禁止在 function 定义中出现重复的参数
      "no-dupe-keys":2,//禁止在对象字面量中出现重复的键
      "no-duplicate-case":2,//禁止重复 case 标签
      "no-empty":2,//禁止空块语句
      "no-empty-character-class":2,//禁止在正则表达式中出现空字符集
      "no-ex-assign":2,//禁止对 catch 子句中的异常重新赋值
      "no-extra-boolean-cast":2,//禁止不必要的布尔类型转换
      "no-extra-parens":2,//禁止冗余的括号
      "no-extra-semi":2,//禁用不必要的分号
      "no-func-assign":2,//禁止对 function 声明重新赋值
      "no-inner-declarations":2,//禁止在嵌套的语句块中出现变量或 function 声明
      "no-invalid-regexp":2,//禁止在 RegExp 构造函数中出现无效的正则表达式
      "no-irregular-whitespace":2,//禁止不规则的空白
      "no-obj-calls":2,//禁止将全局对象当作函数进行调用
      "no-prototype-builtins":2,//禁止直接使用 Object.prototypes 的内置属性
      "no-regex-spaces":2,//禁止正则表达式字面量中出现多个空格
      "no-sparse-arrays": 2,//禁用稀疏数组
      "no-template-curly-in-string":2,//禁止在常规字符串中出现模板字面量占位符语法
      "no-unexpected-multiline":2,//禁止使用令人困惑的多行表达式
      "no-unreachable":2,//禁止在 return、throw、continue 和 break 语句后出现不可达代码
      "no-unsafe-finally":2,//禁止在 finally 语句块中出现控制流语句
      "no-unsafe-negation":2,//禁止对关系运算符的左操作数使用否定操作符
      "use-isnan":2,//要求调用 isNaN()检查 NaN
      "valid-jsdoc":2,//强制使用有效的 JSDoc 注释
      "valid-typeof":2,//强制 typeof 表达式与有效的字符串进行比较
      "accessor-pairs":2,//强制getter/setter成对出现在对象中
      "array-callback-return":2,//强制数组方法的回调函数中有 return 语句
      "block-scoped-var":2,//把 var 语句看作是在块级作用域范围之内
      "class-methods-use-this":2,//强制类方法使用 this
      "complexity":2//限制圈复杂度
    }  

##### eslint-plugin-vue中的规则

    rules: {
      /* for vue */
      // 禁止重复的二级键名
      // @off 没必要限制
      'vue/no-dupe-keys': 'off',
      // 禁止出现语法错误
      'vue/no-parsing-error': 'error',
      // 禁止覆盖保留字
      'vue/no-reservered-keys': 'error',
      // 组件的 data 属性的值必须是一个函数
      // @off 没必要限制
      'vue/no-shared-component-data': 'off',
      // 禁止 <template> 使用 key 属性
      // @off 太严格了
      'vue/no-template-key': 'off',
      // render 函数必须有返回值
      'vue/require-render-return': 'error',
      // prop 的默认值必须匹配它的类型
      // @off 太严格了
      'vue/require-valid-default-prop': 'off',
      // 计算属性必须有返回值
      'vue/return-in-computed-property': 'error',
      // template 的根节点必须合法
      'vue/valid-template-root': 'error',
      // v-bind 指令必须合法
      'vue/valid-v-bind': 'error',
      // v-cloak 指令必须合法
      'vue/valid-v-cloak': 'error',
      // v-else-if 指令必须合法
      'vue/valid-v-else-if': 'error',
      // v-else 指令必须合法
      'vue/valid-v-else': 'error',
      // v-for 指令必须合法
      'vue/valid-v-for': 'error',
      // v-html 指令必须合法
      'vue/valid-v-html': 'error',
      // v-if 指令必须合法
      'vue/valid-v-if': 'error',
      // v-model 指令必须合法
      'vue/valid-v-model': 'error',
      // v-on 指令必须合法
      'vue/valid-v-on': 'error',
      // v-once 指令必须合法
      'vue/valid-v-once': 'error',
      // v-pre 指令必须合法
      'vue/valid-v-pre': 'error',
      // v-show 指令必须合法
      'vue/valid-v-show': 'error',
      // v-text 指令必须合法
      'vue/valid-v-text': 'error',
      // @fixable html 的结束标签必须符合规定
      // @off 有的标签不必严格符合规定，如 <br> 或 <br/> 都应该是合法的
      'vue/html-end-tags': 'off',
      // 计算属性禁止包含异步方法
      'vue/no-async-in-computed-properties': 'error',
      // 禁止出现难以理解的 v-if 和 v-for
      'vue/no-confusing-v-for-v-if': 'error',
      // 禁止出现重复的属性
      'vue/no-duplicate-attributes': 'error',
      // 禁止在计算属性中对属性修改
      // @off 太严格了
      'vue/no-side-effects-in-computed-properties': 'off',
      // 禁止在 <textarea> 中出现 {{message}}
      'vue/no-textarea-mustache': 'error',
      // 组件的属性必须为一定的顺序
      'vue/order-in-components': 'error',
      // <component> 必须有 v-bind:is
      'vue/require-component-is': 'error',
      // prop 必须有类型限制
      // @off 没必要限制
      'vue/require-prop-types': 'off',
      // v-for 指令的元素必须有 v-bind:key
      'vue/require-v-for-key': 'error',
      // @fixable 限制自定义组件的属性风格
      // @off 没必要限制
      'vue/attribute-hyphenation': 'off',
      // html 属性值必须用双引号括起来
      'vue/html-quotes': 'error',
      // @fixable 没有内容时，组件必须自闭和
      // @off 没必要限制
      'vue/html-self-closing': 'off',
      // 限制每行允许的最多属性数量
      // @off 没必要限制
      'vue/max-attributes-per-line': 'off',
      // @fixable 限制组件的 name 属性的值的风格
      // @off 没必要限制
      'vue/name-property-casing': 'off',
      // @fixable 禁止出现连续空格
      // TODO: 李德广  触发 新版本 typeerror：get 'range' of undefined
      // 'vue/no-multi-spaces': 'error',
      // @fixable 限制 v-bind 的风格
      // @off 没必要限制
      'vue/v-bind-style': 'off',
      // @fixable 限制 v-on 的风格
      // @off 没必要限制
      'vue/v-on-style': 'off',
      // 定义了的 jsx element 必须使用
      'vue/jsx-uses-vars': 'error',
  },

##### eslint-plugin-react中的规则

    'react/boolean-prop-naming': [2, { rule: '^is[A-Z]([A-Za-z0-9]?)+' }], // bool类型的props强制固定命名
    'react/button-has-type': [2, { reset: false }], // 强制按钮的type属性必须是"button","submit","reset"三者之一
    'react/default-props-match-prop-types': [2, { allowRequiredDefaults: false }], // 强制所有defaultProps有对应的non-required PropType
    'react/destructuring-assignment': [1, 'always'], // 强制将props,state,context解构赋值
    'react/forbid-component-props': [1], // 禁止在自定义组件中使用(className, style)属性
    'react/forbid-dom-props': [1, { forbid: ['style'] }], // 禁止在dom元素上使用禁止的属性
    'react/forbid-elements': [1, { forbid: ['button'] }], // 禁止某些元素用于其他元素
    'react/no-access-state-in-setstate': 2, // 禁止在setState中使用this.state
    'react/no-children-prop': [1], // 不要把Children当做属性
    'react/no-string-refs': [1], // 不要使用string类型的ref
    'react/no-unused-state': [1], // 不要在state中定义未使用的变量
    'react/display-name': [1, { ignoreTranspilerName: false }], // react组件中强制定义displayName
    'react/jsx-no-undef': [1, { allowGlobals: false }], // 不允许使用未声明的变量
    'react/forbid-prop-types': [1], // 禁止某些propTypes属性类型
    'react/jsx-key': [1], // 遍历使用key


## 配置.eslintignore

  build/*.js
  config/*.js

## 禁用/启用 eslint

  /* eslint-disable */
  /* eslint-enable */


## 配置 webpack.config.js
用 webpack-dev-server 起的服务会用 eslint 对代码进行检验，并把检验结果输出在控制台。
如果只要每个人 VSCode 对代码进行检验就不用配置了

    {
        test: /.(js|jsx|mjs)$/,
        enforce: 'pre',
        use: [
        {
          options: {
          formatter: eslintFormatter,
          eslintPath: require.resolve('eslint'),
          
          },
          loader: require.resolve('eslint-loader'),
        },
        ],
        include: paths.appSrc, //也可以用exclude排除不需要检查的目录或者用.eslintignore
    }


