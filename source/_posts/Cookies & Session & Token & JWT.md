---
title: Cookies & Session & Token & JWT
tags: [base]
categories: [FrontEnd]
---

## Cookies && Session
http协议本身是一种无状态的协议，而这就意味着如果用户向我们的应用提供了用户名和密码来进行用户认证，那么下一次请求时，用户还要再一次进行用户认证才行，因为根据http协议，我们并不能知道是哪个用户发出的请求，所以为了让我们的应用能识别是哪个用户发出的请求，我们只能在服务器存储一份用户登录的信息，这份登录信息会在响应时传递给浏览器，告诉其保存为cookie,以便下次请求时发送给我们的应用，这样我们的应用就能识别请求来自哪个用户了,这就是传统的基于session认证。

但是这种基于session的认证使应用本身很难得到扩展，随着不同客户端用户的增加，独立的服务器已无法承载更多的用户，而这时候基于session认证应用的问题就会暴露出来.

##### 基于session认证所显露的问题
Session: 每个用户经过我们的应用认证之后，我们的应用都要在服务端做一次记录，以方便用户下次请求的鉴别，通常而言session都是保存在内存中，而随着认证用户的增多，服务端的开销会明显增大。

扩展性: 用户认证之后，服务端做认证记录，如果认证的记录被保存在内存中的话，这意味着用户下次请求还必须要请求在这台服务器上,这样才能拿到授权的资源，这样在分布式的应用上，相应的限制了负载均衡器的能力。这也意味着限制了应用的扩展能力。

CSRF: 因为是基于cookie来进行用户识别的, cookie如果被截获，用户就会很容易受到跨站请求伪造的攻击。

## Token
基于token的鉴权机制类似于http协议也是无状态的，它不需要在服务端去保留用户的认证信息或者会话信息。这就意味着基于token认证机制的应用不需要去考虑用户在哪一台服务器登录了，这就为应用的扩展提供了便利。

###### 流程上是这样的：
1.用户使用用户名密码来请求服务器
2.服务器进行验证用户的信息
3.服务器通过验证发送给用户一个token
4.客户端存储token，并在每次请求时附送上这个token值
5.服务端验证token值，并返回数据
6.这个token必须要在每次请求时传递给服务端，它应该保存在请求头里， 另外，服务端要支持CORS(跨来源资源共享,跨域请求)策略，一般我们在服务端这么做就可以了Access-Control-Allow-Origin: *。

## JWT(Json Web Token)
该token被设计为紧凑且安全的，特别适用于分布式站点的单点登录（SSO）场景。JWT的声明一般被用来在身份提供者和服务提供者间传递被认证的用户身份信息，以便于从资源服务器获取资源，也可以增加一些额外的其它业务逻辑所必须的声明信息，该token也可直接被用于认证，也可被加密。

## JWT原理

#### JWT的构成
第一部分我们称它为头部（header),第二部分我们称其为载荷（payload, 类似于飞机上承载的物品)，第三部分是签证（signature).


#### Header
jwt的头部承载两部分信息：

声明类型，这里是jwt
声明加密的算法 通常直接使用 HMAC SHA256
完整的头部就像下面这样的JSON：

{
  'typ': 'JWT',
  'alg': 'HS256'
}
然后将头部进行base64加密（该加密是可以对称解密的),构成了第一部分.
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9

#### playload
载荷就是存放有效信息的地方。这个名字像是特指飞机上承载的货品，这些有效信息包含三个部分

标准中注册的声明
公共的声明
私有的声明
标准中注册的声明 (建议但不强制使用) ：

iss: jwt签发者
sub: jwt所面向的用户
aud: 接收jwt的一方
exp: jwt的过期时间，这个过期时间必须要大于签发时间
nbf: 定义在什么时间之前，该jwt都是不可用的.
iat: jwt的签发时间
jti: jwt的唯一身份标识，主要用来作为一次性token,从而回避重放攻击。
公共的声明 ：
公共的声明可以添加任何的信息，一般添加用户的相关信息或其他业务需要的必要信息.但不建议添加敏感信息，因为该部分在客户端可解密.

私有的声明 ：
私有声明是提供者和消费者所共同定义的声明，一般不建议存放敏感信息，因为base64是对称解密的，意味着该部分信息可以归类为明文信息。

定义一个payload:

{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true
}

然后将其进行base64加密，得到Jwt的第二部分。
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9

#### signature

jwt的第三部分是一个签证信息，这个签证信息由三部分组成：
##### header (base64后的)
##### payload (base64后的)
##### secret
这个部分需要base64加密后的header和base64加密后的payload使用.连接组成的字符串，然后通过header中声明的加密方式进行加盐secret组合加密，然后就构成了jwt的第三部分。

````
var encodedString = base64UrlEncode(header) + '.' + base64UrlEncode(payload);
var signature = HMACSHA256(encodedString, 'secret'); 
// TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
将这三部分用.连接成一个完整的字符串,构成了最终的jwt:
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
注意：secret是保存在服务器端的，jwt的签发生成也是在服务器端的，secret就是用来进行jwt的签发和jwt的验证，所以，它就是你服务端的私钥，在任何场景都不应该流露出去。一旦客户端得知这个secret, 那就意味着客户端是可以自我签发jwt了。
````

#### JWT认证原理

最后再解释一下application server如何认证用户发来的JWT是否合法，首先application server 和 authentication server必须要有个约定，例如双方同时知道加密用的secret（这里假设用的就是简单的对称加密算法），那么在applicaition 收到这个JWT是，就可以利用JWT前两段（别忘了JWT是个三段的拼成的字符串哦）数据作为输入，用同一套hash算法和同一个secret自己计算一个签名值，然后把计算出来的签名值和收到的JWT第三段比较，如果相同则认证通过，如果不相同，则认证不通过。就这么简单，当然，上面是假设了这个hash算法是对称加密算法,其实如果用非对称加密算法也是可以的，比方说我就用非对称的算法，那么对应的key就是一对，而非一个，那么一对公钥+私钥可以这样分配：私钥由authentication server保存，公钥由application server保存，application server验证的时候，用公钥解密收到的signature,这样就得到了header和payload的拼接值，用这个拼接值跟前两段比较，相同就验证通过。总之，方法略不同，但大方向完全一样。


## JWT应用考虑的问题
一个实战问题:jwt如何实现logout?

一种是设置expire time, 这种可以称为"被动logout",即超过了一定时间自动失效,但是如果等不及,就是想主动logout怎么办呢?由于jwt的这种"无状态"的天然属性,理论上是没有办法直接主动logout的,但是有一个间接的方法,就是可以在服务器后台存一个"黑名单",这个黑名单专门用来存尚未过期但又想主动标明失效的的token,然后登录状态检查的时候多做一步黑名单检查即可.

#### 提两个best practice:

1.发送JWT要用https，原因前面说了，JWT本身不保证数据安全
2.JWT的payload中设置expire时间，为什么要这样做其实跟cookie为什么要设置过期时间一样，都是为了安全。
