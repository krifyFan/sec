<template>
    <div class="patrolClass">
        <h6>
            任务列表
        </h6>
        <Table :columns="columns" :data="patrols" height="548">
            <template slot-scope="{ row }" slot="option">
                <Button type="primary" size="small" @click="startPatrol(row)">
                    开始
                </Button>
                <Button type="error" size="small" @click="stopPatrol(row)">
                    结束
                </Button>
            </template>
        </Table>
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
    import {
        getPatrolByStation,
        startPatrol,
        stopPatrol
    } from '@/api/schedule'
    import {
        SchedulePatrol
    } from '@/types/schedule.interface'
    import {
        getVideoDto,
        getDefaultVideo
    } from "@/api/video";
    import {
        Video
    } from "@/types/video.interface";

    @Component({})
    export default class AlarmStatistics extends Vue {

        columns: any[] = [{
                title: "视频",
                key: "objectName",
                width: 75,
            },
            {
                title: "巡检路线",
                key: "name",
            },
            {
                title: "间隔(分钟)",
                key: "interval",
                align: "center",
                width: 60,
            },
            {
                title: "手动操作",
                slot: "option",
                align: "center",
                width: 120
            }
        ]

        patrols: SchedulePatrol[] = []

        stationId: number = 0

        @Emit('startVideo')
        startVideo(taskItem: any, video: Video) {}

        mounted() {
            this.stationId = this.$store.state.stationId
            this.init()
            this.refresh()
        }

        refresh() {
            const timer = setInterval(() => {
                this.init()
            }, this.ProjectConfig.DataRefreshTime)
            this.$once('hook:beforeDestroy', () => {
                clearInterval(timer)
            })
        }

        init() {
            getPatrolByStation(this.stationId).then(res => {
                if (res.data.code == 200) this.patrols = res.data.data
            })
        }

        async startPatrol(item: any) {
            let {
                data: {
                    code,
                    data
                }
            } = await startPatrol(item.id)

            if (code === 200) {
                this.$Message.success("开始成功！")

                let {
                    data: {
                        code,
                        data
                    }
                } = await getVideoDto(item.objectId)

                if (code === 200) {
                    this.startVideo(item, data)
                }

            } else {
                this.$Message.warning("开始失败！")
            }


        }

        stopPatrol(item: SchedulePatrol) {
            stopPatrol(item.id).then(res => {
                if (res.data.code == 200) {
                    this.$Message.success("结束成功！")
                } else {
                    this.$Message.warning("结束失败！")
                }
            }).catch(err => {
                this.$Message.warning("结束失败！" + err)
            })
        }

    }
</script>

<style lang="less">
    .patrolClass {
        height: 100%;

        h6 {
            line-height: 2rem;
            font-size: 1rem;
            color: #fff;
            font-weight: 300;
            padding-left: 1.3125rem;
            background: url(../../../assets/images/modelTitle-bg.png) no-repeat;
            background-size: 100% 100%;
        }

        .ivu-table-wrapper {
            border: none;
            position: inherit !important;
            // background: rgba(17, 27, 40, .5);
        }

        .ivu-table,
        .ivu-table th,
        .ivu-table tr,
        .ivu-table td,
        .ivu-table-row td,
        .ivu-table-header th {
            background-color: transparent;
            color: #fff;
            border: none;

            &:after,
            &:before {
                background-color: transparent;
            }
        }

        .ivu-table-cell {
            padding-left: 0;
            padding-right: 0;
        }

    }
</style>