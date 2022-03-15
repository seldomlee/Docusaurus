---
title: 在华为云配置kali-linux
id: 在华为云配置kali-linux
---

<!-- more -->

## 前言

经过百度搜索看到两种方法
**第一种**：挂载云硬盘(数据盘)，将kali镜像刻录到挂载的云硬盘中，利用VNC可视化安装kali系统
具体可以看->[在云服务器上安装kali linux - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/67432340)

**第二种**：在本地配置好kali，再上传镜像，云服务器利用此镜像更改操作系统即可[在云主机上安装kali-腾讯云实战篇](https://blog.csdn.net/weixin_41977939/article/details/110557883)

但是第一种方式的云硬盘是要钱的，而且价格不菲；虽然第二种读取镜像的时候也要收费，但只要2块
所以果断选择第二种了

## 准备工作

1. **virtualbox**:[Downloads – Oracle VM VirtualBox](https://www.virtualbox.org/wiki/Downloads)

2. **kali**:[Downloads | Kali Linux](https://www.kali.org/downloads/)	ps：这里我下载的是kali linux 64-bit(installer)

3. **hw-obs browser**:[下载OBS Browser+华为云](https://support.huaweicloud.com/browsertg-obs/obs_03_1003.html)  (华为云用户才需要，因为kali镜像超过5G，借助这个软件才能上传)

   

## 制作镜像

制作工作具体看[在云主机上安装kali-腾讯云实战篇](https://blog.csdn.net/weixin_41977939/article/details/110557883)，这里就不再重复造轮了

PS: 不过相比文中的腾讯云，**华为云支持更多类型(如下图)**，其实是可以直接上传修改完毕的kali.qcow文件的

![](https://i.loli.net/2021/05/08/nb8J4YEPSMAlT2f.png)

————————————————————————————————————————————
因为盘大小忘记调了，就重新配了一次，华为云是支持qcow的，也就省去了下面的步骤了



这里说一下踩的坑，猜测是系统配置|权限问题(VBox安装在了c盘--)，虽然使用了管理员权限
但还是执行不了，无法生成.ram文件

![](https://i.loli.net/2021/05/08/Z2gFywarmOCoSMP.png)

解决办法就是将C盘整个VirtualBox文件夹复制到D盘去，再到D盘的VirtualBox中执行上述操作即可



## 上传镜像服务

镜像服务->数据盘镜像->镜像文件->创建桶
![](https://i.loli.net/2021/05/08/8yTpRHwUnugjchB.png)

选用标准存储，私有读写（桶策略其实不影响，看个人的分享意愿）
![](https://i.loli.net/2021/05/08/hf7iKTSAOgMmvN6.png)

然后打开obs browser+上传之前制作好的镜像文件即可（还挺久的，大概得30-60分钟）
![](https://i.loli.net/2021/05/08/W7ao8jdEmHDx3vn.png)

上传完毕后就回到镜像服务页面，创建镜像即可

![](https://i.loli.net/2021/05/08/dcpmw8iTKYStr4x.png)



## 安装系统


控制台->镜像/磁盘->切换操作系统![](https://i.loli.net/2021/05/08/Nt3y6dIWBLlZrMK.png)

选择私有镜像然后选择之前创建的镜像，等他重启完毕即可
这里如果没有配置好ssh的话就需要利用控制台的VNC方式登陆进去配置SSH

![](https://i.loli.net/2021/05/08/CQhpuYVNnUGxRy7.png)





## 相关配置

如果修改了root的密码，就不需要在云服务器设置了，其实一个原理

```shell
# 普通用户下： 
sudo passwd root
```



```shell
# 安装ssh
apt-get install openssh-server

# 开启ssh服务
systemctl enable ssh
或者用 /etc/init.d/ssh start

# 开机自启ssh
update-rc.d ssh enable

# 修改配置文件允许root ssh登录（图形化界面修改会方便一些）
vim /etc/ssh/sshd_config

# 修改如下：
#PermitRootLogin prohibit-password
PermitRootLogin yes

#PasswordAuthentication yes
PasswordAuthentication yes

```

可能要重启或者是如下使用命令行才能ssh连上，具体没有深究

![image.png](https://i.loli.net/2021/05/13/PeuvSyNZm9kUIBC.png)



还有个问题就是因为之前使用ssh连接过云服务器了，更改系统后会造成密钥的不匹配
再次ssh连接的话会报错，需要到目录 `C:\Users\ls\.ssh`下修改`known_hosts`文件
将自己云服务器IP以及后面那堆加密信息删掉就好了

![](https://i.loli.net/2021/05/08/OW1YnkhIVeTuD5F.png)

这时候再使用ssh连接就可以了

