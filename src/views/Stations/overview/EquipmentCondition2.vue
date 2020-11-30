<template>
    <div class="equipment_condition">
        <h4>设备状况</h4>
        <div class="chartClass" :id="`alarm_chartId${this.chartId}`"></div>

        <Modal class="base-info-modal base-info-alarm-modal query-alarm-dialog" v-model="modelData.show" width="500" footer-hide>
            <p slot="header">
                {{modelData.title}}
            </p>
            <Table border :columns="modelData.columns" :data="modelData.equipments"></Table>
            <div class="page-wrap">
                <el-pagination @current-change="currentChange"
                    :current-page.sync="modelData.page.current"
                    :page-size="modelData.page.pageSize" layout="total, prev, pager, next"
                    :total="modelData.page.total">
                </el-pagination>
            </div>
            <div slot="footer" style="text-align:center">
                <Button type="primary" @click="modelData.show = false">关闭</Button>
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
        ECharts,
        EChartOption,
        EChartsSeriesType
    } from "echarts";
    import {
        getEquipmentTypeStateStatisticeByStation,
        getPageEquipmentsByCondition
    } from '@/api/equipment'
    import {
        EnumType
    } from '@/types/enumtype.interface'
    import {
        EquipmentVo
    } from '@/types/equipment.interface';

    @Component({})
    export default class EquipmentCondition extends Vue {

        @Prop({
            default: ''
        })
        chartId!: string

        myChart!: ECharts;

        statisticeData: any[]

        // 对话框内的参数
        modelData: any = {
            show: false,
            title: "",
            columns: [
                {
                    title: '设备名',
                    key: 'name'
                },
                {
                    title: '设备类型',
                    key: 'equipmentTypeName'
                },
                {
                    title: '设备状态',
                    key: 'equipmentStateName'
                }
            ],
            equipments: [],
            page: {
                total: 0,
                pageSize: 10,
                current: 1
            },
            typeId: 0,
            stateId: 0,
        }

        equipmentTypes: EnumType[] = this.$store.state.equipmentType
        equipmentStates: EnumType[] = this.$store.state.equipmentStateType
        colors: string[] = ["#00A1E4", "#FFDE00", "#DC4277"]

        stationId: number = 0

        mounted() {
            this.stationId = this.$store.state.stationId
            this.init()
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
            getEquipmentTypeStateStatisticeByStation(this.stationId).then((res: any) => {
                let {
                    code,
                    data
                } = res.data
                if (code == 200) {
                    this.statisticeData = data
                    this.initChart()
                }
            }).finally(() => {

            })
        }

        initChart() {
            let xData: string[] = []

            let legendData: string[] = this.statisticeData[0].val.map(d => {
                return d.key
            })
            let seriesData: number[][] = []
            for (let i = 0; i < legendData.length; i++) {
                seriesData.push([])
            }

            for (let i = 0; i < this.statisticeData.length; i++) {
                let count: number = 0
                for (let j = 0; j < this.statisticeData[i].val.length; j++) {
                    count += this.statisticeData[i].val[j].val
                }
                // 如果和为0，则不显示这个类别
                if (count == 0) continue

                xData.push(this.statisticeData[i].key)
                for (let j = 0; j < this.statisticeData[i].val.length; j++) {
                    seriesData[j].push(this.statisticeData[i].val[j].val)
                }
            }


            let series: any[] = []
            for (let i = 0; i < legendData.length; i++) {

                series.push({
                    name: legendData[i],
                    type: 'bar',
                    stack: '数目',
                    barMaxWidth: '40%',
                    itemStyle: {
                        barBorderRadius: i == legendData.length - 1 ? [10, 10, 0, 0] : 0
                    },
                    data: seriesData[i]
                })

            }


            this.myChart = this.$echarts.init(
                document.getElementById(`alarm_chartId${this.chartId}`)
            )

            let initOption: EChartOption = {
                color: this.colors,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: legendData,
                    top: "5%",
                    right: "5%",
                    textStyle: {
                        color: "#fff",
                    },
                },
                grid: {
                    bottom: "15%"
                },
                xAxis: [{
                    type: 'category',
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
                        color: "#fff",
                        interval: 0,
                    },
                    data: xData
                }],
                yAxis: [{
                    type: 'value',
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
                        color: "#fff",
                    },
                    splitLine: {
                        show: false
                    },
                    minInterval: 1
                }],
                series: series
            };

            this.myChart.setOption(initOption)
            this.myChart.on('click', this.clickEvent)
            window.addEventListener("resize", () => this.myChart.resize(), false);
        }

        /**
         * 
         */
        clickEvent(params: any) {
            let typeIndex: number = this.equipmentTypes.findIndex((type: EnumType) => type.key == params.name)
            if (typeIndex < 0) return
            let stateIndex: number = this.equipmentStates.findIndex((state: EnumType) => state.key == params
                .seriesName)
            if (stateIndex < 0) return

            this.modelData.typeId = this.equipmentTypes[typeIndex].val
            this.modelData.stateId = this.equipmentStates[stateIndex].val

            this.modelData.show = true
            this.modelData.title =  "设备详情（"+params.seriesName+"）"
            this.modelData.equipments = []
            this.modelData.page = {
                total: 0,
                pageSize: 10,
                current: 1
            }

            this.searchData()
        }

        currentChange(value: number) {
            this.modelData.page.current = value
            this.searchData()
        }

        pageSizeChange(value: number) {
            this.modelData.page.pageSize = value
            this.searchData()
        }

        searchData() {
            const data: EquipmentVo = {
                pageNum: this.modelData.page.current,
                pageSize: this.modelData.page.pageSize,
                equipmentType: this.modelData.typeId,
                equipmentState: this.modelData.stateId,
                stationId: this.stationId
            }
            getPageEquipmentsByCondition(data).then((res: any) => {
                let {
                    code,
                    data
                } = res.data
                if (code == 200 && data) {
                    this.modelData.equipments = data.content
                    this.modelData.page.total = data.totalSize
                }
            })
        }

        /**
         * 根据element的宽度获取百分比
         */
        getSizeByWidth(val: number | string, elementId: string): number {
            if (typeof val === "number") return val;
            if (typeof val === "string") {
                if (val.indexOf("%") > 0) {
                    let tmp = parseFloat(val.replace("%", "")) / 100;
                    let height = document.getElementById(elementId).offsetWidth;
                    return Math.round(height * tmp);
                }
            }
            return 0;
        }

    }
</script>

<style lang="less" scoped>
    @import "~@/assets/commonCss.less";

    .equipment_condition {
        height: 100%;
        width: 100%;

        h4 {
            .componentTitleStyle();
        }

        .chartClass {
            width: 100%;
            height: 80%;
        }
    }
</style>