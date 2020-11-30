<template>
    <div class="timeScale">
        <el-slider v-model="timeScope" range :marks="tick" :min="0" :max="1440" :format-tooltip="computedTooltip" />
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
        Prop,
        Watch
    } from "vue-property-decorator"

    @Component({})
    export default class extends Vue {

        @Prop({
            default: () => {
                return {
                    beginTime: 0,
                    endTime: 1440
                }
            }
        }) Time: any

        get timeScope() {
            return [this.Time.beginTime, this.Time.endTime]
        }
        set timeScope(val: number[]) {
            let [beginTime, endTime] = val

            let {
                Time
            } = this
            Time.beginTime = beginTime
            Time.endTime = endTime
        }

        get tick() {
            let obj = {}

            for (let i = 0; i <= 6; i++) { // 刻度
                obj[i * 4 * 60] = {
                    style: i === 6 ? {
                        color: '#000',
                        right: '-15px'
                    } : {
                        color: '#000'
                    },
                    label: this.$createElement('strong', `${i * 4}`)
                }
            }
       
            return obj
        }

        mounted() {
            this.changeChildrenStyle()
        }

        computedTooltip(val: number) { // 时间
            let str = `${Math.round(val / 60)} : `

            let newVal = (val % 60)
            if (newVal === 0) {
                str += '00'
            } else if (newVal.toString().length === 1) {
                str += `0${newVal}`
            } else {
                str += `${newVal}`
            }
            return str
        }

        changeChildrenStyle() {
            // 动态该表tick样式
            this.$nextTick(() => {
                let $childCount: number = document.querySelector('.el-dialog__body').childElementCount
                
                for (let i = 0; i < $childCount; i++) {
                    let curChild: any = document.querySelector(`.block_${i} .el-slider__marks`).lastChild
                    curChild.style.left = 'unset'
                }

            })

        }
    }
</script>

<style lang="less">
    .timeScale {
        width: 100%;
        height: 100%;

        .el-slider__marks {

            .el-slider__marks-text {
                // right: unset !important;
            }
        }
    }
</style>