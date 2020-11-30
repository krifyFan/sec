import {
    Video
} from '@/types/video.interface'

/** 页面类型类型枚举 */
export enum InterfaceTypeEnum {
    可视化 = 1,
        场站总览 = 2,
        保安页面 = 3,
        火灾告警 = 4,
        实时信息 = 5
}

/** 后端配置内容 */
export interface InterfaceConfig {
    /** id */
    id ? : number,
        /** 名称 */
        name ? : string,
        /** 所属场站 */
        stationId ? : number,
        /** 类型：1 可视化 2 场站总览 3 保安页面 4 火灾告警*/
        type ? : number,
        /** 记录参数 */
        param ? : string,
}

/**
 * 具体配置
 */
export interface ModuleConfigInterface {
    id: number,
        value: string,
        /** 模块位置信息 */
        position: Position,
        /** 视频分组的id */
        groupId: number
}

/** 页面信息 */
interface Position {
    width: number,
        height: number,
        x: number,
        y: number
}

/**
 * 保安具体配置
 */
export interface SecurityStaffConfig {
    /** 横向展示的个数 */
    widthNum: number,
        /** 纵向展示的个数 */
        heightNum: number,
        /** 每个框对应的视频id */
        videoIds: number[]
}

/**
 * 火灾报警
 */

export interface FireAlarmConfig {
    // 添加图标的名称 烟感/温感
    iconName: string
    // icon距离父元素的top距离
    top: string
    // icon距离父元素的left距离
    left: string
    // icon距离父元素的top距离百分比
    topPercen: string
    // icon距离父元素的left距离百分比
    leftPercen: string
    // icon绑定设备的id
    objectId: null | number
    // icon绑定设备的名称
    objectName: string
    // icon是否可移动
    isMove: boolean
    // 绑定对象的框是否可展示
    isPop: boolean
}