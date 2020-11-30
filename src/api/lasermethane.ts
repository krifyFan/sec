import request from '../util/request'

interface Calibrate {
    objectId: number,
    cv: boolean,
    time: number
}

interface Threshold {
    objectId: number,
    cv: number,
    time: number
}

// 一键校准
export function calibrate(data:Calibrate) {
    return request({
        url: '/lasermethanes/calibrate',
        method: 'post',
        data: data
    })
}

// 阀值设定
export function setThreshold(data: Threshold) {
    return request({
        url: '/lasermethanes/threshold_set',
        method: 'post',
        data
    })
}

// 获取自动巡航路线
export function getMapping(id: number) {
    return request({
        url: `/videos/${id}/patrolptz`,
        method: 'get'
    })
}

// 手动开始巡检路线 id为路线编号
export function patrolptzStart(id: number) {
    return request({
        url: `/schedules/${id}/patrolptz_start`,
        method: 'get'
    })
}

// 手动停止巡检路线 id为路线编号
export function patrolptzStop(id: number) {
    return request({
        url: `/schedules/${id}/patrolptz_stop`,
        method: 'get'
    })
}

// 获取视频方位
export function getVideoPTZ(id: number) {
    return request({
        url: `/videos/${id}/ptz`,
        method: 'get'
    })
}

// 跳转到指定点位
export function jumpPtz(data: any, id: number) {
    return request({
        url: `/videos/${id}/ptz`,
        method: 'post',
        data: data
    })
}

// 获取实时巡检数据
export function getPatrol(id: number) {
    return request({
        url: `/lasermethanes/${id}/patrol`,
        method: 'get'
    })
}
 
// 制动声光报警器
export function soundlightalarm(data: any) {
    return request({
        url: `/lasermethanes/soundlightalarm`,
        method: 'post',
        data: data
    })
}

// 获取历史激光甲烷数据
export function getMeasvalues(data: any) {
    return request({
        url: '/measvalues/condition',
        method: 'post',
        data: data
    })
}

// 上传实时信息的背景图
export function uploadRealInfoBG() {
    return request({
        url: 'lasermethanes/uploadBgiFile',
        method: 'get'
    })
}



// 上传实时信息指针图
export function uploadRealInfoDevice() {
    return request({
        url: ' lasermethanes/uploadDeviceFile',
        method: 'get'
    })
}

