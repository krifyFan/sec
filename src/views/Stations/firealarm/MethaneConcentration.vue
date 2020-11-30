<template>
    <div class="methane_concentration_chart">
        <!-- 甲烷浓度： -->
        <concentrationPercent
            :min="methaneMin"
            :max="methaneMax"
            :curVal="methaneCurVal"
            type="methane"
        ></concentrationPercent>
        <!-- 光强强度: -->
        <concentrationPercent
            :min="lightMin"
            :max="lightMax"
            :curVal="lightCurVal"
            type="light"
        ></concentrationPercent>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ECharts, EChartOption, EChartsSeriesType } from "echarts";
import { selectMeasObjectValsByCondition } from "@/api/measobject";
import concentrationPercent from "@/views/Stations/firealarm/concentrationPercent.vue";
import { setInterval } from "timers";

@Component({
    components: {
        concentrationPercent,
    },
})
export default class FireAlarm extends Vue {
    stationId: number;
    methaneConcentration: any; //甲烷浓度
    LightConcentration: any; //光照强度
    methaneMin: number = 0; //甲烷最小值
    methaneMax: number = 2000; //甲烷最大值
    methaneCurVal: number = 0; //甲烷当前值
    lightMin: number = 0; //光照最小值
    lightMax: number = 100000; //光照最大值
    lightCurVal: number = 0; //光照当前值
    concentrationInterval: any = 0; //定时器
    timerFlag: boolean = true;

    mounted() {
        this.stationId = this.$store.state.stationId;
        this.getMethaneConcentration();
        this.getLightConcentration();
        this.timeInterval();
    }

    timeInterval() {
        setTimeout(() => {
            if (!this.timerFlag) return;
            this.getMethaneConcentration();
            this.getLightConcentration();

            this.timeInterval();
        }, 1000);
    }

    beforeDestroy() {
        this.timerFlag = false;
    }

    // 甲烷浓度
    getMethaneConcentration() {
        let MethaneObj = {
            stationId: this.stationId,
            objectType: 4,
        };
        selectMeasObjectValsByCondition(MethaneObj).then((res) => {
            let { code, data } = res.data;
            if (code != 200) return;
            if (data.length == 0) return;
            this.methaneConcentration = data[0];
            this.methaneCurVal = this.methaneConcentration.lastValue;
        });
    }

    // 光照强度
    getLightConcentration() {
        let MethaneObj = {
            stationId: this.stationId,
            objectType: 7,
        };
        selectMeasObjectValsByCondition(MethaneObj).then((res) => {
            let { code, data } = res.data;
            if (code != 200) return;
            if (data.length == 0) return;
            this.LightConcentration = data[0];
            this.lightCurVal = this.LightConcentration.lastValue;
        });
    }
}
</script>
<style lang="less">
.methane_concentration_chart {
    height: 80%;
    padding: 5px;
    color: #fff;
    .light {
        .chart_item {
            background-color: #413a45;
            .progress {
                background-color: #ffae5c;
            }
        }
    }
}
</style>
