import request from '../util/request'

export function getDepartmentPage(data: any) {
    return request({
        url: '/department_page',
        method: 'post',
        data: data
    })
}

export function getDepartment() {
    return request({
        url: '/departments',
        method: 'get'
    })
}

export function getDepartmentDetails(id: number) {
    return request({
        url: `/departments/${id}`,
        method: 'get'
    })
}

export function addDepartment(data: any) {
    return request({
        url: '/departments',
        method: 'post',
        data: data
    })
}

export function editDepartment(data: any) {
    return request({
        url: '/departments_edit',
        method: 'post',
        data: data
    })
}

export function deleteDepartment(id: number) {
    return request({
        url: 'departments_delete/' + id,
        method: 'get'
    })
}

/**
 * 对象导出
 */
export function exportDepartment() {
    return request({
        url: '/departments/export',
        method: 'post'
    })
}