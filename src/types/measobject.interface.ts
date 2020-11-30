export interface MeasObject {
    id: number,
        name: string,
        stationId: number,
        stationName: string,
        objectType: number,
        objectTypeName: string,
        dataType: number,
        dataTypeName: string,
        equipmentSn?: string,
        equipmentId: number | null,
        equipmentName?: string | null
        createTime: Date,
        actived: boolean,
}

export interface MeasObjectVo {
    stationId ? : number,
        objectType ? : number,
        dataType ? : number,
        pageNum ? : number,
        pageSize ? : number
}