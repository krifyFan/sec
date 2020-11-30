<template>
    <div class="systeminfo_statistics">
        <div class="titleClass">
            <Title title="网络流量"></Title>
        </div>
        <div class="statistics_chart" :id="`systeminfo_statistics${chartId}`"></div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from "vue-property-decorator";
    import { EChartOption, ECharts } from "echarts";
    import Title from './title.vue'
    import { VideoServer } from '@/types/videoserver.interface'
    import { getVideoServers } from '@/api/videoserver'
    import axios from "axios"
    /** 网速 */
    interface NetworkSpeed {
        /** 进网速 */
        inK: number,
        /** 出网速 */
        outK: number
    }

    @Component({
        components: {
            Title
        }
    })
    export default class SysteminfoStatistics extends Vue {

        @Prop({
            default: ''
        })
        chartId!: string

        /** 视频服务 */
        videoServer!: VideoServer
        /** 带宽使用情况 */
        NetworkUsed: NetworkSpeed[] = []
        /** 内存使用率 */
        MemoryUsed: number = 0
        /** 内存大小 */
        TotalMemoryByte: number = 0
        /** 页面数据刷新率 */
        refreshTime: number = 1000
        /** 数组大小 */
        arraySize: number = 60
        /** 网络进出流量 */
        myChart1!: ECharts
        /** 运行时间 */
        RunTimeSec: number = 0

        mounted() {
            this.init()
        }

        init() {
            getVideoServers().then(res => {
                if (res.data.code == 200) {
                    let videoServers: VideoServer[] = res.data.data

                    // 找到该场站的H5服务
                    let index: number = videoServers.findIndex(v => v.vendor == 5)
                    if (index >= 0) this.videoServer = videoServers[index]
                }
            }).finally(() => {
                this.getDeviceInfo()
                this.getSystemInfo()
                this.refresh()

            })

            this.initChart()
        }

        getDeviceInfo() {
            this._request('/api/v1/GetCodecInfo').then(res => {
                let data = res.data
                // this.CPU = Number(data.nCPU)
                // this.CPUCore = Number(data.nCPUCore)
                // this.CPUModel = data.strCPUModel
            })
        }

        getSystemInfo() {
            if (!this.videoServer) return

            this._request('/api/v1/GetRunInfo').then(res => {
                let data: {
                    nCPUUsage: string, // "18"
                    nFreeSpaceByte: string, //"341579186176"
                    nMemoryUsage: string, //"61"
                    nNetworkInK: string, //"21"
                    nNetworkOutK: string, //"18"
                    nRecordFreeSpaceByte: string, //"341579186176"
                    nRecordTotalSpaceByte: string, //"500093153280"
                    nRunTimeSec: string, //"17424"
                    nTotalMemoryByte: string, //"17031303168"
                    nTotalSpaceByte: string, //"500093153280"
                    strCPU: string, //"18%"
                    strFreeSpace: string, //"318Gbytes"
                    strMemory: string, //"61%"
                    strNetworkIn: string, //"21Kbps"
                    strNetworkOut: string, //"18Kbps"
                    strRecordFreeSpace: string, //"318Gbytes"
                    strRecordTotalSpace: string, //"465Gbytes"
                    strRunTime: string, //"4H 50MIN"
                    strTotalSpace: string, //"465Gbytes"
                } = res.data

                this.NetworkUsed.push({
                    inK: Number(data.nNetworkInK),
                    outK: Number(data.nNetworkOutK)
                })
                if (this.NetworkUsed.length > this.arraySize) this.NetworkUsed.shift()

                this.RunTimeSec = Number(data.nRunTimeSec)

                this.drawChart()
            })
        }

        refresh() {
            const timer = setInterval(() => {
                this.getSystemInfo()
            }, this.refreshTime)
            this.$once('hook:beforeDestroy', () => {
                clearInterval(timer);
            })
        }

        initChart() {
            this.myChart1 = this.$echarts.init(document.getElementById(`systeminfo_statistics${this.chartId}`))
            let option1: EChartOption = {
                color: ['#4cabce', '#e5323e'],
                legend: {
                    textStyle: {
                        color: "#D5E5F9",
                        fontSize: 12,
                    },
                    data: ['网络进流量', '网络出流量']
                },
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
                        color: "#fff",
                    },
                    data: []
                },
                yAxis: {
                    type: 'value',
                    name: 'KiB',
                    nameTextStyle: {
                        color: "#fff",
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
                        color: "#fff",
                    },
                    splitLine: {
                        show: false
                    },
                    minInterval: 10,
                },
                grid: {
                    top: 30,
                    bottom: 40,
                },
                series: [{
                    name: '网络进流量',
                    type: 'line',
                    data: [],
                    smooth: true,
                    symbol:'none',
                }, {
                    name: '网络出流量',
                    type: 'line',
                    data: [],
                    smooth: true,
                    symbol:'none',
                }]
            }

            this.myChart1.setOption(option1)
            window.addEventListener("resize", () => this.myChart1.resize(), false)
        }

        drawChart() {
            // 计算X轴
            let curSec: number = this.RunTimeSec % 60
            let xData: string[] = []
            for (let i = 0; i < this.arraySize; i++) {
                xData.unshift(((curSec + 60 - i * (this.refreshTime / 1000)) % 60).toString() + 's')
            }

            // 进流量
            let data1: number[] = []
            // 出流量
            let data2: number[] = []
            for (let i = 0; i < this.arraySize - this.NetworkUsed.length; i++) {
                data1.push(0)
                data2.push(0)
            }
            for (let i = 0; i < this.NetworkUsed.length; i++) {
                data1.push(this.NetworkUsed[i].inK)
                data2.push(this.NetworkUsed[i].outK)
            }

            let option1: EChartOption = {
                xAxis: {
                    data: xData
                },
                series: [{
                    data: data1,
                }, {
                    data: data2,
                }]
            }
            this.myChart1.setOption(option1)

        }

        _request(url: string) {
            return axios.get(`http://${this.videoServer.ip}:${this.videoServer.port}${url}`, {
                params: {
                    session: ''
                },
            })
        }
    }
</script>

<style lang="less" scoped>
    .growth_trend_line {
        height: 80% !important;
    }

    .systeminfo_statistics {
        height: 100%;

        .titleClass {
            width: 100%;
            height: fit-content;
        }

        .statistics_chart {
            height: 90%;
        }
    }
</style>