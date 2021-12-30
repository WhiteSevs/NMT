<template>
    <div class="page_main" style="margin:20px 0px;">
        <div class="page_header">
        </div>
        <div class="page_app" style="overflow-x:hidden;">
            <el-row type="flex" justify="center">
                <el-col :span="14" style="max-width:400px;margin-right:10px;">
                    <el-input
                    v-model="search" 
                    size="small"
                    placeholder="输入关键字搜索">
                    <el-button slot="append" icon="el-icon-search" /></el-input>
                </el-col>

                <el-col :span="4" style="margin-left:10px;">
                    <el-button type="primary" size="small" @click="dialog_visible_event" round>添加</el-button>
                </el-col>
                <el-col :span="4" style="margin-left:10px;">
                    <el-button type="danger" size="small" @click="clear_config_dialog.visible = true" round>清空</el-button>
                </el-col>
            </el-row>
            <el-table
            :data="filterDate()"
            :header-cell-style="headClass"
            :cell-style="rowClass" 
            empty-text="暂无配置"
            style="width: 100%;text-align:-webkit-center;">
            <el-table-column
                label="配置名称"
                prop="name">
            </el-table-column>
            <el-table-column
                label="是否开启"
                prop="enable">
                <template slot-scope="scope">
                    <el-switch
                        v-model="scope.row.enable"
                        active-color="#409eff"
                        inactive-color="#ff4949"
                        @change="switch_enable_change_event($event,scope.$index)">
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column align="right">
                <template slot="header">
                    操作
                </template>
                <template slot-scope="scope">
                    <el-button 
                        size="mini"
                        class="el-icon-caret-right"
                        style="margin:5px 10px;"
                        @click="handleTest(scope.$index, scope.row)"
                    />
                    <el-button
                        size="mini"
                        class="el-icon-edit"
                        style="margin:5px 10px;"
                        @click="handleEdit(scope.$index, scope.row)"
                    />
                    <div v-if="is_mobile_visit === true">
                        <el-button
                            size="mini"
                            type="danger"
                            slot="reference"
                            class="el-icon-delete"
                            style="margin:5px 10px;"
                            @click="handle_showDelDialog(scope.$index, scope.row)"
                        />
                    </div>
                    <div v-else style="display:inline;">
                        <el-popconfirm
                            confirm-button-text='是'
                            cancel-button-text='不删除'
                            icon="el-icon-info"
                            icon-color="red"
                            title="确定删除该配置吗？"
                            @confirm="handleDelete(scope.$index, scope.row)">
                                <el-button
                                size="mini"
                                type="danger"
                                slot="reference"
                                class="el-icon-delete"
                                style="margin:5px 10px;" />
                        </el-popconfirm>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        </div>

        <el-dialog :title="dialog_.title" :width="dialog_.width" :visible.sync="dialog_.visible" :close-on-click-modal="false" center append-to-body>
            <el-scrollbar style="height: 400px;" >
                <el-form :model="form" ref="form" :rules="rules" style="" label-position="top">
                    <el-form-item label="配置名称" label-width="120px" prop="name">
                        <el-input v-model="form.name" autocomplete="off" />
                    </el-form-item>
                    
                    <el-form-item label="是否开启拦截/重定向" label-width="120px">
                        <el-switch
                            v-model="form.intercept_redirect.enable"
                            active-color="#409eff"
                            inactive-color="#ff4949"
                            @change="form.intercept_redirect.enable=$event">
                        </el-switch>
                    </el-form-item>
                    <template v-if="form.intercept_redirect.enable==true">
                        <el-card shadow="hover">
                            <el-form-item label="执行方式" label-width="120px">
                                <el-select v-model="form.intercept_redirect.model" placeholder="请选择执行方式">
                                    <el-option label="拦截" value="intercept" style="height:40px;" />
                                    <el-option label="重定向" value="redirect" style="height:40px;" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="请求方法" label-width="120px" prop="methods">
                                <el-select v-model="form.intercept_redirect.methods" multiple placeholder="请选择请求方法">
                                    <el-option label="所有" value="all" style="height:40px;" />
                                    <el-option label="get" value="get" style="height:40px;" />
                                    <el-option label="post" value="post" style="height:40px;" />
                                    <el-option label="put" value="put" style="height:40px;" />
                                    <el-option label="delete" value="delete" style="height:40px;" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="目标url" label-width="120px" prop="y_url">
                                <el-input v-model="form.intercept_redirect.y_url" autocomplete="off" />
                            </el-form-item>
                            <div v-if="form.intercept_redirect.model === 'redirect'">
                                <el-form-item label="重定向的url" label-width="120px" prop="t_url">
                                    <el-input v-model="form.intercept_redirect.t_url" placeholder="请规范输入带上协议头，如:https://..." autocomplete="off" />
                                </el-form-item>
                            </div>
                        </el-card>
                    </template>
                    <el-form-item label="是否修改请求头Headers" label-width="120px">
                        <el-switch
                            v-model="form.request.enable"
                            active-color="#409eff"
                            inactive-color="#ff4949"
                            @change="form.request.enable=$event">
                        </el-switch>
                    </el-form-item>
                    <template v-if="form.request.enable==true">
                        <el-card shadow="hover">
                            <el-form-item label="请求方法" label-width="120px" prop="methods">
                                <el-select v-model="form.request.methods" multiple placeholder="请选择请求方法">
                                    <el-option label="所有" value="all" style="height:40px;" />
                                    <el-option label="get" value="get" style="height:40px;" />
                                    <el-option label="post" value="post" style="height:40px;" />
                                    <el-option label="put" value="put" style="height:40px;" />
                                    <el-option label="delete" value="delete" style="height:40px;" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="目标url" label-width="120px" prop="y_url">
                                <el-input v-model="form.request.y_url" autocomplete="off" />
                            </el-form-item>
                            <el-form-item label="修改headers" label-width="120px">
                                <el-table
                                :data="form.request.t_headers"
                                :show-header=false>
                                    <el-table-column
                                    width=""
                                    label="键">
                                        <template slot-scope="scope">
                                            <el-input 
                                            v-model="scope.row.name" 
                                            autocomplete="off" 
                                            placeholder="键" />
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                    label="值"
                                    width="">
                                        <template slot-scope="scope">
                                            <el-input v-model="scope.row.value" autocomplete="off" placeholder="值" />
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                    width=""
                                    label="操作">
                                        <template slot-scope="scope">
                                            <el-button @click="handle_request_delete_row(scope.$index,scope.row)" size="mini" class="el-icon-close" />
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <el-button size="mini" @click="handle_request_add_row" class="el-icon-circle-plus">新 增</el-button>
                            </el-form-item>
                        </el-card>
                    </template>

                    <el-form-item label="是否修改响应头Headers" label-width="120px">
                        <el-switch
                            v-model="form.response.enable"
                            active-color="#409eff"
                            inactive-color="#ff4949"
                            @change="form.response.enable=$event">
                        </el-switch>
                    </el-form-item>
                    <template v-if="form.response.enable==true">
                        <el-card shadow="hover">
                            <el-form-item label="请求方法" label-width="120px" prop="methods">
                                <el-select v-model="form.response.methods" multiple placeholder="请选择请求方法">
                                    <el-option label="所有" value="all" style="height:40px;" />
                                    <el-option label="get" value="get" style="height:40px;" />
                                    <el-option label="post" value="post" style="height:40px;" />
                                    <el-option label="put" value="put" style="height:40px;" />
                                    <el-option label="delete" value="delete" style="height:40px;" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="目标url" label-width="120px" prop="y_url">
                                <el-input v-model="form.response.y_url" autocomplete="off" />
                            </el-form-item>
                            <el-form-item label="修改headers" label-width="120px">
                                <el-table
                                :data="form.response.t_headers"
                                :show-header=false>
                                    <el-table-column
                                    prop="name"
                                    width=""
                                    label="键">
                                        <template slot-scope="scope">
                                            <el-input v-model="scope.row.name" autocomplete="off" placeholder="键" />
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                    label="值"
                                    prop=""
                                    width="">
                                        <template slot-scope="scope">
                                            <el-input v-model="scope.row.value" autocomplete="off" placeholder="值" />
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                    width=""
                                    label="操作">
                                        <template slot-scope="scope">
                                            <el-button @click="handle_response_delete_row(scope.$index,scope.row)" size="mini" class="el-icon-close" />
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <el-button size="mini" @click="handle_response_add_row" class="el-icon-circle-plus">新 增</el-button>
                            </el-form-item>
                        </el-card>
                    </template>

                    <el-form-item label="描述" label-width="120px">
                        <el-input v-model="form.desc" autocomplete="off" type="textarea" />
                    </el-form-item>        

                </el-form>
            </el-scrollbar>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancel">取 消</el-button>
                <el-button type="primary" @click="submit">确 定</el-button>
            </div>
            
        </el-dialog>


        <el-dialog title="提示" :width="dialog_.width" :visible.sync="del_dialog.visible" :close-on-click-modal="false" center append-to-body>
            <span>确定删除该配置吗？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="del_dialog.visible = false">取 消</el-button>
                <el-button type="primary" @click="handleMobileDelete">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="提示" :width="clear_config_dialog.width" :visible.sync="clear_config_dialog.visible" :close-on-click-modal="false" center append-to-body>
            <span>确定清空所有配置吗？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="clear_config_dialog.visible = false">取 消</el-button>
                <el-button type="primary" @click="handle_clean_config">确 定</el-button>
            </span>
        </el-dialog>

        <testDialog v-bind:testDialog="this.test_dialog" />
    </div>
</template>

<script>
import testDialog from "./TestDialog.vue";
export default {
    props:["parent_config","is_mobile"],
    components: {
        testDialog
    },
    data(){
        const validateSelect = (rule,value,callBack) =>{
            if(this.form.request["methods"].length == 0){
                return callBack(new Error("请至少选择一个方法"));
            }else{
                callBack();
            }
            
        };
        const validateYUrl = (rule,value,callBack) =>{
            if(this.form.intercept_redirect["y_url"].trim() === "" && this.form.intercept_redirect.enable){
                return callBack(new Error("请输入需匹配的url"));
            }else if(this.form.request["y_url"].trim() === "" && this.form.request.enable){
                return callBack(new Error("请输入需匹配的url"));
            }else{
                callBack();
            }
        };
        const validateNoEmpty = (rule,value,callBack) =>{
            if(this.form.intercept_redirect["t_url"].trim() === ""){
                return callBack(new Error("请勿留空"));
            }else{
                callBack();
            }
        };
        return {
            config: {}, // 全局配置
            table_data: [], // 显示的表格数据
            search: "", // 搜索
            dialog_:{
                visible: false, // 添加配置弹窗的visible
                title: "添加", // 弹窗标题
                width: "40%", // 弹窗宽度,手机85% ,平板75% ,电脑40% 区间 480-768, 768-1024,1024-1199
            },
            form: null, // form表单
            isedit: false, // 正在编辑
            edit_index: null, // 正在编辑的数据的index
            is_mobile_visit:false, // 手机访问
            msg_customClass: "",
            test_dialog:{
                width: "40%",
                visible: false,
                data: {},
                comp: "testDialog", // 测试的dialog的外部
            },
            del_dialog:{  // 删除配置的dialog
                visible: false,
                row: null,
                index: null,
            },
            clear_config_dialog:{ // 清空所有配置的dialog
                visible: false,
                width: "40%",
            },
            rules: {
                name:[
                    { 
                        required: true,
                        message: '请输入名称',
                        trigger: 'blur' 
                    }
                ],
                model:[
                    {
                        required: true,
                        message: '请选择处理方式',
                        trigger: 'blur'
                    }
                ],
                y_url:[
                    {
                        required: true,
                        validator: validateYUrl,
                        trigger: 'blur'
                    }
                ],
                t_url:[
                    {
                        required: true,
                        validator: validateNoEmpty,
                        trigger: 'blur'
                    }
                ],
                methods:[
                    {
                        required: true,
                        validator: validateSelect,
                        trigger: 'change'
                    }
                ],
            },
        }
    },
    created(){
        this.init();
        this.dialog_.width = this.$parent.getDialogWidth();
        this.test_dialog.width = this.$parent.getDialogWidth();
        this.clear_config_dialog.width = this.$parent.getDialogWidth();
        this.is_mobile_visit = this.is_mobile;
        this.msg_customClass = this.is_mobile_visit ? "ismobile_msg":"";
    },
    mounted(){
        let that = this;
        // window.onresize = () =>{
        //     that.dialog_.width = this.$parent.getDialogWidth();
        //     that.test_dialog.width = this.$parent.getDialogWidth();
        //     that.clear_config_dialog.width = this.$parent.getDialogWidth();
        // }
    },
    methods:{
        init(){
            this.initForm();
            this.config = this.parent_config;
            if(this.config["webRequest"] !== undefined){
                this.table_data = this.config["webRequest"];
            }
        },
        headClass(){
            // 表头样式
            return "text-align:center";
        },
        rowClass(){
            // 表格样式
            return "text-align:center";
        },
        dialog_visible_event(){
            // 弹窗visible的事件
            if(this.dialog_.visible === true){
                this.dialog_.visible = false;
            }else{
                this.dialog_.visible = true;
            }
        },
        cancel(){
            this.dialog_visible_event();
        },
        removeNullArray(){
            // 移除form中name=""
            for(let i=0;i<this.form.request.t_headers.length;i++){
                let item = this.form.request.t_headers[i];
                let name = item["name"];
                if(name.trim() == ""){
                    this.form.request.t_headers.splice(i,1);
                    i--;
                }
            }
            for(let j=0;j<this.form.response.t_headers.length;j++){
                let item = this.form.response.t_headers[j];
                let name = item["name"];
                if(name.trim() == ""){
                    this.form.response.t_headers.splice(j,1);
                    j--;
                }
            }
        },
        submit(){
            // 提交表单
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    this.removeNullArray();
                    if(this.isedit){
                        this.editLocalConfig();
                    }else{
                        this.addLocalConfig();
                    }
                    this.dialog_visible_event();
                } else {
                    // console.log('error submit!!');
                    return false;
                }
            });
        },
        resetForm(){
            // 重置表单
            this.initForm();
        },
        editLocalConfig(){
            // 把表单数据提交到本地localStorage中
            if(this.edit_index === null){
                this.$message.error('index错误');
                return
            }
            let form_ = this.config["webRequest"];
            form_[this.edit_index] = this.form;
            // console.log(this.form);
            this.$parent.set_config("webRequest",form_);
        },
        addLocalConfig(){
            // 把表单数据提交到本地localStorage中
            if(this.table_data === undefined){
                // 不知名原因 无配置时为undefined
                this.table_data = [];
            }
            let form_ = this.table_data;
            form_ = form_.concat(this.form);
            this.$parent.set_config("webRequest",form_);
        },
        handleTest(index,row){
            // 测试当前配置
            if(this.test_dialog.visible == false){
                this.test_dialog.data = this.config["webRequest"][index];
                this.test_dialog.visible = true;
                
            }else{
                this.test_dialog.visible = false;
                this.test_dialog.data = {};
            }

        },
        handleEdit(index,row){
            this.form = row;
            this.dialog_.visible = true;
            this.dialog_.title = "修改";
            this.isedit = true;
            this.edit_index = index;
        },
        handleDelete(index,row){
            // 删除配置
            let form_ = this.config["webRequest"];
            form_.splice(index,1);
            this.$parent.set_config("webRequest",form_);
        },
        handleMobileDelete(index,row){
            // 删除配置（手机版的是dialog）
            this.handleDelete(this.del_dialog.index,this.del_dialog.row);
            this.del_dialog.visible = false;
        },
        handle_showDelDialog(index,row){
            this.del_dialog.visible = true;
            this.del_dialog.row = row;
            this.del_dialog.index = index;
        },
        handle_clean_config(){
            // 清空使用配置
            this.$parent.set_config("webRequest",[]);
            this.clear_config_dialog.visible = false;
            this.$message({
                message:"已清空！",
                customClass: this.msg_customClass,
                type: 'success',
                center: true,
                offset: 580,
            })
        },
        handle_request_add_row(){
            // 新增当前form的request的值
            this.form.request.t_headers.push({
                name:"",
                value:"",
            })
        },
        handle_response_add_row(){
            // 新增当前form的response的值
            this.form.response.t_headers.push({
                name:"",
                value:"",
            })
        },
        handle_request_delete_row(index,row){
            // 删除form的当前headers的值
            this.form.request.t_headers.splice(index,1);
        },
        handle_response_delete_row(index,row){
            // 删除form的当前headers的值
            this.form.response.t_headers.splice(index,1);
        },
        switch_enable_change_event(newVal,index){
            // 是否开启按钮事件
            this.config["webRequest"][index]["enable"] = newVal;
        },
        filterDate(){
            // 过滤表格数据，用于搜索
            let input = this.search.toLowerCase(); // 转为小写的
            let items = this.table_data;
            if(input){
                items = items.filter(function(item){
                    return Object.keys(item).some(function(key){
                        return String(item[key]).toLowerCase().match(input);
                    })
                })
            }
            return items;
        },
        initForm(){
            this.form = {
                name: "", // 名字
                enable: true, // 是否启用规则(总)
                intercept_redirect:{
                    enable: false, // 拦截/重定向是否开启
                    model: "", // 执行模式(拦截/重定向)(intercept/redirect)
                    methods:["all"], // 请求方式 get,post,put,...all(所有) 
                    y_url: "", // 匹配的url 正则
                    t_url: "", // 替换后的url
                },
                request:{
                    enable: false, // request headers修改是否开启
                    methods:["all"], // 请求方式 get,post,put,...all(所有)
                    y_url: "", // 匹配的url 正则
                    t_headers: [], // 替换的headers
                },
                response:{
                    enable: false, // response headers修改是否开启
                    methods:["all"], // 请求方式 get,post,put,...all(所有)
                    y_url: "", // 匹配的url 正则
                    t_headers: [], // 替换的headers
                },
                desc: "", // 描述 
            }
        },
    },
    watch:{
        "config":{
            //深度监听，可监听到对象、数组的变化
            handler(val, oldVal){
                this.table_data = val["webRequest"];
            },
            deep:true //true 深度监听
        },
        "dialog_.visible":{
            handler(val, oldVal){
                if(val === false){
                    // 如果dialog的visible（可见的）是false的话，那就清空form
                    this.resetForm();
                    this.edit_index = null;
                    this.isedit = false;
                    this.dialog_.title = "添加";
                }
            }
        },
        "del_dialog.visible":{
            handler(val,oldVal){
                if(!val){
                    this.del_dialog.row = null;
                    this.del_dialog.index = null;
                }
            }
        }
    }
}
</script>
<style scoped>
  .el-row {
    margin: 8px 20px;
    align-items: center;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  .el-scrollbar__wrap{
      overflow-x: hidden !important;
  }
</style>