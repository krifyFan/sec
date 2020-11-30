export interface MessageType {
    type: string,
        body: any
}

/** 消息同步类型 */
export interface MessageSyncDto {
    /** 对象id */
    objId: number,
        /** 告警id */
        alarmId: number,
        /** 类型：包括门禁接听、拒绝、挂断，告警清除等 */
        type: string,
        /** 身份认证 */
        token: string,
}


/** 告警类型枚举 */
export enum MessageTypeEnum {
    视频原始告警 = "VideoOriginAlarm",
    视频告警 = "VideoAlarm",
    
    周界告警 = "IntrusionAlarm",
    // 周界告警 = "LaserBeamAlarm",
    周界升级告警 = "IntrusionUpgradeAlarm",
    可视对讲告警 = "IntercomAlarm",
    人脸下载完成 = "IntercomGetFace",
    人脸设置完成 = "IntercomSetFace",
    所有卡片下载完成 = "IntercomGetAllCard",
    卡片设置完成 = "IntercomSetCard",
    卡片删除完成 = "IntercomDeleteCard",
    视频服务告警 = "VideoServerAlarm",
    清除告警 = "CleanAlarm",
    可视对讲断开连接 = "IntercomDisconnect",
    可视对讲原始告警 = "IntercomOriginAlarm",
    高后果区视频告警 = "HighRiskAlarm",
    火灾告警 = "FireAlarm",
    激光甲烷浓度告警 = "LaserMethaneConcentrationAlarm",
    激光甲烷设备告警 = "LaserMethaneAlarm",
    卡片获取完成 = "IntercomGetCard",
    场站人员改变 = "StationPeopleChange",
    消息同步 = "MessageSync",
    预置位巡检进度 = "VideoPatrolPresetProcess",
    激光对射 = "LaserBeamAlarm"
    // 激光对射 = "IntrusionAlarm"
}