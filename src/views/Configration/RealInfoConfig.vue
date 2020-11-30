<template>
    <div>
        <h4>实时信息配置</h4>
        <el-row>
            <el-col :span="8">
                <span class="sp">总览模块: </span>
                <Select style="width: 200px" v-model="stationId">
                    <Option v-for="item in stations" :key="`${item.id}`" :value="item.id">{{item.name}}</Option>
                </Select>
            </el-col>
            <el-col :span="8">
                <span class="sp">补偿角度：</span>
                <InputNumber :max="360" :min="0" v-model="iconPos.compensationAngle"  style="width: 200px" placeholder="请输入补偿角度"></InputNumber>
            </el-col>
            <el-col :span="24">
                <!-- 场站底图： -->
                <el-upload class="upload-demo" :action="uploadAction" :headers="token" :on-success="handleSuccess"
                    :before-remove="beforeRemove" :limit="1" :on-exceed="handleExceed">
                    <el-button size="small" type="primary">上传实时信息底图</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传一张图片，图片不超过500kb</div>
                </el-upload>
            </el-col>
        </el-row>
        <div class="add-icon-wrap">
            <el-button type="primary" class="primary-btn" size="small" @click="submitConfigInfo()">确定</el-button>
        </div>
        <div class="img-wrap" ref="realInfo" @mousemove="dragPos" @mouseup="stopMoveIcon">
            <ImageFromPath :path="realInfoImg" ref="imageRealInfo" />
            <img 
                :src="camera" 
                ref="cameraIcon" 
                class="camera-icon" 
                @mousedown="moveIcon()"
                :style="{top: iconPos.top, left: iconPos.left}"
            >
        </div>
    </div>
</template>
<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import ImageFromPath from '@/components/Image/ImageFromPath.vue'
    const server = require('../../../public/serverconfig.json')
    import store from '@/store'
    import { Station } from "@/types/station.interface";
    import { getStations } from "@/api/station";
    import { getRealInfoBG } from '@/api/interfaceconfig'
    import { InterfaceTypeEnum } from '@/types/interfaceconfig.interface'
    import { 
        updateConfig,
        getConfig
    } from '@/api/interfaceconfig'
    
    @Component({
        components: { ImageFromPath }
    })
    export default class StationClass extends Vue {

        stations: Station[] = []
        
        stationId:number = 0

        realInfoImg:string = ''

        camera: string = require('@/assets/images/LaserMethaneVideoDir.png')

        isNullId: boolean = false

        id: number = -1

        disX: number = 0
        disY: number = 0

        imgBOXW: number = 0
        imgBOXH: number = 0

        iconPos: any = {
            top: '',
            left: '',
            topPercen: '',
            leftPercen: '',
            bgWidth: 0,
            bgHeight: 0,
            compensationAngle: 0
        }

        isMove: boolean = false

        stationImg: string = ''

        get uploadAction() {
            return `${server.ApiUrl}/lasermethanes/uploadBgiFile`
        }

        get token() {
            return {
                'Authorization': store.state.token
            }
        }

        mounted() {
            // 获取所有场站
            this.getStations()
            this.getImageSize()
            // 查看是否有配置
            getConfig().then(res => {
                let {
                    code,
                    data
                } = res.data
                if (code === 200) {
                    this.isNullId = data.every(item => item.name !== '实时信息配置界面')
                    // 回显
                    if (this.isNullId === false) {
                        this.getRealInfoBGImg()
                        data.map(ele => {
                            if (ele.name === '实时信息配置界面') {
                                this.id = ele.id
                                this.stationId = ele.stationId
                                this.iconPos = JSON.parse(ele.param)
                            }
                        })
                    }
                }
            })
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
        
        getRealInfoBGImg() {
            getRealInfoBG().then(res => {
                let {
                    code,
                    data
                } = res.data
                if (code === 200) {
                    this.realInfoImg = data.replace(/\\/g, '/')
                }
            })
        }

        handleSuccess(response, file, fileList) {
            if (response.code === 200) {
                this.realInfoImg = ''
                this.getRealInfoBGImg()
            }
        }

        handleExceed(files, fileList) {
            this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
        }

        beforeRemove(file, fileList) {
            return this.$confirm(`确定移除 ${ file.name }？`);
        }

        getImageSize() {
            setTimeout(() => {
                let ref: any = this.$refs['imageRealInfo']
                this.imgBOXW = ref.$el.width
                this.imgBOXH = ref.$el.height
            }, 300)
        }
        
        dragPos(event) {
            if (this.isMove) {
                let refCameraIcon: any = this.$refs['cameraIcon']
    
                let domW = refCameraIcon.width / 2
                let domH = refCameraIcon.height / 2
    
                let refRealInfo: any = this.$refs['realInfo']
    
                let e = event || window.event
    
                this.disX = e.clientX - refRealInfo.offsetLeft
                this.disY = e.clientY - refRealInfo.offsetTop

                let domTop = Math.max(this.disY - domH, 0)
                let domLeft = Math.max(this.disX - domW, 0)
    
                this.iconPos.left = domLeft + 'px'
                this.iconPos.top = domTop + 'px'
    
                this.iconPos.topPercen = (domTop / this.imgBOXH).toFixed(2)
                this.iconPos.leftPercen = (domLeft / this.imgBOXW).toFixed(2)

                this.iconPos.bgWidth = this.imgBOXW
                this.iconPos.bgHeight = this.imgBOXH
    
                refCameraIcon.style.top = domTop + 'px'
                refCameraIcon.style.left = domLeft + 'px'
            }
        }

        stopMoveIcon() {
            this.isMove = false
            let refCameraIcon: any = this.$refs['cameraIcon']
            refCameraIcon.releaseCapture && refCameraIcon.releaseCapture()
        }

        moveIcon() {
            this.isMove = true
        }

        submitConfigInfo() {
            let id
            if (this.isNullId) {
                id = null
            } else {
                id = this.id
            }
            let params = {
                id: id,
                name: '实时信息配置界面',
                stationId: this.stationId,
                type: InterfaceTypeEnum.实时信息,
                param: JSON.stringify(this.iconPos)
            }
            updateConfig(params).then(res => {
                let { code, data } = res.data
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
    .add-icon-wrap {
        text-align: right;
        margin-bottom: 10px;
    }
    .img-wrap {
        position: relative;
        height: 65vh;
        border: 1px solid #ccc;
        .camera-icon {
            position: absolute;
            top: 20px;
            left: 100px;
            z-index: 99;
        }
    }
</style>