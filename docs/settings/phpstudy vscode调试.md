---
id: PHPStudy+VSCode Xdebug调试配置
title: PHPStudy+VSCode Xdebug调试配置
layout: doc
---

这里用的最简单的方法
首先安装好phpstudy和vscode



## 1、配置phpstudy

选择要用的php版本，开启xdebug调试，配置好监听端口(确保没被占用)![](https://s2.loli.net/2022/03/16/PrE5tFalRgIkCLB.png)

然后修改php.ini：

`xdebug.remote_enable=On`
`xdebug.remote_autostart=On`

没有的话就自己加上

![](https://s2.loli.net/2022/03/16/Z5WzwQmHKtiLkUp.png)

配置完毕后保存重启apache



## 2、vscode

安装扩展 php debug

![](https://s2.loli.net/2022/03/16/jVL1rfXzdnZU3qP.png)

在设置里搜索php，在setting.json配置你的php路径

![](https://s2.loli.net/2022/03/16/wFjzl9ykiI5oCSA.png)

配置"php.validate.executablePath": "你的php.exe的路径"

![](https://s2.loli.net/2022/03/16/noRlxA7QprmjfLh.png)

配置xdebug

侧边栏选择运行和调试，选择用xdebug监听，然后配置监听端口和phpstudy一致即可

![](https://s2.loli.net/2022/03/16/AX57di2xVGkCUI3.png)

配置好后就可以美美的对代码进行调试分析了，找链子也是灰常好用的



## 补充：利用动态调试解密源码

很早就碰到过php混淆的题目，有师傅说可以用调试来解密，但当时尝试无果

后面看到南方师傅这篇文章[奇安信攻防社区-记一次渗透实战-代码审计到getshell (butian.net)](https://forum.butian.net/share/1206)

就尝试了一波



之前看Db.php的源码是加密的

那么跑到像登录这种和数据库存在交互的地方进行动态调试就可以解密源码了



添加断点`F5`开启调试，可以看到停在断点处了，这时候可以跟进到下一步`F11`

![](https://s2.loli.net/2022/03/16/igwfBo52n4lGZkR.png)



把得到的东东再用vscode格式化一下就可以美美开始审计

![](https://s2.loli.net/2022/03/16/CqVYX3cImoQz69f.png)
