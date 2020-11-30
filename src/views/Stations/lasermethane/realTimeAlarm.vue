<template>
    <div class="real_time_alarm">
        <div class="titleClass">
            <div class="modular-title">实时告警</div>
        </div>
        <ScrollBoard :config="config" style="width:100%;height:90%;"></ScrollBoard>
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
    import {
        dateFormat
    } from "@/util/common";
    import ScrollBoard from "@/components/scrollBoard/scrollBoard.vue";
    import {
        getDate,
        getTime
    } from "@/api/date";
    // import Title from './title.vue'

    @Component({
        components: {
            ScrollBoard,
            // Title
        },
    })
    export default class RealTimeAlarm extends Vue {
        list: Alarm[] = [];
        config: any = {
            data: [],
        };

        mounted() {
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
            };

            getAlarmsByCondition(vo).then((res: any) => {
                if (res.data.code != 200) return;

                this.list = res.data.data.content;

                this.config = {
                    data: this.list.map((item, index) => {
                        return [new Date(item.timeStamp).format("MM-dd hh:mm"), 
                        item.stationName,
                            // item.alarmType.name
                        ];
                    }),
                    align: ["center", "center"],
                    rowNum: 6,
                    header: ['告警时间', '告警类型']
                };
            });
        }
    }
</script>

<style lang="less" scoped>
    .real_time_alarm {
        height: 100%;

        .titleClass {
            width: 100%;
            height: 10%;
        }
    }
</style>