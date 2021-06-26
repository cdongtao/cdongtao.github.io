---
title: Mapstruct
tags: [Plugin,Template]
categories: [Project]
---
## Mapstruct
MapStruct 是用于生成类型安全的 Bean 映射类的 Java 注解处理器。你所要做的就是定义一个映射器接口，声明任何需要映射的方法。在编译过程中，MapStruct 将生成该接口的实现。此实现使用纯 Java 的方法调用源对象和目标对象之间进行映射，并非 Java 反射机制。与手工编写映射代码相比，MapStruct 通过生成冗长且容易出错的代码来节省时间。在配置方法的约定之后，MapStruct 使用了合理的默认值，但在配置或实现特殊行为时将不再适用。

与动态映射框架相比，MapStruct 具有以下优点：
* 使用纯 Java 方法代替 Java 反射机制快速执行。
* 编译时类型安全：只能映射彼此的对象和属性，不能映射一个 Order 实体到一个 Customer DTO 中等等。
* 如果无法映射实体或属性，则在编译时清除错误报告。

###  引入依赖
```
<properties>
        <org.mapstruct.version>1.3.0.Final</org.mapstruct.version>
</properties>

<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct-jdk8</artifactId>
    <version>${org.mapstruct.version}</version>
</dependency>
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct-processor</artifactId>
    <version>${org.mapstruct.version}</version>
</dependency>

<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.8.1</version>
            <configuration>
                <source>${java.version}</source>
                <target>${java.version}</target>
                <annotationProcessorPaths>
                    <path>
                        <groupId>org.mapstruct</groupId>
                        <artifactId>mapstruct-processor</artifactId>
                        <version>${mapstruct.version}</version>
                    </path>
                </annotationProcessorPaths>
            </configuration>
        </plugin>
    </plugins>
</build>
```


### 创建entity和dto对象
```
@Data
public class Order {

    /**
     *订单id
     */
    private Long id;

    /**
     * 订单编号
     */
    private String orderSn;

    /**
     * 收货人姓名/号码
     */
    private String receiverKeyword;

    /**
     * 订单状态：0->待付款；1->待发货；2->已发货；3->已完成；4->已关闭；5->无效订单
     */
    private Integer status;

    /**
     * 订单类型：0->正常订单；1->秒杀订单
     */
    private Integer orderType;

    /**
     * 订单来源：0->PC订单；1->app订单
     */
    private Integer sourceType;

    private String product;

    private Date createTime;
}

@Data
public class OrderQueryParam {
    /**
     * 订单编号
     */
    private String orderSn;

    /**
     * 收货人姓名/号码
     */
    private String receiverKeyword;

    /**
     * 订单状态：0->待付款；1->待发货；2->已发货；3->已完成；4->已关闭；5->无效订单
     */
    private Integer status;

    /**
     * 订单类型：0->正常订单；1->秒杀订单
     */
    private Integer orderType;

    /**
     * 订单来源：0->PC订单；1->app订单
     */
    private Integer sourceType;

    private String productName;

    private String createTime;
}
```

### 创建Mapper
```
@Mapper
public interface OrderMapper {
    //方式一
    OrderQueryParam entity2queryParam(Order order);

    //方式二
    //OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);
    //OrderQueryParam entity2queryParam(Order order);
}
```

### 测试

```
    @Test
    public void entity2queryParam() {
        Order order = new Order();
        order.setId(12345L);
        order.setOrderSn("orderSn");
        order.setOrderType(0);
        order.setReceiverKeyword("keyword");
        order.setSourceType(1);
        order.setStatus(2);
        //方式一
        OrderMapper mapper = Mappers.getMapper(OrderMapper.class);
        OrderQueryParam orderQueryParam = mapper.entity2queryParam(order);

        //方式二
        //OrderQueryParam orderQueryParam = OrderMapper.INSTANCE.entity2queryParam(order);
        assertEquals(orderQueryParam.getOrderSn(), order.getOrderSn());
        assertEquals(orderQueryParam.getOrderType(), order.getOrderType());
        assertEquals(orderQueryParam.getReceiverKeyword(), order.getReceiverKeyword());
        assertEquals(orderQueryParam.getSourceType(), order.getSourceType());
        assertEquals(orderQueryParam.getStatus(), order.getStatus());

    }
```

#### 两个字段名不一致
```
    @Mapper
    public interface OrderMapper {
        OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);

        @Mapping(source = "product", target = "productName")
        OrderQueryParam entity2queryParam(Order order);

        //如果有多个映射关系可以用@Mappings注解，嵌套多个@Mapping注解实现，后文说明！
        @Mappings({
            @Mapping(source = "product", target = "productName"),
            @Mapping(target = "createTime", expression = "java(com.guduyan.util.DateUtil.dateToStr(source.getCreateTime()))")
        })
        OrderQueryParam entity2queryParam(Order order);
    }
```

#### 集合类型转换
```
    @Mapper
    public interface OrderMapper {
        OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);

        List<OrderQueryParam> entity2queryParamList(List<Order> source);
    }
```

#### 字段名一致但类型不一致
```
    //在Order加一个属性为Date类型的createTime,而在OrderQueryParam加一个属性为String类型的createTime
    @Mapper
    public interface OrderMapper {
        OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);

        @Mappings({
            @Mapping(source = "product", target = "productName"),
            @Mapping(target = "createTime", expression = "java(com.guduyan.util.DateUtil.dateToStr(order.getCreateTime()))")
        })
        OrderQueryParam entity2queryParam(Order order);

    }
```

#### 多对一(多个Bean映射为一个Bean的情况)
<font color=red>如果出现属性重合source2会覆盖source1相同部分</font>
```
    //在Order加一个属性为Date类型的createTime,而在OrderQueryParam加一个属性为String类型的createTime
    @Mapper
    public interface OrderMapper {
        OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);
        //source1,source2有相同属性，最后以source1覆盖
        OrderQueryParam toConvertBo(Order source1, Order source2);
    }
```
#### 使用其他的值
//OrderQueryParam，order有相同的id字段，但是映射器会使用mapTo方法里面的id参数
@Mapping(target = "id", source = "id")
OrderQueryParam toConvertBo(Order source1, String id);

#### 
```
@Mapper(uses =DateFormtUtil.class)
 public interface OrderMapper {
        OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);
        //如果带注释的方法从数字映射到字符串，则使用DecimalFormat将格式字符串作为可处理的格式
        @Mapping(target = "sourceType",source = "sourceType", numberFormat = "#0.00")
        OrderQueryParam entity2queryParam(Order order);
    }
```

#### 逆映射
```
 public interface OrderMapper {
        OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);
        @InheritInverseConfiguration
        OrderQueryParam entity2queryParam(Order order);
    }
```

#### 自定义类型转换方法
```
public class DateMapper {

    public String asString(Date date) {
        return date != null ? new SimpleDateFormat( "yyyy-MM-dd" )
            .format( date ) : null;
    }

    public Date asDate(String date) {
        try {
            return date != null ? new SimpleDateFormat( "yyyy-MM-dd" )
                .parse( date ) : null;
        }
        catch ( ParseException e ) {
            throw new RuntimeException( e );
        }
    }
}

@Mapper(uses=DateMapper.class)
public interface PersonMapper{
  PersonMapper INSTANCT = Mappers.getMapper(PersonMapper.class);
  PersonDTO conver(Person person);
}

public class PersonMapperImpl implements PersonMapper {
    private final DateMapper dateMapper = new DateMapper();

    public PersonMapperImpl() {
    }

    public PersonDTO conver(Person person) {
      ....
      personDTO.setCreateTime(this.dateMapper.asDate(person.getCreateTime()));
	  ...
      return personDTO;
       
    }
}
```
#### 集成到 spring作为Bean
```
@Mapper(componentModel = "spring")
public interface ModelMapper {

    ModelMapper INSTANT = Mappers.getMapper(ModelMapper.class);

    ModelVO conver(Model model);

}
// 直接在类中使用Autowired注入就行了
@RestController
class MapperSpringController {

    @Autowired
    ModelMapper modelMapper;

    @GetMapping("/get")
    ModelVO getModle(){
       Model model = new Model();
       model.setId("123456");
       model.setName("张三");
       model.setCreate(new Date());
       return modelMapper.conver(model);
    }
}
```

#### 归纳
//target找不到source有对应属性就为defaultValue = "默认值",如果没有defaultValue 则为null
@Mapping(target = "describe", source = "describe", defaultValue = "默认值")
// 忽略id，不进行映射
@Mapping(target = "id", ignore = true) 
//如果属性从字符串映射到日期，则该格式字符串可由SimpleDateFormat处理
@Mapping(target = "createTime" ,source = "createTime", dateFormat = "yyyy-MM-dd")
