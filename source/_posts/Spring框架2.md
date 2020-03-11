---
title: Spring 框架2
tags: [Spring]
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
<constructor-arg index=“0” type=“java.lang.String” value=“xxx”/>//构造器注入
<property name=“name” value=“zhao/>//属性setter方法注入
</bean>
```
2. 中在java代码使用@Autowired或@Resource注解方式进行装配。但我们需要在xml配置文件中配置以下信息：
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
private List<BeanDefinition> beanDefines = new ArrayList<BeanDefinition>();
private Map<String, Object> sigletons = new HashMap<String, Object>();

public class BeanDefinition {
	private String id;
	private String className;
	private List<PropertyDefinition> propertys = new ArrayList<PropertyDefinition>();
}

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
	         PropertyDefinition propertyDefinition = new PropertyDefinition(propertyName, propertyref, propertyValue);
	            beanDefine.getPropertys().add(propertyDefinition);
	       }

	      beanDefines.add(beanDefine);
	      } 
	  }catch(Exception e){   
	      e.printStackTrace();
	}
}
```
###  为bean对象的属性注入值
```
private void injectObject() {
  for(BeanDefinition beanDefinition : beanDefines){
    Object bean = sigletons.get(beanDefinition.getId());
    if(bean!=null){
      try {
        PropertyDescriptor[] ps = Introspector.getBeanInfo(bean.getClass()).getPropertyDescriptors();
        for(PropertyDefinition propertyDefinition : beanDefinition.getPropertys()){
          for(PropertyDescriptor properdesc : ps){
            if(propertyDefinition.getName().equals(properdesc.getName())){
              Method setter = properdesc.getWriteMethod();//获取属性的setter方法 ,private
              if(setter!=null){
                Object value = null;
                if(propertyDefinition.getRef()!=null && !"".equals(propertyDefinition.getRef().trim())){
                  value = sigletons.get(propertyDefinition.getRef());
                }else{
                  value = ConvertUtils.convert(propertyDefinition.getValue(), properdesc.getPropertyType());
                }
                setter.setAccessible(true);
                setter.invoke(bean, value);//把引用对象注入到属性
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
  for(String beanName : sigletons.keySet()){
    Object bean = sigletons.get(beanName);
    if(bean!=null){
      try {
        PropertyDescriptor[] ps = Introspector.getBeanInfo(bean.getClass()).getPropertyDescriptors();
        for(PropertyDescriptor properdesc : ps){
          Method setter = properdesc.getWriteMethod();//获取属性的setter方法
          if(setter!=null && setter.isAnnotationPresent(ItcastResource.class)){
            ItcastResource resource = setter.getAnnotation(ItcastResource.class);
            Object value = null;
            if(resource.name()!=null && !"".equals(resource.name())){
              value = sigletons.get(resource.name());
            }else{
              value = sigletons.get(properdesc.getName());
              if(value==null){
                for(String key : sigletons.keySet()){
                  if(properdesc.getPropertyType().isAssignableFrom(sigletons.get(key).getClass())){
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
        Field[] fields = bean.getClass().getDeclaredFields();
        for(Field field : fields){
          if(field.isAnnotationPresent(ItcastResource.class)){
            ItcastResource resource = field.getAnnotation(ItcastResource.class);
            Object value = null;
            if(resource.name()!=null && !"".equals(resource.name())){
              value = sigletons.get(resource.name());
            }else{
              value = sigletons.get(field.getName());
              if(value==null){
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


### bean的实例化
```
private void instanceBeans() {
for(BeanDefinition beanDefinition : beanDefines){
  try {
    if(beanDefinition.getClassName()!=null && !"".equals(beanDefinition.getClassName().trim()))
      sigletons.put(beanDefinition.getId(), Class.forName(beanDefinition.getClassName()).newInstance());
  } catch (Exception e) {
    e.printStackTrace();
  }
}

}

```
