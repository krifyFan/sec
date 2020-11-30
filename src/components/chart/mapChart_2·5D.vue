<template>
    <div class="mapChart-wrap" :id="id" ref="element"></div>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
        Prop,
        Watch,
        Emit
    } from "vue-property-decorator"
    import {
        EChartOption,
        ECharts
    } from 'echarts'
    import {
        hasMap,
        registerMap
    } from '@/util/echartmap'

    @Component({})
    export default class About extends Vue {

        @Prop({
            required: false,
            default: 'mapChartId'
        }) id!: string

        @Prop({
            required: true
        }) mapName!: string

        @Prop({
            required: false,
            default: () => []
        }) scatter: any[]

        @Prop({
            required: false,
            default: () => []
        }) nodes: any[]

        @Prop({
            required: false,
            default: () => []
        }) links: any[]

        /**
         * 要求类型
         * {
         *      id: number,
         *      name: string
         * }
         */
        @Prop({
            required: false,
            default: () => []
        }) graphicNodes: any[]

        option!: any

        myChart!: ECharts

        /** 图标待选项 */
        icons: any[] = this.$store.state.icons
        /** 连接线样式 */
        lineStyles: any[] = this.$store.state.lineStyles

        curZoom: number = 0

        @Watch('mapName', {
            deep: true,
            immediate: true
        })
        onDataChanged(val: string, oldVal: string) {
            this.drawChart()
        }

        // @Watch('scatter')
        // onScatterChanged(val: any[], oldVal: any[]) {
        //     this.drawChart()
        // }

        @Watch('nodes')
        onNodeChanged(val: any[], oldVal: any[]) {
            this.drawChartEvent()
        }

        @Watch('links')
        onLinkChanged(val: any[], oldVal: any[]) {
            this.drawChartEvent()
        }


        @Watch('graphicNodes')
        onGraphicNodesChanged(val: any[], oldVal: any[]) {
            this.drawChartEvent()
        }

        // 画节点和连接线连续触发的问题
        drawChartTimer: any

        mounted() {
            this.initData()
            this.drawChart()
            this.resizeChart()
        }

        initData() {
            this.myChart = this.$echarts.init(document.getElementById(this.id))
            this.myChart.on('click', this.clickEvent)
            // 添加地图缩放拖拽时间roam
            this.myChart.on('georoam', this.georoamEvent)
            // 去除默认的鼠标事件
            document.oncontextmenu = function () {
                return false;
            }
            // 新加上鼠标右击事件
            this.myChart.on("contextmenu", this.rightClickEvent)
        }

        drawChart() {
            console.log("drawChart mapName", this.mapName)
            if (!hasMap(this.mapName)) return
            // console.log("有地图")

            this.myChart.clear()

            this.option = {
                geo: {
                    show: true,
                    map: this.mapName,
                    roam: true,
                    // zoom: 1.2,
                    // aspectScale: 1.2,
                    label: {
                        normal: {
                            show: false,
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                color: '#fff'
                            }
                        },
                    },
                    itemStyle: {
                        normal: {
                            borderColor: 'rgba(147, 235, 248, 1)',
                            borderWidth: 1,
                            // areaColor: '#00559D',
                            areaColor: 'rgba(0,85,157,0.2)',
                            shadowColor: 'rgba(128, 217, 248, 1)',
                            // shadowColor: 'rgba(255, 255, 255, 1)',
                            shadowOffsetX: -2,
                            shadowOffsetY: 5,
                            shadowBlur: 5
                        },
                        emphasis: {
                            areaColor: '#2AB8FF',
                            borderWidth: 0
                        }
                    }
                },

            }

            this.myChart.resize();
            this.myChart.setOption(this.option)
        }

        drawChartEvent() {
            clearTimeout(this.drawChartTimer)
            this.drawChartTimer = setTimeout(this.drawNodeAndLink, 100)
        }

        drawNodeAndLink() {

            let _this = this
            console.log("nodes", this.nodes)
            console.log("links", this.links)

            // 设置散点
            if (this.nodes.length > 0) {
                this.nodes.forEach(node => {
                    let index = this.icons.findIndex(i => i.id == node.icon)
                    if (index > -1) {
                        node.symbol = `image://${this.icons[index].img}`
                        node.symbolSize = 20
                    }
                })
            }

            // 设置连接线样式
            if (this.links.length > 0) {
                this.links.forEach(link => {
                    let index = this.lineStyles.findIndex(i => i.id == link.type)
                    if (index > -1) link.lineStyle = {
                        color: this.lineStyles[index].color
                    }
                    // 设置数据
                    link.coords = [this.nodes[link.target].value, this.nodes[link.source].value]
                })
            }

            // 设置导航栏
            let groups: Object[] = []

            let curLeft: number = 400
            let curTop: number = 30
            let fontSize: number = 18
            let gap: number = 5
            const color: string = '#fff'

            for (let i = 0; i < this.graphicNodes.length; i++) {
                const element = this.graphicNodes[i]

                // 添加箭头
                if (i > 0) {
                    curLeft += gap

                    groups.push({
                        type: 'group',
                        left: curLeft + gap,
                        top: curTop + 10,
                        children: [{
                            type: 'polyline',
                            shape: { // 箭头
                                points: [
                                    [0, 0],
                                    [fontSize / 2, fontSize / 2],
                                    [0, fontSize]
                                ]
                            },
                            style: {
                                stroke: color
                            },
                        }]
                    })

                    curLeft += gap + fontSize
                }

                // 添加字
                groups.push({
                    id: element.id,
                    type: 'group',
                    left: curLeft,
                    top: curTop,
                    children: [{
                            type: 'text',
                            left: 10,
                            top: 15,
                            style: {
                                text: element.name,
                                textAlign: 'center',
                                fill: color,
                                font: `${fontSize}px "Microsoft YaHei", sans-serif`
                            },
                            onclick: function (param) {
                                console.log("graphic text click", element)
                                _this.graphicclick(element)
                            }
                        },
                        {
                            type: 'line',
                            left: 10,
                            top: 0,
                            shape: {
                                x1: 0,
                                y1: 0,
                                x2: element.name.length * fontSize,
                                y2: 0
                            },
                            style: {
                                stroke: color,
                            }
                        },
                        {
                            type: 'line',
                            left: 10,
                            top: fontSize + 22,
                            shape: {
                                x1: 0,
                                y1: 0,
                                x2: element.name.length * fontSize,
                                y2: 0
                            },
                            style: {
                                stroke: color,
                            }
                        }
                    ]
                })

                curLeft += element.name.length * fontSize

            }

            let tmp_option: any = {
                tooltip: {
                    trigger: 'item',
                    formatter: (param) => {
                        // console.log("tooltip", param)
                        let tipHtml: string = ""
                        tipHtml += "<div>"
                        tipHtml +=
                            "<span style='width:70px; display:inline-block;text-align: right;'>联系人：</span>" +
                            param.data.param.contact
                        tipHtml += "</div>"
                        tipHtml += "<div>"
                        tipHtml +=
                            "<span style='width:70px; display:inline-block;text-align: right;'>联系电话：</span>" +
                            param.data.param.telephone
                        tipHtml += "</div>"
                        tipHtml += "<div>"
                        tipHtml +=
                            "<span style='width:70px; display:inline-block;text-align: right;'>联系地址：</span>" +
                            param.data.param.address
                        tipHtml += "</div>"

                        return tipHtml
                    }
                },
                series: [{
                        name: 'scatter',
                        type: "scatter",
                        coordinateSystem: 'geo',
                        label: {
                            show: true,
                            position: "right",
                            color: '#01E7EE',
                            fontWeight: 'bold',
                            backgroundColor: '#0C385D',
                            borderWidth: 8,
                            borderColor: '#0C385D',
                            borderRadius: 2,
                            formatter: '{b}'
                        },
                        data: this.nodes,
                        zlevel: 10
                    },
                    {
                        type: "lines",
                        coordinateSystem: 'geo',
                        data: this.links,
                        silent: true,
                        lineStyle: {
                            opacity: 0.2,
                            width: 5
                        },
                        progressiveThreshold: 500,
                        progressive: 200,
                    },
                    {
                        type: "lines",
                        coordinateSystem: 'geo',
                        data: this.links,
                        lineStyle: {
                            width: 0
                        },
                        effect: {
                            // period: 2,
                            constantSpeed: 30,
                            show: true,
                            trailLength: 0.3,
                            symbolSize: 6,
                            color: '#fff'
                        },
                        zlevel: 5
                    }
                ],
                graphic: groups
            }

            console.log("option", tmp_option)
            this.myChart.setOption(tmp_option)
        }

        // 地图滚动拖拽事件
        georoamEvent(param) {
            // console.log("geo roam", param)
            let tmp_zoom: number = this.myChart.getOption().geo[0].zoom

            if (param.zoom) { // 滚动事件

                if (this.curZoom == tmp_zoom) return
                this.curZoom = tmp_zoom
                this.scalechange(this.curZoom)

            } else { // 拖拽事件

            }
        }

        clickEvent(param) {
            let {
                componentSubType,
                componentType,
                data,
                seriesType,
                dataType,
            } = param
            console.log("clickEvent param", param)
            // 关系图的节点
            if (componentSubType == "scatter" && componentType == "series" && seriesType == "scatter") {
                this.click(data)
            }
        }

        rightClickEvent(param) {
            console.log("right click", param)
            this.rightclick(param)
        }

        @Emit('on-click')
        private click(data: any) {}


        @Emit('on-rightclick')
        private rightclick(data: any) {}

        @Emit('on-scalechange')
        private scalechange(scale: number) {}

        @Emit('on-graphicclick')
        private graphicclick(data: any) {}

        resizeChart() {
            let _this = this;
            window.addEventListener("resize", () => {
                _this.myChart.resize();
                _this.drawChart();
            });
        }
    }
</script>

<style lang="less" scoped>
    .mapChart-wrap {
        width: 100%;
        height: 100%;
    }
</style>