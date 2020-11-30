export interface Management {
    id: number,
        name: string,
        position: string,
        level: number,
        fatherId: number,
        fatherName: string,
        /** 是否为叶子 */
        leaf: boolean,
        map: string,
        icon: number,
        createTime: Date,
        /** 联系人 */
        contact: string,
        /** 联系电话 */
        telephone: string,
        /** 联系地址 */
        address: string,
}

export interface ManagementTree {
    id: number,
        name: string,
        position: string,
        level: number,
        fatherId: number,
        leaf: boolean,
        map: string,
        icon: number,
        children: ManagementTree[],
        /** 联系人 */
        contact: string,
        /** 联系电话 */
        telephone: string,
        /** 联系地址 */
        address: string,
}