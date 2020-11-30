<template>
    <div class="security_staff_page_content">
        <div class="videoClass">
            <div class="drag_panel" v-for="(videoId, index) in securityStaffConfig.videoIds" :key="index"
                :style="moduleStyle(index)">
                <VideoComponent :id="`staffVideoId${index}`" :video="videos[index]" AutoPlay></VideoComponent>
            </div>
        </div>
        <div class="stationPeopleClass">
            <div class="title">
                <h4 style="color: #fff">站内人员</h4>
            </div>
            <div class="person-info-table-wrap">
                <Table :columns="columns" :data="peoples">
                    <template slot-scope="{ row }" slot="option">
                        <el-tooltip content="出站" placement="top-end">
                            <Button type="primary" size="small" style="margin-right: 5px" @click="leave(row)">
                                <i class="el-icon-right"></i>
                            </Button>
                        </el-tooltip>
                    </template>
                </Table>
            </div>
            <div class="search">
                <Input v-model="enterPeopleName" placeholder="输入进站人员名称">
                <Button slot="append" icon="md-arrow-round-up" @click="enter">进站</Button>
                </Input>
            </div>
        </div>

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
        getVideoDtosByStation
    } from "@/api/video";
    import {
        InterfaceConfig,
        SecurityStaffConfig,
        InterfaceTypeEnum
    } from "@/types/interfaceconfig.interface";
    import {
        Video
    } from "@/types/video.interface";
    import {
        getConfigs,
        getSecurityStaffDefaultConfig,
    } from "@/api/interfaceconfig";
    import {
        getVideoDto
    } from "@/api/video";
    import VideoComponent from "@/components/Video/CommonVideo.vue";
    import AlarmModal from "@/components/view/AlarmModal.vue";
    import {
        StationPeople,
        StationPeopleVo,
    } from '@/types/stationpeople.interface'
    import {
        MessageType,
        MessageSyncDto,
        MessageTypeEnum
    } from "@/types/message.interface";
    import {
        getStationPeoplesByCondition,
        addStationPeople
    } from '@/api/stationpeople'

    @Component({
        components: {
            VideoComponent,
            AlarmModal
        },
    })
    export default class SecurityStaffPage extends Vue {
        stationId: number = 0;
        videos: Video[] = [];

        /** 后端存储的页面配置 */
        interfaceConfigs: InterfaceConfig[] = [];
        interfaceConfig: InterfaceConfig = this.getDefaultInterfaceConfig()

        /** 获取/修改的配置 */
        securityStaffConfig: SecurityStaffConfig = getSecurityStaffDefaultConfig()

        /** 场站内人员 */
        peoples: StationPeople[] = []

        /** 进站人员名 */
        enterPeopleName: string = ''

        columns: any[] = [{
                type: 'index',
                width: 60,
                align: 'center'
            },
            {
                title: "姓名",
                key: "employeeName",
                width: 100
            },
            {
                title: "进场时间",
                key: "time",
                render: (h: any, params: any) => {
                    return h(
                        "div",
                        new Date(params.row.timeStamp).format(
                            "yyyy-MM-dd hh:mm:ss"
                        )
                    );
                },
            },
            {
                title: "操作",
                slot: "option",
                width: 70,
            },
        ]

        mqModuleName: string = "SecurityStaff";


        get moduleStyle() {
            return function (index: number) {
                let x = (index % this.securityStaffConfig.widthNum) * (100 / this.securityStaffConfig.widthNum)
                let y = (Math.floor(index / this.securityStaffConfig.widthNum)) * (100 / this
                    .securityStaffConfig.heightNum)
                return {
                    width: `${100/this.securityStaffConfig.widthNum}%`,
                    height: `${100/this.securityStaffConfig.heightNum}%`,
                    left: `${x}%`,
                    top: `${y}%`,
                }
            }
        }

        created() {
            this.stationId = this.$store.state.stationId;
        }

        async mounted() {
            let r = await this.login();
            console.log("r", r)

            this.initData();

            this.refreshPeople()
            this.refreshLogin()

            this.startListenMQ();
        }

        login() {
            return new Promise((resolve, reject) => {
                let {
                    userName,
                    passWord
                } = this.$store.state;
                // 如果用户名或者密码为空，则不能自动登录
                if (userName == null || passWord == null) {
                    reject(false)
                }

                let loginParams: any = {
                    username: userName,
                    password: passWord,
                };
                this.$store.dispatch("login", loginParams).then((result: any) => {
                    resolve(true)
                }).catch((err) => {
                    reject(false)
                })
            })
        }


        refreshLogin() {
            const timer = setInterval(() => {
                this.login();
            }, 3600000);
            this.$once('hook:beforeDestroy', () => {
                clearInterval(timer);
            })
        }

        refreshPeople() {
            const timer = setInterval(() => {
                this.initStationPeople()
            }, this.ProjectConfig.DataRefreshTime);
            this.$once('hook:beforeDestroy', () => {
                clearInterval(timer);
            })
        }

        initData() {
            Promise.all([getVideoDtosByStation(this.stationId), getConfigs()]).then(res => {
                let allVideos: Video[] = []
                if (res[0].data.code == 200) {
                    allVideos = res[0].data.data
                }

                if (res[1].data.code == 200) {
                    this.interfaceConfigs = res[1].data.data;
                    let tmpIndex: number = this.interfaceConfigs.findIndex(config =>
                        config.stationId == this.stationId && config.type == InterfaceTypeEnum.保安页面
                    )
                    if (tmpIndex >= 0) {
                        this.interfaceConfig = this.interfaceConfigs[tmpIndex]
                    } else {
                        this.interfaceConfig = {
                            name: "保安配置页面",
                            stationId: this.stationId,
                            type: InterfaceTypeEnum.保安页面,
                            param: JSON.stringify(getSecurityStaffDefaultConfig()),
                        }
                    }

                    this.securityStaffConfig = JSON.parse(this.interfaceConfig.param)
                    this.videos.length = this.securityStaffConfig.videoIds.length
                    for (let i = 0; i < this.securityStaffConfig.videoIds.length; i++) {
                        let id: number = this.securityStaffConfig.videoIds[i]
                        let tmpIndex2: number = allVideos.findIndex(v => v.id == id)
                        this.$set(this.videos, i, tmpIndex2 < 0 ? null : allVideos[tmpIndex2]);
                    }

                    console.log("this.interfaceConfigs", this.interfaceConfigs)
                    console.log("this.securityStaffConfig", this.securityStaffConfig)
                }
            })

            this.initStationPeople()
        }

        initStationPeople() {

            let vo: StationPeopleVo = {
                stationId: this.stationId,
                inStation: true
            }
            getStationPeoplesByCondition(vo).then(res => {
                if (res.data.code == 200) this.peoples = res.data.data
            })

        }

        // 开始连接MQ
        startListenMQ() {
            let _this = this;
            console.log(`${this.mqModuleName} 添加监听器到MQ`);
            this.TransferStation.addListener(
                this.mqModuleName,
                this.MQMessageTrigger.bind(_this)
            );
        }

        // 停止连接MQ
        stopListenMQ() {
            console.log(`${this.mqModuleName} 移除监听器`);
            this.TransferStation.deleteListener(this.mqModuleName);
        }

        MQMessageTrigger(respond: any) {
            let message: MessageType = JSON.parse(respond);
            console.log(`${this.mqModuleName}接收到消息：`, message);

            switch (message.type) {

                case MessageTypeEnum.场站人员改变:
                    this.initStationPeople()
                    break;
                default:
                    break;
            }
        }

        getDefaultInterfaceConfig(): InterfaceConfig {
            return {
                name: "保安配置页面",
                stationId: 0,
                type: 3,
                param: JSON.stringify(getSecurityStaffDefaultConfig()),
            };
        }

        enter() {
            console.log("enter", this.enterPeopleName)
            let enterPeople: StationPeople = {
                stationId: this.stationId,
                type: 3,
                employeeName: this.enterPeopleName,
                inStation: true,
                time: new Date(),
            }

            addStationPeople(enterPeople).then(res => {
                if (res.data.code == 200) {
                    this.initStationPeople()
                    this.$Message.success("进站成功！")
                }
            })
        }

        leave(row: StationPeople) {
            console.log("leave", row)
            row.type = 4
            addStationPeople(row).then(res => {
                if (res.data.code == 200) {
                    this.initStationPeople()
                    this.$Message.success("出站成功！")
                }
            })
        }
    }
</script>

<style lang="less">
    .security_staff_page_content {
        height: 100%;
        background: url("../../../assets/images/security_staff_bg.png");
        background-size: 100% 100%;
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: stretch;

        .videoClass {
            position: relative;
            flex: 4;

            .drag_panel {
                position: absolute;
                border: 1px solid #EBEBEB;
            }
        }

        .stationPeopleClass {
            flex: 1;
            display: flex;
            flex-direction: column;

            .title,
            .search {
                flex: 1;
                display: flex;
            }

            .person-info-table-wrap {
                flex: 12;
                overflow-y: auto;

                .ivu-table-wrapper {
                    border: none;
                    position: inherit !important;
                }

                .ivu-table {
                    // background: #fff0 !important;
                    background: transparent !important;
                }

                .ivu-table th,
                .ivu-table td {
                    // background: #fff0 !important;
                    color: #fff;
                    border-bottom: none;
                    background: transparent !important;
                }

            }

            .title {
                align-items: center;
                padding-left: 10px;
            }

            .search {
                align-items: flex-end;
            }
        }
    }
</style>