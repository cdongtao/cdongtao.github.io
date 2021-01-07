---
title: Spring 框架0
tags: [反射机制]
categories: [FrameWork]
---
## 解释型语言和编译型语言

解释型语言：不需要编译，在运行的时候逐行翻译解释；修改代码时可以直接修改，可以快速部署，不过性能上会比编译型语言稍差；比如 JavaScript、Python ；

编译型语言：需要通过编译器将源代码编译成机器码才能执行；编译之后如果需要修改代码，在执行之前就需要重新编译。比如 C 语言；

Java 严格来说也是编译型语言，但又介于编译型和解释型之间；Java 不直接生成机器码而是生成中间码：编译期间，是将源码交给编译器生成 class 文件（字节码），这个过程中只做了翻译的工作，并没有把代码放入内存运行；当进入运行期，字节码才被 Java 虚拟机加载、解释成机器语言并运行。

![Java加载机制](/img/Java加载机制.png "Java加载机制")

## 动态语言和静态语言
动态语言：是指程序在运行时可以改变自身结构，在运行时确定数据类型，一个对象是否能执行某操作，只取决于它有没有对应的方法，而不在乎它是否是某种类型的对象；比如 JavaScript、Python。

静态语言：相对于动态语言来说，在编译时变量的数据类型就已经确定（使用变量之前必须声明数据类型），在编译时就会进行类型是否匹配；比如 C 语言、Java ；

## 反射的概念
Java 反射机制：在运行过程中，对于任意一个类，都能知道其所有的属性和方法；对于任意一个对象，都能调用其属性和方法；这种动态获取类信息和调用对象方法的功能，就是 Java 反射机制。

既然反射里面有一个“反”字，那么我们先看看何为“正”。

在 Java 中，要使用一个类中的某个方法，“正向”都是这样的：
```
ArrayList list = new ArrayList(); //实例化
list.add("reflection");  //执行方法
```
那么反向（反射）要如何实现？
```
Class clz = Class.forName("java.util.ArrayList");
Method method_add = clz.getMethod("add",Object.class);
Constructor constructor = clz.getConstructor();
Object object = constructor.newInstance();
method_add.invoke(object, "reflection");

Method method_get = clz.getMethod("get",int.class);
System.out.println(method_get.invoke(object, 0));
```
两段代码执行的结果是一样的，但是“正向”代码在编译前，就已经明确了要运行的类是什么（ArrayList），而第二段代码，只有在代码运行时，才知道运行的类是 java.util.ArrayList。

## 反射的作用

讲到这里，有些同学可能会有疑问：“反射有什么用？我明明都已经知道了要使用的类是 ArrayList ，我不能直接 new 一个对象然后执行里面的方法么？”

当然可以！不过很多场景中，在代码运行之前并不知道需要使用哪个类，或者说在运行的时候才决定使用哪个类；

比如有这么一个功能：“调用阿里云的人脸识别 API ”；这还不简单，参考对方的 API 文档，很快就能实现。

上线一个月后，领导说：“咱公司开始和腾讯云合作了，人脸识别的接口改一下吧”。
修改上线运行了两个月，领导说：“换回来吧”...  ...

当然有聪明的程序员会想到设置一个开关配置，让开关决定走哪段代码逻辑，如果领导哪天想变成亚马逊云的服务，继续写 if-else 就好了：
```
faceRecognition(Object faceImg){
if("AL".equals(configStr)){
    //调用阿里云的人脸识别 API
  }else if("TX".equals(configStr)){
    //调用腾讯云的人脸识别 API
  }else if("AM".equals(configStr)){
    //调用亚马逊云的人脸识别 API
  }
}
```

定义一个接口：
```
interface FaceRecognitionInterface(){
  faceRecognition(Object faceImg) ;
}
```
多个实现类：
```   
class ALFaceRecognition implements FaceRecognitionInterface{
//调用阿里云的人脸识别 API 的实现
}
```
```
class TXFaceRecognition implements FaceRecognitionInterface{
//调用腾讯云的人脸识别 API 的实现
}
```

在调用人脸识别功能的代码中：
String configStr = "读取配置，走阿里云还是腾讯云";
FaceRecognitionInterface faceRe = Class.forName(configStr).newInstance();
faceRe.faceRecognition(faceImg);	

如果上面这个例子，你依然觉得在调用方法中做 if-else 判断，和使用反射实现并没有差太多，但是如果程序员 A 提供接口，程序员 B 提供实现，程序员 C 写客户端呢？

回忆一下 JDBC 的使用，比如创建一个连接：
```
public Connection getConnection() throws Exception{
  Connection conn = null;
//初始化驱动类
  Class.forName("com.mysql.jdbc.Driver");
  conn = DriverManager.getConnection("jdbc:mysql://url","root", "admin");
return conn;
}	
```

其中：
程序员 A 提供接口：Oracle 公司（之前的 Sun）提供 JDBC 标准（接口）。
程序员 B 提供实现：各个数据库厂商提供针对自家数据库的实现。
程序员 C 写客户端：我等码农在 Java 中敲代码访问数据库。

总结一下Java 反射的作用：可以设计出更为通用和灵活的架构，很多框架为了保证其通用性，可以根据配置加载不用的类，这时候要用到反射。除此之外：

动态代理：在不改变目标对象方法的情况下对方法进行增强，比如使用 AOP 拦截某些方法打印日志，这就需要通过反射执行方法中的内容。

注解：利用反射机制，获取注解并执行对应的行为。

### 用反射的用法

上文中我们知道了 Java 运行期的源文件是 class 文件（字节码），所以要使用反射，那么就需要获取到字节码文件对象，在 Java 中，获取字节码文件对象有三种方式：

调用某个类的 class 属性：类名.class
调用对象的 getClass() 方法：对象.getClass()
使用 Class 类中的 forName() 静态方法：Class.forName(类的全路径) ，建议使用这种方法
java.lang.reflect 类库提供了对反射的支持：
Field ：可以使用 get 和 set 方法读取和修改对象的属性；
Method ：可以使用 invoke() 方法调用对象中的方法；
Constructor ：可以用 newInstance() 创建新的对象。

### 反射的优缺点

优点：在运行时动态获取类和对象中的内容，极大地提高系统的灵活性和扩展性；夸张一些说，反射是框架设计的灵魂。

缺点：会有一定的性能损耗，JVM 无法对这些代码进行优化；破坏类的封装性。

总之，可能大家在平时的开发过程中，感觉自己并没有写过反射相关的代码，但是在我们用到的各种开源框架中，反射无处不在。
