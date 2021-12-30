<template>
<div>
    <el-table
        :data="check_table"
        :header-cell-style="headClass"
        :cell-style="rowClass" 
        style="width: 100%;text-align:-webkit-center;margin:20px 0px;">
        <el-table-column
            prop="key"
            label="检测项"
            width="">
        </el-table-column>
        <el-table-column
            label="值"
            width="">
            <template slot-scope="scope">
                <div v-show="scope.row.is_icon == true" v-bind:class="scope.row.classname"  />
                <div v-show="scope.row.is_icon == false" v-html="scope.row.value" />
            </template>
        </el-table-column>
    </el-table>
</div>

</template>
<script>
import { chrome_api } from "@/js/chrome_crx_api.js";
export default{
    props:["parent_config"],
    data(){
        return {
            config: null, // 全局配置
            kernel: "", //浏览器内核版本
            userAgent: "", // 访问用户UA
            check_table: [], // 表格数据
            isAllowFileAccessClassName: "", // 拥有访问本地文件权限
            isEnableClassName: "",
            isSubClassName: "",
        }
    },
    created(){
        this.init();
    },
    methods:{
        init(){
            this.config = this.parent_config;
            this.userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
            this.checkkernel();
            this.check_table = [
                {
                    key: "Chrome版本",
                    value: this.kernel,
                    is_icon: false,
                },
                {
                    key: "User-Agent",
                    value: this.userAgent,
                    is_icon: false,
                },
                {
                    key: "配置文件数量",
                    value: this.getConfigLength(),
                    is_icon: false,
                },
                {
                    key: "插件权限(允许访问文件 URL)",
                    is_icon: true,
                    classname: this.hasVisitLocalFilePermis(),
                },
                {
                    key: "全局配置是否开启",
                    is_icon: true,
                    classname: this.checkEnable()
                },
                {
                    key: "是否存在订阅",
                    is_icon: true,
                    classname: this.hasSub()
                },  
            ];
        },
        headClass(){
            // 表头样式
            return "text-align:center";
        },
        rowClass(){
            // 表格样式
            return "text-align:center";
        },
        checkkernel(){
            // 检查内核
            if(this.userAgent.indexOf("Chrome") != -1){
                let reChorme = new RegExp("Chrome/(\\d+\\.\\d+(?:\\.\\d+\\.\\d+))?");
                reChorme.test(this.userAgent);
                this.kernel = RegExp['$1'];
            }else{
                this.$message({
                    message: '请使用chrome内核浏览器访问',
                    type: 'warning',
                    offset: 580,
                    center: true,
                });
                this.kernel = "请使用chrome内核浏览器访问";
            }
        },
        getConfigToString(){
            // 获取字符串形式的配置文件，不是Object
            return JSON.stringify(this.config);
        },
        hasConfig(){
            // 是否存在配置
            return this.config["webRequest"] != null && this.config["webRequest"] != []
        },
        hasSub(){
            // 是否存在订阅
            let isSub_ = this.config["sub_url"] != null && this.config["sub_url"].trim() != "";
            return this.retClassName(isSub_,undefined);
        },
        hasVisitLocalFilePermis(){
            // 是否存在访问本地文件url权限
            // 异步数据 通过修改classname修改格式
            let callback_permis = (answer_) => {
                if(answer_){
                    document.getElementsByClassName("fileAccessScheme")[0].className = "fileAccessScheme circle_yes";
                }else{
                    document.getElementsByClassName("fileAccessScheme")[0].className = "fileAccessScheme circle_no";
                }
            };
            let chromeApi = new chrome_api();
            chromeApi.getFilePermis(callback_permis);
            return "fileAccessScheme circle_no";
        },
        retClassName(val,extra){
            let ret_ = "";
            if(val){
                if(extra == undefined){
                    ret_ = "circle_yes";
                }else{
                    ret_ = "circle_yes" + extra;
                }
            }else{
                if(extra == undefined){
                    ret_ = "circle_no";
                }else{
                    ret_ = "circle_no" + extra;
                }
            }
            return ret_;
        },
        checkEnable(){
            // 全局配置是否开启
            let isEnable_ = this.hasConfig() && this.config["enable"] == true;
            return this.retClassName(isEnable_,undefined);
        },
        getConfigLength(){
            return (this.config["webRequest"] == null || this.config["webRequest"] == []) ? 0: this.config["webRequest"].length;
        },
    }
}


</script>
<style>
.circle_yes
{
    display: inline-block;
    width: 0.8rem;
    height: 0.8rem;
    text-align: center;
    border-radius: 50%;
    background-color: rgb(79 212 79);
}
.circle_no
{
    display: inline-block;
    width: 0.8rem;
    height: 0.8rem;
    text-align: center;
    border-radius: 50%;
    background-color: rgb(248, 76, 76);
}
</style>