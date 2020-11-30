<template>
    <div class="">
        <Row class="queryCondition">
            <Col span="8" text-align="right" class="select_item">
                <span class="query-label">告警编号：</span>
                <Input v-model="DetailModelData.id" class="query-content" readonly></Input>
            </Col>
            <Col span="8" class="select_item">
                <span class="query-label">告警类型：</span>
                <Input v-model="DetailModelData.alarmType.name" class="query-content" readonly></Input>
            </Col>
            <Col span="8" class="select_item">
                <span class="query-label">告警级别：</span>
            <Input v-model="DetailModelData.levelName" class="query-content" readonly></Input>
            </Col>
            <Col span="8" class="select_item">
                <span class="query-label">对象编号：</span>
            
                <Input v-model="DetailModelData.objId" class="query-content" readonly></Input>
            </Col>
            <Col span="8" class="select_item">
                <span class="query-label">对象名称：</span>
            
                <Input v-model="DetailModelData.objectName" class="query-content" readonly></Input>
            </Col>
            <Col span="8" class="select_item">
                <span class="query-label">告警来源：</span>
                <Input v-model="DetailModelData.source" class="query-content" readonly></Input>
            </Col>
            <Col span="24" class="select_item">
                <span class="query-label">描述：</span>
                <Input v-model="DetailModelData.description" type="textarea" :autosize="{ minRows: 2, maxRows: 5 }"
                readonly class="textarea-input"></Input>
            </Col>
        </Row>
        <Row>
            <Col span="12">
                <div class="video">
                    <VideoComponent 
                        id="alarmDetailVideo_id" 
                        ref="detailVideo" 
                        :video="detailVideo"
                    >
                    </VideoComponent>

                    <div class="start-play-warp" v-show="!isPlayback" @click="playBack">
                        <img :src="playIcon">
                    </div>
                </div>
            </Col>
            <Col span="12">
                <div class="alarm_img">
                    <AlarmImage :alarm="DetailModelData"></AlarmImage>
                </div>
            </Col>
        </Row>
    </div>
</template>
<script lang="ts">
    import { Component, Vue, Prop, Watch } from "vue-property-decorator";
    import VideoComponent from "@/components/Video/CommonVideo.vue";
    import { Video } from "@/types/video.interface";
    import { getVideoDto, getDefaultVideo, getAlarmTime } from "@/api/video";
    import { getDefaultAlarm, getVideoPathOfAlarm } from "@/api/alarm";
    import { AlarmVo, Alarm } from "@/types/alarm.interface";
    import AlarmImage from "@/components/view/AlarmImage.vue";
    import { getFileFromPath } from "@/api/file";


    @Component({
        components: { VideoComponent, AlarmImage }
    })
    export default class AlarmDetails extends Vue {

        // 告警详情数据
        @Prop({
            required: false,
            default: getDefaultAlarm()
        })DetailModelData: Alarm

        @Prop({
            required: false,
            default: true,
            type: Boolean
        })isShow

        // 告警详情视频
        detailVideo: Video = getDefaultVideo();

        /** 是否正在回放 */
        isPlayback: boolean = false;

        playIcon: string = require('@/assets/images/play-icon.png')

        recordAheadTime: number = 0

        @Watch('DetailModelData', {deep: true})
        watchVideo() {
            this.getVideo()
        }

        @Watch('isShow')
        watchIsShow(newVal, oldVal) {
            if (newVal === false && oldVal === true) {
                this.isPlayback = false;
                let tmp: any = this.$refs.detailVideo;
                tmp.stopPlayBack();
            }
        }

        mounted() {
            this.getAlarmTime()
            // this.getVideo()
        }

        getVideo() {
            getVideoDto(this.DetailModelData.objId).then((res: any) => {
                if (res.data.code != 200) return;
                this.detailVideo = res.data.data;
                console.log('this.detailVideo', this.detailVideo)
            });
        }

        getAlarmTime() {
            getAlarmTime().then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    console.log('data.recordAheadTime', data.recordAheadTime);
                    
                    this.recordAheadTime = data.recordAheadTime
                }
            })
        }

        /** 播放回放 */
        playBack() {
            this.getAlarmTime()
            // this.getVideo()
            
            let _this = this;
            this.isPlayback = true;
            let tmp: any = this.$refs.detailVideo;
            
            tmp.startPlayBack(
                new Date(this.DetailModelData.timeStamp - this.recordAheadTime * 1000),
                new Date(this.DetailModelData.timeStamp + this.recordAheadTime * 1000)
            )


            setTimeout(() => {
                _this.isPlayback = false;
                tmp.stopPlayBack();
                this.isPlayback = true
            }, this.recordAheadTime*1000);
        }

        /** 下载告警视频 */
        downloadVideo() {
            let _this = this;

            getVideoPathOfAlarm(this.DetailModelData.id).then((res: any) => {
                if (res.data.code != 200) return;

                let paths: string[] = res.data.data;
                for (let i = 0; i < paths.length; i++) {
                    getFileFromPath(paths[i]).then((res: any) => {
                        const blob = new Blob([res.data]);
                        const fileName = `告警${_this.DetailModelData.id}视频${i}.mp4`;

                        if ("download" in document.createElement("a")) {
                            // 支持a标签download的浏览器

                            const link = document.createElement("a"); // 创建a标签
                            link.download = fileName;
                            link.style.display = "none";
                            link.href = URL.createObjectURL(blob);
                            document.body.appendChild(link);
                            link.click(); // 执行下载
                            URL.revokeObjectURL(link.href); // 释放url
                            document.body.removeChild(link); // 释放标签
                        } else {
                            navigator.msSaveBlob(blob, fileName);
                        }
                    });
                }
            });
        }

    }
</script>

<style lang="less" scoped>
// 详情模态框
.alarm_img,
.video {
    height: 240px;
    border: 1px solid  #36e5ff;
    margin: 2rem;
}

.video {
    position: relative;
    margin-right: 1rem;
    .start-play-warp {
        background: #5a5a5a;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;

        img {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }
}

.alarm_img {
    margin-left: 1rem;
}

</style>