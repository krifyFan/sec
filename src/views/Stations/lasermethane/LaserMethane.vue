<template>
    <div class="laser-methane-wrap">
        <div class="tit_time">
            <span class="date">{{ date }}</span>
            <span class="week">{{ week }}</span>
            <span class="time">{{ time }}</span>
        </div>
        <h1 class="stations_hd">
            {{ station.name }}激光甲烷监测平台
        </h1>
        <div class="message">
            <!-- <Icon type="md-notifications" @click.native="showAlarm" class="message_icon" />
            <span class="badge_icon" v-if="alarmNum"> </span> -->
            <Icon type="md-notifications" class="message_icon" />
            <span class="badge_icon"> </span>
        </div>
        <el-dropdown class="user_icon" @command="handleCommand">
            <span class="el-dropdown-link">
                <Icon type="ios-contact" />
            </span>
            <el-dropdown-menu slot="dropdown">  
                <el-dropdown-item command="setting">{{
                    userName
                }}</el-dropdown-item>
                <el-dropdown-item command="setting">设置</el-dropdown-item>
                <el-dropdown-item command="logout">退出</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
        <div class="main-wrap">
            <laserMain />
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
        getDate,
        getTime,
        getWeek
    } from "@/api/date";
    import { Station } from '@/types/station.interface'
    import { getStation } from '@/api/station'
    import laserMain from './laserMain.vue'

    import RealInfo from './RealInfo.vue'

    @Component({
        components: {
            RealInfo,
            laserMain
        }
    })
    export default class LaserMethanePage extends Vue {
        // 所有的激光甲烷对象
        complexObjects: ComplexObject[] = []
        // 当前选择的激光甲烷
        curComplexObj: ComplexObject = getDefaultComplexObject()
        // 选中的对象ID
        selectId: number = 0

        station: Station = {
            id: -1,
            name: ''
        }

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

        // time
        date: any = 0
        week: any = 0
        time: string = ''

        userName: string = this.$store.state.userName

        mounted() {
            this.initData()
            this.date = getDate(".");
            this.week = getWeek();
            this.getTime();
        }

        initData() {
            // 获取station
            getStation(this.$store.state.stationId).then(res => {
                let { code, data } = res.data
                if ( code === 200 ) {
                    this.station = data
                }
            })

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

        getTime() {
            const timer = setInterval(() => {
                this.time = getTime();
            }, 1000);
            this.$once("hook:beforeDestroy", () => {
                clearInterval(timer);
            });
        }
    
        handleCommand(command) {
            if (command == "logout") {
                this.logout();
            } else if (command == "setting") {
                this.setting();
            }
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
            // this.$router.push({
            //     name: "config",
            // });
        }
    }
</script>
<style lang="less" scoped>
    .laser-methane-wrap {
        width: 100%;
        height: 100%;
        background: url("../../../assets/images/overview_bg.png") center no-repeat;
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

        h1.stations_hd {
            line-height: 90px;
            text-align: center;
            color: #36e5ff;
            text-shadow: 0px 3px 4px rgba(12, 85, 223, 1);
            font-size: 38px;
            font-weight: 400;
        }

        .message {
            width: 36px !important;
            height: 30px !important;
            position: absolute;
            top: 2%;
            right: 11%;
            cursor: pointer;

            .ivu-icon {
                font-size: 34px;
            }

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

            .ivu-icon-md-notifications:before {
                color: #36e5ff;
            }
        }

        .user_icon {
            position: absolute;
            top: 3%;
            right: 8%;

            .ivu-icon-ios-contact {
                cursor: pointer;
            }

            .ivu-icon-ios-contact:before {
                color: #36e5ff;
                font-size: 36px;
            }
        }

        .main-wrap {
            height: 85%;
            width: 90%;
            margin: 0 auto;
            margin-top: 1%;
        }
    }
</style>