---
title: Spring 框架2
tags: [spring注入原理]
categories: [架构]
---

## 依赖注入(Dependency Injection)
注入方式：
1.使用构造器注入(xml配置)
2.setter方式注入(xml配置,传统方式)
3.注解方式(流行springBoot)
>3种方式都是手工装配依赖对象


## 手工装配依赖对象 && 自动装配依赖对象 
### 手工装配依赖对象
1.手工装配依赖对象，在这种方式中又有两种编程方式
```
在xml配置文件中，通过在bean节点下配置，如
<bean id="orderService" class="cn.itcast.service.OrderServiceBean">
    //构造器注入
    <constructor-arg index=“0” type=“java.lang.String” value=“xxx”/>
    //属性setter方法注入
    <property name=“name” value=“zhao/>
</bean>
```
2.中在java代码使用@Autowired或@Resource注解方式进行装配。但我们需要在xml配置文件中配置以下信息：
```
<beans xmlns="http://www.springframework.org/schema/beans"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xmlns:context="http://www.springframework.org/schema/context"
xsi:schemaLocation="http://www.springframework.org/schema/beans
http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
http://www.springframework.org/schema/context
http://www.springframework.org/schema/context/spring-context-2.5.xsd">
<context:annotation-config/>//开启注解
</beans>
```

>这个配置隐式注册了多个对注释进行解析处理的处理器:
>AutowiredAnnotationBeanPostProcessor，CommonAnnotationBeanPostProcessor，PersistenceAnnotationBeanPostProcessor，RequiredAnnotationBeanPostProcessor
>注： @Resource注解在spring安装目录的lib\j2ee\common-annotations.jar


### 自动装配依赖对象

自动装配，了解一下就可以，实际应用中并不被推荐使用。例子：
```
<bean class="com.zhidisoft.service.DeptService" autowire="byName"/>
```
#### autowire取值属性
 byType:
按照类型自动装配，可以根据属性的类型，在容器中寻找跟类型匹配的bean。如果发现
多个，那么会抛出异常。如果没有找到，即属性值为null.
 byname:
按照名称装配，可以根据属性的名称，在容器中寻找跟该属性名相同的bean,如果没有
找到，即属性值为null。
 constructor
与byType的方式类似，不同之处在于它应用于构造器参数。如果在人那个其中没有找
到，即属性值为null。
 autodetect
通过bean类的自省机制（introspection）来决定是使用constructor还是byType方式进行自动装配。（如果发现默认的构造器，那么将使用byType方式）


## 注入的原理
```
<bean id="orderDao" class="cn.itcast.service.OrderDao"/>

<bean id="orderService" class="cn.itcast.service.OrderServiceBean">
  //用来给Bean内部一个对象的属性设置初始值,setter方法注入
  <property name="orderDao" ref="orderDao"></property>

  //初始化Bean对象包含的属性值,setter方法注入
  <property name=“name” value=“zhao/>

  //构造器注入 index=0,type对应第一个参数和类型
  <constructor-arg index=“0” type=“java.lang.String” value=“xxx”/>
  //index=1,type对应第二个参数和类型
  <constructor-arg index=“1” type=“java.lang.String” value=“xxx”/>
</bean>

集合类型的配置：List,map,set,properties类型属性都可以配置在xml的bean里

```



```
private List<BeanDefinition> beanDefines = new ArrayList<BeanDefinition>();
private Map<String, Object> sigletons = new HashMap<String, Object>();
//定义一个Bean对象
public class BeanDefinition {
	private String id;
	private String className;
  //bean里面的属性
	private List<PropertyDefinition> propertys = new ArrayList<PropertyDefinition>();
}
//定义一个Bean包含的属性对象
public class PropertyDefinition {
	private String name;
	private String ref;
	private String value;
}

```

### 读取并解析XML文件
```
private void readXML(String filename) {
	  SAXReader saxReader = new SAXReader();   
	  Document document=null;   
	  try{
	     URL xmlpath = this.getClass().getClassLoader().getResource(filename);
	     document = saxReader.read(xmlpath);
	     Map<String,String> nsMap = new HashMap<String,String>();
	     nsMap.put("ns","http://www.springframework.org/schema/beans");//加入命名空间
	     XPath xsub = document.createXPath("//ns:beans/ns:bean");//创建beans/bean查询路径
	     xsub.setNamespaceURIs(nsMap);//设置命名空间
	     List<Element> beans = xsub.selectNodes(document);//获取文档下所有bean节点 
	     for(Element element: beans){
	       String id = element.attributeValue("id");//获取id属性值
	       String clazz = element.attributeValue("class"); //获取class属性值        
	       BeanDefinition beanDefine = new BeanDefinition(id, clazz);
	       XPath propertysub =  element.createXPath("ns:property");
	       propertysub.setNamespaceURIs(nsMap);//设置命名空间
	       List<Element> propertys = propertysub.selectNodes(element);
	       for(Element property : propertys){	            	
	         String propertyName = property.attributeValue("name");
	         String propertyref = property.attributeValue("ref");
	         String propertyValue = property.attributeValue("value");
	         PropertyDefinition propertyDefinition = 
                    new PropertyDefinition(propertyName, propertyref, propertyValue);
	            beanDefine.getPropertys().add(propertyDefinition);
	       }

	      beanDefines.add(beanDefine);
	      } 
	  }catch(Exception e){   
	      e.printStackTrace();
	}
}
```


### bean的实例化
```
private void instanceBeans() {
for(BeanDefinition beanDefinition : beanDefines){
  try {
    if(beanDefinition.getClassName()!=null && !"".equals(beanDefinition.getClassName().trim()))
      //new 的对象里面的属性为空，还没注入需要注入属性值
      sigletons.put(beanDefinition.getId(), Class.forName(beanDefinition.getClassName()).newInstance());
  } catch (Exception e) {
    e.printStackTrace();
  }
}

}

```


###  为bean初始化对象属性注入值
```
private void injectObject() {
  //遍历已经实例化的bean对象容器
  for(BeanDefinition beanDefinition : beanDefines){
    Object bean = sigletons.get(beanDefinition.getId());
    if(bean!=null){
      try {
        //获取当前实例化对象里属性描述
        PropertyDescriptor[] ps = 
               Introspector.getBeanInfo(bean.getClass()).getPropertyDescriptors();
        //遍历当前Bean对象里面包含的属性
        for(PropertyDefinition propertyDefinition : beanDefinition.getPropertys()){
          //遍历当前Bean对象里的属性描述
          for(PropertyDescriptor properdesc : ps){
            if(propertyDefinition.getName().equals(properdesc.getName())){
              //获取属性的setter方法 ,private
              Method setter = properdesc.getWriteMethod();
              if(setter!=null){
                Object value = null;
                if(propertyDefinition.getRef()!=null 
                        && !"".equals(propertyDefinition.getRef().trim())){
                  //bean 的ref 属性注入(内部包含其他javaBean的注入：orderDao)
                  value = sigletons.get(propertyDefinition.getRef());
                }else{
                  //bean的value属性注入(java基本类型):将字符串专成对应的类型值
                  value = ConvertUtils.convert(propertyDefinition.getValue(), properdesc.getPropertyType());
                }
                setter.setAccessible(true);
                //把引用对象注入到属性
                setter.invoke(bean, value);
              }
              break;
            }
          }
        }
      } catch (Exception e) {
      }
    }
  }
}
```

### 通过注解实现注入依赖对象
```
private void annotationInject() {
  //遍历spring容器里所有bean对象
  for(String beanName : sigletons.keySet()){
    Object bean = sigletons.get(beanName);
    if(bean!=null){
      try {
        //获取某个bean对象的所有属性
        PropertyDescriptor[] ps = 
                  Introspector.getBeanInfo(bean.getClass()).getPropertyDescriptors();
        //遍历每个setter属性,将注解的值注入
        for(PropertyDescriptor properdesc : ps){
          //获取方法属性的setter方法注解
          Method setter = properdesc.getWriteMethod();
          if(setter!=null && setter.isAnnotationPresent(ItcastResource.class)){

            ItcastResource resource = setter.getAnnotation(ItcastResource.class);
            Object value = null;
            //方法属性注解里有name对应属性,存在有值就注入
            if(resource.name()!=null && !"".equals(resource.name())){
              value = sigletons.get(resource.name());
            }else{
              //处理@resource/autowired注解
              //在方法属性注解上,没name属性的以set字段名字(开头字母小写)来bean容器取对象注入
              value = sigletons.get(properdesc.getName());
              if(value==null){
              //如果按照名称没找到对应对象,则注解会按照方法属性入参类型来容器取对象注入
                for(String key : sigletons.keySet()){
                  if(properdesc.getPropertyType()
                  .isAssignableFrom(sigletons.get(key).getClass())){
                    value = sigletons.get(key);
                    break;
                  }
                }
              }								
            }
            setter.setAccessible(true);
            setter.invoke(bean, value);//把引用对象注入到属性
          }
        }

        //对字段注解处理：取得对象所有的声明字段
        Field[] fields = bean.getClass().getDeclaredFields();
        for(Field field : fields){
          //遍历每一个字段是否存在对应注解
          if(field.isAnnotationPresent(ItcastResource.class)){
            ItcastResource resource = field.getAnnotation(ItcastResource.class);
            Object value = null;
            //字段上对应的注解存在name属性,取name属性值去容器里拿对象注入
            if(resource.name()!=null && !"".equals(resource.name())){
              value = sigletons.get(resource.name());
            }else{
            //字段上没有name属性,直接取字段名在容器中取对象
              value = sigletons.get(field.getName());
              if(value==null){
                //字段名没有直接取字段对应类型在容器中取对象
                for(String key : sigletons.keySet()){
                  if(field.getType().isAssignableFrom(sigletons.get(key).getClass())){
                    value = sigletons.get(key);
                    break;
                  }
                }
              }								
            }
            field.setAccessible(true);//允许访问private字段
            field.set(bean, value);
          }
        }
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
  }
}
```
