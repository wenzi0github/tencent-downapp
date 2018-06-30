const version = '0.0.1';

/**
 * get script
 * @param {*} url 
 * @param {*} callback 
 * @param {*} sid 
 */
const getScript = function(url, callback, sid) {
    var head = document.getElementsByTagName('head')[0],
        js = document.createElement('script');

    js.setAttribute('type', 'text/javascript'); 
    js.setAttribute('charset', 'UTF-8');
    js.setAttribute('src', url);
    sid && js.setAttribute('id', sid);

    head.appendChild(js);

    //执行回调
    var callbackFn = function(){
            if(typeof callback === 'function'){
                callback();
            }
        };

    if (document.all) { //IE
        js.onreadystatechange = function() {
            if (js.readyState == 'loaded' || js.readyState == 'complete') {
                callbackFn();
            }
        }
    } else {
        js.onload = function() {
            callbackFn();
        }
    }
};

/**
 * get css link
 * @param {*} url 
 */
const getCss = (url)=>{
    var head = document.getElementsByTagName('head')[0],
        link = document.createElement('link');

    link.setAttribute('rel', 'stylesheet'); 
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', url);

    head.appendChild(link);
};

const os = (function(){
    var userAgent = navigator.userAgent.toLowerCase();
    
    let _version = 0;

    if( /qqnews/.test(userAgent) ){
        var qqnews_version = navigator.userAgent.toLocaleLowerCase().match(/qqnews\/(\d+\.\d+\.\d+)/)[1].split('.');
        qqnews_version.length==3 && ( _version=parseInt(qqnews_version[0])*100 + parseInt(qqnews_version[1]) + parseInt(qqnews_version[2])/1000 );
    }

    return {
        androidversion: userAgent.substr(userAgent.indexOf('android') + 8, 3),
        ipad: /ipad/.test(userAgent),
        iphone: /iphone/.test(userAgent),
        android: /android/.test(userAgent),
        qqnews: /qqnews/.test(userAgent),
        weixin: /micromessenger/.test(userAgent),
        mqqbrowser: /mqqbrowser\//.test(userAgent), // QQ浏览器
        qq: /qq\//.test(userAgent), // 手机QQ
        tenvideo: /qqlivebrowser/.test(userAgent), // 腾讯视频
        qqmusic: /qqmusic/.test(userAgent), //QQMUSIC
        qqac: /qqac_client/.test(userAgent), // 腾讯动漫
        qqnews_version: _version
    };
})();

if( typeof Object.assign !== 'undefined' ){
    Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) {
            'use strict';
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource != null) {
                for (var nextKey in nextSource) {
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                    }
                }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}

if (!String.prototype.startsWith) {
	String.prototype.startsWith = function(search, pos) {
		return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
	};
}

// 回调
// installStart, installSuccess, downIn3App
function applyMethods(){
    this.methods = {};
}
applyMethods.prototype.on=function(fn, callback){
    if( !this.methods[fn] ){
        this.methods[fn] = [];
    }

    this.methods[fn].push( callback );
    // this.trigger( fn );
}
applyMethods.prototype.get=function(fn){
    return this.methods[fn];
}
applyMethods.prototype.off=function(fn){
    delete this.methods[fn];
}
applyMethods.prototype.trigger=function(type, ...params){
    let method = this.methods[type];

    method.length && method.forEach(item=>{
        item(...params);
    })
}


/*
 * @params
 * openUrl: 'qqnews://article_9527?nm=RSS2018061501588400', // 打开地址可以是scheme地址或者http地址
 * packageName: 'com.tencent.news', // 包名
 * downloadUrl: 'http://dldir1.qq.com/dlomg/inews/channel/TencentNews_3932.apk', // 下载地址
 * wxhash: '1cbd02bbed81c8a5b990044e9f844eda', // 微信下载中配置的md5值
 * appleStoreId: '399363156', // app store中的ID，用iOS下下载APP
 * appName: '腾讯新闻--百万现金红包派发中...', // Android微信的中间下载页展示的标题
 * downLogo: 'http://mat1.gtimg.com/news/news/logo.png' // Android微信的中间下载页展示的logo
 * 
 * 
*/
class AppDownload{
    constructor(params){
        let data={
            openUrl: params.openUrl,
            downloadUrl: params.downloadUrl,
            wxhash: params.wxhash,
            packageName: params.packageName,
            appleStoreId : params.appleStoreId,
            appName : params.appName,
            downLogo : params.downLogo,
            version: version,
            wx_download_id: '',
            isInstalled : false,
        };

        Object.assign(this, data, params);
        this.method = new applyMethods();
    }

    // 监听
    on(fn, callback){
        if( typeof applyMethods[fn]==='function' ){
            applyMethods.on(fn, callback);
        }
        this.method.on( fn, callback );
        return this;
    };

    // 卸载
    off(fn){
        this.method.off( fn );
        return this;
    };

    // 触发
    emit( fn, ...params ){
        return this;
    };

    run(status=false){        
        if( this.openUrl.startsWith('http://') || this.openUrl.startsWith('https://') ){
            this.openApp();
        }else{
            this.openScheme(status);
        }
        
        return this;
    };

    openScheme(){
        if (os.weixin) {
            // 微信
            this.handleWx(status);
        } else if(os.tenvideo){
            // 腾讯视频
            this.TenvideoReady(status);
        }else if(os.qqmusic){
            this.handleMusic();
        }else if(os.qqnews){
            this.handleNews();
        }else if (os.qq) {
            // QQ
            this.handleQQ(status);
        }else{
            this.defaultopenApp();
        }
    };

    checkAppIsInstalled(callback=()=>{}){
        var self = this;

        var isInstalled = false;

        var checkInVideo = function(){
            // 腾讯视频
            var ssVideo = function(){
                var pkgName = {
                    "pkgName": self.packageName,
                    "pkgUrl": self.openUrl
                }
                TenvideoJSBridge.invoke('isInstalled', pkgName, function(res){
                    var jres = JSON.parse(res)
                    if(jres.errCode == '0'){ // 调用成功
                        // installed = true 已安装, = false 未安装
                        if(jres.result.installed){ // 已经安装
                            self.installed = isInstalled = true;
                        }
                        callback(isInstalled);
                    }
                });
            }
            if (typeof TenvideoJSBridge === 'object') {
                ssVideo()
            } else {
                document.addEventListener('onTenvideoJSBridgeReady', function() {
                    ssVideo()
                }, false)
            }
        },
        checkInQQ = function(){
            // qq
            var ssQQ = function(){
                var apkInfo = self.packageName;
                if (os.iphone) {
                    apkInfo = self.openUrl;
                }
                mqq.app.isAppInstalled(apkInfo, function(result) { 
                    if( result ){
                        self.installed = isInstalled = true;
                    }
                    callback(isInstalled);
                });
            }
            if (window.mqq && mqq.app) {
                ssQQ();
            }else{
                getScript("//open.mobile.qq.com/sdk/qqapi.js?_bid=152", function(){
                    ssQQ();
                })
            }
        },
        checkInWxx = function(){
            var ssWx = function(){
                WeixinJSBridge.invoke('getInstallState', {
                    'packageName': self.packageName,   // Android必填
                    'packageUrl': self.openUrl         // IOS必填
                }, function(e) {
                    if( e.err_msg.indexOf('yes')>-1 ){
                        self.installed = isInstalled = true;
                    }
                    callback(isInstalled);
                });
            }
            // 微信
            if (!window.WeixinJSBridge) {
                document.addEventListener('WeixinJSBridgeReady', function() {
                    ssWx();
                });
            } else {
                ssWx();
            }
        },

        checkInNews = function(){
            var ssNews = function(){
                if( os.android ){
                    window["checkCanOpenNativeUrlCallBack"] = function(result) {
                        if(result){
                            self.installed = isInstalled = true;
                        }
                        callback(isInstalled);
                    };
                    TencentNews.checkCanOpenNativeUrl(self.packageName, 'checkCanOpenNativeUrlCallBack');
                }else{
                    TencentNews.checkCanOpenNativeUrl(self.openUrl, function(url, result, userInfo){
                        if( result ){
                            self.isInstalled = true;
                            hasInstalled();
                        }else{
                            failFunc();
                        }
                    }, null);
                }
            };
            if( typeof TencentNews=='object' ){
                ssNews();
            }else{
                document.addEventListener('TencentNewsJSInjectionComplete', function(){
                    ssNews();
                })
                document.addEventListener('TencentNewsReady', function(){
                    ssNews();
                });
            }
        },

        checkInMusic = function(){
            var ssMusic = function(){
                var install_params = {
                        android: [self.packageName],
                        ios: [self.openUrl]
                    };
                M.client.invoke("app", "isInstalled", install_params, function(result){
                    if(result.code==0){
                        if( result.data.installed[0]==1 ){
                            // 已安装
                            self.installed = isInstalled = true;
                        }
                        callback( isInstalled );
                    }else{
                        // console.log( '检测失败' );
                    }
                })
            }

            if(typeof WebViewJavascriptBridge=='object'){
                ssMusic();
            }else{
                document.addEventListener('WebViewJavascriptBridgeReady', function(e){
                    ssMusic();
                });
            }
        };

        var checkIns = function(){
            if (os.weixin) {
                // 微信
                checkInWxx();
            } else if(os.tenvideo){
                // 腾讯视频
                checkInVideo();
            } else if(os.qqmusic){
                checkInMusic();
            }else if(os.qqnews){
                checkInNews();
            }else if (os.mqqbrowser && os.android) {
                // QQ浏览器
                checkInQQ();
            }else if (os.qq) {
                // QQ
                checkInQQ();
            }
        };

        checkIns();
        return this;
    };

    // 新闻客户端内
    handleNews(){
        var self = this;

        if( this.openUrl.startsWith('qqnews://') || self.openUrl.startsWith('http://') || self.openUrl.startsWith('https://') ){
            this.openArticleInNews();
        }else{
            if( typeof TencentNews=='object' ){
                self.checkOpenInNews();
            }else{
                document.addEventListener('TencentNewsJSInjectionComplete', function(){
                    self.checkOpenInNews();
                })
                document.addEventListener('TencentNewsReady', function(){
                    self.checkOpenInNews();
                });
            }
        }
    };

    // 在新闻客户端内打开文章
    openArticleInNews(){
        if( !os.android || this.openUrl.indexOf('act=sign')>-1 || !( window.TencentNews && TencentNews.showNews ) ){
            window.location.href = this.openUrl;
        }else{
            var newsid = this.openUrl.match(/nm=(.*?)(&|$)/);
            TencentNews.showNews(newsid[1], '');
        }
    };

    checkOpenInNews(){
        var self = this;

        if( os.android ){
            window["checkCanOpenNativeUrlCallBack"] = function(result) {
                if(result){
                    // 打开
                    TencentNews.openApp(self.openUrl, self.packageName);
                }else{
                    // 下载
                    // this.install.start();
                    self.method.trigger('installStart');
                    TencentNews.downloadApp(self.downloadUrl, self.packageName, self.appName);
                }
            };
            TencentNews.checkCanOpenNativeUrl(self.packageName, 'checkCanOpenNativeUrlCallBack');
        }else{
            TencentNews.checkCanOpenNativeUrl(self.openUrl, function(url, result, userInfo){
                if( result ){
                    // 打开
                    TencentNews.openNativeUrl(self.openUrl, function(ourl, oresult, ouserInfo){

                    }, null)
                }else{
                    // 下载
                    TencentNews.downloadAppInNative(self.appleStoreId, self.downloadUrl, function(durl, dresult, duserInfo){

                    }, null)
                }
            }, null);
        }
        
    };

    // QQ music
    handleMusic(){
        // check app is installed
        var self = this;
        if(typeof WebViewJavascriptBridge=='object'){
            self.checkInstallInMusic();
        }else{
            document.addEventListener('WebViewJavascriptBridgeReady', function(e){
                self.checkInstallInMusic();
            });
        }
    }

    checkInstallInMusic(){
        var self = this,
            install_params = {
                android: [self.packageName],
                ios: [self.openUrl]
            };

        if(os.android){
            M.client.invoke("app", "isInstalled", install_params, function(result){
                if(result.code==0){
                    if( result.data.installed[0]==1 ){
                        // 已安装
                        self.openAppInMusic();
                    }else{
                        self.downloadInMusic();
                    }
                }else{
                    // console.log( '检测失败' );
                }
            })
        }else{
            self.openAppInMusic();
        }
    }

    openAppInMusic(){
        var self = this;

        if(os.android){
            this.openApp();
        }else{
            var ssOpen = function(){
                var open_params = {
                    url: self.openUrl,
                    target: 'app',
                    type: 'default'
                };
                M.client.invoke("ui", "openUrl", open_params, function(result){
                    if(result.code==1){
                        self.downloadInMusic();
                    }
                })
            };
            if( !document.getElementById('#musicjs') ){
                getScript('//y.gtimg.cn/music/h5/lib/js/music-1.0.min.js?max_age=604800', function(){
                    ssOpen();
                }, 'musicjs')
            }else{
                ssOpen();
            }
        }
    };

    downloadInMusic(){
        // 未安装
        var self = this,
            down_params = {
                appid: self.appleStoreId,
                url: self.downloadUrl,
                packageName: self.packageName,
                actionCode: '0',
                appName: self.appName
            };

        M.client.invoke("app", "downloadApp", down_params, function(result){
            // 下载
            if( result.code==0 ){
                self.method.trigger('installSuccess');

                // 安装
                down_params.actionCode = 1;
                M.client.invoke("app", "downloadApp", down_params, function(result){
                    
                })
            }
        })
    };

    TenvideoReady(status){
        // 监听视频js全局对象是否存在
        var self = this;
        if (typeof TenvideoJSBridge === 'object') {
            self.handleTenvideo(status)
        } else {
            document.addEventListener('onTenvideoJSBridgeReady', function() {
                self.handleTenvideo(status)
            }, false)
        }
    };

    handleTenvideo(stat) {
        var self = this
        var pkgName = {
            "pkgName": self.packageName,
            "pkgUrl": self.openUrl
        }

        // 注册监听下载状态
        TenvideoJSBridge.on("onDownloadTaskStateChanged", function(ret){
            // 该ret为object
            /*
            state = 10 //UI上要显示打开
            state = 11 //UI上要显示安装
            state = 12 //UI上要显示下载
            state = 13 //UI上要显示下载中
            state = 14 //UI上要显示继续
            state = 15 //UI上要显示查看
            state = 16 //UI上要显示等待
            state = 17 //无网络,保持上一次状态
            */
            // TenvideoJSBridge.invoke("toast", {"content": ret});
            if( ret.state==13 ){
                // 正在下载中
                // $('.btn .txt').text(self.unicodeTxt.down);
            }else if( ret.state==11 ){
                // $('.btn .txt').text( self.unicodeTxt.waitInstall );
            }else if( ret.state==10 ){
                // self.installSuccess();
                self.method.trigger('installSuccess');
            }
        });
        // 监听下载进度
        TenvideoJSBridge.on("onDownloadTaskProgressChanged", function(ret){
            self.method.trigger('installSteps', ret.progress);
        });
        // 检测是否安装了app
        TenvideoJSBridge.invoke('isInstalled', pkgName, function(res){
            // 该res为json string
            var jres = JSON.parse(res)
            if(jres.errCode == '0'){ // 调用成功
            // installed = true 已安装, = false 未安装
            if(jres.result.installed){ // 已经安装
                // 打开app
                
                if( !os.android ){
                    var params = {
                        "pkgName": self.packageName,
                        "pkgUrl": self.openUrl,
                        "appName": self.appName
                    }
                    TenvideoJSBridge.invoke('launch3rdApp', params, function(){})
                }else{
                    self.openApp();
                }
            }else{ // 未安装
                var down = function(){
                    // 下载app
                    TenvideoJSBridge.invoke('download3rdApp', {
                        // android
                        "downloadUrl": self.downloadUrl,
                        "packageName": self.packageName,
                        "iconUrl": self.downLogo,
                        "appName": self.appName,
                        // ios
                        "itunesUrl": 'http://itunes.apple.com/cn/app/id'+ self.appleStoreId,
                        "packageUrl": self.openUrl,
                    }, function(){

                    })
                };

                if( stat ){
                    // 无视网络状态，直接下载
                    down();
                }else{
                    // 检测网络
                    TenvideoJSBridge.invoke('getNetworkState', null, function( res ){
                        var jret = JSON.parse( res );

                        if( jret.result && jret.result.state!=1 ){
                            self.method.trigger('downNoWifi');
                        }else{
                            down();
                        }
                    });
                }
            }
            }else{
            // 调用失败
            }
        })
    }

    handleQQ(stat){
        var self = this;
        
        var check = function(){
            var apkInfo = self.packageName;
            if ( !os.android ) {
                apkInfo = self.openUrl;
            }
            mqq.app.isAppInstalled(apkInfo, function(result) {      
                if( result ){
                    // 已安装
                    if(os.android){
                        self.openApp();
                    }else{
                        mqq.app.launchApp(apkInfo);
                    }
                }else{
                    if(os.android){
                        self.method.trigger('installStart');
                    }
                    var down = function(){
                        mqq.app.downloadApp({
                            appid : self.appleStoreId,
                            url : self.downloadUrl,
                            packageName : self.packageName,
                            actionCode : 2,
                            via : "ANDROIDQQ.TXREADING",
                            appName : self.appName
                        }, function(data){
                            if(data.state==4) data.pro = 100;

                            self.method.trigger('installSteps', data.pro);
                            
                            if(data.pro>=100){
                                setTimeout(function(){
                                    self.installInQQ();
                                }, 200)
                            }
                        })
                    }
                    // 若stat为true,则直接进行下载
                    if(!stat && mqq && mqq.device && mqq.device.getNetworkType){
                        mqq.device.getNetworkType(function(status){
                            if(status==1){
                                // wifi
                                down();
                            }else{
                                self.method.trigger('downNoWifi');
                            }
                        });
                    }else{
                        down();
                    }
                }
            });
        }
        if (window.mqq && mqq.app) {
            check();
        }else{
            getScript("//open.mobile.qq.com/sdk/qqapi.js?_bid=152", function(){
                check();
            })
        }
        
    }
    installInQQ(){
        var self = this;
        // self.installSuccess();
        self.method.trigger('installSuccess');
        mqq.app.downloadApp({
            appid : self.appleStoreId,
            url : self.downloadUrl,
            packageName : self.packageName,
            actionCode : 5,
            via : "ANDROIDQQ.TXREADING",
            appName : self.appName
        }, function(data){
            
        })
    }
    handleWx(status) {
        var self = this;
        if (!window.WeixinJSBridge) {
            document.addEventListener('WeixinJSBridgeReady', function() {
                self.checkInWx(status);
            });
        } else {
            self.checkInWx(status);
        }
    }

    checkInWx(status) {
        var self = this;

        function checkInstallState() {
            WeixinJSBridge.invoke('getInstallState', {
                'packageName': self.packageName,   // Android必填
                'packageUrl': self.openUrl         // IOS必填
            }, function(e) {
                if( e.err_msg.indexOf('yes')>-1 ){
                    self.openAppInWx();
                }else{
                    if(status){
                        self.downloadAppInWx();
                    }else{
                        WeixinJSBridge.invoke("getNetworkType", {}, function(res) {
                            if(res.err_msg.indexOf('wifi')>-1){
                                // wifi
                                self.downloadAppInWx();
                            }else{
                                self.method.trigger('downNoWifi');// no wifi
                            }
                        });
                    }
                }
            });
        }

        checkInstallState();
    };

    // 使用微信提供的api下载
    downloadAppInWx(){
        var self = this;

        if(os.android){
            var ss = navigator.userAgent.toLowerCase().match(/micromessenger\/(\d+)\.(\d+)\.(\d+)/),
                n = 0;
            ss && ss.length>=4 && (n = 100 * parseInt(ss[1]) + parseInt(ss[2]) + parseInt(ss[3]) / 1000);
            
            var wx_version = n;

            var wx_d_version = 605.007;
            WeixinJSBridge.on("wxdownload:state_change", function (res) {
                if( res.state=="download_succ" ){
                    self.method.trigger('installSuccess');
                }else if(res.state=='downloading'){
                    self.method.trigger('installSteps');
                }
            });

            WeixinJSBridge.invoke("addDownloadTask",{
                "task_name": self.appName,
                "task_url": self.downloadUrl,
                "thumb_url": self.downLogo,
                "file_md5": self.fileMd5
            },function(res){
                if( wx_version>=wx_d_version ){
                    if( res.err_msg=='addDownloadTask:cancel' ){
                        // $('.btn .txt').text(self.unicodeTxt.withdraw);
                    }else if( res.err_msg=='addDownloadTask:ok' ){
                        // $('.btn .txt').text(self.unicodeTxt.down);
                    }else{

                    }
                }else{
                    self.wx_download_id = res.download_id;
                    self.installDownload();
                }
            });
        }else{
            location.href = 'http://itunes.apple.com/cn/app/id'+ self.appleStoreId;
        }
    };

    // 取消下载任务
    cancelDownloadInWx(){
        var self = this;

        WeixinJSBridge.invoke("cancelDownloadTask",{
            "download_id": self.wx_download_id
        },function(res){
            
        });
    }
    // 安装下载的app
    installDownload(){
        var self = this;

        WeixinJSBridge.invoke("installDownloadTask",{
            "download_id": self.wx_download_id
        },function(res){
            
        });
    }
    openAppInWx(){
        var self = this;
        var param = {
            schemeUrl : self.openUrl
        };
        var ss = navigator.userAgent.toLowerCase().match(/micromessenger\/(\d+)\.(\d+)\.(\d+)/),
            n = 0;
        ss && ss.length>=4 && (n = 100 * parseInt(ss[1]) + parseInt(ss[2]) + parseInt(ss[3]) / 1000);

        if( n>=605.006 ){
            WeixinJSBridge.invoke("launchApplication",param,function(res){
                
            });
        }else{
            self.openApp()
        }
    }

    defaultopenApp() {
        var self = this;
        var startTime = (new Date).valueOf();
        if (os.android) {
            var e = document.createElement("iframe");
            e.style.cssText = "width:1px;height:1px;position:fixed;top:0;left:0;";
            e.src = self.openUrl;
            document.body.appendChild(e);
            startTime = (new Date).valueOf();
        }else {
            this.openApp();
        }

        setTimeout(function() {
            var endTime = (new Date).valueOf();
            if (1550 > endTime - startTime) {
                if( self.method.get( 'downIn3App' ).length ){
                    self.method.trigger('downIn3App');
                }else{
                    if(os.android){
                        self.downloadApp();
                    }else{
                        location.href = 'http://itunes.apple.com/cn/app/id'+ self.appleStoreId;
                    }
                }
            }
        }, 1500);
    }
    openApp() {
        location.href = this.openUrl;
    }
    downloadApp() {
        location.href = this.downloadUrl;
    }
}
// return AppDownload;
// export default AppDownload;
module.exports = AppDownload;