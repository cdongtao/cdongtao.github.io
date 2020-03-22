---
title: Spring 框架1
tags: [Spring-容器]
categories: [FrameWork]
---

Spring 核心几大特点：控制反转(IOC),依赖注入(Dependency Injection),与切面编程(AsOP),Spring Framework还提供了AOP技术,事务管理服务(注入控制事务传播),消息服务；Spring支持使用集成Hibernate,JPA,Struts等框架；
## Spring Framework 架构图

![Spring_Framework3.x架构图](/img/Spring_Framework3.x架构图.png "Spring_Framework3.x架构图")

## 控制反转(IOC:Inversion Of Control)

Spring启动的时,会主动初始化注册在bean的xml里面的bean,使得这些bean之间使用解耦;

### 不使用Spring：
```
public class PersonServiceBean{
  //没有初始化PersonDao，需要在代码里强关联
  private PersonDao personDao = new PersonDao();

  public void save(PersonDao personDao){
    personDao.save();
  }
}
```

### 使用Spring：
```
public class PersonServiceBean{
  //在Spring启动的时候已经初始化PersonDao，存在Spring容器里类似写好的全局变量一样,有需要就去取
  private PersonDao personDao;

  public void save(PersonDao personDao){
    personDao.save();
  }
}
```
## 依赖注入(Dependency Injection)

DI定义:运行期，由外部容器动态的将依赖对象注入到组件中(从xml的spring容器拿到bean 注入到代码里)
因此：将创建bean的过程交给spring创建的过程就是IOC,一个类在使用到相关bean对象的时候自动注入相关bean；

>注入过程就是如何赋值过程,如spring new好了的personDao对象A，在PersonServiceBean中需要将A赋值给personDao

## 切面编程(AOP:Aspect Oriented Programming)
面向切面编程可以使用权限拦截，运行监控，日志等
>切面编程就如一个全局函数一样
----

## Spring XML文件配置使用
#### Spring配置模板
![Spring配置模板](/img/Spring配置模板.png "Spring配置模板")
![Spring配置Bean不能联想](/img/Spring配置Bean不能联想.png "Spring配置Bean不能联想")

#### 代码实例化Spring容器常用的两种方式：
```
方法一:
在类路径下寻找配置文件来实例化容器

ApplicationContext ctx = new ClassPathXmlApplicationContext(new String[]{"beans.xml"});

方法二:
在文件系统路径下寻找配置文件来实例化容器
ApplicationContext ctx = new FileSystemXmlApplicationContext(new String[]{“d:\\beans.xml“});
```

## Spring 实例化bean

### Spring xml中配置三种实例化bean的方式：
1.使用类构造器实例化
```
<bean id=“orderService" class="cn.itcast.OrderServiceBean"/>
```
2.使用静态工厂方法实例化
```
<bean id="personService" class="cn.itcast.service.OrderFactory" factory-method="createOrder"/>

public class OrderFactory {
    public static OrderServiceBean createOrder(){
      return new OrderServiceBean();
    }
}
```
3.使用实例工厂方法实例化:
```
<bean id="personServiceFactory" class="cn.itcast.service.OrderFactory"/>
<bean id="personService" factory-bean="personServiceFactory" factory-method="createOrder"/>

public class OrderFactory {
    public OrderServiceBean createOrder(){
      return new OrderServiceBean();
    }
}
```
### 模仿Spring注册：代码手动解析xml,实例化xml的bean
![解析xml注册bean](/img/解析xml注册bean.png "解析xml注册bean")

## 配置bean的作用域(Scope)

>定义Bean可以使用的范围,类似定义变量时候,设置变量为局部变量还是全局变量,强调创建bean后的结果作用域

#### 1.singleton （单例）
```
<bean id="ServiceImpl" class="cn.csdn.service.ServiceImpl" scope="singleton">
```
在每个Spring IoC容器中一个bean定义只有一个对象实例。默认情况下会在容器启动时初始化bean，但我们可以指定Bean节点的lazy-init=“true”来延迟初始化bean，这时候，只有第一次获取bean会才初始化bean。如：
```
<bean id="xxx" class="cn.itcast.OrderServiceBean" lazy-init="true"/>
```
如果想对所有bean都应用延迟初始化，可以在根节点beans设置default-lazy-init=“true“，如下：
```
<beans default-lazy-init="true“ ...>
```
实际应用中不把这个属性设置为true.

#### 2.prototype (原型)
```
<bean id="account" class="com.foo.DefaultAccount" scope="prototype"/> 
```
每次从容器获取bean都是新的对象。每次调用getBean方法，都获取新的实例。
调用调用getBean方法时,bean才实例化(此时相当于new xxxBean())
#### 3.request(请求)
```
<bean id="loginAction" class=cn.csdn.LoginAction" scope="request"/>
```
一个HTTP请求会产生一个Bean对象，也就是说，每一个HTTP请求都有自己的Bean实例。只适用于web的Spring ApplicationContext中
#### 4.session(会话)
```
<bean id="userPreferences" class="com.foo.UserPreferences" scope="session"/>
```
限定一个Bean的作用域为HTTPsession的生命周期。同样，只适用于web的Spring ApplicationContext中
#### 5.global session(全局会话)
```
<bean id="user" class="com.foo.Preferences "scope="globalSession"/>
```
限定一个Bean的作用域为全局HTTPSession的生命周期。通常用于门户网站场景，同样，只适用于web的Spring ApplicationContext中

五种作用域中，request、session和global session三种作用域仅在基于web的应用中使用（不必关心你所采用的是什么web应用框架），只能用在基于web的Spring ApplicationContext环境。

在配置文件中指定Bean的初始化方法和销毁方法
```
<bean id="xxx" class="cn.itcast.OrderServiceBean" init-method="init" destroy-method="close"/>
Bean实例化后 ，就会执行init方法， Spring容器通过反射机制来调用。
AbstractApplicationContext ctx=new ClassPathXmlApplicationContext("beans.xml");
ctx.close();//正常关闭spring容器。
```

## Spring Bean生命周期
>创建Bean的过程,即实例化过程，强调创建过程

![Bean实例化过程](/img/Bean实例化过程.png "Bean实例化过程")

### Bean实例生命周期的执行过程如下：

1.Spring对bean进行实例化，默认bean是单例；

2.Spring对bean进行依赖注入；

3.如果bean实现了BeanNameAware接口，spring将bean的id传给setBeanName()方法；

4.如果bean实现了BeanFactoryAware接口，spring将调用setBeanFactory方法，将BeanFactory实例传进来；

5.如果bean实现了ApplicationContextAware接口，它的setApplicationContext()方法将被调用，将应用上下文的引用传入到bean中；

6.如果bean实现了BeanPostProcessor接口，它的postProcessBeforeInitialization方法将被调用；

7.如果bean实现了InitializingBean接口，spring将调用它的afterPropertiesSet接口方法，类似的如果bean使用了init-method属性声明了初始化方法，该方法也会被调用；

8.如果bean实现了BeanPostProcessor接口，它的postProcessAfterInitialization接口方法将被调用；

9.此时bean已经准备就绪，可以被应用程序使用了，他们将一直驻留在应用上下文中，直到该应用上下文被销毁；

10.若bean实现了DisposableBean接口，spring将调用它的distroy()接口方法。同样的，如果bean使用了destroy-method属性声明了销毁方法，则该方法被调用；

其实很多时候我们并不会真的去实现上面说描述的那些接口，那么下面我们就除去那些接口，针对bean的单例和非单例来描述下bean的生命周期：

#### 单例管理的对象
默认情况下，Spring在读取xml文件的时候,就会创建对象.在创建对象的时候先调用构造器,然后调用init-method属性值中所指定的方法。对象在被销毁的时候,会调用destroy-method属性值中所指定的方法(例如调用Container.destroy()方法的时候)。
```
<bean id="life_singleton" class="com.bean.LifeBean" scope="singleton" init-method="init" destroy-method="destory" lazy-init="true"/>

public class LifeBean {
    private String name;  

    public LifeBean(){  
        System.out.println("LifeBean()构造函数");  
    }  
    public String getName() {  
        return name;  
    }  

    public void setName(String name) {  
        System.out.println("setName()");  
        this.name = name;  
    }  

    public void init(){  
        System.out.println("this is init of lifeBean");  
    }  

    public void destory(){  
        System.out.println("this is destory of lifeBean " + this);  
    }  
}
public class LifeTest {
    @Test 
    public void test() {
        AbstractApplicationContext container = 
        new ClassPathXmlApplicationContext("life.xml");
        LifeBean life1 = (LifeBean)container.getBean("life");
        System.out.println(life1);
        container.close();
    }
}

运行结果如下
LifeBean()构造函数
this is init of lifeBean
com.bean.LifeBean@573f2bb1
……
this is destory of lifeBean com.bean.LifeBean@573f2bb1
```

#### 非单例管理的对象
当scope=”prototype”时，容器也会延迟初始化bean，Spring读取xml文件的时候，并不会立刻创建对象，而是在第一次请求该bean时才初始化（如调用getBean方法时）。在第一次请求每一个prototype的bean时，Spring容器都会调用其构造器创建这个对象，然后调用init-method属性值中所指定的方法。对象销毁的时候，Spring容器不会帮我们调用任何方法，因为是非单例，这个类型的对象有很多个，Spring容器一旦把这个对象交给你之后，就不再管理这个对象了。
```
<bean id="life_prototype" class="com.bean.LifeBean" scope="prototype" init-method="init" destroy-method="destory"/>

public class LifeTest {
    @Test 
    public void test() {
        AbstractApplicationContext container = new ClassPathXmlApplicationContext("life.xml");
        LifeBean life1 = (LifeBean)container.getBean("life_singleton");
        System.out.println(life1);

        LifeBean life3 = (LifeBean)container.getBean("life_prototype");
        System.out.println(life3);
        container.close();
    }
}

运行结果如下：
LifeBean()构造函数
this is init of lifeBean
com.bean.LifeBean@573f2bb1
LifeBean()构造函数
this is init of lifeBean
com.bean.LifeBean@5ae9a829
……
this is destory of lifeBean com.bean.LifeBean@573f2bb1
```

可以发现，对于作用域为prototype的bean，其destroy方法并没有被调用。如果bean的scope设为prototype时，当容器关闭时，destroy方法不会被调用。对于prototype作用域的bean，有一点非常重要，那就是Spring不能对一个prototype bean的整个生命周期负责：容器在初始化、配置、装饰或者是装配完一个prototype实例后，将它交给客户端，随后就对该prototype实例不闻不问了。不管何种作用域，容器都会调用所有对象的初始化生命周期回调方法。但对prototype而言，任何配置好的析构生命周期回调方法都将不会被调用。清除prototype作用域的对象并释放任何prototype bean所持有的昂贵资源，都是客户端代码的职责（让Spring容器释放被prototype作用域bean占用资源的一种可行方式是，通过使用bean的后置处理器，该处理器持有要被清除的bean的引用）。谈及prototype作用域的bean时，在某些方面你可以将Spring容器的角色看作是Java new操作的替代者，任何迟于该时间点的生命周期事宜都得交由客户端来处理。

　　Spring容器可以管理singleton作用域下bean的生命周期，在此作用域下，Spring能够精确地知道bean何时被创建，何时初始化完成，以及何时被销毁。而对于prototype作用域的bean，Spring只负责创建，当容器创建了bean的实例后，bean的实例就交给了客户端的代码管理，Spring容器将不再跟踪其生命周期，并且不会管理那些被配置成prototype作用域的bean的生命周期。

