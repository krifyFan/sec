export interface SchedulePatrol {
    /** id */
    id ? : number,
        /** 对象名 */
        objectName ? : string,
        /** 任务名 */
        name ? : string,
        /** 间隔时间 */
        interval ? : number,
        /** 点位数 */
        count?: number
}