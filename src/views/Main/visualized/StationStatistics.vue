<template>
    <div class="growth_trend">

        <div class="titleClass">
            <Title title="场站统计"></Title>
        </div>
        <div class="chartClass" id="station_chartId"></div>
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
    import Title from './title.vue'
    import { getStations } from '@/api/station'
    import { Station } from '@/types/station.interface'

    @Component({
        components: {
            Title
        }
    })
    export default class StationStatistics extends Vue {

        colors: string[] = ["#00A1E4", "#FFDE00", "#DC4277"]

        onLineStation: Station[] = []
        offLineStation: Station[] = []

        myChart!: ECharts;
        
        mounted() {
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
            getStations().then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    data.forEach((item: Station) => {
                        if (item.online == true) {
                            this.onLineStation.push(item)
                        } else {
                            this.offLineStation.push(item)
                        }
                    })
                this.initChart()
                }
            })
        }

        initChart() {

            let seriesData = []
            seriesData.unshift(this.onLineStation.length)
            seriesData.push(this.offLineStation.length)

            let legendData: string[] = ['在线', '离线']

            this.myChart = this.$echarts.init(
                document.getElementById('station_chartId')
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
                    top: '10%',
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
                    data: legendData
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
                        interval: 0,
                    },
                    splitLine: {
                        show: false
                    },
                    minInterval: 1
                }],
                series: [
                    {
                        name: '场站统计',
                        type: 'bar',
                        barWidth: '20%',
                        data: seriesData
                    }
                ]
            };

            this.myChart.setOption(initOption)
            this.myChart.on('click', this.clickEvent)
            window.addEventListener("resize", () => this.myChart.resize(), false);
        }

    }
</script>

<style lang="less" scoped>
    .growth_trend {
        height: 100%;

        .titleClass {
            width: 100%;
            height: fit-content;
        }
        .chartClass {
            height: 80%;
            width: 100%;
        }
    }
</style>