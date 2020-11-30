<template>
    <!-- 中科科创的视频组件 -->
    <div class="content">
        <div
            class="openFlashTips"
            style="width:300px;position:absolute;top:20px;left:225px;z-Index:9999;color:white"
        >
            视频无法正常播放，请点击下方启用flash
        </div>
        <video
            :id="id"
            style="color:black;width:100%;height:100%"
            class="video-js"
            autoplay
            preload="auto"
            data-setup="{}"
        >
            <source src="test" type="rtmp/flv" />
        </video>
        <embed
            width="100%"
            height="100%"
            class="openFlash"
            style="position:absolute;top:130px;left:225px;z-Index:9999;"
            type="application/x-shockwave-flash"
        />
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Video } from "@/types/video.interface";
import { getDefaultVideo } from "@/api/video";
import axios from "axios";

@Component({})
export default class ZKKCClass extends Vue {
    @Prop({
        required: false,
        type: String,
        default: "zkkcVideo_id",
    })
    id: string;

    /** 视频 */
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

    // 相机承载
    Player: any;

    // 新引入的script
    eles: HTMLElement[] = [];

    // 流ID
    StreamID: string = "";

    @Watch("video", {
        deep: true,
    })
    onVideoChange(n: any, o: any) {
        this._PreviewStart();
    }

    created() {
        this.importJS();
    }

    mounted() {
        this.init();
        console.log("zkkc mounted", this.video);
        if (this.AutoPlay) {
            setTimeout(() => {
                this._PreviewStart();
            }, 500);
        }
    }

    init() {
        var fls = this._flashChecker();
        var s = "";

        if (fls.f) {
            (document.getElementsByClassName("openFlash") as any).forEach(
                (ele) => {
                    ele.style.display = "none";
                }
            );
            // (document.getElementsByClassName(
            //     "openFlash"
            // )[0] as any).style.display = "none";

            (document.getElementsByClassName("openFlashTips") as any).forEach(
                (ele) => {
                    ele.style.display = "none";
                }
            );
            // (document.getElementsByClassName(
            //     "openFlashTips"
            // )[0] as any).style.display = "none";
            //        document.write("您安装了flash,当前flash版本为: " + fls.v + ".x");
        } else {
            (document.getElementsByClassName(
                "openFlash"
            )[0] as any).style.display = "block";
            (document.getElementsByClassName(
                "openFlashTips"
            )[0] as any).style.display = "block";
            //        document.write("您没有安装flash");
        }
    }

    // 载入需要的js文件
    importJS() {
        const s1 = document.createElement("script");
        s1.type = "text/javascript";
        s1.src = "/video/video.js";
        this.eles.push(s1);
        const s2 = document.createElement("link");
        s2.rel = "stylesheet";
        s2.href = "/video/video-js.css";
        this.eles.push(s2);

        this.eles.forEach((e) => {
            document.body.appendChild(e);
        });
    }

    _flashChecker(): any {
        var hasFlash = 0; //是否安装了flash
        var flashVersion = 0; //flash版本
        var isIE = /*@cc_on!@*/ 0; //是否IE浏览器

        if (isIE) {
            var swf = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            if (swf) {
                hasFlash = 1;
                var VSwf = swf.GetVariable("$version");
                flashVersion = parseInt(VSwf.split(" ")[1].split(",")[0]);
            }
        } else {
            if (navigator.plugins && navigator.plugins.length > 0) {
                var swf = navigator.plugins["Shockwave Flash"];
                if (swf) {
                    hasFlash = 1;
                    var words = swf.description.split(" ");
                    for (var i = 0; i < words.length; ++i) {
                        if (isNaN(parseInt(words[i]))) continue;
                        flashVersion = parseInt(words[i]);
                    }
                }
            }
        }
        return {
            f: hasFlash,
            v: flashVersion,
        };
    }

    // 开始预览
    Play() {
        this._PreviewStart();
    }

    // 停止预览
    Stop() {
        this._PreviewStop();
    }

    _PreviewStart() {
        let { video, id } = this;

        console.log("开始预览1", video);
        if (!video) return;
        if (video.id == 0) return;

        console.log("开始预览2", video);
        // let videoDom: HTMLVideoElement = document.getElementById(id) as HTMLVideoElement

        let _this = this;
        let url: string = "/api/v1/stream/start";
        this._request(url).then((res: any) => {
            console.log("收到回复", res);
            console.log("player", _this.Player);
            console.log("videojs", videojs);

            if (_this.Player) {
                _this.Player.src(res.data.RTMP);
                _this.Player.play();
            } else {
                _this.Player = videojs(_this.id, {}, function() {
                    console.log("videojs 生成后", _this.Player, res.RTMP);
                    _this.Player.src(res.data.RTMP);
                    _this.Player.playbackRate = 1.0;
                    _this.Player.play();
                });
            }
        });
    }

    _PreviewStop() {
        // 谨慎使用，会导致其他相机挂掉
        // api/v1/stream/stop
    }

    // 开始通话
    StartTalk() {}

    // 结束通话
    StopTalk() {}

    // 向上、下、左、右、焦距、焦聚、光圈
    ptzTurn(direction) {
        let command: string = "";
        switch (direction) {
            case -1:
                command = "stop";
                break;
            case 0:
                command = "up";
                break;
            case 1:
                command = "down";
                break;
            case 2:
                command = "left";
                break;
            case 3:
                command = "right";
                break;
            case 4:
                command = "zoomin";
                break;
            case 5:
                command = "zoomout";
                break;
            case 6:
                command = "focusnear";
                break;
            case 7:
                command = "focusfar";
                break;
            case 8:
                command = "irisin";
                break;
            case 9:
                command = "irisout";
                break;
        }

        if (direction == -1) {
            this._ptzControl(command);
            this._fiControl(command);
        } else if (0 <= direction && direction <= 5) {
            this._ptzControl(command);
        } else if (6 <= direction && direction <= 9) {
            this._fiControl(command);
        }
    }

    _ptzControl(command: string) {
        let url: string = "/api/v1/control/ptz";
        this._request(url, {
            serial: this.video.code,
            command: command,
        }).then((res) => {
            console.log("云台控制成功", res.data);
        });
    }

    _fiControl(command: string) {
        let url: string = "/api/v1/control/fi";
        this._request(url, {
            serial: this.video.code,
            command: command,
        }).then((res) => {
            console.log("焦点光圈控制成功", res.data);
        });
    }

    // 停止
    ptzStop() {
        this.ptzTurn(-1);
    }

    // 设置
    setPreset(iPreset) {}

    // 跳转
    goPreset(iPreset) {}

    // 开始回放，如果endtime为null，则结束时间为当前
    startPlayBack(startTime: Date, endTime: Date | null = null) {
        let url: string = "/api/v1/playback/start";
        let params: any = {
            serial: this.video.code,
            starttime: startTime.format("yyyy-MM-ddThh:mm:ss"),
        };
        if (endTime) {
            Object.assign(params, {
                endtime: endTime.format("yyyy-MM-ddThh:mm:ss"),
            });
        }

        let _this = this;
        this._request(url, params).then((res: any) => {
            if (_this.Player) {
                _this.Player.src(res.data.RTMP);
                _this.Player.play();
            } else {
                _this.Player = videojs(_this.id, {}, function() {
                    _this.Player.src(res.data.RTMP);
                    _this.Player.play();
                });
            }
        });
    }

    // 停止
    stopPlayBack() {
        let url: string = "/api/v1/playback/stop";
        this._request(url, {
            streamid: this.StreamID,
        }).then((res: any) => {});
    }

    // 暂停 suspendPlayBack
    suspendPlayBack() {
        // let url: string = "/api/v1/playback/control";
        // this._request(url, {
        //     streamid: this.StreamID,
        //     command: "pause",
        // });

        this.Player.pause();
    }

    // 继续 continuePlayBack
    continuePlayBack() {
        // let url: string = "/api/v1/playback/control";
        // this._request(url, {
        //     streamid: this.StreamID,
        //     command: "play",
        // });

        this.Player.play();
    }

    // 慢放 slowPlayBack
    slowPlayBack() {
        // let url: string = "/api/v1/playback/control";
        // this._request(url, {
        //     streamid: this.StreamID,
        //     command: "scale",
        //     scale: "0.5",
        // });

        this.Player.playbackRate = 0.5;
        console.log(this.Player.playbackRate, "慢放this.Player.playbackRate");
    }

    // 快放 fastPlayBack
    fastPlayBack() {
        // let url: string = "/api/v1/playback/control";
        // this._request(url, {
        //     streamid: this.StreamID,
        //     command: "scale",
        //     scale: "2",
        // });

        this.Player.playbackRate = 5;
        console.log(this.Player.playbackRate, "快放this.Player.playbackRate");
    }

    _request(
        url: string,
        params: any = {
            serial: this.video.code,
        }
    ) {
        let { ip, port } = this.video.playVideoServer;
        return axios.get(`http://${ip}:${port}${url}`, {
            params: params,
        });
    }

    beforeDestroy() {
        this.eles.forEach((e: HTMLElement) => {
            document.body.removeChild(e);
        });
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
