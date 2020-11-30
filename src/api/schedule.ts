import request from '../util/request'
import {
    Inspection
} from '../types/inspections.interface'

/** 获取所有的巡检 */
export function getInspections() {
    return request({
        url: 'schedules',
        method: 'get'
    })
}

/** 新增巡检 */
export function addInspections(inspection: Inspection) {
    return request({
        url: 'schedules',
        method: 'post',
        data: inspection
    })
}

/**
 * 获取场站自动巡检信息
 * 
 * @param stationId 场站id
 */
export function getPatrolByStation(stationId: number) {
    return request({
        url: `stations/${stationId}/patrol`,
        method: 'get',
    })
}

export function startPatrol(id: number) {
    return request({
        url: `schedules/${id}/patrolpreset_start`,
        method: 'get',
    })
}

export function stopPatrol(id: number) {
    return request({
        url: `schedules/${id}/patrolpreset_stop`,
        method: 'get',
    })
}

// 通过id获取路线详情
export function getSchedules(id: number) {
    return request({
        url: `/schedules/${id}`,
        method: 'get'
    })
}

// 修改路线
export function editSchedules(data: any) {
    return request({
        url: '/schedules_edit',
        method: 'post',
        data
    })
}

// 新增路线
export function addSchedules(data: any) {
    return request({
        url: '/schedules',
        method: 'post',
        data
    })
}

// 删除路线
export function deleteSchedules(id: number) {
    return request({
        url: `/schedules_delete/${id}`,
        method: 'delete'
    })
}