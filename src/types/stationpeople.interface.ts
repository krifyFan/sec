export interface StationPeople {
    id ? : number,
        stationId: number,
        objectId ? : number,
        employeeNo ? : number,
        employeeName: string,
        alarmId ? : number,
        /** 1：进站 2：出站 3：手动进站 4：手动出站 */
        type: number,
        inStation: boolean,
        time: Date,
        /** 时间戳 */
        timeStamp ? : number
}

export interface StationPeopleVo {
    pageNum ? : number,
        pageSize ? : number,
        stationId ? : number,
        stationIds ? : number[],
        objectId ? : number,
        employeeNo ? : string,
        type ? : number,
        startTime ? : Date,
        endTime ? : Date,
        inStation ? : boolean
}