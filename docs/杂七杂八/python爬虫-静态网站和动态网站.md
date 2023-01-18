---
title: python爬虫-静态网站和动态网站
id: python爬虫-静态网站和动态网站
date: 2022-11-15
sidebar_position: 4
---

<!-- more -->

源自大四上学期的课程检测，简单来说就是利用request获取网页，再利用xpath进行识别，最后利用pymysql存入

静态网站

```python
# # coding:gbk
import requests
from lxml import etree
import pymysql

db = pymysql.connect('localhost', 'root', '****', 'scrapy')
cursor = db.cursor()
sql = 'insert into novel values(%s,%s,%s,%s)'

"""
create table novel(
title varchar(50),
author varchar(50),
type varchar(50),
text varchar(500)
);
"""

for i in range(1, 5):
    # 遍历5页
    url = 'https://www.qidian.com/finish/page{}/'.format(i)
    r = requests.get(url=url, headers={'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Maxthon 2.0'}, timeout=3)
    r.encoding = 'gn2312'

    root = etree.HTML(r.text)
    xpath = '//div[@class="book-mid-info"]'
    list = root.xpath(xpath)

    for n in list:
        title = n.xpath('./h2/a/text()')[0]
        author = n.xpath('./p[@class="author"]/a/text()')[0]
        type = n.xpath('./p[@class="author"]/a/text()')[1]
        text = n.xpath('./p[@class="intro"]/text()')[0]
        a = [title, author, type, text]
        cursor.execute(sql, a)

cursor.close()
db.close()

```



爬取百度股票

爬取内容：
1.股票名称
2.股票代码
3.股票价格
4.股票涨幅（涨了多少钱以及百分比）
5.爬取时间
6.五档盘口和逐笔成交的3列内容

爬取的股票（每只股票都爬取相同的内容）：
1.完美世界
2.完美世界右侧相关股票中的6支股票

动态网站

```python
# coding:gbk
from selenium import webdriver
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import time
import pymysql
import sys
sys.path.append(r"C:\Users\11634\AppData\Roaming\Python\Python39\Scriptschromedriver.exe")


# 定位输入框进行输入
def search_stock(self, stock):
    self.find_element(By.ID, 'search').send_keys(stock)
    element = WebDriverWait(self, 3).until(
        EC.presence_of_element_located((By.TAG_NAME, "em"))
    )
    ac = self.find_element(By.TAG_NAME, 'em')
    ActionChains(self).move_to_element(ac).click(ac).perform()

# 右端股票名
def get_right_stocks(self):
    element = WebDriverWait(self, 5).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, '#main > div > div > div > div.page-content > div.right > div > div > div:nth-child(2) > div.relevant-stock > div > div:nth-child(2)'))
    )

    a = self.find_element(By.CSS_SELECTOR, '#main > div > div > div > div.page-content > div.right > div > div > div:nth-child(2) > div.relevant-stock > div > div:nth-child(2)')

    # 滑动滑行条
    self.execute_script('window.scrollTo(0,600)')

    for i in range(2, 8):
        # 提取右侧股票名
        name = a.find_element(By.XPATH, '//*[@id="main"]/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div/div[{}]/div/div[1]/div[1]'.format(i))
        stock_name.append(name.text)
    return stock_name


def get_stock_info(self, stock):
    info = {}
    # 滑动滑行条
    self.execute_script('window.scrollTo(0,180)')

    # stock_name
    element = WebDriverWait(self, 6).until(
        EC.presence_of_element_located((By.XPATH, r"/html/body/div/div/div/div[1]/div[2]/div/div/div/div[2]/div[1]/div/div/div/div/div[3]/div[1]/span[1]"))
    )

    # 1.股票名称
    info['name'] = self.find_element(By.XPATH, r"/html/body/div/div/div/div[1]/div[2]/div/div/div/div[2]/div[1]/div/div/div/div/div[3]/div[1]/span[1]").text.strip()
    # 2.股票代码
    info['string'] = self.find_element(By.XPATH, r"/html/body/div/div/div/div[1]/div[2]/div/div/div/div[2]/div[1]/div/div/div/div/div[3]/div[1]/span[2]").text.strip()
    # 3.股票价格
    info['price'] = self.find_element(By.XPATH, r"/html/body/div/div/div/div[1]/div[2]/div/div/div/div[2]/div[1]/div/div/div/div/div[3]/div[2]/div/div[1]/div[1]/span[1]").text.strip()
    # 4.股票涨幅（涨了多少钱以及百分比）
    info['change'] = self.find_element(By.XPATH, r"/html/body/div/div/div/div[1]/div[2]/div/div/div/div[2]/div[1]/div/div/div/div/div[3]/div[2]/div/div[1]/div[1]/span[3]").text.strip()+" "+self.find_element(By.XPATH, r"/html/body/div/div/div/div[1]/div[2]/div/div/div/div[2]/div[1]/div/div/div/div/div[3]/div[2]/div/div[1]/div[1]/span[4]").text.strip()
    # 五档盘口
    info['sell'] = self.find_element(By.XPATH, r"/html/body/div/div/div/div[1]/div[2]/div/div/div/div[2]/div[1]/div/div/div/div/div[3]/div[3]/div/div/div[2]/div[1]/div/div[2]/div[2]/ul[1]").text.strip()
    info['buy'] = self.find_element(By.XPATH, r"/html/body/div/div/div/div[1]/div[2]/div/div/div/div[2]/div[1]/div/div/div/div/div[3]/div[3]/div/div/div[2]/div[1]/div/div[2]/div[2]/ul[2]").text.strip()
    # 逐笔成交
    info['other'] = self.find_element(By.XPATH, r"/html/body/div/div/div/div[1]/div[2]/div/div/div/div[2]/div[1]/div/div/div/div/div[3]/div[3]/div/div/div[2]/div[1]/div/div[2]/div[2]/ul[3]").text.strip()

    cursor.execute(sql, [info['name'], info['string'], info['price'], info['change'], info['sell'], info['buy'],info['other']])
    print([info['name'], info['string'], info['price'], info['change'], info['sell'], info['buy'], info['other']])

if __name__ == '__main__':
    # 数据库
    db = pymysql.connect('localhost', 'root', 'root', 'scrapy')
    cursor = db.cursor()
    sql = 'insert into stock values(%s,%s,%s,%s,%s,%s,%s)'

    # 爬虫
    s = time.time()
    broswer = webdriver.Chrome()
    broswer.get('https://gushitong.baidu.com/')
    stock_name = ['完美世界']
    search_stock(broswer, stock_name[0])
    get_right_stocks(broswer)
    get_stock_info(broswer, stock_name[0])


    for i in stock_name[1:]:
        search_stock(broswer, i)
        get_stock_info(broswer, i)

    broswer.close()
    e = time.time()
    print("爬取时间为"+str(e-s))

    # cursor.execute(sql, [info['name'], info['string'], info['price'], info['change'], info['sell'], info['buy'], info['other']])
    cursor.close()
    db.close()

"""
create table stock(
name varchar(255),
string varchar(255),
price varchar(255),
changes varchar(255),
sell varchar(255),
buy varchar(255),
other varchar(255)
);
"""
```

