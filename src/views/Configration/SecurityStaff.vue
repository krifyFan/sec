<template>
    <div class="security_staff">
        <h4>
            保安页面配置
        </h4>
        <div class="condition">
            <div style="display:inline">
                <span class="sp">所属场站： </span>
                <el-select size="mini" v-model="curStationId" placeholder="请选择" @change="stationChange">
                    <el-option v-for="item in stations" :key="`${item.id}`" :label="item.name" :value="item.id">
                    </el-option>
                </el-select>
            </div>
            <div style="display:inline">
                <span class="sp">选择展示个数：</span>
                <el-select size="mini" v-model="securityStaffConfig.heightNum" placeholder="请选择" @change="numChange">
                    <el-option v-for="item in 5" :key="item" :value="item">
                    </el-option>
                </el-select>
                <span class="sp">x </span>
                <el-select size="mini" v-model="securityStaffConfig.widthNum" placeholder="请选择" @change="numChange">
                    <el-option v-for="item in 5" :key="item" :value="item">
                    </el-option>
                </el-select>
                <el-button class="submitBtn" size="mini" @click="submitSecurityStaffConfig">确认</el-button>
            </div>
        </div>
        <div class="securityStaffConfigClass">


            <div class="modules" v-for="(videoId, index) in securityStaffConfig.videoIds" :key="index"
                :style="moduleStyle(index)">
                <el-select size="mini" v-model="securityStaffConfig.videoIds[index]" placeholder="请选择">
                    <el-option v-for="item in selectVideos" :key="item.id" :value="item.id" :label="item.name">
                    </el-option>
                </el-select>
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
        SecurityStaffConfig,
        InterfaceTypeEnum
    } from "@/types/interfaceconfig.interface";
    import {
        Station
    } from "@/types/station.interface";
    import translate, {
        deepCopy
    } from "@/util/common.ts";
    import {
        getSecurityStaffDefaultConfig,
        getConfigs,
        updateConfig,
    } from "@/api/interfaceconfig";
    import {
        getVideoDtosByStation,
        getVideoDtos,
        getVideoDto
    } from "@/api/video";
    import {
        Video,
        VideoVo
    } from "@/types/video.interface";

    import {
        getStations
    } from "@/api/station";
    import {
        ModalConfig
    } from "iview";

    const defaultWidth = 1670;
    const defaultHeight = 610;

    @Component({
        components: {},
        filters: {},
    })
    export default class SecurityStaff extends Vue {
        /** 当前编辑的场站 */
        curStationId: number = 0;
        stations: Station[] = [];

        itemHeight: number = 200;

        /** 后端存储的页面配置 */
        interfaceConfigs: InterfaceConfig[] = [];
        interfaceConfig: InterfaceConfig = this.getDefaultInterfaceConfig(null)

        /** 获取/修改的配置 */
        securityStaffConfig: SecurityStaffConfig = getSecurityStaffDefaultConfig()

        // 默认宽高
        defaultWidth: number = 1200;
        defaultHeight: number = 510;

        videos: Video[] = [];
        selectVideos: Video[] = []

        // computed
        get moduleStyle() {
            return function (index: number) {
                let x = (index % this.securityStaffConfig.widthNum) * (100 / this.securityStaffConfig.widthNum)
                let y = (Math.floor(index / this.securityStaffConfig.widthNum)) * (100 / this.securityStaffConfig
                    .heightNum)
                return {
                    width: `${100/this.securityStaffConfig.widthNum}%`,
                    height: `${100/this.securityStaffConfig.heightNum}%`,
                    left: `${x}%`,
                    top: `${y}%`,
                };
            };
        }


        created() {
            this.initData();
        }

        initData() {
            Promise.all([getStations(), getConfigs(), getVideoDtos()]).then((res: any) => {
                if (res[0].data.code == 200) {
                    this.stations = res[0].data.data;
                    this.curStationId = this.stations[0].id
                }

                if (res[1].data.code == 200) {
                    this.interfaceConfigs = res[1].data.data;
                }

                if (res[2].data.code == 200) {
                    this.videos = res[2].data.data;
                    this.videos.sort((a, b) => {
                        return a.id - b.id
                    })
                }

                this.stationChange()

                console.log("所有场站", this.stations);
                console.log("当前场站", this.curStationId);
                console.log("interfaceConfigs", this.interfaceConfigs);
                console.log("interfaceConfig", this.interfaceConfig);
                console.log("securityStaffConfig", this.securityStaffConfig);
            });
        }

        /** 场站改变 */
        stationChange() {
            let tmpStationIndex: number = this.stations.findIndex(
                (station: Station) => station.id == this.curStationId
            );
            let tmpStation: Station = this.stations[tmpStationIndex];

            let tmpIndex: number = this.interfaceConfigs.findIndex(
                (config: InterfaceConfig) =>
                config.stationId == this.curStationId && config.type == InterfaceTypeEnum.保安页面
            );

            this.interfaceConfig = tmpIndex >= 0 ? this.interfaceConfigs[tmpIndex] : this.getDefaultInterfaceConfig(
                tmpStation);

            this.securityStaffConfig = JSON.parse(this.interfaceConfig.param);

            // 可选相机的改变
            this.selectVideos.length = 0
            this.selectVideos.push({
                id: 0,
                name: "无"
            })
            this.videos.forEach(v => {
                if (v.stationId == this.curStationId) this.selectVideos.push(v)
            })
        }

        getDefaultInterfaceConfig(station: Station | null): InterfaceConfig {
            return {
                name: (station ? station.name : "") + "保安配置页面",
                stationId: station ? station.id : 0,
                type: InterfaceTypeEnum.保安页面,
                param: JSON.stringify(getSecurityStaffDefaultConfig()),
            };
        }

        numChange() {

            let totalNum: number = this.securityStaffConfig.widthNum * this.securityStaffConfig.heightNum;
            this.securityStaffConfig.videoIds.length = totalNum;
            console.log("this.securityStaffConfig.videoIds", this.securityStaffConfig.videoIds)
            for (let i = 0; i < totalNum; i++) {
                if (!this.securityStaffConfig.videoIds[i]) this.securityStaffConfig.videoIds[i] = 0
            }
        }

        videoChange(v, index) {

        }

        submitSecurityStaffConfig() {

            this.interfaceConfig.param = JSON.stringify(this.securityStaffConfig);

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
    }
</script>

<style lang="less" scoped>
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

    .sp {
        .span();
    }

    .security_staff {
        width: 100%;
        height: 100%;
    }

    .SecurityStaffVideo {
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

    .securityStaffConfigClass {
        position: relative;
        width: 100%;
        height: 90%;
        border: 1px solid;
        margin-top: 0.5%;

        .modules {
            position: absolute;
            text-align: center;
            border: 1px solid;
        }
    }
</style>