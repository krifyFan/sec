<template>
    <div class="stations_box">
        <el-dropdown class="user_icon" @command="handleCommand">
            <span class="el-dropdown-link">
                <Icon type="ios-contact" />
            </span>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="username">{{userName}}</el-dropdown-item>
                <el-dropdown-item command="setting">设置</el-dropdown-item>
                <el-dropdown-item command="query">查询</el-dropdown-item>
                <el-dropdown-item command="about">关于</el-dropdown-item>
                <el-dropdown-item command="goback">后退</el-dropdown-item>
                <el-dropdown-item command="logout">退出</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
        <!-- <div class="backV">
            <Icon type="md-arrow-round-back" @click.native="backVisualized" />
        </div> -->
        <div class="stations_content">
            <div class="navBar">
                <div class="leftMenu">
                    <Menu mode="horizontal" :active-name="activeName" :style="leftMenuStyle" @on-select="menuChange">
                        <el-row>
                            <el-col :span="8" class="leftCol">
                                <MenuItem name="Overview" to="overview" class="menuItem">
                                场 站 总 览
                                </MenuItem>
                                <MenuItem name="industrialTV" to="industrial-tv" class="menuItem">
                                工 业 电 视
                                </MenuItem>
                                <MenuItem name="VideoInspection" to="video-inspection" class="menuItem">
                                视 频 巡 检
                                </MenuItem>
                            </el-col>

                            <el-col :span="8" :offset="8">
                                <MenuItem name="VideoIntercom" to="video-intercom" class="menuItem">
                                可 视 对 讲
                                </MenuItem>
                                <MenuItem name="PerimeterAlarm" to="perimeter-alarm" class="menuItem">
                                周 界 报 警
                                </MenuItem>
                                <MenuItem name="FireAlarm" to="fire-alarm" class="menuItem">
                                火 灾 报 警
                                </MenuItem>
                            </el-col>
                        </el-row>


                    </Menu>
                    <div class="line" :style="lineStyle">
                    </div>
                </div>
                <h3 class="stations_hd">
                    <img :src="companyLogImg">
                    <span>{{ station.name }}</span>
                </h3>
                <div class="rightMenu">
                </div>
            </div>

            <router-view></router-view>
        </div>
        <Modal v-model="modelShow" :title="title" class="alarmDialog query-alarm-dialog" width="80%" @on-cancel="closeModal" footer-hide>
            <AlarmQuery :queryPrams="alarmVo" ref="alarmQuery" @change-menu="getTitle"></AlarmQuery>
        </Modal>
        <!-- <Modal v-model="modelShow" title="视频巡检详情" class="alarmDialog" width="60%" @on-cancel="closeModal" footer-hide>
            <VideoPatrolDetailModal :queryPrams="alarmVo"></VideoPatrolDetailModal>
        </Modal> -->
        <AlarmModal></AlarmModal>
        <Modal v-model="isShow" class="version-info-dialog" width="20%" footer-hide>
            <VersionInfo v-if="isShow" />
        </Modal>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue
    } from "vue-property-decorator";
    import AlarmQuery from "@/components/view/AlarmQuery.vue";
    import AlarmModal from "@/components/view/AlarmModal.vue";
    import VideoPatrolDetailModal from "@/components/view/VideoPatrolDetailModal.vue";
    import {
        Station
    } from "@/types/station.interface";
    import {
        AlarmVo,
        Alarm
    } from "@/types/alarm.interface";
    import {
        getStation,
        getDefaultStation
    } from "@/api/station";
    import {
        getCountByCondition,
        getDefaultAlarm
    } from "@/api/alarm";
    import {
        Video
    } from "@/types/video.interface";
    import VersionInfo from './VersionInfo.vue'

    @Component({
        components: {
            AlarmQuery,
            AlarmModal,
            VideoPatrolDetailModal,
            VersionInfo
        },
    })
    export default class MainStations extends Vue {
        date: String = "";
        week: String = "";
        // time: String = "";
        activeName: any = "overview";
        stationId: any = 1;
        station: Station = getDefaultStation();
        /** 告警数目 */
        alarmNum: number = 0;

        /** 当前用户名称 */
        userName: String = "";

        /** 告警的模态框 */
        modelShow: boolean = false;
        /** 默认点击查看的告警属性 */
        alarmVo: AlarmVo = {
            pageNum: 1,
            pageSize: 10,
            cleaned: null,
            objId: null,
            equipmentType: null,
            level: null
        };

        leftMenuState: boolean = true
        rightMenuState: boolean = true

        title: string = '告警查询'

        companyLogImg: string = require("@/assets/images/company-log.png")

        /** 关于modal框 */
        isShow: boolean = false


        get leftMenuStyle() {
            return {
                top: this.leftMenuState ? '20%' : '-80%'
            }
        }

        get rightMenuStyle() {
            return {
                top: this.rightMenuState ? '20%' : '-80%'
            }
        }

        get lineStyle() {
            let left: string = '-7%';

            switch (this.activeName) {
                case "Overview":
                    break;
                case "industrialTV":
                    left = '4%'
                    break;
                case "VideoInspection":
                    left = '15%'
                    break;
                case "VideoIntercom":
                    left = '60%'
                    break;
                case "PerimeterAlarm":
                    left = '71%'
                    break;
                case "FireAlarm":
                    left = '82%'
                    break;
            }

            return {
                left: left
            }
        }

        mounted() {
            this.activeName = this.$route.name;
            this.stationId = this.$store.state.stationId;
            this.init();
            this.getCurUserName()
        }

        getTitle(name: any) {
            this.title = name
        }

        init() {
            getStation(this.stationId).then((res: any) => {
                let {
                    code,
                    data
                } = res.data;
                if (code == 200) {
                    this.station = data;
                }
            });


            // 查找为清除的告警数目
            let vo: AlarmVo = {
                cleaned: false,
            };
            getCountByCondition(vo)
                .then((res: any) => {
                    let {
                        code,
                        data
                    } = res.data;

                    if (code == 200) this.alarmNum = data;
                })
                .finally(() => {
                    this.alarmNum = 10;
                });
        }

        handleCommand(command) {
            if (command == "logout") {
                this.logout();
            } else if (command == "setting") {
                this.setting();
            } else if (command == 'query') {
                this.showAlarm()
            } else if (command == 'about') {
                this.about()
            } else if (command == 'goback') {
                this.$router.back()
                setTimeout(()=>{
                    this.activeName = this.$route.name;
                },300)
            }
        }

        showAlarm() {
            this.modelShow = true;
            let ref: any = this.$refs.alarmQuery;
            ref.queryAlarmData();
        }

        closeModal() {
            let t: any = this.$refs.alarmQuery;
            t.clearQueryVo();
        }

        backVisualized() {
            this.$router.push({
                path: "/",
            });
        }

        getCurUserName() {
            this.userName = this.$store.state.userName
        }

        // 退出
        logout() {
            this.$store.commit("removeParamter");
            this.$router.push({
                path: "/login",
            });
        }
        // 设置
        setting() {
            const n: any = this.$router.resolve({
                name: 'config'
            })
            window.open(n.href, '_blank')
        }

        showMenu(type: string) {
            type === 'leftMenu' ? (this.leftMenuState = true) : (this.rightMenuState = true)
        }

        hideMenu(type: string) {
            type === 'leftMenu' ? (this.leftMenuState = false) : (this.rightMenuState = false)
        }

        menuChange(name: string) {
            this.activeName = name
        }

        // 关于
        about() {
            this.isShow = true
        }
    }
</script>
<style lang="less">
    .alarmDialog {
        .ivu-table-wrapper {
            position: static;
        }

        .ivu-modal-mask,
        .ivu-modal-wrap {
            z-index: 1001 !important;
        }
    }

    .stations_box {
        width: 100%;
        height: 100%;
        background: url("../../assets/images/station_bg.png") center no-repeat;
        background-size: 100% 100%;

        .tit_time {
            width: 30%;
            line-height: 86px;
            position: absolute;
            top: 0;
            left: 60px;
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

        .stations_hd {
            line-height: 2.8rem;
            text-align: center;
            color: #fff;
            font-size: 1.375rem;
            font-weight: 600;
            background: url("../../assets/images/title-bg.png") center no-repeat;
            background-size: 100% 100%;
            position: relative;
            z-index: 300;
            width: 30%;
            left: 50%;
            transform: translateX(-50%);
            // display: grid;
            // justify-items: center;
            // align-items: center;

            img {
                // position: absolute;
                // left: 7%;
                // width: 24%;
                // top: 10%;
                vertical-align: middle;
                width: 26%;
                margin-bottom: 1%;
                margin-right: 2%;
            }
        }

        .user_icon {
            position: absolute;
            top: 1%;
            right: 1%;
            z-index: 999;

            .ivu-icon-ios-contact {
                cursor: pointer;
            }

            .ivu-icon-ios-contact:before {
                color: #eeeeee;
                font-size: 36px;
            }
        }
        .stations_content {
            width: 100%;
            height: 100%;

            .navBar {
                position: absolute;
                width: 80%;
                margin: 0 10%;

                >ul,
                h3 {
                    float: left;
                }

                >ul {
                    margin-top: .75%;
                }
            }
        }

        .ivu-menu {
            height: 34px;
            line-height: 34px;
            transition: all 1s;
            top: -80%;
        }

        .ivu-menu-horizontal::after {
            background-color: transparent;
        }

        .ivu-menu-light {
            background-color: transparent;
        }

        .ivu-menu-item {
            font-size: 1.34rem;
            font-weight: 400;
            color: #fff !important;
            width: 9rem;
            text-align: center;
            border-bottom: none !important;
            margin: 0 .8rem;
            padding: 0;
        }

        .menuItem {

            &:hover {
                text-shadow: 0 0 6px rgb(35, 183, 240);
                color: rgb(35, 183, 240) !important;
                border-bottom: none !important;
            }
        }

        .leftMenu {

            position: absolute;
            height: 100%;
            z-index: 1;
            width: 100%;

            .ivu-menu-item-selected {

                text-shadow: 0 0 6px rgb(35, 183, 240);
                color: rgb(35, 183, 240) !important;
            }

            .line {
                position: absolute;
                top: 60%;
                left: -7%;
                width: 25%;
                background: url(../../assets/images/topTitleSelected-bg.png) no-repeat;
                background-size: 100% 100%;
                height: 100%;
                transition: all .3s;
            }

        }

    }
</style>