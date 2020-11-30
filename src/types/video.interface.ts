import {
    VideoServer
} from './videoserver.interface';

export interface Video {
    id: number,
        name ? : string,
        stationId ? : number,
        stationName ? : string,
        objectType ? : number,
        objectTypeName ? : string,
        dataType ? : number,
        dataTypeName ? : string,
        equipmentId?: number
        equipmentName ? : string,
        createTime ? : Date,
        actived ? : boolean,
        online ? : boolean,

        ip ? : string,
        port ? : number,
        username ? : string,
        password ? : string,
        serverId ? : number,
        /** 播放的视频服务 */
        playServerId ? : number,
        /** 通道号 */
        channelNo ? : number,
        /** 通道名 */
        channelName ? : string,
        /** 默认预置位 */
        defaultPreset ? : number,
        /** 厂商 */
        vendor ? : number,
        vendorName?: string
        /** 视频类型 */
        category ? : number,
        categoryName ? : string,
        /** 相机编码 */
        code ? : string,

        videoServer ? : VideoServer,
        serverName?: string
        playVideoServer ? : VideoServer,
        playServerName ?: string
}

export interface VideoVo {
    stationId ? : number,
        objectType ? : number,
        dataType ? : number,
        category ? : number,
        pageNum ? : number,
        pageSize ? : number
}