---
title: ThreadLocal原理及源码解析
tags: [ThreadLocal,源码]
categories: [SpringBoot]
---

## ThreadLocal解决的问题
![threadLocals](/java/ThreadLocal0.png)
ThreadLocal解决线程局部变量统一定义问题，多线程数据不能共享。（InheritableThreadLocal特例除外）不能解决并发问题。解决了：基于类级别的变量定义，每一个线程单独维护自己线程内的变量值（存、取、删的功能）；多线程产生的原因就是因为多个线程间存在共享变量。如果我们每个线程都有属于自己的变量。就不会存在变量共享的问题了。ThreadLocal对象的作用就是用来实现每个线程一个变量的作用，每个线程有自己的变量，自己用自己的，就不会出现共享的问题了。

## ThreadLocal结构源码结构
下面我们从源码层面分析，ThreadLocal是怎么和当前线程绑定起来的 ？我们进Thread的源码看一下。在源码中可以看到一个threadLocals的成员变量。类型为ThreadLocalMap。

### threadLocals
![threadLocals](/java/ThreadLocal1.png)

### ThreadLocalMap
ThreadLocalMap,去看它的源码：
![ThreadLocalMap](/java/ThreadLocal2.png)

ThreadLocalMap是ThreadLocal的一个内部类。ThreadLocalMap是一个映射表，可以理解成HashMap结构。key是当前Thread对象，value为一个Entry对象。Entry对象，我们下面会介绍，先说这个ThreadLocalMap对象，很明显它在Thread中的值为null，那么它是在哪个地方进行初始化的呢？
一共有两个地方，一个是set方法中，一个是get方法中

#### get方法
先看get方法的源码：
![ThreadLocalMap](/java/ThreadLocal3.png)

#### setInitialValue方法
![ThreadLocalMap](/java/ThreadLocal4.png)
如果我们没有往ThreadLocal对象中set值，直接就调用get方法的话，map为空。此时就会调用setInitialValue方法，初始化一个ThreadLocalMap对象。如果map不为空，会根据当前线程对象从ThreadLocalMap中取出当前线程对象对应的value值。我们可以看到，map先是获取了一个Entry对象，真正的值是放在这个Entry对象中，下面我们会详细说出。

#### initialValue方法
一个initialValue方法，这个方法是给ThreadLocal赋初始化值的。初始是这样的
![ThreadLocalMap](/java/ThreadLocal5.png)

#### set方法
我们可以看到该方法的访问权限是protected，也就是子类复写使用。我们可以overriden该方法。初次调用get方法时，赋一个初始值。
好了，继续回到ThreadLocalMap的初始化问题。除了上面说的get方法。还有就是在set方法中，继续看源码：
![ThreadLocalMap](/java/ThreadLocal6.png)

#### Entry对象
说完ThreadLocalMap对象的初始化，继续说Entry对象。这个Entry对象又是什么呢?
点进源码去看看：
![ThreadLocalMap](/java/ThreadLocal7.png)

#### getMap方法
set方法挺清晰的，就是获取当前线程对象，然后获取ThreadLocalMap映射表对象。
看一下getMap方法的源码
![ThreadLocalMap](/java/ThreadLocal9.png)

#### set(this，value)方法中看一下
![ThreadLocalMap](/java/ThreadLocal10.png)

首先获取Entry数组，然后利用算法计算Entry数组的一个索引下标，准备存放新的Entry对象。如果当前ThreadLocal对象关联的Entry对象在Entry数组中已经存在，就覆盖原来的值。如果计算的索引所关联的Entry对象的key为空。说明存在GC回收掉key的情况，这个时候就会清除掉该key对应的value以及Entry对象。
如果在for循环中没有返回的话，就会新建一个新的Entry。然后将Entry数组中的长度加1，同时判断该数组是否需要扩展。

#### remove方法
![ThreadLocalMap](/java/ThreadLocal11.png)
首先根据key计算一下Entry所在的索引，然后判断是否为空，如果不为空，就判断该下标对应的key是否等于我们传入的key，如果相等，就会清除掉Entry对象对应的key，同时清除掉value。同时还有这个Entry对象。

### 对象之间的关系
可以看到，Entry对象继承了弱引用对象WeakReference，弱引用对象意为：在GC时会回收的对象。( java一共有4种引用类型，弱引用是其中一种，相关知识可以百度了解一下)。从构造函数中可以看到，Entry将key，也就是当前ThreadLocal对象传递给了弱引用，所以在GC时，如果ThreadLocal对象没有强引用的话，当前Entry中的key（ThreadLocal对象）会被GC回收。Thread，ThreadLocal，ThreadLocalMap，Entry。这几个对象之间的关系是怎么样的呢?
![ThreadLocalMap](/java/ThreadLocal8a.png)
![ThreadLocalMap](/java/ThreadLocal8.png)

上图可以看出，ThreadLocalMap中维护的是一个Entry数组?
为什么ThreadLocalMap中引用的Entry是一个数组类型呢？因为在一个线程中，我们可以new多个ThreadLocal对象。每一个ThreadLocal对象就对应着一个Entry对象，所以要使用数组存储这些Entry对象。
这里有一个问题，为什么ThreadLocal的作者要将Entry中的key设计成弱引用呢？
作者的想法是：如果当前ThreadLocal对象没有强引用存在，就通知GC回收该key，此时key变为null。同时，作者在set，get中，都对key为null的情况做了处理。会清除掉key为null的Entry对象。这样就可以避免，我们使用了set和get方法，但是没有显示调用remove清除该key的问题。一定程度上避免了内存泄露的问题。
虽然作者做了很多处理，但是由于线程池技术的普及，ThreadLocal对象使用不当，还是会造成内存泄露。为什么呢？
原因是：我们在线程池中取出的链接不会销毁，会返回到池中复用。如果我们对ThreadLocal对象手动set了一个值，但是后期没有再次调用set和get方法。下一次GC发生时，会回收掉key，但是由于value为一个强引用，所以导致key为null，永远无法被取出。该块内存空间永远无法被使用。内存泄露。
所以，我们在使用ThreadLocal对象时，用完的值要注意执行remove操作。
另外，ThreadLocal的最佳实践是用static关键字修饰，防止产生多个ThreadLocal对象，内存浪费。

## ThreadLocal内存模型原理
![ThreadLocalMap](/java/ThreadLocal12.png)

图中左边是栈，右边是堆。线程的一些局部变量和引用使用的内存属于Stack（栈）区，而普通的对象是存储在Heap（堆）区。
* 线程运行时，我们定义的TheadLocal对象被初始化，存储在Heap，同时线程运行的栈区保存了指向该实例的引用，也就是图中的ThreadLocalRef。
* 当ThreadLocal的set/get被调用时，虚拟机会根据当前线程的引用也就是CurrentThreadRef找到其对应在堆区的实例，然后查看其对用的TheadLocalMap实例是否被创建，如果没有，则创建并初始化。
* Map实例化之后，也就拿到了该ThreadLocalMap的句柄，那么就可以将当前ThreadLocal对象作为key，进行存取操作。
* 图中的虚线，表示key对应ThreadLocal实例的引用是个弱引用。

## ThreadLocal避免内存泄漏
通过前面几小结我们分析了ThreadLocal的类设计以及内存模型，同时也重点分析了发生内存泄露的条件和特定场景。最后结合项目中的经验给出建议使用ThreadLocal的场景：
当需要存储线程私有变量的时候。
当需要实现线程安全的变量时。
当需要减少线程资源竞争的时候。
综合上面的分析，我们可以理解ThreadLocal内存泄漏的前因后果，那么怎么避免内存泄漏呢？
<font color ='red'>每次使用完ThreadLocal，建议调用它的remove()方法，清除数据。</font>
