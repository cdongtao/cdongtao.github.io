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









