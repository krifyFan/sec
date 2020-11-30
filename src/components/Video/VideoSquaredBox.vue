<template>
    <div id="OCXBody">
        <div v-for="index in 9" :key="index" :id="divId(index)" class="videoClass" style="border: 1px solid #EBEBEB">
            <CommonVideo :id="videoId(index)" :video="videos[index - 1]" ref="videoRef" AutoPlay
                @on-com-click="ChangeStatus(index - 1)"></CommonVideo>
        </div>
        <div style="float:right; display:none;"></div>
    </div>
</template>
<script lang="ts">
    import {
        Component,
        Vue,
        Prop
    } from "vue-property-decorator";
    import {
        log
    } from "util";
    import CommonVideo from "@/components/Video/CommonVideo.vue";
    import {
        getDate,
        getTime
    } from "@/api/date";
    import {
        getDefaultVideo
    } from "@/api/video";
    import {
        Video
    } from "@/types/video.interface";

    @Component({
        components: {
            CommonVideo,
        },
    })
    export default class HIKOLD extends Vue {
        currentSelect: number = -1;
        // 当前显示视频个数
        videoNum: number = 9;
        // 9个视频
        videos: Video[] = [];

        created() {
            this.init();
        }

        mounted() {
            this.ChangeStatus(0);
            this.ArrangeWindowChildren(9);
        }

        divId(index: number) {
            return "video_" + (index - 1);
        }

        videoId(index: number) {
            return "VideoObjectId_" + (index - 1);
        }

        init() {
            for (let i = 0; i < 9; i++) {
                this.videos.push(getDefaultVideo());
            }
        }

        // 聚焦窗口
        ChangeStatus(iWindowNo) {
            console.log('iWindowNo', iWindowNo)
            if (iWindowNo == this.currentSelect) return;

            if (this.currentSelect >= 0) {
                document.getElementById("video_" + this.currentSelect).style.border = "1px solid #EBEBEB";
            }
            this.currentSelect = iWindowNo;
            if (this.currentSelect >= 0) {
                document.getElementById("video_" + this.currentSelect).style.border = "1px solid #00F";
            }
        }

        // 重置窗口大小
        ArrangeWindowChildren(num: number) {
            let x = num <= 1 ? 1 : num <= 4 ? 4 : 9;

            for (var i = 0; i < 9; i++) {
                document.getElementById("video_" + i).style.display =
                    i < x ? "" : "none";
            }
            for (var j = 0; j < x; j++) {
                if (x == 1) {
                    document.getElementById("video_" + j).style.width = "100%";
                    document.getElementById("video_" + j).style.height = "100%";
                } else if (x == 4) {
                    document.getElementById("video_" + j).style.width = "50%";
                    document.getElementById("video_" + j).style.height = "50%";
                } else {
                    document.getElementById("video_" + j).style.width = "33%";
                    document.getElementById("video_" + j).style.height = "33%";
                }
            }

            this.videoNum = x
            this.ChangeStatus(0)
        }

        setCurrentVideo(video: Video) {
            // 如果直接this.videos[this.currentSelect] = video,子组件无法检测到video变化
            this.$set(this.videos, this.currentSelect, video);
            // 将聚焦点设置在下一个窗口
            this.ChangeStatus((this.currentSelect + 1) % this.videoNum)
        }

        /** 设置所有视频 */
        setVideos(changeVideos: Video[]) {
            this.ArrangeWindowChildren(changeVideos.length);

            for (let i = 0; i < 9; i++) {
                if (i < changeVideos.length) {
                    this.$set(this.videos, i, changeVideos[i]);
                } else {
                    this.$set(this.videos, i, getDefaultVideo());
                }
            }
            // 取消聚焦
            this.ChangeStatus(-1);
        }

        // 云台旋转
        // 向上、下、左、右
        ptzTurnChildren(direction) {
            let r: any = this.$refs.videoRef[this.currentSelect];
            r.ptzTurn(direction);
        }
        // 停止
        ptzStopChildren() {
            let r: any = this.$refs.videoRef[this.currentSelect];
            r.ptzStop();
        }
        // 设置
        setPresetChildren(iPreset) {
            let r: any = this.$refs.videoRef[this.currentSelect];
            r.setPreset(iPreset);
        }
        // 跳转
        goPresetChildren(iPreset) {
            let r: any = this.$refs.videoRef[this.currentSelect];
            r.goPreset(iPreset);
        }

        // 视频回放
        startPlayChildren(date, time) {
            console.log('回放日期', date, '时间', time);
            
            let r: any = this.$refs.videoRef[this.currentSelect];
            let startTime = new Date(date + " " + time)
            r.startPlayBack(startTime, null);
            
        }
        // 停止
        stopPlayBackChildren() {
            let r: any = this.$refs.videoRef[this.currentSelect];
            r.stopPlayBack();
        }
        // 暂停
        suspendPlayBack() {
            let r: any = this.$refs.videoRef[this.currentSelect];
            r.suspendPlayBack();
        }
        // 继续
        continuePlayBack() {
            let r: any = this.$refs.videoRef[this.currentSelect];
            r.continuePlayBack();
        }
        // 慢放
        slowPlayBack() {
            let r: any = this.$refs.videoRef[this.currentSelect];
            r.slowPlayBack();
        }
        // 快放
        fastPlayBack() {
            let r: any = this.$refs.videoRef[this.currentSelect];
            r.fastPlayBack();
        }
    }
</script>

<style lang="less">
    #OCXBody {
        width: 100%;
        height: 100%;
        margin-bottom: 5px;
        overflow: hidden;

        .videoClass {
            float: left;
            height: 100%;
            width: 100%;
        }
    }
</style>