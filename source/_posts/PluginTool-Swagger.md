---
title: Swagger管理API文档
tags: [Plugin,Swagger]
categories: [PluginTool]
---

## 引入jar包
```
        <!--     swagger2 接口API文档       -->
        <dependency>
            <groupId>io.springfox</groupId>
            <artifactId>springfox-swagger2</artifactId>
            <version>2.9.2</version>
        </dependency>
        <dependency>
            <groupId>io.springfox</groupId>
            <artifactId>springfox-swagger-ui</artifactId>
            <version>2.7.0</version>
        </dependency>
        <!-- 上面两个jar的必须的，下面这个是第三方的UI界面的美化，不是必需的 -->
        <dependency>
            <groupId>com.github.xiaoymin</groupId>
            <artifactId>swagger-bootstrap-ui</artifactId>
            <version>1.9.6</version>
        </dependency>
    </dependencies>
```

## 增加配置
```
@Configuration
@EnableSwagger2
@ConditionalOnProperty(prefix = "swagger2",value = {"enable"},havingValue = "true")
@ComponentScan(basePackages = "com.sprongboot.boot_mp.controller")//配置扫描的基础包
public class SwaggerConfig {
    //在构建文档的时候 只显示添加了@Api注解的类
    @Bean //作为bean纳入spring容器
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .select()
                .paths(PathSelectors.any())//指定RequestHandlerSelectors.basePackage("com.aop8"))
                .apis(RequestHandlerSelectors.withClassAnnotation(Api.class))
                .build();
    }
    private ApiInfo apiInfo(){
        return  new ApiInfoBuilder()
                .title("API接口文档")
                .description("API接口文档，及相关接口的说明")
                .contact(new Contact("zhangsan", "http://www.baidu.com", "baidu@163.com"))
                .version("1.0.0")
                .build();
    }
}
```

## 在生产环境中如何禁用swagger
### 方式1
通过@ConditionalOnProperty(prefix = “swagger2”,value = {“enable”},havingValue = “true”)注解实现。读取配置文件中前缀为swagger2的配置，属性名为enable，值为true。当条件成立，此配置类被激活。两个属性name以及havingValue，其中name用来从application.properties中读取某个属性值，如果该值为空，则返回false;如果值不为空，则将该值与havingValue指定的值进行比较，如果一样则返回true;否则返回false。如果返回值为false，则该configuration不生效；为true则生效
* dev环境application.yml
```
spring:
	profiles: dev
swagger2:
	enable: true		
```
* prod环境application.yml
```
spring:
	profiles: prod
swagger2:
	enable: false(或者在pro环境下不写此配置)
```

* 运行dev环境Java -jar demo.jar --spring.profiles.active=dev
* 运行prod环境 java -jar demo.jar --spring.profiles.active=prod

此时我们访问开发环境可以进swagger，进生产环境则会被屏蔽调。

### 方式2
```
@Configuration
@EnableSwagger2
@Profile("dev")
public class Swagger2 extends WebMvcConfigurationSupport {
    @Bean
    public Docket createRestApi() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .select()
                //为当前包路径
                .apis(RequestHandlerSelectors.basePackage("com.yq.demo.controller"))
                .paths(PathSelectors.any())
                .build();
    }
    //构建 api文档的详细信息函数,注意这里的注解引用的是哪个
    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("Spring Boot 测试使用 Swagger2 构建RESTful API")
                .contact(new Contact("EricYang", "https://github.com/yqbjtu/springbootJpa.git", "test@163.com"))
                .version("1.0")
                .description("User API 描述")
                .build();
    }

    @Override
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/swagger-ui.html").addResourceLocations(
                "classpath:/META-INF/resources/");
        registry.addResourceHandler("/webjars/**").addResourceLocations(
                "classpath:/META-INF/resources/webjars/");
    }
}
```

注:在Spring Boot的启动过程中，只能有一个继承WebMvcConfigurationSupport的@Configuration类（使用@EnableMvc效果相同），如果存在多个这样的类，只有一个配置可以生效。对于这个问题，其实可以通过implements WebMvcConfigurer来解决，多个不同的类实现这个接口后的配置都可以正常运行或者合并到一个WebMvcConfigurationSupport中实现
### Maven打包
* 如果是mvn package -P dev，这样生成的jar包，启动后可以看到swagger可以正常访问，然后我们使用java -jar xxxx.jar启动
* 使用mvc package -P prod将代码编译打包，然后我们使用java -jar xxxx.jar启动

## Swagger2相关注解说明
```
@Api：用在请求的类上，表示对类的说明
	tags="说明该类的作用，可以在UI界面上看到的注解"
	value="该参数没什么意义，在UI界面上也看到，所以不需要配置"

@ApiOperation：用在请求的方法上，说明方法的用途、作用
	value="说明方法的用途、作用"
	notes="方法的备注说明"

@ApiImplicitParams：用在请求的方法上，表示一组参数说明
	@ApiImplicitParam：用在@ApiImplicitParams注解中，指定一个请求参数的各个方面
	    name：参数名
	    value：参数的汉字说明、解释
	    required：参数是否必须传
	    paramType：参数放在哪个地方
	        · header --> 请求参数的获取：@RequestHeader
	        · query --> 请求参数的获取：@RequestParam
	        · path（用于restful接口）--> 请求参数的获取：@PathVariable
	        · body（不常用）
	        · form（不常用）	   
	    dataType：参数类型，默认String，其它值dataType="Integer"	   
	    defaultValue：参数的默认值
	    
@ApiResponses：用在请求的方法上，表示一组响应
	@ApiResponse：用在@ApiResponses中，一般用于表达一个错误的响应信息
	    code：数字，例如400
	    message：信息，例如"请求参数没填好"
	    response：抛出异常的类
	    
@ApiModel：用于响应类上，表示一个返回响应数据的信息
			（这种一般用在post创建的时候，使用@RequestBody这样的场景，
			请求参数无法使用@ApiImplicitParam注解进行描述的时候）
	@ApiModelProperty：用在属性上，描述响应类的属性
```
