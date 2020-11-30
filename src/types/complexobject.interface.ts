import {
    MeasObject
} from './measobject.interface';

export interface ComplexObject {
    id: number,
        name ? : string,
        stationId ? : number,
        stationName ? : string,
        objectType ? : number,
        objectTypeName ? : string,
        dataType ? : number,
        dataTypeName ? : string,
        equipmentId ?: number
        equipmentName ? : string,
        createTime ? : Date,
        actived ? : boolean,
        online ? : boolean,

        value ? : string,
        children ? : Array < ComplexChild > ,
        measObjects ? : Array < MeasObject >
}

export interface ComplexChild {
    index ? : number,
        id ? : number,
        description ? : string
}