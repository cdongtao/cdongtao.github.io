---
title:自定义注解校验
tags: [注解校验,Hibernate Validator]
categories: [SpringBoot]
---

## 校验框架
[hibernate validator官方文档](http://hibernate.org/validator/documentation/) 提供了一套比较完善、便捷的验证实现方式。
spring-boot-starter-web包里面有hibernate-validator包，不需要引用hibernate validator依赖

## 自定义注解校验枚举值
### 需求及方案
我们经常会有一个对象的属性值只能出现在一组常量中的校验需求，例如：用户性别字段gender只能等于MALE/FEMALE这两个其中一个值，用户账号的状态status只能等于：NORMAL/DISABLED/DELETED其中一个等等，那么我们怎么能更好的校验这个参数呢？

### 实现方案：
上面提到的一组常量值，我们第一反应应该是定义一个枚举类，尽量不要放在一个统一的constants类下，这样当系统一旦庞大起来，常量是很难维护和查找的，所以前期代码也应该有一些规范性约束，这里我们约定一组常量值时使用枚举，并把该枚举类放在对应的类对象里(以上述所说的用户功能为例，我们应该把GenerEnum、UserStatusEnum枚举放在User.java下，方便查找),这里我们定义一个叫EnumValue.java的注解类，其下有两个主要参数一个是enumClass用于指定枚举类，enumMethod指定要校验的方法，下面我们看代码实现。

### 代码实现
```
@Target({ ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = EnumValue.Validator.class)
public @interface EnumValue {
 
    String message() default "{custom.value.invalid}";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    Class<? extends Enum<?>> enumClass();
    String enumMethod();

    class Validator implements ConstraintValidator<EnumValue, Object> {
        private Class<? extends Enum<?>> enumClass;
        private String enumMethod;

        @Override
        public void initialize(EnumValue enumValue) {
            enumMethod = enumValue.enumMethod();
            enumClass = enumValue.enumClass();
        }

        @Override
        public boolean isValid(Object value, ConstraintValidatorContext constraintValidatorContext) {
            if (value == null) {
                return Boolean.TRUE;
            }
            if (enumClass == null || enumMethod == null) {
                return Boolean.TRUE;
            }
            Class<?> valueClass = value.getClass();
            try {
                Method method = enumClass.getMethod(enumMethod, valueClass);
                if (!Boolean.TYPE.equals(method.getReturnType()) && !Boolean.class.equals(method.getReturnType())) {
                    throw new RuntimeException(Strings.formatIfArgs("%s method return is not boolean type in the %s class", enumMethod, enumClass));
                }
 
                if(!Modifier.isStatic(method.getModifiers())) {
                    throw new RuntimeException(Strings.formatIfArgs("%s method is not static method in the %s class", enumMethod, enumClass));
                }
 
                Boolean result = (Boolean)method.invoke(null, value);
                return result == null ? false : result;
            } catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
                throw new RuntimeException(e);
            } catch (NoSuchMethodException | SecurityException e) {
                throw new RuntimeException(Strings.formatIfArgs("This %s(%s) method does not exist in the %s", enumMethod, valueClass, enumClass), e);
            }
        }
 
    }
}
```
备注：自定义注解需要实现ConstraintValidator校验类，这里我们定义一个叫Validator的类来实现它，同时实现它下面的两个方法initialize、isValid，一个是初始化参数的方法，另一个就是校验逻辑的方法，本例子中我们将校验类定义在该注解内，用@Constraint(validatedBy = EnumValue.Validator.class)注解指定校验类，内部逻辑实现比较简单就是使用了静态类反射调用验证方法的方式。对于被校验的方法(EnumValue 的 enumMethod方法)我们要求，它必须是返回值类型为Boolean或boolean，并且必须是一个静态的方法，返回返回值为null时我们认为是校验不通过的，按false逻辑走。

### 校验的目标对象类
```
public class User implements Serializable {
 
    private static final long serialVersionUID = 2594274431751408585L;
 
    private Long id;
 
    @NotBlank
    private String pwd;
 
    @NotBlank
    @Length(min=1, max=64)
    private String nickname;
 
    private String img;
 
    @Pattern(regexp = "^1[3-9]\\d{9}$")
    private String phone;
 
     @EnumValue(enumClass=UserStatusEnum.class, enumMethod="isValidName")
    private String status;
 
    private Date latestLoginTime;
 
    private String latestLoginIp;
 
    private Date createTime;
    private Date updateTime;
 
    /**
     * 用户状态枚举
     */
    public enum UserStatusEnum {
        /**正常的*/
        NORMAL,
        /**禁用的*/
        DISABLED,
        /**已删除的*/
        DELETED;
 
        /**
         * 判断参数合法性
         */
        public static boolean isValidName(String name) {
            for (UserStatusEnum userStatusEnum : UserStatusEnum.values()) {
                if (userStatusEnum.name().equals(name)) {
                    return true;
                }
            }
            return false;
        }
    }
    //省略getter、setter方法
}
```

### controller类
```
@RestController
@RequestMapping("/users")
public class UserController {
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    //实际使用没有加 @Validated
    public User addUser(@Validated @RequestBody User user) {
        user.setId(10000L);
        user.setCreateTime(new Date());
        return user;
    }
 
}
```

