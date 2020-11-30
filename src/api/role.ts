import request from '../util/request'
import {
    Role
} from '@/types/role.interface'

export function getDefaultItem(): Role {
    return {
        id: 0,
        name: '',
        alarmPermissionStr: '',
        permissions: []
    }
}

/** 获取所有的角色 */
export function getRoles() {
    return request({
        url: 'allroles',
        method: 'get'
    })
}

/** 根据用户获取角色 */
export function getRolesByUser(userId: number) {
    return request({
        url: `users/${userId}/roles`,
        method: 'get'
    })
}

/** 新增角色 */
export function addRole(role: Role) {
    return request({
        url: 'roles',
        method: 'post',
        data: role
    })
}

/** 编辑角色 */
export function editRole(role: Role) {
    return request({
        url: "roles_edit",
        method: "post",
        data: role
    })
}

export function deleteRole(roleId: number) {
    return request({
        url: `roles/${roleId}/delete`,
        method: 'get'
    })
}


/** 更新用户和角色关系 */
export function updateRelationShipOfUserAndRole(userId: number, roleIds: number[]) {
    return request({
        url: 'user-role-relationship',
        method: 'post',
        data: {
            userId: userId,
            roleIds: roleIds
        }
    })
}