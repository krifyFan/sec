<template>
    <div class="high_consequence_video">
        <div class="col">
            <div class="search_box">
                <span class="search_icon"></span>
                <Input
                    class="search"
                    prefix="ios-search"
                    placeholder="搜索"
                    style="width: auto;"
                />
            </div>

            <div class="video_list">
                <button>
                    <span class="down_arrow"></span>
                    <span class="video_icon"></span>
                    视频列表
                </button>
                <ul class="dropdown">
                    <li
                        :class="[
                            isVideosItemActived == item.name ? 'active' : '',
                            'dropdown_item',
                        ]"
                        @click="selectVideosItem(item)"
                        v-preventReClick
                        v-for="item in videos"
                        :key="item.id"
                    >
                        <span class="item_icon"></span>
                        {{ item.name }}
                    </li>
                </ul>
            </div>
            <div class="high_consequence_alarm">
                <h4>报警信息</h4>
            </div>
        </div>
        <div class="col">
            <div class="video">
                <HIKOLD ref="hikRef"></HIKOLD>
            </div>
        </div>
        <div class="col">
            <div class="control_box">
                <p class="tit">云台旋转</p>
                <div class="control">
                    <span class="opera_btn add_btn" @click="ptzTurn(4)"></span>
                    <span class="opera_btn reduce_btn" @click="ptzTurn(5)"></span>
                    <ul class="circle_control">
                        <!-- 上 -->
                        <li class="circle_item item_top" @click="ptzTurn(0)">
                            <span class="opera_icon top_icon"></span>
                        </li>
                        <!-- 右 -->
                        <li class="circle_item item_right" @click="ptzTurn(3)">
                            <span class="opera_icon right_icon"></span>
                        </li>
                        <!-- 下 -->
                        <li class="circle_item item_bottom" @click="ptzTurn(1)">
                            <span class="opera_icon bottom_icon"></span>
                        </li>
                        <!-- 左 -->
                        <li class="circle_item item_left" @click="ptzTurn(2)">
                            <span class="opera_icon left_icon"></span>
                        </li>
                        <!-- 中 -->
                        <li class="item_center" @click="ptzStop">
                            <span class="opera_icon center_icon"></span>
                        </li>
                    </ul>
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
                        <!-- <span class="setting_icon"></span> -->
                    </div>
                    <div class="jump btn" @click="goPreset(selectedValue)">
                        跳转
                        <!-- <span class="jump_icon"></span> -->
                    </div>
                </div>
            </div>
            <div class="video_playback">
                <p class="tit">视频回放</p>
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
            <div class="video_screen">
                <p class="tit">视频画面</p>
                <ul class="screen_box">
                    <li class="screen_item" @click="ArrangeWindow(1)"></li>
                    <li class="screen_item" @click="ArrangeWindow(4)"></li>
                    <li class="screen_item" @click="ArrangeWindow(9)"></li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ECharts, EChartOption, EChartsSeriesType } from "echarts";
import { Video, VideoVo } from "@/types/video.interface";
import { getVideoDtosByCondition } from "@/api/video";
import HIKOLD from "@/components/Video/VideoSquaredBox.vue";

@Component({
    components: {
        HIKOLD,
    },
})
export default class HighConsequenceVideo extends Vue {
    isVideosItemActived: Boolean = false; //视频列表是否激活
    videos: Video[] = []; //视频列表
    stationId: number;
    selectedValue: any = "";
    playBackDate: String = "";
    playBackTime: String = "";
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
    ];
    $refs: { hikRef: HTMLFormElement };

    mounted() {
        this.getVideosInfo();
    }
    ArrangeWindow(x) {
        this.$refs.hikRef.ArrangeWindowChildren(x);
    }

    // 获取stationId
    getStationId() {
        this.stationId = this.$store.state.stationId;
    }

    // 获取视频列表
    getVideosInfo() {
        this.getStationId();
        let vo: VideoVo = {
            stationId: this.stationId,
            category: 2,
        };
        getVideoDtosByCondition(vo).then((res: any) => {
            let { code, data } = res.data;
            if (code != 200) return;
            this.videos = data;
        });
    }

    // 点击视频列表每一项
    selectVideosItem(videosItem) {
        this.isVideosItemActived = videosItem.name;
        this.$refs.hikRef.PreviewStart(videosItem);
    }

    // 向上、下、左、右
    ptzTurn(direction) {
        this.$refs.hikRef.ptzTurnChildren(direction);
    }
    // 停止
    ptzStop() {
        this.$refs.hikRef.ptzStopChildren();
    }

    // 设置
    setPreset(iPreset) {
        if (!iPreset) {
            return;
        }
        this.$refs.hikRef.setPresetChildren(iPreset);
    }

    // 跳转
    goPreset(iPreset) {
        this.$refs.hikRef.goPresetChildren(iPreset);
    }

    // 视频回放
    // 开始
    startPlayBack(date, time, curVideo) {
        if (!date || !time) {
            this.$message.error("请选择日期和时间！");
            return;
        }
        this.$refs.hikRef.startPlayChildren(date, time, curVideo);
    }

    // 停止
    stopPlayBack() {
        this.$refs.hikRef.stopPlayBackChildren();
    }

    // 暂停
    suspendPlayBack() {
        this.$refs.hikRef.suspendPlayBack();
    }

    // 继续
    continuePlayBack() {
        this.$refs.hikRef.continuePlayBack();
    }

    //慢放
    slowPlayBack() {
        this.$refs.hikRef.slowPlayBack();
    }

    // 快放
    fastPlayBack() {
        this.$refs.hikRef.fastPlayBack();
    }
}
</script>
<style lang="less" scope>
.high_consequence_video {
    display: flex;
    height: 100%;
    padding: 0 50px 20px;
    .col {
        flex: 2;
        height: 83%;
        &:nth-child(1) {
            background-color: transparent;
            padding: 10px 3px 75px 0;
            background: url("../../assets/images/security_panel_bd.png")
                no-repeat;
            background-size: 100% 100%;
        }
        &:nth-child(2) {
            flex: 8;
        }
        &:nth-child(3) {
            background: url("../../assets/images/TV_bd.png") no-repeat;
            background-size: 100% 100%;
        }
        // 侧边搜索
        .search_box {
            position: relative;
            .search_icon {
                display: block;
                width: 30px;
                height: 30px;
                background: url("../../assets/images/search_icon.png") no-repeat;
                background-size: 100% 100%;
                position: absolute;
                left: 40px;
                top: 9px;
            }
            .search {
                width: 80%;
                height: 48px;
                margin-left: 105px;
                margin-right: 15px;
                input {
                    width: 100%;
                }
                i {
                    display: none;
                }
                .ivu-input {
                    background-color: transparent;
                    border: none;
                    font-size: 20px;
                    color: #fff;
                    padding-left: 0px;
                }
            }
        }

        // 侧边视频列表和视频分组
        .video_list {
            height: 70%;
            font-size: 20px;
            overflow-y: auto;
            overflow-x: hidden;
            border-bottom: 1px solid rgba(41, 154, 182, 0.5);

            // 滚动条样式
            scrollbar-arrow-color: #263f6a; /*三角箭头的颜色*/
            scrollbar-face-color: #263f6a; /*立体滚动条的颜色（包括箭头部分的背景色）*/
            scrollbar-3dlight-color: #36e5ff; /*立体滚动条亮边的颜色*/
            scrollbar-shadow-color: #263f6a; /*立体滚动条阴影的颜色*/
            scrollbar-darkshadow-color: #263f6a; /*立体滚动条外阴影的颜色*/
            scrollbar-track-color: #0d1836; /*立体滚动条背景颜色*/
            scrollbar-base-color: #0d1836; /*滚动条的基色*/
            ::-webkit-scrollbar {
                width: 10px;
            }
        }
        .video_group {
            padding-top: 5px;
            font-size: 20px;
            position: relative;
            .add_icon {
                display: block;
                width: 24px;
                height: 24px;
                line-height: 18px;
                text-align: center;
                border: 3px solid #fff;
                border-radius: 50%;
                position: absolute;
                right: 10px;
                top: 3px;
            }
        }
        button {
            width: 100%;
            line-height: 34px;
            background-color: transparent;
            color: #fff;
            border: none;
            cursor: pointer;
            padding-left: 18px;
            outline: none;
            position: relative;
            .video_icon {
                display: block;
                width: 36px;
                height: 30px;
                background: url("../../assets/images/video_list_icon.png")
                    no-repeat;
                background-size: 100% 100%;
                position: absolute;
                top: 3px;
                left: 40px;
            }
            .group_icon {
                display: block;
                width: 36px;
                height: 30px;
                background: url("../../assets/images/group_icon.png") no-repeat;
                background-size: 100% 100%;
                position: absolute;
                top: 5px;
                left: 40px;
            }
        }
        .down_arrow {
            display: block;
            width: 16px;
            height: 10px;
            background: url("../../assets/images/down_arrow.png") no-repeat;
            background-size: 100% 100%;
            position: absolute;
            top: 10px;
            left: 10px;
        }
        .dropdown {
            width: 100%;
            color: #fff;
            .dropdown_item {
                list-style: none;
                width: 100%;
                line-height: 34px;
                height: 34px;
                text-align: left;
                padding-left: 140px;
                cursor: pointer;
                position: relative;
                // &:nth-child(1) {
                //     // padding-left: 100px;
                // }
                .ivu-icon-ios-folder {
                    position: absolute;
                    left: 100px;
                    top: 8px;
                }
                .ivu-icon-ios-create {
                    position: absolute;
                    left: 45px;
                    top: 8px;
                    font-size: 24px;
                }
                .item_icon {
                    display: block;
                    width: 14px;
                    height: 17px;
                    background: url("../../assets/images/item_icon.png")
                        no-repeat;
                    background-size: 100% 100%;
                    position: absolute;
                    left: 100px;
                    top: 8px;
                }

                .reduce_icon {
                    display: block;
                    width: 24px;
                    height: 24px;
                    line-height: 16px;
                    text-align: center;
                    border: 3px solid #fff;
                    border-radius: 50%;
                    position: absolute;
                    left: 8px;
                    top: 6px;
                }
                .save_txt {
                    position: absolute;
                    right: 0;
                    top: 0;
                }
                &.active {
                    border-right: 15px solid #47a1ff;
                    background-color: rgba(71, 161, 255, 0.2);
                    border-radius: 3px;
                    color: #36e5ff;
                    .item_icon {
                        background: url("../../assets/images/item_icon_active.png");
                        background-size: 100% 100%;
                    }
                }
                .groupName {
                    height: 34px;
                    width: 100%;
                    background: none;
                    outline: none;
                    outline: none;
                    border: 0px;
                    color: #fff;
                    cursor: pointer;
                    &:focus {
                        cursor: auto;
                    }
                }
                .edit {
                    background-color: blue;
                    cursor: auto;
                }
            }
            .add_item {
                padding-left: 140px;
            }
        }

        // 高后果告警
        .high_consequence_alarm {
            height: 30%;

            h4 {
                line-height: 45px;
                font-size: 22px;
                color: #2ed1f6;
                font-weight: 500;
                padding-left: 21px;
                font-weight: 700;
            }
        }

        // 中间视频区
        .video {
            // height: 740px;
            height: 100%;
            background-color: rgba(17, 29, 63, 1);
            margin: 5px 10px 0;
        }
        // 右侧控件区
        .control_box {
            height: 40%;
            border-bottom: 1px solid rgba(41, 154, 182, 0.5);
            .control {
                margin-top: 10% !important;
                .top_icon { 
                    background: url("../../assets/images/control_top.png") no-repeat; 
                    background-size: 100% 100%;
                }
                .right_icon {      
                    background: url("../../assets/images/control_right.png") no-repeat;
                    background-size: 100% 100%;   
                }
                .bottom_icon {
                    background: url("../../assets/images/control_bottom.png") no-repeat;
                    background-size: 100% 100%;
                }
                .left_icon {
                    background: url("../../assets/images/control_left.png") no-repeat;
                    background-size: 100% 100%;
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
        }
        // 视频回放
        .video_playback {
            height: 48%;
        }
        .video_screen {
            .screen_box {
                .screen_item {
                    background: url("../../assets/images/screen_one.png") no-repeat;
                    background-size: 100% 100%;
                    &:nth-child(2) {
                        background: url("../../assets/images/screen_four.png") no-repeat;
                        background-size: 100% 100%;
                    }
                    &:nth-child(3) {
                        background: url("../../assets/images/screen_nine.png") no-repeat;
                        background-size: 100% 100%;
                    }
                }
            }
        }

        .video_playback_item_content-wrap {
            .time-choose-wrap {
                padding: 0px !important;
                margin-top: -10px;
            }
        }
    }
}
</style>
