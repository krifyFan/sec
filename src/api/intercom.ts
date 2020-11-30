import request from '../util/request'

/** 接听 */
export function answer(id: number) {
    return request({
        url: `intercom/${id}/answer`,
        method: 'get'
    })
}

/** 挂断 */
export function ringoff(id: number) {
    return request({
        url: `intercom/${id}/ringoff`,
        method: 'get'
    })
}

/** 拒绝 */
export function refuse(id: number) {
    return request({
        url: `intercom/${id}/refuse`,
        method: 'get'
    })
}

/** 开门 */
export function open(id: number) {
    return request({
        url: `intercom/${id}/open`,
        method: 'get'
    })
}

/** 获取所有的人员，异步 */
export function getCards(id: number) {
    console.log(id)
    return request({
        url: `intercom/${id}/cards`,
        method: 'get'
    })
}

/** 获取所有部门 */
export function getDepartments() {
    return request({
        url: 'departments',
        method: 'get'
    })
}

/** 发卡 */
export function setCard(id: number, data: any) {
    return request({
        url: `intercom/${id}/cards`,
        method: 'post',
        data
    })
}

/** 删卡 */
export function deleteCard(id: number, data: any) {
    return request({
        url: `intercom/${id}/cards_delete`,
        method: 'post',
        data
    })
}

// 开始通话
export function startTalk(id: any) {
    return request({
        url: `/Intercom/StartTalk/${id}`,
        method: 'get'
    })
}

// 结束通话
export function stopTalk(id: any) {
    return request({
        url: `/Intercom/StopTalk/${id}`,
        method: 'get'
    })
}

export function getFaceFile(data: any){
    return request({
        url: `/intercom/getFaceFile`,
        method: 'post',
        data
    })
}