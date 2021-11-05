<template>
<!-- eslint-disable -->
    <div class="header">
        <h1 style="text-align:center">拦截Url</h1>
    </div>
    <div class="main_table">
        <el-table
            :data="intercept_table_data"
            empty-text="暂无配置"
            style="width: 100%">
            <el-table-column
            label="配置名称"
            prop="name">
            </el-table-column>
            <el-table-column
            label="描述"
            prop="desc">
            </el-table-column>
            <el-table-column
            align="right">
            <template slot="header" slot-scope="scope">
                <el-input
                v-model="search"
                size="mini"
                placeholder="输入关键字搜索"/>
            </template>
            <template slot-scope="scope">
                <el-button
                size="mini"
                @click="handleEdit(scope.$index, scope.row)">Edit</el-button>
                <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.$index, scope.row)">Delete</el-button>
            </template>
            </el-table-column>
        </el-table>
        <div>

        </div>
    </div>
</template>

<script>
export default {
    data(){
        return {
            config: {}, // 全局配置
            intercept_table_data:[], // 拦截url配置的data
            search:"", // 搜索
        }
    },
    props:["parent_config"],
    created(){
        this.init();
    },
    methods:{
        init(){
            this.config = this.parent_config;
            if(this.config["intercept"] !== undefined){
                this.intercept_table_data = this.config["intercept"];
            }
        }
    }
}
</script>

<style lang="sass" scoped>

</style>
