<template>
    <div class="overview_content">
        <div class="visualized_content">
            <!-- <div v-for="(moduleItem, index) in moduleConfig" :key="`${index}`"
                :style="moduleStyle(moduleItem && moduleItem.position)" class="drag">
                <component :is="moduleItem.value" :chartId="moduleItem.id" :videos="moduleItem.videos"
                    :carouselRef="moduleItem.carouselRef" :carouselId="moduleItem.carouselId"
                    :groupName="moduleItem.groupName"></component>
            </div> -->
            <div v-for="(moduleItem, index) in moduleConfig" :key="`${index}`" :style="moduleStyle(moduleItem && moduleItem.position)">
                <component :is="moduleItem.value" :chartId="moduleItem.id" :videos="moduleItem.videos" :carouselRef="moduleItem.carouselRef" :carouselId="moduleItem.carouselId" :groupName="moduleItem.groupName"></component>
            </div>
            <!-- <Unity3D></Unity3D> -->
            <div class="left" :style="leftDomStyle">
                <!-- <div class="drag">
                    <EquipmentCondition />
                </div>
                <div class="drag">
                    <NumberOfAlarms />
                </div>
                <div class="drag">
                    <RealTimeAlarm />
                </div> -->
                <div v-for="(moduleItem, index) in leftModuleConfig" :key="`${index}`" :style="moduleStyle(moduleItem && moduleItem.position)" class="drag">
                    <component :is="moduleItem.value" :chartId="moduleItem.id" :videos="moduleItem.videos" :carouselRef="moduleItem.carouselRef" :carouselId="moduleItem.carouselId" :groupName="moduleItem.groupName"></component>
                </div>
                <div class="leftBtn" @click="leftHidden">
                    <img :src="leftBtnImg" />
                </div>
            </div>

            <div class="right" :style="rightDomStyle">
                <!-- <div class="drag">
                    <HistoryAlarm />
                </div>
                <div class="drag">
                    <BaseInformation />
                </div>
                <div class="drag">
                    <GrowthTrend />
                </div> -->
                <div v-for="(moduleItem, index) in rightModuleConfig" :key="`${index}`" :style="moduleStyle(moduleItem && moduleItem.position)" class="drag">
                    <component 
                        :is="moduleItem.value" 
                        :chartId="moduleItem.id" 
                        :videos="moduleItem.videos" 
                        :carouselRef="moduleItem.carouselRef" 
                        :carouselId="moduleItem.carouselId" 
                        :groupName="moduleItem.groupName"
                    ></component>
                </div>
                <div class="rightBtn" @click="rightHidden">
                    <img :src="rightBtnImg" />
                </div>
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
    import GrowthTrend from "@/views/Main/visualized/GrowthTrend.vue";
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
            GrowthTrend
        },
    })
    export default class Overview extends Vue {
        stationId: number = 0;
        videos: Video[] = [];

        // 获取/修改的配置
        moduleConfig: ModuleConfigInterface[] = [];
        leftModuleConfig: ModuleConfigInterface[] = [];
        rightModuleConfig: ModuleConfigInterface[] = [];
        leftBtnStatus: boolean = true
        rightBtnStatus: boolean = true
        /**页面内body的宽高 */
        defaultWidth: number = document.body.offsetWidth
        defaultHeight: number = document.body.offsetHeight

        get moduleStyle() {
            return function({
                width,
                height,
                x,
                y
            }) {
                return {
                    width: `${(width / 100) *　this.defaultWidth }px`,
                    height: `${(height / 100) * this.defaultHeight}px`,
                    left: `${x}%`,
                    top: `${y}%`,
                };
            };
        }

        get leftDomStyle() {
            return {
                left: this.leftBtnStatus ? '0' : '-20%'
            }
        }

        get rightDomStyle() {
            return {
                right: this.rightBtnStatus ? '0' : '-20%'
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

        created() {
            this.stationId = this.$store.state.stationId;
            this.initData();

            window.addEventListener('keydown', e => {

                if (e.keyCode == 122) {
                    location.reload()
                }

            })
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

                        this.leftModuleConfig = this.moduleConfig.splice(0, 3)
                        this.rightModuleConfig = this.moduleConfig.splice(0, 3)

                    } else {
                        this.moduleConfig = getOverViewModuleDefaultConfig();


                    }
                })
                .catch((err) => {
                    this.moduleConfig = getOverViewModuleDefaultConfig();
                });
        }

        leftHidden() {
            this.leftBtnStatus = !this.leftBtnStatus
        }
        rightHidden() {
            this.rightBtnStatus = !this.rightBtnStatus
        }
    }
</script>

<style lang="less" scoped>
    .overview_content {
        height: 100%;
        position: relative;
        overflow: hidden;
        // margin: 0 3%;


        .visualized_content {
            width: 100%;
            height: 100%;
        }

        .drag {
            // position: relative;
            width: 100%;
            height: 33.33%;
            // background: rgba(13, 24, 54, 1 0.1);
            margin: 0 auto 10px;
            // background-image: url("../../../assets/images/frame.png");
            // background-size: 100% 100%;
            // left: 2%;
        }

        .left,
        .right {
            position: absolute;
            // width: 20%;
            // height: 80%;
            top: 10%;
            transition: all 1s;
            background-image: linear-gradient(to right, rgba(17, 27, 40, 0), rgba(17, 27, 40, 0.3) 20%, rgba(17, 27, 40, 0.55));
            padding: 0 1%;

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

        .right {
            right: 3%;
            background-image: linear-gradient(to right, rgba(17, 27, 40, .55), rgba(17, 27, 40, 0.3) 80%, rgba(17, 27, 40, 0));
        }
    }
</style>