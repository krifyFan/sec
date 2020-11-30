import {
    EnumType
} from '@/types/enumtype.interface'
import {
    Role
} from '@/types/role.interface'
import {
    AlarmPermission
} from '@/types/permission.interface'

export interface State {
    /** 用户名 */
    userName: string | null,
        /** 密码 */
        passWord: string | null,
        /** token */
        token: string | null,
        /** 所属管理部门ID */
        managementId: number | null,
        /** 场站页面的场站ID */
        stationId: number | null,
        /** 角色 */
        roles: Array < Role > | null,
        /** 权限 */
        permissions: Array < string > | null,
        /** 数据类型 */
        dataType: Array < EnumType > | null,
        /** 对象类型 */
        objectType: Array < EnumType > | null,
        /** 设备类型 */
        equipmentType: Array < EnumType > | null,
        /** 设备状态类型 */
        equipmentStateType: Array < EnumType > | null,
        /** 告警级别 */
        alarmLevel: Array < EnumType > | null,
        /** 告警类型 */
        alarmCategory: Array < EnumType > | null
        /** 视频类型 */
        videoCategory: Array < EnumType > | null,
        /** 视频供应商 */
        videoVendors: Array < EnumType > | null,
        /** 图标 */
        icons: Array < any > ,
        /** 线的样式 */
        lineStyles: Array < any > ,
        /** 告警权限关联表 */
        alarmPermissionMap: Map < string, number >
}

export const state: State = {
    userName: '',
    passWord: '',
    token: '',
    managementId: null,
    stationId: null,
    roles: null,
    permissions: null,
    dataType: null,
    objectType: null,
    equipmentType: null,
    equipmentStateType: null,
    alarmLevel: null,
    alarmCategory: null,
    videoCategory: null,
    videoVendors: null,
    icons: [{
        id: 1,
        name: "station.png",
        img: require("@/assets/images/station.png")
    }, {
        id: 2,
        name: "station.svg",
        img: require("@/assets/images/station.svg")
    }],
    lineStyles: [{
        id: 1,
        color: "#DA251D"
    }, {
        id: 2,
        color: "#00923F"
    }, {
        id: 3,
        color: "#005CA1"
    }],
    alarmPermissionMap: new Map()
}