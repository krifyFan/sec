<template>
    <div id="OCXBody">
        <div id="hk_video1" class="hk_video">
            <HIKVideo id="HIKOBJECT1" ref="hkVideoRef"></HIKVideo>
        </div>
        <div id="hk_video2" class="hk_video">
            <HIKVideo id="HIKOBJECT2"></HIKVideo>
        </div>
        <div id="hk_video3" class="hk_video">
            <HIKVideo id="HIKOBJECT3"></HIKVideo>
        </div>
        <div id="hk_video4" class="hk_video">
            <HIKVideo id="HIKOBJECT4"></HIKVideo>
        </div>
        <div id="hk_video5" class="hk_video">
            <HIKVideo id="HIKOBJECT5"></HIKVideo>
        </div>
        <div id="hk_video6" class="hk_video">
            <HIKVideo id="HIKOBJECT6"></HIKVideo>
        </div>
        <div id="hk_video7" class="hk_video">
            <HIKVideo id="HIKOBJECT7"></HIKVideo>
        </div>
        <div id="hk_video8" class="hk_video">
            <HIKVideo id="HIKOBJECT8"></HIKVideo>
        </div>
        <div id="hk_video9" class="hk_video">
            <HIKVideo id="HIKOBJECT9"></HIKVideo>
        </div>
        <div style="float:right; display:none;"></div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { log } from "util";
import HIKVideo from "@/components/Video/CommonVideo.vue";
import { getDate, getTime } from "@/api/date";
import { Video } from "@/types/video.interface";

@Component({
    components: {
        HIKVideo,
    },
})
export default class HIKOLD extends Vue {
    m_bDVRControl: any = "";
    m_iChannelNum: Number = -1; //模拟通道总数
    m_iNowChanNo: Number = 0; //当前通道号
    m_iPlay: number = 0;
    m_iPlayBlack: Number = 0;
    /** 注册设备用户ID */
    m_iLoginUserId: number = -1;
    /** 协议类型，0 – TCP， 1 - UDP */
    m_iProtocolType: number = 0;
    /** 码流类型，0 表示主码流， 1 表示子码流 */
    m_iStreamType: number = 1;
    /** 当前云台是否正在自转 */
    m_iAutoPTZ: Number = 0;
    /** 云台速度 */
    m_iPTZSpeed: Number = 4;
    playVideoServer: any = null;
    curVideosItem: Video[] = []; //当前选中视频

    $refs: { hkVideoRef: HTMLFormElement };
    created() {}
    mounted() {
        this.m_bDVRControl = document.getElementById("HIKOBJECT1");
        this.ChangeStatus(1);
        this.ArrangeWindowChildren(9);
        this.bindClick();
    }
    // 聚焦窗口
    ChangeStatus(iWindowNum) {
        this.m_bDVRControl = document.getElementById("HIKOBJECT" + iWindowNum);
        for (var i = 1; i <= 9; i++) {
            if (i == iWindowNum) {
                document.getElementById("hk_video" + i).style.border =
                    "1px solid #00F";
            } else {
                document.getElementById("hk_video" + i).style.border =
                    "1px solid #EBEBEB";
            }
        }
    }
    // 重置窗口大小
    ArrangeWindowChildren(x) {
        var iMaxWidth = document.getElementById("OCXBody").offsetWidth;
        var iMaxHeight = document.getElementById("OCXBody").offsetHeight;
        for (var i = 1; i <= 9; i++) {
            if (i <= x) {
                document.getElementById("hk_video" + i).style.display = "";
            } else {
                document.getElementById("hk_video" + i).style.display = "none";
            }
        }
        for (var j = 1; j <= x; j++) {
            if (x == 1) {
                document.getElementById("hk_video" + j).style.width = "100%";
                document.getElementById("hk_video" + j).style.height = "100%";
            } else if (x == 4) {
                document.getElementById("hk_video" + j).style.width = "50%";
                document.getElementById("hk_video" + j).style.height = "50%";
            } else {
                document.getElementById("hk_video" + j).style.width = "33%";
                document.getElementById("hk_video" + j).style.height = "33%";
            }
        }
        if (x == 1) {
        } else if (x == 4) {
        } else {
            //
        }
    }
    // 获取设备名称
    getDevName() {
        {
            var szDecName = this.m_bDVRControl.GetServerName();
            //szDecName = szDecName.replace(/\s/g,"&nbsp;");
            if (szDecName == "") {
                console.log("获取名称失败！");

                szDecName = "Embedded Net DVR";
            } else {
                console.log("获取名称成功！");
            }
        }
    }
    // 获取通道
    getDevChan() {
        {
            var szServerInfo = this.m_bDVRControl.GetServerInfo();
            var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(szServerInfo);
            this.m_iChannelNum = parseInt(
                xmlDoc.documentElement.childNodes[0].childNodes[0].nodeValue
            );
            if (this.m_iChannelNum < 1) {
                console.log("获取通道失败！");
            } else {
                console.log("获取通道成功！", this.m_iChannelNum);
            }
        }
    }
    // 点击事件
    bindClick() {
        var that = this;
        for (let i = 1; i <= 9; i++) {
            var ocxControl: any = document.getElementById("HIKOBJECT" + i);
            ocxControl.addEvent("SelectWindow", function() {
                that.ChangeStatus(i);
            });
        }
    }

    // 开始预览
    PreviewStart(videoItem) {
        if (!videoItem.playVideoServer) {
            return;
        }
        this.m_bDVRControl.StopPlayBack();
        this.playVideoServer = videoItem.playVideoServer;
        this.m_iNowChanNo = videoItem.channelNo;
        var { ip, port, username, password } = this.playVideoServer;

        this.m_iLoginUserId = this.m_bDVRControl.Login(
            ip,
            port,
            username,
            password
            // "192.168.12.100",
            // "172.16.2.101",
            // "8000",
            // "admin",
            // "12345"
            // "bw123456"
        );
        if (this.m_iLoginUserId == -1) {
            console.log("注册失败！");
        } else {
            console.log("注册成功！");
        }
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
            var newNo = +this.m_iNowChanNo + 1;
            if (bRet) {
                console.log("预览通道" + newNo + "成功！");
                this.m_iPlay = 1;
                console.log(this.m_bDVRControl.GetLastError(), "LastError");
            } else {
                console.log("预览通道" + newNo + "失败！");
                console.log(this.m_bDVRControl.GetLastError(), "LastError");
            }
        } else {
            console.log("请选择通道号！");
        }
    }

    // 云台旋转
    // 向上、下、左、右
    ptzTurnChildren(direction) {
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
                }
            } else {
                console.log("PTZ失败！");
            }
        } else {
            console.log("请先预览！", this.m_iPlay);
        }
    }
    // 停止
    ptzStopChildren() {
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
    setPresetChildren(iPreset) {
        if (this.m_iPlay == 1) {
            var bRet = this.m_bDVRControl.PTZCtrlSetPreset(iPreset);
            if (bRet) {
                console.log("设置预置点成功！");
            } else {
                console.log("设置预置点失败！");
            }
        } else {
            console.log("请先预览！");
        }
    }
    // 跳转
    goPresetChildren(iPreset) {
        if (this.m_iPlay == 1) {
            var bRet = this.m_bDVRControl.PTZCtrlGotoPreset(iPreset);
            if (bRet) {
                console.log("调用预置点成功！");
            } else {
                console.log("调用预置点成功！");
            }
        } else {
            console.log("请先预览！");
        }
    }

    // 视频回放
    startPlayChildren(date, time) {
        console.log(this.m_iNowChanNo, "this.m_iNowChanNo");

        let lpStartTime = date + " " + time;
        // 结束时间默认当前时间
        let lpStopTime = getDate("-") + " " + getTime();
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
                this.m_iPlayBlack = 1;
                console.log("回放通道" + newNo + "成功！");
            } else {
                console.log("回放通道" + newNo + "失败！");
            }
        } else {
            console.log("请选择通道号！");
        }
    }
    // 停止
    stopPlayBackChildren() {
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
    slowPlayBackChildren() {
        this.m_bDVRControl.PlayBackControl(6, 1);
    }
    // 快放
    fastPlayBack() {
        this.m_bDVRControl.PlayBackControl(5, 1);
    }
}
</script>

<style lang="less">
#OCXBody {
    width: 100%;
    height: 100%;
    margin-bottom: 5px;
    overflow: hidden;
    .hk_video {
        float: left;
    }
}
</style>
