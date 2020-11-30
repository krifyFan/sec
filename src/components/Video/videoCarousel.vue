<template>
    <div class="video_carousel">
        <div class="carousel_tit">
            <!-- 视频组线条 -->
            <div class="carousel_line">
                {{ groupName }}
                <!-- <span class="group_name">
                    {{ groupName }}
                </span> -->
            </div>

            <!-- 视频切换 -->
            <div class="switch">
                <!-- 上一个 -->
                <span class="switch_left" @click="preVideo"></span>
                <span class="video_name"> {{ videoItem.name }} </span>

                <!-- 下一个 -->
                <span class="switch_right" @click="nextVideo"></span>
            </div>

            <!-- 视频放大 -->
            <div class="enlarge_video" @click="enLarge"></div>
        </div>

        <div class="video_box">
            <VideoComponent :ref="carouselRef" :id="carouselId" :video="videoItem" AutoPlay>
            </VideoComponent>
        </div>

        <Modal v-model="modalShow" class="video_modal" :title="videoItem.name" footer-hide @on-cancel="closeModal">
            <Col span="20">
            <VideoComponent :ref="modalRef" :id="modalId" :video="modalVideoItem" AutoPlay>
            </VideoComponent>
            </Col>
            <Col span="4">
            <div class="control_box">
                <p class="tit">云台旋转</p>
                <div class="control">
                    <span class="opera_btn add_btn" @mousedown="ptzTurn(4)" @mouseup="ptzStop"></span>
                    <span class="opera_btn reduce_btn" @mousedown="ptzTurn(5)" @mouseup="ptzStop"></span>
                    <ul class="circle_control">
                        <!-- 上 -->
                        <li class="circle_item item_top" @mousedown="ptzTurn(0)" @mouseup="ptzStop">
                            <span class="opera_icon top_icon"></span>
                        </li>
                        <!-- 右 -->
                        <li class="circle_item item_right" @mousedown="ptzTurn(3)" @mouseup="ptzStop">
                            <span class="opera_icon right_icon"></span>
                        </li>
                        <!-- 下 -->
                        <li class="circle_item item_bottom" @mousedown="ptzTurn(1)" @mouseup="ptzStop">
                            <span class="opera_icon bottom_icon"></span>
                        </li>
                        <!-- 左 -->
                        <li class="circle_item item_left" @mousedown="ptzTurn(2)" @mouseup="ptzStop">
                            <span class="opera_icon left_icon"></span>
                        </li>
                        <!-- 中 -->
                        <li class="item_center" @click="ptzStop">
                            <span class="center_icon"></span>
                        </li>
                    </ul>
                </div>
                <div class="selected_box">
                    <div class="tit">预置点</div>
                    <div class="preset_positions">
                        <el-select v-model="selectedValue" placeholder="请选择">
                            <el-option v-for="item in presetList" :key="item.value" :label="item.label" :value="item.value">
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="btn_box">
                    <div class="setting btn" @click="setPreset(selectedValue)">
                        设置
                    </div>
                    <div class="jump btn" @click="goPreset(selectedValue)">
                        跳转
                    </div>
                </div>
            </div>
            <div class="video_playback">
                <p class="tit">视频回放</p>
                <div class="video_playback_item_wrap">
                    <div class="video_playback_item_content-wrap">
                        <div class="time-choose-wrap">
                            <el-date-picker v-model="playBackDate" type="date" placeholder="选择日期" value-format="yyyy-MM-dd">
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
            </Col>
        </Modal>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
        Prop,
        Watch
    } from "vue-property-decorator";
    import VideoComponent from "@/components/Video/CommonVideo.vue";
    import {
        Video
    } from "@/types/video.interface";
    import {
        getDefaultVideo
    } from "@/api/video";

    @Component({
        components: {
            VideoComponent,
        },
    })
    export default class videoCarousel extends Vue {
        /*弹窗是否显示*/
        modalShow: boolean = false;

        /*弹窗视频ref*/
        modalRef: string = '';

        /*弹窗视频id*/
        modalId: string;

        /*弹窗视频*/
        modalVideoItem: Video;

        /*预设点*/
        selectedValue: any = "";

        /*定时器*/
        timer?: any;
        timerArr: any[] = []

        presetList: any[] = [{
                value: "1",
                label: "1",
            },
            {
                value: "2",
                label: "2",
            },
            {
                value: "3",
                label: "3",
            },
            {
                value: "4",
                label: "4",
            },
            {
                value: "5",
                label: "5",
            },
        ];

        playBackDate: String = "";
        playBackTime: String = "";

        @Prop({
            required: true,
        })
        videos: Video[];

        @Prop({
            required: false,
            type: Number,
            default: 30000,
        })
        interval: number;

        /**
         * 动态传入ref
         */
        @Prop({
            required: false,
            type: String,
            default: "carouselRef",
        })
        carouselRef: string;

        /**
         * 动态传入id
         */
        @Prop({
            required: true,
            type: String,
            default: "videoCarouselId",
        })
        carouselId: string;

        /**
         * 视频组名字
         */
        @Prop({
            required: false,
            type: String,
            default: "视频组",
        })
        groupName: string;

        @Watch("videos", {
            deep: true,
        })
        onVideosChange(n: any, o: any) {
            console.log("videos change", this.videos);
        }

        videoItem: Video = getDefaultVideo();
        videoIndex: number = 0; //视频下标
        $refs: {
            carouselRef: HTMLFormElement;
        };

        mounted() {
            console.log("mounted:", this.carouselId, this.videos);

            if (typeof this.videos == "undefined") return;
            if (this.videos.length == 0) return;

            this.videoItem = this.videos[0];
            this.carouseltimeInterval();
        }

        // 轮播定时器
        carouseltimeInterval() {
            // 由原来的setTimeout改为setInterval，防止内存溢出问题
            this.timer = setInterval(()=>{
                this.nextVideo();
            }, this.interval)
        }

        // 清除定时器
        clearCarouseltimeInterval() {
            clearInterval(this.timer);
        }

        // 上一个视频
        preVideo() {
            this.videoIndex =
                (this.videoIndex - 1 + this.videos.length) % this.videos.length;
            this.play(this.videoIndex);
        }

        // 下一个视频
        nextVideo() {
            this.videoIndex = (this.videoIndex + 1) % this.videos.length;
            this.play(this.videoIndex);
        }

        play(index: number) {
            console.log("refs", this.$refs, this.carouselRef);
            console.log("ref:", this.$refs[this.carouselRef]);
            if (this.$refs[this.carouselRef]) {
                this.$refs[this.carouselRef].Stop();
                this.videoItem = this.videos[index];
                console.log(index, this.videoItem)
            }
        }

        // 打开视频弹窗
        enLarge() {
            this.clearCarouseltimeInterval();
            this.modalShow = true;
            this.modalRef = "modal" + this.carouselRef;
            this.modalId = this.carouselId + "modal";
            this.modalVideoItem = this.videoItem;
            this.$refs[this.modalRef].Play();
        }

        // 关闭视频弹窗
        closeModal() {
            this.carouseltimeInterval();
        }

        // 向上、下、左、右
        ptzTurn(direction) {
            this.$refs[this.modalRef].ptzTurn(direction);
        }

        ptzStop() {
            this.$refs[this.modalRef].ptzStop();
        }

        // 设置
        setPreset(iPreset) {
            if (!iPreset) {
                return;
            }
            this.$refs[this.modalRef].setPreset(iPreset);
        }

        // 跳转
        goPreset(iPreset) {
            this.$refs[this.modalRef].goPreset(iPreset);
        }

        // 视频回放
        // 开始
        startPlayBack(date, time) {
            if (!date || !time) {
                this.$message.error("请选择日期和时间！");
                return;
            }
            let startTime = `${date} ${time}`;
            this.$refs[this.modalRef].startPlayBack(startTime);
        }

        // 停止
        stopPlayBack() {
            this.$refs[this.modalRef].stopPlayBack();
        }

        // 暂停
        suspendPlayBack() {
            this.$refs[this.modalRef].suspendPlayBack();
        }

        // 继续
        continuePlayBack() {
            this.$refs[this.modalRef].continuePlayBack();
        }

        //慢放
        slowPlayBack() {
            this.$refs[this.modalRef].slowPlayBack();
        }

        // 快放
        fastPlayBack() {
            this.$refs[this.modalRef].fastPlayBack();
        }
    }
</script>

<style lang="less">
    @import "~@/assets/commonCss.less";

    .video_carousel {
        height: 100%;
        position: relative;
        padding: 10% 1% 3%;

        .carousel_tit {
            width: 100%;
            height: 20%;
            line-height: 20%;
            position: absolute;
            top: 0;
            left: 0;

            .carousel_line {
                // width: 100%;
                // height: 30%;
                // background: url("../../assets/images/carousel_line.png") center no-repeat;
                // background-size: 140% 70%;
                // position: absolute;
                // top: 0;
                // left: 0;
                .componentTitleStyle();

                .group_name {
                    color: #21cada;
                    font-size: 16px;
                    position: absolute;
                    top: 30%;
                    left: 50%;
                    transform: translate(-50%);
                }
            }

            // 左右切换
            .switch {
                height: 90%;
                padding: 0 30px;
                position: absolute;
                // left: 5%;
                top: 49%;
                // top: 10%;
                color: #21cada;
                font-size: 14px;

                .video_name {
                    position: relative;
                    top: 45%;
                }

                .switch_left {
                    display: block;
                    width: 24px;
                    height: 80%;
                    background: url("../../assets/images/switch_left.png") center no-repeat;
                    background-size: 50% 50%;
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    left: 0;
                    cursor: pointer;
                }

                .switch_right {
                    display: block;
                    width: 24px;
                    height: 80%;
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    right: 0;
                    background: url("../../assets/images/switch_right.png") center no-repeat;
                    background-size: 50% 50%;
                    cursor: pointer;
                }
            }

            // 视频放大
            .enlarge_video {
                width: 36px;
                height: 36px;
                background: url("../../assets/images/enlarge.png") center no-repeat;
                background-size: 50% 50%;
                position: absolute;
                top: 94%;
                // top: 60%;
                transform: translateY(-50%);
                right: 5%;
                cursor: pointer;
            }
        }

        .video_box {
            width: 90%;
            height: 90%;
            margin: 8% auto 0;
            border-radius: 10px;
            overflow: hidden;
        }
    }

    .video_modal {
        .ivu-modal {
            width: 100% !important;
            height: 100% !important;
            top: 0 !important;
        }

        .ivu-modal-content {
            height: 100%;
            background-color: #111d40;

            .ivu-modal-header-inner {
                color: #fff;
                font-size: 24px;
            }

            .ivu-modal-close,
            .ivu-icon-ios-close {
                color: #fff;
            }

            .ivu-modal-body {
                height: 94%;

                .ivu-col {
                    height: 100%;
                }
            }
        }

        // 右侧控件区
        .control_box {
            height: 40%;
            border-bottom: 1px solid rgba(41, 154, 182, 0.5);

            .control {

                margin-top: 8%;

                .circle_control {

                    .item_center {

                        .center_icon {
                            background: url("../../assets/images/control_center.png") no-repeat;
                            background-size: 100% 100%;
                        }
                    }

                    .item_top {

                        .top_icon {
                            background: url("../../assets/images/control_top.png") no-repeat;
                            background-size: 100% 100%;
                        }
                    }

                    .item_right {

                        .right_icon {
                            background: url("../../assets/images/control_right.png") no-repeat;
                            background-size: 100% 100%;
                        }
                    }

                    .item_bottom {

                        .bottom_icon {
                            background: url("../../assets/images/control_bottom.png") no-repeat;
                            background-size: 100% 100%;
                        }
                    }

                    .item_left {

                        .left_icon {
                            background: url("../../assets/images/control_left.png") no-repeat;
                            background-size: 100% 100%;
                        }
                    }
                }

                .add_btn {
                    background: url("../../assets/images/add_btn.png") no-repeat;
                    background-size: 100% 100%;
                }

                .reduce_btn {
                    background: url("../../assets/images/reduce_btn.png") no-repeat;
                    background-size: 100% 100%;
                }
            }

            .selected_box {
                margin-top: 2rem;
            }
        }

        // 视频回放
        .video_playback {
            height: 50%;

            .tit {
                font-size: 1.375rem;
                color: #14dee2;
                font-weight: bold;
                padding: 0.3125rem 0.3125rem 0;

            }

            .video_playback_item_wrap {
                margin-top: 8%;
                padding-bottom: 4%;
                border-bottom: 0.0625rem solid rgba(41, 154, 182, 0.5);
            }
        }
    }
</style>