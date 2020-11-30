<template>
    <div class="videoInspection_content">
        <Unity3D ref="unity3D"></Unity3D>
        <div class="left" :style="leftDomStyle">
            <Patrol @startVideo="showDetail" ref="patrol"></Patrol>
            <div class="leftBtn" @click="leftHidden">
                <img :src="btnImg" />
            </div>
        </div>
        <div class="videoContent" v-show="!leftBtnStatus">
            <h6>{{videoInformation.objectName}}</h6>
            <div class="closebtn"></div>
            <div class="videoPreocess">
                <ul>
                    <li>预置位: </li>
                    <li>{{videoInformation.pointId}}</li>
                    <li>可视对讲告警: </li>
                    <li>{{videoInformation.process}}</li>
                </ul>

            </div>
            <div class="videoPlay">
                <VideoComponent id="detailVideo_id" :video="detailVideo"></VideoComponent>
            </div>

        </div>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
        Watch
    } from "vue-property-decorator";
    import Patrol from './Patrol.vue'
    import Unity3D from "@/components/view/Unity3d.vue";
    import {
        getDefaultVideo
    } from "@/api/video";
    import VideoComponent from "@/components/Video/CommonVideo.vue";
    import {
        Video
    } from "@/types/video.interface";
    import {
        MessageType,
        MessageTypeEnum
    } from "@/types/message.interface";

    @Component({
        components: {
            Patrol,
            Unity3D,
            VideoComponent
        },
    })
    export default class Overview extends Vue {

        leftBtnStatus: boolean = true
        videoInformation: any = {
            id: '',
            objectId: '',
            objectName: '',
            pointId: '0',
            process: '0/0',

        }
        // 告警详情视频
        detailVideo: Video = getDefaultVideo()


        get leftDomStyle() {

            return {
                left: this.leftBtnStatus ? '1%' : '-20%'
            }
        }

        get btnImg() {
            let img = this.leftBtnStatus ? 'left-open-btn' : 'left-close-btn'
            return require(`@/assets/images/${img}.png`)
        }

        created() {
            this.startListenMQ();
        }

        leftHidden() {
            this.leftBtnStatus = !this.leftBtnStatus
        }

        showDetail(taskItem, detailVideo) {
            let {
                videoInformation
            } = this
            let {
                id,
                objectId,
                objectName
            } = taskItem

            this.leftHidden()

            videoInformation.id = id
            videoInformation.objectName = objectName
            videoInformation.objectId = objectId

            this.detailVideo = detailVideo
        }

        /** MQ监听 */
        startListenMQ() {
            console.log("自动巡检 添加监听器到MQ");
            this.TransferStation.addListener("MessageTypeEnum", this.callback.bind(this));
        }

        /** MQ停止监听 */
        stopListenMQ() {
            console.log("可视对讲 移除监听器");
            this.TransferStation.deleteListener("MessageTypeEnum");
        }

        callback(respond: any) {

            let {
                videoInformation
            } = this
            let message: MessageType = JSON.parse(respond);

            console.log('MessageTypeEnum.预置位巡检进度', MessageTypeEnum.预置位巡检进度);
            
            
            if (message.type == MessageTypeEnum.预置位巡检进度) {

                let presetProcess: any = message.body;

                videoInformation.pointId = presetProcess.pointId
                videoInformation.process = presetProcess.process

                let u3d: any = this.$refs.unity3D
                u3d.setCameraRotation(videoInformation.objectId.toString(), presetProcess.pan, presetProcess.tilt)
            }
        }

        beforeDestroy() {
            this.stopListenMQ();
        }
    }
</script>

<style lang="less" scoped>
    .videoInspection_content {
        height: 100%;
        position: relative;
        overflow: hidden;

        .videoContent {
            width: 28%;
            height: 40%;
            position: absolute;
            bottom: 3%;
            right: 2%;
            background-image: url("../../../assets/images/videoInspection-bg.png");
            background-size: 100% 100%;
            padding: 0 1.5% 1%;

            h6 {
                text-align: center;
                font-size: 1rem;
                color: #000;
                height: 9%;
                font-weight: 700;
                margin-top: 2.3%;
            }

            .videoPreocess {
                height: 12%;
                line-height: 35px;
                font-size: 1rem;

                ul {
                    list-style: none;

                    li {
                        float: left;
                    }

                    :first-child,
                    :nth-child(3) {
                        color: #00a8a4;
                        font-weight: 500;
                    }

                    :nth-child(2),
                    :nth-child(4) {
                        width: 20%;
                        margin-left: 4%;
                        color: #fff;
                    }

                }

            }

            .videoPlay {
                height: 75%;
            }
        }

        .left {
            position: absolute;
            width: 20%;
            height: 60%;
            top: 15%;
            transition: all 1s;
            background-image: linear-gradient(to right, rgba(17, 27, 40, 0), rgba(17, 27, 40, 0.3) 20%, rgba(17, 27, 40, 0.55));

            .leftBtn {
                width: 6%;
                height: 7%;
                position: absolute;
                top: 50%;
                transform: translate(0, -50%);
                right: -6%;
            }

        }
    }
</style>