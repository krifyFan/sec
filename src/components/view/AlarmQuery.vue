<template>
    <div class="alarm-query-wrap">
        <div class="left-tree-wrap">
            <div v-for="(item, index) in menuData" :key="item.id" class="normal-menu">
                <img :src="item.iconActive" >
                <div class="menu-name" @click="choosedMenu(item, index)">{{item.name}}</div>
            </div>
        </div>
        <div class="content-wrap">
            <div v-if="currentPage==='告警查询'">
                <Row class="queryCondition">
                    <Col span="6" class="select_item">
                        <span class="query-label">告警设备：</span>
                        <el-select class="query-content" v-model="queryPrams.objId" placeholder="请选择">
                            <!-- <el-option label="全部" :value="null"></el-option> -->
                            <el-option v-for="item in measobjs" :key="item.id" :label="item.name" :value="item.id">
                            </el-option>
                        </el-select>
                    </Col>
                    <Col span="6" class="select_item">
                        <span class="query-label">设备类型：</span>
                        <el-select class="query-content" v-model="queryPrams.equipmentType" placeholder="请选择">
                            <el-option label="全部" :value="null"></el-option>
                            <el-option v-for="item in equipmentTypes" :key="item.key" :label="item.key" :value="item.val">
                            </el-option>
                        </el-select>
                    </Col>
                    <Col span="6" class="select_item">
                        <span class="query-label">告警状态：</span>
                        <el-select class="query-content" v-model="queryPrams.cleaned" placeholder="请选择">
                            <el-option label="全部" :value="null"></el-option>
                            </el-option>
                            <el-option v-for="item in alarmStates" :key="item.key" :label="item.key" :value="item.val">
                            </el-option>
                        </el-select>
                    </Col>
                    <Col span="6" class="select_item">
                        <span class="query-label">告警级别：</span>
                        <el-select class="query-content" v-model="queryPrams.level" placeholder="请选择">
                            <el-option label="全部" :value="null"></el-option>
                            <el-option v-for="item in alarmLevels" :key="item.key" :label="item.key" :value="item.val">
                            </el-option>
                        </el-select>
                    </Col>
                    <Col span="6" class="select_item">
                        <span class="query-label">开始时间：</span>
                        <el-date-picker class="query-content" v-model="queryPrams.startTime" type="date" placeholder="选择日期">
                        </el-date-picker>
                    </Col>
                    <Col span="6" class="select_item">
                        <span class="query-label">结束时间：</span>
                        <el-date-picker class="query-content" v-model="queryPrams.endTime" type="date" placeholder="选择日期">
                        </el-date-picker>
                    </Col>
                    <Col span="6">
                        <div class="btn-wrap">
                            <Button icon="ios-search" @click="queryAlarmData" class="search-btn">查询</Button>
                            <Button icon="md-download" @click="downloadAlarms" class="download-btn">导出</Button>
                        </div>
                    </Col>
                    <Col span="6">
                        <div class="btn-wrap">
                            <Button icon="md-checkmark" @click="clearAlarms" class="confirm-btn">确认</Button>
                            <Button icon="ios-trash-outline" @click="cleanDetail()" class="delete-btn">删除</Button>
                        </div>
                    </Col>
                </Row>
                <div>
                    <Table border ref="selection" :columns="alarmData.columns" :data="alarmData.alarms" class="alarmTable">
                        <template slot-scope="{ row }" slot="cleaned">
                            <Icon type="ios-checkmark-circle" :class="{ actived: row.cleaned }"/>
                        </template>
                        <template slot-scope="{ row, index }" slot="option">
                            <Button class="details-btn" @click="showDetail(row, index)">
                                详情
                            </Button>
                        </template>
                    </Table>
                    <div class="page-wrap">
                        <el-pagination @size-change="pageSizeChange" @current-change="currentChange"
                            :current-page.sync="alarmData.page.current" :page-sizes="[10, 20, 50]"
                            :page-size="alarmData.page.pageSize" layout="total, sizes, prev, pager, next"
                            :total="alarmData.page.total">
                        </el-pagination>
                    </div>
                </div>
            </div>
            <div v-if="currentPage==='巡检记录'">
                <VideoPatrolDetailModal :queryPrams="alarmVideoVo"></VideoPatrolDetailModal>
            </div>
        </div>

        <!-- 告警详细信息模态框 -->
        <Modal v-model="showDetailModel" title="告警详情" width="45%" class="detailModel query-alarm-dialog"
            footer-hide>
            <AlarmDetails :DetailModelData="DetailModelData" :isShow="showDetailModel"/>
        </Modal>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
        Prop, Emit
    } from "vue-property-decorator";
    import {
        AlarmVo,
        Alarm
    } from "@/types/alarm.interface";
    import {
        getAlarmsByCondition,
        getDefaultAlarm,
        getVideoPathOfAlarm,
        cleanAlarm,
        downloadExcel,
        getCountByCondition,
        deleteAlarm
    } from "@/api/alarm";
    import {
        Station
    } from "@/types/station.interface";
    import {
        EnumType
    } from "@/types/enumtype.interface";
    import {
        getDate,
        getTime
    } from "@/api/date";
    import {
        Video
    } from "@/types/video.interface";
    import {
        getManagementTree,
        getDefaultManagementTree
    } from '@/api/management'
    import {
        ManagementTree
    } from '@/types/management.interface'
    import {
        CSVDownload
    } from "@/util/csvdownload";
    import AlarmImage from "@/components/view/AlarmImage.vue";
    import VideoComponent from "@/components/Video/CommonVideo.vue";
    import request from '@/util/request'
    import VideoPatrolDetailModal from "@/components/view/VideoPatrolDetailModal.vue";
    import { getMeasObjects } from '@/api/measobject'
    import AlarmDetails from './AlarmDetails.vue'

    @Component({
        components: {
            AlarmImage,
            VideoComponent,
            VideoPatrolDetailModal,
            AlarmDetails
        },
    })
    export default class AlarmQuery extends Vue {
        showDetailModel: Boolean = false; //告警详情模态框

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

        alarmNormal:string = require('@/assets/images/alarm-record-normal.png')
        alarmActive:string = require('@/assets/images/alarm-record-active.png')

        patrolActive:string = require('@/assets/images/patrol-record-active.png')

        menuData: any[] = [
            { id: 1, name: '告警查询', iconNormal: this.alarmNormal, iconActive: this.alarmActive },
            { id: 2, name: '巡检记录', iconNormal: this.patrolNormal, iconActive: this.patrolActive }
        ]

        currentPage:string = "告警记录"

        currentIndex:number = 0

        alarmQuery 

        // 告警数据
        alarmData: any = {
            columns: [
                {
                    type: "selection",
                    width: 60,
                    align: "center",
                },
                {
                    title: "告警编号",
                    key: "id",
                    width: 90,
                },
                {
                    title: "告警对象",
                    key: "objectName",
                    width: 120,
                },
                {
                    title: "告警类型",
                    key: "alarmType",
                    render: (h: any, params: any) => {
                        return h("div", params.row.alarmType.name);
                    },
                    width: 90,
                },
                {
                    title: "告警等级",
                    key: "levelName",
                    width: 90,
                },
                {
                    title: '告警源',
                    key: 'source',
                    width: 90
                },
                {
                    title: "描述",
                    key: "description",
                },
                {
                    title: "已确认",
                    key: "cleaned",
                    slot: "cleaned",
                    width: 80,
                    align: 'center'
                },
                {
                    title: "时间",
                    key: "time",
                    align: 'center',
                    render: (h: any, params: any) => {
                        return h(
                            "div",
                            new Date(params.row.timeStamp).format(
                                "yyyy-MM-dd hh:mm:ss"
                            )
                        );
                    },
                    width: 160,
                },
                {
                    title: "操作",
                    slot: "option",
                    width: 100,
                    align: 'center'
                },
            ],
            alarms: [],
            page: {
                total: 0,
                pageSize: 10,
                current: 1,
            },
        };
        // 告警详情数据
        DetailModelData: Alarm = getDefaultAlarm();
        // 告警详情视频
        // detailVideo: Video = getDefaultVideo();

        /** 告警设备 */
        measobjs: any[] = [
            {
                id: null,
                name: '全部'
            }
        ]
        /** 告警状态 */
        alarmStates: any[] = [
            {
                key: "未确认",
                val: false,
            },
            {
                key: "已确认",
                val: true,
            },
        ];
        /** 对象类型 */
        // objectTypes: EnumType[] = this.$store.state.objectType;
        /** 告警级别 */
        alarmLevels: EnumType[] = this.$store.state.alarmLevel;
        /** 设备类型 */
        equipmentTypes: EnumType[] = this.$store.state.equipmentType
        /** 是否正在回放 */
        isPlayback: boolean = false;

        /** 后端访问地址 */
        url: string = '/file'

        /** 巡检记录 */
        alarmVideoVo: AlarmVo = {
            pageNum: 1,
            pageSize: 10,
            cleaned: null,
            status: null
        };

        @Emit('change-menu')
        chooseMenu(menuName){}

        mounted() {
            if (this.queryPrams.pageNum)
                this.alarmData.page.current = this.queryPrams.pageNum;
            if (this.queryPrams.pageSize)
                this.alarmData.page.pageSize = this.queryPrams.pageSize;
            this.choosedMenu(this.menuData[0], 0)
            this.getMeasObjects()
        }

        choosedMenu(menu, index) {
            this.currentPage = menu.name
            this.currentIndex = index
            this.chooseMenu(menu.name)
        }

        getMeasObjects() {
            getMeasObjects().then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    this.measobjs = this.measobjs.concat(data)
                }
            })
        }

        clearQueryVo() {
            this.queryPrams.objId = null;
            this.queryPrams.type = null;
            this.queryPrams.cleaned = null;
            this.queryPrams.level = null;
            this.queryPrams.startTime = null;
            this.queryPrams.endTime = null;
            this.queryPrams.equipmentType = null
        }

        queryAlarmData() {

            let params: AlarmVo = {
                pageNum: this.alarmData.page.current,
                pageSize: this.alarmData.page.pageSize,
                objId: this.queryPrams.objId && this.queryPrams.objId > 0 ? this.queryPrams.objId : null,
                level: this.queryPrams.level && this.queryPrams.level > 0 ? this.queryPrams.level : null,
                type: this.queryPrams.type && this.queryPrams.type > 0 ? this.queryPrams.type : null,
                equipmentType: this.queryPrams.equipmentType && this.queryPrams.equipmentType > 0 ? this.queryPrams.equipmentType : null,
                cleaned: typeof this.queryPrams.cleaned === "boolean" ? this.queryPrams.cleaned : null,
                startTime: this.queryPrams.startTime ? this.queryPrams.startTime : null,
                endTime: this.queryPrams.endTime ? this.queryPrams.endTime : null,
            };
            getAlarmsByCondition(params)
                .then((res) => {
                    let {
                        code,
                        data
                    } = res.data;
                    if (code != 200) return;
                    this.alarmData.page.total = data.totalSize;
                    this.alarmData.alarms = data.content;
                })
                .finally(() => {});
        }

        clearAlarms() {
            let ele: any = this.$refs.selection;
            let selectAlarms: Alarm[] = ele.getSelection();

            if (selectAlarms.length === 0) {
                this.$Message.warning('请选择要清除的数据！')
            } else {
                let requests: any[] = [];
                for (let i = 0; i < selectAlarms.length; i++) {
                    requests.push(cleanAlarm(selectAlarms[i].id));
                }
    
                Promise.all(requests).then((res: any) => {
                    this.$Message.info("清除成功！");
                    this.queryAlarmData();
                });
            }

        }

        /** 告警下载 */
        downloadAlarms() {
            let params: AlarmVo = {
                stationId: this.queryPrams.stationId && this.queryPrams.stationId > 0 ?
                    this.queryPrams.stationId : null,
                level: this.queryPrams.level && this.queryPrams.level > 0 ?
                    this.queryPrams.level : null,
                type: this.queryPrams.type && this.queryPrams.type > 0 ?
                    this.queryPrams.type : null,
                cleaned: typeof this.queryPrams.cleaned === "boolean" ?
                    this.queryPrams.cleaned : null,
                startTime: this.queryPrams.startTime ?
                    this.queryPrams.startTime : null,
                endTime: this.queryPrams.endTime ? this.queryPrams.endTime : null,
            };

            getAlarmsByCondition(params).then((res: any) => {
                if (res.data.code != 200) return;

                let alarms: Alarm[] = res.data.data;

                let fields: string[] = [
                    "所属场站",
                    "告警时间",
                    "告警对象",
                    "对象编号",
                    "告警类型",
                    "告警级别",
                    "描述",
                    "是否已清除",
                    "告警源",
                ];
                let rows: any[] = [];
                alarms.forEach((alarm: Alarm) => {
                    rows.push({
                        所属场站: alarm.stationName,
                        告警时间: new Date(alarm.timeStamp).format(
                            "yyyy-MM-dd hh:mm:ss"
                        ),
                        告警对象: alarm.objectName,
                        对象编号: alarm.objId,
                        告警类型: alarm.alarmType ? alarm.alarmType.name : "",
                        告警级别: alarm.levelName,
                        描述: alarm.description,
                        是否已清除: alarm.cleaned ? "是" : "否",
                        告警源: alarm.source,
                    });
                });
                downloadExcel(params).then(res => {
                    let { code, data } = res.data
                    if (code === 200) {
                        if (data.length > 0) {
                            let index=data.lastIndexOf("\\");
                            let fileName=data.substring(index+1,data.length);
                            request({
                                url: this.url,
                                method: 'post',
                                data: {
                                    path: data
                                },
                                responseType: 'blob'
                            }).then((response: any) => {
                                var link = document.createElement('a');
                                link.download = fileName
                                let href = window.URL.createObjectURL(response.data)
                                link.href = href
                                
                                document.body.append(link)
                                link.click();
                                document.body.removeChild(link)
                            })
                        }
                    }
                })
            });
        }

        // 分页
        currentChange(value: number) {
            this.alarmData.page.current = value;
            this.queryAlarmData();
        }

        pageSizeChange(value: number) {
            this.alarmData.page.pageSize = value;
            this.queryAlarmData();
        }

        // 点击详情
        showDetail(row, index) {
            this.DetailModelData = row;
            this.showDetailModel = true;
        }

        /** 清除告警 */
        cleanDetail() {
            let ele: any = this.$refs.selection;
            let selectAlarms: Alarm[] = ele.getSelection();

            if (selectAlarms.length === 0) {
                this.$Message.warning('请选择要删除的数据！')
            } else {
                this.$Modal.confirm({
                    title: '删除告警信息',
                    content: '<p>确定要删除告警信息吗？</p>',
                    onOk: () => {
                        let requests: any[] = [];
                        for (let i = 0; i < selectAlarms.length; i++) {
                            requests.push(deleteAlarm(selectAlarms[i].id));
                        }
            
                        Promise.all(requests).then((res: any) => {
                            this.$Message.info("删除成功！");
                            this.queryAlarmData();
                        });
                    }
                })
            }
            
        }
    }
</script>

<style lang="less">
.alarm-query-wrap {
    display: flex;
    height: 100%;
    .left-tree-wrap {
        flex: 1;
        margin-right: 10px;
        padding: 10px;
        img {
            vertical-align: middle;
            width: 1.4rem;
            margin-right: 0.4rem;
        }
        .menu-name {
            cursor: pointer;
            line-height: 2;
            font-weight: 700;
            display: inline-block;
            color: #ffffff;
        }
        .normal-menu {
            line-height: 3;
        }
    }
    .content-wrap {
        flex: 9;
        border-left: 1px solid #01fbf6;
        padding: 0 10px;
    }

    .ivu-btn {
        border: none;
        color: #ffffff;
        font-size: 18px;
    }

    .btn-wrap {
        width: 71.5%;
        margin-left: 1.4rem;
        button:nth-child(2) {
            float: right;
        }
        .search-btn {
            background-color: #06D5F7;
        }
        .download-btn {
            background-color: #EA7052;
        }
        .confirm-btn {
            background-color: #316AE9;
        }
        .delete-btn {
            background-color: #E74A4A;
        }
    }
}
.queryCondition {
    padding: 10px 10px 0;

    // 筛选条件的搜索和删除按钮
    .select_item {
        margin-bottom: 10px;
        .query-label {
            width: 5.5rem;
            display: inline-block;
            text-align: right;
            color: #ffffff;
        }

        .query-content {
            display: inline-block;
            width: 50%;
        }
        .ivu-input,
        .el-input__inner {
            background-color: #fff0;
            color: #ffffff;
        }

        .textarea-input {
            width: 83.5%;
            vertical-align: top;
        }
    }
}

// 日期
.el-date-table td.current:not(.disabled) span,
.el-date-table td.available:hover {
    background-color: #36e5ff;
    color: #fff;
}

.el-date-table td.today span,
.el-date-picker__header-label.active,
.el-date-picker__header-label:hover,
.el-picker-panel__icon-btn:hover {
    color: #36e5ff;
}

.ivu-icon.ivu-icon-ios-checkmark-circle {
    font-size: 2rem;
}

// 已清除图标
.actived {
    &::before {
        color: #2d8cf0;
        font-size: 2rem;
    }
}

.alarmTable {
    width: 100%;
    height: 100% !important;
}

// 表格中复选框
.ivu-checkbox-checked .ivu-checkbox-inner {
    border-color: #36e5ff;
    background-color: #36e5ff;
}

// 表格中的详情按钮
.alarmTable.ivu-table-wrapper {
    position: static !important;

    .ivu-table-tbody {
        .ivu-table-row {
            .ivu-table-cell {
                .ivu-btn {
                    background-color: #419BFF;
                    font-size: 14px;
                }
            }
        }
    }
}

// 分页
.el-pager li.active,
.el-pager li:hover,
.el-pagination button:hover,
.el-select-dropdown__item.selected,
.el-select .el-input__inner:focus,
.el-select .el-input.is-focus .el-input__inner,
.el-pagination__sizes .el-input .el-input__inner:hover,
.el-input.is-active .el-input__inner,
.el-input__inner:focus {
    color: #36e5ff;
    border-color: #36e5ff;
}

.alarmDialog {
    .ivu-modal-body {
        height: 100% !important;
    }
}

</style>