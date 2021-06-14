---
title: 自定义注解校验枚举值
tags: [注解校验,Hibernate Validator]
categories: [SpringBoot]
---

## hibernate的两种校验校验模式
细心的读者肯定发现了：上面例子中一次性返回了所有验证不通过的集合，通常按顺序验证到第一个字段不符合验证要求时，就可以直接拒绝请求了。Hibernate Validator有以下两种验证模式：

1. 普通模式（默认模式）
　　普通模式(会校验完所有的属性，然后返回所有的验证失败信息)
2. failFast(快速失败返回)模式
　　快速失败返回模式(只要有一个验证失败，则返回)

两种验证模式配置方式：[参考官方文档](https://docs.jboss.org/hibernate/stable/validator/reference/en-US/html_single/#section-provider-specific-settings)

```
//failFast取值：true  快速失败返回模式    false 普通模式 
ValidatorFactory validatorFactory = Validation.byProvider( HibernateValidator.class )
        .configure()
        .failFast( true )
        .buildValidatorFactory();
Validator validator = validatorFactory.getValidator();

//hibernate.validator.fail_fast：true  快速失败返回模式    false 普通模式
ValidatorFactory validatorFactory = Validation.byProvider( HibernateValidator.class )
        .configure()
        .addProperty( "hibernate.validator.fail_fast", "true" )
        .buildValidatorFactory();
Validator validator = validatorFactory.getValidator();
```
### 设置配置文件
配置hibernate Validator为快速失败返回模式
```
@Configuration
public class ValidatorConfiguration {
    @Bean
    public Validator validator(){
        ValidatorFactory validatorFactory = Validation.byProvider( HibernateValidator.class )
                .configure()
                .addProperty( "hibernate.validator.fail_fast", "true" )
                .buildValidatorFactory();
        Validator validator = validatorFactory.getValidator();

        return validator;
    }
}
```
## 3种使用校验方式
### 请求参数校验@RequestBody @Valid
如demo里示例的，验证请求参数时，在@RequestBody DemoModel demo之间加注解 @Valid，然后后面加BindindResult即可；多个参数的，可以加多个@Valid和BindingResult，如：
```
public void test()(@RequestBody @Valid DemoModel demo, BindingResult result)
public void test()(@RequestBody @Valid DemoModel demo, BindingResult result,@RequestBody @Valid DemoModel demo2, BindingResult result2)

@RequestMapping("/demo2")
public void demo2(@RequestBody @Valid DemoModel demo, BindingResult result){
    if(result.hasErrors()){
        for (ObjectError error : result.getAllErrors()) {
            System.out.println(error.getDefaultMessage());
        }
    }
}
```
### 请求参数校验@RequestParam @Validated
<font color = 'red'>使用校验bean的方式，没有办法校验RequestParam的内容，一般在处理Get请求(或参数比较少)的时候</font>
<font color = 'red'>使用@Valid注解，对RequestParam对应的参数进行注解，是无效的，需要使用@Validated注解来使得验证生效。</font>

1. 此时需要使用MethodValidationPostProcessor 的Bean
```
@Bean
    public MethodValidationPostProcessor methodValidationPostProcessor() {
　　　　  /**默认是普通模式，会返回所有的验证不通过信息集合*/
        return new MethodValidationPostProcessor();
    }
```
或 可对MethodValidationPostProcessor 进行设置Validator（因为此时不是用的Validator进行验证，Validator的配置不起作用）
```
    @Bean
    public MethodValidationPostProcessor methodValidationPostProcessor() {
        MethodValidationPostProcessor postProcessor = new MethodValidationPostProcessor();
　　　　　/**设置validator模式为快速失败返回*/
        postProcessor.setValidator(validator());
        return postProcessor;
    }

    @Bean
    public Validator validator(){
        ValidatorFactory validatorFactory = Validation.byProvider( HibernateValidator.class )
                .configure()
                .addProperty( "hibernate.validator.fail_fast", "true" )
                .buildValidatorFactory();
        Validator validator = validatorFactory.getValidator();

        return validator;
    }
```
2. 方法所在的Controller上加注解@Validated
```
@RequestMapping("/validation")
@RestController
@Validated
public class ValidationController {
    /**如果只有少数对象，直接把参数写到Controller层，然后在Controller层进行验证就可以了。*/
    @RequestMapping(value = "/demo3", method = RequestMethod.GET)
    public void demo3(@Range(min = 1, max = 9, message = "年级只能从1-9")
                      @RequestParam(name = "grade", required = true)
                      int grade,
                      @Min(value = 1, message = "班级最小只能1")
                      @Max(value = 99, message = "班级最大只能99")
                      @RequestParam(name = "classroom", required = true)
                      int classroom) {
        System.out.println(grade + "," + classroom);
    }
}
```

3. 返回验证信息提示
可以看到：验证不通过时，抛出了ConstraintViolationException异常，使用同一捕获异常处理：
```
@ControllerAdvice
@Component
public class GlobalExceptionHandler {

    @ExceptionHandler
    @ResponseBody
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handle(ValidationException exception) {
        if(exception instanceof ConstraintViolationException){
            ConstraintViolationException exs = (ConstraintViolationException) exception;

            Set<ConstraintViolation<?>> violations = exs.getConstraintViolations();
            for (ConstraintViolation<?> item : violations) {
　　　　　　　　　　/**打印验证不通过的信息*/
                System.out.println(item.getMessage());
            }
        }
        return "bad request, " ;
    }
}
```
4. 验证
浏览器服务请求地址：http://localhost:8080/validation/demo3?grade=18&classroom=888
没有配置快速失败返回的MethodValidationPostProcessor 时输出信息如下：
年级只能从1-9
班级最大只能99

配置了快速失败返回的MethodValidationPostProcessor 时输出信息如下：
年级只能从1-9

### model校验
```
@Data
public class Demo2 {
    @Length(min = 5, max = 17, message = "length长度在[5,17]之间")
    private String length;

    /**@Size不能验证Integer，适用于String, Collection, Map and arrays*/
    @Size(min = 1, max = 3, message = "size在[1,3]之间")
    private String age;

    @Range(min = 150, max = 250, message = "range在[150,250]之间")
    private int high;

    @Size(min = 3,max = 5,message = "list的Size在[3,5]")
    private List<String> list;
}
```

验证model，以下全部验证通过
```
 @Autowired
    private Validator validator;
    
    @RequestMapping("/demo3")
    public void demo3(){
        Demo2 demo2 = new Demo2();
        demo2.setAge("111");
        demo2.setHigh(150);
        demo2.setLength("ABCDE");
        demo2.setList(new ArrayList<String>(){{add("111");add("222");add("333");}});
        Set<ConstraintViolation<Demo2>> violationSet = validator.validate(demo2);
        for (ConstraintViolation<Demo2> model : violationSet) {
            System.out.println(model.getMessage());
        }
    }
```

### 对象级联校验
```
@Data
public class Demo2 {
    @Size(min = 3,max = 5,message = "list的Size在[3,5]")
    private List<String> list;

    @NotNull
    @Valid
    private Demo3 demo3;
}

@Data
public class Demo3 {
    @Length(min = 5, max = 17, message = "length长度在[5,17]之间")
    private String extField;
}
```

级联校验：
```
    /**前面配置了快速失败返回的Bean*/
    @Autowired
    private Validator validator;

    @RequestMapping("/demo3")
    public void demo3(){
        Demo2 demo2 = new Demo2();
        demo2.setList(new ArrayList<String>(){{add("111");add("222");add("333");}});

        Demo3 demo3 = new Demo3();
        //可以校验Demo3的extField字段。
        demo3.setExtField("22");
        demo2.setDemo3(demo3);
        Set<ConstraintViolation<Demo2>> violationSet = validator.validate(demo2);
        for (ConstraintViolation<Demo2> model : violationSet) {
            System.out.println(model.getMessage());
        }
    }
```

### 分组校验
<font color ='red'>结论：分组顺序校验时，按指定的分组先后顺序进行验证，前面的验证不通过，后面的分组就不行验证。</font>
有这样一种场景，新增用户信息的时候，不需要验证userId（因为系统生成）；修改的时候需要验证userId，这时候可用用户到validator的分组验证功能。
设置validator为普通验证模式（"hibernate.validator.fail_fast", "false"），用到的验证GroupA、GroupB和model：

1. 校验接口
```
public interface GroupA {
}

public interface GroupB {
}
```

2. 校验请求对象
```
@Data
public class Person {
    @NotBlank
    @Range(min = 1,max = Integer.MAX_VALUE,message = "必须大于0",groups = {GroupA.class})
    /**用户id*/
    private Integer userId;
    @NotBlank
    @Length(min = 4,max = 20,message = "必须在[4,20]",groups = {GroupB.class})
    /**用户名*/
    private String userName;
    @NotBlank
    @Range(min = 0,max = 100,message = "年龄必须在[0,100]",groups={Default.class})
    /**年龄*/
    private Integer age;
    @Range(min = 0,max = 2,message = "性别必须在[0,2]",groups = {GroupB.class})
    /**性别 0：未知；1：男；2：女*/
    private Integer sex;
}
```
如上Person所示，3个分组分别验证字段如下：
* GroupA校验字段userId
* GroupB校验字段userName、sex
* Default校验字段age(Default使Validator自带的默认分组)

3. 校验
   只验证GroupA和GroupB的分组，以下示例代码
```
@RequestMapping("/demo5")
public void demo5(){
    Person p = new Person();
    /**GroupA验证不通过*/
    p.setUserId(-12);
    /**GroupA验证通过*/
    //p.setUserId(12);
    p.setUserName("a");
    p.setAge(110);
    p.setSex(5);
    Set<ConstraintViolation<Person>> validate = validator.validate(p, GroupA.class, GroupB.class);
    for (ConstraintViolation<Person> item : validate) {
        System.out.println(item);
    }
}

@RequestMapping("/demo6")
public void demo6(@Validated({GroupA.class, GroupB.class}) Person p, BindingResult result){
    if(result.hasErrors()){
        List<ObjectError> allErrors = result.getAllErrors();
        for (ObjectError error : allErrors) {
            System.out.println(error);
        }
    }
}
```

GroupA、GroupB、Default都验证不通过的情况：
验证信息如下所示：

ConstraintViolationImpl{interpolatedMessage='必须在[4,20]', propertyPath=userName, rootBeanClass=class validator.demo.project.model.Person, messageTemplate='必须在[4,20]'}
ConstraintViolationImpl{interpolatedMessage='必须大于0', propertyPath=userId, rootBeanClass=class validator.demo.project.model.Person, messageTemplate='必须大于0'}
ConstraintViolationImpl{interpolatedMessage='性别必须在[0,2]', propertyPath=sex, rootBeanClass=class validator.demo.project.model.Person, messageTemplate='性别必须在[0,2]'}

GroupA验证通过、GroupB、Default验证不通过的情况：
验证信息如下所示：

ConstraintViolationImpl{interpolatedMessage='必须在[4,20]', propertyPath=userName, rootBeanClass=class validator.demo.project.model.Person, messageTemplate='必须在[4,20]'}
ConstraintViolationImpl{interpolatedMessage='性别必须在[0,2]', propertyPath=sex, rootBeanClass=class validator.demo.project.model.Person, messageTemplate='性别必须在[0,2]'}

1. 组序列
指定组的验证顺序，前面组验证不通过，后面组不验证
// GroupA > GroupB > Default
@GroupSequence({GroupA.class, GroupB.class, Default.class})
public interface GroupOrder {
}

测试demo：
```
    @RequestMapping("/demo7")
    public void demo7(){
        Person p = new Person();
        /**GroupA验证不通过*/
        //p.setUserId(-12);
        /**GroupA验证通过*/
        p.setUserId(12);
        p.setUserName("a");
        p.setAge(110);
        p.setSex(5);
        Set<ConstraintViolation<Person>> validate = validator.validate(p, GroupOrder.class);
        for (ConstraintViolation<Person> item : validate) {
            System.out.println(item);
        }
    }

    @RequestMapping("/demo8")
    public void demo8(@Validated({GroupOrder.class}) Person p, BindingResult result){
        if(result.hasErrors()){
            List<ObjectError> allErrors = result.getAllErrors();
            for (ObjectError error : allErrors) {
                System.out.println(error);
            }
        }
    }
```

GroupA、GroupB、Default都验证不通过的情况：
验证信息如下所示：

ConstraintViolationImpl{interpolatedMessage='必须大于0', propertyPath=userId, rootBeanClass=class validator.demo.project.model.Person, messageTemplate='必须大于0'}

GroupA验证通过、GroupB、Default验证不通过的情况：
验证信息如下所示：

ConstraintViolationImpl{interpolatedMessage='必须在[4,20]', propertyPath=userName, rootBeanClass=class validator.demo.project.model.Person, messageTemplate='必须在[4,20]'}
ConstraintViolationImpl{interpolatedMessage='性别必须在[0,2]', propertyPath=sex, rootBeanClass=class validator.demo.project.model.Person, messageTemplate='性别必须在[0,2]'}

<font color ='red'>结论：分组顺序校验时，按指定的分组先后顺序进行验证，前面的验证不通过，后面的分组就不行验证</font>

### 自定义校验
一般情况，自定义验证可以解决很多问题。但也有无法满足情况的时候，此时，我们可以实现validator的接口，自定义自己需要的验证器。

如下所示，实现了一个自定义的大小写验证器：
```
@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy=SpecialFieldValidator.class)
public @interface SpecialField {

    String message() default "不能包含特殊字符";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

public class SpecialFieldValidator implements ConstraintValidator<SpecialField, String> {

    /**
     * 特殊字符的正则表达式
     */
    private String reg = "[ _`~!@#$%^&*()+=|{}':;',\\\\[\\\\].<>/?~！@#￥%……&*（）——+|{}【】‘；：”“’。，、？]|\\n|\\r|\\t";
    private Pattern pt = Pattern.compile(reg);

    @Override
    public void initialize(SpecialField specialField) {
        // TODO Auto-generated method stub
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext arg1) {
        if (value == null) {
            return true;
        }
        Matcher m = pt.matcher(value);
        if (m.find()) {
            return false;
        }
        return true;
    }

}

public enum CaseMode {
    UPPER,
    LOWER;
}


@Target( { ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = CheckCaseValidator.class)
@Documented
public @interface CheckCase {
    String message() default "";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    CaseMode value();
}


public class CheckCaseValidator implements ConstraintValidator<CheckCase, String> {
    private CaseMode caseMode;
    public void initialize(CheckCase checkCase) {
        this.caseMode = checkCase.value();
    }

    public boolean isValid(String s, ConstraintValidatorContext constraintValidatorContext) {
        if (s == null) {
            return true;
        }

        if (caseMode == CaseMode.UPPER) {
            return s.equals(s.toUpperCase());
        } else {
            return s.equals(s.toLowerCase());
        }
    }
}


    public class Demo{
        @CheckCase(value = CaseMode.LOWER,message = "userName必须是小写")
        private String userName;

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }
    }

    @Bean
    public Validator validator(){
        ValidatorFactory validatorFactory = Validation.byProvider( HibernateValidator.class )
                .configure()
                .addProperty( "hibernate.validator.fail_fast", "true" )
                .buildValidatorFactory();
        Validator validator = validatorFactory.getValidator();

        return validator;
    }

    @RequestMapping("/demo4")
    public void demo4(){
        Demo demo = new Demo();
        demo.setUserName("userName");
        Set<ConstraintViolation<Demo>> validate = validator.validate(demo);
        for (ConstraintViolation<Demo> dem : validate) {
            System.out.println(dem.getMessage());
        }
    }
```

输出结果：userName必须是小写

## 常见的注解
  Bean Validation 中内置的 constraint     
@Null   被注释的元素必须为 null     
@NotNull    被注释的元素必须不为 null     
@AssertTrue     被注释的元素必须为 true     
@AssertFalse    被注释的元素必须为 false     
@Min(value)     被注释的元素必须是一个数字，其值必须大于等于指定的最小值     
@Max(value)     被注释的元素必须是一个数字，其值必须小于等于指定的最大值     
@DecimalMin(value)  被注释的元素必须是一个数字，其值必须大于等于指定的最小值     
@DecimalMax(value)  被注释的元素必须是一个数字，其值必须小于等于指定的最大值     
@Size(max=, min=)   被注释的元素的大小必须在指定的范围内     
@Digits (integer, fraction)     被注释的元素必须是一个数字，其值必须在可接受的范围内     
@Past   被注释的元素必须是一个过去的日期     
@Future     被注释的元素必须是一个将来的日期     
@Pattern(regex=,flag=)  被注释的元素必须符合指定的正则表达式     
Hibernate Validator 附加的 constraint     
@NotBlank(message =)   验证字符串非null，且长度必须大于0     
@Email  被注释的元素必须是电子邮箱地址     
@Length(min=,max=)  被注释的字符串的大小必须在指定的范围内     
@NotEmpty   被注释的字符串的必须非空     
@Range(min=,max=,message=)  被注释的元素必须在合适的范围内
```
//大于0.01，不包含0.01
@NotNull
@DecimalMin(value = "0.01", inclusive = false)
private Integer greaterThan;

//大于等于0.01
@NotNull
@DecimalMin(value = "0.01", inclusive = true)
private BigDecimal greatOrEqualThan;

@Length(min = 1, max = 20, message = "message不能为空")
//不能将Length错用成Range
//@Range(min = 1, max = 20, message = "message不能为空")
private String message;
```