import request from '@/util/request'
import {
    Management,
    ManagementTree
} from '@/types/management.interface'
import {
    PageQuery
} from '@/types/pagequery.interface'

export function getDefaultManagement(): Management {
    return {
        id: 0,
        name: '无',
        position: '',
        level: 0,
        fatherId: 0,
        fatherName: '无',
        leaf: false,
        map: '',
        icon: 1,
        /** 联系人 */
        contact: "",
        /** 联系电话 */
        telephone: "",
        /** 联系地址 */
        address: "",
        createTime: new Date
    }
}

export function getDefaultManagementTree(): ManagementTree {
    return {
        id: 0,
        name: '',
        position: "",
        level: 0,
        fatherId: 0,
        leaf: true,
        map: "",
        icon: 0,
        children: [],
        /** 联系人 */
        contact: "",
        /** 联系电话 */
        telephone: "",
        /** 联系地址 */
        address: "",
    }
}

/** 获取所有的管理部门 */
export function getManagements() {
    return request({
        url: 'managements',
        method: 'get'
    })
}

/** 分页获取管理部门类型 */
export function getPageInfo(param: PageQuery) {
    return request({
        url: 'managements_page',
        method: 'post',
        data: param
    })
}

/** 添加管理部门 */
export function addManagement(management: Management) {
    return request({
        url: 'managements',
        method: 'post',
        data: management
    })
}

/** 编辑管理部门 */
export function editManagement(management: Management) {
    return request({
        url: 'managements_edit',
        method: 'post',
        data: management
    })
}

/** 删除管理部门 */
export function deleteManagement(id: number) {
    return request({
        url: 'managements_delete/' + id,
        method: 'get'
    })
}

/** 获取管理部分的tree */
export function getManagementTree() {
    return request({
        url: 'managements/tree',
        method: 'get'
    })
}