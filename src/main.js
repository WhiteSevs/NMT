import Vue from 'vue'
import ElementUI from 'element-ui'
import './styles.scss'

Vue.use(ElementUI)
Vue.component("app-component", AppComponent);
Vue.config.productionTip = false;

Vue.component("app-component", App);
new Vue({
  render: h => h(App),
}).$mount('#app')
