/* Add listener */
/* Fix chrome */
import { tools } from "@/js/utils.js";
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

const config = {
    data:null,
    get(){
        return tools.getLocalStorage();
    },
    set(val){
        tools.setLocalStorage(val);
        this.changeEvent();
    },
    changeEvent(){
        this.data = this.get();
    }
};
config.data = config.get();

window.addEventListener("storage", function(e){
    console.log("storage改变");
    config.changeEvent();
})



var handle_beforeRequest = {
    main(details){
        handle_beforeRequest.RedirectUrl(details);
    },
    RedirectUrl(details){
        // 重定向url
        console.log("重定向");
        console.log(details.url);
        return {
            redirectUrl: details.url,
        };
    },
    Intercept(details){
        // 拦截url
        console.log("拦截");
        console.log(details.url);
        return {
            cancel: true
        }
    }
}



browser.webRequest.onBeforeRequest.addListener(
    handle_beforeRequest.main,
    {urls: ["<all_urls>"]},
    ["blocking"]
);

