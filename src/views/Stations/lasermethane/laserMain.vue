<template>
    <div class="laser-methane-main-wrap">
        <div class="left">
            <div class="obj-list-wrap">
                <div class="modular-title">设备列表</div>
                <div class="top-line">
                    <div class="select-wrap">
                        <el-select v-model="selectId" placeholder="请选择" @change="ComplexSelectChange">
                            <el-option v-for="(item, index) in complexObjects" :key="item.id + index" :label="item.name"
                                :value="item.id">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="btn basic-box" @click="calibrate()">一键校准</div>
                </div>
                <!-- <div class="bottom-line">
                    <Input v-model="threshold" />
                    <div class="unit-wrap basic-box">ppm.m</div>
                    <div class="btn basic-box" @click="setThreshold()">阀值设定</div>
                </div> -->
            </div>
            <div class="real-time-patrol-wrap">
                <RealTimePatrol :objectId="selectId"/>
            </div>
            <div class="auto-cruise-wrap">
                <AutoCruise :videoId="videoId" :autoCruiseVideo="video"/>
            </div>
            <div class="real-time-alarm-wrap">
                <RealTimeAlarm />
            </div>
        </div>
        <div class="center">
            <div class="video-wrap">
                <VideoComponent 
                    id="laserMethane_id" 
                    ref="laserMethaneRef" 
                    :video="video"
                    :speed="speedValue"
                />
            </div>
            <div class="echarts-wrap">
                <div class="real-time-info-wrap">
                    <RealInfo 
                        :methane="methane" 
                        :light="light" 
                        :videoX="videoX" 
                        :videoY="videoY" 
                        :videoZ="videoZ"
                    />
                </div>
                <div class="methane-concentration-wrap">
                    <MathaneConcentration :methane="methane"/>
                </div>
            </div>
        </div>
        <div class="right">
            <div class="control-wrap">
                <div class="control_box methane_control_box">
                    <div class="modular-title">云台旋转</div>
                    <div class="control">
                        <span
                            class="opera_btn add_btn"
                            @mousedown="ptzTurn(4)"
                            @mouseup="ptzStop"
                        ></span>
                        <span
                            class="opera_btn reduce_btn"
                            @mousedown="ptzTurn(5)"
                            @mouseup="ptzStop"
                        ></span>
                        <span
                            class="opera_btn wiper_on"
                            @mousedown="ptzTurn(12)"
                                    @mouseup="ptzStop"
                        ></span>
                        <span
                            class="opera_btn wiper_off"
                            @mousedown="ptzTurn(12)"
                            @mouseup="ptzStop"
                        ></span>
                        <ul class="circle_control">
                            <!-- 上 -->
                            <li
                                class="circle_item item_top"
                                @mousedown="ptzTurn(0)"
                                @mouseup="ptzStop"
                            >
                                <span class="opera_icon top_icon"></span>
                            </li>
                            <!-- 右 -->
                            <li
                                class="circle_item item_right"
                                @mousedown="ptzTurn(3)"
                                @mouseup="ptzStop"
                            >
                                <span class="opera_icon right_icon"></span>
                            </li>
                            <!-- 下 -->
                            <li
                                class="circle_item item_bottom"
                                @mousedown="ptzTurn(1)"
                                @mouseup="ptzStop"
                            >
                                <span class="opera_icon bottom_icon"></span>
                            </li>
                            <!-- 左 -->
                            <li
                                class="circle_item item_left"
                                @mousedown="ptzTurn(2)"
                                @mouseup="ptzStop"
                            >
                                <span class="opera_icon left_icon"></span>
                            </li>
                            <!-- 中 -->
                            <li class="item_center" @click="ptzStop">
                                <span class="center_icon"></span>
                            </li>
                        </ul>
                    </div>
                    <div class="slider">
                        <span class="tit">速度</span>
                        <el-slider class="slider-progress" v-model="speedValue" @change="changeSpeed" :min="1" :max="7"></el-slider>
                    </div>
                    <div class="selected_box">
                        <div class="tit">预置点</div>
                        <div class="preset_positions">
                            <el-select v-model="selectedValue" placeholder="请选择">
                                <el-option v-for="item in presetList" :key="item.value" :label="item.label"
                                    :value="item.value">
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
            </div>
            <div class="operation-btn-wrap">
                <!-- <VideoPlayback /> -->
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
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import {
        Component,
        Vue,
        Watch
    } from "vue-property-decorator"
    import {
        ComplexChild,
        ComplexObject
    } from '@/types/complexobject.interface'
    import {
        MeasObjectVo,
        MeasObject
    } from '@/types/measobject.interface'
    import {
        Video
    } from '@/types/video.interface'
    import {
        MeasObjectVal
    } from '@/types/measobjectval.interface'
    import {
        getComplexObjectByCondition,
        getDefaultComplexObject
    } from '@/api/complexobject'
    import {
        getDefaultVideo,
        getVideoDto
    } from '@/api/video'
    import {
        getDefaultMeasObjectVal,
        getMeasObjectVal
    } from '@/api/measobject'
    import {
        calibrate,
        setThreshold
    } from '@/api/lasermethane'
    import RealTimePatrol from './realTimePatrol.vue'
    import AutoCruise from './autoCruise.vue'
    import RealTimeAlarm from './realTimeAlarm.vue'
    // import Control from './control.vue'
    // import VideoPlayback from './videoPlayback.vue'
    import RealInfo from './RealInfo.vue'
    import MathaneConcentration from './methaneConcentration.vue'
    import VideoComponent from "@/components/Video/CommonVideo.vue";

    @Component({
        components: { 
            RealTimePatrol, 
            AutoCruise, 
            RealTimeAlarm, 
            // Control, 
            // VideoPlayback, 
            RealInfo,
            MathaneConcentration,
            VideoComponent 
        }
    })
    export default class LaserMethanePage extends Vue {
        // 所有的激光甲烷对象
        complexObjects: ComplexObject[] = []
        // 当前选择的激光甲烷
        curComplexObj: ComplexObject = getDefaultComplexObject()
        // 选中的对象ID
        selectId: number = 0
        // 视频对象
        video: Video
        // 甲烷对象
        methane: MeasObjectVal = getDefaultMeasObjectVal()
        // 光强对象
        light: MeasObjectVal = getDefaultMeasObjectVal()
        // X
        videoX: MeasObjectVal = getDefaultMeasObjectVal()
        // Y
        videoY: MeasObjectVal = getDefaultMeasObjectVal()
        // Z
        videoZ: MeasObjectVal = getDefaultMeasObjectVal()

        // 阀值
        threshold: number = 12.23

        //视频id
        videoId: number = 0

        // 视频组件对象
        $refs: {
            laserMethaneRef: HTMLFormElement;
        }

        // videoBoxRef!: HTMLFormElement

        // 接受子组件传值speed
        speedValue: number = 0

        selectedValue: number = 0

        presetList: any[] = [
            {
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
        ]
        
        playBackDate: String = "";
        playBackTime: String = "";
        
        mounted() {
            this.initData()
        }

        initData() {

            // 先获取所有的激光甲烷复杂对象
            let vo: MeasObjectVo = {
                stationId: this.$store.state.stationId,
                objectType: 5, // 激光甲烷
                dataType: 5 // 复杂类型
            }

            getComplexObjectByCondition(vo).then(res => {
                if (res.data.code == 200) {
                    this.complexObjects = res.data.data
                    if (this.complexObjects.length > 0) {
                        this.curComplexObj = this.complexObjects[0]
                        this.selectId = this.curComplexObj.id
                        this.getAllChild()
                    }
                }
            })
        }

        ComplexSelectChange(value) {
            let index: number = this.complexObjects.findIndex(o => o.id == value)
            this.curComplexObj = this.complexObjects[index]
            this.getAllChild()
        }

        getAllChild() {
            if (this.curComplexObj.id == 0) return

            this.curComplexObj.children.sort((a, b) => {
                return a.index - b.index
            })

            let children: ComplexChild[] = this.curComplexObj.children
            // 获取视频，第一个
            getVideoDto(children[0].id).then(res => {
                if (res.data.code == 200) this.video = res.data.data
                this.videoId = this.video.id
            })
            // 获取甲烷，第二个
            getMeasObjectVal(children[1].id).then(res => {
                if (res.data.code == 200) this.methane = res.data.data
            })
            // 获取光强，第三个
            getMeasObjectVal(children[2].id).then(res => {
                if (res.data.code == 200) this.light = res.data.data
            })
            // 获取X，第四个
            getMeasObjectVal(children[3].id).then(res => {
                if (res.data.code == 200) this.videoX = res.data.data
            })
            // 获取Y，第五个
            getMeasObjectVal(children[4].id).then(res => {
                if (res.data.code == 200) this.videoY = res.data.data
            })
            // 获取Z，第六个
            getMeasObjectVal(children[5].id).then(res => {
                if (res.data.code == 200) this.videoZ = res.data.data
            })
        }
    
        // 一键校准
        calibrate() {
            let data = {
                objectId: this.selectId,
                cv: true,
                time: new Date().getTime()
            }
            calibrate(data).then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    this.$Message.success('校准成功！')
                } else {
                    this.$Message.error('校准失败！')
                }
            })
        }

        // 阀值设定
        setThreshold() {
            let data = {
                objectId: this.methane.id,
                cv: this.threshold,
                time: new Date().getTime()
            }
            setThreshold(data).then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    this.$Message.success('阀值设定成功！')
                } else {
                    this.$Message.error('阀值设定失败！')
                }
            })
        }

        // 向上、下、左、右
        ptzTurn(direction) {
            this.$refs.laserMethaneRef.ptzTurn(direction);
        }
        // 停止
        ptzStop() {
            this.$refs.laserMethaneRef.ptzStop();
        }

        // 设置
        setPreset(iPreset) {
            if (!iPreset) {
                return;
            }
            this.$refs.laserMethaneRef.setPreset(iPreset);
        }

        // 跳转
        goPreset(iPreset) {
            this.$refs.laserMethaneRef.goPreset(iPreset);
        }

        // 速度
        changeSpeed(value) {
            this.speedValue = value
        }

        // 视频回放
        // 开始
        startPlayBack(date, time) {
            if (!date || !time) {
                this.$message.error("请选择日期和时间！");
                return;
            }
            this.$refs.laserMethaneRef.startPlayChildren(date, time);
        }
    
        // 停止
        stopPlayBack() {
            this.$refs.laserMethaneRef.stopPlayBackChildren();
        }
        // 暂停
        suspendPlayBack() {
            this.$refs.laserMethaneRef.suspendPlayBackChildren();
        }

        // 继续
        continuePlayBack() {
            this.$refs.laserMethaneRef.continuePlayBackChildren();
        }

        //慢放
        slowPlayBack() {
            this.$refs.laserMethaneRef.slowPlayBackChildren();
        }

        // 快放
        fastPlayBack() {
            this.$refs.laserMethaneRef.fastPlayBackChildren();
        }
    }
</script>
<style lang="less">
.laser-methane-main-wrap {
    width: 100%;
    height: 100%;
    display: flex;
    .left,
    .right,
    .center {
        display: flex;
        flex-direction: column;
        font-size: 16px;
        color: #ffffff;
    }
    .left {
        flex: 1;
        .obj-list-wrap {
            flex: 1;
            .top-line,
            .bottom-line {
                display: flex;
                align-items: flex-end;
                justify-content: space-between;
                margin-left: 10px;
                .basic-box {
                    height: 2.5rem;
                    line-height: 2.5rem;
                    padding: 0 7px;
                    min-width: 5rem;
                    text-align: center;
                }
                .btn {
                    background: #2699B6;
                    border-radius: 8px;
                }
                .btn.basic-box {
                    &:first-child,
                    &:last-child {
                        cursor: pointer;
                    }
                }
                .ivu-input-wrapper {
                    width: 6rem;
                    .ivu-input {
                        background: #fff0;
                        border: 1px solid #2699B6;
                        height: 2.5rem;
                        line-height: 2.5rem;
                        color: #ffffff;
                        text-align: center;
                    }
                }
            }
            .top-line {
                .select-wrap {
                    .el-input__inner {
                        background-color: #fff0;
                        color: #ffffff;
                        border: 1px solid #2699B6;
                    }
                }
            }
            .bottom-line {
                margin-top: 10px;
                .concentration-value {
                    background: none;
                    border: 1px solid #2699B6;
                }
            }
        }
        .real-time-patrol-wrap {
            flex: 2;
        }
        .auto-cruise-wrap,
        .real-time-alarm-wrap {
            flex: 4;
            overflow: hidden;
        }
    }
    .center {
        flex: 3;
        display: flex;
        flex-direction: column;
        .video-wrap {
            flex: 8;
            overflow: hidden;
            padding: 0 10px;
        }
        .echarts-wrap {
            flex: 4;
            display: flex;
            padding: 10px;
            .real-time-info-wrap{
                flex: 3;
            }
            .methane-concentration-wrap {
                flex: 2;
            }
        }
    }
    .right {
        flex: 1;
        .control-wrap,
        .operation-btn-wrap {
            flex: 1;
        }
        .control-wrap {
            .methane_control_box {
    .control {
        margin-top: 20%;
        
    }
    .center_icon {
        background: url("../../../assets/images/control_center.png") no-repeat;
        background-size: 100% 100%;
    }
    .top_icon {
        background: url("../../../assets/images/control_top.png") no-repeat;
        background-size: 100% 100%;
    }
    .right_icon {
        background: url("../../../assets/images/control_right.png") no-repeat;
        background-size: 100% 100%;
    }
    .bottom_icon {
        background: url("../../../assets/images/control_bottom.png") no-repeat;
        background-size: 100% 100%;
    }
    .left_icon {
        background: url("../../../assets/images/control_left.png") no-repeat;
        background-size: 100% 100%;
    }
    .add_btn {
        background: url("../../../assets/images/add_btn.png") no-repeat;
        background-size: 100% 100%;
        right: 50px !important;
        top: 10px !important;
    }
    
    .reduce_btn {
        background: url("../../../assets/images/reduce_btn.png") no-repeat;
        background-size: 100% 100%;
        right: 0px !important;
        top: 10px !important;
    }
    .wiper_on {
        background: url("../../../assets/images/wiper-on.png") no-repeat;
        background-size: 100% 100%;
        right: 50px !important;
        top: 80px !important;
    }
    .wiper_off {
        background: url("../../../assets/images/wiper-off.png") no-repeat;
        background-size: 100% 100%;
        right: 0px !important;
        top: 80px !important;
    }
    .slider {
        width: 70%;
        margin: 0 auto;
        height: 50px;
        line-height: 50px;
        margin-top: 20px;
        display: flex;
        .tit {
            font-size: 1rem;
            color: #e0e4e7;
            flex: 4;
            letter-spacing: 1rem;

        }
        .slider-progress {
            flex: 10;
        }
    }
    .btn_box {
        margin-bottom: 20px;
    }
}
        }
    }
}
</style>