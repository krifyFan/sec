<template>
    <div class="AlarmImageClass">
        <div v-if="showType == 1" class="ImageClass class1">暂无照片</div>
        <div v-if="showType == 2" class="ImageClass class2">
            <image-from-path :path="imagePaths[0]">
            </image-from-path>
        </div>
        <div class="ImageClass class3">
            <el-carousel style="height:100%;width:100%;">
                <el-carousel-item v-for="item in imagePaths" :key="item">
                    <image-from-path :path="item"></image-from-path>
                </el-carousel-item>
            </el-carousel>
        </div>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
        Prop,
        Watch
    } from "vue-property-decorator"
    import ImageFromPath from '@/components/Image/ImageFromPath.vue'
    import {
        Alarm
    } from "@/types/alarm.interface"
    import {
        getImagePathOfAlarm
    } from '@/api/alarm'

    @Component({
        components: {
            ImageFromPath
        }
    })
    export default class AlarmImage extends Vue {
        @Prop({
            required: true,
            type: Object
        }) alarm: Alarm

        @Watch('alarm', {
            deep: true,
            immediate: true
        })
        onAlarmChange(val: any, oldVal: any) {
            this.initData()
        }

        imagePaths: string[] = []
        /** 显示类型 1：空白 2：单独一张图 3：多图 */
        showType: number = 1

        mounted() {
            // console.log("mouted", this.alarm)
            // this.initData()
        }

        initData() {

            if (!this.alarm || this.alarm.id == 0) return

            getImagePathOfAlarm(this.alarm.id).then((res: any) => {
                if (res.data.code == 200) {
                    this.imagePaths = res.data.data
                    this.showType = this.imagePaths.length == 0 ? 1 : (this.imagePaths.length == 1 ? 2 : 3)
                } else {
                    this.showType = 1
                }
            })
            .catch(err => {
                this.showType = 1
            }).finally(() => {
                console.log("alarm imagepaths", this.alarm.id, this.showType, this.imagePaths)
            })                                                                                                                                                  
            
        }
    }
</script>

<style lang="less">
    .AlarmImageClass {
        height: 100%;
        width: 100%;
        background-color: transparent;
        overflow: hidden;

        .el-carousel,
        .el-carousel--horizontal {
            .el-carousel__container {
                height: 100% !important;
            }
        }

        .ImageClass {
            width: 100%;
            height: 100%;
            background-color: #AAA;
        }
    }
</style>