# 腾讯系打开和下载APP

在微信，手机QQ，腾讯视频等各种APP中的网页，能检测本地是否有安装app，若已安装则打开app，若未安装，则按指定的地址进行下载。

请注意： 当前功能只能在`*.qq.com`域名的网页中使用，其他域名调用当前模块是没有效果的。

使用方法，以ES2015的方式为例：  

```javascript
import AppDownload from 'AppDownload';

var downapp = new AppDownload({
    openUrl: 'qqnews://article_9527?nm=RSS2018061501588400',
    packageName: 'com.tencent.news',
    downloadUrl: 'http://dldir1.qq.com/dlomg/inews/channel/TencentNews_3932.apk',
    wxhash: '1cbd02bbed81c8a5b990044e9f844eda',
    appleStoreId: '399363156',
    appName: '腾讯新闻--百万现金红包派发中...',
    downLogo: 'http://mat1.gtimg.com/news/news/logo.png'
});

// 监听
downapp.on('installStart', function(){
    // 开始下载
    alert( '开始下载' );
}).on('downIn3App', function(){
    // 在浏览器等环境中，无法打开指定的APP时
    alert( 'downIn3App' );
});

// 获取APP的安装状态
downapp.checkAppIsInstalled(function(status){
    if( status ){
        document.querySelector('.btn').innerText = '打开新闻客户端';
    }
});

document.querySelector('.btn').addEventListener('click', function(){
    downapp.run();
})
```

### 1. 参数 

以下参数均为必填参数

|    名称       | 说明 | 备注 |
| -----------  | --- ||
| openUrl      | 打开地址 | 可以是scheme地址或者http地址，http地址时直接进行跳转 |
| packageName  | APP的包名 ||
| downloadUrl  | Android系统里APP的下载地址 ||
| wxhash       | md5的hash值 | 微信中下载完成时是需要进行hash校验的 |
| appleStoreId | iOS系统里跳转到app store的ID ||
| appName      | Android微信的中间下载页展示的标题 ||
| downLogo     | Android微信的中间下载页展示的logo ||

### 2. 可监听的事件： 

#### 2.1 downNoWifi

在执行run()方法后，检测到当前设备里没有安装APP，马上要下载时；检测到当前设备处于非wifi状态，会触发

```javascript
downapp.on('downNoWifi', function(){
    // 开始下载
    var result = confirm('当前为非wifi状态，是否继续下载？');

    if( result ){
        alert('开始下载');
    }
})
```

#### 2.2 installStart

Android下开始安装时触发

```javascript
// 开始下载时触发
downapp.on('installStart', function(){
    // 开始下载
    alert( '开始下载' );
})
```

#### 2.3 installSteps

在下载过程中执行，目前仅在Android版的手机QQ和腾讯视频里支持进度展示；iOS里会自动跳转到app store里下载，无法监听到进度

```javascript
// 下载过程中
downapp.on('installSteps', function( step ){
    // step为当前的进度，取值0-100
    console.log( step );
})
```

#### 2.4 installSuccess

Android下完成安装时触发

```javascript
// 开始下载时触发
downapp.on('installSuccess', function(){
    // 开始下载
    alert( '下载完成' );
})
```

### 3. 方法

#### 3.1 checkAppIsInstalled  

checkAppIsInstalled的回调函数里，会返回一个status状态，`true`表示已安装， `false`表示未安装。

样例： 
```javascript
// 获取APP的安装状态
downapp.checkAppIsInstalled(function(status){
    if( status ){
        alert( '已安装' );
    }else{
        alert( '未安装' );
    }
});
```

#### 3.2 run

调用`run()`方法后，若本设备已安装APP，则直接打开指定的openUrl；若未安装，则执行下载动作。

run方法也可以传入一个boolean值（默认值为false），表示在执行下载动作时是否无视WiFi。若不传参数或者传入的参数为false，在非WiFi状态下载时就会触发上面的`downNoWifi`这个监听函数；若传入true，则在流量环境或wifi环境都会直接下载，不会触发`downNoWifi`这个监听函数。

```javascript
$('.btn').on('tap', function(){
    downapp.run(); // 打开
})
```

### 4. 可能会出现的问题

在使用这个js文件过程中，有可能会曲线下面的几个问题：

#### 4.1 android的微信中，下载软件老是提示校验失败
答： 在微信中，通过微信api下载后，微信会进行md5的校验，如果提示“校验失败”，可以检查下md5是否正确

#### 4.2 微信中正常，QQ中不能正常的打开或下载
答： QQ中有一些特殊的api属于敏感jsapi，需要将域名加入到他们的白名单中，才可以正常的使用