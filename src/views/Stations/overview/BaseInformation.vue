<template>
    <div class="number_of_alarms">
        <h4>基本信息</h4>
        <div class="content">
            <div class="child" @click="alarmClick">
                <div class="top">
                    <img :src="alarmNumberImg">
                    <span>活动告警</span>
                </div>
                <div class="bottom">
                    {{alarmNum}}
                </div>
            </div>
            <div class="child" @click="peopleClick">
                <div class="top person">
                    <img :src="stationNumberImg">
                    <span>场站人数</span>
                </div>
                <div class="bottom">
                    {{peopleNum}}
                </div>
            </div>
            <div class="child" @click="equipClick">
                <div class="top equip">
                    <img :src="equipmentNumberImg">
                    <span>设备数量</span>
                </div>
                <div class="bottom">
                    {{equipmentNum}}
                </div>

            </div>
        </div>
        <!-- 场站人数 -->
        <Modal v-model="modelData1.show" class="base-info-modal base-info-people-modal query-alarm-dialog" width="40%" footer-hide>
            <p slot="header">{{ modelData1.title }}</p>
            <div style="text-align:right">
                <Table border :columns="modelData1.columns" :data="modelData1.data">
                    <template slot-scope="{ row }" slot="image">
                        <div style="width:70%;height:70%;margin: 5px auto">
                            <alarm-image :alarm="row.alarm"></alarm-image>
                        </div>
                    </template>
                </Table>
                <div class="page-wrap">
                    <el-pagination @size-change="peoplePageSizeChange" @current-change="peopleCurrentChange"
                        :current-page.sync="modelData1.page.current" :page-sizes="[10, 20, 50]"
                        :page-size="modelData1.page.pageSize" layout="total, prev, pager, next"
                        :total="modelData1.page.total">
                    </el-pagination>
                </div>
            </div>
            <div slot="footer" style="text-align:right">
                <Button type="primary" @click="modelData1.show = false">关闭</Button>
            </div>
        </Modal>
        <!-- 活动告警 -->
        <Modal v-model="modelData2.show" class="base-info-modal base-info-alarm-modal query-alarm-dialog" width="900" footer-hide>
            <p slot="header">{{ modelData2.title }}</p>
            <div style="text-align:right">
                <Table border :columns="modelData2.columns" :data="modelData2.alarms"></Table>
                <div class="page-wrap">
                    <el-pagination @size-change="alarmPageSizeChange" @current-change="alarmCurrentChange"
                        :current-page.sync="modelData2.page.current" :page-sizes="[10, 20, 50]"
                        :page-size="modelData2.page.pageSize" layout="total, sizes, prev, pager, next"
                        :total="modelData2.page.total">
                    </el-pagination>
                </div>
            </div>
            <div slot="footer" style="text-align:right">
                <Button type="primary" @click="modelData2.show = false">关闭</Button>
            </div>
        </Modal>
        <Modal v-model="modelData3.show" class="base-info-modal query-alarm-dialog" width="800" footer-hide>
            <EqupmentGraph ref="equip" :width="800" :height="600"></EqupmentGraph>
            <div slot="footer" style="text-align:right">
                <Button type="primary" @click="modelData3.show = false">关闭</Button>
            </div>
        </Modal>
        <Modal title="告警详情" v-model="showDetails" width="45%" footer-hide class="detailModel query-alarm-dialog"> 
            <AlarmDetails :DetailModelData="detailsData" :isShow="showDetails"/>
        </Modal>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue
    } from "vue-property-decorator"
    import {
        EChartOption,
        ECharts
    } from "echarts";
    import {
        getCountByCondition as getPeopleCountByCondition,
        getStationPeoplesByCondition
    } from "@/api/stationpeople"
    import {
        getCountByCondition as getAlarmCountByCondition,
        getAlarmsByCondition,
        cleanAlarm,
        getDefaultAlarm
    } from "@/api/alarm";
    import {
        getPageInfo as getNetSpeed
    } from '@/api/systeminfo'
    import {
        StationPeople,
        StationPeopleVo
    } from "@/types/stationpeople.interface"
    import {
      Alarm,
        AlarmVo
    } from "@/types/alarm.interface";
    import {
        Systeminfo
    } from '@/types/systeminfo.interface'
    import AlarmImage from "@/components/view/AlarmImage.vue";
    import {
        getEquipments
    } from '@/api/equipment'
    import EqupmentGraph from '@/views/Stations/systemMonitor/EquipmentGraph.vue'
    import AlarmDetails from '@/components/view/AlarmDetails.vue'

    @Component({
        components: {
            AlarmImage,
            EqupmentGraph,
            AlarmDetails
        }
    })
    export default class NumberOfAlarms extends Vue {

        myChart!: ECharts;

        stationId: number = 0;

        peopleNum: number = 0
        alarmNum: number = 0
        equipmentNum: number = 0


        vo1: StationPeopleVo = {
            stationId: this.$store.state.stationId,
            inStation: true
        }

        vo2: AlarmVo = {
            stationId: this.$store.state.stationId,
            cleaned: false
        }

        // 人员对话框内的参数
        modelData1: any = {
            show: false,
            title: "",
            columns: [{
                    title: "工号",
                    key: "employeeNo",
                    width: 100,
                },
                {
                    title: "姓名",
                    key: "employeeName",
                    width: 100,
                },
                {
                    title: "进场时间",
                    key: "time",
                    render: (h: any, params: any) => {
                        return h(
                            "div",
                            new Date(params.row.timeStamp).format("yyyy-MM-dd hh:mm:ss")
                        );
                    },
                },
                {
                    title: '图片',
                    slot: 'image',
                    width: 200,
                    align: 'center'
                }
            ],
            stationId: 0,
            data: [],
            page: {
                total: 0,
                pageSize: 5,
                current: 1,
            },
        }

        // 告警对话框内的参数
        modelData2: any = {
            show: false,
            title: "",
            columns: [{
                    title: "对象编号",
                    key: "objId",
                },
                {
                    title: "对象名称",
                    key: "objectName",
                },
                {
                    title: "告警级别",
                    key: "levelName",
                },
                {
                    title: "告警类型",
                    key: "alarmType",
                    render: (h: any, params: any) => {
                        return h("div", params.row.alarmType.name);
                    },
                },
                {
                    title: "时间",
                    key: "time",
                    width: 150,
                    align: 'center',
                    render: (h: any, params: any) => {
                        return h(
                            "div",
                            new Date(params.row.timeStamp).format(
                                "yyyy-MM-dd hh:mm:ss"
                            )
                        );
                    },
                },
                {
                    title: "描述",
                    key: "description",
                    width: 200
                },
                {
                    title: "确认",
                    slot: "cleaned",
                    width: 70,
                    align: 'center',
                    render: (h: any, params: any) => {
                        return h('div', [
                            h('Button', {
                                props: {
                                    type: 'info',
                                    size: 'small'
                                },
                                on: {
                                    'click': ()=>{
                                        this.clearAlarms(params.row.id)
                                    }
                                }
                            }, '确认')
                        ])
                    }
                },
                {
                    title: "操作",
                    width: 80,
                    align: 'center',
                    render: (h: any, params: any) => {
                        return h('Button', {
                            props:{
                                type: 'primary',
                                size: 'small'
                            },
                            on:{
                                'click':()=> {
                                    this.showDetail(params.row)
                                }
                            }
                        }, '详情')
                    }
                }
            ],
            alarms: [],
            type: 0,
            page: {
                total: 0,
                pageSize: 10,
                current: 1,
            },
        }

        // 网速对话框内的参数
        modelData3: any = {
            show: false,
            title: "",
            systeminfos: [],
            timer: 0
        }

        /** 告警详情 */
        showDetails: boolean = false
        detailsData: Alarm = getDefaultAlarm()

        alarmNumberImg: any = require('@/assets/images/activityAlarm.png')
        stationNumberImg: string = require('@/assets/images/stationPerson.png')
        equipmentNumberImg: string = require('@/assets/images/equipmentNumber.png')

        mounted() {
            this.stationId = this.$store.state.stationId;
            this.init();
            this.refresh()
        }

        refresh() {
            const timer = setInterval(() => {
                this.init()
            }, this.ProjectConfig.DataRefreshTime);
            this.$once('hook:beforeDestroy', () => {
                clearInterval(timer);
            })
        }

        init() {
            // 获取场站人数
            getPeopleCountByCondition(this.vo1).then(res => {
                if (res.data.code == 200) this.peopleNum = res.data.data
            })

            getAlarmCountByCondition(this.vo2).then(res => {
                if (res.data.code == 200) this.alarmNum = res.data.data
            })

            // getNetSpeed({
            //     pageNum: 1,
            //     pageSize: 1
            // }).then(res => {
            //     if (res.data.code == 200) {
            //         const tmp = res.data.data.content
            //         if (tmp.length > 0) this.netSpeed = tmp[0].netRecv
            //     }
            // })
            getEquipments().then((res: any) => {
                if (res.data.code == 200) this.equipmentNum = res.data.data.length
            })
        }

        peopleClick() {
            this.modelData1.show = true
            this.modelData1.stationId = this.stationId
            this.modelData1.title = "场站人员";
            this.modelData1.page = {
                total: 0,
                pageSize: 5,
                current: 1,
            };
            this.searchPeopleData();
        }

        peopleCurrentChange(value: number) {
            this.modelData1.page.current = value;
            this.searchPeopleData();
        }

        peoplePageSizeChange(value: number) {
            this.modelData1.page.pageSize = value;
            this.searchPeopleData();
        }

        searchPeopleData() {

            this.modelData1.data.length = 0

            let vo: StationPeopleVo = {
                pageNum: this.modelData1.page.current,
                pageSize: this.modelData1.page.pageSize,
                stationId: this.modelData1.stationId,
                inStation: true
            }
            getStationPeoplesByCondition(vo).then((res: any) => {
                let {
                    code,
                    data
                } = res.data;
                if (code == 200 && data) {
                    data.content.forEach(d => {
                        this.modelData1.data.push(Object.assign({}, d, {
                            alarm: {
                                id: d.alarmId
                            }
                        }))
                    })
                    this.modelData1.page.total = data.totalSize;
                }
            });
        }

        alarmClick() {
            this.modelData2.show = true;
            this.modelData2.title = "活动告警";
            this.modelData2.alarms = [];
            this.modelData2.page = {
                total: 0,
                pageSize: 10,
                current: 1,
            };
            this.searchAlarmData();
        }

        alarmCurrentChange(value: number) {
            this.modelData2.page.current = value;
            this.searchAlarmData();
        }

        alarmPageSizeChange(value: number) {
            this.modelData2.page.pageSize = value;
            this.searchAlarmData();
        }

        searchAlarmData() {

            const vo: AlarmVo = {
                pageNum: this.modelData2.page.current,
                pageSize: this.modelData2.page.pageSize,
                stationId: this.stationId,
                cleaned: false
            };
            getAlarmsByCondition(vo).then((res: any) => {
                let {
                    code,
                    data
                } = res.data;
                if (code == 200 && data) {
                    this.modelData2.alarms = data.content;
                    this.modelData2.page.total = data.totalSize;
                }
            });
        }

        async equipClick() {
            await (this.$refs as any).equip.init()
            await (this.modelData3.show = true);

        }

        getNetChartData() {
            getNetSpeed({
                pageNum: 1,
                pageSize: 30,
            }).then((res: any) => {
                if (res.data.code != 200) return

                this.modelData3.systeminfos = res.data.data.content

            }).finally(() => {
                this.drawNetChart()
            })
        }

        drawNetChart() {
            this.myChart = this.$echarts.init(document.getElementById("netChartId"));

            // x轴标题数据
            let xData: string[] = []

            let series: any[] = [{
                name: '下载',
                type: 'line',
                data: [],
                markPoint: {
                    data: [{
                        type: 'max',
                        name: '最大值'
                    }]
                }
            }]
            this.modelData3.systeminfos.forEach((data: any) => {
                xData.push(data.createTime)
                // series[0].data.push({
                //     id: data.id,
                //     value: data.netSent
                // })
                series[0].data.push({
                    id: data.id,
                    value: data.netRecv
                })
            })
            let datazoom: EChartOption.DataZoom = {
                type: 'slider',
                show: false,
                startValue: 0,
                endValue: 10
            }
            let initOption: EChartOption = {
                color: ['#4cabce', '#e5323e'],
                legend: {
                    right: 25,
                    textStyle: {
                        color: "#D5E5F9",
                        fontSize: 12,
                    },
                    itemWidth: 20,
                    itemHeight: 15,
                    borderRadius: 5,
                    data: ['下载']
                },
                // dataZoom: [datazoom],
                tooltip: {
                    show: true,
                    trigger: "axis",
                    axisPointer: {
                        type: "none",
                    },
                },
                xAxis: {
                    type: "category",
                    axisLine: {
                        lineStyle: {
                            color: "#0E8BFF",
                        },
                    },
                    axisTick: {
                        show: false,
                    },
                    axisLabel: {
                        margin: 10,
                        color: "#000",
                        formatter: (value: string, index: number) => {
                            return value.split(' ')[1]
                        }
                    },
                    data: xData
                },
                yAxis: {
                    type: 'value',
                    name: 'KiB',
                    nameTextStyle: {
                        color: "#000",
                    },
                    axisLine: {
                        lineStyle: {
                            color: "#0E8BFF",
                        },
                    },
                    axisTick: {
                        show: false,
                    },
                    axisLabel: {
                        margin: 10,
                        color: "#000",
                    },
                    splitLine: {
                        show: false
                    },
                    minInterval: 1
                },
                grid: {
                    top: 30,
                    bottom: 40,
                },
                series: series,
            };

            this.myChart.setOption(initOption);

            window.addEventListener("resize", () => this.myChart.resize(), false);
        }

        model3VisibleChange(val: boolean) {
            if (val) {
                this.modelData3.timer = setInterval(() => {
                    this.getNetChartData()
                }, this.ProjectConfig.SysteminfoRefreshTime);
            } else {
                clearInterval(this.modelData3.timer)
            }
        }

        clearAlarms(id) {
            cleanAlarm(id).then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    this.$Message.success('确认成功！')
                    this.searchAlarmData();
                } else {
                    this.$Message.error('确认失败！')
                }
            })

        }

        showDetail(data: Alarm) {
            this.showDetails = true
            this.detailsData = data
        }
    }
</script>

<style lang="less">
    @import "~@/assets/commonCss.less";

    .number_of_alarms {
        height: 100%;

        h4 {
            .componentTitleStyle();
        }

        .content {
            width: 100%;
            height: 80%;
            margin: 0 auto;
            position: relative;
            display: flex;
            flex-direction: row;
            align-items: stretch;

            .child {
                flex: 1;
                font-size: 1.125rem;
                font-weight: bold;
                color: #fff;
                text-align: center;
                margin: 2rem 0.5rem;
                border-radius: 10%;
                overflow: hidden;

                .top {
                    width: 100%;
                    height: 75%;
                    background: linear-gradient(to top, #ee842d, #e84e2c);

                    >img {
                        margin-top: 13%;
                        width: 50%;
                    }

                    >span {
                        display: block;
                        font-size: 0.8rem;
                        font-weight: 10;
                    }

                }

                .bottom {
                    height: 25%;
                    background: rgba(33, 87, 211, 0.55);
                    line-height: 37px;
                    font-size: 1.2rem;
                    font-weight: normal;
                }

                .person {
                    background: linear-gradient(to bottom, #2559a6, #3887f2);
                }

                .equip {
                    background: linear-gradient(to bottom, #1eafba, #6dc4cd);
                }
            }


        }

    }

    .base-info-modal {
        .ivu-modal-header {
            border-bottom: none;
            p {
                text-align: center;
                color: #ffffff;
                font-size: medium;
            }
        }
        .ivu-modal-content {
            background-color: rgb(32, 50, 91) !important;

            .ivu-modal-body {
                padding: 10px;
                overflow-y: auto;
                &::-webkit-scrollbar{
                    width: 4px;
                    height: 4px;
                    overflow-x: hidden;
                    overflow-y: auto;
                }
            
                &::-webkit-scrollbar-thumb {
                    border-radius: 5px;
                    box-shadow: inset 0 0 5px #2699B6;
                    background: rgba(0, 0, 0, 0.2)
                }
            
                &::-webkit-scrollbar-track {
                    border-radius: 4px;
                    box-shadow: inset 0 0 5px rgb(235, 227, 235);
                    background: rgba(0, 0, 0, 0.1)
                }
            }
        }
    }
    
    .base-info-alarm-modal,
    .base-info-people-modal {
        .ivu-modal-content {
            .ivu-modal-body {
                max-height: 70vh !important;
            }
        }
    }
</style>