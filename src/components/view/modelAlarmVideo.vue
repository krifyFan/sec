<template>
    <div class="AlarmVideoClass" @click="hiddenDialay()">
        <VideoComponent
            :video="video"
            ref="video"
            :id="video.id"
            AutoPlay
        ></VideoComponent>
        <div class="button-wrap">
            <div v-if="currentState == 0">
                <div class="intercom_btn conversation_start">
                    <!-- 开始通话 -->
                    <div class="icon conversation_start_icon" @click="talkVideo"></div>
                </div>
                <!-- 开门 -->
                <!-- <div class="intercom_btn open_door">
                    <div class="icon open_door_icon" @click="openVideo"></div>
                </div> -->
            </div>
            <div v-if="currentState == 1">
                <div class="intercom_btn conversation_stop">
                    <!-- 停止通话 -->
                    <div class="icon conversation_stop_icon" @click="talkVideo"></div>
                </div>
                    <!-- 开门 -->
                <!-- <div class="intercom_btn open_door">
                    <div class="icon open_door_icon" @click="openVideo"></div>
                </div> -->
            </div>
            <div v-if="currentState == 2">
                <div class="intercom_btn open_door">
                    <!-- 开门 -->
                    <div class="icon open_door_icon" @click="openVideo"></div>
                </div>
                <div class="intercom_btn answer">
                    <!-- 接听 -->
                    <div class="icon answer_icon" @click="answerVideo"></div>
                </div>
                <div class="intercom_btn refuse">
                    <!-- 拒绝 -->
                    <div class="icon refuse_icon" @click="refuseVideo"></div>
                </div>
            </div>
            <div v-if="currentState == 3">
                <div class="intercom_btn open_door">
                    <!-- 开门 -->
                    <div class="icon open_door_icon" @click="openVideo"></div>
                </div>
                <div class="intercom_btn refuse">
                    <!-- 挂断 -->
                    <div class="icon refuse_icon" @click="answerVideo"></div>
                </div>
            </div>
            <div v-if="currentState == -1">
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from "vue-property-decorator";
import { getVideoDto, getDefaultVideo } from "@/api/video";
import { Alarm } from "@/types/alarm.interface";
import { getDefaultAlarm } from "@/api/alarm";
import { Video } from "@/types/video.interface";
import VideoComponent from "@/components/Video/CommonVideo.vue";
import { open, refuse, ringoff, answer } from "@/api/intercom";

@Component({
    components: {
        VideoComponent,
    },
})
export default class AlarmVideo extends Vue {
    currentAlarm: Alarm = getDefaultAlarm();

    selectedValue: number = 0;

    isTalk: boolean = false;

    @Prop({
        type: Object,
        default: () => getDefaultVideo(),
    })
    video: Video;

    /** 默认是否播放 */
    @Prop({
        required: false,
        type: Boolean,
        default: false,
    })
    AutoPlay: boolean;

    // @Emit("control")
    // private controlToParent() {
    //     return this.isShowControl;
    // }

    // @Watch('video')
    // watchVideo(newVal) {
    //     this.isTalk = false
    //     this.isShowControl = false
    // }
    /**
     * 当前状态
     * -1: 已被处理状态，无按钮显示
     * 0：默认状态，只有通话开、开门2个按钮
     * 1: 通话中状态，只有通话关、开门2个按钮
     * 2：来电等待接听状态，有接听、拒绝、开门3个按钮
     * 3：接听状态，有挂断、开门2个按钮
     */
    currentState: number = 0;
    // 1 接听，倒计时停止
    // 2 拒绝，modal框立即关闭
    modalStatus:number = -1
    
    mounted() {
        this.hiddenDialay()
    }

    hiddenDialay() {}

    /**开始通话*/
    startTalk() {
        let video: any = this.$refs.video;
        video.StartTalk();
        this.isTalk = true;
    }

    /**停止通话*/
    stopTalk() {
        let video: any = this.$refs.video;
        video.StopTalk();
        this.isTalk = false;
    }

    /** 电话来了 */
    callCome() {
        this.currentState = 2;
        console.log("来电话了", this.currentState);
    }

    /** 设定当前状态 */
    setCurrentState(state: number) {
        this.currentState = state;
    }

    /** 接听 */
    answerVideo() {
        let video: any = this.$refs.video;
        console.log("接听前：", this.currentState);
        console.log("this.video", this.video)

        if (this.currentState == 3) {
            // 当前接听状态，所以挂断
            this.modalStatus = 2
            ringoff(this.video.id).then((res: any) => {
                this.currentState = 0;
                video.StopTalk();
            });
        } else if (this.currentState == 2) {
            // 当前挂断状态，所以接听

            this.modalStatus = 1
            answer(this.video.id).then((res: any) => {
                this.currentState = 3;
                video.StartTalk();
            });
        }
        this.closeModal(this.modalStatus)
    }

    /** 拒绝 */
    refuseVideo() {
        if (this.currentState == 2) {
            refuse(this.video.id).then((res: any) => {
                this.currentState = 0;
                this.modalStatus = 2
                this.closeModal(this.modalStatus)
            });
        }
    }

    /** 开门 */
    openVideo() {
        open(this.video.id).then((res: any) => {});
    }

    /** 通话 */
    talkVideo() {
        let video: any = this.$refs.video;

        console.log('video', video.StartTalk, 'this.currentState', this.currentState)

        if (this.currentState == 0) {
            // 开始通话
            this.currentState = 1;
            video.StartTalk();
        } else if (this.currentState == 1) {
            // 结束通话
            this.currentState = 0;
            video.StopTalk();
        }
    }

    /** 预览 */
    Play() {
        let v: any = this.$refs.video;
        v.Play();
    }

    Stop() {
        let v: any = this.$refs.video;
        v.Stop();
    }
}
</script>

<style lang="less">
.AlarmVideoClass {
    height: 33rem;
    width: 98%;
    margin: 0 10px;
    margin-top: 10px;
    overflow: hidden;
    .button-wrap {
        position: absolute;
        z-index: 999;
        bottom: 1.7rem;
        right: 0px;

        .conversation_start,
        .conversation_stop,
        .un_conversation_start {
            left: 15.7%;
        }

        .open_door {
            right: 11.8%;
        }

        .un_answer,
        .answer {
            left: 37.7%;
        }

        .un_hang_up,
        .refuse {
            right: 33.7%;
        }

        .intercom_btn {
            height: 3rem;
            width: 3rem;
            background: green;
            border-radius: 3rem;
            display: inline-block;
            line-height: 3rem;
            text-align: center;
            margin-right: 1rem;
            .icon {
                width: 2.5rem;
                height: 2.5rem;
                cursor: pointer;
                margin: 0 auto;
                margin-top: 10%;
            }
            &.conversation_start {
                background: #0AC60A;
            }
            &.open_door {
                background: #02A0A1;
            }
            &.hang_up,
            &.refuse {
                background: red;
            }
            &.un_hang_up,
            &.un_answer {
                background: #cccccc;
            }

            // 开始通话
            .conversation_start_icon {
                // 1
                background: url("../../assets/images/conversation_start.png") no-repeat;
                background-size: 100% 100%;
            }

            // 禁止开始通话
            .un_conversation_start_icon {
                // 2
                background: url("../../assets/images/conversation_start.png") no-repeat;
                background-size: 100% 100%;
            }


            // 停止通话
            .conversation_stop_icon {
                // 1
                background: url("../../assets/images/conversation_stop.png") no-repeat;
                background-size: 100% 100%;
            }

            // 接听
            .answer_icon {
                // 1
                background: url("../../assets/images/answer.png") no-repeat;
                background-size: 100% 100%;
            }

            // 禁止接听
            .un_answer_icon {
                // 1
                background: url("../../assets/images/un_answer.png") no-repeat;
                background-size: 100% 100%;
            }

            // 挂断
            .hang_up_icon {
                // 2
                background: url("../../assets/images/hang_up.png") no-repeat;
                background-size: 100% 100%;
            }

            // 禁止挂断
            .un_hang_up_icon {
                background: url("../../assets/images/un_hang_up.png") no-repeat;
                background-size: 100% 100%;
            }

            // 拒绝
            .refuse_icon {
                // 2
                background: url("../../assets/images/hang_up.png") no-repeat;
                background-size: 100% 100%;
            }

            // 开门
            .open_door_icon {
                background: url("../../assets/images/open_door.png") no-repeat;
                background-size: 100% 100%;
            }

            // 不能开门
            .un_open_door_icon {
                background: url("../../assets/images/un_open_door.png") no-repeat;
                background-size: 100% 100%;
            }

            .un_conversation_start_icon,
            .un_answer_icon,
            .un_hang_up_icon,
            .un_hang_up_icon {
                cursor: text;
            }

        }
    }
}
</style>
