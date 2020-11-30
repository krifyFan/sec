import {
    State
} from './state'
import {
    EnumType
} from '@/types/enumtype.interface'
import {
    AlarmPermission
} from '@/types/permission.interface'
import {
    MessageTypeEnum
} from '@/types/message.interface'

const TOKEN_KEY: string = "TOKEN"
const USERNAME_KEY: string = "USER_NAME"
const PASSWORD_KEY: string = "PASSWORD"
const MANAGEMENT_KEY: string = "MANAGEMENTID"
const STATION_KEY: string = "STATIONID"

export default {

    /** 初始所有的参数 */
    initParamter(state: State) {
        state.token = localStorage.getItem(TOKEN_KEY)
        state.userName = localStorage.getItem(USERNAME_KEY)
        state.passWord = localStorage.getItem(PASSWORD_KEY)
        state.managementId = Number(localStorage.getItem(MANAGEMENT_KEY))
        state.stationId = Number(localStorage.getItem(STATION_KEY))
        state.roles = null
        state.permissions = null
        // 初始化告警消息和权限的关系
        state.alarmPermissionMap.set(MessageTypeEnum.视频告警, 1)
        state.alarmPermissionMap.set(MessageTypeEnum.可视对讲告警, 2)
        state.alarmPermissionMap.set(MessageTypeEnum.周界告警, 3)
        state.alarmPermissionMap.set(MessageTypeEnum.高后果区视频告警, 7)
        state.alarmPermissionMap.set(MessageTypeEnum.火灾告警, 4)
        state.alarmPermissionMap.set(MessageTypeEnum.激光对射, 6)
    },

    /** 清除所有的缓存 */
    removeParamter(state: State) {
        state.token = null
        localStorage.removeItem(TOKEN_KEY)
        state.userName = null
        localStorage.removeItem(USERNAME_KEY)
        state.managementId = null
        localStorage.removeItem(MANAGEMENT_KEY)
        state.stationId = null
        localStorage.removeItem(STATION_KEY)
        state.roles = null
        state.permissions = null
    },

    setUserName(state: State, value: any) {
        state.userName = value
        localStorage.setItem(USERNAME_KEY, value)
    },

    setPassWord(state: State, value: any) {
        state.passWord = value
        localStorage.setItem(PASSWORD_KEY, value)
    },


    setToken(state: State, value: any) {
        state.token = value
        localStorage.setItem(TOKEN_KEY, value)
    },

    setManagementId(state: State, value: any) {
        state.managementId = value
        localStorage.setItem(MANAGEMENT_KEY, value)
    },

    setStationId(state: State, value: any) {
        state.stationId = value
        localStorage.setItem(STATION_KEY, value)
    },

    setRoles(state: State, value: any) {
        state.roles = value
    },

    setPermissions(state: State, value: any) {
        state.permissions = value
    },

    setDataType(state: State, value: Array < EnumType > ) {
        state.dataType = value
    },

    setObjectType(state: State, value: Array < EnumType > ) {
        state.objectType = value
    },

    setEquipmentType(state: State, value: Array < EnumType > ) {
        state.equipmentType = value
    },

    setEquipmentStateType(state: State, value: Array < EnumType > ) {
        state.equipmentStateType = value
    },

    setAlarmLevel(state: State, value: Array < EnumType > ) {
        state.alarmLevel = value
    },

    setAlarmCategory(state: State, value: Array < EnumType > ) {
        state.alarmCategory = value
    },

    setVideoCategory(state: State, value: Array < EnumType > ) {
        state.videoCategory = value
    },

    setVideoVendors(state: State, value: Array < EnumType > ) {
        state.videoVendors = value
    },
}