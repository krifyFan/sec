<template>
    <div>
        <Row class="queryCondition">
            <Col span="8" class="select_item">
                <span class="query-label">视频：</span>
                <el-select class="query-content" v-model="patrolVideoId" placeholder="请选择" @change="videoChange">
                    <el-option v-for="item in patrolVideo" :key="item.id" :label="item.name" :value="item.id">
                    </el-option>
                </el-select>
            </Col>
            <Col span="8" class="select_item">
                <span class="query-label">巡检路径：</span>
                <el-select class="query-content" v-model="patrolVideoRouteId" placeholder="请选择">
                    <el-option v-for="item in patrolVideoRoute" :key="item.id" :label="item.name" :value="item.id">
                    </el-option>
                </el-select>
            </Col>
            <Col span="8" class="select_item">
                <span class="query-label">是否告警：</span>
                <el-select class="query-content" v-model="queryPrams.status" placeholder="请选择">
                    <el-option label="全部" :value="null"></el-option>
                    <el-option v-for="item in alarmStatus" :key="item.value" :label="item.key" :value="item.value">
                    </el-option>
                </el-select>
            </Col>
            <Col span="8" class="select_item">
                <span class="query-label">开始时间：</span>
                <el-date-picker class="query-content" v-model="queryPrams.startTime" type="date" placeholder="选择日期">
                </el-date-picker>
            </Col>
            <Col span="8" class="select_item">
                <span class="query-label">结束时间：</span>
                <el-date-picker class="query-content" v-model="queryPrams.endTime" type="date" placeholder="选择日期">
                </el-date-picker>
            </Col>
            <Col span="8" class="select_item">
                <Button icon="ios-search" @click="queryVideoPatrolData" class="search-btn" style="margin-left: 49%">查询</Button>
            </Col>

        </Row>
        <div>
            <Table border ref="selection" :columns="partolDetailData.columns" :data="partolDetailData.detail" class="detailTable">
                <template slot-scope="{ row }" slot="option">
                    <Button class="details-btn" @click="showDetail(row.id)">详情</Button>
                </template>
            </Table>
            <div class="page-wrap">
            <el-pagination @size-change="pageSizeChange" @current-change="currentChange" :current-page.sync="partolDetailData.page.current" :page-sizes="[10, 20, 50]" :page-size="partolDetailData.page.pageSize" layout="total, sizes, prev, pager, next" :total="partolDetailData.page.total">
            </el-pagination>
            </div>
        </div>
        <Modal class="base-info-modal query-alarm-dialog patrol-details-dialog" v-model="patrolHisDetail.showPatrolHisModal" title="巡检详情" width="60%" footer-hide>
            <Table border :columns="patrolHisDetail.columns" :data="patrolHisDetail.historyDetail" class="historyTable">
                 <template slot-scope="{ row }" slot="detail">
                    <span v-if="row.alarmId === 0">暂无</span>
                    <a v-else @click="goDetailPage">详情</a>
                </template>
                <template slot-scope="{ row }" slot="img" style="height: 100px">
                    <ImageFromPath :path="row.path" ></ImageFromPath>
                </template>
            </Table>
            <div class="page-wrap">
                <el-pagination @current-change="currentChangeHis"
                    :current-page.sync="patrolHisDetail.page.current"
                    :page-size="patrolHisDetail.page.pageSize" layout="total, prev, pager, next"
                    :total="patrolHisDetail.page.total">
                </el-pagination>
            </div>
    
        </Modal>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
        Prop
    } from "vue-property-decorator";
    import {
        AlarmVo,
    } from "@/types/alarm.interface";
    import {
        getPatrolByStation,
    } from '@/api/schedule'
    import {
        getVideoPatrolDeByCondition,
        getVideoPatrolHisByCondition
    } from "@/api/video";
    import ImageFromPath from '@/components/Image/ImageFromPath.vue'
    @Component({
        components: {
            ImageFromPath
        },
    })
    export default class VideoPatrolDetailModal extends Vue {
        @Prop({
            required: false,
            default: () => {
                return {
                    pageNum: 1,
                    pageSize: 10,
                };
            },
        })
        queryPrams: AlarmVo;

        partolDetailData: any = {
            columns: [{
                    type: "selection",
                    width: 60,
                    align: "center",
                },
                {
                    title: "巡检编号",
                    key: "id",
                    width: 100,
                    align: 'center'
                },
                {
                    title: "视频对象",
                    key: "objectName",
                    width: 120,
                    align: 'center'
                },
                {
                    title: "巡检路径",
                    key: "scheduleName",
                    align: 'center'
                    // width: 100,
                },
                {
                    title: "是否告警",
                    key: "alarmType",
                    align: 'center',
                    render: (h: any, params: any) => {
                        return h("div", params.row.status === true ? '是' : '否');
                    },
                    width: 100,
                },
                {
                    title: "开始时间",
                    key: "time",
                    align: 'center',
                    render: (h: any, params: any) => {
                        return h(
                            "div",
                            new Date(params.row.startTimeStamp).format(
                                "yyyy-MM-dd hh:mm:ss"
                            )
                        );
                    },
                    // width: 160,
                },
                {
                    title: "结束时间",
                    key: "time",
                    align: 'center',
                    render: (h: any, params: any) => {
                        return h(
                            "div",
                            new Date(params.row.endTimeStamp).format(
                                "yyyy-MM-dd hh:mm:ss"
                            )
                        );
                    },
                    // width: 160,
                },
                {
                    title: "操作",
                    slot: "option",
                    width: 160,
                    align: 'center'
                },
            ],
            detail: [],
            page: {
                total: 0,
                pageSize: 10,
                current: 1,
            },
            
        }
        patrolHisDetail: any = {
            columns: [{
                    title: "点位编号",
                    key: "id",
                    align: 'center'
                },
                {
                    title: "告警详情",
                    align: 'center',
                    slot: 'detail'
                },
                {
                    title: "巡检时间",
                    key: "time",
                    align: 'center',
                    render: (h: any, params: any) => {
                        return h(
                            "div",
                            new Date(params.row.time).format(
                                "yyyy-MM-dd hh:mm:ss"
                            )
                        );
                    },
                },
                {
                    title: "图片",
                    slot: "img",
                    align: 'center',
                    with: 120
                },
            ],
            historyDetail: [],
            page: {
                total: 0,
                pageSize: 4,
                current: 1,
            },
            showPatrolHisModal: false
        }
        /** 巡检视频ID */
        patrolVideoId: string = '0'
        /** 巡检路径ID */
        patrolVideoRouteId: string = '0'

        patrolVideo: any[] = [{
            id: '0',
            name: '全部'
        }]

        patrolVideoRoute: any[] = [{
            id: '0',
            name: '全部'
        }]

        alarmStatus: any[] = [
            {
                value: true,
                key: '是'
            },
            {
                value: false,
                key: '否'
            },
            // {
            //     key: null,
            //     value: '请选择'
            // }
        ]

        hash: any = {}
        videoPatrolList: any[] = []

        patrolId: number = -1

        get stationId() {
            return this.$store.state.stationId
        }


        mounted() {
            this.init();
        }

        async init() {

            let {
                data: {
                    code,
                    data
                }
            } = await getPatrolByStation(this.stationId)

            if (code == 200) {

                this.patrolVideo.splice(1)
                this.patrolVideoRoute.splice(1)
                /** 缓存所有巡检路径 */
                this.videoPatrolList = data

                data.forEach((routeItem: any) => {
                    /** 利用hash判断巡检视频 */
                    if (!(routeItem.objectId in this.hash)) {

                        this.hash.objectId = true
                        this.patrolVideo.push({
                            name: routeItem.objectName,
                            id: routeItem.objectId,
                        })
                    }
                    /** 巡检路径 */
                    this.patrolVideoRoute.push({
                        id: routeItem.id,
                        name: routeItem.name
                    })
                })
            }

            await this.queryVideoPatrolData()

        }

        queryVideoPatrolData() {
            let {
                patrolVideoId,
                patrolVideoRouteId,
                partolDetailData
            } = this

            let params: any = {
                objectId: parseFloat(patrolVideoId) || null,
                scheduleId: parseFloat(patrolVideoRouteId) || null,
                pageNum: partolDetailData.page.current,
                pageSize: partolDetailData.page.pageSize,
                startTime: this.queryPrams.startTime ? this.queryPrams.startTime : null,
                endTime: this.queryPrams.endTime ? this.queryPrams.endTime : null,
                status: this.queryPrams.status
            };

            getVideoPatrolDeByCondition(params)
                .then((res) => {
                    let {
                        code,
                        data
                    } = res.data;
                    if (code != 200) return;
                    partolDetailData.page.total = data.totalSize;
                    partolDetailData.detail = data.content;
                })
                .finally(() => {});
        }

        videoChange() {
            this.patrolVideoRoute.splice(1)
            this.patrolVideoRouteId = '0'
            this.videoPatrolList.forEach((routeItem: any) => {
                if (this.patrolVideoId === '0' || routeItem.objectId === this.patrolVideoId) {
                    this.patrolVideoRoute.push({
                        id: routeItem.id,
                        name: routeItem.name
                    })
                }
            })
        }

        async showDetail(patrolId: number) {
            this.patrolId = patrolId
            let { patrolHisDetail } = this
            let param = {
                patrolId: this.patrolId,
                pageNum: this.patrolHisDetail.page.current,
                pageSize: this.patrolHisDetail.page.pageSize
            }
            let {  data: {  code, data } } = await getVideoPatrolHisByCondition(param)

            if (code === 200) {
                patrolHisDetail.historyDetail = data.content
                patrolHisDetail.showPatrolHisModal = true
                patrolHisDetail.page.total = data.totalSize
            }

        }

        goDetailPage(){
            console.log('goDetailPage')
        }

        translateImg(path: string){
            console.log(path)
        }

        // 分页
        currentChange(value: number) {
            this.partolDetailData.page.current = value;
            this.queryVideoPatrolData();
        }

        pageSizeChange(value: number) {
            this.partolDetailData.page.pageSize = value;
            this.queryVideoPatrolData();
        }

        // 巡检详情分页
        currentChangeHis(value: number) {
            this.patrolHisDetail.page.current = value
            this.showDetail(this.patrolId)
        }
    }
</script>

<style lang="less">
    .queryCondition {
        padding: 10px;
        .search-btn {
            // border: none;
            // color: #ffffff;
            // font-size: 18px;
            background-color: #06D5F7;
            // margin-top: 0;
            // margin-left: 49%;
        }

    }
    // 表格中的详情按钮
    .ivu-table-tbody {
        .ivu-table-row {
            .ivu-table-cell {
                .ivu-btn {
                    background-color: #419BFF;
                    font-size: 14px;
                    color: #ffffff;
                    border: none
                }
            }
        }
    }

    .patrol-details-dialog {
        .ivu-table-cell-slot {
            padding: 10px 0;
            margin: 0 auto;
        }
        .img-wrap {
            height: 120px !important;
        }
        .ivu-modal-body {
            padding: 10px;
        }
    }
</style>