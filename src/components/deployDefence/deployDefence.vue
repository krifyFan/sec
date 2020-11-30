<template>
    <div>
        <el-dialog title="布防时间" class="defence-modal" :visible.sync="deployVisible" :close-on-click-modal="false" :show-close="false">
            <div :class="['block',`block_${i}`]" v-for="(item, i) in defaultDeployTime" :key="`${item.id}${i}`">
                <span class="demonstration" v-html="`${computeDate(item.weekDay)}`" />
                <TimeScale class="slider" :Time="item" />
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancle">取 消</el-button>
                <el-button type="primary" @click="submit">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
        Prop,
        Watch,
        Emit
    } from "vue-property-decorator";
    import TimeScale from './components/timeScale/index.vue'
    import {
        getDeployTime,
        addDeployTime
    } from '@/api/station'

    @Component({
        components: {
            TimeScale
        }
    })
    export default class extends Vue {

        @Prop({
            required: true
        })
        deployId!: number

        @Prop({
            required: true,
            default: false
        })
        deployVisible!: boolean

        defaultDeployTime: any[] = []
        defultDate: any = [
        {
            key: 0,
            val: '星期日'
        },{
            key: 1,
            val: '星期一'
        }, {
            key: 2,
            val: '星期二'
        }, {
            key: 3,
            val: '星期三'
        }, {
            key: 4,
            val: '星期四'
        }, {
            key: 5,
            val: '星期五'
        }, {
            key: 6,
            val: '星期六'
        } ]

        get computeDate() {
            return function(dateType) {
                let [curDate] = this.defultDate.filter((data: any) => data.key === dateType)
                return curDate.val
            }
        }

        @Watch('deployId')
        changeDeployId() {
            this.getDefaultDeployTime()
        }

        @Emit('changeModalState')
        closeModal(state: boolean) {}

        mounted() {

        }

        async getDefaultDeployTime() {

            let { data: { data, code } } = await getDeployTime(this.deployId)

            if (code === 200) {

                if (data.length) {
                    data.forEach((item: any, index: number) => {
                        let beginTime = new Date(item.beginTime).getHours() * 60 + new Date(item.beginTime).getMinutes() // 开始时间
                        let endTime = new Date(item.endTime).getHours() * 60 + new Date(item.endTime).getMinutes() // 结束时间

                        Object.assign(item, {
                            beginTime,
                            endTime
                        })
                    })
                } else {
                    // 没数据时，默认数据
                    for (var i = 0; i < 7; i++) {
                        data.push({
                            weekDay: i,
                            beginTime: 0,
                            endTime: 1440
                        })
                    }
                }

                let temp = data[0]
                let arr = data.slice(1)               
                arr.push(temp)
                this.defaultDeployTime = arr
            }

        }

        cancle() {
            this.closeModal(false)
        }

        submit() {
            let {
                deployId,
                defaultDeployTime
            } = this
            let curDeployTime = []

            defaultDeployTime.forEach((item: any) => {
                curDeployTime.push({
                    weekDay: item.weekDay,
                    beginTime: this.tarnsform(item.beginTime),
                    endTime: this.tarnsform(item.endTime)
                })
            })

            addDeployTime(deployId, curDeployTime).then((res: any) => {
                if (res.data.code === 200) {
                    this.$Message.info("添加成功！");
                } else {
                    this.$Message.error("添加失败！！！");
                }
            })

            this.closeModal(false)
        }

        tarnsform(data: number) {
            let curDate = new Date()

            curDate.setHours(data / 60)
            return curDate.setMinutes(data % 60)
        }
    }
</script>
<style lang="less">
    .block {
        padding: .41rem 1.5rem;
        // overflow: hidden;
        // border-bottom: 1px solid #eff2f6;

        .demonstration {
            font-size: 14px;
            color: #8492a6;
            line-height: 44px;
        }

        .slider {
            float: right;
            width: 85%;
            margin-right: 20px;
            .el-slider__marks {
                .el-slider__marks-text {
                    color: #ffffff !important;
                    // right: -20px !important;
                }
            }
        }
    }

    .el-dialog__title {
        color: #ffffff;
    }

    .defence-modal {
        .el-dialog__body {
            height: auto !important;
            padding-bottom: 2rem;
        }
    }


    .el-dialog__footer {
        border: none;
    }
</style>