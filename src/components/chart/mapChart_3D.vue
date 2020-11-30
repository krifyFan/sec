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

        option!: any

        myChart!: ECharts

        /** 图标待选项 */
        icons: any[] = this.$store.state.icons
        /** 连接线样式 */
        lineStyles: any[] = this.$store.state.lineStyles

        @Watch('mapName', {
            deep: true
        })
        onDataChanged(val: string, oldVal: string) {
            this.drawChart()
        }

        @Watch('nodes')
        onNodeChanged(val: any[], oldVal: any[]) {
            this.drawNodeAndLinkEvent()
        }

        @Watch('links')
        onLinkChanged(val: any[], oldVal: any[]) {
            this.drawNodeAndLinkEvent()
        }

        // 画节点和连接线连续触发的问题
        drawNodeAndLinkTimer: any

        mounted() {
            this.initData()
            this.drawChart()
            this.resizeChart()
        }

        initData() {
            this.myChart = this.$echarts.init(document.getElementById(this.id))
            this.myChart.on('click', this.clickEvent)
            // 去除默认的鼠标事件
            document.oncontextmenu = function () {
                return false;
            }
            // 新加上鼠标右击事件
            this.myChart.on("contextmenu", this.rightClickEvent)
        }

        drawChart() {
            if (!hasMap(this.mapName)) return

            this.myChart.clear()

            this.option = {
                geo3D: {
                    map: this.mapName,
                    itemStyle: {
                        color: 'rgba(0,85,157,0.2)', // 地图配色
                        opacity: 1,
                        borderWidth: 0.8,
                        borderColor: 'rgba(147, 235, 248, 1)' // 地图边配色
                    },
                    label: {
                        show: false,
                    },
                    emphasis: { //当鼠标放上去  地区区域是否显示名称
                        itemStyle: {
                            color: '#7db41b', // 鼠标移入地图配色
                        },
                        label: {
                            show: true,
                            textStyle: {
                                color: '#fff',
                                fontSize: 3,
                                backgroundColor: 'rgba(0,0,0,0.5)' //鼠标移入文字加背景
                            }
                        }
                    },
                    // shading: 'lambert',
                    light: { //光照阴影
                        main: {
                            color: '#fff', //光照颜色
                            intensity: 1.2, //光照强度
                            //shadowQuality: 'high', //阴影亮度
                            shadow: true, //是否显示阴影
                            alpha: 60,
                            beta: 120

                        },
                        ambient: {
                            intensity: 0.3
                        }
                    },
                    viewControl: {
                        panMouseButton: 'left',
                        rotateMouseButton: 'middle',
                        distance: 100,
                        minDistance: 40,
                        maxDistance: 200,
                        animation: true,
                        animationDurationUpdate: 1000,
                        animationEasingUpdate: 'cubicInOut',
                        // 初始旋转角度
                        alpha: 50,
                        // beta: 40
                    },
                }
            }

            this.myChart.resize();
            this.myChart.setOption(this.option)
        }

        drawNodeAndLinkEvent() {
            clearTimeout(this.drawNodeAndLinkTimer)
            this.drawNodeAndLinkTimer = setTimeout(this.drawNodeAndLink, 100)
        }

        drawNodeAndLink() {

            console.log("nodes", this.nodes)
            console.log("links", this.links)

            // 设置散点
            if (this.nodes.length > 0) {
                this.nodes.forEach(node => {
                    // 添加高度属性
                    node.value.push(5)
                    let index = this.icons.findIndex(i => i.id == node.icon)
                    if (index > -1) {
                        // node.symbol = `image://${this.icons[index].img}`
                        node.symbol =
                            'path://M512 104c55.1 0 108.5 10.8 158.8 32 48.6 20.5 92.2 50 129.7 87.5s66.9 81.1 87.5 129.7c21.3 50.3 32 103.7 32 158.8s-10.8 108.5-32 158.8c-20.5 48.6-50 92.2-87.5 129.7s-81.1 66.9-129.7 87.5c-50.3 21.3-103.7 32-158.8 32s-108.5-10.8-158.8-32c-48.6-20.5-92.2-50-129.7-87.5s-66.9-81.1-87.5-129.7c-21.3-50.3-32-103.7-32-158.8s10.8-108.5 32-158.8c20.5-48.6 50-92.2 87.5-129.7s81.1-66.9 129.7-87.5c50.3-21.2 103.7-32 158.8-32m0-40C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zM309.6 287.5h73.1v120.4h-73.1zM512 254.3L286.7 472.9v324.3h450.6V472.9zM372.4 526.1H512v271.1H372.4zM551.2 548.3h121.9v168.4H551.2zM292.6 268.3H399v21.4H292.6zM794.2 555.7L512 282.3 229.8 555.7l-39.2-39.9 321.4-311 321.4 311z'
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

            let tmp_option: any = {
                tooltip: {
                    trigger: 'item',
                    formatter: (param) => {
                        // console.log("tooltip", param)
                        let tipHtml: string = ""
                        tipHtml += "<div>"
                        tipHtml += param.data.description
                        tipHtml += "</div>"

                        return tipHtml
                    }
                },
                series: [{
                        name: 'scatter3D',
                        type: "scatter3D",
                        coordinateSystem: 'geo3D',
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
                        // zlevel: 10
                    },
                    {
                        type: "lines3D",
                        coordinateSystem: 'geo3D',
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
                        type: "lines3D",
                        coordinateSystem: 'geo3D',
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
                ]
            }

            this.myChart.setOption(tmp_option)
        }

        clickEvent(param) {
            let {
                componentSubType,
                componentType,
                data,
                seriesType
            } = param
            if (componentSubType == "scatter3D" && componentType == "series" && seriesType == "scatter3D") {
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