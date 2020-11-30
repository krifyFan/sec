<template>
    <div class="visualized">
        <header class="visualized_header">
            <div class="tit_time">
                <span class="date">{{ date }}</span>
                <span class="week">{{ week }}</span>
                <span class="time">{{ time }}</span>
            </div>
            <div class="tit"> {{ProjectConfig.ProjectName}}</div>
            <div class="tit_icon">
                <Icon type="ios-desktop" class="video_icon" @click="queryAllTV()" />
                <i class="el-icon-video-camera-solid tv_icon" @click="toVideo()"></i>
            </div>
            <div class="message">
                <Icon type="md-notifications" @click.native="showAlarmQuery" class="message_icon" color="#00cbef" />
                <span class="badge_icon"> </span>
            </div>
            <div class="user_icon">
                <el-dropdown @command="handleCommand">
                    <span class="el-dropdown-link">
                        <Icon type="ios-contact" />
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="username">{{
                            userName
                        }}</el-dropdown-item>
                        <el-dropdown-item command="setting">设置</el-dropdown-item>
                        <el-dropdown-item command="logout">退出</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </header>
        <div class="visualized_content">
            <div v-for="(moduleItem, index) in moduleConfig" :key="`${index}`"
                :style="moduleStyle(moduleItem && moduleItem.position)"
                :class="[moduleItem.value !== 'Map' ? 'drag_panel' : 'map']">
                <component :is="moduleItem.value" :chartId="moduleItem.id" :videos="moduleItem.videos"
                    :carouselRef="moduleItem.carouselRef" :carouselId="moduleItem.carouselId"
                    :groupName="moduleItem.groupName"></component>
            </div>
            <!-- <SysteminfoStatistics></SysteminfoStatistics> -->
        </div>

        <Modal v-model="modelShow" title="数据查询" class="alarmDialog" width="80%" @on-cancel="closeModal" footer-hide>
            <AlarmQuery :queryPrams="alarmVo" ref="alarmQuery"></AlarmQuery>
        </Modal>
        <AlarmModal></AlarmModal>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
        Watch
    } from "vue-property-decorator";
    import {
        InterfaceConfig,
        ModuleConfigInterface,
        InterfaceTypeEnum
    } from "@/types/interfaceconfig.interface";
    import {
        Video,
        VideoVo
    } from "@/types/video.interface";
    // import {
    //     VideoGroup
    // } from '@/types/videogroup.interface'
    import {
        getVisualizationDefaultConfig,
        getConfigs,
    } from "@/api/interfaceconfig";
    import {
        getVideoDto
    } from "@/api/video";
    import {
        getVideoGroupDtos
    } from "@/api/videogroup";
    import EquipmentCondition from "@/views/Main/visualized/EquipmentCondition.vue";
    import AlarmStatistics from "@/views/Main/visualized/AlarmStatistics.vue";
    import EquipmentStatistics from "@/views/Main/visualized/EquipmentStatistics.vue";
    import EventStatistics from "@/views/Main/visualized/EventStatistics.vue";
    import GrowthTrend from "@/views/Main/visualized/GrowthTrend.vue";
    import RealTimeAlarm from "@/views/Main/visualized/RealTimeAlarm.vue";
    import StationStatistics from '@/views/Main/visualized/StationStatistics.vue'
    import Map from "@/views/Main/visualized/Map.vue";
    import AlarmModal from "@/components/view/AlarmModal.vue";
    import IntercomStatistics from "@/views/Main/visualized/IntercomStatistics.vue";
    import SysteminfoStatistics from "@/views/Main/visualized/SysteminfoStatistics.vue";
    import VideoGroup from "@/components/Video/videoCarousel.vue";
    import AlarmQuery from "@/components/view/AlarmQuery.vue";
    import {
        AlarmVo
    } from "@/types/alarm.interface";
    import {
        getDate,
        getTime,
        getWeek
    } from "@/api/date";
    
    @Component({
        components: {
            EquipmentCondition,
            AlarmStatistics,
            EquipmentStatistics,
            EventStatistics,
            GrowthTrend,
            RealTimeAlarm,
            StationStatistics,
            Map,
            AlarmModal,
            IntercomStatistics,
            SysteminfoStatistics,
            VideoGroup,
            AlarmQuery
        },
    })
    export default class Visualized extends Vue {
        date: String = "";
        week: String = "";
        time: String = "";

        /** 当前用户名称 */
        userName: String = "";

        /** 告警的模态框 */
        modelShow: boolean = false;
        /** 默认点击查看的告警属性 */
        alarmVo: AlarmVo = {
            pageNum: 1,
            pageSize: 10,
        };

        // 获取/修改的配置
        moduleConfig: ModuleConfigInterface[] = [];

        get moduleStyle() {
            return function ({
                width,
                height,
                x,
                y
            }) {
                return {
                    width: `${width}%`,
                    height: `${height}%`,
                    left: `${x}%`,
                    top: `${y}%`,
                };
            };
        }

        created() {
            this.date = getDate(".");
            this.week = getWeek();
            this.getTime();
            this.getModuleConifg();
            this.getCurUserName();
        }

        /**
         * 获取配置，有就显示，没有就加载默认的
         */
        getModuleConifg() {
            Promise.all([getConfigs(), getVideoGroupDtos()])
                .then((res: any) => {
                    let groups: any[] =
                        res[1].data.code == 200 ? res[1].data.data : [];

                    if (res[0].data.code == 200) {
                        let configs: InterfaceConfig[] = res[0].data.data;
                        let index: number = configs.findIndex(
                            (config: InterfaceConfig) =>
                            config.type == InterfaceTypeEnum.可视化 && config.stationId == 0
                        );
                        // 如果已经配置过，则获取配置的，没有的话，则新建一个
                        let interfaceConfig: InterfaceConfig;
                        if (index < 0) {
                            interfaceConfig = {
                                name: "可视化页面配置",
                                type: InterfaceTypeEnum.可视化,
                                stationId: 0,
                                param: JSON.stringify(
                                    getVisualizationDefaultConfig()
                                ),
                            };
                        } else {
                            interfaceConfig = configs[index];
                        }
                        this.moduleConfig = JSON.parse(interfaceConfig.param);

                        /**
                         * 视频分组组件参数处理
                         */
                        let videosId: number[] = []; //视频id数组
                        for (let i = 0; i < this.moduleConfig.length; i++) {
                            let ele: ModuleConfigInterface = this.moduleConfig[i];

                            // 不是视频组，过
                            if (ele.groupId == -1) continue;
                            // 找到当前视频组的信息，进行处理
                            let groupIndex: number = groups.findIndex(
                                (g: any) => g.id == ele.groupId
                            );
                            if (groupIndex < 0) continue;

                            Object.assign(ele, {
                                videos: groups[groupIndex].videoDtos,
                                groupName: groups[groupIndex].name,
                                carouselRef: ele.value + "Ref" + i,
                                carouselId: ele.value + "Id" + i,
                            });
                        }

                        console.log("this.moduleConfig", this.moduleConfig);
                    } else {
                        this.moduleConfig = getVisualizationDefaultConfig();
                    }
                })
                .catch((err) => {
                    this.moduleConfig = getVisualizationDefaultConfig();
                });
        }

        getTime() {
            this.time = getTime();
            setTimeout(() => {
                this.getTime();
            }, 1000);
        }

        showAlarmQuery() {
            this.modelShow = true;
            let ref: any = this.$refs.alarmQuery;
            ref.queryAlarmData();
        }

        closeModal() {
            let t: any = this.$refs.alarmQuery;
            t.clearQueryVo();
        }
        handleCommand(command) {
            if (command == "logout") {
                this.logout();
            } else if (command == "setting") {
                this.setting();
            }
        }
        getCurUserName() {
            this.userName = this.$store.state.userName;
        }

        logout() {
            this.$store.commit("removeParamter");
            this.$router.push({
                path: "/login",
            });
        }

        queryAllTV() {
            this.$router.push({
                path: "/allIndustrialTV"
            })
        }

        toVideo() {
            this.$router.push({
                path: '/swiperVideo'
            })
        }

        // 设置
        setting() {
            const n: any = this.$router.resolve({
                name: 'config'
            })
            window.open(n.href, '_blank')
            // this.$router.push({
            //     name: "config",
            // });
        }
    }
</script>

<style lang="less">
    @font-face {
        font-family: "UnidreamLED";
        src: url("../../../assets/font/UnidreamLED.ttf") format("truetype");
    }

    .position(@position: relative, @width: 100%, @height: 100%) {
        position: @position;
        width: @width;
        height: @height;
    }

    .boxPosition(@position, @width, @height, @top: 0, @left: 60px) {
        .position(@position, @width, @height);
        top: @top;
        left: @left;
        line-height: @height;
    }

    .bg(@bgName, @LRsize: 100%, @TBsize: 100%) {
        background: url("../../../assets/images/@{bgName}") no-repeat top center;
        background-size: 100% 100%;
    }

    .ab {
        content: "";
        display: block;
        width: 10px;
        height: 10px;
        position: absolute;
        top: 0;
        right: 0;
        border-top: 1px solid rgba(0, 203, 239, 1);
        border-right: 1px solid #00cbef;
    }

    .visualized {
        .position();
        .bg("visualized_bg.png");
    }

    .visualized_header {
        .position(relative, 100%, 8.3%);

        .tit {
            line-height: 82px;
            text-align: center;
            .bg("visualized_hd.png");
            color: rgba(255, 255, 255, 1);
            text-shadow: 0px 3px 4px rgba(12, 85, 223, 1);
        }

        .tit_time {
            .boxPosition(absolute, 30%, 48px);
            color: #ffffff;
            font-size: 18px;

            // margin-left: 60px;
            .date {
                margin-right: 15px;
            }

            .week {
                margin-right: 15px;
            }

            .time {
                font-family: "UnidreamLED";
                font-size: 24px;
            }
        }

        .tit_icon {
            position: absolute;
            top: 2%;
            right: 7.5%;

            .video_icon,
            .tv_icon,
            .logout_icon {
                font-size: 34px;
            }

            .tv_icon,
            .video_icon {
                display: inline-block;
                color: #36E5FF;
                margin-right: 20px;
                font-size: 34px;
                vertical-align: middle;
                cursor: pointer;
            }
        }

        .message {
            width: 36px !important;
            height: 30px !important;
            position: absolute;
            top: 2%;
            right: 6%;
            cursor: pointer;



            .badge_icon {
                display: block;
                width: 13px;
                height: 13px;
                border-radius: 50%;
                background-color: red;
                position: absolute;
                top: 4px;
                right: 0;
            }

            .logout_icon {
                .bg("logout_icon.png");
                // .ivu-icon-md-notifications:before {
                //     color: #36e5ff;
                // }
            }

        }

        .user_icon {
            position: absolute;
            top: -5%;
            right: 3.5%;

            .ivu-icon-ios-contact {
                cursor: pointer;
            }

            .ivu-icon-ios-contact:before {
                color: #36e5ff;
                font-size: 36px;
            }
        }
    }

    .visualized_content {
        .position(relative, 100%, 91.3%);

        .drag_panel {
            position: absolute;
            // background: rgba(255, 255, 255, 0.1);
            // margin: 0 auto 15px;
            // border: 2px solid rgba(0, 74, 165, 1);
            z-index: 1;

            .alarm_statistics_chart {
                // height: 230px;
                height: 80%;
            }

            // &::before {
            //     .ab();
            // }

            // &::after {
            //     .ab();
            // }

            .alarm_statistics {
                height: 100%;
            }
        }

        .video_group {
            border: none;

            // background-color: transparent;
            &::before {
                opacity: 0;
            }
        }

        .chart {
            display: flex;
            height: 35%;

            .drag_panel_center {
                // height: 285px;
                height: 80%;
                flex: 1;
                position: relative;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(0, 74, 165, 1);

                &:nth-child(1) {
                    margin-right: 10px;
                }

                h4 {
                    line-height: 60px;
                    font-size: 22px;
                    color: #f9ffff;
                    font-weight: 500;
                    padding-left: 61px;

                    .icon {
                        .boxPosition(absolute, 22px, 24px, 17px, 18px);
                        .bg("video_icon.png");
                        display: block;
                    }
                }

                &::before {
                    .ab();
                }

                &::after {
                    .ab();
                }
            }
        }
    }

    .el-dropdown-menu {
        background: #2a2761;
        border: 1px solid #2a2761;

        .el-dropdown-menu__item {
            color: #fff;
        }

        .el-dropdown-menu__item:hover {
            color: #2a2761;
        }
    }
     
</style>