import request from '../util/request'

export function getVersionInfo() {
    return request({
        url: '/projects',
        method: 'get'
    })
}