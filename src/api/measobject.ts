import request from '../util/request'
import {
    MeasObject,
    MeasObjectVo,
} from '@/types/measobject.interface'
import {
    MeasObjectVal
} from '@/types/measobjectval.interface'


export function getDefaultMeasObjectVal(): MeasObjectVal {
    return {
        id: 0,
        name: '',
        stationId: 0,
        objectType: 0,
        dataType: 0,
        lastValue: 0,
        lastTime: new Date()
    }
}

/** 获取所有的监测对象 */
export function getMeasObjects() {
    return request({
        url: 'measobjects',
        method: 'get'
    })
}

/** 添加对象 */
export function addMeasObject(measObject: MeasObject) {
    return request({
        url: 'measobjects',
        method: 'post',
        data: measObject
    })
}

/** 编辑对象 */
export function editMeasObject(measObject: MeasObject) {
    return request({
        url: 'measobjects_edit',
        method: 'post',
        data: measObject
    })
}

/** 删除对象 */
export function deleteMeasObject(id: number) {
    return request({
        url: 'measobjects_delete/' + id,
        method: 'get'
    })
}

/** 根据条件查找对象 */
export function selectMeasObjectsByCondition(vo: MeasObjectVo) {
    return request({
        url: 'measobjects/condition',
        method: 'post',
        data: vo
    })
}


/** 根据条件查找对象 */
export function selectMeasObjectValsByCondition(vo: MeasObjectVo) {
    return request({
        url: 'measobjectvals/condition',
        method: 'post',
        data: vo
    })
}

/** 查询对象有无告警 */
export function alarmsCondition(data: {objId: number, cleaned: boolean}) {
    return request({
        url: '/alarms/condition',
        method: 'post',
        data: data
    })
}


/** 编辑值对象 */
export function editMeasObjectVal(measObjectVal: MeasObjectVal) {
    return request({
        url: '/measobjects_edit',
        method: 'post',
        data: measObjectVal
    })
}


/** 获取值对象 */
export function getMeasObjectVal(id: number) {
    return request({
        url: `measobjectvals/${id}`,
        method: 'get'
    })
}

/**
 * 对象导出
 */
export function exportMeasObj() {
    return request({
        url: '/measobjects/export',
        method: 'post'
    })
}