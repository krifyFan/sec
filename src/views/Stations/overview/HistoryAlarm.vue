<template>
    <div class="history_alerm_class">
        <h4>历史告警</h4>
        <div class="history_line" id="historyId"></div>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue
    } from "vue-property-decorator";
    import {
        ECharts,
        EChartOption,
        EChartsSeriesType
    } from "echarts";
    import {
        getDayAlarmCountOfStation
    } from '@/api/alarm'

    @Component({})
    export default class HistoryAlerm extends Vue {
        myChart!: ECharts;

        stationId: number = 0

        values: any[] = []

        mounted() {
            this.stationId = this.$store.state.stationId
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
            getDayAlarmCountOfStation(this.stationId, 14).then((res: any) => {
                if (res.data.code != 200) return

                this.values = res.data.data

            }).finally(() => {
                this.initChart()
            })
        }

        initChart() {
            this.myChart = this.$echarts.init(document.getElementById("historyId"));

            let xValue: any[] = this.values.map(v => {
                return v.key
            })
            let seriesData: any[] = this.values.map(v => {
                return v.val
            })

            let initOption: any = {
                grid: {
                    left: "3%",
                    right: "4%",
                    bottom: "35%",
                    containLabel: true,
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "line",
                        label: {
                            backgroundColor: "#6a7985",
                        },
                        lineStyle: {
                            color: "#168AF6",
                        },
                    },
                },
                xAxis: {
                    type: "category",
                    boundaryGap: false,
                    axisLine: {
                        lineStyle: {
                            color: "#168AF6",
                        },
                    },
                    axisTick: {
                        show: false,
                    },
                    axisLabel: {
                        interval: 0,
                    },
                    data: xValue,
                },
                yAxis: {
                    show: false,
                    axisTick: {},
                },

                series: [{
                    name: "告警数",
                    type: "line",
                    stack: "总量",
                    lineStyle: {
                        color: "#168AF6",
                    },
                    areaStyle: {
                        color: {
                            type: "linear",
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                    offset: 0,
                                    color: "#168AF6", // 0% 处的颜色
                                },
                                {
                                    offset: 1,
                                    color: "#111E40", // 100% 处的颜色
                                },
                            ],
                            global: false, // 缺省为 false
                        },
                    },
                    smooth: true,
                    itemStyle: {
                        opacity: 0,
                    },
                    data: seriesData,
                }, ],
            };
            this.myChart.setOption(initOption);
            window.addEventListener("resize", () => this.myChart.resize(), false);
        }

    }
</script>

<style lang="less" scoped>
    @import "~@/assets/commonCss.less";

    .history_alerm_class {
        height: 100%;
        // background: rgba(255, 255, 255, 0.1);
        // background-image: url("../../../assets/images/frame_history.png");
        // background-size: 100% 100%;

        h4 {
            .componentTitleStyle();
        }

        .history_line {
            height: 215px;
        }
    }
</style>