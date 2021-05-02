---
title: Java 注解原理
tags: [注解原理,面试知识]
categories: [Spring]
---

## 注解的定义
* 日常开发中新建Java类，我们使用class、interface比较多，而注解和它们一样，也是一种类的类型，他是用的修饰符为 @interface
```
//格式
@元注解或其他自定义注解
public @interface 注解名 {
    //以属性理解
   修饰符(public或default) 属性值类型  属性名()  default 默认值;
   //以方法理解
   修饰符(public或default) 返回值类型  方法名()  default 默认返回值;
}

public @interface MyTestAnnotation {

}

@MyTestAnnotation
public class test {
   @MyTestAnnotation
   public static void main(String[] args){
   }
}

```
以上我们只是了解了注解的写法，但是我们定义的注解中还没写任何代码，现在这个注解毫无意义，要如何使注解工作呢？接下来我们接着了解元注解。

## 元注解
元注解顾名思义我们可以理解为注解的注解，它是作用在注解中，方便我们使用注解实现想要的功能。元注解分别有@Retention、 @Target、 @Document、 @Inherited和@Repeatable（JDK1.8加入）五种。


### @Retention
```
@Retention(RetentionPolicy.RUNTIME)
public @interface MyTestAnnotation {

}
```
Retention英文意思有保留、保持的意思，它表示注解存在阶段是保留在源码（编译期），字节码（类加载）或者运行期（JVM中运行）。在@Retention注解中使用枚举RetentionPolicy来表示注解保留时期
* @Retention(RetentionPolicy.SOURCE)，注解仅存在于源码中，在class字节码文件中不包含
* @Retention(RetentionPolicy.CLASS)， 默认的保留策略，注解会在class字节码文件中存在，但运行时无法获得
* @Retention(RetentionPolicy.RUNTIME)， 注解会在class字节码文件中存在，在运行时可以通过反射获取到
如果我们是自定义注解，则通过前面分析，我们自定义注解如果只存着源码中或者字节码文件中就无法发挥作用，而在运行期间能获取到注解才能实现我们目的，所以自定义注解中肯定是使用 @Retention(RetentionPolicy.RUNTIME)

### @Target
```
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface MyTestAnnotation {

}
```
Target的英文意思是目标，这也很容易理解，使用@Target元注解表示我们的注解作用的范围就比较具体了，可以是类，方法，方法参数变量等，同样也是通过枚举类ElementType表达作用类型
* @Target(ElementType.TYPE) 作用接口、类、枚举、注解
* @Target(ElementType.FIELD) 作用属性字段、枚举的常量
* @Target(ElementType.METHOD) 作用方法
* @Target(ElementType.PARAMETER) 作用方法参数
* @Target(ElementType.CONSTRUCTOR) 作用构造函数
* @Target(ElementType.LOCAL_VARIABLE)作用局部变量
* @Target(ElementType.ANNOTATION_TYPE)作用于注解（@Retention注解中就使用该属性）
* @Target(ElementType.PACKAGE) 作用于包
* @Target(ElementType.TYPE_PARAMETER) 作用于类型泛型，即泛型方法、泛型类、泛型接口 （jdk1.8加入）
* @Target(ElementType.TYPE_USE) 类型使用.可以用于标注任意类型除了 class （jdk1.8加入）
一般比较常用的是ElementType.TYPE类型

### @Documented
Document的英文意思是文档。它的作用是能够将注解中的元素包含到 Javadoc 中去

### @Inherited
Inherited的英文意思是继承，但是这个继承和我们平时理解的继承大同小异，一个被@Inherited注解了的注解修饰了一个父类，如果他的子类没有被其他注解修饰，则它的子类也继承了父类的注解。
下面我们来看个@Inherited注解例子
```
/**自定义注解*/
@Documented
@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface MyTestAnnotation {
}
/**父类标注自定义注解*/
@MyTestAnnotation
public class Father {
}
/**子类*/
public class Son extends Father {
}
/**测试子类获取父类自定义注解*/
public class test {
   public static void main(String[] args){

      //获取Son的class对象
       Class<Son> sonClass = Son.class;
      // 获取Son类上的注解MyTestAnnotation可以执行成功
      MyTestAnnotation annotation = sonClass.getAnnotation(MyTestAnnotation.class);
   }
}
```

### @Repeatable
Repeatable的英文意思是可重复的。顾名思义说明被这个元注解修饰的注解可以同时作用一个对象多次，但是每次作用注解又可以代表不同的含义。
下面我们看一个人玩游戏的例子
```
/**一个人喜欢玩游戏，他喜欢玩英雄联盟，绝地求生，极品飞车，尘埃4等，则我们需要定义一个人的注解，他属性代表喜欢玩游戏集合，一个游戏注解，游戏属性代表游戏名称*/
/**玩家注解*/
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface People {
    Game[] value() ;
}
/**游戏注解*/
@Repeatable(People.class)
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface Game {
    String value() default "";
}
/**玩游戏类:Game注解有repeatable,所以下面可以重复修饰PlayGame类,意味着每一个Game带值注解作用一个Playgame类,产生不同对象*/
@Game(value = "LOL")
@Game(value = "PUBG")
@Game(value = "NFS")
@Game(value = "Dirt4")
public class PlayGame {
}

//等价于5个不同对象
@Game(value = "LOL")
public class PlayGame {
}

@Game(value = "PUBG")
public class PlayGame {
}

@Game(value = "NFS")
public class PlayGame {
}

@Game(value = "Dirt4")
public class PlayGame {
}

```
通过上面的例子，你可能会有一个疑问，游戏注解中括号的变量是啥，其实这和游戏注解中定义的属性对应。接下来我们继续学习注解的属性。


## 注解的本质
注解的本质就是一个Annotation接口
```
/**Annotation接口源码*/
public interface Annotation {
    boolean equals(Object obj);
    int hashCode();
    Class<? extends Annotation> annotationType();
}
```
通过以上源码，我们知道注解本身就是Annotation接口的子接口，也就是说注解中其实是可以有属性和方法，但是接口中的属性都是static final的，对于注解来说没什么意义，而我们定义接口的方法就相当于注解的属性，也就对应了前面说的为什么注解只有属性成员变量，其实他就是接口的方法，这就是为什么成员变量会有括号，不同于接口我们可以在注解的括号中给成员变量赋值。


## 注解的属性
<font color='red'>通过上一小节@Repeatable注解的例子，我们说到注解的属性。注解的属性其实和类中定义的变量有异曲同工之处，只是注解中的变量都是成员变量（属性），并且注解中是没有方法的，只有成员变量，属性变量名就在括号前，返回值就是括号中对应参数类型。相信这会你应该会对上面的例子有一个更深的认识。而@Repeatable注解中的变量则类型则是对应Annotation（接口）的泛型Class。</font>
```
/**注解Repeatable源码*/
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.ANNOTATION_TYPE)
public @interface Repeatable {
    /**
     * Indicates the <em>containing annotation type</em> for the
     * repeatable annotation type.
     * @return the containing annotation type
     */
    Class<? extends Annotation> value();
}
```

### 注解属性类型
注解属性类型可以有以下列出的类型
1.基本数据类型
2.String
3.枚举类型
4.注解类型
5.Class类型
6.以上类型的一维数组类型

### 注解成员变量赋值
如果注解又多个属性，则可以在注解括号中用“，”号隔开分别给对应的属性赋值，如下例子，注解在父类中赋值属性
```
@Documented
@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface MyTestAnnotation {
    String name() default "mao";
    int age() default 18;
}

@MyTestAnnotation(name = "father",age = 50)
public class Father {
}
```

### 获取注解属性
前面我们说了很多注解如何定义，放在哪，现在我们可以开始学习注解属性的提取了，这才是使用注解的关键，获取属性的值才是使用注解的目的。
如果获取注解属性，当然是反射啦，主要有三个基本的方法
```
 /**是否存在对应 Annotation 对象*/
  public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
        return GenericDeclaration.super.isAnnotationPresent(annotationClass);
    }

 /**获取 Annotation 对象*/
    public <A extends Annotation> A getAnnotation(Class<A> annotationClass) {
        Objects.requireNonNull(annotationClass);

        return (A) annotationData().annotations.get(annotationClass);
    }
 /**获取所有 Annotation 对象数组*/   
 public Annotation[] getAnnotations() {
        return AnnotationParser.toArray(annotationData().annotations);
    }    
```
下面结合前面的例子，我们来获取一下注解属性，在获取之前我们自定义的注解必须使用元注解@Retention(RetentionPolicy.RUNTIME)
```
public class test {
   public static void main(String[] args) throws NoSuchMethodException {

        /**
         * 获取类注解属性
         */
        Class<Father> fatherClass = Father.class;
        boolean annotationPresent = fatherClass.isAnnotationPresent(MyTestAnnotation.class);
        if(annotationPresent){
            MyTestAnnotation annotation = fatherClass.getAnnotation(MyTestAnnotation.class);
            System.out.println(annotation.name());
            System.out.println(annotation.age());
        }

        /**
         * 获取方法注解属性
         */
        try {
            Field age = fatherClass.getDeclaredField("age");
            boolean annotationPresent1 = age.isAnnotationPresent(Age.class);
            if(annotationPresent1){
                Age annotation = age.getAnnotation(Age.class);
                System.out.println(annotation.value());
            }

            Method play = PlayGame.class.getDeclaredMethod("play");
            if (play!=null){
                People annotation2 = play.getAnnotation(People.class);
                Game[] value = annotation2.value();
                for (Game game : value) {
                    System.out.println(game.value());
                }
            }
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        }
    }
}
```

## 注解的作用
* 提供信息给编译器： 编译器可以利用注解来检测出错误或者警告信息，打印出日志。
* 编译阶段时的处理： 软件工具可以用来利用注解信息来自动生成代码、文档或者做其它相应的自动处理。
* 运行时处理： 某些注解可以在程序运行的时候接受代码的提取，自动做相应的操作。
* 正如官方文档的那句话所说，注解能够提供元数据，转账例子中处理获取注解值的过程是我们开发者直接写的注解提取逻辑，处理提取和处理 Annotation 的代码统称为 APT（Annotation Processing Tool)。上面转账例子中的processAnnotationMoney方法就可以理解为APT工具类





