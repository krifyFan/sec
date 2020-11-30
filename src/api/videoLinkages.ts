import request from '../util/request'
import { VideoLinkages, VideoLinkagesVo } from '@/types/videoLinkages.interface'

/** 获取所有的视频联动 */
export function getVideoLinkages() {
    return request({
        url: 'videolinkages',
        method: 'get'
    })
}

/** 根据条件分页搜索视频联动 */
export function getPageVideoLinkages(data: VideoLinkagesVo) {
    return request({
        url: '/videolinkages_page',
        method: 'post',
        data: data
    })
}

/** 添加视频联动 */
export function addVideoLinkages(videoLinkages: VideoLinkages) {
    return request({
        url: 'videolinkages',
        method: 'post',
        data: videoLinkages
    })
}

/** 编辑视频联动 */
export function editVideoLinkages(videoLinkages: VideoLinkages) {
    return request({
        url: 'videolinkages_edit',
        method: 'post',
        data: videoLinkages
    })
}

/** 删除视频联动 */
export function deleteVideoLinkages(id: number) {
    return request({
        url: 'videolinkages_delete/' + id,
        method: 'get'
    })
}

/**
 * 对象导出
 */
export function exportVideoLinkages() {
    return request({
        url: '/videolinkages/export',
        method: 'post'
    })
}
