export interface VideoServer {
    id: number,
        name: string,
        stationId: number,
        stationName: string,
        objectType: number,
        objectTypeName: string,
        dataType: number,
        dataTypeName: string,
        equipmentId: number,
        equipmentName?: string
        createTime: Date,
        actived: boolean,
        online: boolean,

        portNum: number,
        ip: string,
        port: number,
        username: string,
        password: string,
        vendor: number,
        vendorName?: string
        /**
         * 支持告警
         */
        supportAlarm ? : boolean,
        /**
         * 支持录像
         */
        supportRecord ? : boolean,
        /**
         * 支持截图
         */
        supportCapture ? : boolean,
}