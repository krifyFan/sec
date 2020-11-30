import request from '../util/request'
import {
    InterfaceConfig,
    ModuleConfigInterface,
    SecurityStaffConfig
} from '@/types/interfaceconfig.interface'

/** 返回默认可视化页面配置 */
export function getVisualizationDefaultConfig(): ModuleConfigInterface[] {

    let defaultModuleConfig: ModuleConfigInterface[] = [{
            id: 1,
            value: 'EquipmentCondition',
            position: {
                width: 21.35,
                height: 29.54,
                x: 2.7,
                y: 1
            },
            groupId: -1,
        },
        {
            id: 2,
            value: 'AlarmStatistics',
            position: {
                width: 21.35,
                height: 29.54,
                x: 2.7,
                y: 35
            },
            groupId: -1,
        },
        {
            id: 3,
            value: 'Map',
            position: {
                width: 42.39,
                height: 63.63,
                x: 28,
                y: 3
            },
            groupId: -1,
        },
        {
            id: 4,
            value: 'EventStatistics',
            position: {
                width: 21.35,
                height: 29.54,
                x: 75,
                y: 1
            },
            groupId: -1,
        },
        {
            id: 5,
            value: 'GrowthTrend',
            position: {
                width: 21.35,
                height: 29.54,
                x: 75,
                y: 35
            },
            groupId: -1,
        },
        {
            id: 6,
            value: 'EquipmentStatistics',
            position: {
                width: 21.35,
                height: 29.54,
                x: 2.7,
                y: 68
            },
            groupId: -1,
        },
        {
            id: 7,
            value: 'VideoGroup',
            position: {
                width: 21.35,
                height: 29.54,
                x: 27,
                y: 68,
            },
            groupId: 0,
        },
        {
            id: 8,
            value: 'RealTimeAlarm',
            position: {
                width: 21.35,
                height: 29.54,
                x: 51,
                y: 68
            },
            groupId: -1
        },
        {
            id: 9,
            value: 'IntercomStatistics',
            position: {
                width: 21.35,
                height: 29.54,
                x: 75,
                y: 68
            },
            groupId: -1
        }

    ]

    return defaultModuleConfig
}

/** 返回默认总览页面配置 */
export function getOverViewModuleDefaultConfig(): ModuleConfigInterface[] {
    let defaultModuleConfig: ModuleConfigInterface[] = [{
        id: 1,
        value: 'EquipmentCondition',
        position: {
            width: 23.57,
            height: 32,
            x: 2.5,
            y: 0
        },
        groupId: -1,
    }, {
        id: 2,
        value: 'NumberOfAlarms',
        position: {
            width: 23.57,
            height: 32,
            x: 2.5,
            y: 33.5
        },
        groupId: -1,
    }, {
        id: 3,
        value: 'RealTimeAlarm',
        position: {
            width: 23.57,
            height: 32,
            x: 2.5,
            y: 67
        },
        groupId: -1,
    }, {
        id: 4,
        value: 'VideoGroup',
        position: {
            width: 23.57,
            height: 32,
            x: 74,
            y: 0
        },
        groupId: 0,
    }, {
        id: 5,
        value: 'VideoGroup',
        position: {
            width: 23.57,
            height: 32,
            x: 74,
            y: 33.5
        },
        groupId: 0,
    }, {
        id: 6,
        value: 'VideoGroup',
        position: {
            width: 23.57,
            height: 32,
            x: 74,
            y: 67
        },
        groupId: 0,
    }]

    return defaultModuleConfig
}

/** 返回默认保安页面配置 */
export function getSecurityStaffDefaultConfig(): SecurityStaffConfig {
    let defaultModuleConfig: SecurityStaffConfig = {
        widthNum: 1,
        heightNum: 1,
        videoIds: [0]
    }

    return defaultModuleConfig
}

/**
 * 获取所有的页面配置
 */
export function getConfigs() {
    return request({
        url: `interfaceconfigs`,
        method: 'get'
    })
}

/** 修改页面配置 */
export function updateConfig(config: InterfaceConfig) {
    return request({
        url: `interfaceconfigs_edit`,
        method: 'post',
        data: config
    })
}

/** 上传页面配置 */
export function uploadConfig(config: InterfaceConfig) {
    return request({
        url: '/interfaceconfigs',
        method: 'post',
        data: config
    })
}

export function getConfig() {
    return request({
        url: '/interfaceconfigs',
        method: 'get'
    })
}

/** 获取上传的报警底图 */
export function getFireBGImg() {
    return request({
        url: '/interfaceconfigs/uploadFireFile',
        method: 'get'
    })
}

// 获取实时信息背景图
export function getRealInfoBG() {
    return request({
        url: 'lasermethanes/uploadBgiFile',
        method: 'get'
    })
}

// 获取实时信息指针图
export function getRealInfoDevice() {
    return request({
        url: ' lasermethanes/uploadDeviceFile',
        method: 'get'
    })
}