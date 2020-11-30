import request from '../util/request'
import {
    StationPeople,
    StationPeopleVo
} from '@/types/stationpeople.interface'


/** 根据条件获取数目 */
export function getStationPeoplesByCondition(vo: StationPeopleVo) {
    return request({
        url: 'stationpeoples/condition',
        method: 'post',
        data: vo
    })
}

/** 根据条件获取数目 */
export function getCountByCondition(vo: StationPeopleVo) {
    return request({
        url: 'stationpeople_count/condition',
        method: 'post',
        data: vo
    })
}

/** 添加进站人员 */
export function addStationPeople(people: StationPeople) {
    return request({
        url: 'stationpeoples',
        method: 'post',
        data: people
    })
}

