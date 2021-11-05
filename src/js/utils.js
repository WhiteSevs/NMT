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
            let data = {};
            this.setLocalStorage(data);
            config = window.localStorage.getItem("config");
        }
        return JSON.parse(config);
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
    }
}

