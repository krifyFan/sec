<template>
    <div class="real_time_alarm">
        <h4>
            实时告警
        </h4>
        <div class="scroll">
            <ScrollBoard :config="config" style="width:100%;height:80%;"></ScrollBoard>
        </div>
    </div>
</template>
<script lang="ts">
    import {
        Component,
        Vue
    } from "vue-property-decorator";
    import {
        Alarm,
        AlarmVo
    } from "@/types/alarm.interface";
    import {
        getAlarmsByCondition
    } from "@/api/alarm";
    import ScrollBoard from "@/components/scrollBoard/scrollBoard.vue";
    import {
        getDate,
        getTime
    } from "@/api/date";

    @Component({
        components: {
            ScrollBoard,
        },
    })
    export default class RealTimeAlarm extends Vue {
        stationId: number = 0;
        list: Alarm[] = [];
        // 对象类型 -- 周界入侵
        objectTypeId: number = 3;
        config: any = {
            data: [],
        };

        mounted() {
            this.stationId = this.$store.state.stationId;

            this.init();
            this.refresh()
        }

        refresh() {
            const timer = setInterval(() => {
                this.init()
            }, this.ProjectConfig.DataRefreshTime);
            this.$once('hook:beforeDestroy', () => {
                clearInterval(timer);
            })
        }

        init() {
            let vo: AlarmVo = {
                pageNum: 1,
                pageSize: 20,
                type: this.objectTypeId,
                stationId: this.stationId,
            };

            getAlarmsByCondition(vo).then((res: any) => {
                if (res.data.code != 200) return;

                this.list = res.data.data.content;
                // var dataRes = getDate("-") + getTime();
                this.config = {
                    data: this.list.map((item, index) => {
                        return [new Date(item.timeStamp).format("MM-dd hh:mm"), item.stationName,
                            item.alarmType.name
                        ];
                    }),
                    align: ["center", "center", "center"],
                    rowNum: 9,
                };
            });
        }
    }
</script>
<style lang="less">
    @import "~@/assets/commonCss.less";

    .real_time_alarm {
        height: 100%;

        .scroll {
            width: 100%;
            // height: 220px;
            height: 100%;
        }

        h4 {
            .componentTitleStyle();
        }

        .dv-scroll-board {
            width: 100%;
            height: 230px;

            .rows {
                .row-item {
                    background-color: transparent !important;
                }
            }
        }
    }
</style>