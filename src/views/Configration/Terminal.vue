<template>
    <div>
        <h4>场站配置</h4>
        <div class="top">
            <div class="overViewNameSel">
                <span class="sp">总览模块: </span>
                <el-select size="mini" v-model="curStationId" placeholder="请选择" class="select" @change="stationChange">
                    <el-option v-for="item in stations" :key="`${item.id}`" :label="item.name" :value="item.id">
                    </el-option>
                </el-select>
            </div>
            <div v-for="(moduleItem, index) in moduleConfig" :key="index" :class="moduleItem.value">
                <span class="sign">{{ index+1 }}</span>
                <el-select size="mini" v-model="moduleItem.value" placeholder="请选择" class="select" @change="
                        moduleItem.groupId = moduleItem.value == 'VideoGroup' ? 0 : -1">
                    <el-option v-for="moduleNameItem in moduleName" :key="`${moduleNameItem.value}${index}`"
                        :label="moduleNameItem.label" :value="moduleNameItem.value">
                    </el-option>
                </el-select>
                <span class="sp">宽度: </span>
                <el-input size="mini" class="input" v-model="moduleItem.position.width"></el-input>
                <span class="sp">高度：</span>
                <el-input size="mini" class="input" v-model="moduleItem.position.height"></el-input>
                <span class="sp">X坐标：</span>
                <el-input size="mini" class="input" v-model="moduleItem.position.x"></el-input>
                <span class="sp">Y坐标：</span>
                <el-input size="mini" class="input" v-model="moduleItem.position.y"></el-input>

                <div class="video" v-if="moduleItem.groupId !== -1">
                    <span class="sp">视频组：</span>
                    <el-select size="mini" v-model="moduleItem.groupId" placeholder="请选择" class="select">
                        <el-option v-for="group in videoGroupList" :key="`${group.id}`" :label="group.name"
                            :value="group.id">
                        </el-option>
                    </el-select>
                </div>
                <el-button type="danger" icon="el-icon-delete" circle size="mini" style="margin-left: 5px"
                    @click="remove(index)"></el-button>
            </div>
            <el-button class="addBtn" size="mini" @click="addModuleConfig">添加</el-button>
            <el-button class="submitBtn" size="mini" @click="submitModuleConfig">确认</el-button>
        </div>
        <div class="moduleConfig">
            <div class="modules" v-for="(moduleItem, index) in moduleConfig"
                :key="`${moduleItem.value}${index}${moduleItem.id}`" :style="moduleStyle(index)">
                {{ index+1 }}.{{ moduleItem.value | moduleNameFilter }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
        Watch
    } from "vue-property-decorator";
    import {
        VideoGroup
    } from "@/types/videogroup.interface";
    import {
        InterfaceConfig,
        ModuleConfigInterface,
        InterfaceTypeEnum,
    } from "@/types/interfaceconfig.interface";
    import {
        Station
    } from "@/types/station.interface";
    import translate, {
        deepCopy
    } from "@/util/common.ts";
    import {
        getVideoGroups
    } from "@/api/videogroup.ts";
    import {
        getOverViewModuleDefaultConfig,
        getConfigs,
        updateConfig,
    } from "@/api/interfaceconfig";
    import {
        getStations
    } from "@/api/station";
    import {
        ModalConfig
    } from "iview";

    const selectOptionHash = {
        EquipmentCondition: "设备状况",
        NumberOfAlarms: "告警数量",
        RealTimeAlarm: "实时告警",
        VideoGroup: "视频组",
        Unity3D: "三维模型",
        HistoryAlarm: "历史告警",
        BaseInformation: "基本信息",
    };

    @Component({
        components: {},
        filters: {
            moduleNameFilter(val: string) {
                if (!val) return "";

                return selectOptionHash[val] || "";
            },
        },
    })
    export default class extends Vue {
        // data
        stations: Station[] = [];

        moduleName: any[] = [{
                value: "EquipmentCondition",
                label: "设备状况",
            },
            {
                value: "NumberOfAlarms",
                label: "告警数量",
            },
            {
                value: "RealTimeAlarm",
                label: "实时告警",
            },
            {
                value: "VideoGroup",
                label: "视频组",
            },
            {
                value: "Unity3D",
                label: "三维模型",
            },
            {
                value: "HistoryAlarm",
                label: "历史告警",
            },
            {
                value: "BaseInformation",
                label: "基本信息"
            }
        ];
        // 后端存储的页面配置
        interfaceConfigs: InterfaceConfig[] = [];
        interfaceConfig: InterfaceConfig;
        // 获取/修改的配置
        moduleConfig: ModuleConfigInterface[] = [];
        // 所有视频
        videoGroupList: VideoGroup[] = [];
        // 当前场站所有视频
        curStationVideoGroupList: VideoGroup[] = [];

        // 当前编辑的场站
        curStationId: number = 0;
        // 默认宽高
        defaultWidth: number = 1670;
        defaultHeight: number = 550;

        // computed
        get moduleStyle() {
            return function (index: number) {
                let {
                    position: {
                        width,
                        height,
                        x,
                        y
                    },
                } = this.moduleConfig[index]

                return {
                    width: `${width}px`,
                    height: `${height}px`,
                    lineHeight: `${height}px`,
                    left: `${x}px`,
                    top: `${y}px`,
                };
            };
        }

        mounted() {
            this.initData();
        }

        initData() {
            Promise.all([getStations(), getConfigs(), getVideoGroups()]).then(
                (res: any) => {
                    if (res[0].data.code == 200) {
                        this.stations = res[0].data.data;
                    }

                    if (res[1].data.code == 200) {
                        this.interfaceConfigs = res[1].data.data;

                        // 如果有该场站配置则配置，没有的话新建一个
                        if (this.stations.length == 0) {
                            this.interfaceConfig = this.getDefaultInterfaceConfig(
                                null
                            );
                        } else {
                            this.curStationId = this.stations[0].id;

                            let tmpIndex: number = this.interfaceConfigs.findIndex(
                                (config: InterfaceConfig) =>
                                config.stationId == this.stations[0].id
                            );
                            this.interfaceConfig =
                                tmpIndex >= 0 ?
                                this.interfaceConfigs[tmpIndex] :
                                this.getDefaultInterfaceConfig(
                                    this.stations[0]
                                );
                        }

                        this.moduleConfig = this.translateModuleConfig();
                    }

                    if (res[2].data.code == 200) {
                        this.videoGroupList = res[2].data.data;
                        if (this.stations.length > 0) {
                            this.curStationVideoGroupList = this.videoGroupList.map(
                                (group: VideoGroup) => {
                                    if (group.stationId == this.stations[0].id) {
                                        return group;
                                    }
                                }
                            );
                        }
                    }

                    console.log("所有场站", this.stations);
                    console.log("当前场站", this.curStationId);
                    console.log("interfaceConfigs", this.interfaceConfigs);
                    console.log("interfaceConfig", this.interfaceConfig);
                    console.log("moduleConfig", this.moduleConfig);
                }
            );
        }

        getDefaultInterfaceConfig(station: Station | null): InterfaceConfig {
            console.log("station:", station);
            console.log(getOverViewModuleDefaultConfig());
            return {
                name: (station ? station.name : "") + "总览配置页面",
                stationId: station ? station.id : 0,
                type: InterfaceTypeEnum.场站总览,
                param: JSON.stringify(getOverViewModuleDefaultConfig()),
            };
        }

        translateModuleConfig(): ModuleConfigInterface[] {
            let configs: ModuleConfigInterface[] = JSON.parse(
                this.interfaceConfig.param
            );
            configs.forEach((config: ModuleConfigInterface) => {
                let {
                    width,
                    height,
                    x,
                    y
                } = config.position;
                config.position = {
                    width: translate.wh(width, this.defaultWidth),
                    height: translate.wh(height, this.defaultHeight),
                    x: translate.wh(x, this.defaultWidth),
                    y: translate.wh(y, this.defaultHeight),
                };
            });

            return configs;
        }

        /** 场站改变 */
        stationChange() {
            let tmpStationIndex: number = this.stations.findIndex(
                (station: Station) => station.id == this.curStationId
            );
            let tmpStation: Station = this.stations[tmpStationIndex];

            let tmpIndex: number = this.interfaceConfigs.findIndex(
                (config: InterfaceConfig) => config.stationId == this.curStationId
            );
            this.interfaceConfig =
                tmpIndex >= 0 ?
                this.interfaceConfigs[tmpIndex] :
                this.getDefaultInterfaceConfig(tmpStation);
            this.moduleConfig = this.translateModuleConfig();
        }

        addModuleConfig() {
            this.moduleConfig.push({
                id: 0,
                value: 'VideoGroup',
                position: {
                    width: 300,
                    height: 200,
                    x: 10,
                    y: 10,
                },
                groupId: 0,
            })
        }

        submitModuleConfig() {
            let tmp: ModuleConfigInterface[] = JSON.parse(
                JSON.stringify(this.moduleConfig)
            );

            tmp.forEach((config: ModuleConfigInterface) => {
                let {
                    width,
                    height,
                    x,
                    y
                } = config.position;
                config.position = {
                    width: translate.ratio(width, this.defaultWidth),
                    height: translate.ratio(height, this.defaultHeight),
                    x: translate.ratio(x, this.defaultWidth),
                    y: translate.ratio(y, this.defaultHeight),
                };
            });
            this.interfaceConfig.param = JSON.stringify(tmp);

            updateConfig(this.interfaceConfig)
                .then((res: any) => {
                    if (res.data.code == 200) {
                        this.$Message.info("修改成功！");
                    } else {
                        this.$Message.error("修改失败！！！");
                    }
                })
                .catch((err) => {
                    this.$Message.error("修改失败！！！");
                })
                .finally(() => {
                    location.reload();
                });
        }

        remove(index: number) {
            this.moduleConfig.splice(index, 1)
        }
    }
</script>

<style scoped lang="less">
    .selectStyle(@width: 14%) {
        width: @width;
    }

    .inputStyle(@width: 8%) {
        width: @width;
        display: inline-block;
    }

    .span(@fontSize: 0.8rem, @marginLeft: 0.3rem) {
        font-size: @fontSize;
        display: inline-block;
        margin-left: @marginLeft;
    }

    .box(@width, @height, @top, @left) {
        width: @width;
        height: @height;
        top: @top;
        left: @left;
        line-height: @height;
    }

    .top {
        position: relative;
        overflow: hidden;
        width: 1670px;
        height: 252px;

        .overViewNameSel {
            font-size: 1.3rem;
            margin-top: 0.2rem;
        }

        .EquipmentCondition,
        .NumberOfAlarms,
        .RealTimeAlarm,
        .VideoGroup,
        .Unity3D,
        .HistoryAlarm,
        .BaseInformation {
            float: left;
            width: 50%;
            padding-bottom: 0.15%;

            .select {
                .selectStyle();
            }

            .input {
                .inputStyle();
            }

            .sp {
                .span();
            }

            .site,
            .video {
                display: inline-block;
                width: 25%;

                .select {
                    .selectStyle(60%);
                }
            }
        }

        .sign {
            font-size: 1rem;
            padding: 0.5%;
        }

        .addBtn {
            position: absolute;
            bottom: 1rem;
            right: 6rem;
        }

        .submitBtn {
            position: absolute;
            bottom: 1rem;
            right: 2rem;
        }
    }

    .moduleConfig {
        position: relative;
        width: 1670px;
        height: 550px;
        border: 1px solid;
        margin-top: 0.5%;

        .modules {
            position: absolute;
            text-align: center;
            border: 1px solid;
        }
    }
</style>