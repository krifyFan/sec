<template>
    <div class="industrialTV">
        <div class="col">
            <div class="video_list">
                <button @click="showVideoList">
                    视频列表
                </button>
                <ul class="dropdown" v-show="isShowVideoList">
                    <li :class="[
                            isVideosItemActived == item.name ? 'active' : '',
                            'dropdown_item',
                        ]" @click="selectVideosItem(item)" v-preventReClick v-for="item in videos" :key="item.id">
                        <span class="item_icon"></span>
                        {{ item.name }}
                    </li>
                </ul>
            </div>
            <div class="video_group">
                <button @click.stop="addVideoGroupsItem">
                    视频分组
                </button>
                <ul class="dropdown " v-show="isShowVideoGroup">
                    <li :class="[
                            isVideoGroupsItemActived == item.name
                                ? 'active'
                                : '',
                            'dropdown_item',
                        ]" v-for="item in videoGroups" :key="item.id" @click="selectVideoGroupsItem(item)">
                        <!-- <span class="reduce_icon" @click.stop="deleteVideoGroupsItem(item.id)">-</span>
                        <span @click.stop="saveGroup(item)" class="save_txt" v-if="item.isEdited">保存</span>
                        <Icon type="ios-create" @click.stop="editGroup(item)" /> -->
                        <Icon type="ios-folder" />
                        <!-- <input type="text" v-model="item.name" :class="[
                                item.isVideoGroupsEdited ? '' : 'edit',
                                'groupName',
                            ]" @blur.stop="addGroupName(item)" :readonly="item.isVideoGroupsEdited"
                            :unselectable="item.isVideoGroupsEdited ? 'on' : ''" /> -->
                        <input type="text" v-model="item.name" class="groupName" readonly />
                    </li>
                </ul>
            </div>
        </div>
        <div class="col">
            <div class="video">
                <VideoBox ref="videoBoxRef"></VideoBox>
            </div>
        </div>
        <div class="control-wrap">
            <div class="control_box">
                <p class="tit">云台旋转</p>
                <div class="control">
                    <span class="add_btn" @mousedown="ptzTurn(4)" @mouseup="ptzStop"></span>
                    <span class="reduce_btn" @mousedown="ptzTurn(5)" @mouseup="ptzStop"></span>
                    <ul class="circle_control">
                        <!-- 上 -->
                        <li class="circle_item item_top" @mousedown="ptzTurn(0)" @mouseup="ptzStop">
                            <span class="top_icon"></span>
                        </li>
                        <!-- 右 -->
                        <li class="circle_item item_right" @mousedown="ptzTurn(3)" @mouseup="ptzStop">
                            <span class="right_icon"></span>
                        </li>
                        <!-- 下 -->
                        <li class="circle_item item_bottom" @mousedown="ptzTurn(1)" @mouseup="ptzStop">
                            <span class="bottom_icon"></span>
                        </li>
                        <!-- 左 -->
                        <li class="circle_item item_left" @mousedown="ptzTurn(2)" @mouseup="ptzStop">
                            <span class="left_icon"></span>
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
    import {
        Component,
        Vue
    } from "vue-property-decorator";
    import {
        log
    } from "util";
    import VideoBox from "@/components/Video/VideoSquaredBox.vue";
    import {
        getVideoDtosByCondition
    } from "@/api/video";
    import {
        VideoGroup
    } from "@/types/videogroup.interface";
    import {
        Video,
        VideoVo
    } from "@/types/video.interface";
    import {
        getVideoGroups,
        addVideoGroup,
        editVideoGroup,
        deleteVideoGroup,
        getVideoGroupDtosByStation,
    } from "@/api/videogroup";

    @Component({
        components: {
            VideoBox,
        },
    })
    export default class IndustrialTV extends Vue {
        isVideosItemActived: Boolean = false; //视频列表是否激活
        isVideoGroupsItemActived: string = ""; //视频分组是否激活
        stationId: number;
        isShowVideoList: Boolean = true;
        isShowVideoGroup: Boolean = true;
        videos: Video[] = []; //视频列表
        videoGroups: VideoGroup[] = []; //视频分组
        newGroupsNum: number = 0; //新增分组数
        selectedValue: any = "";
        // curVideosItem: Video[] = []; //当前选中视频

        get presetList() {
            let arr = []
            for(let i = 1; i < 31; i++) {
                let temp = {
                    value: i.toString(),
                    label: i.toString()
                }
                arr.push(temp)
            }
            return arr
        }

        playBackDate: String = "";
        playBackTime: String = "";
        $refs: {
            videoBoxRef: HTMLFormElement;
        };

        mounted() {
            this.getStationId();
            this.getVideosInfo();
            this.getVideoGroups();
        }

        ArrangeWindow(x) {
            this.$refs.videoBoxRef.ArrangeWindowChildren(x);
        }

        // 获取视频列表
        getVideosInfo() {
            this.getStationId();
            let vo: VideoVo = {
                stationId: this.stationId,
                category: 1,
            };
            getVideoDtosByCondition(vo).then((res: any) => {
                let {
                    code,
                    data
                } = res.data;
                if (code != 200) return;
                this.videos = data;
            });
        }

        // 点击视频列表每一项
        selectVideosItem(videosItem) {
            this.isVideosItemActived = videosItem.name;
            // this.curVideosItem = videosItem;
            this.$refs.videoBoxRef.setCurrentVideo(videosItem);
        }

        // 获取stationId
        getStationId() {
            this.stationId = this.$store.state.stationId;
        }

        // 获取视频分组
        getVideoGroups() {
            getVideoGroupDtosByStation(this.stationId).then((res) => {
                let {
                    code,
                    data
                } = res.data;
                if (code != 200) return;
                this.videoGroups = data;
                // 给每一项加分组名称是否可编辑和视频是否可编辑属性
                this.videoGroups.forEach((ele) => {
                    Object.assign(ele, {
                        isVideoGroupsEdited: true,
                        isEdited: false,
                    });
                });
            });
        }

        // 选择视频分组每一项
        selectVideoGroupsItem(videoGroupsItem: VideoGroup) {
            this.isVideoGroupsItemActived = videoGroupsItem.name;
            this.$refs.videoBoxRef.setVideos(videoGroupsItem.videoDtos);
        }

        // 编辑分组
        editGroup(groupItem) {
            groupItem.isEdited = true;
            Vue.set(groupItem, "isEdited", true);
        }

        // 保存分组
        saveGroup(groupItem) {
            groupItem.isEdited = false;
            groupItem.videos = this.$refs.videoBoxRef.videoServerId.join(",");
            addVideoGroup(groupItem).then((res) => {
                if (res.data.code != 200) return;
                this.getVideoGroups();
            });
        }

        // 添加分组
        addVideoGroupsItem() {
            // console.log("addVideoGroupsItem");
            // this.newGroupsNum = this.newGroupsNum + 1;
            // this.videoGroups.push({
            //     id: 0,
            //     name: `新增分组${this.newGroupsNum}`,
            //     stationId: this.stationId,
            //     // videos: "10202011,10203040,10203042",
            //     videos: "",
            //     createTime: new Date(),
            //     isVideoGroupsEdited: false,
            // });
            // Object.assign(this.videoGroups[this.videoGroups.length - 1], {
            //     id: 0,
            //     name: `新增分组${this.newGroupsNum}`,
            //     stationId: this.stationId,
            //     // videos: "10202011,10203043,10203042",
            //     videos: "",
            //     createTime: new Date(),
            //     isVideoGroupsEdited: false,
            // });
        }

        // 编辑分组名称、失焦确认分组名称
        addGroupName(group) {
            group.isVideoGroupsEdited = true;
            addVideoGroup(group).then((res) => {
                let {
                    code,
                    data
                } = res.data;
                if (code != 200) return;
                this.getVideoGroups();
            });
        }

        // 删除分组
        deleteVideoGroupsItem(id) {
            deleteVideoGroup(id).then((res) => {
                if (res.data.code != 200) return this.$message.error("删除失败！");
                this.$message.success("删除成功！");
                this.getVideoGroups();
            });
        }

        //双击编辑
        editGroupItem() {
            console.log("editGroupItem");
        }

        // 向上、下、左、右
        ptzTurn(direction) {
            this.$refs.videoBoxRef.ptzTurnChildren(direction);
        }
        // 停止
        ptzStop() {
            this.$refs.videoBoxRef.ptzStopChildren();
        }

        // 设置
        setPreset(iPreset) {
            if (!iPreset) {
                return;
            }
            this.$refs.videoBoxRef.setPresetChildren(iPreset);
        }

        // 跳转
        goPreset(iPreset) {
            this.$refs.videoBoxRef.goPresetChildren(iPreset);
        }

        // 视频回放
        // 开始
        startPlayBack(date, time) {
            if (!date || !time) {
                this.$message.error("请选择日期和时间！");
                return;
            }
            this.$refs.videoBoxRef.startPlayChildren(date, time);
        }

        // 停止
        stopPlayBack() {
            this.$refs.videoBoxRef.stopPlayBackChildren();
        }

        // 暂停
        suspendPlayBack() {
            this.$refs.videoBoxRef.suspendPlayBack();
        }

        // 继续
        continuePlayBack() {
            this.$refs.videoBoxRef.continuePlayBack();
        }

        //慢放
        slowPlayBack() {
            this.$refs.videoBoxRef.slowPlayBack();
        }

        // 快放
        fastPlayBack() {
            this.$refs.videoBoxRef.fastPlayBack();
        }

        //   视频列表显示隐藏
        showVideoList() {
            this.isShowVideoList = !this.isShowVideoList;
        }

        //   视频分组显示隐藏
        showVideoGroup() {
            this.isShowVideoGroup = !this.isShowVideoGroup;
        }
    }
</script>

<style lang="less" scope>
    @import "~@/assets/commonCss.less";

    .industrialTV {
        display: flex;
        height: 100%;
        padding: 5rem 1.25rem 0;

        .col {
            flex: 2;
            height: 90%;

            &:nth-child(1) {
                background-color: transparent;
            }

            &:nth-child(2) {
                flex: 8;
            }

            &:nth-child(3) {
                background: url("../../assets/images/TV_bd.png") no-repeat;
                background-size: 100% 100%;
            }

            // 侧边视频列表和视频分组
            .video_list {
                height: 50%;
                font-size: 20px;
            }

            .video_group {
                margin-top: 25px;
                font-size: 20px;
                position: relative;
                height: 40%;


            }

            button {
                .componentTitleStyle();
                width: 100%;
                border: none;
                text-align: left;
                margin-bottom: 3%;
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
                overflow-y: auto;
                overflow-x: hidden;
                height: 87%;

                .dropdown_item {
                    list-style: none;
                    width: 100%;
                    line-height: 34px;
                    height: 34px;
                    text-align: left;
                    padding-left: 140px;
                    cursor: pointer;
                    position: relative;

                    &:nth-child(1) {
                        // padding-left: 100px;
                    }

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
                        background: url("../../assets/images/item_icon.png") no-repeat;
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

                &::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                    overflow-x: hidden;
                    overflow-y: auto;
                }

                &::-webkit-scrollbar-thumb {
                    border-radius: 5px;
                    box-shadow: inset 0 0 5px #fff;
                    background: rgba(0, 0, 0, 0.2)
                }

                &::-webkit-scrollbar-track {
                    border-radius: 4px;
                    box-shadow: inset 0 0 5px rgb(235, 227, 235);
                    background: rgba(0, 0, 0, 0.1)
                }
            }

            // 中间视频区
            .video {
                // height: 740px;
                height: 100%;
                background-color: rgba(17, 29, 63, 1);
                margin: 5px 10px 0;
            }

            .video_screen {
                // height: 115px;
                height: 10%;

                p.tit {
                    font-size: 22px;
                    color: #14dee2;
                    font-weight: bold;
                    padding: 5px 5px 0;
                }

                .screen_box {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    // margin-top: 10px;
                    padding: 0 40px;

                    .screen_item {
                        list-style: none;
                        width: 40px;
                        height: 40px;
                        background: url("../../assets/images/screen_one.png") no-repeat;
                        background-size: 100% 100%;
                        margin-right: 5px;
                        cursor: pointer;

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
        }

        .control-wrap {
            flex: 2;
            height: 83%;

            // 右侧控件区
            .control_box {

                p.tit {
                    .componentTitleStyle();
                    margin-bottom: 3%;
                    padding: 0 1rem 0;
                }

                .control {
                    position: relative;
                    width: 70%;
                    margin: 2% auto;

                    .circle_control {
                        width: 120px;
                        height: 120px;
                        border-radius: 50%;
                        overflow: hidden;
                        position: relative;
                        // margin-left: 16%;

                        .circle_item {
                            list-style: none;
                            overflow: hidden;
                            width: 52%;
                            height: 52%;
                            position: absolute;
                            right: 0;
                            top: 0;
                            transform-origin: 0% 100%;
                            border-left: 2px solid rgba(0, 0, 0, 0.3);
                            border-bottom: 2px solid rgba(0, 0, 0, 0.3);
                            background-color: #18809a;
                            cursor: pointer;
                        }

                        .item_center {
                            list-style: none;
                            width: 50px;
                            height: 50px;
                            border: 5px solid rgba(0, 0, 0, 0.3);
                            border-radius: 50%;
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            background-color: #18809a;
                            cursor: pointer;

                            .center_icon {
                                display: block;
                                width: 20px;
                                height: 20px;
                                background: url("../../assets/images/control_center.png") no-repeat;
                                background-size: 100% 100%;
                                position: absolute;
                                left: 50%;
                                top: 50%;
                                transform: translate(-50%, -50%);
                            }
                        }

                        .item_top {
                            transform: rotate(-45deg);

                            .top_icon {
                                display: block;
                                width: 20px;
                                height: 20px;
                                background: url("../../assets/images/control_top.png") no-repeat;
                                background-size: 100% 100%;
                                position: absolute;
                                left: 50%;
                                top: 50%;
                                transform: translate(-50%, -50%) rotate(45deg);
                            }
                        }

                        .item_right {
                            transform: rotate(45deg);

                            .right_icon {
                                display: block;
                                width: 20px;
                                height: 20px;
                                background: url("../../assets/images/control_right.png") no-repeat;
                                background-size: 100% 100%;
                                position: absolute;
                                left: 50%;
                                top: 50%;
                                transform: translate(-50%, -50%) rotate(-45deg);
                            }
                        }

                        .item_bottom {
                            transform: rotate(135deg);

                            .bottom_icon {
                                display: block;
                                width: 20px;
                                height: 20px;
                                background: url("../../assets/images/control_bottom.png") no-repeat;
                                background-size: 100% 100%;
                                position: absolute;
                                left: 40%;
                                top: 53%;
                                transform: translate(-50%, -50%) rotate(-135deg);
                            }
                        }

                        .item_left {
                            transform: rotate(-135deg);

                            .left_icon {
                                display: block;
                                width: 20px;
                                height: 20px;
                                background: url("../../assets/images/control_left.png") no-repeat;
                                background-size: 100% 100%;
                                position: absolute;
                                left: 40%;
                                top: 53%;
                                transform: translate(-50%, -50%) rotate(135deg);
                            }
                        }
                    }

                    .add_btn,
                    .reduce_btn {
                        display: block;
                        width: 38px;
                        height: 38px;
                        background: url("../../assets/images/add_btn.png") no-repeat;
                        background-size: 100% 100%;
                        position: absolute;
                        top: 15px;
                        right: 25px;
                        cursor: pointer;
                    }

                    .reduce_btn {
                        background: url("../../assets/images/reduce_btn.png") no-repeat;
                        background-size: 100% 100%;
                        top: 80px;
                        right: 25px;
                    }
                }

                .selected_box {
                    overflow: hidden;
                    margin-top: 10px;
                    width: 70%;
                    margin-left: 15%;
                    display: flex;
                    align-items: baseline;
                    padding: 0 5px;

                    .tit {
                        font-size: 16px;
                        color: #e0e4e7;
                        flex: 4;
                    }

                    .preset_positions {
                        flex: 10;

                        .el-select {
                            height: 24px;

                            .el-input {
                                height: 24px;

                                .el-input__inner {
                                    height: 24px;
                                    line-height: 24px;
                                    background-color: #299ab6;
                                    border: transparent;
                                    color: #ffffff;
                                }

                                .el-input__suffix {
                                    background-color: #fff;
                                    border-radius: 0 5px 5px 0;
                                    right: 0;

                                    .el-input__icon {
                                        line-height: 10px;
                                    }
                                }

                                input:-ms-input-placeholder,
                                textarea:-ms-input-placeholder {
                                    /* Internet Explorer 10+ */
                                    color: #fff;
                                }
                            }
                        }
                    }
                }

                .btn_box {
                    display: flex;
                    // justify-content: space-around;
                    padding: 10px 5px 0;
                    // smargin-left: 15%;
                    flex-direction: column;

                    div.btn {
                        width: 190px;
                        line-height: 25px;
                        background-color: #299ab6;
                        border-radius: 5px;
                        margin: 5px auto 0;
                        text-align: center;
                        font-size: 18px;
                        color: #fff;
                        cursor: pointer;
                        margin-bottom: 10px;

                        .setting_icon {
                            display: block;
                            width: 23px;
                            height: 22px;
                            background: url("../../assets/images/setting_icon.png") no-repeat;
                            background-size: 100% 100%;
                            position: absolute;
                            top: 50%;
                            transform: translateY(-50%);
                            right: 10px;
                        }

                        .jump_icon {
                            display: block;
                            width: 23px;
                            height: 19px;
                            background: url("../../assets/images/jump_icon.png") no-repeat;
                            background-size: 100% 100%;
                            position: absolute;
                            top: 50%;
                            transform: translateY(-50%);
                            right: 10px;
                        }
                    }
                }
            }

            // 视频回放
            .video_playback {
                height: 48%;

                p.tit {
                    .componentTitleStyle();
                    margin-bottom: 3%;
                }

                .time-choose-wrap {
                    margin-top: -10px;

                    .el-date-editor {
                        width: 190px;
                        height: 25px;
                        color: #fff;

                        .el-input__prefix {
                            .el-input__icon {
                                line-height: 2px;
                                color: #fff;
                            }

                            .el-icon-circle-close {
                                line-height: 10px;
                            }
                        }

                        input:-ms-input-placeholder,
                        textarea:-ms-input-placeholder {
                            /* Internet Explorer 10+ */
                            color: #fff;
                        }

                        .el-input__inner {
                            height: 25px;
                            line-height: 25px;
                            background-color: transparent;
                            color: #fff;
                            border: 1px solid #299ab6;
                        }
                    }

                    text-align: center;
                }

                // .ivu-col-span-18 {
                //     margin-left: 16%;

                // }

                .video_playback_item_wrap {
                    display: flex;
                    flex-direction: column;
                    height: 90%;

                    .video_playback_item_content-wrap {
                        flex: 1;

                        .video_playback_item {
                            flex: 1;
                            width: 190px;
                            line-height: 25px;
                            background-color: #299ab6;
                            border-radius: 5px;
                            margin: 5px auto 0;
                            text-align: center;
                            font-size: 18px;
                            color: #fff;
                            cursor: pointer;
                        }
                    }
                }

            }

            .video_screen {
                // height: 115px;
                height: 10%;
                margin-top: 7%;

                p.tit {
                    .componentTitleStyle();
                    margin-bottom: 3%;
                }

                .screen_box {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    // margin-top: 10px;
                    padding: 0 40px;

                    .screen_item {
                        list-style: none;
                        width: 40px;
                        height: 40px;
                        background: url("../../assets/images/screen_one.png") no-repeat;
                        background-size: 100% 100%;
                        margin-right: 5px;
                        cursor: pointer;

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
        }
    }
</style>