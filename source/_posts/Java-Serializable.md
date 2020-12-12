---
title: Serializable原理
tags: [Serializable]
categories: [SpringBoot]
---

## 序列化与反序列化
* 把对象转换为字节序列的过程称为对象的序列化
* 把字节序列恢复为对象的过程称为对象的反序列化

## 实现方式
实现接口:Serializable接口(设置开发工具生成serialVersionUID)
如果要为序列化的类中忽略某个字段,可添加transient/static关键字

## 为什么要序列化对象
对象的序列化主要有两种用途：
　　1) 把对象的字节序列永久地保存到硬盘上,通常存放在一个文件中；
　　2)将类创建的对象转化为字节流实现跨平台的目的。按值将对象从一个应用程序域发送至另一个应用程序域。实现 serializabel接口 的作用是就是可以把对象存到字节流,然后可以恢复,所以你想如果你的对象没实现序列化怎么才能进行持久化和网络传输呢,要持久化和网络传输就得转为字节流,所以在分布式应用中及设计数据持久化的场景中,你就得实现序列化。

### 两种方式生成serialVersionUID
第一种方式生成的是1L:
	private static final long serialVersionUID = 1L;
第二种是根据类名、属性、方法等生成的:
	private static final long serialVersionUID = -6367006705587584157L;

### 序列化ID的作用：  
	其实,这个序列化ID起着关键的作用,它决定着是否能够成功反序列化!简单来说,java的序列化机制是通过在运行时判断类的serialVersionUID来验证版本一致性的。在进行反序列化时,会把加载在JVM的字节流中的serialVersionUID与本地实体类中的serialVersionUID进行比较,如果相同则认为是一致的,便可以进行反序列化,否则就会报序列化版本不一致的异常。等会我们可以通过代码验证一下。

### 序列化ID如何产生：
	当我们一个实体类中没有显示的定义一个名为“serialVersionUID”、类型为long的变量时,Java序列化机制会根据编译时的class自动生成一个serialVersionUID作为序列化版本比较,这种情况下,只有同一次编译生成的class才会生成相同的serialVersionUID。譬如,当我们编写一个类时,随着时间的推移,我们因为需求改动,需要在本地类中添加其他的字段,这个时候再反序列化时便会出现serialVersionUID不一致,导致反序列化失败。那么如何解决呢？便是在本地类中添加一个“serialVersionUID”变量,值保持不变,便可以进行序列化和反序列化。

### 总结
	虚拟机是否允许反序列化,不仅取决于类路径和功能代码是否一致,一个非常重要的一点是两个类的序列化 ID 是否一致(就是 private static final long serialVersionUID = 1L)。

## 是不是每个实体bean都要实现序列化
 bean 是否需要持久化存储媒体中以及是否需要传输给另一个应用,没有的话就不需要,例如我们利用 fastjson 将实体类转化成 json 字符串时,并不涉及到转化为字节流,所以其实跟序列化没有关系

## 有的时候并没有实现序列化,依然可以持久化到数据库
实体类中常用的数据类型,例如 Date、String 等等,它们已经实现了序列化,而一些基本类型,数据库里面有与之对应的数据结构,从我们的类声明来看,我们没有实现 serializabel接口 ,其实是在声明的各个不同变量的时候,由具体的数据类型帮助我们实现了序列化操作。

## 实例测试
```
public class SerialTest {
	public static void main(String[] args) throws Exception {
        // 创建一个小明
		User user = new User(1,"小明");
		// ObjectOutputStream 对象输出流
		ObjectOutputStream oo = new ObjectOutputStream(new FileOutputStream(new File("D:/User.txt")));
		// 序列化输出User对象
		oo.writeObject(user);
		System.out.println("序列化成功!");
        oo.flush();
        oo.close();
    }
}

public class DeserialTest {
	public static void main(String[] args) throws Exception {
		// ObjectInputStream 对象读取流
		ObjectInputStream ois = new ObjectInputStream(new FileInputStream(new File("D:/User.txt")));
		// 反序列化User对象
		User user = (User) ois.readObject();
		System.out.println("反序列化成功!");
		ois.close();
		return user;
	}
}
```

### 测试条件
<font color="red">说明：反序列化前 表示 在序列化操作完成之后到反序列化开始之前这段时间,更改User类的字段</font>
a. 不实现Serializable接口
b. 实现Serializable接口
c. 未自定义serialVersionUID字段
d. 自定义serialVersionUID字段
e. 反序列化前增加字段
f. 反序列化前减少字段
g. 反序列化前修改字段的类型


### 测试结果
1.只要有a(不实现Serializable接口)出现,就会导致java.io.NotSerializableException异常,即无法完成序列化。
2.当条件为 b(实现Serializable接口)+c(未自定义serialVersionUID字段) 或者 b(实现Serializable接口)+d(自定义serialVersionUID字段) 时,序列化和反序列化均正常执行。
3.当条件为 b(实现Serializable接口)+c(未自定义serialVersionUID字段) +e(反序列化前增加字段) 或者 b(实现Serializable接口)+c(未自定义serialVersionUID字段) +f(反序列化前减少字段) 时,反序列化时将抛出InvalidClassException异常。
4.当条件为 b(实现Serializable接口)+d(自定义serialVersionUID字段)+e(反序列化前增加字段) 或者 b(实现Serializable接口)+d(自定义serialVersionUID字段)+f(反序列化前减少字段) 时,序列化和反序列一切正常,若增加字段时,反序列化出来该字段为缺省值;若减少字段时,反序列化出来也将没有此字段。
5.当条件包含 g(反序列化前修改字段的类型) 时,反序列化也将抛出InvalidClassException异常。

* 总结
启动服务后,将D盘user文件生成为user.class;若有外部请求接受到流后,根据流的信息要寻找对流的对象类存放数据(user.class),寻找已经存储的user.class后进行反序列化,其中需要对比serialVersionUID是否一致;因为 Java 的序列化机制是通过在运行时判断类的serialVersionUID来验证版本一致性的。在进行反序列化时,JVM 会把传来的字节流中的serialVersionUID与本地相应实体(类)的serialVersionUID进行比较,如果相同就认为是一致的,可以进行反序列化,否则就会出现序列化版本不一致的异常

