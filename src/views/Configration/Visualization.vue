<template>
    <div>
        <h4>大屏配置</h4>
        <div class="top">
            <div v-for="(moduleConfigItem, index) in moduleConfig" :key="index" :class="moduleConfigItem.value">
                <span class="sign">{{ index+1 }}</span>
                <el-select size="mini" v-model="moduleConfigItem.value" placeholder="请选择" class="select" @change="
                        moduleConfigItem.groupId = moduleConfigItem.value == 'VideoGroup' ? 0 : -1 ">
                    <el-option v-for="moduleNameItem in moduleNames" :key="`${moduleNameItem.value}${index}`"
                        :label="moduleNameItem.label" :value="moduleNameItem.value">
                    </el-option>
                </el-select>
                <span class="sp">宽度: </span>
                <el-input size="mini" class="input" v-model="moduleConfigItem.position.width"></el-input>
                <span class="sp">高度：</span>
                <el-input size="mini" class="input" v-model="moduleConfigItem.position.height"></el-input>
                <span class="sp">X坐标：</span>
                <el-input size="mini" class="input" v-model="moduleConfigItem.position.x"></el-input>
                <span class="sp">Y坐标：</span>
                <el-input size="mini" class="input" v-model="moduleConfigItem.position.y"></el-input>

                <div class="video" v-if="moduleConfigItem.groupId !== -1">
                    <span class="sp">视频组：</span>
                    <el-select size="mini" v-model="moduleConfigItem.groupId" placeholder="请选择" class="select">
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
        InterfaceTypeEnum
    } from "@/types/interfaceconfig.interface";
    import translate, {
        deepCopy
    } from "@/util/common.ts";
    import {
        getVideoGroups
    } from "@/api/videogroup.ts";
    import {
        getVisualizationDefaultConfig,
        getConfigs,
        updateConfig,
    } from "@/api/interfaceconfig";

    const selectOptionHash = {
        EquipmentCondition: "设备状况",
        AlarmStatistics: "告警统计",
        Map: "地图",
        EventStatistics: "事件统计",
        GrowthTrend: "增长趋势",
        EquipmentStatistics: "设备统计",
        VideoGroup: "视频分组",
        RealTimeAlarm: "实时告警",
        IntercomStatistics: "进场统计",
        SysteminfoStatistics: "系统信息",
        StationStatistics: '场站统计'
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
    export default class StationClass extends Vue {
        // data
        moduleNames: any[] = [{
                value: "EquipmentCondition",
                label: "设备状况",
            },
            {
                value: "AlarmStatistics",
                label: "告警统计",
            },
            {
                value: "Map",
                label: "地图",
            },
            {
                value: "EventStatistics",
                label: "事件统计",
            },
            {
                value: "GrowthTrend",
                label: "增长趋势",
            },
            {
                value: "EquipmentStatistics",
                label: "设备统计",
            },
            {
                value: "VideoGroup",
                label: "视频分组",
            },
            {
                value: "RealTimeAlarm",
                label: "实时告警",
            },
            {
                value: "IntercomStatistics",
                label: "进站统计",
            },
            {
                value: "SysteminfoStatistics",
                label: "系统信息"
            },
            {
                value: "StationStatistics",
                label: "场站统计"
            }
        ];
        // 后端存储的页面配置
        interfaceConfig: InterfaceConfig;
        // 获取/修改的配置
        moduleConfig: ModuleConfigInterface[] = [];
        // 所有视频
        videoGroupList: VideoGroup[] = [];

        defaultWidth: number = 1670;
        defaultHeight: number = 555;

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
            this.getModuleConfig();
            this.getVideoGroup();
        }

        /** 获取页面配置 */
        getModuleConfig() {
            getConfigs()
                .then((res: any) => {
                    if (res.data.code == 200) {
                        let configs: InterfaceConfig[] = res.data.data;
                        let index: number = configs.findIndex(
                            (config: InterfaceConfig) =>
                            config.type == InterfaceTypeEnum.可视化 && config.stationId == 0
                        );
                        // 如果已经配置过，则获取配置的，没有的话，则新建一个
                        if (index < 0) {
                            this.interfaceConfig = this.getDefaultInterfaceConfig()
                        } else {
                            this.interfaceConfig = configs[index];
                        }
                    } else {
                        this.interfaceConfig = this.getDefaultInterfaceConfig()
                    }
                })
                .catch((err) => {
                    this.interfaceConfig = this.getDefaultInterfaceConfig()
                })
                .finally(() => {
                    this.moduleConfig = JSON.parse(this.interfaceConfig.param);
                    this.moduleConfig.forEach((config: ModuleConfigInterface) => {
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
                });
        }

        getDefaultInterfaceConfig(): InterfaceConfig {
            return {
                name: "可视化页面配置",
                type: InterfaceTypeEnum.可视化,
                stationId: 0,
                param: JSON.stringify(getVisualizationDefaultConfig()),
            };
        }

        getVideoGroup() {
            getVideoGroups().then((res: any) => {
                if (res.data.code != 200) return;

                this.videoGroupList = res.data.data;
            });
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

            for (let index = 0; index < this.moduleConfig.length; index++) {
                this.moduleConfig[index].id = index + 1
            }

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

    .top {
        position: relative;
        overflow: hidden;
        width: 1670px;
        height: 252px;

        .EquipmentCondition,
        .AlarmStatistics,
        .Map,
        .EventStatistics,
        .GrowthTrend,
        .EquipmentStatistics,
        .VideoGroup,
        .RealTimeAlarm,
        .StationStatistics,
        .IntercomStatistics,
        .SysteminfoStatistics {
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
        height: 555px;
        border: 1px solid;
        margin-top: 0.5%;

        .modules {
            position: absolute;
            text-align: center;
            border: 1px solid;
        }
    }
</style>