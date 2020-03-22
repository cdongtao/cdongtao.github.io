---
title: Spring 框架3
tags: [spring-AOP原理]
categories: [FrameWork]
---

## AOP(Aspect Oriented Programming)
OOP允许开发者定义纵向的关系,在OOP设计中，它导致了大量代码的重复，而不利于各个模块的重用。AOP技术恰恰相反，它利用一种称为"横切"的技术，剖解开封装的对象内部，并将那些影响了多个类的公共行为封装到一个可重用模块(抽象出全局方法)，并将其命名为"Aspect"，即切面。所谓"切面"，简单说就是那些与业务无关，却为业务模块所共同调用的逻辑或责任封装起来，便于减少系统的重复代码，降低模块之间的耦合度，并有利于未来的可操作性和可维护性。

使用"横切"技术，AOP把软件系统分为两个部分：核心关注点和横切关注点。业务处理的主要流程是核心关注点，与之关系不大的部分是横切关注点。横切关注点的一个特点是，他们经常发生在核心关注点的多处，而各处基本相似，比如权限认证、日志、事物。AOP的作用在于分离系统中的各种关注点，将核心关注点和横切关注点分离开来。

>SpringAOP、事物原理、日志打印、权限控制、远程调用、安全代理 可以隐蔽真实角色
Spring声明式事务管理器类：
Jdbc技术：DataSourceTransactionManager
Hibernate技术：HibernateTransactionManager

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

    @Override // @Around--->从另一种角度看：整个方法可看作环绕通知,代理生产最新整个方法
    public Object intercept(Object proxy, Method method, Object[] objects, MethodProxy arg3){
        System.out.println("Begin Transaction");
            // @Before----> 前置通知(所谓通知，就是我们拦截到业务方法之后所要干的事情)
        try {
            //执行目标对象的方法
            Object returnValue = method.invoke(target, objects);
            //@AfterReturning ----> 后置通知
            } catch (RuntimeException e) {
            //@AfterThrowing ----> 异常通知
            } finally {
            // @After ----> 最终通知
            }
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

>afterReturning处理< after处理:afterReturning 在处理在after处理后

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

### 实现AOP的注解方式

```
开启事物注解权限：传统spring xml配置开启注解模式
    <aop:aspectj-autoproxy></aop:aspectj-autoproxy>
```
五个注解: 
@Aspect 指定一个类为切面类
@Pointcut(“execution(* com.itmayiedu.service.UserService.add(…))”) 指定切入点表达式
@Before(“pointCut_()”) 前置通知: 目标方法之前执行
@After(“pointCut_()”) 后置通知：目标方法之后执行（始终执行）
@AfterReturning(“pointCut_()”) 返回后通知： 执行方法结束前执行(异常不执行)
@AfterThrowing(“pointCut_()”) 异常通知: 出现异常时候执行
@Around(“pointCut_()”) 环绕通知： 环绕目标方法执行


```
@Aspect
public class MyInterceptor {
    @Pointcut("execution (* cn.itcast.service.impl.PersonServiceImpl.*(..))")
    private void anyMethod() {} // 声明一个切入点，anyMethod为切入点名称

    // 声明该方法是一个前置通知：在目标方法开始之前执行 
   1. @Before("anyMethod()")
    public void doAccessCheck() {
        System.out.println("前置通知");
    }

   2. @AfterReturning("anyMethod()")
    public void doAfterReturning() {
        System.out.println("后置通知");
    }

   3. @After("anyMethod()")
    public void doAfter() {
        System.out.println("最终通知");
    }

   4. @AfterThrowing("anyMethod()")
    public void doAfterThrowing() {
        System.out.println("异常通知");
    }

   5. @Around("anyMethod()")
    public Object doBasicProfiling(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("进入方法");
        Object result = pjp.proceed();
        System.out.println("退出方法");
        return result;
    }
}

```

#### 注解执行顺序
```
@Override // @Around--->从另一种角度看：整个方法可看作环绕通知,代理生产最新整个方法
public Object intercept(Object proxy, Method method, Object[] objects, MethodProxy arg3){
        //@Around进入方法
        // @Before----> 前置通知(所谓通知，就是我们拦截到业务方法之后所要干的事情)
    try {
        //执行目标对象的方法
        Object returnValue = method.invoke(target, objects);
        //@AfterReturning ----> 后置通知
        } catch (RuntimeException e) {
        //@AfterThrowing ----> 异常通知
        } finally {
        // @After ----> 最终通知
        }
    System.out.println("End Transaction");
    return returnValue;
        //@Around退出方法 
}
```
>@Around进入方法-->@Before-->目标函数-->@AfterReturning(or @AfterThrowing)-->@After-->@Around退出方法 

不同切面间的执行顺序:多个切面嵌套
如果知道上面的执行顺序，不同 Aspect 切面的执行顺序很好理解。
首先根据 @Order 注解，或者 xml 中的顺序，先进入到顺序靠前的切面。
然后我们只需要把上面执行顺序中执行目标函数位置替换为第二个切面的执行顺序，同理，第三个切面的执行位置，就是把第二个切面的执行顺序里面执行目标函数替换即可，以此类推。

需要注意的是异常的抛出，我们的环绕通知是有能力捕获目标函数异常并且不抛出的，如果捕获并且不抛出，会触发后置返回通知而不会触发后置异常通知，同时也会影响其他切面的执行。所以我们捕获处理后，还要抛出去。

#### 切入点表达式
##### 切入点指示符
　　切入点指示符用来指示切入点表达式目的，在Spring AOP中目前只有执行方法这一个连接点，Spring AOP支持的AspectJ切入点指示符如下：

execution：用于匹配方法执行的连接点；
within：用于匹配指定的类及其子类中的所有方法。
this：匹配可以向上转型为this指定的类型的代理对象中的所有方法。
target：匹配可以向上转型为target指定的类型的目标对象中的所有方法。
args：用于匹配运行时传入的参数列表的类型为指定的参数列表类型的方法；
@within：用于匹配持有指定注解的类的所有方法；
@target：用于匹配的持有指定注解目标对象的所有方法；
@args：用于匹配运行时 传入的参数列表的类型持有 注解列表对应的注解 的方法；
@annotation：用于匹配持有指定注解的方法；
　　AspectJ切入点支持的切入点指示符还有： call、get、set、preinitialization、staticinitialization、initialization、handler、adviceexecution、withincode、cflow、cflowbelow、if、@this、@withincode；但Spring AOP目前不支持这些指示符，使用这些指示符将抛出IllegalArgumentException异常。

##### 类型匹配语法
```
(1) *：匹配任何数量字符；
(2) ..：匹配任何数量字符的重复，如在类型模式中匹配任何数量子包；而在方法参数模式中匹配任何数量参数
(3) +：匹配指定类型的子类型；仅能作为后缀放在类型模式后边。
AspectJ使用 且（&&）、或（||）、非（！）来组合切入点表达式。
```
>在Schema风格下，由于在XML中使用“&&”需要使用转义字符“&amp;&amp;”来代替之，所以很不>方便，因此Spring ASP 提供了and、or、not来代替&&、||、！。

#### 常见切入点表达式
```
任意公共方法的执行： 
execution(public * *(..)) 

任何一个以“set”开始的方法的执行： 
execution(* set*(..)) 

AccountService 接口的任意方法的执行： 
execution(* com.xyz.service.AccountService.*(..)) 

定义在service包里的任意方法的执行： 
execution(* com.xyz.service.*.*(..)) 

定义在service包或者子包里的任意方法的执行： 
execution(* com.xyz.service..*.*(..)) 

在service包里的任意连接点（在Spring AOP中只是方法执行） ： 
within(com.xyz.service.*) 

在service包或者子包里的任意连接点（在Spring AOP中只是方法执行） ： 
within(com.xyz.service..*) 

实现了 AccountService 接口的代理对象的任意连接点（在Spring AOP中只是方法执行） ： 
this(com.xyz.service.AccountService) 

实现了 AccountService 接口的目标对象的任意连接点（在Spring AOP中只是方法执行） ： 
target(com.xyz.service.AccountService) 

任何一个只接受一个参数，且在运行时传入的参数实现了 Serializable 接口的连接点 （在Spring AOP中只是方法执行） 
args(java.io.Serializable) 

有一个 @Transactional 注解的目标对象中的任意连接点（在Spring AOP中只是方法执行） 
@target(org.springframework.transaction.annotation.Transactional) 

任何一个目标对象声明的类型有一个 @Transactional 注解的连接点（在Spring AOP中只是方法执行） 
@within(org.springframework.transaction.annotation.Transactional) 

任何一个执行的方法有一个 @Transactional annotation的连接点（在Spring AOP中只是方法执行） 
@annotation(org.springframework.transaction.annotation.Transactional) 

任何一个接受一个参数，并且传入的参数在运行时的类型实现了 @Classified annotation的连接点（在Spring AOP中只是方法执行） 
@args(com.xyz.security.Classified)
```

#### 切入点指示符详解
##### execution
execution(<修饰符模式>?<返回类型模式><方法名模式>(<参数模式>)<异常模式>?)  
除了返回类型模式、方法名模式和参数模式外，其它项都是可选的。
参数模式如下：
```
():匹配一个不接受任何参数的方法
(..):匹配一个接受任意数量参数的方法
(*):匹配了一个接受一个任何类型的参数的方法
(*,String):匹配了一个接受两个参数的方法，其中第一个参数是任意类型，第二个参数必须是String类型
```
举例：
```
匹配所有目标类的public方法
execution(public * *(..))

匹配所有以To为后缀的方法
execution(* *To(..))

匹配Waiter接口中的所有方法
execution(* com.aop.learn.service.Writer.*(..))

匹配Waiter接口中及其实现类的方法
execution(* com.aop.learn.service.Writer+.*(..))

匹配 com.aop.learn.service 包下所有类的所有方法
execution(* com.aop.learn.service.*(..))

匹配 com.aop.learn.service 包,子孙包下所有类的所有方法
execution(* com.aop.learn.service..*(..))

匹配 包名前缀为com的任何包下类名后缀为ive的方法,方法必须以Smart为前缀
execution(* com..*.*ive.Smart*(..))

匹配 save(String name,int age) 函数
execution(* save(String,int))

匹配 save(String name,*) 函数 第二个参数为任意类型
execution(* save(String,*))

匹配 save(String name,..) 函数 除第一个参数固定外,接受后面有任意个入参且入参类型不限
execution(* save(String,..))

匹配 save(String+) 函数  String+ 表示入参类型是String的子类
execution(* save(String+))
```

##### with 
within是用来指定类型的，指定类型中的所有方法将被拦截。

举例：
```
表示匹配包aop_part以及子包的所有方法
within(aop_part..*) 

匹配UserServiceImpl类对应对象的所有方法外部调用，而且这个对象只能是UserServiceImpl类型，不能是其子类型。
within(com.elim.spring.aop.service.UserServiceImpl)
```
>由于execution可以匹配包、类、方法，而within只能匹配包、类，因此execution完全可以代替within的功能。

##### this
Spring Aop是基于代理的，this就表示代理对象。this类型的Pointcut表达式的语法是this(type)，当生成的代理对象可以转换为type指定的类型时则表示匹配。基于JDK接口的代理和基于CGLIB的代理生成的代理对象是不一样的。

举例：
```
表示匹配了当前给出具体代理对象,即实现了IGodInterface接口的具体代理对象的所有连接点()
this(aop_part.service.IGodInterface)//连接IGodInterface接口实现了的某一个具体对象
```

##### target
Spring Aop是基于代理的，target则表示被代理的目标对象。当被代理的目标对象可以被转换为指定的类型时则表示匹配。

举例：
```
表示匹配实现了IGodInterface接口的目标对象的所有连接点
target(aop_part.service.IGodInterface)//连接只要IGodInterface接口实现了的具体对象  
```

##### args
args用来匹配方法参数的。
```
“args()”匹配任何不带参数的方法。
“args(java.lang.String)”匹配任何只带一个参数，而且这个参数的类型是String的方法。
“args(..)”带任意参数的方法。
“args(java.lang.String,..)”匹配带任意个参数，但是第一个参数的类型是String的方法。
“args(..,java.lang.String)”匹配带任意个参数，但是最后一个参数的类型是String的方法。
```

##### @target
匹配当被代理的目标对象对应的类型及其父类型上拥有指定的注解时。

举例：
```
匹配被代理的目标对象对应的类型上拥有MyAnnotation注解时
@target(com.elim.spring.support.MyAnnotation)
```

##### @args
匹配被调用的方法上含有参数，且对应的参数类型上拥有指定的注解的情况。
“@args(com.elim.spring.support.MyAnnotation)”匹配方法参数类型上拥有MyAnnotation注解的方法调用。如我们有一个方法add(MyParam param)接收一个MyParam类型的参数，而MyParam这个类是拥有注解MyAnnotation的，则它可以被Pointcut表达式“@args(com.elim.spring.support.MyAnnotation)”匹配上。

##### @within
用于匹配被代理的目标对象对应的类型或其父类型拥有指定的注解的情况，但只有在调用拥有指定注解的类上的方法时才匹配。

“@within(com.elim.spring.support.MyAnnotation)”匹配被调用的方法声明的类上拥有MyAnnotation注解的情况。比如有一个ClassA上使用了注解MyAnnotation标注，并且定义了一个方法a()，那么在调用ClassA.a()方法时将匹配该Pointcut；如果有一个ClassB上没有MyAnnotation注解，但是它继承自ClassA，同时它上面定义了一个方法b()，那么在调用ClassB().b()方法时不会匹配该Pointcut，但是在调用ClassB().a()时将匹配该方法调用，因为a()是定义在父类型ClassA上的，且ClassA上使用了MyAnnotation注解。但是如果子类ClassB覆写了父类ClassA的a()方法，则调用ClassB.a()方法时也不匹配该Pointcut。

##### @annotation
用于匹配方法上拥有指定注解的情况。
举例：
```
匹配所有的方法上拥有MyAnnotation注解的方法外部调用。
@annotation(com.elim.spring.support.MyAnnotation)
```

##### @bean
用于匹配当调用的是指定的Spring的某个bean的方法时。
```
“bean(abc)”匹配Spring Bean容器中id或name为abc的bean的方法调用。
“bean(user*)”匹配所有id或name为以user开头的bean的方法调用。
```

