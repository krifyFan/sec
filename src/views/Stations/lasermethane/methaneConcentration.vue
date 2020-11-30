<template>
    <div class="mathane-concentration-wrap">
        <div class="modular-title">甲烷浓度</div>
        <div class="chart-line-normal-wrap" id="chartLineNormal"></div>
    </div>
</template>
<script lang="ts">
    import {
        Component,
        Prop,
        Watch,
        Vue
    } from 'vue-property-decorator'
    import {
        ECharts,
        EChartOption,
        EChartsSeriesType
    } from "echarts";

    import { getMeasvalues } from '@/api/lasermethane'
import { log } from 'three';

    @Component({})
    export default class MethaneConcentration extends Vue {

        @Prop({
            required: true
        })methane

        @Watch('methane')
        watchMethane(newVal: any) {
            this.refresh()
        }

        myChart!: ECharts
        option!: EChartOption

        mounted() {
            this.initChart()
            this.refresh()
        }

        refresh() {
            const timer = setInterval(() => {
                this.initData(this.methane.id) 
            }, 2000);
            this.$once('hook:beforeDestroy', () => {
                clearInterval(timer);
            })
        }

        initChart() {
            this.myChart = this.$echarts.init(document.getElementById('chartLineNormal'))
            this.option = {
                grid: {
                    left: '15%',
                    top: '7%',
                    bottom: '20%'
                },
                xAxis: {
                    data: [],
                    type: 'category',
                    axisLine: {
                        lineStyle: {
                            color: '#0f4573'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        lineStyle: {
                            color: '#0f4573'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: ['#0f4573']
                        }
                    }
                },
                series: [{
                    data: [],
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                        color: '#61beff'
                    }
                }]
            }
            this.myChart.setOption(this.option)
            window.addEventListener("resize", () => this.myChart.resize(), false);
        }
        initData(id) {
            let curDate = new Date()
            let params = {
                id: id,
                startTime: new Date(curDate.getTime() - 1000*60*60*24), 
                endTime: curDate
            }
            getMeasvalues(params).then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    data.forEach(element => {
                        (this.option.xAxis as any).data.push(new Date(element.time).format('hh:mm:ss'));
                        (this.option.series[0].data as any).push(element.value);
                    });
                    this.myChart.setOption(this.option)
                }
            })
        }
    }
</script>
<style lang="less" scoped>
    .mathane-concentration-wrap {
        width: 100%;
        height: 100%;
        .chart-line-normal-wrap {
            width: 100%;
            height: 100%;
        }
    }
</style>