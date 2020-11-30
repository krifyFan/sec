import 'babel-polyfill'
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import echarts from 'echarts';
import 'echarts-gl';
import {
    Message,
    Modal
} from 'iview';
import iview from './iview';
import 'iview/dist/styles/iview.css';
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './util/rem.js';
import '@/util/common'
import '@/util/rabbitmq'
import {
    MQ
} from '@/util/rabbitmq'

// 权限判断
import permission from '@/components/permission/permission'
// 防止多次点击
import preventReClick from '@/components/directive/preventReClick'

import '@/assets/commonCss.less'

const serve = require('../public/serverconfig.json')

Vue.config.productionTip = false;
Vue.prototype.$Message = Message
Vue.prototype.$Modal = Modal
Vue.prototype.$echarts = echarts
Vue.prototype.serve = serve

Vue.use(iview);
Vue.use(ElementUI);

(Element as any).prototype.addEvent = function (type, fn) {
    if ((window as any).attachEvent) {
        this.attachEvent(type, fn);
    } else if (window.addEventListener) {
        this.addEventListener("on" + type, fn);
    } else {
        this["on" + type] = fn;
    }
};
// 权限指令
Vue.directive('permission', permission)
Vue.directive('preventReClick', preventReClick)

async function main_init() {
    try {
        store.commit("initParamter")

        let request = (await import('./util/config')).default;
        await request();
        let routerInitialization = (await import('./util/routerInitialization')).routerInitialization;
        await routerInitialization();

        // MQ启动
        let mq: MQ = new MQ()
        mq.openMQ()

        return "success"
    } catch (error) {
        throw new Error(error)
    }
}

main_init().then(res => {
    new Vue({
        router,
        store,
        render: h => h(App)
    }).$mount("#app");
})