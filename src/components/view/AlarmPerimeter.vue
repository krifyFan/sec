<template>
    <div class="alarm-perimeter-wrap modal-wrap">
        <div class="content-wrap">
            <div class="left-wrap">
                <div class="alarm-info-wrap info-wrap">
                    <Row>
                        <Col span="12">
                            <span class="info-label">告警编号：</span>
                            <span>{{ currentAlarm.id }}</span>
                        </Col>
                        <Col span="12">
                            <span class="info-label">防区编号：</span>
                            <span>{{ currentAlarm.objId }}</span>
                        </Col>
                        <Col span="12">
                            <span class="info-label">告警类型：</span>
                            <span>{{ currentAlarm.alarmType.name }}</span>
                        </Col>
                        <Col span="12">
                            <span class="info-label">防区名称：</span>
                            <span>{{ currentAlarm.objectName }}</span>
                        </Col>
                        <Col span="12">
                            <span class="info-label">告警级别：</span>
                            <span>{{ currentAlarm.levelName }}</span>
                        </Col>
                        <Col span="12">
                            <span class="info-label">告警时间：</span>
                            <span>{{ new Date(this.currentAlarm.timeStamp).format("MM-dd hh:mm:ss")}}</span>
                        </Col>
                    </Row>
                </div>
                <div class="video-wrap">
                    <VideoBox ref="videoBoxRef"></VideoBox>
                </div>
            </div>
            <div class="right-wrap">
                <div class="img-wrap">
                    <AlarmImage :alarm="currentAlarm" v-if="isPicActive"></AlarmImage>
                    <div v-else class="img-label">拍照未完成</div>
                </div>
                <div class="operate-wrap">
                    <div class="operate-item" v-if="!isVerifyComplete">
                        <img :src="reviewActive" alt="复核">
                        <div class="operate-label">复核倒计时{{reviewTime}}秒</div>
                    </div>
                    <div class="operate-item" v-else>
                        <img :src="reviewActive" alt="复核">
                        <div class="operate-label">收到复核</div>
                    </div>
                    <div class="operate-item">
                        <img :src="isPicActive == true ? pictureActive: pictureNormal" alt="拍照">
                        <div class="operate-label">拍照</div>
                    </div>
                    <div class="operate-item">
                        <img :src="isVideoActive == true ? videoActive : videoNormal" alt="录像">
                        <div class="operate-label">录像</div>
                    </div>
                    <div class="operate-item" v-if="isVerifyComplete">
                        <img :src="reportActive" alt="上报">
                        <!-- <div class="operate-label operate-count-down">{{reportTime}}</div>
                        <div class="operate-label">秒后自动上报</div> -->
                        <div v-if="reportTime===0">
                            <div class="operate-label operate-count-down">
                                <img :src="reportIcon" width="60%">
                            </div>
                            <div class="operate-label">已上报</div>
                        </div>
                        <div v-else>
                            <div class="operate-label operate-count-down">{{reportTime}}</div>
                            <div class="operate-label">秒后自动上报</div>
                        </div>
                    </div>
                    <div class="operate-item" v-if="isReview && !isVerifyComplete">
                        <img :src="reportNormal" alt="上报">
                        <div class="operate-label operate-count-down">0</div>
                        <div class="operate-label">未开始</div>
                    </div>
                    <div class="operate-item" v-if="!isReview && !isVerifyComplete">
                        <img :src="reportNormal" alt="上报">
                        <div class="operate-label operate-count-down">0</div>
                        <div class="operate-label">上报中止</div>
                    </div>
                    <div class="operate-item">
                        <div class="btn-wrap">
                            <Button class="btn" @click="confirmAlarm()" :disabled="isConfirmSuccess">确认</Button>
                        </div>
                        <div class="btn-wrap">
                            <Button class="btn" :disabled="reportTime===0" @click="report()">上报</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from "vue-property-decorator";
import {
    getVideoDto,
    getDefaultVideo,
    getAlarmPerimeterVideo,
} from "@/api/video";
import { Alarm } from "@/types/alarm.interface";
import { getDefaultAlarm, upgradeAlarm } from "@/api/alarm";
import { getDate, getTime } from "@/api/date";
import { Video } from "@/types/video.interface";
import VideoComponent from "@/components/Video/CommonVideo.vue";
import VideoBox from "@/components/Video/VideoSquaredBox.vue";
import AlarmImage from '@/components/view/AlarmImage.vue'
import { alarmPerimeterConfigs, reportAlarm, alarmSync, cleanAlarm } from '@/api/alarm'
import { StepRenderSlots } from 'element-ui/types/step';

@Component({
    components: {
        VideoComponent,
        VideoBox,
        AlarmImage
    },
})
export default class AlarmPerimeter extends Vue {
    currentAlarm: Alarm = getDefaultAlarm();

    selectedValue: number = 0;
    presetList: any[] = [
        {
            label: "1",
            value: 1,
        },
        {
            label: "2",
            value: 2,
        },
        {
            label: "3",
            value: 3,
        },
        {
            label: "4",
            value: 4,
        },
    ];

    videos: Video = getDefaultVideo();

    $refs: {
        videoBoxRef: HTMLFormElement;
    };

    isShowUpgrade: boolean = true

    reviewActive: string = require('@/assets/images/review-active.png')

    isPicActive: boolean = false
    pictureNormal: string = require('@/assets/images/picture-normal.png')
    pictureActive:string = require('@/assets/images/picture-active.png')

    isVideoActive: boolean = false
    videoNormal: string = require('@/assets/images/video-normal.png')
    videoActive: string = require('@/assets/images/video-active.png')

    reportNormal: string = require('@/assets/images/report-normal.png')
    reportActive: string = require('@/assets/images/report-active.png')
    reportIcon: string = require('@/assets/images/report-icon.png')

    isReview: boolean = false
    reviewTime: number = 0
    reportTime: number = 0
    reviewTimer?: any
    reportTimer?: any

    isConfirmSuccess: boolean = false

    @Prop({
        required: false
    })picMessage: any

    @Prop({
        required: false
    })videoComplete: any

    @Prop({
        required: false
    })perimeterAlarm: any

    @Prop({
        required: false,
        type: Boolean,
        default: false
    })isVerifyComplete


    @Watch('picMessage')
    watchPicActive(newVal) {
        if (newVal.body === this.perimeterAlarm.id) {
            this.isPicActive = true
        } else {
            this.isPicActive = false
        }
    }

    @Watch('videoComplete')
    watchVideoComplete(newVal) {
        if (newVal.body === this.perimeterAlarm.id) {
            this.isVideoActive = true
        } else {
            this.isVideoActive = false
        }
    }

    // 收到复核
    @Watch('isVerifyComplete')
    watchIsVerifyComplete(newVal) {
        clearInterval(this.reviewTimer)
        this.initConfig()
        this.reportTimer = setInterval(()=>{
            this.reportTime--
            if (this.reportTime === 0) {
                clearInterval(this.reportTimer)
            }
        }, 1000)
        this.isReview = false
    }


    mounted() {
        this.initConfig()
        this.reviewTimer = setInterval(()=> {
            this.reviewTime--
            this.isReview = true
            if (this.reviewTime === 0) {
                this.isReview = false
                clearInterval(this.reviewTimer)
            }
        }, 1000)
        this.$refs.videoBoxRef.ArrangeWindowChildren(1)
    }

    initConfig() {
        // 复核时间
        alarmPerimeterConfigs().then(res => {
            let { code, data } = res.data
            if (code === 200) {
                this.reviewTime = data.upgradeWaitTime
            }
        })

        // 上报时间
        alarmSync().then(res => {
            let { code, data } = res.data
            if (code === 200) {
                this.reportTime = data.intrusionAlarm
            }
        })
    }

    // 上报
    report() {
        this.reportTime = 0
        clearInterval(this.reportTimer)
        reportAlarm(this.perimeterAlarm).then(res => {
            let { code, data } = res.data
            if (code === 200) {
                this.$Message.success('上报成功！')
            } else {
                this.$Message.error('上报失败！')
            }
        })

    }

    // 确认
    confirmAlarm() {
        cleanAlarm(this.currentAlarm.id).then(res => {
            let { code, data } = res.data
            if (code === 200) {
                this.$Message.success('确认成功！')
                this.isConfirmSuccess = true
            } else {
                this.$Message.error('确认失败！')
                this.isConfirmSuccess = false
            }
        })
    }

    /** 初始化视频 */
    initVideo(alarm: Alarm) {
        this.$forceUpdate();
        // 因为同步问题，所以这里采用将alarm直接传入的方式来
        console.log("当前告警", this.currentAlarm);
        console.log("传入的alarm-----------", alarm);
        this.currentAlarm = alarm;
        this.getVideosInfo();
    }

    /** 获取视频信息 */
    getVideosInfo() {
        getAlarmPerimeterVideo(this.currentAlarm).then((res: any) => {
            let { code, data } = res.data;
            if (code != 200) return;
            this.videos = data;
            this.$refs.videoBoxRef.setVideos(this.videos);
            this.$refs.videoBoxRef.ArrangeWindowChildren(1)
            console.log("告警视频为:", this.videos);
        });
    }

    /** 升级确认 */
    upgradeConfirmation() {
        upgradeAlarm(this.currentAlarm).then((res) => {
            let { code, data } = res.data
            if (code === 200) {
                if (data === true) {
                    this.isShowUpgrade = false
                    this.$Message.success('升级成功！')
                } else {
                    this.$Message.error('升级失败！')
                }
            }
        });
    }

    destroyed() {
        clearInterval(this.reportTimer)
        clearInterval(this.reviewTimer)
    }
}
</script>

<style lang="less">
</style>
