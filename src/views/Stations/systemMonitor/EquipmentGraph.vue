<template>
    <div class="equipment_condition" :style="equipStyle">
        <h4>在线情况</h4>
        <div class="graph-chart-wrap" id="dom_netnodes" :style="chartStyle"></div>
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
    } from "echarts"
    import {
        getEquipmentTree
    } from "@/api/equipment"
    import {
        TreeNode
    } from "@/types/treenode.interface"

    @Component({})
    export default class EquipmentCondition extends Vue {

       @Prop()
       width: number

       @Prop()
       height: number

        myChart!: ECharts
        /** 场站id */
        stationId!: number
        /** 获得的整棵树 */
        root!: TreeNode
        /**
         * 当前的根节点
         */
        curRoot!: TreeNode

        get equipStyle() {

            let w = this.width + 20
            let h = this.height

            return {
                width: !w ? `100%` : `${w}px`,
                height: !h ? `100%` : `${h}px`,
                overflow: 'hidden'
            }
        }

        get chartStyle(){

            let w = this.width
            let h = this.height

            return {
                width: !w ? `100%` : `${w}px`,
                height: !h ? `80%` : `${h * 0.8}px`
            }
        }

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
            getEquipmentTree(this.stationId).then((res: any) => {
                if (res.data.code == 200) {
                    this.root = res.data.data
                    this.initChart()
                }
            })
        }

        initChart() {
            this.myChart = this.$echarts.init(
                document.getElementById("dom_netnodes")
            )

            // 关系图节点
            let nodes: any[] = []
            // 关系图连接线
            let links: any[] = []
            // 动的点
            let effectLinks: any[] = []

            this.setNodesAndLinks(this.root, 0, nodes, links, effectLinks)

            nodes.forEach((node: any) => {
                node.label = {
                    normal: {
                        show: true,
                    },
                }
            })

            let initOption: EChartOption = {
                tooltip: {
                    formatter: "{a}<br/>{b}",
                },
                animationDuration: 1500,
                animationEasingUpdate: "quinticInOut",
                series: [{
                    name: "网络连接关系图",
                    type: "graph",
                    layout: "force",
                    data: nodes,
                    links: links,
                    force: {
                        repulsion: 1000,
                        gravity: 0.5,
                        layoutAnimation: true,
                        edgeLength: [10, 100]
                    },
                    legendHoverLink: true,
                    hoverAnimation: true,
                    roam: true,
                    focusNodeAdjacency: true,
                    itemStyle: {
                        borderColor: "#fff",
                        borderWidth: 1,
                        shadowBlur: 10,
                        shadowColor: "rgba(0, 0, 0, 0.3)",
                    },
                    label: {
                        position: "right",
                        formatter: "{b}",
                    },
                    lineStyle: {
                        curveness: 0.3,
                    },
                    emphasis: {
                        lineStyle: {
                            width: 3,
                            opacity: 0.5,
                        },
                    },
                    cursor: "pointer",
                }],
            }

            this.myChart.setOption(initOption)
            window.addEventListener("resize", () => this.myChart.resize(), false)

        }

        /** 设置所有的nodes和links */
        setNodesAndLinks(
            curNode: TreeNode,
            fatherIndex: number,
            nodes: any[],
            links: any[],
            effectLinks: any[]
        ) {
            let img: any = this.getSymbolImg(curNode);
            let param: any = this.getItemStyle(curNode.level);

            nodes.push({
                id: curNode.id,
                name: curNode.name,
                category: 0,
                draggable: true,
                symbol: `image://${img}`,
                symbolSize: param.symbolSize,
                itemStyle: {
                    color: curNode.connected ? param.color : "#ccc",
                    shadowBlur: curNode.connected ? param.shadowBlur : 0,
                    shadowColor: param.shadowColor,
                },
            })

            // 添加关联线
            let curIndex = nodes.length - 1
            if (fatherIndex != curIndex) {
                links.push({
                    source: fatherIndex,
                    target: curIndex,
                    lineStyle: {
                        color: curNode.connected ? param.color : "#ccc",
                        width: 2,
                        type: "solid",
                    },
                });
            }

            // 添加动点线，如果当前点是连接着的，则动起来
            if (curNode.connected && fatherIndex != curIndex) {
                effectLinks.push({
                    source: curIndex,
                    target: fatherIndex,
                })
            }

            curNode.children.forEach((node: TreeNode) => {
                this.setNodesAndLinks(node, curIndex, nodes, links, effectLinks)
            })
        }

        /** 获取该节点的图片 */
        getSymbolImg(curNode: TreeNode): any {
            let img: any

            try {
                img = curNode.connected ?
                    require(`@/assets/images/${curNode.type}.png`) :
                    require(`@/assets/images/${curNode.type}-error.png`)
            } catch (error) {
                img = curNode.connected ?
                    (img = require(`@/assets/images/default.png`)) :
                    require(`@/assets/images/default-error.png`)
            }

            return img
        }


        /** 不同等级的样式 */
        getItemStyle(level: number): any {
            let param: any = {
                symbolSize: 30,
                color: "#3af",
                shadowBlur: 10,
                shadowColor: "#a00",
            }

            switch (level) {
                case 0:
                    param.symbolSize = this.getSizeByWidth('5%')
                    param.color = "#3af"
                    param.shadowBlur = 10
                    param.shadowColor = "#a00"
                    break

                case 1:
                    param.symbolSize = this.getSizeByWidth('3%')
                    param.color = "#3af"
                    param.shadowBlur = 10
                    param.shadowColor = "#a00"
                    break

                case 2:
                    param.symbolSize = this.getSizeByWidth('2%')
                    param.color = "#9a8"
                    param.shadowBlur = 10
                    param.shadowColor = "#0aa"
                    break

                case 3:
                    param.symbolSize = this.getSizeByWidth('1%')
                    param.color = "#d5c"
                    param.shadowBlur = 10
                    param.shadowColor = "#e6d"

                    break

                default:
                    break
            }

            return param;
        }

        /**
         * 根据element的宽度获取百分比
         */
        getSizeByWidth(val: number | string): number {
            if (typeof val === "number") return val;
            if (typeof val === "string") {
                if (val.indexOf("%") > 0) {
                    let tmp = parseFloat(val.replace("%", "")) / 100;
                    let height = document.getElementById("dom_netnodes").offsetWidth;
                    return Math.round(height * tmp);
                }
            }
            return 0;
        }

    }
</script>

<style lang="less" scoped>
    .equipment_condition {
        height: 100%;

        h4 {
            line-height: 45px;
            font-size: 22px;
            color: #2ed1f6;
            font-weight: 500;
            padding-left: 21px;
            font-weight: 700;
        }

        .graph-chart-wrap {
            height: 80%;
            width: 100%;
        }
    }
</style>