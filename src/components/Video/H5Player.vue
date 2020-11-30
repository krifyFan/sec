<template>
    <div :id="id" class="h5videowrapper h5container" v-cancellation @dblclick="fullscreen" @mouseover="controlsShow"
        @mouseout="controlsShow" @touchstart="controlsShow" @touchmove="controlsShow" @click="clickVideo">
        <video ref="video" :id="videoId" class="h5video" webkit-playsinline playsinline></video>
        <div v-show="isPTZControlsShow" class="PTZClass">
            <div class="btnLeftUp"></div>
            <div class="btnUp" @mousedown="ptzTurn(0)" @mouseup="ptzTurn(-1)"></div>
            <div class="btnRightUp"></div>
            <div class="btnLeft" @mousedown="ptzTurn(2)" @mouseup="ptzTurn(-1)"></div>
            <div class="btnCenter"></div>
            <div class="btnRight" @mousedown="ptzTurn(3)" @mouseup="ptzTurn(-1)"></div>
            <div class="btnLeftDown"></div>
            <div class="btnDown" @mousedown="ptzTurn(1)" @mouseup="ptzTurn(-1)"></div>
            <div class="btnRightDown"></div>
        </div>
        <div v-show="isPTZControlsShow && isShowTalk" class="talk-icon-wrap">
            <div class="startTalk talk-icon" v-show="isHangUp" @click="startTalkVideo()">
                <img :src="answerIcon" alt="通话">
            </div>
            <div class="endTalk talk-icon" v-show="!isHangUp" @click="endTalkVideo()">
                <img :src="unAnswerIcon" alt="挂断">
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
        Prop,
        Watch,
        Emit,
    } from "vue-property-decorator"
    import {
        Video
    } from "./types/video.interface"
    import './h5plugins/adapter.js'
    import {
        H5sPlayerWS,
        // H5sPlayerHls,
        H5sPlayerRTC,
        H5sPlayerAudBack
    } from './h5plugins/h5splayer.js'
    // import {
    //     H5sPlayerCanvas
    // } from './h5plugins/linkplayer.js'
    // import {
    //     H5siOS,
    //     H5sPlayerCreate
    // } from './h5plugins/h5splayerhelper.js'
    import axios from "axios"
    import {
        DirectiveOptions
    } from 'vue'
    // import { startTalk, stopTalk } from '@/api/intercom'
    import request from '@/util/intercomRequest'

    var time = null

    const cancellation: DirectiveOptions = {
        unbind(els) {
            // 将video元素移开
            // let elementChild = [].slice.call(els.children);
            // let [video] = elementChild.filter(el => el.nodeName == "VIDEO");

            // if (video) {
            //     // 将video从原来的父dom中移除
            //     const parentDom = video.parentNode
            //     parentDom.removeChild(video)

            //     // 将dom存到body中，并且不显示
            //     video.style.display = "none"
            //     document.body.appendChild(video)
            // }
        }
    }

    @Component({
        directives: {
            cancellation
        }
    })
    export default class H5PlayerClass extends Vue {
        @Prop({
            required: false,
            type: String,
            default: "h5_id",
        })
        id: string

        /** 视频 */
        @Prop({
            required: true,
            type: Object,
        })
        video: Video

        @Prop({
            required: false,
            type: Number,
            default: 0.5
        }) speed: number

        // 视频内容
        h5handler: any = undefined
        // 历史视频RTC
        h5backhandler: any = undefined
        // 音频
        audioback: any = undefined
        // 回放播放速度
        playbackSpeed: number = 1
        // 回放的起始时间
        playbackStartTime: number = 0
        // 主码流 main || 辅码流 sub
        streamprofile: string = "sub"

        // 视频dom
        videoDom: HTMLVideoElement

        // ptz控制器是否显示
        isPTZControlsShow: boolean = false

        playVideoServerIp:string = ''
        playVideoServerPort: number = 8081

        newVideo?: Video

        isShowTalk: boolean = false

        answerIcon: string = require('@/assets/images/un_conversation_start.png')
        unAnswerIcon: string = require('@/assets/images/un_conversation_stop.png')

        isHangUp: boolean = true
        startTime: null | Date = null

        @Watch("video", {
            deep: true,
        })
        onVideoChange(n: any, o: any) {
            this.newVideo = n
            
            // 视频源改变，先停止当前播放，换新的配置播放
            this.Play()
            this.playVideoServerIp = n.playVideoServer.ip
            this.playVideoServerPort = n.playVideoServer.port
        }

        @Emit("on-click")
        click() {}

        clickVideo() {
            this.click()
            // clearTimeout(time)
            // time = setTimeout(()=>{
            // }, 300)
        }

        // 视频组件id
        get videoId(): string {
            return 'videoId_' + this.id
        }

        /** 该相机在H5中的token */
        get Token(): string {
            /**
             *  当该视频的channelNo == 0时，说明该视频是用onvif等直接连接，在配置文件的src中
             *  否则为设备类连接的
             */
            let token: string = this.video.channelNo == 0 ? this.video.id.toString() :
                `${this.video.code}--${this.video.channelNo}`

            return token
        }

        /** H5连接配置 */
        get Config(): any {
            let host: string = `${this.video.playVideoServer.ip}:${this.video.playVideoServer.port}`
            // let host: string = `${this.playVideoServerIp}:${this.playVideoServerPort}`

            return {
                videoid: this.videoId,
                protocol: window.location.protocol, //http: or https:
                host: host,
                streamprofile: this.streamprofile,
                rootpath: "/", // '/' or window.location.pathname
                token: this.Token,
                hlsver: "v1", //v1 is for ts, v2 is for fmp4
                session: "" //session got from login，目前H5设置匿名可查看视频，可不填
            }
        }

        /** 麦克风配置 */
        get Config2(): any {
            let host: string = `${this.video.playVideoServer.ip}:${this.video.playVideoServer.port}`
            // let host:string = `${this.playVideoServerIp}:${this.playVideoServerPort}`

            return {
                protocol: window.location.protocol, //http: or https:
                host: host,
                rootpath: "/", // '/' or window.location.pathname
                token: this.Token,
                session: "" //session got from login，目前H5设置匿名可查看视频，可不填
            }
        }

        mounted() {
            this.init()
        }

        beforeDestroy() {
            this.StopTalk()
            this.Stop()
            this.stopPlayBack()
        }

        init() {
            // 获取video元素
            // this.videoDom = this._getVideoElement()
            // document.getElementById(this.id).appendChild(this.videoDom)

            // 绑定窗口大小变化事件
            this._sizeChange()

            this.Play()
        }

        // 开始预览
        Play() {
            // 先停止历史播放和正在播放
            this.stopPlayBack()
            this.Stop()

            this.h5handler = new H5sPlayerWS(this.Config)
            this.h5handler.connect()
        }

        // 停止预览
        Stop() {
            if (this.h5handler) {
                this.h5handler.disconnect()
                delete this.h5handler
                this.h5handler = undefined
            }
        }

        // 开始通话 ---  待测试
        StartTalk() {
            if (this.video.category === 5) {
                request({
                    url: `/intercomapi/Intercom/StartTalk/${this.id}`,
                    method: 'get'
                }).then(res => {
                    let { code, data } = res.data
                    if (code === 200) {

                    }
                })
            } else {
                this.audioback = new H5sPlayerAudBack(this.Config2)
                this.audioback.connect()
            }
        }

        // 结束通话 ---  待测试
        StopTalk() {
            if (this.video.category === 5) {
                request({
                    url: `/intercomapi/Intercom/StopTalk/${this.id}`,
                    method: 'get'
                }).then(res => {
                    let { code, data } = res.data
                    if (code === 200) {
                    }
                })
            } else {
                if (this.audioback) {
                    this.audioback.disconnect()
                    delete this.audioback
                    this.audioback = undefined
                }
            }
            
        }

        // 视频开始对话
        startTalkVideo() {
            if (this.video.category == 1) {
                // this.audioback = new H5sPlayerAudBack(this.Config2)
                // this.audioback.connect()
                // this.isHangUp = !this.isHangUp
                // console.log('我顺利通话了！！！')
                request({
                    url: `/intercomapi/Intercom/StartTalk/${this.video.id}`,
                    method: 'get'
                }).then(res => {
                    if (res.data == true) {
                        this.isHangUp = !this.isHangUp
                    }
                })
            }
        }

        // 视频结束对话
        endTalkVideo() {
            if (this.video.category == 1) {
                request({
                    url: `/intercomapi/Intercom/StopTalk/${this.video.id}`,
                    method: 'get'
                }).then(res => {
                    if (res.data == true) {
                        this.isHangUp = !this.isHangUp
                    }
                })
                // if (this.audioback) {
                //     this.audioback.disconnect()
                //     delete this.audioback
                //     this.audioback = undefined
                //     this.isHangUp = !this.isHangUp
                // }
            }
        }

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

            this._ptzAction(command)
        }

        // 停止
        ptzStop() {
            this._ptzAction('stop')
        }

        // 设置
        setPreset(iPreset) {
            let url: string = '/api/v1/SetPreset'

            let param: any = {
                token: this.Token,
                presetname: iPreset,
                presettoken: iPreset,
                session: ''
            }

            this._request(url, param).then(res => {
                if (res.status == 200) {
                    console.log("设置成功成功！")
                } else {
                    console.log("设置失败", res)
                }
            })
        }

        // 跳转 
        goPreset(iPreset) {
            let url: string = '/api/v1/Ptz'

            let param: any = {
                token: this.Token,
                action: 'preset',
                preset: iPreset,
                speed: this.speed,
                session: ''
            }

            this._request(url, param).then(res => {
                if (res.status == 200) {
                    console.log("跳转成功！")
                } else {
                    console.log("跳转失败", res)
                }
            })
        }

        // 开始回放，如果endtime为null，则结束时间为当前 
        startPlayBack(startTime: Date, endTime: Date | null = null) {
            this.startTime = startTime
            let videoRef: HTMLElement = this.$refs.video as HTMLElement
            videoRef.setAttribute('autoplay', 'autoplay')
            // videoRef.setAttribute('controls', 'controls')
            // videoRef.setAttribute('loop', 'loop')

            this.playbackStartTime = startTime.getTime()

            // 先停止播放
            this.Stop()

            let st: string = startTime.toISOString() + "+08"
            let et: string = (endTime ? endTime : new Date()).toISOString() + "+08"

            // 回放配置1
            let pbconf1 = {
                begintime: st,
                endtime: et,
                showposter: 'true', //'true' or 'false' show poster
                callback: this._PlaybackCB,
                userdata: this // user data
            }
            let conf = {
                videoid: this.videoId,
                protocol: window.location.protocol, //http: or https:
                host: `${this.video.playVideoServer.ip}:${this.video.playVideoServer.port}`,
                // host: `${this.playVideoServerIp}:${this.playVideoServerPort}`,
                rootpath: '/', // '/'
                token: this.Token,
                pbconf: pbconf1, //This is optional, if no pbconf, this will be live.
                hlsver: 'v1', //v1 is for ts, v2 is for fmp4
                session: ''
            }

            this.h5backhandler = new H5sPlayerRTC(conf)
            this.h5backhandler.connect()
            setTimeout(function () {
                this.h5backhandler.start()
            }.bind(this), 500)
        }

        // 停止 -
        stopPlayBack() {
            if (this.h5backhandler) {
                this.h5backhandler.disconnect()
                delete this.h5backhandler
                this.h5backhandler = undefined
            }
        }

        // 暂停 suspendPlayBack 
        suspendPlayBack() {
            if (this.h5backhandler) {
                this.h5backhandler.pause()
            }
        }

        // 继续 continuePlayBack
        continuePlayBack() {
            if (this.h5backhandler) {
                this.h5backhandler.resume()
            }
        }

        // 慢放 slowPlayBack 
        slowPlayBack() {
            // 最慢0.5倍速
            if (this.playbackSpeed >= 1) this.playbackSpeed = this.playbackSpeed / 2
            this.h5backhandler.speed(this.playbackSpeed)
        }

        // 快放 fastPlayBack
        fastPlayBack() {
            // 最快16倍速
            if (this.playbackSpeed <= 8) this.playbackSpeed = this.playbackSpeed * 2
            this.h5backhandler.speed(this.playbackSpeed)
        }

        // 全屏
        fullscreen() {
            clearTimeout(time)
            let elem: any = document.getElementById(this.id);
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        }

        // 显示ptz等控制
        controlsShow(e: MouseEvent) {
            this.isPTZControlsShow = e.type != "mouseout" && !this.h5backhandler
            this.isShowTalk = e.type != "mouseout" && this.video.category == 1
        }

        _ptzAction(command: string) {
            let url: string = '/api/v1/Ptz'

            let param: any = {
                token: this.Token,
                action: command,
                speed: this.speed,
                session: ''
            }

            this._request(url, param).then(res => {
                if (res.status == 200) {
                    console.log("ptz运行成功！")
                } else {
                    console.log("ptz运行失败", res)
                }
            })
        }

        _request(url: string, params: any) {
            let {
                ip,
                port
            } = this.video.playVideoServer
            return axios.get(`http://${ip}:${port}${url}`, {
                params: params,
            })
        }

        _getVideoElement(): HTMLVideoElement {

            let result: HTMLVideoElement = undefined

            const collect = document.body.children
            for (let i = 0; i < collect.length; i++) {
                const element = collect[i]
                if (element.nodeName == 'VIDEO') {
                    // 将video从原来的父dom中移除
                    document.body.removeChild(element)
                    result = element as HTMLVideoElement
                }
            }

            // 如果没有在body下找到，则需新建一个video标签
            if (!result) {
                result = document.createElement("VIDEO") as HTMLVideoElement
                result.setAttribute('id', this._getRandomId())
                result.setAttribute('webkit-playsinline', 'true')
                result.setAttribute('playsinline', 'true')
                result.classList.add('h5video')
                result.style.width = "100%"
                result.style.height = "100%"
                result.style.objectFit = "fill"
            }

            // 将video变为黑色，初始状态
            result.load()
            result.style.display = "block"

            return result
        }

        _getRandomId(): string {
            let r: string = ''
            while (r == '' || document.getElementById(r)) {
                r = 'h5Id_' + Math.floor(Math.random() * 10000)
            }
            return r
        }

        _removeVideoElement() {
            // 将video从原来的父dom中移除
            const parentDom = this.videoDom.parentNode
            parentDom.removeChild(this.videoDom)

            // 将dom存到body中，并且不显示
            this.videoDom.style.display = "none"
            document.body.appendChild(this.videoDom)
        }

        _PlaybackCB(event, userdata) {
            console.log("Playback callback ", event, userdata);

            var msgevent = JSON.parse(event);
            if (msgevent.type === 'H5S_EVENT_PB_TIME') {
                // 已经播放了多少s
                var displayc = msgevent.pbTime.strTime;
                var starf = new Date(this.playbackStartTime).getTime() / 1000;
                var endd = new Date(msgevent.pbTime.strTime).getTime() / 1000;
                // 已经播放了多少s
                var staefend = endd - starf;
                console.log("=============", staefend, endd, starf)
                // 用来显示时间轴的
                // this.timelink = staefend;

            }

        }

        _sizeChange() {
            let _this = this
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    console.log("当前窗口", entry)
                    let width = entry.contentRect.width
                    if (width > 0 && this.h5handler) {
                        _this.streamprofile = width >= 720 ? "main" : "sub"
                        console.log("宽度", width, "码流", _this.streamprofile)
                        _this.Play()
                    }
                }
            })

            resizeObserver.observe(document.getElementById(this.videoId))
        }

    }
</script>

<style lang="less" scoped>
    .h5video {
        object-fit: fill;
        height: 100%;
        width: 100%;
    }

    .h5videowrapper {
        padding: 0px;
        height: 100%;
        width: 100%;
    }

    .h5container {
        position: relative;
        display: inline-block;
    }

    .h5container>.PTZClass {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-wrap: wrap;
    }

    .btnLeftUp,
    .btnUp,
    .btnRightUp,
    .btnLeft,
    .btnCenter,
    .btnRight,
    .btnLeftDown,
    .btnDown,
    .btnRightDown {
        width: 1.5rem;
        height: 1.5rem;
        text-align: center;
    }

    .btnUp,
    .btnLeft,
    .btnRight,
    .btnDown {
        cursor: pointer;
    }

    .btnUp,
    .btnUp:active,
    .btnUp:hover {
        top: 0;
        left: 50%;
        position: absolute;
        margin-left: -0.75rem;
    }

    .btnUp {
        background: url("./icon/up.png") no-repeat center;
        background-size: cover;
    }

    .btnUp:hover {
        background: url("./icon/up.png") no-repeat center;
        background-size: cover;
    }

    .btnUp:active {
        background: url("./icon/up-cursor.png") no-repeat center;
        background-size: cover;
    }

    .btnLeft,
    .btnLeft:active,
    .btnLeft:hover {
        position: absolute;
        top: 50%;
        margin-top: -0.75rem;
    }

    .btnLeft {
        background: url("./icon/left.png") no-repeat center;
        background-size: cover;
    }

    .btnLeft:hover {
        background: url("./icon/left.png") no-repeat center;
        background-size: cover;
    }

    .btnLeft:active {
        background: url("./icon/left-cursor.png") no-repeat center;
        background-size: cover;
    }

    .btnRight,
    .btnRight:active,
    .btnRight:hover {
        position: absolute;
        top: 50%;
        right: 0;
        margin-top: -0.75rem;
    }

    .btnRight {
        background: url("./icon/right.png") no-repeat center;
        background-size: cover;
    }

    .btnRight:hover {
        background: url("./icon/right.png") no-repeat center;
        background-size: cover;
    }

    .btnRight:active {
        background: url("./icon/right-cursor.png") no-repeat center;
        background-size: cover;
    }

    .btnDown,
    .btnDown:active,
    .btnDown:hover {
        position: absolute;
        bottom: 0;
        left: 50%;
        margin-left: -0.7rem;
    }

    .btnDown {
        background: url("./icon/down.png") no-repeat center;
        background-size: cover;
    }

    .btnDown:hover {
        background: url("./icon/down.png") no-repeat center;
        background-size: cover;
    }

    .btnDown:active {
        background: url("./icon/down-cursor.png") no-repeat center;
        background-size: cover;
    }

    .talk-icon {
        width: 2rem;
        height: 2rem;
        border-radius: 2rem;
        line-height: 2rem;
        cursor: pointer;
        position: absolute;
        bottom: 5px;
        right: 5px;
        background: green;
        img {
            width: 80%;
            height: 80%;
            transform: translate(12%, 10%);
        }
    }
</style>