<template>
    <map-chart :mapName="mapName" :nodes="nodes" :links="links" :graphicNodes="graphicNodes" ref="mapChart"
        @on-click="mapClick" @on-rightclick="mapRightClick" @on-scalechange="mapScaleChange"
        @on-graphicclick="graphicClick"></map-chart>
</template>

<script lang="ts">
    import {
        Component,
        Vue
    } from "vue-property-decorator"
    import {
        getManagementTree
    } from '@/api/management'
    import {
        getStations,
        getStationsByManagement
    } from '@/api/station'
    import {
        getStationLinks
    } from '@/api/stationlink'
    import {
        getCustomMapByName
    } from '@/api/custommap'
    import {
        ManagementTree
    } from '@/types/management.interface'
    import {
        CustomMap
    } from '@/types/custommap.interface'
    import {
        Station
    } from '@/types/station.interface'
    import {
        StationLink
    } from '@/types/stationlink.interface'
    import {
        hasMap,
        registerMap,
        updateMap
    } from '@/util/echartmap'
    import {
        createGeoMap
    } from '@/util/geomap'
    import MapChart from '@/components/chart/mapChart_2·5D.vue'
    import {
        TreeNode
    } from '@/types/treenode.interface'

    @Component({
        components: {
            MapChart
        }
    })
    export default class Map extends Vue {
        /** 当前角色的部门树结构 */
        BaseTree: ManagementTree
        /** 当前所处的树结构 */
        CurTree: ManagementTree
        /** 当前角色下的所有场站 */
        stations: Station[]
        /** 场站关联 */
        stationLinks: StationLink[]

        /** 当前地图 */
        mapName: string = "china"
        /** 显示的点位 */
        scatter: any[] = []
        /** 关系图点位 */
        nodes: any[] = []
        /** 关联线 */
        links: any[] = []
        /** 定位点节点 */
        graphicNodes: any[] = []

        /** 滚动显示管理部门的时候，当前的层级 */
        curFloor: number = 1
        /** 连续滚动只取最后一次滚动配置 */
        scaleInterval: number = 100
        scaleTimer: any

        /** 连续点击只取最后一次 */
        clickInterval: number = 100
        clickTimer: any

        mounted() {
            this.initData()
        }

        initData() {
            Promise.all([getStations(), getManagementTree(), getStationLinks()]).then((res: any) => {
                // 场站
                if (res[0].data.code == 200) this.stations = res[0].data.data

                // 当前的树结构
                if (res[1].data.code == 200) {
                    this.BaseTree = this.CurTree = res[1].data.data
                    this.graphicNodes.push({
                        id: this.CurTree.id,
                        name: this.CurTree.name
                    })
                }

                // 场站关联
                if (res[2].data.code == 200) this.stationLinks = res[2].data.data

                this.drawMap()
            })
        }

        async drawMap() {
            this.curFloor = 1
            this.mapName = this.CurTree.map

            // 如果已经有了该地图，则直接加载，否则需要新建地图
            if (!hasMap(this.mapName)) {
                // 先根据地图名称获取自定义地图
                let customMap: any = await this.getCustomMapByName()
                // 根据自定义的地图获取标准地图格式
                let geoMap: any = await createGeoMap(customMap)
                // 注册进echarts
                registerMap(this.mapName, geoMap)
            }

            this.showManagement();

            // 画上地图
            (this.$refs.mapChart as any).drawChart()
        }

        // 显示管理处
        showManagement() {
            this.nodes.length = 0
            this.links.length = 0

            // 从根节点开始查找，查找到第一层（管理处）
            this.findNodesByFloor(this.CurTree, 0, 1)
        }

        // 关系图显示
        showGraph() {

            this.nodes.length = 0
            this.links.length = 0

            this.stations.forEach((station: Station) => {
                // 地理坐标分割
                let splitStr: string[] = station.position.split(',')
                if (splitStr.length > 0) {
                    this.nodes.push({
                        id: station.id,
                        name: station.name,
                        value: splitStr.map(val => Number(val)),
                        type: "station",
                        icon: station.icon,
                        param: station,
                    })
                }
            })

            this.stationLinks.forEach((link: StationLink) => {
                let source: number = this.nodes.findIndex((node: any) => node.id == link.source)
                let target: number = this.nodes.findIndex((node: any) => node.id == link.target)
                if (source > -1 && target > -1) {
                    this.links.push({
                        source: source,
                        target: target,
                        type: link.type
                    })
                }
            })
        }

        // 根据地图名获取自定义地图的结构
        getCustomMapByName() {
            return new Promise((resolve, reject) => {
                getCustomMapByName(this.mapName).then((res: any) => {
                    let {
                        code,
                        data
                    } = res.data

                    if (code == 200) {
                        resolve(data)
                    } else {
                        reject()
                    }
                }).catch(err => {
                    reject(err)
                })
            })
        }

        mapClick(param: any) {
            let _this = this

            clearTimeout(_this.clickTimer)

            _this.clickTimer = setTimeout(() => {
                console.log("click", param)
                if (param.type == "management") { // 如果是管理部门

                    _this.CurTree = _this.findCurTreesChildNode(_this.CurTree, param.id)
                    _this.graphicNodes.push({
                        id: _this.CurTree.id,
                        name: _this.CurTree.name
                    })
                    _this.drawMap()

                } else { // 场站
                    // 跳转到场站页面
                    _this.$store.commit('setStationId', param.id)
                    _this.$router.push({
                        name: 'Stations'
                    })

                }
            }, _this.clickInterval);

        }

        mapRightClick(param: any) {
            console.log("map right click", param)

            // 查找当前节点的父亲，并跳转
            let father = this.findCurTreesFather(this.BaseTree)
            if (father) {
                this.CurTree = father
                if (this.CurTree.name == this.graphicNodes[this.graphicNodes.length - 2].name) {
                    this.graphicNodes.pop()
                }
                this.drawMap()
            }
        }

        mapScaleChange(zoom: number) {
            let _this = this

            clearTimeout(_this.scaleTimer)

            _this.scaleTimer = setTimeout(() => {

                // console.log("当前 zoom", zoom)
                let tmp: number = zoom <= 1 ? 1 : zoom <= 2.5 ? 2 : 3

                _this.nodes.length = 0
                _this.links.length = 0

                _this.findNodesByFloor(_this.CurTree, 0, tmp)

            }, _this.scaleInterval)

        }

        graphicClick(data: any) {
            // console.log("graphicClick", data)
            let id: number = data.id

            let tmpTree: ManagementTree | null = this.findTreeNode(this.BaseTree, id)
            if (tmpTree) {
                this.CurTree = tmpTree

                // 导航清除
                let tmpIndex: number = this.graphicNodes.findIndex(node => node.id == id)
                if (tmpIndex >= 0) this.graphicNodes.splice(tmpIndex + 1)

                this.drawMap()
            }
        }

        /**
         * 根据层级寻找节点
         * node: 当前树节点
         * curfloor: 当前层数
         * tarfloor：目标层数
         */
        findNodesByFloor(node: ManagementTree, curfloor: number, tarfloor: number) {
            if (curfloor >= tarfloor) {
                // 地理坐标分割
                let splitStr: string[] = node.position.split(',')
                if (splitStr.length > 0) {
                    this.nodes.push({
                        id: node.id,
                        name: node.name,
                        value: splitStr.map(val => Number(val)),
                        type: "management",
                        param: node,
                        icon: node.icon, // 后面配置
                    })
                }
            } else {
                if (!node.leaf && node.children.length > 0) { // 如果不是根节点，继续搜
                    node.children.forEach((child: ManagementTree) => {
                        this.findNodesByFloor(child, curfloor + 1, tarfloor)
                    })
                } else { // 如果是根节点，则将当前角色下的所有场站显示
                    getStationsByManagement(this.CurTree.id).then((res: any) => {
                        this.stations = res.data.data
                        this.showGraph()
                    })
                }
            }
        }

        // 查找当前节点的父亲
        findCurTreesFather(node: ManagementTree): ManagementTree | null {
            let result: ManagementTree | null = null

            for (let i = 0; i < node.children.length; i++) {
                const element = node.children[i];
                if (element.id == this.CurTree.id) {
                    result = node
                } else {
                    result = this.findCurTreesFather(element)
                }
                if (result != null) break
            }

            return result
        }

        // 查找当前节点下是否有id的孩子
        findCurTreesChildNode(node: ManagementTree, childId: number): ManagementTree | null {
            let result: ManagementTree | null = null

            for (let i = 0; i < node.children.length; i++) {
                const element = node.children[i];
                if (element.id == childId) {
                    result = element
                } else {
                    result = this.findCurTreesChildNode(element, childId)
                }
                if (result != null) break
            }

            return result
        }

        // 查找节点
        findTreeNode(node: ManagementTree, id: number): ManagementTree | null {
            let result: ManagementTree | null = null

            if (node.id == id) {
                result = node
            } else {
                for (let i = 0; i < node.children.length; i++) {
                    const element = node.children[i];
                    result = this.findTreeNode(element, id)
                    if (result != null) break
                }
            }

            return result
        }
    }
</script>

<style scoped></style>