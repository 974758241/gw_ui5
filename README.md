# 说明一下该插件如何使用
## 需要在目录下配置一个文件 connectSAP.json
```json
{
    "baseURL":"你服务器的地址和端口",
    "useName":"账号",
    "usePwd":"密码",
    "systemIdentification":"SFD",
    "sapClient" : "100"
}
```
## 在connectSAP.json 这个目录文件夹下右击

## 配置更新工程的 connectSAP.json
```json
{
    "baseURL":"http://xxx:8000/",// 服务器地址和端口号
    "useName":"账号",
    "usePwd":"密码",
    "systemIdentification":"S4D",
    "sapClient" : "300",
    "updateFolder":"webapp",//可以不指定,默认为webapp
    "appName":"ZSFI_027"// 可以不指定,默认为webpp上一级的文件夹名字
}
```

![使用说明过](https://raw.githubusercontent.com/974758241/gw_ui5/master/images/%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E.png)
## 注意:
1. 如果在线安装不行,直接使用vsix 进行安装

## 还有改进的地方 国际化,支持更多的SAP 相关操作,以及还有隐藏的bug需要处理
### 如果有更好的建议或者意见可以在github上提出 issue

# 更新日志
# 0.0.4  
### 删除按钮 目前用不到,以后做了task集成就可以使用
# 0.0.7 更新日期 2024-01-31
### 更新如下
1. 修复了一些bug
2. 支持了Mac
3. 增加下载完成提示
4. 增加列表加载成功提示
5. 添加直接更新工程下的项目,减少拉取,然后复制粘贴的操作
### 0.0.8 更新日期 2024-01-31
### 更新如下
1. 图片不显示的问题
# 0.0.9 下一个版本
### 预更新如下
1. 添加和服务文件对比的功能,对于不使用git作为管理的团队的操作，还是很有用的
![更改历史](https://raw.githubusercontent.com/974758241/gw_ui5/master/images/%E6%9C%8D%E5%8A%A1%E5%99%A8%E6%96%87%E4%BB%B6%E7%89%88%E6%9C%AC%E5%88%97%E8%A1%A8.png)
# 0.1.0 对于部分json文件下失败的处理