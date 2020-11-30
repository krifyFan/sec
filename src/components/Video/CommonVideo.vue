<template>
    <!-- 视频组件，根据vender选择使用哪个具体组件 -->
    <div class="CommonVideoClass">
        <div v-if="VideoVendor == 0" style="height:100%; width:100%; background-color:#000;" @click="click"></div>
        <!-- 海康视频 -->
        <HIKVideo :id="id" ref="videoRef" v-else-if="VideoVendor == 1" :video="video" :AutoPlay="AutoPlay"
            @click="click"></HIKVideo>
        <!-- 中科科创 -->
        <ZKKCVideo :id="id" ref="videoRef" v-else-if="VideoVendor == 2" :video="video" :AutoPlay="AutoPlay"
            @click="click">
        </ZKKCVideo>
        <!-- H5视频 -->
        <H5Video :id="id" ref="videoRef" v-else-if="VideoVendor == 5" :video="video" :AutoPlay="AutoPlay" :speed="speed"
            @on-click="click">
        </H5Video>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
        Prop,
        Watch,
        Emit
    } from "vue-property-decorator"
    import {
        Video
    } from "./types/video.interface"

    import HIKVideo from './HIK_old.vue'
    import ZKKCVideo from './ZKKC.vue'
    import H5Video from './H5Player.vue'

    @Component({
        components: {
            HIKVideo,
            ZKKCVideo,
            H5Video,
        }
    })
    export default class HIKClass extends Vue {
        @Prop({
            required: false,
            type: String,
            default: "commonVideo_id",
        })
        id: string;

        /** 视频 */
        @Prop({
            required: true,
            type: Object,
        })
        video: Video;

        /** 是否播放 */
        @Prop({
            required: false,
            type: Boolean,
            default: false,
        })
        AutoPlay: boolean;

        @Prop({
            required: false,
            type: Number,
            default: 0.5
        })speed: number

        changeValue: number | null = null

        @Emit("on-com-click")
        click() {}

        $refs: {
            videoRef: HTMLFormElement;
        };

        get VideoVendor(): number {
            if (this.video) {
                if (this.video.playVideoServer) {
                    return this.video.playVideoServer.vendor;
                } else {
                    return this.video.vendor;
                }
            } else {
                return 0
            }
        }

        mounted() {}

        // 开始预览
        Play() {
            console.log("Common Video Play-------------", this.video);
            this.$refs.videoRef.Play();
        }

        // 停止预览
        Stop() {
            this.$refs.videoRef.Stop();
        }

        // 开始通话
        StartTalk() {
            this.$refs.videoRef.StartTalk();
        }

        // 结束通话
        StopTalk() {
            this.$refs.videoRef.StopTalk();
        }

        // 向上、下、左、右、焦距、焦聚、光圈
        ptzTurn(direction) {
            this.$refs.videoRef.ptzTurn(direction);
        }

        // 停止
        ptzStop() {
            this.$refs.videoRef.ptzStop();
        }

        // 设置
        setPreset(iPreset) {
            this.$refs.videoRef.setPreset(iPreset);
        }

        // 跳转
        goPreset(iPreset) {
            this.$refs.videoRef.goPreset(iPreset);
        }

        // 开始回放，如果endtime为null，则结束时间为当前
        startPlayBack(startTime: Date, endTime: Date | null) {
            this.$refs.videoRef.startPlayBack(startTime, endTime);
        }

        stopPlayBack() {
            this.$refs.videoRef.stopPlayBack();
        }

        // 暂停
        suspendPlayBack() {
            this.$refs.videoRef.suspendPlayBack();
        }
        // 继续
        continuePlayBack() {
            this.$refs.videoRef.continuePlayBack();
        }
        // 慢放
        slowPlayBack() {
            this.$refs.videoRef.slowPlayBack();
        }
        // 快放
        fastPlayBack() {
            this.$refs.videoRef.fastPlayBack();
        }

        beforeDestroy() {}
    }
</script>

<style lang="less" scoped>
    .CommonVideoClass {
        width: 100%;
        height: 100%;
    }
</style>