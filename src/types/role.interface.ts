import {
    AlarmPermission
} from '@/types/permission.interface'

export interface Role {
    id: number,
        name: string,
        /** 告警权限字符串，以‘,’间隔 */
        alarmPermissionStr: string,
        /** 告警权限 */
        permissions: number[]
        permissionNames?: string[]
}