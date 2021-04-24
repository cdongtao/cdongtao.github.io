---
title: Postman使用
tags: [Tool,Postman]
categories: [PluginTool]
---

## Postman安装说明
### 下载与安装
[postman官方网站](https://www.postman.com/downloads/)

### 界面导航说明
![界面导航说明](/postman/1.png "界面导航说明")

### 常见4种类型的接口请求
#### 查询参数的接口请求
具体实现步骤：
1. 打开postman，新建一个请求。
2. 在请求方法中选择请求方法：GET,因为在postman中默认的请求方法就是GET,所以这一步可以忽略
3. 接口URL中输入地址，点击Send按钮就可以发送请求了 
![查询参数的接口请求](/postman/2.png "查询参数的接口请求")

#### 表单类型的接口请求
具体实现步骤：
1. 打开postman，新建一个请求
2. 在请求中设置以上四个参数，点击Send按钮。在postman中设置请求体类型为，需要选择body-> x-www-form-urlencoded
3. 查看响应数据。
![表单类型的接口请求](/postman/3.png "表单类型的接口请求")

#### 上传文件的表单请求

1. 打开postman，新建一个请求
2. 在请求中设置以上四个参数，点击Send按钮。注意：在postman中设置请求体类型，需要选择body-> form-datafile中要选择File类型，然后上传本地的文件 
3. 查看响应数据。
![上传文件的表单请求](/postman/4.png "上传文件的表单请求")

#### json类型的接口请求
具体实现步骤：
打开postman，新建一个请求
在请求中设置以上四个参数，点击Send按钮。注意：在postman中设置请求体类型，需要选择body-> raw -JSON
查看响应数据。
![json类型的接口请求](/postman/5.png "json类型的接口请求")

### 响应数据解析
![响应数据解析](/postman/6.png "响应数据解析")

####  接口管理(Collection)
先对Collection功能的使用场景做个简单总结
1. 用例分类管理，方便后期维护
2. 可以进行批量用例回归测试
实现步骤：
1. 点击Collection，点击+New Collection，在弹出的输入框中输入Collection名称（这个就可以理解为所测试的系统）
![Collection7](/postman/7.png "Collection7")
2. 选中新建的Collection右键，点击Add Folder ，在弹出对话框中输入文件夹名称（这个就可以理解为系统中的模块）
![Collection8](/postman/8.png "Collection8")
3. 选中新建的Folder，点击Add Request ，在弹出的对话框中输入请求名称，这个就是我们所测试的接口，也可以理解为测试用例 
![Collection9](/postman/9.png "Collection9")
那么通过以上三个步骤，达到的效果就是如图所示：
![Collection10](/postman/10.png "Collection10")

#### 批量执行接口请求
1. 选中一个Collection，点击右三角，在弹出的界面点击RUN
![Collection11](/postman/11.png "Collection11")
2. 这是会弹出一个叫Collection Runner的界面，默认会把Collection中的所有用例选中
![Collection12](/postman/12.png "Collection12")
3. 点击界面下方的RUN Collection，就会对Collection中选中的所有测试用例运行
![Collection13](/postman/13.png "Collection13")

* 断言统计：左上角的两个0是统计当前Collection中断言成功的执行数和失败的执行数，如果没有编写断言默认都为0
* Run Summary: 运行结果总览，点击它可以看到每个请求中具体的测试断言详细信息。Export Result：导出运行结果，默认导出的结果json文件
* Retry: 重新运行，点击它会把该Collection重新运行一遍
* New：返回到Runner，可以重新选择用例的组合.

### 日志调试
![Collection14](/postman/14.png "Collection14")
那么打印的日如何看呢 ？ 在postman中有俩个入口，第一个入口就是：view-show postman console
第二个入口就是左下角第三个图标
![Collection15](/postman/15.png "Collection15")
打开的日志界面
![Collection16](/postman/16.png "Collection16")
这里面有几个比较实用的功能：
1. 搜索日志：输入URL或者打印的日志就能直接搜索出我们想要的请求和日志，这对我们在众多日志中查找某一条日志是非常方便的 。
2. 按级别搜索：可以查询log,info,warning,error级别的日志 ，有助于我们更快定位到错误 。
3. 查看原始报文(Show raw log)：如果习惯看原始请求报文的话，这个功能可能更方便些 。
4. 隐藏请求(Hide network)：把请求都隐藏掉，只查看输出日志 

### 断言
具体如下
1. 断言编写位置：Tests标签
2. 断言所用语言：JavaScript
3. 断言执行顺序：在响应体数据返回后执行 。
4. 断言执行结果查看：Test Results
![断言](/postman/17.png "断言")
在上面我们介绍到，编写的断言代码是JavaScript，那如果不会写怎么办 ？ 不用担心，因为postman已经给我们内置了一些常用的断言 。用的时候，只需从右侧点击其中一个断言，就会在文本框中自动生成对应断言代码块

#### 状态行中的断言
* 断言状态码：Status code: code is 200
```
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);        //这里填写的200是预期结果，实际结果是请求返回结果
});
```

* 断言状态消息：Status code：code name has string
```
pm.test("Status code name has string", function () {
    pm.response.to.have.status("OK");   //断言响应状态消息包含OK
});
```

* 断言响应头中包含：Response headers:Content-Type header check
```
pm.test("Content-Type is present", function () {
    pm.response.to.have.header("Content-Type"); //断言响应头存在"Content-Type"
});
```

* 断言响应体中包含XXX字符串：Response body:Contains string
```
pm.test("Body matches string", function () {
    pm.expect(pm.response.text()).to.include("string_you_want_to_search");
});     
//注解
pm.expect(pm.response.text()).to.include("string")      获取响应文本中包含string
```

* 断言响应体等于XXX字符串：Response body : is equal to a string
```
pm.test("Body is correct", function () {
    pm.response.to.have.body("response_body_string");
});
//注解
pm.response.to.have.body("response_body_string");   获取响应体等于response_body_string
```

* 断言响应体(json)中某个键名对应的值：Response body : JSON value check
```
pm.test("Your test name", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.value).to.eql(100);
});
//注解
var jsonData = pm.response.json()   获取响应体，以json显示，赋值给jsonData .注意：该响应体必须返会是的json，否则会报错
pm.expect(jsonData.value).to.eql(100)  获取jsonData中键名为value的值，然后和100进行比较
```

* 断言响应时间：Response time is less than 200ms
```
pm.test("Response time is less than 200ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(200);   //断言响应时间<200ms
});
```

#### 案例说明
```
{
    "cityid": "101120101",
    "city": "济南",
    "update_time": "2020-04-17 10:50",
    "wea": "晴",
    "wea_img": "qing",
    "tem": "16",
    "tem_day": "20",
    "tem_night": "9",
    "win": "东北风",
    "win_speed": "3级",
    "win_meter": "小于12km/h",
    "air": "113"
}
```
* 断言响应状态码为200
* 断言city等于济南
* 断言update_time包含2020-04-17
![断言](/postman/18.png "断言")

### 变量(全局/集合/环境)
变量可以使我们在请求或脚本中存储和重复使用其值，通过将值保存在变量中，可以在集合，环境或请求中引用。
对我们做接口测试来说，又是一个非常重要的功能 。
在postman常用的三种变量分别是全局变量，环境变量，集合变量 。

* 全局变量：一旦申明了全局变量，全局有效，也就是说postman中的任何集合，任何请求中都可以使用这个变量。它的作用域是最大的 。
* 环境变量：要申明环境变量，首先的创建环境，然后在环境中才能创建变量 。如果要想使用环境变量，必须先选择(导入)这个环境，这样就可以使用这个环境下的变量了 。需要说明的是环境也可以创建多个 。每个环境下又可以有多个变量 。
* 集合变量：集合变量是针对集合的，也就是说申明的变量必须基于某个集合，它的使用范围也只是针对这个集合有效 。
其中，他们的作用域范围依次从大到小：全局变量>集合变量>环境变量 。 当在几个不同的范围内都申明了相同的变量时，则会优先使用范围最小的变量使。

想要使用变量中的值只需俩个步骤，分别是定义变量和获取变量 。

1. 定义变量（设置变量）
2. 获取变量（访问变量）

#### 定义变量
定义全局变量和环境变量，点击右上角的小齿轮，弹出如下界面，就可以根据需求定义全局变量或者环境变量了。
![定义变量](/postman/19.png "定义变量")


已经定义的全局变量和环境变量，可以进行快速查看
![定义变量](/postman/20.png "定义变量")


#### 定义集合变量
选择一个集合，打开查看更多动作(...)菜单，然后点击编辑 。选择“变量”选项卡以编辑或添加到集合变量。
![定义集合变量](/postman/21.png "定义集合变量")
定义变量除了以上方式，还有另外一种方式 。但是这种方式在不同的位置定义，编写不一样。
* 在URL，Params , Authorization , Headers , Body中定义：
1. 手工方式创建一个空的变量名
2. 在以上的位置把想要的值选中右击，选中Set：环境|全局 ，选中一个变量名，点击后就会保存到这个变量中
![定义集合变量](/postman/22.png "定义集合变量")
在Tests，Pre-requests Script：
1. 定义全局变量：pm.collectionVariables.set("变量名",变量值)
2. 定义环境变量：pm.environment.set("变量名"，变量值)
3. 定义集合变量：pm.variables.set("变量名",变量值)

####  获取变量
定义好变量，接下来就可以使用变量了 。需要注意的是，在不同的位置获取变量，编写的规则也是不一样的 。
如果在请求参数中获取变量，无论是获取全局变量，还是环境变量，还是集合变量，获取的方式都是一样的编写规则：{{变量名}} 。

* 请求参数指的是：URL，Params , Authorization , Headers , Body
如果是在编写代码的位置(Tests,Pre-requests Script)获取变量，获取不同类型的变量，编写的代码都不相同，具体如下：

1. 获取环境变量：pm.environment.get(‘变量名’)
2. 获取全局变量：pm.globals.get('变量名')
3. 获取集合变量：pm.pm.collectionVariables.get.get('变量名')
![定义集合变量](/postman/23.png "定义集合变量")

### 请求前置脚本
前置脚本其实就是在Pre-requests Script中编写的JavaScript脚本，想要了解这个功能，需要先了解它的执行顺序。那么下面就来看下它的执行顺序 。

可以看出，一个请求在发送之前，会先去执行Pre Request Script（前置脚本）中的代码 。那么这个功能在实际工作中有什么作用呢 ？

主要场景：一般情况下，在发送请求前需要对接口的数据做进一步处理，就都可以使用这个功能，比如说，登录接口的密码，在发送前需要做加密处理，那么就可以在前置脚本中做加密处理，再比如说，有的接口的输入参数有一些随机数，每请求一次接口参数值都会发送变化，就可以在前置脚本中编写生成随机数的代码 。总体来说，就是在请求接口之前对我们的请求数据进行进一步加工处理的都可以使用前置脚本这个功能。
![定义集合变量](/postman/24.png "定义集合变量")

实现步骤：
1. 在前置脚本中编写生成随机数
2. 将这个值保存成环境变量
3. 将参数t的值替换成环境变量的值 。
![定义集合变量](/postman/25.png "定义集合变量")

### 接口关联
在我们测试的接口中，经常出现这种情况 。 上一个接口的返回数据是下一个接口的输入参数 ，那么这俩个接口就产生了关联。 这种关联在做接口测试时非常常见，那么在postman中，如何实现这种关联关系呢 ？

实现思路：
1. 提取上一个接口的返回数据值，
2. 将这个数据值保存到环境变量或全局变量中
3. 在下一个接口获取环境变量或全局变量

案例：
用户上传头像功能，需要用户先上传一张图片，然后会自动预览 。那么在这个过程中，会调用到俩个接口 ，第一个上传头像接口，第二个预览图像接口 。
其中调用上传头像接口成功后会返回如下信息：
![定义集合变量](/postman/26.png "定义集合变量")
实现步骤：
1. 获取上传头像接口返回url的值
2. 将这个值保存成全局变量(环境变量也可以)
3. 在图像预览中使用全局变量

### 常见返回值获取
在做接口测试时，请求接口返回的数据都是很复杂的json数据，有着多层嵌套，这样的数据层级在postman怎么获取呢 ？
#### 案例1：多层json嵌套, 获取user_id的值
```
{
    "code": 0,
    "message": "请求成功！",
    "data": {
        "user_id": "1252163151781167104"
    }
}
//获取json体数据
var jsonData = pm.response.json()
// 获取user_id的值,通过.获取
var user_id = jsonData.data.user_id
```
#### 案例2：json中存在列表，获取points中的第二个元素
```
{
    "code": 0,
    "message": "请求成功！",
    "data": {
        "roles": {
            "api": [
                "API-USER-DELETE"
            ],
            "points": [
                "point-user-delete",
                "POINT-USER-UPDATE",
                "POINT-USER-ADD"
            ]
        },
        "authCache": null
    }
}
//获取json体数据
var jsonData = pm.response.json()
// 获取user_id的值,通过下标获取列表中某个元素
var user_id = jsonData.data.roles.points[1]
```
案例3：列表中取最后一个元素
```
{
    "code": 0,
    "message": "请求成功！",
    "data": {
        "total": 24,
        "rows": [
           
            {
                "id": "1066370498633486336",
                "mobile": "15812340003",
                "username": "zbz"
            },
            {
                "id": "1071632760222810112",
                "mobile": "16612094236",
                "username": "llx"
            },
            ...
            {
                "id": "1075383133106425856",
                "mobile": "13523679872",
                "username": "test001",
       
            }
    }
}

//获取json体数据
var jsonData = pm.response.json()
// 获取id的值,通过slice(-1)获取列表中最后一个元素。
var id = jsonData.data.rows.slice(-1)[0]
```