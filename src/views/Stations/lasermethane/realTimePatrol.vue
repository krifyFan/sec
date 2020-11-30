<template>
    <div class="patrol-content-wrap">
        <div class="modular-title">实时巡检</div>
        <div class="patrol-status-wrap">
            <div>当前路线：{{currentLine}}</div>
            <div>当前点位：{{currentPoint}}</div>
            <div>巡检进度：{{progress}}</div>
            <div>实时状态：
                <img :src="alarmNormal" alt="正常" v-if="alarmList.length === 0">
                <img :src="alarm" alt="告警" class="alarm-icon" v-else @click="soundlightalarm()">
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import {
        Component,
        Vue,
        Watch,
        Prop
    } from "vue-property-decorator"
    import { getPatrol, soundlightalarm } from '@/api/lasermethane'
    @Component({})
    export default class LaserMethanePage extends Vue {
        @Prop({
            required: false,
            type: Number,
        })objectId

        currentLine: string = '路线1'
        currentPoint: string = '点位1'
        progress: number| string = 0
        patrolAllProgress: number = 200
        prtrolCurProgress: number = 22
        alarmList: any[] = []

        alarm: string = require('@/assets/images/patrol-alarm.png')
        alarmNormal: string = require('@/assets/images/patrol-alarm-normal.png')

        @Watch('objectId')
        watchObjectId(newVal: number) {
            this.getPatrol(newVal)
        }

        mounted() {
            this.getPatrol(this.objectId)
        }

        getPatrol(id: number) {
            getPatrol(id).then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    if (data.schedule === null) {
                        this.currentLine = '暂无'
                    } else {
                        this.currentLine = data.schedule.name
                    }
                    if (data.pointId === null) {
                        this.currentPoint = '暂无'
                        this.progress = '暂无'
                    } else {
                        let param = JSON.parse(data.schedule.param)
                        this.progress = `${data.pointId} / ${param.length}`
                        param.every(item => {
                            if (item.id === data.pointId) {
                                this.currentPoint = item.name
                            }
                        })
                    }
                }
            })
        }

        soundlightalarm() {
            let params = {
                objectId: 0,
                cv: false,
                time: new Date().getTime()
            }
            soundlightalarm(params).then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    this.$Message.success('关闭成功')
                    this.alarmList = []
                } else {
                    this.$Message.error('关闭失败')
                }
            })
        }

    }
</script>
<style lang="less" scoped>
.patrol-status-wrap {
    display: flex;
    flex-direction: column;
    div {
        flex: 1;
        letter-spacing: 0.2em;
        margin-left: 10px;
        img {
            width: 1.7rem;
            vertical-align: bottom;
            &.alarm-icon {
                cursor: pointer;
            }
        }
    }
}
</style>