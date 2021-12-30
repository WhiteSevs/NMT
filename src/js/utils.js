let browser = window.browser;
if (typeof browser == "undefined" && window.chrome) {
    browser = window.chrome;
}
export const tools = {
    checkLocalStorage(){
        // 检查浏览器是否支持localStorage存储
        return window.localStorage != undefined ? true: false
    },
    setLocalStorage(json_){
        // 设置localStorage,传入数组，字符串格式存储 
        let config = JSON.stringify(json_)
        window.localStorage.setItem("config",config);
    },
    getLocalStorage(){
        // 获取localStorage
        let config = window.localStorage.getItem("config");
        if(config === undefined || config === null){
            this.setLocalStorage(tools.getDefault());
            config = window.localStorage.getItem("config");
        }
        return JSON.parse(config);
    },
    getDefault(){
        // 获取默认配置项
        return {
            "enable":true,
            "webRequest":[],
            "sub_url":"",
        }
    },
    dispatchEventStroage () {
        const signSetItem = localStorage.setItem
        localStorage.setItem = function (key, val) {
          let setEvent = new Event('setItemEvent')
          setEvent.key = key
          setEvent.newValue = val
          window.dispatchEvent(setEvent)
          signSetItem.apply(this, arguments)
        }
      },
    storageEventListener(){
        window.addEventListener( 'storage', (e) => {
            console.log(e);
        })
    },
    getDialogWidth(){
        // 根据当前屏幕获取最适合dialog的宽度百分比
        let screenWidth = document.body.clientWidth;
        let dialog_width = "";
        if(screenWidth<500){
            dialog_width = "85%";
        }else if(screenWidth < 1200){
            dialog_width = "75%";
        }else{
            dialog_width = "40%";
        }
        return dialog_width;
    },
    getTimeStamp(date,fmt){
        // 获取当前时间
        const o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "h+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
          };
          if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
          }
          for (const k in o){
            if (new RegExp("(" + k + ")").test(fmt)) {
              fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
          }
          return fmt;
    },
    getNetJson(url,success_callback,error_callback){
        // 获取网络json文件
        let xhr = new XMLHttpRequest();
        xhr.open("GET",url,true);
        xhr.send(null);
        xhr.onreadystatechange = function(){
            if(xhr.readyState==4&&xhr.status==200){
                //http https
                try {
                    let obj = JSON.parse(xhr.responseText);
                    if(success_callback !== undefined){
                        success_callback(obj);
                    }
                } catch (error) {
                    if(error_callback != undefined){
                        error_callback("配置文件解析错误");
                    }
                }
            }else if( xhr.readyState==4 && xhr.status==0 && url.substr(0,7) === "file://" ){
                //file
                try {
                    let obj = JSON.parse(xhr.responseText);
                    if(success_callback !== undefined){
                        success_callback(obj);
                    }
                } catch (error) {
                    if(error_callback != undefined){
                        error_callback("本地配置文件解析错误");
                    }
                }
            }else if(xhr.readyState==4 && error_callback != undefined){
                error_callback("请求状态: "+xhr.status);
            }
        };
        xhr.onerror = function(){
            if(error_callback != undefined){
                error_callback("网络异常");
            }
            
        }
    },
    isEmptyValue(value) {
        // 判断参数(String,Array)是否为undefined或者值为空
        var type;
        if(value == null) { // 等同于 value === undefined || value === null
            return true;
        }
        type = Object.prototype.toString.call(value).slice(8, -1);
        switch(type) {
        case 'String':
            return !value.trim();
        case 'Array':
            return !value.length;
        case 'Number':
            return !value; // !0 == true, !1,2,3....9 == false
        default:
            return false; // 其他对象均视作非空
        }
    },
    uniqueJsonArrayByFieldName(jsonArray, fieldName) {
        // 对数组，json去重，
        // 参数：json数组，需要去重的字段
        let hash = {}; 
        let uniqueArr = [];
        if(!(Object.prototype.toString.call(jsonArray).toLowerCase() == "[object array]")) return []; // 不是数组
        uniqueArr = jsonArray.reduce((preVal, curVal) => {
            if(!(Object.prototype.toString.call(curVal).toLowerCase() == "[object object]")) return []; // 不是json对象
            if(!Object.prototype.hasOwnProperty.call(curVal, fieldName)) return []; // 没有fieldName属性
            hash[curVal[fieldName]] ? '' : hash[curVal[fieldName]] = true && preVal.push(curVal); 
            return preVal 
        }, []);
        hash = null;
        return uniqueArr;
    }
}

