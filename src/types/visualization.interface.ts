export interface ModuleConfigInterface {
    id: number,
    value: string,
    position:　Position,
    sectionId?: number,
    groupId: number,
    groupList: Array< OptionItem >,
}

interface Position {
    width: number,
    height: number,
    x: number,
    y: number
}

export interface OptionItem {
    value: string,
    label: string
}