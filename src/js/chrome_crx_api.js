let browser = window.browser;
if (typeof browser == "undefined" && window.chrome) {
    browser = window.chrome;
}
let chrome = window.chrome;
export function chrome_api(){
    this.setActionIcon = (icon_path_) => {
        browser.browserAction.setIcon({
            path: icon_path_
        });
    };
    this.setDisableIcon = (icon_path_) =>{
        // 设置禁止的时候的图标
        // 参数: 图标地址
        // 示例: {
        //     "16": "assets/logo-off.png",
        //     "48": "assets/logo-off.png",
        //     "128": "assets/logo-off.png"
        // }
        if(icon_path_ == undefined){
            icon_path_ = {
                "19": "assets/logo-off-19.png",
                "38": "assets/logo-off-38.png"
            };
        }
        this.setActionIcon(icon_path_);
    };
    this.setEnableIcon = (icon_path_) => {
        if(icon_path_ == undefined){
            icon_path_ = {
                "19": "assets/logo-19.png",
                "38": "assets/logo-38.png"
            };
        }
        this.setActionIcon(icon_path_);
    };
    this.setBrowserActionIcon = (val_) => {
        if(val_){
            this.setEnableIcon();
        }else{
            this.setDisableIcon();
        }
    };
    this.getFilePermis = (callback_) => {
        browser.extension.isAllowedFileSchemeAccess(callback_);
    };
    this.get_i18n = (key_) => {
        // 获取语言配置文件对应的键
        return chrome.i18n.getMessage(key_);
    };
    
}