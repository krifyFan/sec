export interface MeasObjectVal {
    id: number,
        name: string,
        stationId: number,
        stationName ? : string,
        objectType: number,
        objectTypeName ? : string,
        dataType: number,
        dataTypeName ? : string,
        equipmentSn ? : string,
        createTime ? : Date,
        actived ? : boolean,
        online ? : boolean,

        /** 最近一次值 */
        lastValue?: number,
        /** 最近一次时间 */
        lastTime?: Date,
        /** 是否有告警 */
        isAlarm?: boolean
}