export interface Station {
        id: number,
        name: string,
        position ? : string,
        managementId ? : number,
        managementName ? : string,
        icon ? : number,
        /** 网络地址 */
        netAddress ? : string,
        createTime ? : Date,
        /** 联系人 */
        contact ? : string,
        /** 联系电话 */
        telephone ? : string,
        /** 联系地址 */
        address ? : string,
        /** 是否在线 */
        online ?: boolean
}