<template>
    <!-- 海康老的视频组件 -->
    <div class="content">
        <!-- <iframe
            frameborder="0"
            src="about:blank"
            style="position:absolute; visibility:inherit; top:0px;left:0px;width:100%; height:100%;z-index:-100; filter:alpha(opacity=0);"
            marginHeight="0"
            marginWidth="0"
            frameSpacing=2
        ></iframe> -->
        <div class="smallocxdiv">
            <object
                classid="CLSID:CAFCF48D-8E34-4490-8154-026191D73924"
                codebase="/NetVideoActiveX23.cab"
                standby="Waiting..."
                :id="id"
                width="100%"
                height="100%"
            ></object>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
import { Video } from "@/types/video.interface";
import { getDefaultVideo } from "@/api/video";

@Component({})
export default class HIKClass extends Vue {
    @Prop({
        required: false,
        type: String,
        default: "HIK_old_id",
    })
    id: string;

    @Prop({
        required: false,
        type: Object,
        default: () => getDefaultVideo(),
    })
    video: Video;

    /** 是否播放 */
    @Prop({
        required: false,
        type: Boolean,
        default: false,
    })
    AutoPlay: boolean;

    @Watch("video", {
        deep: true,
    })
    onVideoChange(n: any, o: any) {
        // console.log("hik old", o);
        // console.log("hik new", n);

        this._PreviewStart();
    }

    @Watch("id", {
        immediate: true,
    })
    onIdChange(newVal, oldVal) {
        this.$nextTick(() => {
            this.m_bDVRControl = document.getElementById(newVal);
            this.bindClick();
        });
    }

    /** 控制器 */
    m_bDVRControl: any = document.getElementById(this.id);
    /** 注册设备用户ID */
    m_iLoginUserId: number = -1;
    /** 当前是否正在预览 */
    m_iPlay: number = 0;
    /** 当前是否正在通话 */
    m_iTalk: boolean = false;
    /** 当前通道号 */
    m_iNowChanNo: number = 0;
    /** 协议类型，0 – TCP， 1 - UDP */
    m_iProtocolType: number = 0;
    /** 码流类型，0 表示主码流， 1 表示子码流 */
    m_iStreamType: number = 1;
    /** 当前云台是否正在自转 */
    m_iAutoPTZ: Number = 0;
    /** 云台速度 */
    m_iPTZSpeed: Number = 4;
    /** 已登录的服务ID */
    _loginedServerId: number = 0;

    bindClick() {
        // 绑定控件的点击事件
        let ocxControl: any = document.getElementById(this.id);
        let _this = this;
        ocxControl.addEvent("SelectWindow", function() {
            _this.click();
        });
    }

    @Emit("click")
    private click() {}

    mounted() {
        console.log(
            "hik mounted:",
            this.video,
            "准备预览",
            this.AutoPlay,
            this.id
        );
        this.bindClick();
        if (this.AutoPlay) this._PreviewStart();
    }

    /** 开始播放 */
    Play() {
        this._PreviewStart();
    }

    /** 停止播放 */
    Stop() {
        this._PreviewStop();
    }

    // 开始预览
    _PreviewStart() {
        let { video, m_iPlay } = this;

        console.log("开始预览1", video);
        if (!video) return;
        if (video.id == 0) return;
        // 如果有视频服务并且视频服务不在线
        if (video.playVideoServer && !video.playVideoServer.online) return;
        // 如果没有视频服务并且自己不在线
        if (!video.playVideoServer && !video.online) return;

        console.log("开始预览2", video);

        // 停止回放
        this.m_bDVRControl = document.getElementById(this.id);
        this.m_bDVRControl.StopPlayBack();

        // 注册相机
        this._Login();

        this.m_iNowChanNo = this.video.channelNo;
        if (this.m_iNowChanNo > -1) {
            if (this.m_iPlay == 1) {
                this.m_bDVRControl.StopRealPlay();
            }

            this.m_bDVRControl.SetPlayWndType(0);
            var bRet = this.m_bDVRControl.StartRealPlay(
                this.m_iNowChanNo,
                this.m_iProtocolType,
                this.m_iStreamType
            );

            if (bRet) {
                console.log(`预览通道${this.m_iNowChanNo}成功！`);
                this.m_iPlay = 1;
                console.log(this.m_iPlay, "this.m_iPlayPreviewStart");
                console.log(this.m_bDVRControl.GetLastError());
            } else {
                console.log(`预览通道${this.m_iNowChanNo}失败！`);
                console.log(this.m_bDVRControl.GetLastError());
            }
        } else {
            console.log("请选择通道号！");
        }
    }

    _PreviewStop() {
        if (this.m_iPlay == 1) {
            this.m_bDVRControl.StopRealPlay();
            this.m_iPlay = 0;
            console.log("停止预览");
        }
    }

    _Login() {
        // 如果已经登录并且该视频是有视频服务的，判断视频服务是否和缓存的视频服务ID一样
        if (
            this.m_iLoginUserId != -1 &&
            this.video.playVideoServer &&
            this.video.playServerId == this._loginedServerId
        ) {
            return;
        } else {
            this._Logout();

            let { ip, port, username, password } = this.video.playVideoServer
                ? this.video.playVideoServer
                : this.video;

            this.m_iLoginUserId = this.m_bDVRControl.Login(
                ip,
                port,
                username,
                password
            );

            if (this.m_iLoginUserId == -1) {
                console.log("注册失败！");
            } else {
                console.log("注册成功！");
            }

            // 如果是视频服务登录，则缓存下该视频服务ID
            if (this.video.playVideoServer)
                this._loginedServerId = this.video.playServerId;
        }
    }

    _Logout() {
        this.m_bDVRControl.Logout();
        this.m_iLoginUserId = -1;
    }

    StartTalk(): boolean {
        if (this.m_iTalk) {
            console.log("正在通话中，取消开始通话~");
            return;
        }

        let f = this.m_bDVRControl.StartTalk(this.m_iNowChanNo);

        if (f) {
            console.log("开始通话！");
            this.m_iTalk = true;
        } else {
            console.log("开始通话失败！！！");
        }

        return f;
    }

    StopTalk(): boolean {
        let f = this.m_bDVRControl.StopTalk();
        if (f) {
            console.log("停止通话！");
            this.m_iTalk = false;
        } else {
            console.log("停止通话失败！！！");
        }

        return f;
    }

    // 向上、下、左、右、焦距、焦聚、光圈
    ptzTurn(direction) {
        if (this.m_iPlay == 1) {
            if (this.m_iAutoPTZ == 1) {
                this.m_bDVRControl.PTZCtrlStop(10, this.m_iPTZSpeed);
                this.m_iAutoPTZ = 0;
            }
            if (this.m_bDVRControl.PTZCtrlStart(direction, this.m_iPTZSpeed)) {
                switch (direction) {
                    case 0:
                        console.log("PTZ上成功！");
                        break;
                    case 1:
                        console.log("PTZ下成功！");
                        break;
                    case 2:
                        console.log("PTZ左成功！");
                        break;
                    case 3:
                        console.log("PTZ右成功！");
                        break;
                    case 4:
                        console.log("焦距拉近成功！");
                        break;
                    case 5:
                        console.log("焦距拉远成功！");
                        break;
                    case 6:
                        console.log("焦聚拉近成功！");
                        break;
                    case 7:
                        console.log("焦聚拉远成功！");
                        break;
                    case 8:
                        console.log("光圈大成功！");
                        break;
                    case 9:
                        console.log("光圈小成功！");
                        break;
                }
            } else {
                console.log("PTZ失败！");
            }
        } else {
            console.log("请先预览！", this.m_iPlay);
        }
    }

    // 停止
    ptzStop() {
        console.log(this.m_iPlay, "this.m_iPlayptzStop");

        if (this.m_iPlay == 1) {
            if (this.m_bDVRControl.PTZCtrlStop(10, this.m_iPTZSpeed)) {
                this.m_iAutoPTZ = 0;
                console.log("停止PTZ成功！");
            } else {
                console.log("停止PTZ失败！");
            }
        }
    }

    // 设置
    setPreset(iPreset) {
        if (this.m_iPlay == 1) {
            var bRet = this.m_bDVRControl.PTZCtrlSetPreset(iPreset);
            if (bRet) {
                console.log("设置预置点成功！");
                this.$$Message.info("设置预置点成功！");
            } else {
                console.log("设置预置点失败！");
                this.$$Message.info("设置预置点失败！");
            }
        } else {
            console.log("请先预览！");
            this.$$Message.console.error("设置预置点失败！");
        }
    }

    // 跳转
    goPreset(iPreset) {
        if (this.m_iPlay == 1) {
            var bRet = this.m_bDVRControl.PTZCtrlGotoPreset(iPreset);
            if (bRet) {
                console.log("调用预置点成功！");
                this.$$Message.info("调用预置点成功！");
            } else {
                console.log("调用预置点成功！");
                this.$$Message.info("调用预置点成功！");
            }
        } else {
            console.log("请先预览！");
            this.$$Message.console.error("请先预览！");
        }
    }

    // 开始回放，如果endtime为null，则结束时间为当前
    startPlayBack(startTime: Date, endTime: Date | null) {
        let { video } = this;

        this.m_bDVRControl = document.getElementById(this.id);
        console.log("回放时间", startTime, endTime);
        let lpStartTime: string = new Date(startTime).format(
            "yyyy-MM-dd hh:mm:ss"
        );
        let lpStopTime: string = (endTime == null
            ? new Date()
            : new Date(endTime)
        ).format("yyyy-MM-dd hh:mm:ss");
        console.log("解析后", startTime, lpStopTime);

        console.log("video", video);

        this.m_iNowChanNo = video.channelNo;
        // 停止回放
        this.m_bDVRControl.StopPlayBack();
        // 注册相机
        this._Login();

        if (this.m_iNowChanNo > -1) {
            if (this.m_iPlay == 1) {
                this.m_bDVRControl.StopRealPlay();
                this.m_bDVRControl.StopPlayBack();
            }
            this.m_bDVRControl.SetPlayWndType(0);
            var bRet = this.m_bDVRControl.PlayBackByTime(
                this.m_iNowChanNo,
                lpStartTime,
                lpStopTime
            );
            var newNo = +this.m_iNowChanNo + 1;
            if (bRet) {
                console.log("回放通道" + newNo + "成功！");
                console.log(this.m_bDVRControl.GetLastError());
            } else {
                console.log("回放通道" + newNo + "失败！");
                console.log(this.m_bDVRControl.GetLastError());
            }
        }
    }

    stopPlayBack() {
        this.m_bDVRControl = document.getElementById(this.id);
        this.m_bDVRControl.StopPlayBack();
    }

    // 暂停
    suspendPlayBack() {
        this.m_bDVRControl.PlayBackControl(3, 1);
    }

    // 继续
    continuePlayBack() {
        this.m_bDVRControl.PlayBackControl(4, 1);
    }

    // 慢放
    slowPlayBack() {
        this.m_bDVRControl.PlayBackControl(6, 1);
    }

    // 快放
    fastPlayBack() {
        this.m_bDVRControl.PlayBackControl(5, 1);
    }

    beforeDestroy() {
        this.m_bDVRControl.StopRealPlay();
        this.m_bDVRControl.Logout();
        this.m_bDVRControl.ClearOCX();
        this.m_iPlay = 0;
    }
}
</script>

<style lang="less">
.content {
    width: 100%;
    height: 100%;
    position: relative;

    .smallocxdiv {
        float: left;
        width: 100%;
        height: 100%;
    }
}
</style>
