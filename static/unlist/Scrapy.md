---
id: 学习Scrapy
title: 学习Scrapy

---



## 前言

毕设可能是弄爬虫，学个框架

学习文档：

[Scrapy 2.7 documentation — Scrapy 2.7.1 documentation](https://docs.scrapy.org/en/latest/index.html)

[Python Scrapy爬虫框架详解 (biancheng.net)](http://c.biancheng.net/python_spider/scrapy.html)

## 安装scrapy

我直接pycharm软件包装上了，也可以参考说明文档

![](C:/Users/11634/AppData/Roaming/Typora/typora-user-images/image-20221206172933187.png)



## 常用指令

| 命令         | 格式                                 | 说明                               |
| ------------ | ------------------------------------ | ---------------------------------- |
| startproject | scrapy startproject <项目名>         | 创建一个新项目。                   |
| genspider    | scrapy genspider <爬虫文件名> <域名> | 新建爬虫文件。                     |
| runspider    | scrapy runspider <爬虫文件>          | 运行一个爬虫文件，不需要创建项目。 |
| crawl        | scrapy crawl <spidername>            | 运行一个爬虫项目，必须要创建项目。 |
| list         | scrapy list                          | 列出项目中所有爬虫文件。           |
| view         | scrapy view <url地址>                | 从浏览器中打开 url 地址。          |
| shell        | csrapy shell <url地址>               | 命令行交互模式。                   |
| settings     | scrapy settings                      | 查看当前项目的配置信息。           |

## 开始

### 创建项目

终端输入：

```
scrapy startproject [项目名]
```

会在当前目录下创建一个以输入的目录名为名的文件夹

```
项目名/
    ├──scrapy.cfg            # 项目基本配置文件
    ├──项目名/             	# 装载项目文件的目录
            ├── __init__.py
            ├── items.py          # 项目项定义文件，定义要抓取的数据结构
            ├── middlewares.py    # 项目中间件文件，用来设置一些处理规则
            ├── pipelines.py      # 项目管道文件，处理抓取的数据
            ├── settings.py       # 项目全局配置文件
            ├── spiders/          # 装载爬虫文件的目录
                       ├── __init__.py	 # 具体的爬虫程序
```

### 生成爬虫

生成项目后，cd 进入项目所在目录

```
scrapy genspider example example.com
```

这里以起点中文网为例：

```
scrapy genspider qidian qidian.com
```

会在目录spiders 生成文件qidian.py，代码如下：


```python
import scrapy

class QidianSpider(scrapy.Spider):
    name = 'qidian'
    allowed_domains = ['qidian.com'] #要抓取数据的网站域名
    start_urls = ['http://qidian.com/'] #第一个抓取的url，初始url,被当做队列来处理

    def parse(self, response):
        pass

```

