import request from '../util/request'
import {
    ComplexChild,
    ComplexObject
} from '@/types/complexobject.interface'
import {
    MeasObjectVo
} from '@/types/measobject.interface'

export function getDefaultComplexObject(): ComplexObject {

    return {
        id: 0,
        name: '',
        stationId: 0,
        stationName: '',
        objectType: 5,
        objectTypeName: '',
        dataType: 5,
        dataTypeName: '',
        equipmentId: 0,
        equipmentName: '',
        createTime: new Date(),
        actived: true,
        online: false,
        value: '',
        children: [],
        measObjects: []
    }
}

export function getDefaultComplexChild(): ComplexChild {
    return {
        index: 0,
        id: 0,
        description: ''
    }
}

/** 根据条件获取所有的复杂类型 */
export function getComplexObjectByCondition(vo: MeasObjectVo) {
    return request({
        url: 'complexobjects/condition',
        method: 'post',
        data: vo
    })
}

/** 添加复杂对象 */
export function addComplexObject(object: ComplexObject) {
    return request({
        url: 'complexobjects',
        method: 'post',
        data: object
    })
}

/** 编辑视频 */
export function editComplexObject(complexObject: ComplexObject) {
    return request({
        url: 'complexobjects_edit',
        method: 'post',
        data: complexObject
    })
}

/** 删除视频 */
export function deleteComplexObject(id: number) {
    return request({
        url: 'complexobjects_delete/' + id,
        method: 'get'
    })
}