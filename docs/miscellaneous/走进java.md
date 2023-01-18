---
id: 走进java
title: 走进java
sidebar_position: 1
---

## 前言



记一下java一些基本知识，
语法和之前学过的语言类似，就不作记录了

## Java的平台无关性

- java是一门跨平台语言，具有平台无关性；主要原因是JVM——Java 虚拟机(Java Virtual Machine)![](https://s2.loli.net/2022/03/18/7jaZILCOPWxuNo3.png)

- JVM，也就是 Java 虚拟机，就是一个平台，包含于 JRE 的下面。当你需要执行某个 Java 程序时，由 JVM 帮你进行编译和执行。我们编写的 Java 源码，编译后会生成一种 .class 文件，称为字节码文件。Java 虚拟机就是负责将字节码文件翻译成特定平台下的机器码然后运行。

- 但要注意的是，跨平台的是Java程序，而不是JVM，JVM是用c/c++开发的，是编译后的机器码，无法跨平台，不同的平台下需要安装不同版本的JVM



## Java中的JVM、JRE和JDk三者的区别和联系

- **JRE**：(Java Runtime Environment，Java运行环境)，是运行 JAVA 程序所必须的环境的集合，**包含 JVM 标准实现及 Java 核心类库**（不同的操作系统有自己的JRE）

- **JDK**：(Java Development Kit， Java 开发开源工具包)，是针对 Java 开发人员的产品，是整个 Java 的核心，**包括了 Java 运行环境 JRE、Java 工具和 Java 基础类库**

- JVM：(Java Virtual Machine，Java 虚拟机)，是整个 Java 实现跨平台的最核心的部分，能够运行以 Java 语言写作的软件程序。

  

  ![](https://s2.loli.net/2022/03/18/s7bCFwuQt5NrMnR.png)

  

  ![](https://s2.loli.net/2022/03/18/5yYpV4RuDQMk6fO.png)

简单来说：

- JDK = JRE + 多种Java开发工具
- JRE = JVM + 各种类库
- 这三者层层嵌套，JDK>JRE>JVM



## Java的各大版本

- Java ME：微缩版的Java，基本无人使用了
- Java SE：标准版的Java，是整个java的核心
- Java EE：企业级的Java，专业用于企业级开发，尤其是Javaweb应用；基于JavaSE建立的体系，



## Java运行机制

- 编译型语言即像c语言一样要编译成系统认识的二进制序列即机器语言
  解释型语言不需要编译，像python，会将源代码交给解释器来告诉系统应该如何运行

- 而java是特殊的解释型语言，其也需要编译，但不是直接编译为机器语言，而是编译为字节码文件，再交由JVM以解释方式执行（感觉是为了实现跨平台）

  

- 源程序.java文件经过Java编译器编译为字节码.class文件，
  再由jvm将字节码.class文件解释给操作系统从而运行

  ![](https://s2.loli.net/2022/03/18/1GqymeiclMKBpt3.png)







