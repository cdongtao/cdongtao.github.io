---
title: Swagger管理API文档
tags: [Plugin,Swagger]
categories: [PluginTool]
---

## Swagger2
URL:http://localhost:8080/swagger-ui/index.html
### 引入jar包
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
    </dependencies>
```

### 增加配置
```
swagger:
  enable: true
  application-name: ${spring.application.name}
  application-version: 1.0
  application-description: springfox swagger 3.0整合Demo
  try-host: http://localhost:${server.port}

@Component
@Data
@ConfigurationProperties("swagger")
public class SwaggerProperties {
    /**
     * 是否开启swagger，生产环境一般关闭，所以这里定义一个变量
     */
    private Boolean enable;

    /**
     * 项目应用名
     */
    private String applicationName;

    /**
     * 项目版本信息
     */
    private String applicationVersion;

    /**
     * 项目描述信息
     */
    private String applicationDescription;

    /**
     * 接口调试地址
     */
    private String tryHost;
}


@Configuration
@EnableSwagger2
@ConditionalOnProperty(prefix = "swagger2",value = {"enable"},havingValue = "true")
public class SwaggerConfiguration implements WebMvcConfigurer {
    private final SwaggerProperties swaggerProperties;

    public SwaggerConfiguration(SwaggerProperties swaggerProperties) {
        this.swaggerProperties = swaggerProperties;
    }

    @Bean
    public Docket createRestApi() {
        return new Docket(DocumentationType.OAS_30).pathMapping("/")

                // 定义是否开启swagger，false为关闭，可以通过变量控制
                .enable(swaggerProperties.getEnable())

                // 将api的元信息设置为包含在json ResourceListing响应中。
                .apiInfo(apiInfo())

                // 接口调试地址
                .host(swaggerProperties.getTryHost())

                // 选择哪些接口作为swagger的doc发布
                .select()
                .apis(RequestHandlerSelectors.any())
                .paths(PathSelectors.any())
                .build()

                // 支持的通讯协议集合
                .protocols(newHashSet("https", "http"))

                // 授权信息设置，必要的header token等认证信息
                .securitySchemes(securitySchemes())

                // 授权信息全局应用
                .securityContexts(securityContexts());
    }

    /**
     * API 页面上半部分展示信息
     */
    private ApiInfo apiInfo() {
        return new ApiInfoBuilder().title(swaggerProperties.getApplicationName() + " Api Doc")
                .description(swaggerProperties.getApplicationDescription())
                .contact(new Contact("lighter", null, "123456@gmail.com"))
                .version("Application Version: " + swaggerProperties.getApplicationVersion() + ", Spring Boot Version: " + SpringBootVersion.getVersion())
                .build();
    }

    /**
     * 设置授权信息
     */
    private List<SecurityScheme> securitySchemes() {
        ApiKey apiKey = new ApiKey("BASE_TOKEN", "token", In.HEADER.toValue());
        return Collections.singletonList(apiKey);
    }

    /**
     * 授权信息全局应用
     */
    private List<SecurityContext> securityContexts() {
        return Collections.singletonList(
                SecurityContext.builder()
                        .securityReferences(Collections.singletonList(new SecurityReference("BASE_TOKEN", new AuthorizationScope[]{new AuthorizationScope("global", "")})))
                        .build()
        );
    }

    @SafeVarargs
    private final <T> Set<T> newHashSet(T... ts) {
        if (ts.length > 0) {
            return new LinkedHashSet<>(Arrays.asList(ts));
        }
        return null;
    }

    /**
     * 通用拦截器排除swagger设置，所有拦截器都会自动加swagger相关的资源排除信息
     */
    @SuppressWarnings("unchecked")
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        try {
            Field registrationsField = FieldUtils.getField(InterceptorRegistry.class, "registrations", true);
            List<InterceptorRegistration> registrations = (List<InterceptorRegistration>) ReflectionUtils.getField(registrationsField, registry);
            if (registrations != null) {
                for (InterceptorRegistration interceptorRegistration : registrations) {
                    interceptorRegistration
                            .excludePathPatterns("/swagger**/**")
                            .excludePathPatterns("/webjars/**")
                            .excludePathPatterns("/v3/**")
                            .excludePathPatterns("/doc.html");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
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
在配置文件中配置，从配置文件读取


注:在Spring Boot的启动过程中，只能有一个继承WebMvcConfigurationSupport的@Configuration类（使用@EnableMvc效果相同），如果存在多个这样的类，只有一个配置可以生效。对于这个问题，其实可以通过implements WebMvcConfigurer来解决，多个不同的类实现这个接口后的配置都可以正常运行或者合并到一个WebMvcConfigurationSupport中实现

## Swagger 3
通过在项目中引入 springfox-boot-starter 依赖，直接使用,也可以通过自带配置可以禁掉Swagger
URL:http://localhost:8080/swagger-ui/
### 依赖
    <dependency>
        <groupId>io.springfox</groupId>
        <artifactId>springfox-boot-starter</artifactId>
        <version>3.0.0</version>
    </dependency>

### 自带配置项
![1.png](/swagger/1.png "1.png")

## Swagger相关注解说明
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

