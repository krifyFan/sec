<template>
    <div style="position: relative">
        <!-- 带正负 -->
        <div v-if="data.isCenter" style="position: relative">
            <div class="progress-bar-wrap">
                <div 
                    class="progress-bar-container-left-wrap" 
                    :style="{'background': data.value > 0 ? '#fff0': data.bg, 
                             'border-color': data.value > 0 ? data.bg : '#fff0'
                            }"
                ></div>
                <div 
                    class="progress-bar-container-right-wrap" 
                    :style="{'background': data.value > 0 ? data.bg : '#fff0',
                             'border-color': data.value > 0 ? '#fff0' : data.bg
                            }"
                ></div>
            </div>
            <div class="progress-value-wrap" 
                :style="{'background': data.valueBG, width: (widthPer / 2).toFixed(2) + '%'}" 
                :class="data.value > 0 ? 'isRightCenter' : 'isLeftCenter'"
            >
                <div class="progress-value-container-wrap"></div>
            </div>
            <div 
                :class="data.value > 0 ? 'center-num-right' : 'center-num-left'" 
                class="center-num"
            >0</div>
        </div>
        <!-- 从左侧为0开始计数 -->
        <div v-if="!data.isCenter">
            <div class="progress-bar-wrap" :style="{'background': data.bg}">
                <div class="progress-bar-container-wrap"></div>
            </div>
            <div 
                class="progress-value-wrap" 
                :style="{'background': data.valueBG, width: widthPer + '%'}"
            >
                <div class="progress-value-container-wrap"></div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Vue, Watch } from "vue-property-decorator"

    @Component({})
    export default class RealInfo extends Vue {
        @Prop({
            required: true,
            default: {
                id: 'id',
                bg: '#8a2be2',
                valueBG: '#eeeeee',
                isCenter: true,
                value: 0
            }
        })data

        get widthPer() {
            let val = Math.abs(this.data.value)
            
            switch(true) {
                case val < 100: 
                    return val / 100 * 100 
                    break;
                case val < 1000:
                    return val / 1000 * 100
                    break;
                case val < 10000: 
                    return val / 10000 * 100
                    break;
            }
        }
    }
</script>
<style lang="less" scoped>
    .progress-bar-wrap {
        width: 100%;
        height: 20px;
        transform: skewX(-10deg);
        .progress-bar-container-left-wrap,
        .progress-bar-container-right-wrap {
            display: inline-block;
            width: 50%;
            height: 100%;
            border: 1px solid black;
        }
        .progress-bar-container-wrap {
            width: 20%;
            height: 100%;
        }
    }
    .progress-value-wrap {
        position: absolute;
        z-index: 9;
        height: 20px;
        top: 0;
        transform: skewX(-10deg);
        .progress-value-container-wrap {
            transform: skewX(10deg);
        }
    }

    .isRightCenter {
        left: 48%;
    }
    .isLeftCenter {
        right: 50%;
    }
    .center-num {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        color: #ffffff;
    }
    .center-num-right {
        right: 50%;
    }
    .center-num-left {
        left: 55%;
    }
</style>