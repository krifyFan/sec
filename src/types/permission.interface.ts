export interface Permission {
    id ? : number | null,
        name: string,
        description: string,
        pid: number,
}

/** 告警权限枚举，可弹出的告警 */
export enum AlarmPermission {
    // 视频告警 = "视频告警",
    // 可视对讲告警 = "可视对讲告警",
    // 周界入侵 = "周界入侵",
    // 高后果视频告警 = "高后果视频告警",
    // 火灾告警 = "火灾告警",
    // 激光对射 = "激光对射"
}