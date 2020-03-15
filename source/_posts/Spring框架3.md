---
title: Spring 框架3
tags: [spring-AOP原理]
categories: [架构]
---

## AOP(Aspect Oriented Programming)
OOP允许开发者定义纵向的关系,在OOP设计中，它导致了大量代码的重复，而不利于各个模块的重用。AOP技术恰恰相反，它利用一种称为"横切"的技术，剖解开封装的对象内部，并将那些影响了多个类的公共行为封装到一个可重用模块(抽象出全局方法)，并将其命名为"Aspect"，即切面。所谓"切面"，简单说就是那些与业务无关，却为业务模块所共同调用的逻辑或责任封装起来，便于减少系统的重复代码，降低模块之间的耦合度，并有利于未来的可操作性和可维护性。

使用"横切"技术，AOP把软件系统分为两个部分：核心关注点和横切关注点。业务处理的主要流程是核心关注点，与之关系不大的部分是横切关注点。横切关注点的一个特点是，他们经常发生在核心关注点的多处，而各处基本相似，比如权限认证、日志、事物。AOP的作用在于分离系统中的各种关注点，将核心关注点和横切关注点分离开来。

## 提出问题及解决思路
现在提出这样一个需求：

1.拦截某个类或全部业务方法。
2.判断用户是否有权限，有权限就允许他执行业务方法，没有权限就不允许他执行业务方法。(是否有权限是根据user是否为null作为判断依据的)
![AOP解决方案](/img/AOP.png "AOP解决方案")

解决方法：
1.最直接得方法是：所有方法都加上判断.//不是实际
2.做个过滤器：适合拦截所有业务；但是不是合适拦截某个类得业务
3.AOP使用代理处理：适合所有业务或某个业务；在执行目标前创建代理，在代理这一层做处理,满足处理条件后再调用真实对象处理得方法处理业务(动态代理就是动态得将需要处理业务包装成一个新类新方法里面，这样就能在包装得新方法处理业务前后处理切面需求)


## AOP代理技术
#### JDK动态代理 && Cglib技术 差异
1.JDK的动态代理有个限制，就是使用动态代理的目标对象必须实现至少一个接口，由此，没有实现接口但是想要使用代理的目标对象，就可以使用Cglib代理。
2.Cglib是强大的高性能的代码生成包，它可以在运行期间拓展Java类与实现Java接口。它广泛的被许多AOP的框架使用，例如Spring AOP和synaop，为他们提供方法的interception(拦截)。
3.Cglib包的底层是通过使用一个小而快的字节码处理框架ASM来转换字节码并生成新的类，不鼓励直接只使用ASM，因为它要求你必须对JVM内部结构，包括class文件的格式和指令集都很熟悉。


#### JDK动态代理技术
必须条件：
1.存在接口(原对象必须是以接口形式实现得对象)
2.实现InvocationHandler接口，重写invoke方法
或 Proxy.newProxyInstance实现
```
public class JDKProxyFactory implements InvocationHandler {
    private Object targetObject; // 代理的目标对象

    public Object createProxyInstance(Object targetObject) {
        this.targetObject = targetObject; 
        /*
         * 第一个参数设置代码使用的类装载器，一般采用跟目标类相同的类装载器
         * 第二个参数设置代理类实现的接口
         * 第三个参数设置回调对象，当代理对象的方法被调用时，会委派给该参数指定对象的invoke方法
         */
        return Proxy.newProxyInstance(this.targetObject.getClass().getClassLoader(), 
                this.targetObject.getClass().getInterfaces(), this);
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        PersonServiceBean bean = (PersonServiceBean)this.targetObject;
        Object result = null;
        if (bean.getUser() != null) { // 有权限
            result = method.invoke(targetObject, args); // 把方法调用委派给目标对象
        }
        return result;
    }
}
```

```
public Object getProxyInstance() {
    return Proxy.newProxyInstance(
     target.getClass().getClassLoader(),target.getClass().getInterfaces(), new InvocationHandler() {
                @Override
                public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                    System.out.println("日志打印： before");
                    //执行目标对象方法
                    Object returnValue = method.invoke(target,args;
                    System.out.println("日志打印： after");
                    return returnValue;
                }
            });
    }
```


#### CGLIB动态代理技术

Cglib代理，也叫做子类代理，它是在内存中构件一个子类对象，从而实现对目标对象的功能拓展。
注：通过类继承方式实现动态代理(不存在接口);实现MethodInterceptor 接口重写intercept方法
在Maven中可以直接在POM.xml中添加下列引用即可。
```
<!-- https://mvnrepository.com/artifact/cglib/cglib -->
<dependency>
    <groupId>cglib</groupId>
    <artifactId>cglib</artifactId>
    <version>3.2.5</version>
</dependency>
```
>如果不是maven项目，除了到cglib包还需要导入asm.jar包，不然会报异常

```
public class MyProxyByGclib implements MethodInterceptor {
    
    //维护目标对象
    private Object target;
    
   
    public MyProxyByGclib(Object target) {
        this.target = target;
    }
    
    public Object getProxyInstance() {
        //1. 实例化工具类
        Enhancer en = new Enhancer();
        //2. 设置父类对象
        en.setSuperclass(this.target.getClass());
        //3. 设置回调函数
        en.setCallback(this);
        //4. 创建子类，也就是代理对象
        return en.create();
    }

    @Override
    public Object intercept(Object proxy, Method method, Object[] objects, MethodProxy arg3) throws Throwable {
        System.out.println("Begin Transaction");
        //执行目标对象的方法
        Object returnValue = method.invoke(target, objects);
        System.out.println("End Transaction");
        return returnValue;
    }
    
    public static void main(String[] args) {
        //目标对象
        MyServiceImpl myService = new MyServiceImpl();
        //生成代理对象
        MyServiceImpl myProxy = (MyServiceImpl)new MyProxyByGclib(myService).getProxyInstance();
        //调用对象方法
        myProxy.eat();
        myProxy.sleep();
    }

}
```



## 实现AOP方式(xml配置 || 注解方式)
### AOP 核心概念

![AOP核心概念](/img/AOP核心概念.png "AOP核心概念")

1. 切面（Aspect）
　　对哪些方法进行拦截，拦截后怎么处理，这些关注点称之为横切关注点。切面就是在一个怎么样的环境中工作。类是对物体特征的抽象，切面就是对横切关注点的抽象。比如数据库的事务直接贯穿了整个代码层面，这就是一个切面，它能够在被代理对象的方法之前,之后,产生异常或者正常返回后切入你的代码，甚至代替原来被代理对象的方法，在动态代理中可以把它理解成一个拦截器。

2. 通知（Adice）
　　•通知是切面开启后，切面的方法。它根据在代理对象真实方法调用前、后的顺序和逻辑区分，它和约定游戏的例子里的拦截器的方法十分接近。
　　•前置通知（before）：在动态代理反射原有对象方法或者执行环绕通知前执行的通知功能。
　　•后置通知（after）： 在动态代理反射原有对象方法或者执行环绕通知后执行的通知功能。无论是否抛出异常，它都会被执行。
　　•返回通知（afterReturning）：在动态代理反射原有对象方法或者执行环绕通知后执行的通知功能。
　　•异常通知（afterThrowing）：在动态代理反射原有对象方法或者执行环绕通知产生异常后执行的通知功能。
　　•环绕通知（aroundThrowing）：在动态代理中，它可以取代当前被拦截对象的方法，通过参数或反射调用被拦截对象的方法。

>afterReturning处理>after处理:afterReturning 在处理在after处理前

3. 引入（Introduction）
　　在不修改代码的前提下，引入可以在运行期为类动态地添加一些方法或字段.

4. 切入点（Pointcut）
　　在动态代理中，被切面拦截的方法就是一个切点，切面将可以将其切点和被拦截的方法按照一定的逻辑织入到约定流程当中.

5. 连接点（join point）
　　连接点是一个判断条件，由它可以指定哪些是切点。对于指定的切点，Spring会生成代理对象去使用对应的切面对其拦截，否则就不会拦截它。被拦截到的点，因为Spring只支持方法类型的连接点，所以在Spring中连接点指的就是被拦截到的方法，实际上连接点还可以是字段或者构造器

6. 织入（Weaving）
　　织入是一个生成代理对象的过程。实际代理的方法分为静态代理和动态代理。静态代理是在编译class文件时生成的代码逻辑，但是在Spring中并不使用这样的方式，所以我们就不展开讨论了。一种是通过ClassLoader也就是在类加载的时候生成的代码逻辑，但是它在应用程序代码运行前就生成对应的逻辑。还有一种是运行期，动态生成代码的方式，这是Spring AOP所采用的方式，Spring是以JDK和CGLIB动态代理来生成代理对象的


### 1.Spring xml配置文件

下面给出一个Spring AOP的.xml文件模板，名字叫做aop.xml，之后的内容都在aop.xml上进行扩展：

使用Spring AOP，只用Spring提供给开发者的jar包是不够的，请额外上网下载两个jar包：
1、aopalliance.jar
2、aspectjweaver.jar

```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:aop="http://www.springframework.org/schema/aop"
    xmlns:tx="http://www.springframework.org/schema/tx"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans-4.2.xsd
        http://www.springframework.org/schema/aop
        http://www.springframework.org/schema/aop/spring-aop-4.2.xsd">
        
        <bean id="helloWorldImpl1" class="com.xrq.aop.HelloWorldImpl1" />
        <bean id="helloWorldImpl2" class="com.xrq.aop.HelloWorldImpl2" />
        <bean id="timeHandler" class="com.xrq.aop.TimeHandler" />
        <bean id="logHandler" class="com.xrq.aop.LogHandler" />
        
        // 要想让logHandler在timeHandler前使用有两个办法：
        //（1）aspect里面有一个order属性，order属性的数字就是横切关注点的顺序
        //（2）把logHandler定义在timeHandler前面，Spring默认以aspect的定义顺序作为织入顺序
        <aop:config>
            <aop:aspect id="time" ref="timeHandler" order="1">
                <aop:pointcut id="addTime" expression="execution(* com.xrq.aop.HelloWorld.print*(..))" />
                <aop:before method="printTime" pointcut-ref="addTime" />
                <aop:after method="printTime" pointcut-ref="addTime" />
            </aop:aspect>
            <aop:aspect id="log" ref="logHandler" order="2">
                <aop:pointcut id="printLog" expression="execution(* com.xrq.aop.HelloWorld.do*(..))" />
                <aop:before method="LogBefore" pointcut-ref="printLog" />
                <aop:after method="LogAfter" pointcut-ref="printLog" />
            </aop:aspect>
        </aop:config>
</beans>


强制使用CGLIB生成代理
前面说过Spring使用动态代理或是CGLIB生成代理是有规则的，高版本的Spring会自动选择是使用动态代理还是CGLIB生成代理内容，当然我们也可以强制使用CGLIB生成代理，那就是<aop:config>里面有一个"proxy-target-class"属性，这个属性值如果被设置为true，那么基于类的代理将起作用，如果proxy-target-class被设置为false或者这个属性被省略，那么基于接口的代理将起作用
```








