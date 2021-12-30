<template>
    <div class="setting_body">
        <ul class="opt_list">
            <li>
                <div class="opt_desc">
                    <label class="title">配置</label>
                    <div class="opt_desc_content">
                        <span>
                            全局配置开启/关闭
                        </span>
                    </div>
                </div>
                <el-switch
                class="opt_state"
                v-model="config.enable"
                active-color="#409eff"
                inactive-color="#ff4949"
                style="margin:0px 8px;"
                @change="enable_change_event($event)">
            </el-switch>
            </li>

            <li>
                <div class="opt_desc">
                    <label class="title">导入</label>
                    <div class="opt_desc_content">
                        <span>
                            读取config文件写入localStorage
                        </span>
                    </div>
                </div>
                <div class="opt_state">
                    <el-upload
                    :limit="1"
                    :show-file-list="false"
                    :auto-upload="false"

                    :on-change="handle_import"
                    :on-error="handle_import_error"
                    action="/"
                    accept="application/json">
                    <el-button size="small" type="file" plain>导入</el-button>
                    </el-upload>
                    
                </div>
            </li>

            <li>
                <div class="opt_desc">
                    <label class="title">导出</label>
                    <div class="opt_desc_content">
                        <span>
                            config转为json文件并导出
                        </span>
                    </div>
                </div>
                <div class="opt_state">
                    <el-button size="small" :disabled="export_disabled" plain @click="handle_export">导出</el-button>
                </div>
            </li>
            
            <li>
                <div class="opt_desc">
                    <label class="title">订阅</label>
                    <div class="opt_desc_content">
                        <span style="    max-width: 200px;width: 100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">
                            {{this.getSubUrl()}}
                        </span>
                    </div>
                </div>
                <div class="opt_state">
                    <el-button size="small" plain @click="sub_dialog.visible = true">订阅</el-button>
                </div>
            </li>
        </ul>
        <el-dialog title="提示" :width="sub_dialog.width" :visible.sync="sub_dialog.visible" :close-on-click-modal="false" center append-to-body>
            <div style="display:flex;">
                <el-input 
                    v-model="sub_dialog.sub_url" 
                    @input="sub_url_cahnge" 
                    placeholder="请输入订阅的url" />
                <el-button 
                    :type="sub_btn.type" 
                    style="margin-left:10px;" 
                    size="small" 
                    icon="el-icon-attract" 
                    :disabled="sub_btn.disabled" 
                    :loading="sub_btn.loading" 
                    @click="handle_to_sub">{{this.sub_btn.model}}</el-button>
            </div>
            
            <span slot="footer" class="dialog-footer">
                <el-button @click="sub_dialog.visible = false">取 消</el-button>
                <el-button type="danger" v-show="has_sub_url" @click="handle_del_sub">删 除</el-button>
                <el-button type="primary" v-show="!has_sub_url" @click="handle_sub">设 置</el-button>
            </span>
        </el-dialog>


        <el-dialog title="提示" :width="unique_json_dialog.width" :visible.sync="unique_json_dialog.visible" :close-on-click-modal="false" center append-to-body>
            <span>{{unique_json_dialog.content}}</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="unique_json_dialog.visible = false">取 消</el-button>
                <el-button type="primary" @click="handle_unique_json_array_config">确 定</el-button>
            </span>
        </el-dialog>
    </div>
    
</template>
<script>
import { tools } from "@/js/utils.js"
import { chrome_api } from "@/js/chrome_crx_api.js";
import FileSaver from 'file-saver';
export default {
    props:["parent_config","is_mobile"],
    data(){
        return {
            config: {}, // 本地配置文件
            export_disabled: false, // 导出按钮禁用状态(没有配置的话导出个屁啊)
            msg_customClass: "", // 自定义message消息类名，兼容手机版
            sub_dialog:{
                visible: false, // 订阅的dialog
                sub_url: "",
                width: "40%",
            },
            sub_btn:{
                model:"订阅",
                type:"primary",
                loading: false,
                disabled: false,
            },
            has_sub_url: false, // 存在订阅链接
            unique_json_dialog:{
                width : "40%",
                visible: false,
                content: "",
                sub_config_length: 0,
                sub_config: []
            }
        }
    },
    created(){
        this.init();
        this.init_export_btn_disabled();
        this.init_isMobileClassName();
        this.has_sub_url = this.hasSubUrl();
    },
    methods:{
        init(){
            this.config = this.parent_config;
            this.sub_dialog.width = this.$parent.getDialogWidth();
            this.sub_dialog.sub_url = this.getSubUrlData();
            this.unique_json_dialog.width = this.$parent.getDialogWidth();
        },
        init_export_btn_disabled(){
            // 初始化按钮禁用状态
            return (this.config["webRequest"] === undefined || this.config["webRequest"] === []) ? true:false;
        },
        init_isMobileClassName(){
            // 初始化手机版样式css
            // console.log(this.is_mobile);
            this.msg_customClass =  this.is_mobile? "ismobile_msg":"";
        },
        enable_change_event(switch_value){
            this.set_config("enable",switch_value);
            let chromeApi = new chrome_api();
            chromeApi.setBrowserActionIcon(switch_value);
        },
        set_config(key,value){
            // 将配置写入本地文件中
            let config_ = this.config;
            config_[key] = value;
            tools.setLocalStorage(config_);
        },
        set_local_config(config_){
            // 将获取的json文件保存至localStorage
            this.set_config("webRequest",config_["webRequest"])
   
            this.$message({
                message: '导入成功',
                customClass: this.msg_customClass,
                type: 'success',
                center: true,
                offset: 580,
                duration: 3000,
            });
        },
        get_config(){
            // 获取本地配置文件json
            return tools.getLocalStorage();
        },
        handle_import(file){
            // 导入
            let reader = new FileReader()
            reader.readAsText(file.raw)
            reader.onload = ((e) => {
                try {
                    let uploadData = JSON.parse(e.target.result);
                    if(uploadData["webRequest"] == null || uploadData["webRequest"] == []){
                        this.$message({
                            message: '配置是空的！',
                            customClass: this.msg_customClass,
                            type: 'error',
                            center: true,
                            offset: 580,
                            duration: 3000,
                        });
                        
                    }else{
                        this.set_local_config(uploadData);
                    }
                } catch (error) {
                    this.$message({
                        message: 'JSON文件格式错误',
                        customClass: this.msg_customClass,
                        type: 'error',
                        center: true,
                        offset: 580,
                        duration: 3000,
                    });
                }

            })

        },
        handle_import_error(e){
            // 导入失败
            // console.log(e);
            this.$message({
                message: '导入失败',
                customClass: this.msg_customClass,
                type: 'error',
                center: true,
                offset: 580,
                duration: 3000,
            });
        },
        handle_export(){
            // 导出
            const data = JSON.stringify(this.get_config());
            const blob = new Blob([data], { type: 'application/json' });
            FileSaver.saveAs(blob, `nmt_config.json`);
        },
        handle_sub(){
            // 订阅
            let url = this.sub_dialog.sub_url;
            if( url.trim() === "" || !url.match(/(file|http|https):\/\/.*/gi) ){
                this.$message({
                    message: '请输入正确的url订阅地址',
                    customClass: this.msg_customClass,
                    type: 'error',
                    center: true,
                    offset: 580,
                    duration: 3000,
                })
            }else{
                this.set_config("sub_url",this.sub_dialog.sub_url);
                this.has_sub_url = true;
                this.sub_dialog.visible = false;
            }
            
        },
        sub_url_cahnge(){
            // 订阅input内容改变
            this.has_sub_url = false;
        },
        handle_del_sub(){
            // 删除订阅
            this.sub_dialog.visible = false; 
            this.sub_dialog.sub_url = "";
            this.set_config("sub_url","");
            this.has_sub_url = false;
        },
        handle_to_sub(){
            // 去请求订阅地址获取config然后保存到localStorage
            this.sub_btn.model = "订阅中";
            // this.sub_btn.type = "success"/"danger";
            this.sub_btn.loading = true;
            this.sub_btn.disabled = true;
            
            tools.getNetJson(this.sub_dialog.sub_url,this.successToSub,this.failToSub);

        },
        handle_unique_json_array_config(){
            // 对获取订阅的配置文件与本地配置进行去重追加
            let sub_config = this.unique_json_dialog.sub_config["webRequest"];
            let old_config = this.config["webRequest"].concat(sub_config);
            let new_config = tools.uniqueJsonArrayByFieldName(old_config,"name");
            this.unique_json_dialog.visible = false;
            this.set_config("webRequest",new_config);
            this.$message({
                message: "更新成功!",
                customClass: this.msg_customClass,
                type: 'success',
                center: true,
                offset: 580,
                duration: 2500,
            })
        },
        successToSub(json_){
            this.sub_btn.model = "订阅成功";
            this.sub_btn.loading = false;
            this.sub_btn.disabled = false;

            let webRequest_ = json_["webRequest"];
            this.unique_json_dialog.visible = true;
            this.unique_json_dialog.sub_config = json_;
            this.unique_json_dialog.sub_config_length = webRequest_.length;
            if(this.unique_json_dialog.sub_config_length == 0){
                this.unique_json_dialog.content = "没有配置的文件还叫配置文件吗？";
            }else{
                this.unique_json_dialog.content = "成功获取配置: "+webRequest_.length+"条，是否更新本地配置？(不会删除本地自定义配置)";
            }
        },
        failToSub(msg){
            this.sub_btn.model = "订阅";
            this.sub_btn.loading = false;
            this.sub_btn.disabled = false;
            this.$message({
                message: msg,
                customClass: this.msg_customClass,
                type: 'error',
                center: true,
                offset: 580,
                duration: 3000,
            })
        },
        hasSubUrl(){
            return this.config["sub_url"] !== undefined && this.config["sub_url"] !== ""? true:false;
        },
        getSubUrl(){
            // 获取订阅地址(文字)
            let ret_url = "当前无订阅";
            if(this.config["sub_url"] !== undefined && this.config["sub_url"] !== ""){
                ret_url = this.config["sub_url"];
            }
            return ret_url;
        },
        getSubUrlData(){
            // 获取订阅地址(数据源)
            let ret_url = "";
            if(this.config["sub_url"] !== undefined && this.config["sub_url"] !== ""){
                ret_url = this.config["sub_url"];
            }
            return ret_url;
        }
    },
    watch:{
        "sub_dialog.visible":{
            handler(val,oldVal){
                this.sub_btn.model = "订阅";
            },
            deep:true,
        },
        "unique_json_dialog.visible":{
            handler(val,oldVal){
                if(!val){
                    this.unique_json_dialog.content = "";
                    this.unique_json_dialog.sub_config = [];
                    this.unique_json_dialog.sub_config_length = 0;
                }
            },
            deep: true,
        }
    }
}
</script>
<style scoped>
.setting_body{
    margin: 30px 10px;
}
.opt_list{
    list-style: none;
}
.opt_list li{
    margin: 20px 0px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    justify-content: center;
    align-self: stretch;
    position: relative;
}
.opt_list .title{
    font-size: 16px;
    color: #000000;
}
.opt_list .opt_desc{
    min-width: 240px;
    max-width: 400px;
}
.opt_list .opt_desc_content{
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    align-self: stretch;
    position: relative;
}
.opt_list .opt_desc_content span{
    color: #888888;
    font-size: 12px;
    line-height: 15px;
    font-weight: 400;
    padding-right: 25px;
    margin-left: 0;
    margin-top: 10px;
}

</style>