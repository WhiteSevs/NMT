<template>
    <el-dialog
    title="测试"
    :visible.sync="centerDialogVisible"
    :width="width"
    :close-on-click-modal="false"
    center
    append-to-body>
    <el-carousel trigger="click" ref="carousel" arrow="never" height="400px" :autoplay="false" :loop="false">
        <el-carousel-item name="testMain">
            <el-scrollbar style="height: 375px;" >
                <el-form :model="form" ref="form" :rules="rules" style="" label-position="top">
                    <el-form-item label="Url" label-width="120px" prop="url">
                        <el-input v-model="form.url" placeholder="需要测试的url" />
                    </el-form-item>
                    <el-form-item label="请求方法" label-width="120px" prop="method">
                        <el-select v-model="form.method" placeholder="请选择请求方法">
                            <el-option label="所有" value="all" style="height:40px;" />
                            <el-option label="get" value="get" style="height:40px;" />
                            <el-option label="post" value="post" style="height:40px;" />
                            <el-option label="put" value="put" style="height:40px;" />
                            <el-option label="delete" value="delete" style="height:40px;" />
                        </el-select>
                    </el-form-item>
                </el-form>
            </el-scrollbar>
        </el-carousel-item>
        <el-carousel-item name="testResult">
            <el-page-header @back="goBack" content="">
            </el-page-header>
            <el-scrollbar style="height: 375px;" >
                <el-timeline>
                    <el-timeline-item
                    placement="top"
                    v-for="(item, index) in testResult"
                    :key="index"
                    :timestamp="item.timestamp"
                    :color="item.color">
                    <el-card>
                        <h4>{{item.title}}</h4>
                        <p v-html="item.content" />
                    </el-card>
                    </el-timeline-item>
                </el-timeline>
            </el-scrollbar>
        </el-carousel-item>
    </el-carousel>
    
    <span slot="footer" class="dialog-footer">
        <el-button @click="handleDialogVisible">取 消</el-button>
        <el-button type="primary" @click="submit">测 试</el-button>
    </span>
    </el-dialog>
</template>

<script>
import { tools } from "@/js/utils.js";
import { browser_test } from '@/js/test.js';
export default {
    props:["testDialog"],
    created(){
        this.init();
    },
    data(){
        return {
            data: {},
            width: "",
            centerDialogVisible: false,
            testResult: [],
            form: {},
            rules:{
                url:[
                    {
                        required: true,
                        message: '请输入需要测试的url',
                        trigger: 'blur'
                    }
                ],
                method:[
                    {
                        required: true,
                        message: '请选择请求方法',
                        trigger: 'change'
                    }
                ]
            }
        }
    },
    methods:{
        init(){
            this.clear();
            this.centerDialogVisible = this.testDialog.visible;
            this.data = this.testDialog.data;
            this.width = this.testDialog.width;
        },
        handleDialogVisible(){
            if(this.centerDialogVisible){
                this.testDialog.visible = false;
            }else{
                this.testDialog.visible = true;
            }
        },
        clear(){
            this.form = {
                url: "",
                method:""
            };
            this.testResult = [];
        },
        submit(){
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    this.setActiveItem("testResult");
                    let test_config = new browser_test(this.data,this.form.url,this.form.method,this.setTestResult);// 
                    this.testResult = this.testResult.splice(this.testResult.length);
                    test_config.main();
                } else {
                    // console.log('error submit!!');
                    return false;
                }
            });
        },
        setActiveItem(carouselName){
            // 切换卡片
            this.$refs.carousel.setActiveItem(carouselName);
        },
        goBack(){
            // 切回主
            this.setActiveItem("testMain");
            this.testResult = [];
        },
        setTestResult(title,content,color){
            // 标题、内容、样式
            let testResultJson = {"title":title,"content":content,"color":color,"timestamp":""};
            testResultJson["timestamp"] = tools.getTimeStamp(new Date(),"hh:mm:ss");
            this.testResult = this.testResult.concat(testResultJson);
        },
    },
    watch:{
        "testDialog":{
            // 父数据
            handler(val,oldVal){
                // console.log("父改");
                this.centerDialogVisible = val.visible;
                this.data = val.data;
                if(val.visible == false){
                    this.goBack();
                    this.clear();
                }
            },
            deep:true //true 深度监听
        },
        "centerDialogVisible":{
            // 本页dialog的visible，为什么监听它呢，因为右上角的关闭会影响该值
            handler(val,oldVal){
                // console.log("子改");
                if(val == false){
                    // this.goBack();
                    this.clear();
                }
                this.testDialog.visible = val;
                
            },
            deep:true //true 深度监听
        },
    }
}
</script>