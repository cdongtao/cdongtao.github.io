---
title: Mock-data
tags: [Mock,UnitTest]
categories: [SpringBoot]
---

## Mock
Mock（模拟对象）是以可控的方式模拟真实对象行为的假的对象。程序员通常创造模拟对象来测试其他对象的行为，很类似汽车设计者使用碰撞测试假人来模拟车辆碰撞中人的动态行为。

>在单元测试中，模拟对象可以模拟复杂的、真实的（非模拟）对象的行为， 如果真实的对象无法放入单元测试中，使用模拟对象就很有帮助。

在下面的情形，可能需要使用模拟对象来代替真实对象：
```
* 真实对象的行为是不确定的（例如，当前的时间或当前的温度）；
* 真实对象很难搭建起来；
* 真实对象的行为很难触发（例如，网络错误）；
* 真实对象速度很慢（例如，一个完整的数据库，在测试之前可能需要初始化）；
* 真实的对象是用户界面，或包括用户界面在内；
* 真实的对象使用了回调机制；
* 真实对象可能还不存在；
* 真实对象可能包含不能用作测试（而不是为实际工作）的信息和方法。
```

## Mockito的简单使用
Mockito是GitHub上使用最广泛的Mock框架,并与JUnit结合使用.Mockito框架可以创建和配置mock对象.使用Mockito简化了具有外部依赖的类的测试开发!

### 基于 Spring 的单元测试编写
首先我们项目一般都是 MVC 分层的，而单元测试主要是在 Dao 层和 Service 层上进行编写。从项目结构上来说，Service 层是依赖 Dao 层的，但是从单元测试角度，对某个 Service 进行单元的时候，他所有依赖的类都应该进行Mock。而 Dao 层单元测试就比较简单了，只依赖数据库中的数据。

一般使用Mockito的步骤:
模拟任何外部依赖并将这些模拟对象插入测试代码中
执行测试中的代码
验证代码是否按照预期执行
![mock依赖](/img/mock.png "mock依赖")

## mock依赖配置
### Android项目:
```
dependencies {
    // ... more entries
    testCompile 'junit:junit:4.12'

    // required if you want to use Mockito for unit tests
    testCompile 'org.mockito:mockito-core:2.+'
    // required if you want to use Mockito for Android tests
    androidTestCompile 'org.mockito:mockito-android:2.7.22'
}
```

### Mockito
SpringBoot 中的 pom.xml 文件需要添加的依赖：
```
<dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
```

## 常用的 Mockito 方法：
| 描述                                       | 方法名                                                         |
| ------------------------------------------ | -------------------------------------------------------------- |
| 1.verify验证行为是否发生                   | Mockito.verify(mock)                                           |
| 2.多次触发返回不同值                       | Mockito.when(methodCall).thenReturn(value1).thenReturn(value2) |
| 3.doThrow模拟抛出异常                      | Mockito.doThrow(toBeThrown).when(mock).[method]                |
| 4.Mock返回默认模拟对象                     | Mockito.mock(classToMock,defaultAnswer)                        |
| 5.参数匹配（直接执行不判断）               | Mockito.doReturn(toBeReturned).when(mock).[method]             |
| 6.预期回调接口生成期望值                   | Mockito.when(methodCall).thenAnswer(answer))                   |
| 7.预期回调接口生成期望值（直接执行不判断） | Mockito.doAnswer(answer).when(methodCall).[method]             |
| 8.spy监控真实对象,设置真实对象行为         | Mockito.spy(Object)                                            |
| 9.doNothing不做任何返回                    | Mockito.doNothing().when(mock).[method]                        |
| 10.reset重置mock                           | reset(mock)                                                    |
| 11.调用真实的方法                          | Mockito.doCallRealMethod().when(mock).[method]                 |
| 11.调用真实的方法                          | //等价于Mockito.when(mock.[method]).thenCallRealMethod();      |


#### 1.verify验证行为是否发生
>调用真实的方法 
```
//模拟创建一个List对象
List<Integer> mock =  Mockito.mock(List.class);
//调用mock对象的方法
mock.add(1);
mock.clear();
//验证方法是否执行
Mockito.verify(mock).add(1);
Mockito.verify(mock).clear();
```

#### 2.多次触发返回不同值
```
//mock一个Iterator类
Iterator iterator = mock(Iterator.class);
//预设当iterator调用next()时第一次返回hello，第n次都返回world
Mockito.when(iterator.next()).thenReturn("hello").thenReturn("world");
//使用mock的对象
String result = iterator.next() + " " + iterator.next() + " " + iterator.next();
//验证结果
Assert.assertEquals("hello world world",result);
```

#### 3.doThrow模拟抛出异常
```
@Test(expected = IOException.class)//期望报IO异常
public void when_thenThrow() throws IOException{
      OutputStream mock = Mockito.mock(OutputStream.class);
      //预设当流关闭时抛出异常
      Mockito.doThrow(new IOException()).when(mock).close();
      mock.close();
  }
```

#### 4.Mock返回默认模拟对象
>RETURNS_DEEP_STUBS 是创建mock对象时的备选参数之一
>以下方法deepstubsTest和deepstubsTest2是等价的
```
class A{
    private B b;
    public B getB(){
        return b;
    }
    public void setB(B b){
        this.b=b;
    }
}
class B{
    private String name;
    public String getName(){
        return name;
    }
    public void setName(String name){
        this.name = name;
    }
    public String getSex(Integer sex){
        if(sex==1){
            return "man";
        }else{
            return "woman";
        }
    }
}

@Test
public void deepstubsTest(){
    A a=Mockito.mock(A.class,Mockito.RETURNS_DEEP_STUBS);
    Mockito.when(a.getB().getName()).thenReturn("Beijing");
    Assert.assertEquals("Beijing",a.getB().getName());
}

@Test
public void deepstubsTest2(){
    A a=Mockito.mock(A.class);
    B b=Mockito.mock(B.class);
    Mockito.when(a.getB()).thenReturn(b);
    Mockito.when(b.getName()).thenReturn("Beijing");
    Assert.assertEquals("Beijing",a.getB().getName());
}
```

#### 5.参数匹配
```
class B{
    private String name;
    public String getName(){
        return name;
    }
    public void setName(String name){
        this.name = name;
    }
    public String getSex(Integer sex){
        if(sex==1){
            return "man";
        }else{
            return "woman";
        }
    }
}

@Test
public void with_arguments(){
    B b = Mockito.mock(B.class);
    //预设根据不同的参数返回不同的结果
    Mockito.when(b.getSex(1)).thenReturn("男");
    Mockito.when(b.getSex(2)).thenReturn("女");
    Assert.assertEquals("男", b.getSex(1));
    Assert.assertEquals("女", b.getSex(2));
    //对于没有预设的情况会返回默认值
    Assert.assertEquals(null, b.getSex(0));
}
```

#### 5.匹配任意参数
Mockito.anyInt() 任何 int 值 ；
Mockito.anyLong() 任何 long 值 ；
Mockito.anyString() 任何 String 值 ；
Mockito.any(XXX.class) 任何 XXX 类型的值 等等

```
class IsValid extends ArgumentMatcher<List>{
    @Override
    public boolean matches(Object obj) {
        return obj.equals(1) || obj.equals(2);
    }
}

@Test
public void with_unspecified_arguments(){
    List list = Mockito.mock(List.class);
    //匹配任意参数
    Mockito.when(list.get(Mockito.anyInt())).thenReturn(1);
    //argThat(Matches<T> matcher)方法用来应用自定义的规则，可以传入任何实现Matcher接口的实现类。
    Mockito.when(list.contains(Mockito.argThat(new IsValid()))).thenReturn(true);
    Assert.assertEquals(1,list.get(1));
    Assert.assertEquals(1,list.get(999));
    Assert.assertTrue(list.contains(1));
    Assert.assertTrue(!list.contains(3));
}
```

>注意：使用了参数匹配，那么所有的参数都必须通过matchers来匹配
>Mockito继承Matchers，anyInt()等均为Matchers方法
>当传入两个参数，其中一个参数采用任意参数时，指定参数需要matchers来对比

```
Comparator comparator = mock(Comparator.class);
comparator.compare("nihao","hello");
//如果你使用了参数匹配，那么所有的参数都必须通过matchers来匹配
Mockito.verify(comparator).compare(Mockito.anyString(),Mockito.eq("hello"));
//下面的为无效的参数匹配使用
//verify(comparator).compare(anyString(),"hello");
```

#### 5.自定义参数匹配
```
class IsListofTwoElements extends ArgumentMatcher<List>
{
   public boolean matches(Object list)
   {
       return((List)list).size()==3;
   }
}
@Test
public void argumentMatchersTest(){
   //创建mock对象
   List<String> mock = mock(List.class);
   //argThat(Matches<T> matcher)方法用来应用自定义的规则，可以传入任何实现Matcher接口的实现类。
   Mockito.when(mock.addAll(Mockito.argThat(new IsListofTwoElements()))).thenReturn(true);
   Assert.assertTrue(mock.addAll(Arrays.asList("one","two","three")));
}

```

#### 6.预期回调接口生成期望值
```
private class CustomAnswer implements Answer<String> {
    @Override
    public String answer(InvocationOnMock invocation) throws Throwable {
        Object[] args = invocation.getArguments();
        return "hello world:"+args[0];
    }
}
@Test
public void answerTest(){
      List mockList = Mockito.mock(List.class);
      //使用方法预期回调接口生成期望值（Answer结构）
      Mockito.when(mockList.get(Mockito.anyInt())).thenAnswer(new CustomAnswer());
      Assert.assertEquals("hello world:0",mockList.get(0));
      Assert.assertEquals("hello world:999",mockList.get(999));
  }

等价于：(也可使用匿名内部类实现)
@Test
 public void answer_with_callback(){
      //使用Answer来生成我们我们期望的返回
      Mockito.when(mockList.get(Mockito.anyInt())).thenAnswer(new Answer<Object>() {
          @Override
          public Object answer(InvocationOnMock invocation) throws Throwable {
              Object[] args = invocation.getArguments();
              return "hello world:"+args[0];
          }
      });
      Assert.assertEquals("hello world:0",mockList.get(0));
     Assert. assertEquals("hello world:999",mockList.get(999));
  }
```

#### 7.预期回调接口生成期望值（直接执行）
```
public class CustomAnswer implements Answer<String> {  
  public String answer(InvocationOnMock invocation) throws Throwable {  
      Object[] args = invocation.getArguments();  
      Integer num = (Integer)args[0];  
      if( num>3 ){  
          return "大于三";  
      } else {  
          return "小于三";   
      }  
  }
}
@Test
public void testAnswer1(){
List<String> mock = Mockito.mock(List.class);  
      Mockito.doAnswer(new CustomAnswer()).when(mock).get(Mockito.anyInt());  
      Assert.assertEquals("大于三", mock.get(4));
      Assert.assertEquals("小于三", mock.get(2));
}

```



#### 8.用spy监控真实对象,设置真实对象行为
```
  @Test(expected = IndexOutOfBoundsException.class)
    public void spy_on_real_objects(){
        List list = new LinkedList();
        List spy = Mockito.spy(list);
        //下面预设的spy.get(0)会报错，因为会调用真实对象的get(0)，所以会抛出越界异常
        //Mockito.when(spy.get(0)).thenReturn(3);

        //使用doReturn-when可以避免when-thenReturn调用真实对象api
        Mockito.doReturn(999).when(spy).get(999);
        //预设size()期望值
        Mockito.when(spy.size()).thenReturn(100);
        //调用真实对象的api
        spy.add(1);
        spy.add(2);
        Assert.assertEquals(100,spy.size());
        Assert.assertEquals(1,spy.get(0));
        Assert.assertEquals(2,spy.get(1));
        Assert.assertEquals(999,spy.get(999));
    }
```



#### 9.不做任何返回
```
class A {
    private String name;
    private void setName(String name){
        this.name = name;
    }
    private String getName(){
        return name;
    }
}
@Test
public void Test() {
    A a = Mockito.mock(A.class);
    //void 方法才能调用doNothing()
    Mockito.doNothing().when(a.setName(Mockito.anyString()));
    a.setName("bb");
    Assert.assertEquals("bb",a.getName());
}

```




#### 10.重置 mock

```
@Test
    public void reset_mock(){
        List list = mock(List.class);
        Mockito. when(list.size()).thenReturn(10);
        list.add(1);
        Assert.assertEquals(10,list.size());
        //重置mock，清除所有的互动和预设
        Mockito.reset(list);
        Assert.assertEquals(0,list.size());
    }
```

#### 11.调用真实的方法
```
class A {
    public String getName(){
        return "zhangsan";
    }
}
@Test
public void Test() {
    A a = Mockito.mock(A.class);
    //void 方法才能调用doNothing()
    Mockito.when(a.getName()).thenReturn("bb");
    Assert.assertEquals("bb",a.getName());
    //等价于Mockito.when(a.getName()).thenCallRealMethod();
    Mockito.doCallRealMethod().when(a).getName();
    Assert.assertEquals("zhangsan",a.getName());
}

```

#### 修改对未预设的调用返回默认期望（指定返回值）
//mock对象使用Answer来对未预设的调用返回默认期望值
List mock = Mockito.mock(List.class,new Answer() {
     @Override
     public Object answer(InvocationOnMock invocation) throws Throwable {
         return 999;
     }
 });
 //下面的get(1)没有预设，通常情况下会返回NULL，但是使用了Answer改变了默认期望值
 Assert.assertEquals(999, mock.get(1));
 //下面的size()没有预设，通常情况下会返回0，但是使用了Answer改变了默认期望值
 Assert.assertEquals(999,mock.size());


#### @Mock 注解
```
public class MockitoTest {
    @Mock
    private List mockList;
    //必须在基类中添加初始化mock的代码，否则报错mock的对象为NULL
    public MockitoTest(){
        MockitoAnnotations.initMocks(this);
    }
    @Test
    public void AnnoTest() {
            mockList.add(1);
        Mockito.verify(mockList).add(1);
    }
}
```

#### @MockBean
>使用 @MockBean 可以解决单元测试中的一些依赖问题，示例如下：
```
@RunWith(SpringRunner.class)
@SpringBootTest
public class ServiceWithMockBeanTest {
    @MockBean
    SampleDependencyA dependencyA;
    @Autowired
    SampleService sampleService;

    @Test
    public void testDependency() {
        when(dependencyA.getExternalValue(anyString())).thenReturn("mock val: A");
        assertEquals("mock val: A", sampleService.foo());
    }
}
```

>@MockBean 只能 mock 本地的代码——或者说是自己写的代码，对于储存在库中而且又是以 Bean 的形式装配到代码中的类无能为力。
>@SpyBean 解决了 SpringBoot 的单元测试中 @MockBean 不能 mock 库中自动装配的 Bean 的局限（目前还没需求，有需要的自己查阅资料）。

#### 指定测试类使用运行器：MockitoJUnitRunner
```
@RunWith(MockitoJUnitRunner.class)
public class MockitoTest2 {
    @Mock
    private List mockList;

    @Test
    public void shorthand(){
        mockList.add(1);
        Mockito.verify(mockList).add(1);
    }
}
```
