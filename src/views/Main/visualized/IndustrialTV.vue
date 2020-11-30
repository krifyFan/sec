<template>
    <div class="industrial-tv-wrap">
        <div class="operation-wrap">
            <div class="tab-wrap">
                <div v-for="(item, index) in listTab" :key="item" class="tab-item"
                    :class="{'active-tab': currentIndex === index}" @click="changeTab(index)">
                    {{item}}
                </div>
            </div>
            <div class="content">
                <div class="menu-tree-wrap" v-show="currentIndex === 0">
                    <div class="menu-tree-content-wrap">
                        <MenuTree :data="managementTree" scope="[true]" @on-choosed="getVideo" />
                    </div>
                </div>
                <div class="search-wrap" v-show="currentIndex === 1">
                    <div class="search_box">
                        <Input class="search" prefix="ios-search" placeholder="搜索" style="width: auto;"
                            v-model="searchContent" @on-blur="search()" />
                    </div>
                    <div class="menu-tree-content-wrap" v-if="videoSiftTree.length > 0">
                        <MenuTree :data="videoSiftTree" @on-choosed="getVideo" />
                    </div>
                    <div v-else class="menu-tree-content-wrap-else">
                        <span>暂无数据</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="tv-wrap">
            <div class="video">
                <VideoBox ref="videoBoxRef"></VideoBox>
            </div>
        </div>
        <div class="control-wrap">
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
    import {
        Component,
        Vue
    } from "vue-property-decorator";
    import {
        getStationsByManagement
    } from "@/api/station";
    import {
        getVideoDtosByStation
    } from "@/api/video";
    import {
        getManagementTree
    } from "@/api/management";
    import MenuTree from "@/components/menuTree.vue";
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

    @Component({
        components: {
            MenuTree,
            VideoBox
        },
    })
    export default class IndustrialTV extends Vue {
        activeName: string = 'video'
        managementTree: any[] = [];
        managementTreeCopy: any[] = []
        videoTree: any[] = []
        videoSiftTree: any[] = []
        listTab: any[] = [
            '视频列表',
            '查询视频'
        ]
        currentIndex: number = 0

        selectedValue: any = "";

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
        $refs: {
            videoBoxRef: HTMLFormElement;
        };
        searchContent: string | null = null

        // 回车事件--search
        created() {
            let _this = this
            document.onkeydown = function (e) {
                let key = e.keyCode
                if (key === 13) {
                    _this.search()
                }
            }
        }

        mounted() {
            this.getManagementTree();
        }
        // menu tree
        getManagementTree() {
            getManagementTree().then((res) => {
                let {
                    code,
                    data
                } = res.data;
                if (code === 200) {
                    let arr: any[] = [];
                    arr.push(data);
                    let s = this.recurs(arr);
                    this.managementTree = s;
                    this.managementTreeCopy = s
                    // localStorage.setItem('aa', JSON.stringify(this.managementTre))
                    // console.log(localStorage.getItem('aa'));

                }
            });
        }
        // 获取一级
        getStationsByManagement(item) {
            let p = new Promise((resolve, reject) => {
                getStationsByManagement(item.id).then((res) => {
                    let {
                        code,
                        data
                    } = res.data;
                    if (code === 200) {
                        item.children = data;
                        resolve(data);
                    }
                });
            });
            return p;
        }
        // 获取最后一级下的视频
        getVideoDtosByStation(id) {
            let p = new Promise((resolve, reject) => {
                getVideoDtosByStation(id).then((res) => {
                    let {
                        code,
                        data
                    } = res.data;
                    if (code === 200) {
                        resolve(data);
                    }
                });
            });
            return p;
        }
        // 递归读取menu tree
        recurs(arr: any[]) {
            let newArr: any[] = [];
            Promise.all(
                arr.map(async (item) => {
                    if (item.leaf === false) {
                        let newChildren = []
                        item.children.forEach(item => {
                            let temp = {
                                isShow: true
                            }
                            newChildren.push(Object.assign(item, temp))
                        })
                        item.children = this.recurs(newChildren);
                    } else {
                        let stations = (await this.getStationsByManagement(
                            item
                        )) as any[];
                        for (let i = 0; i < stations.length; i++) {
                            let isShow = {
                                isShow: true
                            }
                            const element = Object.assign(stations[i], isShow);
                            let videos = await this.getVideoDtosByStation(
                                element.id
                            );
                            element.children = videos
                            this.videoTree.push(videos)
                        }
                    }
                    newArr.push(item);
                })
            );
            return newArr;
        }

        //切换tab
        changeTab(index) {
            this.currentIndex = index
        }

        // 视频搜索
        search() {
            this.videoTree.map(item => {
                if (item.length !== 0) {
                    this.videoSiftTree = []
                    item.map(ele => {
                        if (ele.name.indexOf(this.searchContent) !== -1) {
                            this.videoSiftTree.push(ele)
                        }
                    })
                }
            })
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

        //x宫格
        ArrangeWindow(x) {
            this.$refs.videoBoxRef.ArrangeWindowChildren(x);
        }
        // 接收子组件的传值
        getVideo(videoObj) {
            this.$refs.videoBoxRef.setCurrentVideo(videoObj);
        }
    }
</script>
<style lang="less" scope>
    .industrial-tv-wrap {
        background-color: #0d1736;
        height: 100%;
        width: 100%;
        color: #fff;
        display: flex;

        .operation-wrap {
            flex: 1;
            flex-direction: column;

            .tab-wrap {
                border-bottom: 1px solid #ccc;

                .tab-item {
                    display: inline-block;
                    font-size: 16px;
                    border: 1px solid #ccc;
                    border-bottom: none;
                    padding: 5px 14px;
                    cursor: pointer;
                    border-radius: 4px;
                }

                .active-tab {
                    background: #18809a;
                    color: #ffffff;
                    border: 1px solid #18809a;
                    border-bottom: none;
                }
            }

            .content {
                .search-wrap {
                    height: 100%;

                    // 侧边搜索
                    .search_box {
                        position: relative;

                        .search_icon {
                            left: 20px;
                        }

                        .search {
                            height: 48px;

                            input {
                                width: 100%;
                            }

                            i {
                                display: none;
                            }

                            .ivu-input {
                                background-color: #fff;
                                border: none;
                                font-size: 16px;
                                color: black;
                                padding-left: 0px;
                            }
                        }
                    }
                }

                .menu-tree-wrap {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                    height: 100%;

                    .operation-wrap {
                        text-align: right;

                        .video_icon {
                            top: 3px;
                            left: 40px;
                        }

                        .down_arrow {
                            display: block;
                            width: 16px;
                            height: 10px;
                            background: url("../../../assets/images/down_arrow.png") no-repeat;
                            background-size: 100% 100%;
                            position: absolute;
                            top: 10px;
                            left: 10px;
                        }

                        .video-list-txt {
                            font-size: 18px;
                            margin-right: 10px;
                            vertical-align: super;
                        }
                    }
                }

                .menu-tree-content-wrap-else {
                    font-size: 20px;
                    text-align: center;
                    margin-top: 30px;
                }
            }

            .search_icon {
                display: block;
                width: 30px;
                height: 30px;
                background: url("../../../assets/images/search_icon.png") no-repeat;
                background-size: 100% 100%;
                position: absolute;
                top: 9px;

            }

            .video_icon {
                display: block;
                width: 36px;
                height: 30px;
                background: url("../../../assets/images/video_list_icon.png") no-repeat;
                background-size: 100% 100%;
                position: absolute;
                top: 9px;
            }

            .menu-tree-content-wrap {
                height: 94%;
                overflow-y: auto;
                padding-bottom: 10px;

                &::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                    overflow-x: hidden;
                    overflow-y: auto;
                }

                &::-webkit-scrollbar-thumb {
                    background: black;
                    border-radius: 5px;
                    box-shadow: inset 0 0 5px #eee;
                }

                &::-webkit-scrollbar-track {
                    background: black;
                    border-radius: 5px;
                    box-shadow: inset 0 0 5px #fff;
                }

                /*三角箭头的颜色*/
                scrollbar-arrow-color: #c0c4cc;
                /*滚动条滑块按钮的颜色*/
                scrollbar-face-color: #A2A2A3;
                /*滚动条整体颜色*/
                scrollbar-highlight-color: #A2A2A3;
                /*滚动条阴影*/
                scrollbar-shadow-color: #A2A2A3;
                /*滚动条轨道颜色*/
                scrollbar-track-color: #f4f4f5;
                /*滚动条3d亮色阴影边框的外观颜色——左边和上边的阴影色*/
                scrollbar-3dlight-color: #A2A2A3;
                /*滚动条3d暗色阴影边框的外观颜色——右边和下边的阴影色*/
                scrollbar-darkshadow-color: #A2A2A3;
                /*滚动条基准颜色*/
                scrollbar-base-color: blue;
            }
        }

        .tv-wrap {
            flex: 6;

            .video {
                width: 100%;
                height: 100%;
                padding-top: 10px;
            }
        }

        .control-wrap {
            flex: 1.5;

            // 右侧控件区
            .control_box {
                height: 40%;
                
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
                }

                .reduce_btn {
                    background: url("../../../assets/images/reduce_btn.png") no-repeat;
                    background-size: 100% 100%;
                }

            }

            // 视频回放
            .video_playback {
                height: 48%; 
            }

            .video_screen {
                .screen_box {
                    .screen_item {
                        
                        background: url("../../../assets/images/screen_one.png") no-repeat;
                        background-size: 100% 100%;

                        &:nth-child(2) {
                            background: url("../../../assets/images/screen_four.png") no-repeat;
                            background-size: 100% 100%;
                        }

                        &:nth-child(3) {
                            background: url("../../../assets/images/screen_nine.png") no-repeat;
                            background-size: 100% 100%;
                        }
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
</style>