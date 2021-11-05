<template>
  <div class="main_app">
    <div :class="navbar_className">
      <el-row class="tac">
        <el-col :span="12" style="width:100%">
          <el-menu
            style="text-align:center;"
            default-active="1"
            class="el-menu-vertical-demo"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
            mode="horizontal">
            <el-tooltip class="item" effect="dark" content="检测" placement="bottom">
              <el-menu-item index="1" @click="chooseComp('checkChrome')">
                <i class="el-icon-monitor"></i>
                <span v-if="isMobile === false">检测</span>
              </el-menu-item>
            </el-tooltip>
            
            <el-tooltip class="item" effect="dark" content="webRequest" placement="bottom">
              <el-menu-item index="2" @click="chooseComp('webRequest')">
                <i class="el-icon-s-promotion"></i>
                <span v-if="isMobile === false">webRequest</span>
              </el-menu-item>
            </el-tooltip>


          </el-menu>
        </el-col>
      </el-row>
    </div>

    <div class="main">
      <component v-bind:is="whichComp" v-bind:parent_config="this.config"></component>
    </div>
  </div>
</template>

<script>
import { tools } from "@/js/utils.js";
import  webRequest  from "./WebRequest.vue";
import  checkChrome from "./CheckChrome.vue";
export default {
  name: 'app',
  data(){
    return {
      config: {}, // 全局config
      navbar_className:"nav_bar", // 导航栏
      whichComp: "", // 当点击哪个组件时显示该页面
      isMobile: false, // 判断当前是否是手机
    }
  },
  components:{
    checkChrome,
    webRequest,
  },
  created(){
    this.init();
    this.checkOs();
    this.setConfigChangeEvent();
    
  },
  mounted(){
  },
  methods:{
    init(){
      // 初始化值
      this.config = this.get_config();
      this.chooseComp("checkChrome");
    },
    chooseComp(val){
      // 选择该组件
      this.whichComp = val;
    },
    checkOs(){
      // 检测当前是否是手机访问
      var sUserAgent = navigator.userAgent.toLowerCase();
      var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
      var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
      var bIsMidp = sUserAgent.match(/midp/i) == "midp";
      var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
      var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
      var bIsAndroid = sUserAgent.match(/android/i) == "android";
      var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
      var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";

      if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {//如果是上述设备就会以手机域名打开
          // alert('手机端');
          this.isMobile = true;
      }
      console.log(this.isMobile);
    },
    setConfigChangeEvent(){
      let that = this;
      window.addEventListener("storage", function(e){
        that.init();
        })
      },
    set_config(key,value){
      // 将配置写入本地文件中
      let config_ = this.config;
      config_[key] = value;
      tools.setLocalStorage(config_);
    },
    get_config(){
      // 获取本地配置文件json
      return tools.getLocalStorage();
    },
  },
  watch: {
    // 'config' (newVal,oldVal){
    //   console.log(newVal,oldVal);
    // }
  }
}
</script>

<style>
html,body{
  height: 100%;
  width: 100%;
}
*{
  margin: 0;
  padding: 0;
}
.nav_bar {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
  /* margin-top: 60px; */
}
.nav_bar .el-col{
  text-align: center;
  text-align: -webkit-center;
}
.nav_bar ul{
    display:flex;  /**不要设置宽度*/
}
.nav_bar ul li{
    text-align:center;
    float:left;
    width: 100%;
}
</style>
