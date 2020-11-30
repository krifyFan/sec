<template>
    <div class="alarm-fire-wrap modal-wrap">
        <div class="content-wrap">
            <div class="left-wrap">
                <div class="info-wrap">
                    <Row>
                        <Col span="12">
                            <span class="info-label">告警编号：</span>
                            <span>{{ currentAlarm.id }}</span>
                        </Col>
                        <Col span="12">
                            <span class="info-label">烟感编号：</span>
                            <span>{{ currentAlarm.objId }}</span>
                        </Col>
                        <Col span="12">
                            <span class="info-label">告警类型：</span>
                            <span>{{ currentAlarm.alarmType.name }}</span>
                        </Col>
                        <Col span="12">
                            <span class="info-label">烟感名称：</span>
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
                    <!-- <VideoComponent
                        :video="video"
                        ref="video"
                        id="alarmVideo_id"
                        AutoPlay
                    ></VideoComponent> -->
                    <VideoBox ref="videoBoxRef"></VideoBox>
                </div>
            </div>
            <div class="right-wrap">
                <div class="img-wrap">
                    <AlarmImage :alarm="currentAlarm" v-if="isPicActive"/>
                    <div v-else class="img-label">拍照未完成</div>
                </div>
                <div class="operate-wrap">
                    <div class="operate-item">
                        <img :src="slAlarmActive" alt="声光报警">
                        <div class="operate-label">声光报警</div>
                    </div>
                    <div class="operate-item">
                        <img :src="isPicActive == true ? pictureActive: pictureNormal" alt="拍照">
                        <div class="operate-label">拍照</div>
                    </div>
                    <div class="operate-item">
                        <img :src="isVideoActive == true ? videoActive: videoNormal" alt="录像">
                        <div class="operate-label">录像</div>
                    </div>
                    <div class="operate-item">
                        <img :src="reportActive" alt="上报">
                        <div v-if="reporTime===0">
                            <div class="operate-label operate-count-down">
                                <img :src="reportIcon" width="60%">
                            </div>
                            <div class="operate-label">已上报</div>
                        </div>
                        <div v-else>
                            <div class="operate-label operate-count-down">{{reporTime}}</div>
                            <div class="operate-label">秒后自动上报</div>
                        </div>
                    </div>
                    <div class="operate-item">
                        <div class="btn-wrap"></div>
                        <div class="btn-wrap">
                            <Button class="btn" @click="confirmAlarm()" :disabled="isConfirmSuccess">确认</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from "vue-property-decorator";
import { getDefaultVideo, getAlarmPerimeterVideo } from "@/api/video";
import { Alarm } from "@/types/alarm.interface";
import { getDefaultAlarm } from "@/api/alarm";
import { Video } from "@/types/video.interface";
import VideoComponent from "@/components/Video/CommonVideo.vue";
import VideoBox from "@/components/Video/VideoSquaredBox.vue";
import AlarmImage from '@/components/view/AlarmImage.vue'
import { cleanAlarm, reportAlarm, alarmSync } from '@/api/alarm'
import { log } from 'three';

@Component({
    components: {
        VideoComponent,
        AlarmImage,
        VideoBox
    },
})
export default class AlarmVideo extends Vue {
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

    slAlarmActive:string = require('@/assets/images/sl-alarm-active.png')

    isPicActive: boolean = false
    pictureActive:string = require('@/assets/images/picture-active.png')
    pictureNormal:string = require('@/assets/images/picture-normal.png')

    isVideoActive: boolean = false
    videoActive:string = require('@/assets/images/video-active.png')
    videoNormal:string = require('@/assets/images/video-normal.png')

    reportActive:string = require('@/assets/images/report-active.png')
    reportIcon: string = require('@/assets/images/report-icon.png')

    reporTime: number = 10

    isConfirmSuccess: boolean = false

    timer?: any

    @Prop({
        required: false
    })picMessage: any

    @Prop({
        required: false
    })videoComplete: any

    @Prop({
        required: false
    })fireAlarm: any

    @Watch('picMessage')
    watchPicActive(newVal) {
        if (newVal.body === this.fireAlarm.id) {
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

    mounted() {
        this.initConfig()
        clearInterval(this.timer)
        this.timer = setInterval(()=>{
            this.reporTime--
            if (this.reporTime === 0) {
                clearInterval(this.timer)
                this.report()
            }
        }, 1000)
        this.$refs.videoBoxRef.ArrangeWindowChildren(1)
    }

    initConfig() {
        alarmSync().then(res => {
            let { code, data } = res.data
            if (code === 200) {
                this.reporTime = data.fireAlarm                
            }
        })
    }

    report() {
        reportAlarm(this.currentAlarm).then(res => {
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
        this.currentAlarm = alarm;
        this.getVideosInfo();
    }

    // 获取视频信息
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
    
    destroyed() {
        clearInterval(this.timer)
    }
}
</script>

<style lang="less">
</style>