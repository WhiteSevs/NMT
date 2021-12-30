<template>
  <div class="main_app">
    <div :class="navbar_className">
      <el-row class="tac">
        <el-col :span="12"
                style="width:100%">
          <el-menu style="text-align:center;"
                   default-active="1"
                   class="el-menu-vertical-demo"
                   background-color="#545c64"
                   text-color="#fff"
                   active-text-color="#ffd04b"
                   mode="horizontal">
            <el-tooltip class="item"
                        effect="dark"
                        content="检测"
                        placement="bottom">
              <el-menu-item index="1"
                            @click="chooseComp('checkChrome')">
                <i class="el-icon-monitor"></i>
                <span v-if="isMobile === false">检测</span>
              </el-menu-item>
            </el-tooltip>

            <el-tooltip class="item"
                        effect="dark"
                        content="webRequest"
                        placement="bottom">
              <el-menu-item index="2"
                            @click="chooseComp('webRequest')">
                <i class="el-icon-s-promotion"></i>
                <span v-if="isMobile === false">webRequest</span>
              </el-menu-item>
            </el-tooltip>

            <el-tooltip class="item"
                        effect="dark"
                        content="设置"
                        placement="bottom">
              <el-menu-item index="3"
                            @click="chooseComp('settings')">
                <i class="el-icon-setting"></i>
                <span v-if="isMobile === false">设置</span>
              </el-menu-item>
            </el-tooltip>

          </el-menu>
        </el-col>
      </el-row>
    </div>

    <div class="main">
      <component v-bind:is="whichComp"
                 v-bind:parent_config="this.config"
                 v-bind:is_mobile="this.isMobile" />
    </div>
  </div>
</template>

<script>
import { tools } from "@/js/utils.js";
import webRequest from "./WebRequest.vue";
import checkChrome from "./CheckChrome.vue";
import settings from "./Settings.vue";
export default {
  name: 'app',
  data () {
    return {
      config: {}, // 全局config
      navbar_className: "nav_bar", // 导航栏
      whichComp: "checkChrome", // 当点击哪个组件时显示该页面
      isMobile: false, // 判断当前是否是手机
    }
  },
  components: {
    checkChrome,
    webRequest,
    settings,
  },
  created () {
    this.checkOs();
    this.init();
    this.setConfigChangeEvent();

  },
  mounted () {
  },
  methods: {
    init () {
      // 初始化值
      this.config = this.get_config();
    },
    chooseComp (val) {
      // 选择该组件
      this.whichComp = val;
    },
    checkOs () {
      // 检测当前是否是手机访问
      let sUserAgent = navigator.userAgent.toLowerCase();
      let bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
      let bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
      let bIsMidp = sUserAgent.match(/midp/i) == "midp";
      let bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
      let bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
      let bIsAndroid = sUserAgent.match(/android/i) == "android";
      let bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
      let bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";

      if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {//如果是上述设备就会以手机域名打开
        // alert('手机端');
        this.isMobile = true;
      }
      // console.log("当前是否为手机访问 ",this.isMobile);
    },
    setConfigChangeEvent () {
      let that = this;
      window.addEventListener("storage", function (e) {
        that.init();
      })
    },
    set_config (key, value) {
      // 将配置写入本地文件中
      let config_ = this.config;
      config_[key] = value;
      tools.setLocalStorage(config_);
    },
    get_config () {
      // 获取本地配置文件json
      return tools.getLocalStorage();
    },
    getDialogWidth () {
      return tools.getDialogWidth();
    },

  },
  watch: {
    "config": {
      //深度监听，可监听到对象、数组的变化
      handler (val, oldVal) {
        this.config = val;
        tools.setLocalStorage(val);
      },
      deep: true //true 深度监听
    },
  }
}
</script>

<style>
html,
body {
  height: 100%;
  width: 100%;
}
* {
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
.nav_bar .el-col {
  text-align: center;
  text-align: -webkit-center;
}
.nav_bar ul {
  display: flex; /**不要设置宽度*/
}
.nav_bar ul li {
  text-align: center;
  float: left;
  width: 100%;
}
.el-scrollbar__wrap {
  overflow-x: hidden !important;
}
.el-select-dropdown__list li:last-child {
  margin-bottom: 15px;
}
@media screen and (min-width: 1024px) and (max-width: 1199px) {
  /* 屏幕在 1024px ~ 1199px */
  .ismobile_msg {
    min-width: 50vw;
  }
}
@media screen and (min-width: 768px) and (max-width: 1024px) {
  /* 屏幕在 768px ~ 1024px */
  .ismobile_msg {
    min-width: 55vw;
  }
}
@media screen and (max-width: 768px) {
  /* 屏幕在 480px ~ 768px */
  .ismobile_msg {
    min-width: 55vw;
  }
}
</style>
