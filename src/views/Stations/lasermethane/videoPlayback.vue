<template>
    <div class="video_playback">
        <div class="modular-title">视频回放</div>
        <div class="video_playback_item_wrap">
            <div class="video_playback_item_content-wrap">
                <div class="time-choose-wrap">
                    <el-date-picker v-model="playBackDate" type="date" placeholder="选择日期"
                        value-format="yyyy-MM-dd">
                    </el-date-picker>
                </div>
            </div>
            <div class="video_playback_item_content-wrap">
                <div class="time-choose-wrap">
                    <el-time-picker v-model="playBackTime" :picker-options="{
                            selectableRange: '00:00:00 - 23:59:59',
                        }" placeholder="选择时间" value-format="HH:mm:ss">
                    </el-time-picker>
                </div>
            </div>
            <div class="video_playback_item_content-wrap">
                <div class="video_playback_item" @click="startPlayBack(playBackDate, playBackTime)">
                    开始
                </div>
            </div>
            <div class="video_playback_item_content-wrap">
                <div class="video_playback_item" @click="stopPlayBack">
                    停止
                </div>
            </div>
            <div class="video_playback_item_content-wrap">
                <div class="video_playback_item" @click="suspendPlayBack">
                    暂停
                </div>
            </div>
            <div class="video_playback_item_content-wrap">
                <div class="video_playback_item" @click="continuePlayBack">
                    继续
                </div>
            </div>
            <div class="video_playback_item_content-wrap">
                <div class="video_playback_item" @click="slowPlayBack">
                    慢放
                </div>
            </div>
            <div class="video_playback_item_content-wrap">
                <div class="video_playback_item" @click="fastPlayBack">
                    快放
                </div>
            </div>
            <div class="video_playback_item_content-wrap">
                <div class="video_playback_item">下载录像文件</div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import {
        Component,
        Vue,
        Watch,
        Prop
    } from "vue-property-decorator"
    @Component({})
    export default class control extends Vue {
        // @Prop({
        //     required: true    
        // })videoBoxRef: HTMLFormElement;

        playBackDate: String = "";
        playBackTime: String = "";
        // $refs: {
        //     videoBoxRef: HTMLFormElement;
        // };
        // 视频回放
        // 开始
        startPlayBack(date, time) {
            if (!date || !time) {
                this.$message.error("请选择日期和时间！");
                return;
            }
            // this.videoBoxRef.startPlayChildren(date, time);
        }
    
        // 停止
        stopPlayBack() {
            // this.videoBoxRef.stopPlayBackChildren();
        }
        // 暂停
        suspendPlayBack() {
            // this.videoBoxRef.suspendPlayBackChildren();
        }

        // 继续
        continuePlayBack() {
            // this.videoBoxRef.continuePlayBackChildren();
        }

        //慢放
        slowPlayBack() {
            // this.videoBoxRef.slowPlayBackChildren();
        }

        // 快放
        fastPlayBack() {
            // this.videoBoxRef.fastPlayBackChildren();
        }
    }
</script>

