<template>
    <div class="alarmModalClass">
        <!-- <div v-if="alarmVideoShow"> -->
            <el-dialog 
                :visible.sync="alarmVideoShow"
                :close-on-click-modal="false" 
                @opened="videoAlarmOpened" 
                @close="AlarmModalVisibleVhange"
                width="50%" title="视频告警" footer-hide class="alarm-modal-wrap">
                <AlarmVideo 
                    ref="AlarmVideoModel" 
                    :picMessage="picAlarm"
                    :videoAlarm="videoAlarm"
                    :videoComplete="videoComplete"
                    v-if="alarmVideoShow"
                ></AlarmVideo>
                <div class="close-modal">
                    {{closeModalVideoTime}}秒后自动关闭
                </div>
            </el-dialog>
        <!-- </div> -->

        <!-- 可视对讲通话 -->
        <el-dialog 
            :visible.sync="intercomShow" 
            :close-on-click-modal="false" 
            class="intercom-modal-wrap" 
            title="可视对讲通话" 
            @opened="intercomAlarmOpened"
            @close="AlarmModalVisibleVhange" footer-hide
        >
            <Intercom 
                v-if="intercomShow" 
                ref="IntercomModel" 
                :video="intercomVideo" 
                @closeModal="handleModal"
            ></Intercom>
            <div class="close-modal">
                {{closeModalInterconTime}}秒后自动关闭
            </div>
        </el-dialog>

        <!-- 可视对讲认证失败 -->
        <el-dialog 
            :visible.sync="intercomFailureShow" 
            :close-on-click-modal="false" 
            width="50%" 
            class="intercomfailure-modal-wrap" 
            title="可视对讲认证失败" 
            @opened="intercomFailureAlarmOpened"
            @close="AlarmModalVisibleVhange" footer-hide
        >
            <IntercomFailure ref="IntercomFailureModel" 
                v-if="intercomFailureShow" 
                :video="intercomVideo"
                :picMessage="picAlarm"
                :intercomFailureAlarm="IntercomFailureAlarm"
                :videoComplete="videoComplete"
            ></IntercomFailure>
            <div class="close-modal">
                {{closeModalInterconFailureTime}}秒后自动关闭
            </div>
        </el-dialog>

        <!-- 周界告警弹框 -->
        <el-dialog 
            :visible.sync="perimeterAlarmShow"
            :close-on-click-modal="false"  
            class="perimeter-modal-wrap" 
            width="50%" 
            title="周界告警" 
            @opened="perimeterAlarmOpened"
            @close="AlarmModalVisibleVhange" footer-hide
        >
            <AlarmPerimeter 
                v-if="perimeterAlarmShow" 
                ref="alarmPerimeterModel" 
                :picMessage="picAlarm"
                :perimeterAlarm="perimeterAlarm"
                :isVerifyComplete="isVerifyComplete"
                :videoComplete="videoComplete"
            ></AlarmPerimeter>
            <div class="close-modal">
                {{closeModalPerimeterTime}}秒后自动关闭
            </div>        
        </el-dialog>

        <!-- 烟感弹窗 -->
        <el-dialog 
            :visible.sync="fireAlarmShow" 
            :close-on-click-modal="false"  
            class="fire-modal-wrap" 
            width="50%" title="火灾告警" 
            @opened="fireAlarmOpened"
            @close="AlarmModalVisibleVhange" footer-hide
        >
            <AlarmFire 
                v-if="fireAlarmShow" 
                ref="alarmFireModel"
                :picMessage="picAlarm"
                :fireAlarm="fireAlarm"
                :videoComplete="videoComplete"
            ></AlarmFire>
            <div class="close-modal">
                {{closeModalFireTime}}秒后自动关闭
            </div>        
        </el-dialog>

        <!-- 激光对射 -->
        <el-dialog
            :visible.sync="laserBeamShow" 
            :close-on-click-modal="false"  
            class="laser-beam-modal-wrap" 
            width="50%" title="激光对射告警" 
            @opened="laserBeanOpened"
            @close="AlarmModalVisibleVhange" footer-hide
        >
            <AlarmLaserBeam
                v-if="laserBeamShow" 
                ref="laserBeamModal"
                :picMessage="picAlarm"
                :laserBeamAlarm="laserBeamAlarm"
                :isVerifyComplete="isVerifyComplete"
                :videoComplete="videoComplete"
            ></AlarmLaserBeam>
            <div class="close-modal">
                {{closeLaserBeamTime}}秒后自动关闭
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from "vue-property-decorator";
    import AlarmVideo from "@/components/view/AlarmVideo.vue";
    import Intercom from "@/components/view/Intercom.vue";
    import AlarmPerimeter from "@/components/view/AlarmPerimeter.vue";
    import AlarmFire from '@/components/view/AlarmFire.vue'
    import IntercomFailure from '@/components/view/IntercomFailure.vue'
    import AlarmLaserBeam from '@/components/view/AlarmLaserBeam.vue'
    import { AlarmPermission } from "@/types/permission.interface";
    import { Role } from "@/types/role.interface";
    import { AlarmVo, Alarm } from "@/types/alarm.interface";
    import { MessageType, MessageSyncDto, MessageTypeEnum } from "@/types/message.interface";
    import { Video, VideoVo } from "@/types/video.interface";
    import { MeasObjectVo } from "@/types/measobject.interface";
    import { getCountByCondition, getDefaultAlarm } from "@/api/alarm";
    import { getVideoDtosByCondition, getDefaultVideo } from "@/api/video";
    import { AudioWithIE } from "@/util/audio";
    import { alarmPopup } from '@/api/alarm'

    @Component({
        components: { AlarmVideo, Intercom, AlarmPerimeter, AlarmFire, IntercomFailure, AlarmLaserBeam }
    })
    export default class AlarmModal extends Vue {
        /** 告警视频的弹窗 */
        alarmVideoShow: boolean = false;
        /** 弹窗告警 */
        videoAlarm: Alarm = getDefaultAlarm();
        /** 倒计时关闭时间 */
        closeModalVideoTime: number = 120
        isPicActive: boolean = false
        videoAlarmTimer?: any

        /** 可视对讲告警弹窗 */
        intercomShow: boolean = false;
        /** 可视对讲视频 */
        intercomVideo: Video = getDefaultVideo();
        /** 对象类型 -- 可视对讲 */
        objectTypeId: number = 5;
        /** 倒计时关闭弹窗 */
        closeModalInterconTime: number = 12
        intercomTimer?:any 

        // 可视对讲认证失败弹窗
        intercomFailureShow: boolean = false
        IntercomFailureAlarm: Alarm = getDefaultAlarm();
        closeModalInterconFailureTime: number = 10
        intercomFailureTimer?:any

        /** 周界告警弹窗 */
        perimeterAlarmShow: boolean = false;
        /** 周界告警信息 */
        perimeterAlarm: Alarm = getDefaultAlarm();
        /** 周界告警倒计时关闭时间 */
        closeModalPerimeterTime:number = 15
        perimeterAlarmTimer?: any
        isVerifyComplete: boolean = false
        isCacheVerifyComplete: any = {}

        /** 火灾告警弹窗 */
        fireAlarmShow: boolean = false
        /** 火灾告警信息 */
        fireAlarm: Alarm = getDefaultAlarm()
        /** 倒计时关闭时间 */
        closeModalFireTime:number = 120
        fireAlarmTimer?: any

        /** 激光对射弹窗 */
        laserBeamShow: boolean = false
        /** 激光对射信息 */
        laserBeamAlarm: Alarm = getDefaultAlarm()
        /** 倒计时关闭时间 */
        closeLaserBeamTime:number = 120
        laserBeamTimer?: any


        /** 当前显示的消息 */
        currentMessage: MessageType;
        /** 缓存的消息 */
        cacheMessage: MessageType | null = null;

        /** 可查看的告警列表 */
        alarmPermissions = []
        /** 告警消息名称和枚举的对应关系 */
        alarmPermissionMap: Map < string, AlarmPermission > = this.$store.state.alarmPermissionMap;
        /** 告警级别和声音名称的对应关系 */
        alarmLevelSoundMap: Map < number,
        string > = new Map();

        /** pic */
        picAlarm: any = {}
        cachePicAlarm: any = {}
        /** video */
        videoComplete: any = {}
        cacheVideoComplete: any = {}

        modalActived: Boolean = false

        mounted() {
            this.initConfig()
            this.initData();
            this.startListenMQ();
        }

        // 
        handleModal(val) {
            // 1 接听，倒计时停止
            // 2 拒绝，modal框立即关闭
            if (val === 1) {
                clearInterval(this.intercomTimer)
            } else if (val === 2) {
                this.intercomShow = false
                clearInterval(this.intercomTimer)
            }
        }

        initConfig() {
            alarmPopup().then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    if (data.actived == true) {
                        this.modalActived = false
                        this.closeModalVideoTime = data.videoAlarm
                        this.closeModalInterconTime = data.intercomAlarm
                        this.closeModalInterconFailureTime = data.intercomCall
                        this.closeModalPerimeterTime = data.intrusionAlarm
                        this.closeModalFireTime = data.fireAlarm
                        this.closeLaserBeamTime = data.intrusionAlarm
                    } else {
                        this.modalActived = true
                    }
                }
            })
        }

        initData() {
            // 获取可视对讲相机
            let intercomVo: VideoVo = {
                stationId: this.stationId,
                category: 5,
            };

            getVideoDtosByCondition(intercomVo).then((res: any) => {
                if (res.data.code == 200) {
                    let tmp: Video[] = res.data.data;
                    if (tmp.length > 0) this.intercomVideo = tmp[0];
                }
            });

            // 获取告警权限列表
            let roles: Role[] = this.$store.state.roles;
            roles.forEach((role: Role) => {
                role.permissions.forEach((permission: AlarmPermission) => {
                    if (this.alarmPermissions.indexOf(permission) < 0) {
                        this.alarmPermissions.push(permission);
                    }
                });
            });

            // 初始化告警级别和声音的关系
            this.alarmLevelSoundMap.set(1, "tipSound");
            this.alarmLevelSoundMap.set(2, "preAlarmSound");
            this.alarmLevelSoundMap.set(3, "alarmSound");
            this.alarmLevelSoundMap.set(4, "faultSound");
        }

        startListenMQ() {
            this.TransferStation.addListener("AlarmModal",this.showAlarmVideo.bind(this));
        }

        stopListenMQ() {
            console.log("AlarmModal 移除监听器");
            this.TransferStation.deleteListener("AlarmModal");
        }

        showAlarmVideo(respond: any) {
            let message: MessageType = JSON.parse(respond);      

            /** 声音工具 */
            let audio: AudioWithIE = new AudioWithIE();

            if (this.alarmPermissions.indexOf(this.alarmPermissionMap.get(message.type)) >= 0) {
                switch (this.alarmPermissionMap.get(message.type)) {
                    // 视频告警
                    case 1:
                    // 周界入侵
                    case 3:
                    // 高后果视频告警
                    case 7:
                        // 激光对射
                    case 6:
                    // 火灾告警
                    case 4:
                        // 根据告警级别发出声音
                        audio.playSound(
                            this.alarmLevelSoundMap.get(message.body.level)
                        );
                        // 消息进缓存
                        this.cacheMessage = message;

                        break;
                    // 可视对讲告警
                    case 2:
                        if (message.body.alarmTypeId == 3003) {
                            // 可视对讲告警
                            audio.playSound("intercom");
                        } 
                        // 消息进缓存
                        this.cacheMessage = message;

                        break;

                    default:
                        break;
                }

                // 检查告警，看是否需要弹窗
                this.checkAlarmMessage();
            }
        
            // 拍照完成
            if (message.type === 'AlarmPictureSaveComplete') {
                if (message.body == this.currentMessage.body.id) {
                    this.picAlarm = message 
                } else if(message.body == this.cacheMessage.body.id) {
                    this.cachePicAlarm = message
                }
                // this.picAlarm = message
            }
            // 录像完成
            if (message.type === 'AlarmVideoSaveComplete') {
                console.log('message.body', message.body)
                console.log('this.currentMessage.body.id', this.currentMessage.body.id);
                
                if (message.body = this.currentMessage.body.id) {
                    this.videoComplete = message
                    console.log('if---this.videoComplete', this.videoComplete);
                    
                } else if (message.body == this.cacheMessage.body.id) {
                    this.cacheVideoComplete = message
                    console.log('else---this.cacheVideoComplete', message.body);
                    
                }
            }
            // 复核成功
            if (message.type === 'AlarmVerifyComplete') {
                if (message.body == this.currentMessage.body.id) {
                    this.isVerifyComplete = true
                } else if (this.isCacheVerifyComplete.body == this.cacheMessage.body.id) {
                    this.cacheVideoComplete = message
                }
            }
            // 同步类消息 message.type == "MessageSync"
            if (message.type == MessageTypeEnum.消息同步) {
                this.doSyncMessage(message.body);
            }

        }



        /**
         * 先看有没有缓存消息
         * 再看当前有没有弹窗显示
         * 最后将缓存显示
         *
         */
        checkAlarmMessage() {
            // 缓存都没有，直接退出
            if (!this.cacheMessage) return;

            // 判断当前有没有弹窗显示
            if (this.intercomShow || 
                this.alarmVideoShow || 
                this.intercomFailureShow || 
                this.perimeterAlarmShow || 
                this.fireAlarmShow || 
                this.laserBeamShow
            )
                return;

            // 符合显示要求，开始操作
            // 将缓存复制到当前消息
            this.currentMessage = JSON.parse(JSON.stringify(this.cacheMessage));
            this.picAlarm = this.cachePicAlarm
            this.videoComplete = this.cacheVideoComplete
            this.cacheMessage = null;
            // 语音播报告警
            this.speak(this.currentMessage.body)

            switch (this.currentMessage.type) {
                case MessageTypeEnum.视频告警:
                case MessageTypeEnum.高后果区视频告警:
                    this.videoAlarm = this.currentMessage.body;
                    if (this.modalActived == false)
                        this.alarmVideoShow = true;
                    break;

                case MessageTypeEnum.可视对讲告警:
                    if (this.currentMessage.body.alarmTypeId == 3003) {
                            // 如果当前在可视对讲，则无需弹框
                            if (this.$route.name != "VideoIntercom") {
                                setTimeout(()=>{
                                    let modal: any = this.$refs.IntercomModel
                                    modal.callCome()
                                }, 300)
                                if (this.modalActived == false)
                                    this.intercomShow = true;
                            }
                        } else if (this.currentMessage.body.alarmTypeId == 3002) {
                            this.IntercomFailureAlarm = this.currentMessage.body;
                            // 可视对讲认证失败
                            if (this.modalActived == false)
                                this.intercomFailureShow = true
                        }
                    break;
                
                case MessageTypeEnum.周界告警:
                    this.perimeterAlarm = this.currentMessage.body;
                    if (this.modalActived == false)
                        this.perimeterAlarmShow = true;
                    break;

                case MessageTypeEnum.火灾告警:
                    this.fireAlarm = this.currentMessage.body;
                    if (this.modalActived == false)
                        this.fireAlarmShow = true
                    break;

                case MessageTypeEnum.激光对射:
                    this.laserBeamAlarm = this.currentMessage.body
                    if (this.modalActived == false)
                        this.laserBeamShow = true
                    break;

                default:
                    break;
            }
        }

        /** 同步消息处理 */
        doSyncMessage(val: MessageSyncDto) {
            // 如果是本人操作，无视之
            if (val.token == this.$store.state.token) return;

            let intercomModal: any = this.$refs.IntercomModel;
            console.log("非本人发送，准备处理告警", val);
            if (val.type == "IntercomAnswer") {
                // 有人接听了
                if (!this.intercomShow) return;
                intercomModal.setCurrentState(-1);
            } else if (val.type == "IntercomRefuse") {
                // 有人拒绝了
                if (!this.intercomShow) return;
                intercomModal.setCurrentState(0);
            } else if (val.type == "IntercomHangup") {
                // 有人挂断了
                if (!this.intercomShow) return;
                intercomModal.setCurrentState(0);
            } else if (val.type == "AlarmOff") {
                // 有人关闭告警了了
            } else if (val.type == "AlarmClean") {
                // 有人清除告警了了
            }
        }

        /**
         * 语音播报
         */
        speak(alarm: Alarm) {
            if ('speechSynthesis' in window) {
                let sentence = new SpeechSynthesisUtterance()
                let voices = window.speechSynthesis.getVoices()
                for(var i = 0; i < voices.length; i++) {
                    if(voices[i]['name'] == "Alex"){
                        sentence.voice = voices[i];
                    }
                }
                sentence.pitch = 1;
                sentence.rate = 0.7;//速度
                if (alarm.objectName && alarm.levelName) {
                    let txt = `${alarm.objectName}${alarm.levelName}告警`
                    sentence.text = txt
                }
                window.speechSynthesis.speak(sentence);
            } else {
                console.log('Oops! Your browser does not support HTML SpeechSynthesis.')
            }
        }

        /** 视频告警弹窗打开后 */
        videoAlarmOpened() {
            this.initConfig()
            this.initData();
            this.startListenMQ();
            clearInterval(this.videoAlarmTimer)
            this.videoAlarmTimer = setInterval(()=> {
                this.closeModalVideoTime--
                if (this.closeModalVideoTime === 0) {
                    clearInterval(this.videoAlarmTimer)
                    this.alarmVideoShow = false
                }
            }, 1000)
            let alarmVideoModel: any = this.$refs.AlarmVideoModel;
            
            alarmVideoModel.initVideo(this.videoAlarm);
        }

        /** 可视对讲打开后 */
        intercomAlarmOpened() {
            this.initConfig()
            this.initData();
            this.startListenMQ();
            clearInterval(this.intercomTimer)
            this.intercomTimer = setInterval(()=> {
                this.closeModalInterconTime--
                if (this.closeModalInterconTime === 0) {
                    clearInterval(this.intercomTimer)
                    this.intercomShow = false
                }
            }, 1000)
                
            let modal: any = this.$refs.IntercomModel;
            modal.Play();
        }

        // 可视对讲失败
        intercomFailureAlarmOpened() {
            this.initConfig()
            this.initData();
            this.startListenMQ();
            clearInterval(this.intercomFailureTimer)
            // if (this.closeModalInterconFailureTime == 0) {
            //     clearInterval(this.intercomFailureTimer)
            // } else {
            //     }
            this.intercomFailureTimer = setInterval(()=>{
                this.closeModalInterconFailureTime--
                if (this.closeModalInterconFailureTime === 0) {
                    clearInterval(this.intercomFailureTimer)
                    this.intercomFailureShow = false
                }
            }, 1000)

            let intercomFailureModal: any = this.$refs.IntercomFailureModel
            intercomFailureModal.initVideo(this.IntercomFailureAlarm);
            intercomFailureModal.$children[1].Play()
        }

        /** 周界告警打开后 */
        perimeterAlarmOpened() {
            this.initConfig()
            this.initData();
            this.startListenMQ();
            clearInterval(this.perimeterAlarmTimer)
            // if (this.closeModalPerimeterTime == 0) {
            //     clearInterval(this.perimeterAlarmTimer)
            // } else {
            //     }
            this.perimeterAlarmTimer = setInterval(()=>{
                this.closeModalPerimeterTime--
                if (this.closeModalPerimeterTime === 0) {
                    clearInterval(this.perimeterAlarmTimer)
                    this.perimeterAlarmShow = false
                }
            }, 1000)
            let alarmVideoModel: any = this.$refs.alarmPerimeterModel;
            alarmVideoModel.initVideo(this.perimeterAlarm);
        }

        /** 火灾告警打开后 */
        fireAlarmOpened() {
            this.initConfig()
            this.initData();
            this.startListenMQ();
            clearInterval(this.fireAlarmTimer)
            // if (this.closeModalFireTime == 0) {
            //     clearInterval(this.fireAlarmTimer)
            // } else {
            //     }
            this.fireAlarmTimer = setInterval(()=>{
                this.closeModalFireTime--
                if (this.closeModalFireTime === 0) {
                    clearInterval(this.fireAlarmTimer)
                    this.fireAlarmShow = false
                }
            }, 1000)
            let alarmFireModel: any = this.$refs.alarmFireModel
            
            alarmFireModel.initVideo(this.fireAlarm)
        }

        /** 激光对射打开后 */
        laserBeanOpened() {
            this.initConfig()
            this.initData();
            this.startListenMQ();
            clearInterval(this.laserBeamTimer)
            this.laserBeamTimer = setInterval(()=>{
                this.closeLaserBeamTime--
                if (this.closeLaserBeamTime === 0) {
                    clearInterval(this.laserBeamTimer)
                    this.laserBeamShow = false
                }
            }, 1000)
            let laserBeamModel: any = this.$refs.laserBeamModal;
            laserBeamModel.initVideo(this.laserBeamAlarm);
        }

        AlarmModalVisibleVhange() {
            /** 关闭可视对讲 */
            let modal: any = this.$refs.IntercomModel;
            modal.Stop();
            /** 视频告警的视频关闭 */
            let videoAlarmRef: any = this.$refs.AlarmVideoModel;
            videoAlarmRef.Stop();
            /** 周界告警的视频关闭 */
            let perimeterAlarmRef: any = this.$refs.alarmPerimeterModel;
            perimeterAlarmRef.Stop();
            /** 火灾告警视频关闭 */
            let fireAlarmRef: any = this.$refs.alarmFireModel
            fireAlarmRef.Stop()
            /** 激光对射关闭 */
            let laserBeamRef: any = this.$refs.laserBeamModal
            laserBeamRef.Stop()

            setTimeout(() => {
                this.checkAlarmMessage();
            }, 1000);
        }

        beforeDestroy() {
            this.stopListenMQ();
        }
    }
</script>

<style lang="less">
    .el-dialog__header {
        padding: 5px 5px;
    }

    .el-dialog__body {
        height: 430px;
        padding: 0;
    }
    .intercom-modal-wrap {
        .el-dialog {
            margin-top: 5vh;
            .el-dialog__body {
                height: 50vh;
            }
        }
    }
    // 视频告警 周界告警 可视对讲呼叫
    .alarm-modal-wrap,
    .perimeter-modal-wrap,
    .intercom-modal-wrap,
    .intercomfailure-modal-wrap,
    .fire-modal-wrap,
    .laser-beam-modal-wrap {
        &>div:first-child {
            background: url("../../assets/images/perimeter-modal-bg.png")
                no-repeat;
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
</style>