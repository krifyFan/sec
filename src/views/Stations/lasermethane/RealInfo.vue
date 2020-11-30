<template>
    <div class="RealInfoClass">
        <div class="modular-title">实时信息</div>
        <div class="content">
            <div class="videoDirection">
                <ImageFromPath :path="realInfoImg" ref="imageRealInfo" />
                <img ref="cameraIcon" class="video" src="../../../assets/images/LaserMethaneVideoDir.png"
                    :style="{transform:'rotate('+ deepVideoX.lastValue +'deg)'}" />
            </div>
            <div class="dataShow">
                <div class="data-show-wrap">
                    <div class="name">{{deepMethane.name}}: </div>
                    <ProgressBar :data="methaneProp" class="progress-wrap"/>
                    <div class="last-value">{{deepMethane.lastValue}}</div>
                </div>
                <div class="data-show-wrap">
                    <div class="name">{{deepLight.name}}: </div>
                    <ProgressBar :data="lightProp" class="progress-wrap"/>
                    <div class="last-value">{{deepLight.lastValue}}</div>
                </div>
                <div class="data-show-wrap">
                    <div class="name">{{deepVideoX.name}}: </div>
                    <ProgressBar :data="videoXProp" class="progress-wrap"/>
                    <div class="last-value">{{deepVideoX.lastValue}}</div>
                </div>
                <div class="data-show-wrap">
                    <div class="name">{{deepVideoY.name}}: </div>
                    <ProgressBar :data="videoYProp" class="progress-wrap"/>
                    <div class="last-value">{{deepVideoY.lastValue}}</div>
                </div>
                <div class="data-show-wrap">
                    <div class="name">{{deepVideoZ.name}}: </div>
                    <ProgressBar :data="videoZProp" class="progress-wrap"/>
                    <div class="last-value">{{deepVideoZ.lastValue}}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Prop,
        Vue,
        Watch
    } from "vue-property-decorator"
    import {
        MeasObjectVo,
        MeasObject
    } from '@/types/measobject.interface'
    import {
        MeasObjectVal
    } from '@/types/measobjectval.interface'
    import {
        getDefaultMeasObjectVal,
        getMeasObjectVal
    } from '@/api/measobject'
    import ProgressBar from '@/components/chart/progressBar.vue'
    import common, { deepCopy } from '@/util/common'
    import ImageFromPath from '@/components/Image/ImageFromPath.vue'
    import { getRealInfoBG } from '@/api/interfaceconfig'
    import {  getConfig } from '@/api/interfaceconfig'

    @Component({
        components: { ProgressBar, ImageFromPath }
    })
    export default class RealInfo extends Vue {
        // 甲烷对象
        @Prop({
            required: true,
            type: Object,
            default: () => {
                return getDefaultMeasObjectVal()
            }
        })
        methane: MeasObjectVal
        // 光强对象
        @Prop({
            required: true,
            type: Object,
            default: () => {
                return getDefaultMeasObjectVal()
            }
        })
        light: MeasObjectVal
        // X
        @Prop({
            required: true,
            type: Object,
            default: () => {
                return getDefaultMeasObjectVal()
            }
        })
        videoX: MeasObjectVal
        // Y
        @Prop({
            required: true,
            type: Object,
            default: () => {
                return getDefaultMeasObjectVal()
            }
        })
        videoY: MeasObjectVal
        // Z
        @Prop({
            required: true,
            type: Object,
            default: () => {
                return getDefaultMeasObjectVal()
            }
        })

        realInfoImg:string = ''

        imgBOXW: number = 0
        imgBOXH: number = 0

        compensationAngle:number = 0

        videoZ: MeasObjectVal

        methaneProp: any = {
            id: 'methaneId',
            bg: '#0D4663',
            valueBG: '#33EAFD',
            isCenter: true,
            value: 20
        }

        lightProp: any = {
            id: 'lightId',
            bg: '#AD9358',
            valueBG: '#F8B05F',
            isCenter: false,
            value: 70
        }

        videoXProp: any = {
            id: 'videoXId',
            bg: '#AD9358',
            valueBG: '#F8B05F',
            isCenter: true,
            value: 0
        }

        videoYProp: any = {
            id: 'videoYId',
            bg: '#AD9358',
            valueBG: '#F8B05F',
            isCenter: true,
            value: -30
        }

        videoZProp: any = {
            id: 'videoYId',
            bg: '#AD9358',
            valueBG: '#F8B05F',
            isCenter: false,
            value: 34
        }

        deepMethane: MeasObjectVal = {
            id: -1,
            name: '',
            stationId: 0,
            objectType: 0,
            dataType: 0,
            lastValue: 0,
            lastTime: new Date()
        }
        deepLight: MeasObjectVal = {
            id: -1,
            name: '',
            stationId: 0,
            objectType: 0,
            dataType: 0,
            lastValue: 0,
            lastTime: new Date()
        }
        deepVideoX: MeasObjectVal = {
            id: -1,
            name: '',
            stationId: 0,
            objectType: 0,
            dataType: 0,
            lastValue: 0,
            lastTime: new Date()
        }
        deepVideoY: MeasObjectVal = {
            id: -1,
            name: '',
            stationId: 0,
            objectType: 0,
            dataType: 0,
            lastValue: 0,
            lastTime: new Date()
        }
        deepVideoZ: MeasObjectVal = {
            id: -1,
            name: '',
            stationId: 0,
            objectType: 0,
            dataType: 0,
            lastValue: 0,
            lastTime: new Date()
        }

        @Watch('methane')
        watchMethane(newVal) {
            this.deepMethane = deepCopy(newVal)
            this.deepMethane.lastValue = Number(this.deepMethane.lastValue.toFixed(2))
        }

        @Watch('light')
        watchLight(newVal) {
            this.deepLight = deepCopy(newVal)
            this.deepLight.lastValue = Number(this.deepLight.lastValue.toFixed(2))
        }

        @Watch('videoX')
        watchVideoX(newVal) {
            this.deepVideoX = deepCopy(newVal)
            this.deepVideoX.lastValue = Number(this.deepVideoX.lastValue.toFixed(2) + this.compensationAngle)
        }

        @Watch('videoY')
        watchVideoY(newVal) {
            this.deepVideoY = deepCopy(newVal)
            this.deepVideoY.lastValue = Number(this.deepVideoY.lastValue.toFixed(2))
        }

        @Watch('videoZ')
        watchVideoZ(newVal) {
            this.deepVideoZ = deepCopy(newVal)
            this.deepVideoZ.lastValue = Number(this.deepVideoZ.lastValue.toFixed(2))
        }
        
        mounted() {
            this.getRealInfoBGImg()
            this.getImageSize()
            this.refresh()
            // 查看是否有配置
            setTimeout(()=>{
                getConfig().then(res => {
                    let { code, data } = res.data
                    if (code === 200) {
                        let ref: any = this.$refs['cameraIcon']
                        data.map(ele => {
                            if ( ele.name && ele.name === '实时信息配置界面') {
                                let configData = JSON.parse(ele.param)
                                let leftNum = Number(configData.leftPercen) * this.imgBOXW
                                let topNum = Number(configData.topPercen) * this.imgBOXH

                                let cameraRefWidth = (this.imgBOXW / configData.bgWidth * ref.offsetWidth).toFixed(2)
                                let cameraRefHeight = (this.imgBOXH / configData.bgHeight * ref.offsetHeight).toFixed(2)

                                ref.style.top = Number(topNum.toFixed(2)) + 'px'
                                ref.style.left = Number(leftNum.toFixed(2)) + 'px'

                                ref.width = cameraRefWidth
                                ref.height = cameraRefHeight

                                this.compensationAngle = configData.compensationAngle
                            }
                        }) 
                    }
                })
            }, 300)
        }

        refresh() {
            const timer = setInterval(() => {
                this.initData()  
            }, 2000);
            this.$once('hook:beforeDestroy', () => {
                clearInterval(timer);
            })
        }

        initData() {
            getMeasObjectVal(this.deepMethane.id).then(res => {
                if (res.data.code == 200) {
                    this.deepMethane = res.data.data
                    this.methaneProp.value = this.deepMethane.lastValue = Number(this.deepMethane.lastValue.toFixed(2))
                }
                
            })
            getMeasObjectVal(this.deepLight.id).then(res => {
                if (res.data.code == 200) {
                    this.deepLight = res.data.data
                    this.lightProp.value = this.deepLight.lastValue = Number(this.deepLight.lastValue.toFixed(2))
                }
            })
            getMeasObjectVal(this.deepVideoX.id).then(res => {
                if (res.data.code == 200) {
                    this.deepVideoX = res.data.data
                    this.videoXProp.value = this.deepVideoX.lastValue = Number(this.deepVideoX.lastValue.toFixed(2))
                }
            })
            getMeasObjectVal(this.deepVideoY.id).then(res => {
                if (res.data.code == 200) {
                    this.deepVideoY = res.data.data
                    this.videoYProp.value = this.deepVideoY.lastValue = Number(this.deepVideoY.lastValue.toFixed(2))
                } 
            })
            getMeasObjectVal(this.deepVideoZ.id).then(res => {
                if (res.data.code == 200) {
                    this.deepVideoZ = res.data.data
                    this.videoZProp.value = this.deepVideoZ.lastValue = Number(this.deepVideoZ.lastValue.toFixed(2))
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

        getImageSize() {
            setTimeout(() => {
                let ref: any = this.$refs['imageRealInfo']
                this.imgBOXH = ref.$el.height
                this.imgBOXW = ref.$el.width
            }, 300)
        }
    }
</script>

<style lang="less" scoped>
    .RealInfoClass {
        width: 100%;
        height: 100%;

        .content {
            width: 100%;
            height: 85%;
            position: relative;
            display: flex;
            flex-direction: row;
            align-items: stretch;

            .videoDirection {
                flex: 3;
                // background-image: url('../../../assets/images/LaserMethaneBG.png');
                -moz-background-size: 100% 100%;
                background-size: 100% 100%;
                position: relative;
                overflow: hidden;

                .video {
                    position: absolute !important;
                    left: 35%;
                    top: 40%;
                }
            }

            .dataShow {
                flex: 2;
                padding-left: 10px;
                display: flex;
                flex-direction: column;
                .data-show-wrap {
                    flex: 1;
                    display: flex;
                    .name {
                        flex: 2;
                    }
                    .last-value {
                        flex: 1
                    }
                    .progress-wrap {
                        flex: 3;
                    }
                    .last-value {
                        margin-left: 10px;
                    }
                }
            }
        }
    }
</style>