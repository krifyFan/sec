import request from '@/util/request'
import {
    AlarmVo,
    Alarm
} from '@/types/alarm.interface'

export function getDefaultAlarm(): Alarm {
    return {
        id: 0,
        alarmTypeId: 0,
        objId: 0,
        level: 0,
        description: "",
        cleaned: false,
        source: '',
        time: new Date(),
        alarmType: {
            id: 0,
            name: "",
            objectType: 0,
            objectTypeName: '',
            description: '',
        },
        objectName: '',
        levelName: '',
    }
}

/** 获取告警统计信息 */
export function getAlarmStatistics() {
    return request({
        url: 'alarm_type_statistic',
        method: 'get'
    })
}

/** 获取某场站告警统计信息 */
export function getAlarmStatisticsByStation(stationId: number) {
    return request({
        url: `stations/${stationId}/alarm_type_statistic`,
        method: 'get'
    })
}

/**
 * 获取某场站的每日告警数
 * @param stationId 场站id
 * @param num 天数
 */
export function getDayAlarmCountOfStation(stationId: number, num: number) {
    return request({
        url: `stations/${stationId}/day_alarm_count/${num}`,
        method: 'get'
    })
}

/** 获取告警趋势 */
export function getAlarmTrend() {
    return request({
        url: 'alarm_type_trend',
        method: 'get'
    })
}

/** 根据条件分页搜索告警 */
export function getAlarmsByCondition(data: AlarmVo) {
    return request({
        url: 'alarms/condition',
        method: 'post',
        data: data
    })
}

/** 根据条件获取告警数目 */
export function getCountByCondition(vo: AlarmVo) {
    return request({
        url: 'alarm_count/condition',
        method: 'post',
        data: vo
    })
}

/** 获取告警的图片地址 */
export function getImagePathOfAlarm(id: number) {
    return request({
        url: `alarms/${id}/images`,
        method: 'get'
    })
}

/** 获取告警的视频地址 */
export function getVideoPathOfAlarm(id: number) {
    return request({
        url: `alarms/${id}/videos`,
        method: 'get'
    })
}

/** 告警清除 */
export function cleanAlarm(id: number) {
    return request({
        url: `alarms/${id}/clean`,
        method: "get"
    })
}

/** 发送虚拟告警 */
export function simulateAlarm(alarm: Alarm) {
    return request({
        url: "simulate_alarms",
        method: 'post',
        data: alarm
    })
}

/** 升级确认 */
export function upgradeAlarm(alarm: Alarm) {
    return request({
        url: "upgrade_alarm",
        method: 'post',
        data: alarm
    })
}

/** 告警弹窗配置 */
export function alarmPopup() {
    return request({
        url: '/systemconfigs/alarmpopup',
        method: 'get'
    })
}

/** 告警视频同步配置 */
export function alarmSync() {
    return request({
        url: '/systemconfigs/alarmsync',
        method: 'get'
    })
}

/** 告警上报 */
export function reportAlarm(alarm: Alarm) {
    return request({
        url: '/sync_alarm',
        method: 'post',
        data: alarm
    })
}

/** 告警周界同步配置 */
export function alarmPerimeterConfigs() {
    return request({
        url: '/systemconfigs/alarmlinkage',
        method: 'get'
    })
}

/** 下载告警数据 */
export function downloadExcel(params: any) {
    return request({
        url: '/alarms/export',
        method: 'post',
        data: params
    })
}

/** 删除告警 */
export function deleteAlarm(id) {
    return request({
        url: '/alarms_delete/'+id,
        method: 'get'
    })
}

// 获取告警类型
export function getAlarmType() {
    return request({
        url: '/alarm-type',
        method: 'get'
    })
}



