import { tools } from "./utils.js";
if (typeof browser == "undefined" && window.chrome) {
    var browser = window.chrome;
}
let __config = {
    data: {},
    url: "",
    method: "",
    callback: null,
}

function __clearConfig(){
    __config = {
        data: {}, // 当前测试的配置
        url: "", // 当前请求的url
        method: "", // 当前请求的方法
        callback: null,
    }
}

function __setConfig(data_,url_,method_,callback_){
    __config = {
        data: data_,
        url: url_,
        method: method_,
        callback: callback_,
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

const color = function(v){
    return v? "#0bbd87":"#ce3939";
}
export function browser_test (data_,url_,method_,callback_){
    __setConfig(data_,url_,method_,callback_);
    this.main = () => {
        browser.webRequest.onBeforeRequest.addListener(
            this.beforeRequestCall, 
            filter,
            extraInfoSpec.before_request
        );
        browser.webRequest.onBeforeSendHeaders.addListener(
            this.beforeSendHeadersCall,
            filter,
            extraInfoSpec.before_send_headers
        );
        browser.webRequest.onHeadersReceived.addListener(
            this.headersReceivedCall,
            filter,
            extraInfoSpec.headers_received
        );
        __config.callback("url",__config.url,color(true));
        let inter_redir_enable = __config.data["intercept_redirect"]["enable"];
        let request_enable = __config.data["request"]["enable"];
        let response_enable = __config.data["response"]["enable"];
        
        __config.callback("是否启用拦截/重定向",inter_redir_enable,color(inter_redir_enable));
        __config.callback("是否启用修改请求Headers",request_enable,color(request_enable));
        __config.callback("是否启用修改响应Headers",response_enable,color(response_enable));

        if( inter_redir_enable || request_enable || response_enable ){
            this.handle_XMLHttpRequest(__config.data["intercept_redirect"]["methods"].includes("all"));
        }
    };
    this.beforeRequestCall = (details) => {
        let re_match = __config.method.indexOf(details.method.toLowerCase()) !== -1; // 匹配结果
        let all_match =  __config.method.indexOf("all") !== -1; // 如果配置中存在all请求方法，哪么就是get,put,post,delete,option方法都匹配到
        if( details.url == __config.url && __config.data["intercept_redirect"]["enable"] && (all_match || re_match) ) {
            let model = __config.data["intercept_redirect"]["model"];
            if(model === "redirect"){
                let y_url = __config.data["intercept_redirect"]["y_url"]; // 需匹配的url参数
                let t_url = __config.data["intercept_redirect"]["t_url"]; // 重定向到的url
                let t_rexp = new RegExp(y_url,"gi");
                let request_url_replaced = __config.url.replace(t_rexp,t_url);
                __config.callback("重定向","已成功重定向到url: <br>"+request_url_replaced,color(1));
                return {
                    redirectUrl: request_url_replaced
                }
            }else{
                __config.callback("拦截","已成功拦截",color(1));
                return {
                    cancel: true
                }
            }
            
        }
        this.removeBeforeRequestListener();
    };
    this.beforeSendHeadersCall = (details) =>{
        let from_ = "request";
        let current_config_method = __config.data["request"]["methods"];
        let details_headers = details.requestHeaders; // request的是requestHeaders
        let replaced_headers = this.headersCall(details,details_headers,current_config_method,from_);
        return {
            requestHeaders: replaced_headers
        }
        
    };
    this.headersReceivedCall = (details) =>{
        let from_ = "response";
        let current_config_method = __config.data["response"]["methods"];
        let details_headers = details.responseHeaders; // response的是responseHeaders
        let replaced_headers = this.headersCall(details,details_headers,current_config_method,from_);
        return {
            responseHeaders: replaced_headers
        }
        
    };
    this.headersCall = (details,details_headers,current_config_method,from_) =>{
        let replaced_headers = details_headers;
        let method_match = (current_config_method.indexOf(details.method.toLowerCase()) !== -1) || (current_config_method.indexOf("all") !== -1); // 匹配结果
        // console.log(details.url === __config.url ,  __config.data[from_]["enable"] , method_match);
        if(details.url === __config.url &&  __config.data[from_]["enable"] && method_match ) {
            let rexp_str = new RegExp(__config.data[from_]["y_url"], "i");
            let rexp_match = rexp_str.test(__config.url);
            if(rexp_match){
                replaced_headers = this.setHeaders(__config.data[from_]["t_headers"],details_headers);
                if(from_ == "request"){
                    __config.callback("请求头headers",this.getCallBackJsonStr(details_headers), color(1));
                    __config.callback("替换后请求头headers",this.getCallBackJsonStr(replaced_headers), color(1));
                }else{
                    __config.callback("响应头headers",this.getCallBackJsonStr(details_headers), color(1));
                    __config.callback("替换后响应头headers",this.getCallBackJsonStr(replaced_headers), color(1));
                }  
            }else{
                __config.callback("错误","所请求的url与配置的url不匹配",color(0));
            }
        }
        if(from_ == "request"){
            this.removeBeforeSendHeadersListener()
        }else{
            this.removeHeadersReceivedListener()
        }
        return replaced_headers;
        
        
    
    };
    this.getCallBackJsonStr = (json_) => {
        // 获取回调函数的json转字符串，也就是输出headers的格式化
        let ret_str = "";
        for(let i=0;i<json_.length;i++){
            let name__ = json_[i]["name"];
            let value__ = json_[i]["value"];
            ret_str += "<b>" + name__ + "</b>: " + value__ + " <br>";
        }
        return ret_str;
    };
    this.setHeaders = (config_headers,details_headers) => {
        // 修改headers头
        // 本地配置中的name和拦截的headers中的name通通转为小写
        // 参数： 配置项中的headers，拦截的url的headers
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
    this.handle_XMLHttpRequest = () => {
        // 发送请求
        let xhr = new XMLHttpRequest();
        xhr.onloadend  = function (r) { // 状态发生变化时，函数被回调
            if (r.target.readyState === 4) { // 成功完成
                // 判断响应结果
                if(r.target.status === 200){
                    __config.callback("响应的status",r.target.status,color(true));
                    __config.callback("响应的url",r.target.responseURL,color(true));
                    __config.callback("响应的headers",r.target.getAllResponseHeaders().replaceAll("\n","<br>"),color(true));
                }else if(r.target.status === 404 || r.target.status === 0){
                    //
                }
            }
        }
        xhr.open(__config.method, __config.url, true);
        xhr.send();
            
    };

    this.removeBeforeRequestListener = () => {
        // 移除监听 onBeforeRequest
        if( browser.webRequest.onBeforeRequest.hasListener(this.beforeRequestCall)){
            browser.webRequest.onBeforeRequest.removeListener(this.beforeRequestCall);
        }
    };
    this.removeBeforeSendHeadersListener = () => {
        // 移除监听 onBeforeSendHeaders
        if( browser.webRequest.onBeforeSendHeaders.hasListener(this.beforeSendHeadersCall)){
            browser.webRequest.onBeforeSendHeaders.removeListener(this.beforeSendHeadersCall);
        }
    };
    this.removeHeadersReceivedListener = () => {
        // 移除监听 onHeadersReceived
        if( browser.webRequest.onHeadersReceived.hasListener(this.headersReceivedCall)){
            browser.webRequest.onHeadersReceived.removeListener(this.headersReceivedCall);
        }
    }
}