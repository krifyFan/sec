import request from '@/util/request'
import intercomRequest from '@/util/intercomRequest'

import Vue from 'vue'

export default async () => {
    // 根据生产环境还是开发环境读取配置文件
    let isProducetion: boolean = process.env.NODE_ENV === 'production'

    let config: any = isProducetion ?
        (await request.get('../serverconfig.json')).data : require('../../public/serverconfig.json')
        // (await intercomRequest.get('../serverconfig.json')).data : require('../../public/serverconfig.json')
    
        request.defaults.baseURL = config.ApiUrl
        intercomRequest.defaults.baseURL = config.InterconApi

    Vue.prototype.VisualizedParams = config.VisualizedParams
    Vue.prototype.MQParams = config.MQParams
    Vue.prototype.ProjectConfig = config.ProjectConfig
}