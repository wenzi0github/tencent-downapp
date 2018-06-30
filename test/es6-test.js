import AppDownload from '../dist/bundle';

var downapp = new AppDownload({
    openUrl: 'qqnews://article_9527?nm=RSS2018061501588400', // 打开地址可以是scheme地址或者http地址
    packageName: 'com.tencent.news', // 包名
    downloadUrl: 'http://dldir1.qq.com/dlomg/inews/channel/TencentNews_3932.apk', // 下载地址
    wxhash: '1cbd02bbed81c8a5b990044e9f844eda', // 微信下载中配置的md5值
    appleStoreId: '399363156', // app store中的ID，用iOS下下载APP
    appName: '腾讯新闻--百万现金红包派发中...', // Android微信的中间下载页展示的标题
    downLogo: 'http://mat1.gtimg.com/news/news/logo.png' // Android微信的中间下载页展示的logo
});

// 监听
downapp.on('installStart', function( os, timestamp ){
    document.querySelector('.btn').innerText = '下载中...';
}).on('installSteps', function( progress ){
    document.querySelector('.progress').innerHTML = progress;
}).on('installSuccess', function( progress ){
    document.querySelector('.btn').innerText = '下载完成';
}).on('downIn3App', function(){
    setTimeout(()=>{
        alert( 'downIn3App' );
    }, 1500);
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

