<template>
    <div>
        <h4>火灾报警配置</h4>
        <el-row :gutter="20">
            <el-col :span="24">
                <span class="sp">总览模块: </span>
                <Select style="width: 200px" v-model="stationId">
                    <Option v-for="item in stations" :key="`${item.id}`" :value="item.id">{{item.name}}</Option>
                </Select>
            </el-col>
            <el-col :span="24">
                <!-- 场站底图： -->
                <el-upload class="upload-demo" :action="uploadAction" :headers="token" :on-success="handleSuccess"
                    :before-remove="beforeRemove" :limit="1" :on-exceed="handleExceed">
                    <el-button size="small" type="primary">上传场站底图</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传一张图片，图片不超过500kb</div>
                </el-upload>
            </el-col>
        </el-row>
        <div class="add-icon-wrap">
            <div class="fire-alram-warp">
                <img width="30px" :src="fireAlarmNormalIcon" alt="烟感" title="烟感" @click="addFireIcon(1)">
            </div>
            <div class="fire-video-wrap">
                <img width="30px" :src="fireVideoIcon" alt="摄像头" title="摄像头" @click="addFireIcon(2)">
            </div>
            <el-button type="primary" class="primary-btn" size="small" @click="submitConfigInfo()">确定</el-button>
        </div>
        <div class="station-bg-wrap" ref="station" @mousemove="dragPos" @mouseup="stopMoveIcon">
            <!-- <img :src="stationImg" alt="场站底图"> -->
            <ImageFromPath :path="stationImg" ref="imageStation"/>
            <div class="fire-wrap" v-if="iconList.length > 0">
                <div v-for="(item, index) in iconList" :key="item.id">
                    <el-popover placement="top" title="绑定火灾报警对象" width="200" trigger="manual" v-model="item.isPop"
                        v-if="item.iconName=='fire'">
                        <div>
                            <el-select v-model="item.objectId" placeholder="请选择">
                                <el-option v-for="item2 in objectFireList" :key="item2.id" :label="item2.name"
                                    :value="item2.id">
                                </el-option>
                            </el-select>
                        </div>
                        <img slot="reference" width="30px" :src="fireAlarmNormalIcon" alt="烟感"
                            :style="{ top: item.top, left: item.left }" ref="icon" @mousedown="moveIcon(index)"
                            @contextmenu.prevent="deleteIcon(iconList, index)" @dblclick="item.isPop = !item.isPop" />
                    </el-popover>
                    <el-popover placement="top" title="绑定视频" width="200" trigger="manual" v-model="item.isPop" 
                    v-if="item.iconName=='video'">
                        <div>
                            <el-select v-model="item.objectId" placeholder="请选择">
                                <el-option v-for="item in objectVideoList" :key="item.id" :label="item.name"
                                    :value="item.id">
                                </el-option>
                            </el-select>
                        </div>
                        <img slot="reference" width="30px" :src="fireVideoIcon" alt="摄像头"
                            :style="{ top: item.top, left: item.left }" ref="icon" @mousedown="moveIcon(index)"
                            @contextmenu.prevent="deleteIcon(iconList, index)" @dblclick="item.isPop = !item.isPop" />
                    </el-popover>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import {
        Component,
        Vue
    } from 'vue-property-decorator'
    const server = require('../../../public/serverconfig.json')
    import {
        selectMeasObjectsByCondition
    } from '@/api/measobject'
    import store from '@/store'
    import {
        getFireBGImg,
        updateConfig,
        getConfig
    } from '@/api/interfaceconfig'
    import ImageFromPath from '@/components/Image/ImageFromPath.vue'
    import {
        InterfaceTypeEnum
    } from '@/types/interfaceconfig.interface'
    import {
        Station
    } from "@/types/station.interface";
    import {
        getStations
    } from "@/api/station";
    import { FireAlarmConfig } from '@/types/interfaceconfig.interface'

    @Component({
        components: {
            ImageFromPath
        }
    })
    export default class StationClass extends Vue {

        get uploadAction() {
            return `${server.ApiUrl}/interfaceconfigs/uploadFireFile`
        }

        get token() {
            return {
                'Authorization': store.state.token
            }
        }

        stations: Station[] = []

        stationId: number = 1

        stationImg: string = ''

        fireAlarmNormalIcon: string = require('@/assets/smoke-alarm-normal.png')

        fireVideoIcon: string = require('@/assets/fire-video-icon.png')

        iconList: any[] = []

        objectFireList: any[] = []
        objectVideoList: any[] = []

        flag: boolean = false
        isNullId: boolean = false

        id: number = -1

        imgBOXW: number = 0
        imgBOXH: number = 0

        disX: number = 0
        disY: number = 0

        mounted() {
            // 获取所有场站
            this.getStations()
            // 视频
            this.getMeasObjects(1).then(res => {
                let {
                    code,
                    data
                } = res
                if (code === 200) {
                    this.objectVideoList = data
                }
            })
            // 火灾报警对象
            this.getMeasObjects(2).then(res => {
                let {
                    code,
                    data
                } = res
                if (code === 200) {
                    this.objectFireList = data
                }
            })
            this.getImageSize()
            // 查看是否有配置
            getConfig().then(res => {
                let {
                    code,
                    data
                } = res.data
                if (code === 200) {
                    this.isNullId = data.every(item => item.name !== '火灾报警配置界面')
                    // 回显
                    if (this.isNullId === false) {
                        this.getFireBGImg()
                        data.map(ele => {
                            if (ele.name === '火灾报警配置界面') {
                                this.id = ele.id
                                this.stationId = ele.stationId
                                this.iconList = JSON.parse(ele.param)
                            }
                        })
                    }
                }
            })
            let stationBOX: any = this.$refs.station
            
        }

        getImageSize() {
            setTimeout(() => {
                let ref: any = this.$refs['imageStation']
                this.imgBOXW = ref.$el.offsetWidth
                this.imgBOXH = ref.$el.offsetHeight
            }, 300)
        }

        handleSuccess(response, file, fileList) {
            if (response.code === 200) {
                this.stationImg = ''
                this.getFireBGImg()
            }
        }

        getFireBGImg() {
            getFireBGImg().then(res => {
                let {
                    code,
                    data
                } = res.data
                if (code === 200) {
                    this.stationImg = data.replace(/\\/g, '/')
                }
            })
        }

        handleExceed(files, fileList) {
            this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
        }
        beforeRemove(file, fileList) {
            return this.$confirm(`确定移除 ${ file.name }？`);
        }

        // 添加icon
        addFireIcon(type: number) {
            var temp: FireAlarmConfig = {
                iconName: '',
                top: '70px',
                left: '150px',
                topPercen: '',
                leftPercen: '',
                objectId: null,
                objectName: '',
                isMove: false,
                isPop: false
            }
            if (type === 1) {
                temp.iconName = 'fire'
            } else if (type === 2) {
                temp.iconName = 'video'
                temp.top = '110px'
            }
            this.iconList.push(temp)
        }

        moveIcon(idx: number, event) {
            this.iconList[idx].isMove = true
            let refFireIcon: any = this.$refs.icon[idx]
            refFireIcon.setCapture && refFireIcon.setCapture()
        }

        stopMoveIcon() {
            for (let i = 0; i < this.iconList.length; i++) {
                const element = this.iconList[i];
                if (element.isMove) {
                    element.isMove = false
                    let refFireIcon: any = this.$refs.icon[i]
                    refFireIcon.releaseCapture && refFireIcon.releaseCapture()
                }
            }
        }

        dragPos(event) {
            for (let i = 0; i < this.iconList.length; i++) {
                const element = this.iconList[i]
                // 找到可拖拽的对象
                if (element.isMove) {
                    let refFireIcon: any = this.$refs.icon[i]

                    let domW = refFireIcon.width / 2
                    let domH = refFireIcon.height / 2

                    let refStation: any = this.$refs['station']

                    let e = event || window.event

                    this.disX = e.clientX - refStation.offsetLeft
                    this.disY = e.clientY - refStation.offsetTop

                    let domTop = Math.max(this.disY - domH, 0)
                    let domLeft = Math.max(this.disX - domW, 0)

                    element.left = domLeft + 'px'
                    element.top = domTop + 'px'

                    element.topPercen = (domTop / this.imgBOXH).toFixed(2)
                    element.leftPercen = (domLeft / this.imgBOXW).toFixed(2)

                    refFireIcon.style.top = domTop
                    refFireIcon.style.left = domLeft
                }
            }
        }

        // 删除icon
        deleteIcon(iconList: any[], idx) {
            this.$confirm('确定要删除吗', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                iconList.forEach((item, index) => {
                    if (idx === index) {
                        iconList.splice(index, 1)
                    }
                })
            })
        }

        // 获取所有的监测对象
        async getMeasObjects(type: number) {
            let params = {
                objectType: type
            }
            let {
                data
            } = await selectMeasObjectsByCondition(params)
            return data
        }

        // 获取所有场站
        getStations() {
            getStations().then(res => {
                let {
                    code,
                    data
                } = res.data
                if (code === 200) {
                    this.stations = data
                }
            })
        }

        // 提交信息
        submitConfigInfo() {
            let id
            if (this.isNullId) {
                id = null
            } else {
                id = this.id
            }

            this.iconList.forEach(item => {
                if (item.iconName == "fire") {
                    let index: number = this.objectFireList.findIndex(o => o.id == item.objectId)
                    item.objectName = index > -1 ? this.objectFireList[index].name : ""
                } else {
                    let index: number = this.objectVideoList.findIndex(o => o.id == item.objectId)
                    item.objectName = index > -1 ? this.objectVideoList[index].name : ""
                }
            })

            let params = {
                id: id,
                name: '火灾报警配置界面',
                stationId: this.stationId,
                type: InterfaceTypeEnum.火灾告警,
                param: JSON.stringify(this.iconList)
            }
            updateConfig(params).then(res => {
                let {
                    code,
                    data
                } = res.data
                if (code === 200) {
                    this.$Message.success('配置项上传成功！')
                } else {
                    this.$Message.error('配置项上传失败！')
                }
            })
        }

    }
</script>
<style lang="less" scoped>
    .sp {
        font-size: 16px;
    }

    .add-icon-wrap {
        text-align: right;

        div {
            display: inline-block;
            vertical-align: middle;
            margin-right: 20px;
        }

        .primary-btn {
            display: inline-block;
            vertical-align: middle;
        }
    }

    .station-bg-wrap {
        border: 1px solid black;
        height: 65vh;
        position: relative;

        img {
            // width: auto !important;
        }

        .fire-wrap,
        .video-wrap {
            img {
                position: absolute;
                z-index: 99;
                width: 30px !important;
            }
        }
    }
</style>