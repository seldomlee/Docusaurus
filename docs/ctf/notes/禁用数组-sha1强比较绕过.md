---
title: 禁用数组-sha1强比较绕过
id: 禁用数组-sha1强比较绕过
---

<!-- more -->



群里师傅问的一道题目，正好之前马了相关文章，很有意思但没复现过，借此机会水一篇博客

参考文章：

[ctf/Prudentialv2_Cloud_50.md at master · bl4de/ctf (github.com)](https://github.com/bl4de/ctf/blob/master/2017/BostonKeyParty_2017/Prudentialv2/Prudentialv2_Cloud_50.md)

[Using the SHA1 collision attack to solve the BostonKeyParty CTF challenge (linkedin.com)](https://www.linkedin.com/pulse/using-sha1-collision-attack-solve-bostonkeyparty-ctf-rotimi)

题目源码：

```php
<?php
error_reporting(0);

$flag=getenv('fllag');
if (isset($_GET['name']) and isset($_GET['password'])) 
{
    if ($_GET['name'] == $_GET['password'])
        echo '<p>Your password can not be your name!</p>';
    else if(is_array($_GET['name']) || is_array($_GET['password']))
        die('There is no way you can sneak me, young man!');
    else if (sha1($_GET['name']) === sha1($_GET['password'])){
      echo "Hanzo:It is impossible only the tribe of Shimada can controle the dragon<br/>";
      die('Genji:We will see again Hanzo'.$flag.'<br/>');
    }
    else
        echo '<p>Invalid password.</p>';
}else
    echo '<p>Login first!</p>';
highlight_file(__FILE__);
?>
```

看一下怎样才能拿到flag：

1. username不等于password
2. 二者皆不能为数组
3. 二者sha1()后的值强相等

原本面对sha1还有md5这些都是利用其不能解析数组的特性绕过，但这里把数组ban了只能另辟蹊径

那该咋整捏，文章是这么说的：

> My thought-process at this point was to have different values for $name and $password but with the same sha1 signature. What immediately comes to mind is the SHA1 Collision attack recently revealed by the google team.
>
> According to the google team, “It is now practically possible to craft two colliding PDF files and obtain a SHA-1 digital signature on the first PDF file which can also be abused as a valid signature on the second PDF file.”
>
> 
>
> 在这一点上，我的想法是对$name和$password使用不同的值，但使用相同的sha1签名。我马上想到的是谷歌团队最近公布的SHA1碰撞攻击。
>
> 谷歌团队表示，“现在实际上可以制作两个相互冲突的PDF文件，并在第一个PDF文件上获得SHA-1数字签名，这也可能被滥用为第二个PDF文件的有效签名。”

两个不同的PDF文件，具有相同的校验和:
具体分析还是这篇[ctf/Prudentialv2_Cloud_50.md at master · bl4de/ctf (github.com)](https://github.com/bl4de/ctf/blob/master/2017/BostonKeyParty_2017/Prudentialv2/Prudentialv2_Cloud_50.md)

[shattered-1.pdf](http://shattered.io/static/shattered-1.pdf)
[shattered-2.pdf](http://shattered.io/static/shattered-2.pdf)

那么脚本请求一下：（因为我用的是py3,用urllib.request替代urllib2就行）

```python
import requests
import urllib.request

rotimi = urllib.request.urlopen("http://shattered.io/static/shattered-1.pdf").read()[:500];
letmein = urllib.request.urlopen("http://shattered.io/static/shattered-2.pdf").read()[:500];

r = requests.get('http://tc.rigelx.top:8003/baby_revenge.php', params={'name': rotimi, 'password': letmein});
print(r.text)
```

![](https://i.loli.net/2021/10/21/ZsAjVBFcOJb9H7w.png)



但是这题还没结束

- 绕过第一个if：id传参不能等于hackerDJ;

- 然后url解码一次，再比较，为hackDJ输出flag
  因为浏览器本身会url解码一次，传入2次url编码后的hackerDJ即可：

  ```
  %25%36%38%25%36%31%25%36%33%25%36%62%25%36%35%25%37%32%25%34%34%25%34%61
  ```

![](https://i.loli.net/2021/10/21/kXvsWhPyjnJu4wa.png)
