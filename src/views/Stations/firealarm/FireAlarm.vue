<template>
    <div class="fire-alarm">
        <div class="fire-alarm-wrap">
            <ImageFromPath style="width: 100%;" ref="imageStation" :path="stationImg" />
            <div class="fire-wrap">
                <div v-for="(item, index) in fireList" :key="`fireList${index}`">
                    <img slot="reference" width="30px" :src="item.alarmInfo ?  fireAlarmIcon : fireAlarmNormalIcon" class="fireIcon" :style="{ top: item.top, left: item.left }" ref="fireIcon" alt="烟感" @click="showFireAlarmInfo(item, index)" />
                    <div v-show="item.isShow" class="tip-wrap" ref="tipInfo" :style="{ top: item.tipTop, left: item.tipLeft, backgroundImage: `url(${alarmInfoBG})`, backgroundSize: '100% 100%' }">
                        <div class="title">{{item.objectName}}</div>
                        <Icon class="close-icon" type="md-close" @click="closeTipWrap(item, index)" />
                        <div class="alarm-status">告警状态：{{item.alarmInfo ? item.alarmInfo.levelName : "正常"}}</div>
                        <div class="alarm-time" v-if="item.alarmInfo">
                            <div>告警时间：{{item.alarmInfo.time}}</div>
                            <div class="btn-wrap" v-if="item.alarmInfo">
                                <Button type="primary" size="small" @click="cleanAlarm(item.alarmInfo)">清除</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="video-wrap">
                <div v-for="(item, index) in videoList" :key="`videoList-${item.id}`">
                    <img width="30px" :src="fireVideoIcon" alt="摄像头" :style="{ top: item.top, left: item.left }" ref="videoIcon" slot="reference" class="videoIcon" @click="showVideoInfo(item)" />
                    <div v-show="item.isShow" class="tip-wrap tip-video-wrap" ref="tipInfo" :style="{ top: item.tipTop, left: item.tipLeft, backgroundImage: `url(${videoInfoBG})`, backgroundSize: '100% 100%' }">
                        <div class="title">{{videoInfo.name}}</div>
                        <Icon class="close-icon" type="md-close" @click="closeTipWrap(item, index)" />
                        <div class="video">
                            <VideoComponent ref="video" :id="`fireAlarm${index}`" :video="videoInfo" AutoPlay>
                            </VideoComponent>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import {
        Component,
        Vue
    } from "vue-property-decorator";
    import ImageFromPath from '@/components/Image/ImageFromPath.vue'
    import {
        getFireBGImg,
        getConfig
    } from '@/api/interfaceconfig'
    import {
        selectMeasObjectsByCondition
    } from '@/api/measobject'
    import {
        getAlarmsByCondition,
        cleanAlarm
    } from '@/api/alarm'
    import {
        getVideoDto
    } from '@/api/video'
    import VideoComponent from '@/components/Video/CommonVideo.vue'

    @Component({
        components: {
            ImageFromPath,
            VideoComponent
        }
    })
    export default class FireAlarm extends Vue {

        fireAlarmNormalIcon: string = require('@/assets/smoke-alarm-normal.png')

        fireAlarmIcon: string = require('@/assets/smoke-alarm.png')

        fireVideoIcon: string = require('@/assets/fire-video-icon.png')

        alarmInfoBG: string = require('@/assets/images/alarm-info-bg.png')

        videoInfoBG: string = require('@/assets/images/alarm-video-bg.png')

        stationImg: string = ''

        fireList: any[] = []
        videoList: any[] = []

        fireAlarmInfo: any = {}
        videoInfo: any = {}

        id: number = 0

        imgBOXW: number = 0
        imgBOXH: number = 0

        mounted() {
            this.getImageSize()
            getFireBGImg().then(res => {
                let {
                    code,
                    data
                } = res.data
                if (code === 200) {
                    this.stationImg = data.replace(/\\/g, '/')
                }
            })
            // 查看是否有配置
            setTimeout(() => {
                getConfig().then(res => {
                    let {
                        code,
                        data
                    } = res.data
                    if (code === 200) {
                        // 回显
                        let ref: any = this.$refs['imageStation']
                        data.map(ele => {
                            if (ele.name === '火灾报警配置界面') {
                                this.id = ele.id
                                let configData = JSON.parse(ele.param)
                                this.fireList = []
                                this.videoList = []
                                configData.map(element => {
                                    let leftNum = Number(element.leftPercen) * this.imgBOXW
                                    let topNum = Number(element.topPercen) * this.imgBOXH

                                    element.top = Number(topNum.toFixed(2)) + 'px'
                                    element.left = Number(leftNum.toFixed(2)) + 'px'

                                    element.isShow = false
                                    element.tipLeft = Number(leftNum.toFixed(2)) + 30 + 'px'
                                    element.tipTop = Number(topNum.toFixed(2)) - 20 + 'px'
                                    element.alarmInfo = null

                                    if (element.iconName === 'fire') {
                                        this.fireList.push(element)
                                    } else if (element.iconName === 'video') {
                                        element.tipTop = Number(topNum.toFixed(2)) - 30 + 'px'
                                        this.videoList.push(element)
                                    }
                                })

                                this.searchFireAlarm()
                                this.refresh()

                            }
                        })
                    }
                })
            }, 300)
        }

        getImageSize() {
            setTimeout(() => {
                let ref: any = this.$refs['imageStation']
                this.imgBOXH = ref.$el.offsetHeight
                this.imgBOXW = ref.$el.offsetWidth
            }, 300)
        }


        refresh() {
            const timer = setInterval(() => {
                this.searchFireAlarm()
            }, this.ProjectConfig.DataRefreshTime);
            this.$once('hook:beforeDestroy', () => {
                clearInterval(timer);
            })
        }

        // 查找火灾告警
        searchFireAlarm() {
            for (let i = 0; i < this.fireList.length; i++) {
                let params = {
                    objId: this.fireList[i].objectId,
                    cleaned: false
                }
                getAlarmsByCondition(params).then(res => {
                    if (res.data.code == 200 && res.data.data.length > 0) {
                        this.fireList[i].alarmInfo = res.data.data[0]
                        this.fireList[i].alarmInfo.time = new Date(this.fireList[i].alarmInfo.timeStamp).format(
                            "yyyy-MM-dd hh:mm:ss")
                    } else {
                        this.fireList[i].alarmInfo = null
                    }
                })
            }
        }

        showFireAlarmInfo(item: any, index: number) {
            this.$set(this.fireList[index], "isShow", true)
        }

        closeTipWrap(item, index) {
            this.$nextTick(() => {
                item.isShow = false
            })

        }

        cleanAlarm(item) {
            cleanAlarm(item.id).then(res => {
                let {
                    code,
                    data
                } = res.data
                if (code === 200) {
                    this.$Message.success('告警清除成功！')
                    item.isShow = false
                    this.searchFireAlarm()
                } else {
                    this.$Message.error('告警清除失败！')
                }
            })
            this.$nextTick(() => {
                item.isShow = false
            })
        }

        showVideoInfo(item) {
            getVideoDto(item.objectId).then(res => {
                let {
                    code,
                    data
                } = res.data
                if (code === 200) {
                    this.videoInfo = data
                }
            })
            this.$nextTick(() => {
                item.isShow = true
            })
        }
    }
</script>
<style lang="less">
.fire-alarm {
    height: 100%;
    overflow: hidden;
    position: relative;

    .fire-alarm-wrap {
        display: flex;
        margin: 5rem 4.25rem 0;
        // margin-bottom: 3rem;
        height: 90vh;
        position: relative;

        .fire-wrap,
        .video-wrap {
            img {
                position: absolute;
                z-index: 99;
            }

            .tip-wrap {
                position: absolute;
                width: 300px;
                min-height: 110px;
                z-index: 100;

                .alarm-status,
                .alarm-time {
                    font-size: 14px;
                    color: #fff;
                    margin-left: 30px;
                }

                .title {
                    text-align: center;
                    font-size: 20px;
                    color: #2ed1f6;
                    line-height: 1.8;
                }

                .close-icon {
                    right: 2px;
                    position: absolute;
                    top: 2px;
                    color: #fff;
                    font-size: 20px;
                    cursor: pointer;
                }

                .btn-wrap {
                    text-align: right;
                    margin-bottom: 10px
                }
            }
        }

        .tip-video-wrap {
            width: 400px !important;
            min-height: 250px;

            .video {
                width: 360px;
                height: 210px;
                margin-left: 35px;
            }
        }

        .fire-alarm-info-wrap {
            width: 200px;
            height: 150px;
        }
    }
}
</style>