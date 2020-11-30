<template>
    <div class="patrolClass">
        <h4>
            自动巡检
        </h4>
        <Table :columns="columns" :data="patrols" height="330">
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
        Watch
    } from "vue-property-decorator";
    import {
        getPatrolByStation,
        startPatrol,
        stopPatrol
    } from '@/api/schedule'
    import {
        SchedulePatrol
    } from '@/types/schedule.interface'

    @Component({})
    export default class AlarmStatistics extends Vue {

        columns: any[] = [{
                title: "视频",
                key: "objectName",
                // width: 60,
            },
            {
                title: "巡检路线",
                key: "name",
                width: 70,
            },
            {
                title: "间隔(分钟)",
                key: "interval",
                width: 60,
                align: 'center'
            },
            {
                title: "手动操作",
                slot: "option",
                width: 120,
                align: 'center'
            }
        ]

        patrols: SchedulePatrol[] = []

        stationId: number = 0

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

        startPatrol(item: SchedulePatrol) {
            startPatrol(item.id).then(res => {
                if (res.data.code == 200) {
                    this.$Message.success("开始成功！")
                } else {
                    this.$Message.warning("开始失败！")
                }
            }).catch(err => {
                this.$Message.warning("开始失败！" + err)
            })
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
    @import "~@/assets/commonCss.less";

    .patrolClass {
        height: 100%;

        h4 {
            .componentTitleStyle();
        }

        .ivu-table-wrapper {
            border: none;
            position: inherit !important;
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

            &:before,
            &:after {
                background-color: transparent
            }
        }

        .ivu-table-cell {
            padding-left: 0;
            padding-right: 0;
        }
    }
</style>