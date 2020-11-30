<template>
    <div class="Unity3D">
        <Unity3D :modelName="modelName" ref="child" @clickVideoEvent="clickVideoEvent" @clearAlarmEvent="clearAlarmEvent" @raiseFakedAlarmEvent="raiseFakedAlarmEvent"></Unity3D>

        <!-- 可视对讲弹框 -->
        <el-dialog 
            :visible.sync="intercomAlarmShow" 
            width="45%" 
            title="可视对讲" 
            @opened="intercomAlarmOpened" 
            @close="AlarmModalVisibleVhange" 
            footer-hide class="intercom-modal-wrap"
        >
            <Intercom ref="IntercomRef" :video="intercomVideo" v-if="intercomAlarmShow"></Intercom>
        </el-dialog>

        <!-- 一般视频弹框 -->
        <el-dialog 
            :visible.sync="videoAlarmShow" 
            :width="width" 
            :title="intercomModalTitle" 
            footer-hide
            class="normal-video-wrap"
        >
            <modelAlarmVideo 
                @control="handleChildValue" 
                ref="modelAlarmVideoRef" 
                :video="alarmVideo"
                v-if="videoAlarmShow"
            ></modelAlarmVideo>
        </el-dialog>
    </div>
</template>
<script lang="ts">
    import {
        Component,
        Vue,
        Emit
    } from "vue-property-decorator";
    import {
        Station
    } from "@/types/station.interface";
    import {
        Alarm
    } from "@/types/alarm.interface";
    import {
        MessageType,
        MessageSyncDto,
        MessageTypeEnum
    } from "@/types/message.interface";
    import {
        Video
    } from "@/types/video.interface";
    import {
        simulateAlarm,
        cleanAlarm
    } from "@/api/alarm";
    import {
        getStation
    } from "@/api/station";
    import {
        getVideoDto,
        getDefaultVideo
    } from "@/api/video";
    import Unity3D from "@/components/Unity3d/Unity3D.vue";
    import Intercom from "@/components/view/Intercom.vue";
    import modelAlarmVideo from "@/components/view/modelAlarmVideo.vue";

    @Component({
        components: {
            Unity3D,
            Intercom,
            modelAlarmVideo,
        },
    })
    export default class Unity3d extends Vue {
        stationId: number = 0;
        station: Station;
        modelName: String = "";

        mqModuleName: string = "Unity3DModule";

        /**可视对讲弹框 */
        intercomAlarmShow: boolean = false;
        intercomVideo: Video = getDefaultVideo();

        /**一般视频弹框 */
        videoAlarmShow: boolean = false;
        alarmVideo: Video = getDefaultVideo();

        isShowControl: boolean = false;

        intercomModalTitle: string = '视频'

        // 模态框宽度
        get width() {
            if (!this.isShowControl) {
                return "50%";
            }
            return "40%";
        }

        created() {
            // 获取当前的场站
            this.stationId = this.$store.state.stationId;
        }

        mounted() {
            this.init();
            this.startListenMQ();
        }

        // 接收子组件传值
        handleChildValue(val) {
            this.isShowControl = val;
        }

        init() {
            getStation(this.stationId).then((res) => {
                if (res.data.code == 200) {
                    this.station = res.data.data;
                    this.modelName = this.station.id.toString();
                }
            });
        }

        /** 可视对讲打开后 */
        intercomAlarmOpened() {
            let modal: any = this.$refs.IntercomRef;
            modal.Play();
        }

        AlarmModalVisibleVhange() {
            /** 关闭可视对讲 */
            let modal: any = this.$refs.IntercomRef;
            modal.Stop();
        }

        refreshAlarmStatus(newAlarm: any) {
            const child: any = this.$refs.child;
            child.refreshAlarm(newAlarm);
        }

        refreshData(id: number, cv: number) {
            const child: any = this.$refs.child;
            child.refreshData(id, cv);
        }

        setCameraRotation(id: string, yam: any, pitch: any){
            
            const child: any = this.$refs.child;
            child.setCameraRotation(id, yam, pitch);
        }

        clearAlarm(alarm: any) {
            const child: any = this.$refs.child;
            child.clearAlarm(alarm);
        }

        clickVideoEvent(videoId: number) {
            console.log("收到视频点击事件", videoId);
            getVideoDto(videoId).then((res) => {
                let {
                    code,
                    data
                } = res.data;
                if (code == 200) {
                    this.intercomModalTitle = data.name
                    switch (data.category) {
                        /**可视对讲 */
                        case 5:
                            this.intercomAlarmShow = true;
                            this.intercomVideo = data;
                            break;

                            /**普通视频 */
                        case 1:
                            this.videoAlarmShow = true;
                            this.alarmVideo = data;

                            break;
                    }
                }
            });
        }

        clearAlarmEvent(alarmId: number) {
            console.log("收到清除告警事件", alarmId);
            cleanAlarm(alarmId).then((res) => {
                console.log("清除成功");
            });
        }

        raiseFakedAlarmEvent(id: number, source: string, type: number) {
            console.log("收到模拟告警事件");
            let alarm: Alarm = {
                objId: id,
                source: source,
                alarmTypeId: type,
            };
            simulateAlarm(alarm).then((res) => {
                console.log("发送模拟告警成功");
            });
        }

        // 开始连接MQ
        startListenMQ() {
            let _this = this;
            console.log(`${this.mqModuleName} 添加监听器到MQ`);
            this.TransferStation.addListener(
                this.mqModuleName,
                this.MQMessageTrigger.bind(_this)
            );
        }

        // 停止连接MQ
        stopListenMQ() {
            console.log(`${this.mqModuleName} 移除监听器`);
            this.TransferStation.deleteListener(this.mqModuleName);
        }

        MQMessageTrigger(respond: any) {
            let message: MessageType = JSON.parse(respond);
            console.log(`${this.mqModuleName}接收到消息：`, message);

            switch (message.type) {
                case MessageTypeEnum.周界告警:
                    this.refreshAlarmStatus(message.body);
                    break;
                case MessageTypeEnum.消息同步:
                    let tmp: MessageSyncDto = message.body;
                    if (tmp.type == "AlarmClean") {
                        let alarm: Alarm = {
                            id: tmp.alarmId,
                            objId: 0,
                            source: "",
                            alarmTypeId: 0,
                        };
                        let child: any = this.$refs.child;
                        child.clearAlarm(alarm);
                    }
                    break;
                default:
                    break;
            }
        }

        beforeDestroy() {
            this.stopListenMQ();
        }
    }
</script>
<style lang="less">
    .Unity3D {
        width: 100%;
        height: 100%;
    }
    .normal-video-wrap,
    .intercom-modal-wrap {
        
        &>div:first-child {
            background: url("../../assets/images/perimeter-modal-bg.png") no-repeat;
            background-size: 100% 100%;
        }
        .el-dialog__header {
            text-align: center;
            border-bottom: none;
            .el-dialog__title {
                color: black;
            }
        }
    }
    .intercom-modal-wrap {
        .el-dialog__body {
            height: 38rem !important;
            .modal-wrap {
                height: 100%;
            }
        }
    }
    .modal-wrap {
        height: 100%;
    }
    .el-dialog {
        .el-dialog__header {
            line-height: 1.5;
        }
    }
</style>