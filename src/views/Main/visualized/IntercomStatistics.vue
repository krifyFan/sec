<template>
    <div class="intercom_statistics">
        <div class="titleClass">
            <Title title="场站人员"></Title>
        </div>
        <div class="statistics_chart" :id="`intercom_statistics${chartId}`"></div>
        <Modal class="base-info-modal base-info-alarm-modal query-alarm-dialog" v-model="modelData.show" width="800" footer-hide>
            <p slot="header">{{ modelData.title }}</p>
            <div style="text-align:right">
                <Table border :columns="modelData.columns" :data="modelData.data">
                    <template slot-scope="{ row }" slot="image">
                        <div style="width:160px;height:100px">
                            <alarm-image :alarm="row.alarm"></alarm-image>
                        </div>
                    </template>
                </Table>
                <div class="page-wrap">
                    <el-pagination @current-change="currentChange"
                        :current-page.sync="modelData.page.current"
                        layout="total, prev, pager, next"
                        :total="modelData.page.total">
                    </el-pagination>
                </div>
            </div>
            <div slot="footer" style="text-align:right">
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
        getCountByCondition,
        getStationPeoplesByCondition
    } from "@/api/stationpeople";
    import {
        getStations,
        getStationsByManagement
    } from '@/api/station'
    import {
        StationPeople,
        StationPeopleVo
    } from "@/types/stationpeople.interface"
    import {
        Station
    } from '@/types/station.interface'
    import {
        DateUtil
    } from '@/util/dateUtil'
    import {
        Series
    } from '@/types/chart.interface';
    import AlarmImage from "@/components/view/AlarmImage.vue";
    import Title from './title.vue'
    import {
        getManagementTree
    } from '@/api/management'

    @Component({
        components: {
            AlarmImage,
            Title
        }
    })
    export default class IntercomStatistics extends Vue {

        @Prop({
            default: ''
        })
        chartId!: string

        myChart!: ECharts;

        stations: Station[] = []

        /** 数据显示区域 */
        datazoom: EChartOption.DataZoom = {
            type: 'slider',
            show: false,
            startValue: 0,
            endValue: 4
        }

        // 鼠标是否悬浮
        isMouseHover: boolean = false

        // 统计信息
        StatisticsData: any[];

        // 对话框内的参数
        modelData: any = {
            show: false,
            title: "",
            columns: [{
                    title: "员工号",
                    key: "employeeNo",
                    width: 100,
                },
                {
                    title: "姓名",
                    key: "employeeName",
                    width: 150,
                },
                {
                    title: "进入时间",
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
                    width: 200
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

        managementsTree: any[] = []

        fatherNodeId: number = 1

        mounted() {
            this.initData()
            this.refresh()
        }

        refresh() {
            let _this = this
            const timer = setInterval(() => {
                _this.draw()
            }, this.ProjectConfig.DataRefreshTime);
            this.$once('hook:beforeDestroy', () => {
                clearInterval(timer);
            })
        }
        async initData() {

            if (this.managementsTree.constructor !== Object) {
                let {
                    data: {
                        code,
                        data
                    }
                } = await getManagementTree()

                if (code != 200) return

                this.managementsTree = data

                this.draw()
            }

        }
        async draw(id: number = this.fatherNodeId, pattern: boolean = false) {

            let leafNode = this.searchNodeOrFatherNode(this.managementsTree, id, pattern) // 查询节点是否在树上


            if (!leafNode) return true //节点不在树上

            this.fatherNodeId = pattern ? leafNode.id : id

            await this.initChartData(leafNode, 0, 1) // 初始化图标数据
            await this.initChart()

        }
        /**
         * tree: 树
         * nodeId: 树节点id
         * isSearchFather: true 查询父节点 ,false 判断树中是否包括查询节点
         */
        searchNodeOrFatherNode(tree, nodeId: number, isSearchFather: boolean) { // 查询树上是否有子节点 或 父节点

            if (nodeId === 1) return tree // 根节点

            let result = null

            for (let i = 0; i < tree.children.length; i++) {
                const element = tree.children[i];
                if (element.id == nodeId) {
                    result = isSearchFather ? tree : element
                } else {
                    result = this.searchNodeOrFatherNode(element, nodeId, isSearchFather)
                }
                if (result != null) break
            }

            return result

        }

        getStationIntercomDataPromise(stationId: number) {
            return new Promise((resolve, reject) => {
                // 在场站中人
                // let vo: StationPeopleVo = {
                //     stationId: stationId,
                //     inStation: true
                // }
                resolve(Math.round(Math.random() * 20))
                // getCountByCondition(vo).then(res => {
                //     if (res.data.code == 200) {
                //         resolve(res.data.data)
                //     } else {
                //         reject()
                //     }
                // }).catch(err => {
                //     reject(err)
                // })
            })
        }

        initChart() {

            this.myChart = this.$echarts.init(
                document.getElementById(`intercom_statistics${this.chartId}`)
            );

            let colors: string[] = ['#00ffff', '#00cfff', '#006ced', '#ffe000', '#ffa800', '#ff5b00', '#ff3000']
            let data: any[] = []

            for (let i = 0; i < this.StatisticsData.length; i++) {

                const element = this.StatisticsData[i];
                data.push({
                    id: element.id,
                    value: element.val,
                    name: element.key,
                    itemStyle: {
                        // ie下阴影效果会导致错误，显示不出来整个图
                        normal: {
                            borderWidth: 5,
                            // shadowBlur: 20,
                            borderColor: colors[i],
                            // shadowColor: colors[i]
                        },
                        emphasis: {
                            borderWidth: 8,
                            // shadowBlur: 20,
                            borderColor: colors[i],
                            // shadowColor: colors[i]
                        }
                    }
                }, {
                    value: 1,
                    name: '',
                    itemStyle: {
                        normal: {
                            label: {
                                show: false
                            },
                            labelLine: {
                                show: false
                            },
                            color: 'rgba(0, 0, 0, 0)',
                            borderColor: 'rgba(0, 0, 0, 0)',
                            borderWidth: 0
                        }
                    }
                })
            }

            let seriesOption: any[] = [{
                name: '',
                type: 'pie',
                clockWise: false,
                radius: ["70%", "75%"],
                hoverAnimation: false,
                label: {
                    normal: {
                        show: false
                    },
                    emphasis: {
                        show: true,
                        formatter: '{b} : {c}'
                    }
                },
                data: data
            }];
            let initOption: any = {
                color: colors,
                title: {
                    text: '场站人数',
                    top: '45%',
                    textAlign: "center",
                    left: "48%",
                    textStyle: {
                        color: '#fff',
                        fontSize: this.getSizeByWidth("10%"),
                        fontWeight: '400'
                    }
                },
                tooltip: {
                    show: false
                },
                legend: {
                    show: false,
                    // icon: "circle",
                    // orient: 'horizontal',
                    // data: this.StatisticsData.map(d => {
                    //     return d.key
                    // }),
                    // bottom: "5%",
                    // align: 'right',
                    // textStyle: {
                    //     fontSize: this.getSizeByWidth("3%"),
                    //     color: "#fff"
                    // },
                },
                toolbox: {
                    show: false
                },
                series: seriesOption
            }

            this.myChart.setOption(initOption);
            this.myChart.on("click", this.clickEvent);
            this.myChart.on("contextmenu", this.rightClickEvent);

            window.addEventListener("resize", () => this.myChart.resize(), false);
        }

        async initChartData(node: any, curfloor: number, tarfloor: number) {
            let curNode = null

            if (curfloor >= tarfloor) {

                this.StatisticsData = []

                for (let i = 0; i < node.length; i++) {
                    const element = node[i]
                    let val = await this.getStationIntercomDataPromise(element.id) // 假数据

                    this.StatisticsData.push({
                        key: element.name,
                        val: val,
                        id: element.id
                    })
                }

            } else {
                if (node.leaf) { // 叶子节点
                    let {
                        data: {
                            code,
                            data
                        }
                    } = await getStationsByManagement(this.fatherNodeId)

                    curNode = data.map((station: any) => Object.assign(station, {  // 避免id冲突，场站id为100以后
                        id: station.id + 100 
                    }))
                } else {
                    curNode = node.children
                }

                await this.initChartData(curNode, curfloor + 1, tarfloor)


            }
        }

        /**
         * 根据element的宽度获取百分比
         */
        getSizeByWidth(val: number | string): number {
            if (typeof val === "number") return val;
            if (typeof val === "string") {
                if (val.indexOf("%") > 0) {
                    let tmp = parseFloat(val.replace("%", "")) / 100;
                    let height = document.getElementById(`intercom_statistics${this.chartId}`).offsetHeight;
                    return Math.round(height * tmp);
                }
            }
            return 0;
        }

        clickEvent(params: any) {

            this.draw(params.data.id).then(isTree => {
                if (isTree) {
                    this.modelData.show = true
                    this.modelData.name = params.name
                    this.modelData.stationId = params.data.id
                    this.modelData.title = params.name + "场站内人员详情";
                    this.modelData.page = {
                        total: 0,
                        pageSize: 5,
                        current: 1,
                    };
                    this.searchData();
                }
            })

        }

        async rightClickEvent() {

            this.draw(this.fatherNodeId, true)

        }

        currentChange(value: number) {
            this.modelData.page.current = value;
            this.searchData();
        }

        pageSizeChange(value: number) {
            this.modelData.page.pageSize = value;
            this.searchData();
        }

        searchData() {

            this.modelData.data.length = 0

            let vo: StationPeopleVo = {
                pageNum: this.modelData.page.current,
                pageSize: this.modelData.page.pageSize,
                stationId: this.modelData.stationId,
                inStation: true
            }
            getStationPeoplesByCondition(vo).then((res: any) => {
                let {
                    code,
                    data
                } = res.data;
                if (code == 200 && data) {
                    data.content.forEach(d => {
                        this.modelData.data.push(Object.assign({}, d, {
                            alarm: {
                                id: d.alarmId
                            }
                        }))
                    })

                    this.modelData.page.total = data.totalSize;
                }
            });
        }
    }
</script>

<style lang="less">
    .intercom_statistics {
        height: 100%;

        .titleClass {
            width: 100%;
            height: fit-content;
        }

        .statistics_chart {
            margin-top: 15%;
            height: 60%;
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
</style>