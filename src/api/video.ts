import request from '../util/request'
import {
    Video,
    VideoVo
} from '@/types/video.interface'
import {
    PageQuery
} from '@/types/pagequery.interface'
import {
    EnumType
} from '@/types/enumtype.interface'
import store from '@/store'
import { Alarm } from '@/types/alarm.interface'

export function getDefaultVideo(): Video {

    /** 对象类型 */
    let objectType: EnumType[] = store.state.objectType.filter((type: EnumType) => type.key.indexOf('视频') >= 0)

    /** 数据类型 */
    let dataType: EnumType[] = store.state.dataType.filter((type: EnumType) => type.key.indexOf('视频') >= 0)

    return {
        id: 0,
        name: '',
        stationId: 0,
        stationName: '',
        objectType: objectType.length > 0 ? objectType[0].val : 0,
        objectTypeName: objectType.length > 0 ? objectType[0].key : '',
        dataType: dataType.length > 0 ? dataType[0].val : 0,
        dataTypeName: dataType.length > 0 ? dataType[0].key : '',
        equipmentId: 0,
        createTime: new Date(),
        actived: true,
        online: false,
        ip: '127.0.0.1',
        port: 80,
        username: 'admin',
        password: '12345',
        serverId: 0,
        channelNo: 0,
        channelName: '',
        defaultPreset: 0,
        vendor: 0,
        category: 1,
        videoServer: null,
        code: ''
    }
}

/** 获取所有的监测视频 */
export function getVideos() {
    return request({
        url: 'videos',
        method: 'get'
    })
}

/** 分页获取视频 */
export function getPageInfo(param: PageQuery) {
    return request({
        url: 'videos_page',
        method: 'post',
        data: param
    })
}

/** 添加视频 */
export function addVideo(video: Video) {
    return request({
        url: 'videos',
        method: 'post',
        data: video
    })
}

/** 编辑视频 */
export function editVideo(video: Video) {
    return request({
        url: 'videos_edit',
        method: 'post',
        data: video
    })
}

/** 删除视频 */
export function deleteVideo(id: number) {
    return request({
        url: 'videos_delete/' + id,
        method: 'get'
    })
}

export function getVideoDtos() {
    return request({
        url: 'videodtos',
        method: 'get'
    })
}

export function getVideoDto(id: number) {
    return request({
        url: 'videodtos/' + id,
        method: "get"
    })
}

export function getAlarmPerimeterVideo(alarm: Alarm) {
    return request({
        url: 'videolinkages/alarm',
        method: "post",
        data: alarm
    })
}

/** 获取场站下的所有视频 */
export function getVideoDtosByStation(stationId: number) {
    return request({
        url: `stations/${stationId}/videodtos`,
        method: 'get'
    })
}

/** 根据条件获得视频 */
export function getVideoDtosByCondition(vo: VideoVo) {
    return request({
        url: 'videodtos/condition',
        method: 'post',
        data: vo
    })
}

/** 根据条件获得视频巡检详情 */
export function getVideoPatrolDeByCondition(data: any) {
    return request({
        url: 'patrols/condition',
        method: 'post',
        data
    })
}

/** 根据条件获得视频巡检历史 */
export function getVideoPatrolHisByCondition(data: any) {
    return request({
        url: 'patrolrecords/condition',
        method: 'post',
        data
    })
}

/**
 * 对象导出
 */
export function exportVideo() {
    return request({
        url: '/videos/export',
        method: 'post'
    })
}

/** 历史视频开始时间点接口 */
export function getAlarmTime() {
    return request({
        url: '/systemconfigs/alarmlinkage',
        method: 'get'
    })
}