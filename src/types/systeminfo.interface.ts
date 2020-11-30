export interface Systeminfo {
    id: number,
    cpuPercent: number,
    memoryTotal?: number,
    memoryAvailable?: number,
    memoryUsed?: number,
    memoryFree?: number,
    memoryUsedPercent?: number
    netSent?: number
    netRecv?: number
    createTime?: Date
}
