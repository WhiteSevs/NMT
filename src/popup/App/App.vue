<template>
  <div class="main_app">
    <el-row type="flex"
            justify="center"
            align="top">
      <el-col style="min-width:max-content;align-self:center;">
        <i class="el-icon-setting"></i>
        <label class="enable_label"> 全局开关 </label>
      </el-col>
      <el-col>
        <el-switch class="switch_control"
                   v-model="enable"
                   active-color="#4395ff"
                   inactive-color="#ff4949"
                   style="margin: 0px 5px;"
                   @change="enable_change_event" />
      </el-col>
    </el-row>
    <el-row type="flex"
            justify="center"
            align="top"
            style="margin:20px 0px;">
      <el-col>
        <el-button type="primary"
                   size="mini"
                   @click="open_options">配置规则</el-button>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import { chrome_api } from "@/js/chrome_crx_api.js";
import { tools } from "@/js/utils.js";
export default {
  name: 'app',
  data () {
    return {
      author: "whitesev",
      enable: true, //全局开关
      config: null// 全局config
    }
  },
  created () {
    this.init();
    this.setConfigChangeEvent();
  },
  methods: {
    init () {
      // 初始化值
      this.config = this.get_config();
      this.enable = this.config["enable"];
      this.enable_change_event(this.enable);
    },
    setConfigChangeEvent () {
      // 监听本地storage的改变
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
    enable_change_event (switch_value) {
      this.set_config("enable", switch_value);
      let chromeApi = new chrome_api();
      chromeApi.setBrowserActionIcon(switch_value);
    },
    open_options () {
      window.open("options.html")
    },
  }
}
</script>

<style scoped>
.main_app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  /* width:250px; */
}
.enable_label {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}
.el-col {
  border-radius: 4px;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
</style>>
