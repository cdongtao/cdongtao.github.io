---
title: 转发与重定向
tags: [转发,重定向,Web]
categories: [FrontEnd]
---

## 转发
request.getRequestDispatcher(目标地址).forward(request，response)：请求转发是服务器将请求转发给别的servlet处理，是服务器内部的行为

### 请求转发的过程
客户端向服务器发送请求，服务器将请求指派给一个servlet处理（命名为A），A处理后发现自己处理不了该请求，就调用request.getRequestDispatcher(目标).forward(request，response)方法将请求转发给servlet（B）让B处理，B处理成功后将结果返回给客户端。

### 特点
1. 转发是在服务器端完成的，与客户端无关
2. 转发是同一次请求，无论服务器端转发多少次都只有一次请求
3. 转发的客户端地址栏不会变化，无论最后响应的是哪个servlet地址栏都不会改变
4. 转发必须在同一台服务器下完成，是服务器内部行为

![请求转发的过程](/web/12.png)

## 重定向
response.sendredirect（URL）：是通过各种方法将请求重新定个方向转到其它位置
### 重定向过程
客户端发送一个请求到服务器，服务器匹配Servlet，这都和请求转发一样。Servlet处理完之后调用了response.sendRedirect()方法。当这个Servlet处理完后，看到response.sendRedirect()方法，立即向客户端返回个响应，响应行告诉客户端你必须再重新发送一个请求，去访问另一个目标，客户端收到这个请求后，立刻发出一个新的请求，去请求重定向后的目标,在这两个请求互不干扰、相互独立，在前面request里面setAttribute()的任何东西，在后面的request里面都获得不了。因此，在sendRedirect()里面是两个请求，两个响应。

![重定向过程](/web/13.png)

### 特点
1、重定向是在客户端发生的；
2、重定向是两次或以上请求；
3、重定向地址栏有变化；
4、重定向可以在不同的服务器下完成。

## 应用
特殊的应用：对数据进行修改、删除、添加操作的时候，应该用response.sendRedirect()。如果是采用了request.getRequestDispatcher().forward(request,response)，那么操作前后的地址栏都不会发生改变，仍然是修改的控制器，如果此时再对当前页面刷新的话，就会重新发送一次请求对数据进行修改，这也就是有的人在刷新一次页面就增加一条数据的原因。

如何采用sendRedirect()方式传递数据：
1、可以选择session，但要在第二个文件中删除；
2、可以在请求的url中带上参数，如"add.htm?id=122"

## 转发和重定向的路径问题
1）使用相对路径在重定向和转发中没有区别
2）重定向和请求转发使用绝对路径时，根/路径代表了不同含义
重定向response.sendRedirect("xxx")是服务器向客户端发送一个请求头信息，由客户端再请求一次服务器。/指的Tomcat的根目录,写绝对路径应该写成"/当前Web程序根名称/资源名" 。如"/WebModule/login.jsp","/bbs/servlet/LoginServlet"
转发是在服务器内部进行的，写绝对路径/开头指的是当前的Web应用程序。绝对路径写法就是"/login.jsp"或"/servlet/LoginServlet"。

总结：以上要注意是区分是从服务器外的请求，还在是内部转发，从服务器外的请求，从Tomcat根写起(就是要包括当前Web的根)；是服务器内部的转发，很简单了，因为在当前服务器内，/写起指的就是当前Web的根目录。



