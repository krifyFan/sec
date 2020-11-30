<template>
    <div class="AlarmImageClass">
        <div v-if="showType == 1" class="ImageClass"></div>
        <div v-else-if="showType == 2" class="ImageClass">
            <image-from-path :path="imagePaths[0]">
            </image-from-path>
        </div>
        <div v-else-if="showType == 3" class="ImageClass">
            <el-carousel style="height:100%;width:100%;">
                <el-carousel-item v-for="item in imagePaths" :key="item">
                    <image-from-path :path="item"></image-from-path>
                </el-carousel-item>
            </el-carousel>
        </div>
        <div class="TextClass">
            <span>{{curAlarmTime}}</span>
            <span style="position:absolute;right: 0;">{{curPeople}}</span>
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
    import {
        Card
    } from "@/types/intercom.interface";


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

        @Prop({
            required: true,
            type: Array
        }) cards: Card[]

        @Watch('alarm', {
            deep: true
        })
        onAlarmChange(val: any, oldVal: any) {
            console.log("vall", val, "oldVal", oldVal)
            this.initData()
        }

        @Watch('cards', {
            deep: true
        })
        onCardsChange(val: any, oldVal: any) {
            this.findCurPeople()
        }

        imagePaths: string[] = []
        /** 显示类型 1：空白 2：单独一张图 3：多图 */
        showType: number = 1

        curPeople: string = ''
        curAlarmTime: string = ''

        mounted() {
            this.initData()
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
            }).catch(err => {
                this.showType = 1
            }).finally(() => {
                // console.log("alarm imagepaths", this.alarm.id, this.showType, this.imagePaths)
            })

            setTimeout(()=>{
                this.findCurPeople()
            }, 300)
        }

        findCurPeople() {
            this.curAlarmTime = new Date(this.alarm.timeStamp).format("MM-dd hh:mm:ss")

            let start: number = this.alarm.description.indexOf("工号")

            if (start > -1) {
                let cardNo:string = this.alarm.source

                let cardItem = this.cards.find(card=>{
                    return card.employeeNo == cardNo
                })

                this.curPeople = cardItem !== undefined ? cardItem.name : '等待读入'

            } else {
                this.curPeople = "查无此人"
            }
        }
    }
</script>

<style lang="less" scoped>
    .AlarmImageClass {
        height: 100%;
        width: 100%;

        .el-carousel,
        .el-carousel--horizontal {
            .el-carousel__container {
                height: 100% !important;
            }
        }

        .ImageClass {
            width: 100%;
            height: 90%;
            background: #aaaaaa38;
        }

        .TextClass {
            width: 100%;
            height: 10%;
            font-size: 12px;
            position: relative;
        }
    }
</style>