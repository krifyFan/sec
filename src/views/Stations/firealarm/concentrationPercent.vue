<template>
    <div :class="[type == 'light' ? 'light' : 'methane', 'concentration']">
        <span class="text item_name" v-if="type == 'methane'">甲烷浓度：</span>
        <span class="text item_name" v-if="type == 'light'">光照强度：</span>
        <!-- <span class="text item_name">甲烷浓度：</span> -->
        <div class="chart_item">
            <span
                class="progress"
                id="methaneId"
                :style="'width:' + percent"
            ></span>
        </div>
        <span class="text item_value" v-if="type == 'methane'">
            {{ curVal }} ppm·m
        </span>
        <span class="text item_value" v-if="type == 'light'">
            {{ curVal }}
        </span>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { ECharts, EChartOption, EChartsSeriesType } from "echarts";

@Component({
    components: {},
})
export default class concentrationPercent extends Vue {
    @Prop({
        required: false,
        default: 0,
    })
    min: number;

    @Prop({
        required: false,
        default: "",
    })
    max: number;

    @Prop({
        required: true,
        default: 0,
    })
    curVal: number;

    @Prop({
        required: true,
        default: "",
    })
    type: string;

    //浓度百分比
    get percent(): string {
        if (this.curVal < this.min) this.curVal = this.min;
        if (this.curVal > this.max) this.curVal = this.max;

        return ((this.curVal - this.min) * 100) / (this.max - this.min) + "%";
    }

    mounted() {}
}
</script>
<style lang="less">
.concentration {
    height: 25%;
    overflow: hidden;
    line-height: 100%;
    margin-top: 7%;

    .text {
        font-size: 14px;
        color: #ffff;
        float: left;
    }
    .chart_item {
        width: 42%;
        height: 15px;
        background-color: #184565;
        float: left;
        margin-right: 5px;
        position: relative;
        top: 25%;
        transform: skewX(140deg);
        .progress {
            display: block;
            width: 0%;
            height: 100%;
            background-color: #36e5ff;
            position: absolute;
            left: 0;
            top: 0;
        }
    }
}
</style>
