<template>
    <div class="perimeter_alarm">
        <Unity3D></Unity3D>
        <div class="left scrollbar" :style="leftDomStyle">
            <h4>
                防区列表
            </h4>
            <ul class="dropdown" v-show="isShowSecurityAreaList">
                <li v-for="(item, index) in measObjectVals" :key="item.id" class="dropdown_item">
                    <div class="circle redCircle" v-if="item.isAlarm"></div>
                    <div class="circle greenCircle" v-else></div>
                    {{ item.name }}
                    <span class="fortification_icon" v-if="item.actived" @click="changeActived(index)"></span>
                    <span class="forbid_fortification_icon" v-else @click="changeActived(index)"></span>
                    <span class="setting_icon" @click="setting(index)"></span>
                </li>
                <div class="leftBtn" @click="leftHidden">
                    <img :src="leftBtnImg" />
                </div>
            </ul>
        </div>

        <div class="col right scrollbar" :style="rightDomStyle">
            <div class="panel_common patrol">
                <Patrol></Patrol>
            </div>
            <div class="panel_common alarm">
                <RealTimeAlarm ref="realTimeAlarm"></RealTimeAlarm>
            </div>
            <div class="rightBtn" @click="rightHidden">
                <img :src="rightBtnImg" />
            </div>
        </div>
        <DeployDefence :deployVisible="deployVisible" :deployId="deployId" @changeModalState="changeModalState" />
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue
    } from "vue-property-decorator";
    import SecurityAreaStatus from "@/views/Stations/perimeteralarm/SecurityAreaStatus.vue";
    import AlarmStatistics from "@/views/Stations/perimeteralarm/AlarmStatistics.vue";
    import RealTimeAlarm from "@/views/Stations/perimeteralarm/RealTimeAlarm.vue";
    import {
        MeasObjectVo
    } from "@/types/measobject.interface";
    import {
        MeasObjectVal
    } from "@/types/measobjectval.interface";
    import {
        selectMeasObjectValsByCondition,
        editMeasObjectVal,
        alarmsCondition,
        selectMeasObjectsByCondition
    } from "@/api/measobject";
    import Unity3D from "@/components/view/Unity3d.vue";
    import {
        MessageType,
        MessageTypeEnum
    } from "@/types/message.interface";
    import DeployDefence from '@/components/deployDefence/deployDefence.vue'
    import Patrol from '@/views/Stations/perimeteralarm/Patrol.vue'
import { data } from 'jquery';

    @Component({
        components: {
            SecurityAreaStatus,
            AlarmStatistics,
            RealTimeAlarm,
            Unity3D,
            DeployDefence,
            Patrol
        },
    })
    export default class IndustrialTV extends Vue {
        isShowSecurityAreaList: Boolean = true;

        stationId: number = 0;

        // 对象类型 -- 周界入侵
        objectTypeId: number = 3;
        // 所有防区
        measObjectVals: MeasObjectVal[] = [];
        deployVisible: boolean = false
        deployId: number = 0
        leftBtnStatus: boolean = true
        rightBtnStatus: boolean = true

        get leftDomStyle() {
            return {
                left: this.leftBtnStatus ? '0' : '-21%'
            }
        }

        get rightDomStyle() {
            return {
                right: this.rightBtnStatus ? '0' : '-21%'
            }
        }

        get leftBtnImg() {
            let img = this.leftBtnStatus ? 'left-open-btn' : 'left-close-btn'
            return require(`@/assets/images/${img}.png`)
        }

        get rightBtnImg() {
            let img = this.rightBtnStatus ? 'right-open-btn' : 'right-close-btn'
            return require(`@/assets/images/${img}.png`)
        }

        mounted() {
            this.stationId = this.$store.state.stationId;
            let typeIndex: number = this.$store.state.objectType.findIndex(
                (a) => a.key == "周界入侵"
            );
            this.objectTypeId =
                typeIndex < 0 ? 0 : this.$store.state.objectType[typeIndex].val;

            this.initData();
            this.refresh()

            this.startListenMQ();
        }

        refresh() {
            const timer = setInterval(() => {
                this.initData()
            }, this.ProjectConfig.DataRefreshTime);
            this.$once('hook:beforeDestroy', () => {
                clearInterval(timer);
            })
        }

        initData() {
            this.measObjectVals = []
            let vo: MeasObjectVo = {
                stationId: this.stationId,
                objectType: this.objectTypeId,
            };
            selectMeasObjectsByCondition(vo).then((res: any) => {
                let {
                    code,
                    data
                } = res.data;
                if (code == 200) {
                    data.forEach(element => {
                        let temp:MeasObjectVal = {
                            actived: element.actived,
                            createTime: element.createTime,
                            dataType: element.dataType,
                            id: element.id,
                            isAlarm: false,
                            name: element.name,
                            objectType: element.objectType,
                            online: element.online,
                            stationId: element.stationId
                        }
                        let params = {
                            objId: element.id,
                            cleaned: false
                        }

                        alarmsCondition(params).then(res => {
                            if (res.data.code == 200 && res.data.data.length > 0) {
                                temp.isAlarm = true
                            } else {
                                temp.isAlarm = false
                            }
                        })

                        this.measObjectVals.push(temp)
                    });
                }
            });

            // 实时告警刷新
            let realTimeAlarm: any = this.$refs.realTimeAlarm;
            realTimeAlarm.init();
        }

        //   防区列表显示隐藏
        showSecurityAreaList() {
            this.isShowSecurityAreaList = !this.isShowSecurityAreaList;
        }

        changeActived(index: number) {
            this.measObjectVals[index].actived = !this.measObjectVals[index].actived;
            editMeasObjectVal(this.measObjectVals[index]).then((res: any) => {
                if (res.data.code == 200) {
                    this.initData();
                    this.$Message.success("修改成功!");
                }
            });
        }

        setting(index: number) {
            this.deployId = this.measObjectVals[index].id
            this.deployVisible = true
        }

        /** MQ监听 */
        startListenMQ() {
            console.log("周界安防 添加监听器到MQ");
            this.TransferStation.addListener("PermeterAlarm", this.callback);
        }

        /** MQ停止监听 */
        stopListenMQ() {
            console.log("周界安防 移除监听器");
            this.TransferStation.deleteListener("PermeterAlarm");
        }

        callback(respond: any) {
            let message: MessageType = JSON.parse(respond);
            console.log("周界安防 接收到消息：", message);
            switch (message.type) {
                case MessageTypeEnum.周界升级告警:
                case MessageTypeEnum.周界告警:
                    // 周界告警则刷新页面数据
                    this.initData();
                    break;

                default:
                    // 其他告警不处理
                    break;
            }
        }

        changeModalState(state) {
            this.deployVisible = state
        }

        leftHidden() {
            this.leftBtnStatus = !this.leftBtnStatus
        }
        rightHidden() {
            this.rightBtnStatus = !this.rightBtnStatus
        }

        beforeDestroy() {
            this.stopListenMQ();
        }
    }
</script>

<style lang="less" scoped>
    @import "~@/assets/commonCss.less";

    .perimeter_alarm {
        height: 100%;
        position: relative;
        overflow: hidden;

        .left,
        .right {
            position: absolute;
            width: 21%;
            height: 80%;
            top: 10%;
            transition: all 1s;
            background-image: linear-gradient(to right, rgba(17, 27, 40, 0), rgba(17, 27, 40, 0.3) 20%, rgba(17, 27, 40, 0.55));
            padding: 0 1%;
            overflow-y: auto;
            overflow-x: hidden;

            .leftBtn,
            .rightBtn {
                width: 6%;
                height: 4%;
                position: absolute;
                top: 50%;
                transform: translate(0, -50%);
            }

            .leftBtn {
                right: -6%;
            }

            .rightBtn {
                left: -4.6%;
            }

        }

        .left {

            // 侧边防区列表
            h4 {
                .componentTitleStyle();

            }

            .dropdown {
                width: 100%;
                color: #fff;

                .dropdown_item {
                    list-style: none;
                    width: 100%;
                    line-height: 68px;
                    text-align: left;
                    font-size: 22px;
                    padding-left: 40px;
                    cursor: pointer;
                    position: relative;

                    .circle {
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        display: inline-block;
                        margin-right: 20px;
                    }

                    .redCircle {
                        background-color: red;
                    }

                    .greenCircle {
                        background-color: green;
                    }

                    .fortification_icon {
                        display: block;
                        width: 26px;
                        height: 28px;
                        background: url("../../../assets/images/fortification_icon.png") no-repeat;
                        background-size: 100% 100%;
                        position: absolute;
                        right: 85px;
                        top: 50%;
                        transform: translateY(-50%);
                    }

                    .forbid_fortification_icon {
                        display: block;
                        width: 26px;
                        height: 28px;
                        background: url("../../../assets/images/no_fortification_icon.png") no-repeat;
                        background-size: 100% 100%;
                        position: absolute;
                        right: 85px;
                        top: 50%;
                        transform: translateY(-50%);
                    }

                    .setting_icon {
                        display: block;
                        width: 26px;
                        height: 26px;
                        background: url("../../../assets/images/setting.png") no-repeat;
                        background-size: 100% 100%;
                        position: absolute;
                        right: 40px;
                        top: 50%;
                        transform: translateY(-50%);
                    }

                    &.active {
                        border-right: 15px solid #49aae0;
                        background-color: #113379;
                        border-radius: 3px;

                        // .fortification_icon {}

                        .forbid_fortification_icon {
                            background: url("../../../assets/images/no_fortification_icon_active.png") no-repeat;
                            background-size: 100% 100%;
                        }
                    }
                }
            }
        }

        .right {
            right: 3%;
            background-image: linear-gradient(to right, rgba(17, 27, 40, .55), rgba(17, 27, 40, 0.3) 80%, rgba(17, 27, 40, 0));

            .panel_common {
                position: relative;
                width: 100%;
                background: rgba(13, 24, 54, 1 0.1);
                margin: 0 auto 10px;
            }

            .patrol {
                height: 40%;
            }

            .alarm {
                height: 57%;
            }
        }
    }
</style>