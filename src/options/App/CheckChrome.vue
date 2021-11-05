<template>
<div>
    <h3 style="text-align:center;">检测chrome内核</h3>
    <el-table
        :data="check_table"
        
        border
        style="width: 100%">
        <el-table-column
            prop="key"
            label="检测项"
            width="180">
        </el-table-column>
        <el-table-column
            prop="value"
            label="值"
            width="180">
        </el-table-column>
    </el-table>
</div>

</template>
<script>
export default{
    data(){
        return {
            config: null, // 全局配置
            kernel: "", //浏览器内核版本
            userAgent: "", // 访问用户UA
            check_table: [], // 表格数据
        }
    },
    created(){
        this.init();
    },
    props:["parent_config"]
    ,
    methods:{
        init(){
            this.config = this.parent_config;
            this.userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
            this.checkkernel();
            this.check_table = [
                {
                    key: "Chrome版本",
                    value: this.kernel,
                },
                {
                    key: "User-Agent",
                    value: this.userAgent,
                },
                {
                    key: "配置文件",
                    value: this.getConfigToString(),
                }
            ]
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
                    type: 'warning'
                });
                this.kernel = "请使用chrome内核浏览器访问";
            }
        },
        getConfigToString(){
            // 获取字符串形式的配置文件，不是Object
            return JSON.stringify(this.config);
        }
    }
}


</script>
<style scoped>

</style>