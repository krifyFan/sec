export interface VideoLinkages {
    id: number | null
    objId: number | null
    measobjName?: string | null
    startLocation: number | null
    endLocation: number | null
    videoId: number | null
    videoName?: string | null
    preset: number | null
    actived: boolean | null
}

export interface VideoLinkagesVo {
    pageNum ? : number,
    pageSize ? : number
}