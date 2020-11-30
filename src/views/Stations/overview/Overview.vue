<template>
    <div class="overview_content">
        <div class="visualized_content">
            <div v-for="(moduleItem, index) in moduleConfig" :key="`${index}`"
                :style="moduleStyle(moduleItem && moduleItem.position)" class="drag_panel">
                <component :is="moduleItem.value" :chartId="moduleItem.id" :videos="moduleItem.videos"
                    :carouselRef="moduleItem.carouselRef" :carouselId="moduleItem.carouselId"
                    :groupName="moduleItem.groupName"></component>
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
    import EquipmentCondition from "@/views/Stations/overview/EquipmentCondition2.vue";
    import NumberOfAlarms from "@/views/Stations/overview/NumberOfAlarms.vue";
    import RealTimeAlarm from "@/views/Stations/overview/RealTimeAlarm.vue";
    import HistoryAlarm from "@/views/Stations/overview/HistoryAlarm.vue";
    import Unity3D from "@/components/view/Unity3d.vue";
    import VideoGroup from "@/components/Video/videoCarousel.vue";
    import BaseInformation from '@/views/Stations/overview/BaseInformation.vue'
    import {
        getVideoDtosByStation
    } from "@/api/video";
    import {
        InterfaceConfig,
        ModuleConfigInterface,
        InterfaceTypeEnum,
    } from "@/types/interfaceconfig.interface";
    import {
        Video,
        VideoVo
    } from "@/types/video.interface";
    import {
        getConfigs,
        getOverViewModuleDefaultConfig,
    } from "@/api/interfaceconfig";
    import {
        getVideoDto
    } from "@/api/video";
    import {
        getVideoGroupDtos
    } from "@/api/videogroup";

    @Component({
        components: {
            EquipmentCondition,
            NumberOfAlarms,
            RealTimeAlarm,
            HistoryAlarm,
            Unity3D,
            VideoGroup,
            BaseInformation,
        },
    })
    export default class Overview extends Vue {
        stationId: number = 0;
        videos: Video[] = [];

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
            this.stationId = this.$store.state.stationId;
            this.initData();
        }

        initData() {
            Promise.all([getConfigs(), getVideoGroupDtos()])
                .then((res: any) => {
                    let groups: any[] =
                        res[1].data.code == 200 ? res[1].data.data : [];
                    if (res[0].data.code == 200) {
                        let configs: InterfaceConfig[] = res[0].data.data;
                        let index: number = configs.findIndex(
                            (config: InterfaceConfig) =>
                            config.type == InterfaceTypeEnum.场站总览 &&
                            config.stationId == this.stationId
                        );
                        // 如果已经配置过，则获取配置的，没有的话，则新建一个
                        let interfaceConfig: InterfaceConfig;
                        if (index < 0) {
                            interfaceConfig = {
                                name: "场站总览配置页面",
                                type: InterfaceTypeEnum.场站总览,
                                stationId: this.stationId,
                                param: JSON.stringify(
                                    getOverViewModuleDefaultConfig()
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

                    } else {
                        this.moduleConfig = getOverViewModuleDefaultConfig();
                    }
                })
                .catch((err) => {
                    this.moduleConfig = getOverViewModuleDefaultConfig();
                });
        }
    }
</script>

<style lang="less" scoped>
    .overview_content {
        height: 80%;
        position: relative;

        .visualized_content {
            width: 100%;
            height: 100%;
        }

        .drag_panel {
            position: absolute;
            width: 429px;
            height: 32%;
            background: rgba(13, 24, 54, 1 0.1);
            margin: 0 auto 10px;
            // background-image: url("../../../assets/images/frame.png");
            // background-size: 100% 100%;
            left: 2%;
        }
    }
</style>