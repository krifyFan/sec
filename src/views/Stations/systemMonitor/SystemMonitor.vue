<template>
    <div class="System_wrap">
        <div class="BaseInfo_wrap">
            <div class="CPUClass">
                <div class="cpuTitle">CPU</div>
                <div class="cpuContent">型号：{{CPUModel}}</div>
                <div class="cpuContent">路数：{{CPU}}</div>
                <div class="cpuContent">核数：{{CPUCore}}</div>
                <div class="runTime">运行时间：{{Math.floor(RunTimeSec/3600)}}小时 {{Math.floor(RunTimeSec%3600/60)}}分
                    {{Math.floor(RunTimeSec%60)}}秒</div>
            </div>

            <div class="MemoryAndSpaceClass">
                <div class="MemoryClass">
                    <i-circle :percent="MemoryUsed" :size="120">
                        <span style="font-size:24px">{{MemoryUsed}}%</span>
                    </i-circle>
                    <div class="fontClass">
                        内存
                    </div>
                    <div class="fontClass">
                        （总内存：{{Math.round(TotalMemoryByte/1024/1024/1024*10)/10}}G）
                    </div>
                </div>
                <div class="SpaceClass">
                    <i-circle :percent="SpaceUsed" :size="120">
                        <span style="font-size:24px">{{SpaceUsed}}%</span>
                    </i-circle>
                    <div class="fontClass">
                        （空余容量：{{Math.round(FreeSpaceByte/1024/1024/1024*10)/10}}G）
                    </div>
                    <div class="fontClass">
                        （总硬盘容量：{{Math.round(TotalSpaceByte/1024/1024/1024*10)/10}}G）
                    </div>
                </div>
            </div>

            <div class="NetworkClass" id="network_id"></div>
            <div class="CPUUsedClass" id="cpuused_id"></div>
        </div>

        <div class="EquipmentGraph_wrap">
            <equpment-graph></equpment-graph>
        </div>

        <div class="EquipmentInfo_wrap">
            3
        </div>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
        Watch
    } from "vue-property-decorator"
    import {
        VideoServer
    } from '@/types/videoserver.interface'
    import {
        getVideoServers
    } from '@/api/videoserver'
    import EqupmentGraph from '@/views/Stations/systemMonitor/EquipmentGraph.vue'
    import axios from "axios"
    import {
        EChartOption,
        ECharts
    } from "echarts"

    /** 网速 */
    interface NetworkSpeed {
        /** 进网速 */
        inK: number,
            /** 出网速 */
            outK: number
    }

    @Component({
        components: {
            EqupmentGraph
        }
    })
    export default class SystemMonitorClass extends Vue {
        /** 视频服务 */
        videoServer!: VideoServer
        /** 所属场站 */
        stationId: number = 0
        /** CPU使用率 */
        CpuUsed: number[] = []
        /** 带宽使用情况 */
        NetworkUsed: NetworkSpeed[] = []
        /** 内存使用率 */
        MemoryUsed: number = 0
        /** 内存大小 */
        TotalMemoryByte: number = 0
        /** 硬盘使用率 */
        SpaceUsed: number = 0
        /** 硬盘空间大小 */
        TotalSpaceByte: number = 0
        /** 空余硬盘大小 */
        FreeSpaceByte: number = 0
        /** 运行时间 */
        RunTimeSec: number = 0

        /** CPU型号 */
        CPUModel: string = ''
        /** CPU路数 */
        CPU: number = 1
        /** CPU核数 */
        CPUCore: number = 1

        /** 页面数据刷新率 */
        refreshTime: number = 1000
        /** 数组大小 */
        arraySize: number = 60

        /** 网络进出流量 */
        myChart1!: ECharts
        /** 内存使用率 */
        myChart2!: ECharts

        mounted() {
            this.stationId = this.$store.state.stationId
            this.init()
        }

        init() {
            getVideoServers().then(res => {
                if (res.data.code == 200) {
                    let videoServers: VideoServer[] = res.data.data

                    // 找到该场站的H5服务
                    let index: number = videoServers.findIndex(v => v.stationId == this.stationId && v
                        .vendor == 5)
                    if (index >= 0) this.videoServer = videoServers[index]
                }
            }).finally(() => {
                this.getDeviceInfo()
                this.getSystemInfo()
                this.refresh()

            })

            this.initChart()
        }

        refresh() {
            const timer = setInterval(() => {
                this.getSystemInfo()
            }, this.refreshTime)
            this.$once('hook:beforeDestroy', () => {
                clearInterval(timer);
            })
        }

        getDeviceInfo() {
            this._request('/api/v1/GetCodecInfo').then(res => {
                let data = res.data
                this.CPU = Number(data.nCPU)
                this.CPUCore = Number(data.nCPUCore)
                this.CPUModel = data.strCPUModel
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

                this.CpuUsed.push(Number(data.nCPUUsage))
                if (this.CpuUsed.length > this.arraySize) this.CpuUsed.shift()
                this.NetworkUsed.push({
                    inK: Number(data.nNetworkInK),
                    outK: Number(data.nNetworkOutK)
                })
                if (this.NetworkUsed.length > this.arraySize) this.NetworkUsed.shift()
                this.MemoryUsed = Number(data.nMemoryUsage)
                this.TotalMemoryByte = Number(data.nTotalMemoryByte)
                this.TotalSpaceByte = Number(data.nTotalSpaceByte)
                this.FreeSpaceByte = Number(data.nFreeSpaceByte)
                this.SpaceUsed = Math.round((1 - this.FreeSpaceByte / this.TotalSpaceByte) * 100)
                this.RunTimeSec = Number(data.nRunTimeSec)

                this.drawChart()
            })
        }

        initChart() {
            this.myChart1 = this.$echarts.init(
                document.getElementById("network_id")
            )
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

            this.myChart2 = this.$echarts.init(
                document.getElementById("cpuused_id")
            )
            let option2: EChartOption = {
                color: ['#4cabce', '#e5323e'],
                legend: {
                    textStyle: {
                        color: "#D5E5F9",
                        fontSize: 12,
                    },
                    data: ['CPU']
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
                    name: '%',
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
                    name: 'CPU',
                    type: 'line',
                    data: [],
                    smooth: true,
                    symbol:'none',
                }]
            }

            this.myChart2.setOption(option2)
            window.addEventListener("resize", () => this.myChart2.resize(), false)
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
            // 内存使用率
            let data3: number[] = []
            for (let i = 0; i < this.arraySize - this.NetworkUsed.length; i++) {
                data1.push(0)
                data2.push(0)
                data3.push(0)
            }
            for (let i = 0; i < this.NetworkUsed.length; i++) {
                data1.push(this.NetworkUsed[i].inK)
                data2.push(this.NetworkUsed[i].outK)
                data3.push(this.CpuUsed[i])
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

            let option2: EChartOption = {
                xAxis: {
                    data: xData
                },
                series: [{
                    data: data3,
                }]
            }
            this.myChart2.setOption(option2)
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
    .System_wrap {
        width: 100%;
        height: 80%;
        display: flex;
        flex-direction: row;

        .BaseInfo_wrap {
            flex: 1;
            border: 1px #000 solid;

            .CPUClass {
                width: 90%;
                height: 20%;
                margin-top: 5%;
                margin-left: 10%;
                color: #fff;

                .cpuTitle {
                    font-size: 20px;
                    line-height: 25px;
                }

                .cpuContent {
                    font-size: 14px;
                    line-height: 20px;
                }

                .runTime {
                    font-size: 24px;
                    line-height: 30px;
                }
            }

            .MemoryAndSpaceClass {
                width: 100%;
                height: 25%;
                color: #fff;
                display: flex;
                flex-direction: row;

                .MemoryClass,
                .SpaceClass {
                    flex: 1;
                    text-align: center;

                    .fontClass {
                        font-size: 14px;
                    }
                }
            }

            .NetworkClass,
            .CPUUsedClass {
                width: 100%;
                height: 25%;
            }
        }

        .EquipmentGraph_wrap {
            flex: 2;
            border: 1px #000 solid;
        }

        .EquipmentInfo_wrap {
            flex: 1;
            border: 1px #000 solid;
        }
    }
</style>