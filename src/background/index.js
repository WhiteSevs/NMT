/* Add listener */
/* Fix chrome */
import {
    tools
} from "@/js/utils.js";
if (typeof browser == "undefined" && window.chrome) {
    var browser = window.chrome;
}

// BolockingResponse = {
//     //为true的话request被cancel，在onBeforeRequest里面用哦
//     cancel: boolean, //optional
//     //只在onBeforeRequest事件中使用，用来掉包的关键属性！！！
//     redirectUrl: string, //option
//     //只用在onHeadersReceived事件里，在浏览器返给server时把header给掉包
//     responseHeaders: HttpHeaders //optional
//     //只在onBeforeSendHeaders事件中使用。是另一个用来掉包的关键属性！！！
//     requestHeaders: HttpHeaders //optional
//     //只在onAuthRequred事件中使用，当然也是用来掉包的
//     authCredentials: object //optional
// };


// onBeforeRequest，请求发送之前触发（请求的第1个事件，请求尚未创建，此时可以取消或者重定向请求）。

// onBeforeSendHeaders，请求头发送之前触发（请求的第2个事件，此时可定制请求头，部分缓存等有关的请求头（Authorization、Cache-Control、Connection、Content-
// Length、Host、If-Modified-Since、If-None-Match、If-Range、Partial-Data、Pragma、Proxy-
// Authorization、Proxy-Connection和Transfer-Encoding）不出现在请求信息中，可以通过添加同名的key覆盖修改其值，但是不能删除）。

// onSendHeaders，请求头发送之前触发（请求的第3个事件，此时只能查看请求信息，可以确认onBeforeSendHeaders事件中都修改了哪些请求头）。

// onHeadersReceived，响应头收到之后触发（请求的第4个事件，此时可定制响应头，且只能修改或删除非缓存相关字段或添加字段，由于响应头允许多个同名字段同时存在，因此无法覆盖修改缓存相关的字段）。

// onResponseStarted，响应内容开始传输之后触发（请求的第5个事件，此时只能查看响应信息，可以确认onHeadersReceived事件中都修改了哪些响应头）。

// onCompleted，响应接受完成后触发（请求的第6个事件，此时只能查看响应信息）。

// onBeforeRedirect，onHeadersReceived事件之后，请求重定向之前触发（此时只能查看响应头信息）。

// onAuthRequired，onHeadersReceived事件之后，收到401或者407状态码时触发（此时可以取消请求、同步提供凭证或异步提供凭证）。

const config = {
    data: null,
    get() {
        return tools.getLocalStorage();
    },
    set(val) {
        tools.setLocalStorage(val);
        this.changeEvent();
    },
    changeEvent() {
        this.data = this.get();
    }
};

const retParams = {
    // 各个的返回参数
    requestRedirect(url_){
        return {
            redirectUrl: url_
        }
    },
    requestIntercept(){
        return {
            cancel: true
        }
    },
    requestHeaders(headers_){
        return {
            requestHeaders:headers_
        } 
    },
    responseHeaders(headers_){
        return {
            responseHeaders: headers_
        }
    }
}

// 监听哪些内容
const filter = {
    urls: ["<all_urls>"]
}

// 额外的信息规范，可选的
const extraInfoSpec = {
    before_request:["blocking"],
    before_send_headers:["blocking", "requestHeaders"],
    headers_received:["blocking","responseHeaders"],
};

const typeMap = {
    "txt"   : "text/plain",
    "html"  : "text/html",
    "css"   : "text/css",
    "js"    : "text/javascript",
    "json"  : "text/json",
    "xml"   : "text/xml",
    "jpg"   : "image/jpeg",
    "gif"   : "image/gif",
    "png"   : "image/png",
    "webp"  : "image/webp"
}

config.data = config.get();

window.addEventListener("storage", function (e) {
    config.data = config.get();
})

var handle_beforeRequest = {
    main(details) {
        let config_enable = config.data["enable"];
        if ( config_enable && config.data["webRequest"].length != 0) {
            // 配置开启并且有配置
            let webRequest_ = config.data["webRequest"];
            let request_url = details.url; // 请求的url
            let on_index = handle_beforeRequest.onIndex(request_url);
            if (on_index != null) {
                let match_methods = handle_beforeRequest.matchMethods(details.method, webRequest_[on_index]["intercept_redirect"]["methods"]);
                if (match_methods) {
                    if (webRequest_[on_index]["intercept_redirect"]["model"] === "intercept") {
                        // 拦截
                        return handle_beforeRequest.Intercept();
                    } else {
                        // 重定向
                        let y_url = webRequest_[on_index]["intercept_redirect"]["y_url"]; // 需匹配的url参数
                        let t_url = webRequest_[on_index]["intercept_redirect"]["t_url"]; // 重定向到的url
                        let t_rexp = new RegExp(y_url,"gi");
                        let request_url_replaced = request_url.replace(t_rexp,t_url);
                        return handle_beforeRequest.RedirectUrl(request_url_replaced);
                    }
                }
            }
        }
    },
    onIndex(detail_url) {
        // 获取开启并匹配到的配置下标
        let index = null;
        let webRequest_ = config.data["webRequest"]; 
        for (let i = 0; i < webRequest_.length; i++) {
            let item_ = webRequest_[i];
            let item_enable = item_["enable"];
            let webRequest_enable = item_["intercept_redirect"]["enable"];// 当前配置开关
            if(item_enable && webRequest_enable){
                let rexp_str = new RegExp(item_["intercept_redirect"]["y_url"], "i");
                let rexp_match = rexp_str.test(detail_url);
                let intercept_redirect_enable = item_["intercept_redirect"]["enable"];
                if ( intercept_redirect_enable == true && rexp_match == true) {
                    index = i;
                    break;
                }
            }
            
        }
        
        
        return index;
    },
    matchMethods(detail_method, config_methods) {
        // 请求方法是否匹配
        // 参数：url请求的方法，本地配置的所匹配的方法(array);
        if( !tools.isEmptyValue(detail_method) && !tools.isEmptyValue(config_methods) ){
            let detail_method_ = detail_method.toLowerCase(); // 转小写字母
            let re_match = config_methods.indexOf(detail_method_) !== -1; // 匹配结果
            let all_match = config_methods.indexOf("all") !== -1; // 如果配置中存在all请求方法，哪么就是get,put,post,delete,option方法都匹配到
            
            return all_match || re_match;
        }
        return false
        
        
    },
    RedirectUrl(url) {
        // 重定向url
        url = isLocalFileUrl(url) ?  getLocalFileUrl(url) :url;
        return retParams.requestRedirect(url);
    },
    Intercept() {
        // 拦截url
        return retParams.requestIntercept();
    }
}


var handle_beforeSendHeaders = {
    main(details) {
        let resp_ = handle_Headers_Change;
        let details_url = details.url;
        let details_headers = details.requestHeaders;
        let details_method = details.method;
        let configKey = "request";
        return resp_.start(details_url,details_headers,details_method,configKey);
    }
    
}

var handle_headersReceived = {
    main(details){
        let resp_ = handle_Headers_Change;
        let details_url = details.url;
        let details_headers = details.responseHeaders;
        let details_method = details.method;
        let configKey = "response";
        return resp_.start(details_url,details_headers,details_method,configKey);
    }
}


function isLocalFileUrl(url){
    // 判断访问的请求是否是本地url
    return url.slice(0,4) == "file";
}
function getLocalFileUrl(url) {
    // 获取本地文件,因浏览器策略重定向到本地文件会导致Not allowed to load local resource： xxx
    var arr = url.split('.');
    var type = arr[arr.length-1];
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, false);
    xhr.send(null);
    var content = xhr.responseText || xhr.responseXML;
    if (!content) {
        return false;
    }
    content = window.encodeURIComponent(
        type === 'js' ?
        content.replace(/[\u0080-\uffff]/g, function($0) {
            var str = $0.charCodeAt(0).toString(16);
            return "\\u" + '00000'.substr(0, 4 - str.length) + str;
        }) : content
    );
    return ("data:" + (typeMap[type] || typeMap.txt) + ";charset=utf-8," + content);
}




var handle_Headers_Change = {
    // 修改request headers和response headers
    start(details_url,details_headers,details_method,configKey){
        // 参数 url，headers，本地配置的method，本地配置的函数key(requestHeaders/responseHeaders)，来源(request/response)
        if (config.data["enable"] && config.data["webRequest"].length != 0) {
            // 配置开启并且有配置
            let webRequest_ = config.data["webRequest"];
            let matchConfig = handle_Headers_Change.getMatchConfig(details_url,configKey);
            if (matchConfig != null) {
                let match_methods = handle_Headers_Change.isMatchMethod(details_method,matchConfig[configKey]["methods"]);
                if(match_methods){
                    details_headers = handle_Headers_Change.setHeaders(matchConfig[configKey]["t_headers"],details_headers);
                }
            }
        }
        return configKey === "request"? retParams.requestHeaders(details_headers): retParams.responseHeaders(details_headers);
    },
    getMatchConfig(url,configKey){
        // 获取能匹配当前url的配置项
        let MatchConfig = null;
        let webRequest_ = config.data["webRequest"];
        for (let i = 0; i < webRequest_.length; i++) {
            let item_ = webRequest_[i];
            let item_enable = item_["enable"];
            let webRequest_enable = item_[configKey]["enable"];
            if(item_enable && webRequest_enable){
                let rexp_str = new RegExp(item_[configKey]["y_url"], "i");
                let rexp_match = rexp_str.test(url);
                let config_headers_enable = item_[configKey]["enable"];
                // 当配置中的开关是开着和url能匹配到，进行替换
                if ( config_headers_enable == true && rexp_match == true) {
                    MatchConfig = config.data["webRequest"][i];
                    break;
                }
            }
        }
        return MatchConfig;

    },
    isMatchMethod(details_method,configMethods){
        // 判断该请求是否与本地配置的相匹配
        // 参数：url请求的方法，本地配置的所匹配的方法(array);
        if( !tools.isEmptyValue(details_method) && !tools.isEmptyValue(configMethods) ){
            let details_method_ = details_method.toLowerCase(); // 转小写字母
            let re_match = configMethods.indexOf(details_method_) !== -1; // 匹配结果
            let all_match = configMethods.indexOf("all") !== -1; // 如果配置中存在all请求方法，哪么就是get,put,post,delete,option方法都匹配到
            return all_match || re_match;
        }
        return false
    },
    setHeaders(config_headers,details_headers){
        // 修改headers头
        // 本地配置中的name和拦截的headers中的name通通转为小写
        for(let i=0;i<config_headers.length;i++){
            let name_ = config_headers[i]["name"].toLowerCase();
            let value_ = config_headers[i]["value"];
            for(let j=0;j<details_headers.length;j++){
                let name__ = details_headers[j]["name"].toLowerCase();
                if(name_ === name__){
                    details_headers[j]["value"] = value_;
                }
            }
        }
        return details_headers
    }
}

browser.webRequest.onBeforeRequest.addListener(
    handle_beforeRequest.main, 
    filter ,
    extraInfoSpec.before_request
);

browser.webRequest.onBeforeSendHeaders.addListener(
    handle_beforeSendHeaders.main, 
    filter,
    extraInfoSpec.before_send_headers
)

browser.webRequest.onHeadersReceived.addListener(
    handle_headersReceived.main,
    filter,
    extraInfoSpec.headers_received
)