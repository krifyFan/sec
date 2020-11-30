import request from '../util/request'
import {PageQuery} from "@/types/pagequery.interface";

/** 分页获取系统信息 */
export function getPageInfo(param: PageQuery) {
    return request({
        url: 'systeminfo/page',
        method: 'post',
        data: param
    })
}
