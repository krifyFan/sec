<template>
    <div class="video_intercom">
        <div class="col" style="height: 98%">
            <Intercom :video="video" AutoPlay ref="intercom"></Intercom>
        </div>
        <div class="col">
            <div class="panel lawfu_person">
                <h4>认证成功</h4>
                <div class="admission_personnel">
                    <ul class="person_box">
                        <li v-for="item in alarm1" :key="item.id" class="person_img">
                            <intercom-image :alarm="item" :cards="cards"></intercom-image>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="panel real_time_alarm">
                <h4>
                    实时告警
                </h4>
                <ScrollBoard :config="config" style="width:100%;height:100%;"></ScrollBoard>
            </div>
        </div>
        <div class="col">
            <div class="panel">
                <h4>认证失败</h4>
                <div class="admission_personnel">
                    <ul class="person_box">
                        <li v-for="item in alarm2" :key="item.id" class="person_img">
                            <intercom-image :alarm="item" :cards="cards"></intercom-image>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="panel">
                <h4>
                    人员管理
                </h4>
                <Table highlight-row stripe ref="currentRowTable" :columns="columns" :data="cards" :loading="cardLoading" @on-row-click="getCurSelectCard" @on-row-dblclick="getCurDbCard">
                </Table>
                <div class="personBottom">
                    <i class="el-icon-delete-solid icon" @click="delSelectCard"></i>
                    <i class="el-icon-circle-plus icon" @click="uploadPersonModal = true"></i>
                    <i class="el-icon-refresh icon" @click="refreshCard"></i>
                </div>
            </div>
        </div>
        <personManageModal :cards="cards" :cardModalVisible="uploadPersonModal" :videoId="video.id" @changeModalState="changeModalState" />
        <Modal v-model="faceImg.state" width="30%" footer-hide>
            <h1 style="text-align: center;padding: 6rem;" v-if="!faceImg.path">暂无图片</h1>
            <ImageFromPath v-else :path="faceImg.path" ref="imageRealInfo" />
        </Modal>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
        Watch
    } from "vue-property-decorator";
    import Intercom from "@/components/view/Intercom.vue";
    import IntercomImage from "@/components/view/IntercomImage.vue";
    import {
        Video,
        VideoVo
    } from "@/types/video.interface";
    import {
        MeasObjectVo
    } from "@/types/measobject.interface";
    import {
        MessageType,
        MessageSyncDto,
        MessageTypeEnum
    } from "@/types/message.interface";
    import {
        Alarm,
        AlarmVo
    } from "@/types/alarm.interface";
    import {
        Card,
        Department
    } from "@/types/intercom.interface";
    import {
        getVideoDtosByCondition,
        getDefaultVideo
    } from "@/api/video";
    import {
        getCards,
        getDepartments,
        deleteCard,
        getFaceFile
    } from "@/api/intercom";
    import {
        getAlarmsByCondition
    } from "@/api/alarm";
    import {
        DateUtil
    } from "@/util/dateUtil";
    import ScrollBoard from "@/components/scrollBoard/scrollBoard.vue";
    import {
        getDate,
        getTime
    } from "@/api/date";
    import personManageModal from './components/personManageModal/index.vue'
    import ImageFromPath from '@/components/Image/ImageFromPath.vue'

    @Component({
        components: {
            Intercom,
            IntercomImage,
            ScrollBoard,
            personManageModal,
            ImageFromPath
        },
    })
    export default class VideoIntercom extends Vue {
        isShowVideo: boolean = true
        /** 场站ID */
        stationId: any = 1;
        /** 对象类型 -- 可视对讲 */
        objectTypeId: number = 5;
        /** 可视对讲视频 */
        video: Video = getDefaultVideo();

        /** 今天的所有告警 */
        alarms: Alarm[] = [];
        /** 成功或失败图片数目 */
        imgNum: number = 4;

        /** 认证成功告警 */
        alarm1: Alarm[] = [];
        /** 认证失败告警 */
        alarm2: Alarm[] = [];

        /** 所有的人/卡 */
        cards: Card[] = [];
        /** 所有部门 */
        departments: Department[] = [];
        /** 获取卡片中 */
        cardLoading: boolean = true;
        columns: any[] = [{
                type: "index",
                width: 60,
                align: "center",
            },
            {
                title: "工号",
                key: "employeeNo",
                // width: 80,
                align: "left",
            },
            {
                title: "姓名",
                key: "name",
                // width: 100,
                align: "left",
            },
            {
                title: "部门",
                key: "departmentName",
                align: "left"
            }
        ];
        /** 刷新列表 */
        config: any = {
            data: [],
        };
        uploadPersonModal: boolean = false
        curSelectCard: any
        faceImg: any = {
            state: false,
            path: ''
        }

        mounted() {
            this.stationId = this.$store.state.stationId;

            this.initData();
        }

        initData() {
            let vo: VideoVo = {
                stationId: this.stationId,
                category: 5,
            };

            getVideoDtosByCondition(vo).then((res: any) => {
                if (res.data.code == 200) {
                    let tmp: Video[] = res.data.data;
                    console.log("获得的视频", tmp)
                    if (tmp.length > 0) {
                        this.video = tmp[0];
                    }

                    this.refreshData();
                    this.refreshSuccessImage();
                    this.refreshFailImage();
                    this.refreshPerson();
                }
            });

            getDepartments().then((res: any) => {
                if (res.data.code == 200) {
                    this.departments = res.data.data;
                }
            });

            this.startListenMQ();
        }

        /** 刷新数据 */
        refreshData() {
            // 查找今天最近的20条
            let vo: AlarmVo = {
                pageNum: 1,
                pageSize: 20,
                objId: this.video.id,
            };

            getAlarmsByCondition(vo).then((res: any) => {
                if (res.data.code != 200) return;

                this.alarms = res.data.data.content;
                // var dataRes = getDate("-") + getTime();

                this.config = {
                    data: this.alarms.map((item, index) => {
                        return [new Date(item.timeStamp).format("MM-dd hh:mm"), item.stationName,
                            item.alarmType.name
                        ];
                    }),
                    align: ["center", "center", "center"],
                    rowNum: 8,
                };
            });
        }

        /** 刷新成功认证图像 */
        refreshSuccessImage() {
            let vo: AlarmVo = {
                pageNum: 1,
                pageSize: 4,
                objId: this.video.id,
                alarmType: 3001
            };

            getAlarmsByCondition(vo).then((res: any) => {
                if (res.data.code != 200) return;

                this.alarm1 = res.data.data.content;
            })
        }

        /** 刷新失败认证图像 */
        refreshFailImage() {
            let vo: AlarmVo = {
                pageNum: 1,
                pageSize: 4,
                objId: this.video.id,
                alarmType: 3002
            };

            getAlarmsByCondition(vo).then((res: any) => {
                if (res.data.code != 200) return;

                this.alarm2 = res.data.data.content;
            })

        }

        /** 刷新人员 */
        refreshPerson() {
            this.cards = []
            this.cardLoading = true;
            setTimeout(() => getCards(this.video.id), 6000)
        }
        refreshCard(){
            this.refreshPerson()
        }
        /** MQ监听 */
        startListenMQ() {
            console.log("可视对讲 添加监听器到MQ");
            this.TransferStation.addListener("VideoIntercom", this.callback);
        }

        /** MQ停止监听 */
        stopListenMQ() {
            console.log("可视对讲 移除监听器");
            this.TransferStation.deleteListener("VideoIntercom");
        }

        callback(respond: any) {
            let message: MessageType = JSON.parse(respond);
            console.log("获取所有卡", message);
            if (message.type == MessageTypeEnum.可视对讲告警) {
                let alarm: Alarm = message.body;

                if (alarm.alarmTypeId == 3001 || alarm.alarmTypeId == 3002) {
                    // 可视对讲则刷新即使告警
                    this.refreshData();
                    this.refreshSuccessImage();
                    this.refreshFailImage();
                } else if (alarm.alarmTypeId == 3003) {
                    // 呼入消息
                    let modal: any = this.$refs.intercom
                    modal.callCome()
                }
            } else if (message.type == MessageTypeEnum.所有卡片下载完成) {
                // 获取所有卡片
                // this.cards = [{
                //     begin: "2019-09-23 09:14:31",
                //     cardNo: "4044166434",
                //     department: 2,
                //     employeeNo: "137",
                //     end: "2029-09-23 09:14:31",
                //     name: "顾思雨"
                // }]
                this.cards = message.body
                this.cards.map((card: Card) => {
                    let index: number = this.departments.findIndex(
                        (a) => a.id == card.department
                    );
                    card.departmentName =
                        index >= 0 ? this.departments[index].name : "";
                });
                this.cards.sort((a, b) => {
                    return Number(a.employeeNo) - Number(b.employeeNo)
                })
                this.cardLoading = false;

            } else if (message.type == MessageTypeEnum.消息同步) {
                // 同步类消息
                this.doSyncMessage(message.body)
            } else if (message.type == MessageTypeEnum.人脸设置完成) {

                this.$Message.info("添加成功！");
              
                this.refreshPerson();

            } else if (message.type == MessageTypeEnum.卡片删除完成) {

                this.$Message.error("删除成功！");
             
                this.refreshPerson();

            }
        }

        /** 同步消息处理 */
        doSyncMessage(val: MessageSyncDto) {
            // 如果是本人操作，无视之
            if (val.token == this.$store.state.token) return

            let intercomModal: any = this.$refs.intercom
            console.log("非本人发送，准备处理告警", val)
            if (val.type == "IntercomAnswer") {
                // 有人接听了
                intercomModal.setCurrentState(-1)

            } else if (val.type == "IntercomRefuse") {
                // 有人拒绝了
                intercomModal.setCurrentState(0)

            } else if (val.type == "IntercomHangup") {
                // 有人挂断了
                intercomModal.setCurrentState(0)

            }
        }

        changeModalState(state: boolean) {
            this.uploadPersonModal = state
            if (!state) {
                // this.refreshPerson()
            }
        }

        delSelectCard() {
            deleteCard(this.video.id, this.curSelectCard).then(res => {
                // this.refreshPerson();
            })
        }

        async getCurDbCard(curCard: any) {
            let {
                faceImg
            } = this

            let {
                data: {
                    data,
                    code
                }
            } = await getFaceFile(curCard)

            if (code == 200) {
                faceImg.path = data
                faceImg.state = true
            }

        }

        getCurSelectCard(data) {
            this.curSelectCard = data
        }

        beforeDestroy() {
            this.stopListenMQ()
        }
    }
</script>

<style lang="less">
    @import "~@/assets/commonCss.less";

    .video_intercom {
        display: flex;
        height: 100%;
        padding: 5rem 1.25rem 0;

        .intercom-wrap.modal-wrap {
            height: 100%;
            background-color: #1a2855;
            padding: 0;
        }

        .col {
            flex: 2;
            height: 98%;

            &:nth-child(1) {
                flex: 6;
                margin-right: 10px;
                border: 1px solid #42d5f3;
                border-radius: 1%;
                box-shadow: 0 0 0.1875rem 0.1875rem #42d5f3;
                margin-right: 2.625rem;
                padding: 0.625rem;
            }

            .lawfu_person {
                .certification_results {
                    height: 450px;

                    .certification_img {
                        width: 163px;
                        height: 182px;
                        margin: 0 auto;
                        background-color: #ccc;
                    }

                    .certification_text {
                        width: 200px;
                        height: 118px;
                        border: 2px solid #36e5ff;
                        border-radius: 10px;
                        margin: 20px auto 0;

                        .tit {
                            display: block;
                            width: 139px;
                            line-height: 42px;
                            background-color: #348d9d;
                            border-radius: 0px 0px 21px 21px;
                            margin: 0 auto;
                            font-size: 22px;
                            text-align: center;
                        }

                        p {
                            font-size: 16px;
                            line-height: 32px;
                            text-align: center;
                        }
                    }
                }
            }

            .panel {
                color: #ffffff;
                // height: 350px;
                height: 48%;
                // background-color: #112143;
                // background: url("../../../assets/images/security_panel_bd.png") no-repeat;
                // background-size: 100% 100%;

                h4 {
                    .componentTitleStyle();
                    margin-bottom: 3%;
                }

                .ivu-table-wrapper {
                    height: 89%;
                    border: none;
                    color: #fff;

                    .ivu-table:after {
                        background-color: transparent;
                    }

                    .ivu-table:before {
                        background-color: transparent;
                    }

                    .ivu-table {
                        background-color: transparent !important;
                        border: none !important;
                        color: #fff;

                        .ivu-table-column-center {
                            background-color: transparent;
                            border: none;
                        }

                        .ivu-table-column-left {
                            background-color: transparent;
                            border: none;
                        }

                        .ivu-table-stripe .ivu-table-body tr:nth-child(2n) td {
                            background-color: transparent;
                        }

                        th {
                            background-color: transparent;
                            border-bottom: none;
                        }
                    }
                }

                &:nth-child(1),
                &:nth-child(2) {
                    margin: 0 10px 10px 0;
                }

                &:nth-child(3),
                &:nth-child(4) {
                    margin: 0 10px 10px 0;
                }

                .people_table {
                    width: 100%;

                    // height: 100%;
                    tr {
                        td {
                            text-align: center;
                            font-size: 14px;
                            line-height: 30px;
                        }
                    }
                }

                .admission_personnel {
                    height: 90%;

                    .person_box {
                        height: 100%;
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-around;

                        .person_img {
                            list-style: none;
                            width: 146px;
                            height: 140px;
                        }
                    }
                }
            }

            .real_time_alarm {
                .scroll-board {
                    .rows {
                        height: 100% !important;
                    }
                }
            }

            .personBottom {
                position: relative;
                height: 7%;
                padding: 0px 2%;
                margin-top: 3%;

                .icon {
                    font-size: 1.3rem;
                    color: #2ed1f6;
                    margin-right: 4%;
                    float: right;
                    cursor: pointer;
                }
            }

            .ivu-table-overflowY {
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

            .ivu-table-row.ivu-table-row-highlight {
                color: #fff;
                background-color: #2f64a8 !important;
            }
        }
    }
</style>