<template>
    <div>
        <h4>场站关联管理</h4>
        <div class='btnClass'>
            <Button type='info' icon='md-add' @click="addModel">新建</Button>
            <!-- <Button type='warning' icon='md-arrow-down'>导出</Button> -->
        </div>
        <Table border :columns="columns" :data="stationLinks">
            <template slot-scope="{ index }" slot="action">
                <Button type="success" size="small" style="margin-right: 5px" icon='md-create'
                    @click="edit(index)">编辑</Button>
                <Button type="error" size="small" icon='md-trash' @click="remove(index)">删除</Button>
            </template>
        </Table>
        <el-pagination style="text-align: right" :total="page.total"
            :current-page="page.current"
            layout="total, prev, pager, next, jumper" @current-change="currentChange"
            @size-change="pageSizeChange"></el-pagination>

        <Modal v-model="flag_add" title="新增" @on-ok="addOk" @on-cancel="addCancel">
            <Form :model="addItem" :label-width="120">
                <FormItem label="起始场站:">
                    <el-select v-model="addItem.source" filterable class="form-content-width">
                        <el-option v-for="station in stations" :value="station.id" :key="station.id"
                            :label="station.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="结束场站:">
                    <el-select v-model="addItem.target" filterable class="form-content-width">
                        <el-option v-for="station in stations" :value="station.id" :key="station.id"
                            :label="station.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="连接类型:">
                    <el-select  v-model="addItem.type"  class="form-content-width" >
                        <el-option v-for="item in lineStyles" :key="item.color" :label="item.color" :value="item.id">
                            <div :style="{height: '20px', width: '20px', background: item.color}">
                                <div style="margin-left: 25px">{{item.color}}</div>
                            </div>
                        </el-option>
                    </el-select>
                </FormItem>
            </Form>
        </Modal>
        <Modal v-model="flag_edit" title="编辑" @on-ok="editOk" @on-cancel="editCancel">
            <Form :model="editItem" :label-width="120">
                <FormItem label="起始场站:">
                    <el-select v-model="editItem.source" filterable class="form-content-width">
                        <el-option v-for="station in stations" :value="station.id" :key="station.id"
                            :label="station.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="结束场站:">
                    <el-select v-model="editItem.target" filterable class="form-content-width">
                        <el-option v-for="station in stations" :value="station.id" :key="station.id"
                            :label="station.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="连接类型:" >
                    <el-select  v-model="editItem.type"  class="form-content-width" >
                        <el-option v-for="item in lineStyles" :key="item.color" :label="item.color" :value="item.id"></el-option>
                    </el-select>
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue
    } from 'vue-property-decorator'
    import {
        Station
    } from '@/types/station.interface'
    import {
        StationLink
    } from '@/types/stationlink.interface'
    import {
        PageQuery
    } from '@/types/pagequery.interface'
    import {
        getStations,
    } from '@/api/station'
    import {
        getStationLinks,
        addStationLink,
        editStationLink,
        deleteStationLink,
        getPageInfo
    } from '@/api/stationlink'
import store from '@/store'
import { param } from 'jquery'

    @Component({})
    export default class StationClass extends Vue {
        stationLinks: StationLink[] = []
        stations: Station[] = []

        columns: any[] = [{
                title: 'ID',
                key: 'id',
                width: 100
            },
            {
                title: '起始场站',
                key: 'sourceName'
            },
            {
                title: '结束场站',
                key: 'targetName'
            },
            {
                title: '连接线颜色',
                key: 'type',
                render: (h, param) => {
                    let color = ''
                    let type = param.row.type
                    switch(type) {
                        case 1: {
                            color = '#DA251D'
                            break;
                        }
                        case 2: {
                            color = '#00923F'
                            break;
                        }
                        case 3: {
                            color = '#005CA1'
                            break;
                        }
                    }
                    return h('div', [
                        h('div', {
                            style: {
                                'width': '20px',
                                'height': '20px',
                                'background': color,
                                'display': 'inline-block'
                            }
                        }),
                        h('div', {
                            style: {
                                'display': 'inline-block',
                                'vertical-align': 'top',
                                'margin-left': '5px'
                            }
                        }, color)
                    ])
                    // return h(
                    //     'div', {
                    //     style: {
                    //         'width': '20px',
                    //         'height': '20px',
                    //         'background': color
                    //     }
                    // })
                }
            },
            {
                title: '操作',
                slot: 'action',
                width: 200,
                align: 'center'
            }
        ]

        /** 添加窗口是否弹出 */
        flag_add: boolean = false

        /** 待添加的场站对象 */
        addItem: StationLink = this.getDefaultItem()

        /** 编辑窗口是否弹出 */
        flag_edit: boolean = false

        /** 待编辑的场站对象 */
        editItem: StationLink = this.getDefaultItem()

        lineStyles: any[] =  this.$store.state.lineStyles

        /** 分页 */
        page: any = {
            total: 0,
            pageSize: 10,
            current: 1,
        }

        mounted() {
            this.initData()
        }

        initData() {
            let pageParam: PageQuery = {
                pageNum: this.page.current,
                pageSize: this.page.pageSize
            }

            Promise.all([getPageInfo(pageParam), getStations()]).then((res: any) => {
                if (res[0].data.code == 200) {
                    this.page.total = res[0].data.data.totalSize

                    this.stationLinks = res[0].data.data.content
                }
                // 筛选根节点的管理部门，场站只能与这样的管理部门挂钩
                if (res[1].data.code == 200) this.stations = res[1].data.data

                this.stationLinks.map((item: StationLink) => {
                    let tmp: Station | undefined = this.stations.find((s: Station) => item
                        .source == s.id)
                    item.sourceName = tmp ? tmp.name : "无"
                    let tmp2: Station | undefined = this.stations.find((s: Station) => item
                        .target == s.id)
                    item.targetName = tmp2 ? tmp2.name : "无"
                })
            })
        }

        currentChange(value: number) {
            this.page.current = value;
            this.initData();
        }

        pageSizeChange(value: number) {
            this.page.pageSize = value;
            this.initData();
        }

        getDefaultItem(): StationLink {
            return {
                id: 0,
                source: 0,
                sourceName: '',
                target: 0,
                targetName: '',
                type: 1
            }
        }

        /** 添加新对象 */
        addModel() {
            this.flag_add = true
        }

        edit(index: number) {
            this.flag_edit = true
            this.editItem = this.stationLinks[index]
        }

        remove(index: number) {
            deleteStationLink(this.stations[index].id).then((res: any) => {
                let {
                    code,
                    data
                } = res.data
                if (code == 200) {
                    this.initData()
                    this.$Message.success("删除成功！！！")
                } else {
                    this.$Message.info("删除出错！！！")
                }
            })
        }

        /** 添加场站 */
        addOk() {
            addStationLink(this.addItem).then((res: any) => {
                let {
                    code,
                    data
                } = res.data
                if (code == 200) {
                    this.flag_add = false
                    this.addItem = this.getDefaultItem()
                    this.initData()
                } else {
                    this.$Message.info("添加出错！！！")
                }
            })
        }

        /** 取消添加场站 */
        addCancel() {
            this.flag_add = false
            this.addItem = this.getDefaultItem()
        }

        /** 编辑场站 */
        editOk() {
            editStationLink(this.editItem).then((res: any) => {
                let {
                    code,
                    data
                } = res.data
                if (code == 200) {
                    this.flag_edit = false
                    this.initData()
                } else {
                    this.$Message.info("编辑出错！！！")
                }
            })
        }

        /** 取消编辑场站 */
        editCancel() {
            this.flag_edit = false
        }
    }
</script>

<style lang="less">
    
</style>