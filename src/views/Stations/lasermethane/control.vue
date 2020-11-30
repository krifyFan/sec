<template>
    <div class="control_box methane_control_box">
        <div class="modular-title">云台旋转</div>
        <div class="control">
            <span
                class="opera_btn add_btn"
                @mousedown="ptzTurn(4)"
                @mouseup="ptzStop"
            ></span>
            <span
                class="opera_btn reduce_btn"
                @mousedown="ptzTurn(5)"
                @mouseup="ptzStop"
            ></span>
            <span
                class="opera_btn wiper_on"
                @mousedown="ptzTurn(12)"
                        @mouseup="ptzStop"
            ></span>
            <span
                class="opera_btn wiper_off"
                @mousedown="ptzTurn(12)"
                @mouseup="ptzStop"
            ></span>
            <ul class="circle_control">
                <!-- 上 -->
                <li
                    class="circle_item item_top"
                    @mousedown="ptzTurn(0)"
                    @mouseup="ptzStop"
                >
                    <span class="opera_icon top_icon"></span>
                </li>
                <!-- 右 -->
                <li
                    class="circle_item item_right"
                    @mousedown="ptzTurn(3)"
                    @mouseup="ptzStop"
                >
                    <span class="opera_icon right_icon"></span>
                </li>
                <!-- 下 -->
                <li
                    class="circle_item item_bottom"
                    @mousedown="ptzTurn(1)"
                    @mouseup="ptzStop"
                >
                    <span class="opera_icon bottom_icon"></span>
                </li>
                <!-- 左 -->
                <li
                    class="circle_item item_left"
                    @mousedown="ptzTurn(2)"
                    @mouseup="ptzStop"
                >
                    <span class="opera_icon left_icon"></span>
                </li>
                <!-- 中 -->
                <li class="item_center" @click="ptzStop">
                    <span class="center_icon"></span>
                </li>
            </ul>
        </div>
        <div class="slider">
            <el-slider v-model="speedValue" @change="changeSpeed" :min="1" :max="7"></el-slider>
        </div>
        <div class="selected_box">
            <div class="tit">预置点</div>
            <div class="preset_positions">
                <el-select v-model="selectedValue" placeholder="请选择">
                    <el-option v-for="item in presetList" :key="item.value" :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </div>
        </div>
        <div class="btn_box">
            <div class="setting btn" @click="setPreset(selectedValue)">
                设置
            </div>
            <div class="jump btn" @click="goPreset(selectedValue)">
                跳转
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import {
        Component,
        Vue,
        Watch,
        Prop,
        Emit
    } from "vue-property-decorator"
    @Component({})
    export default class control extends Vue {
        // @Prop({
        //     required: true    
        // })videoBoxRef: HTMLFormElement;
        
        speedValue: 10

        selectedValue: number = 0

        presetList: any[] = [
            {
                value: "1",
                label: "1",
            },
            {
                value: "2",
                label: "2",
            },
            {
                value: "3",
                label: "3",
            },
            {
                value: "4",
                label: "4",
            },
            {
                value: "5",
                label: "5",
            },
        ]
       
       @Emit()
        emitSpeed(speed: number) {}

        $refs: {
            videoBoxRef: HTMLFormElement;
        }
        
        // 向上、下、左、右
        // @Emit()
        ptzTurn(direction) {
            this.$parent.ptzTurn(direction)
        }
        // 停止
        ptzStop() {
            // this.videoBoxRef.ptzStop();
        }

        // 设置
        setPreset(iPreset) {
            if (!iPreset) {
                return;
            }
            // this.videoBoxRef.setPreset(iPreset);
        }

        // 跳转
        goPreset(iPreset) {
            // this.videoBoxRef.goPreset(iPreset);
        }

        // 速度
        changeSpeed(value) {
            this.emitSpeed(this.speedValue)
        }

    }
</script>
<style lang="less" scoped>
.methane_control_box {
    .control {
        margin-top: 20%;
        
    }
    .center_icon {
        background: url("../../../assets/images/control_center.png") no-repeat;
        background-size: 100% 100%;
    }
    .top_icon {
        background: url("../../../assets/images/control_top.png") no-repeat;
        background-size: 100% 100%;
    }
    .right_icon {
        background: url("../../../assets/images/control_right.png") no-repeat;
        background-size: 100% 100%;
    }
    .bottom_icon {
        background: url("../../../assets/images/control_bottom.png") no-repeat;
        background-size: 100% 100%;
    }
    .left_icon {
        background: url("../../../assets/images/control_left.png") no-repeat;
        background-size: 100% 100%;
    }
    .add_btn {
        background: url("../../../assets/images/add_btn.png") no-repeat;
        background-size: 100% 100%;
        right: 50px !important;
        top: 10px !important;
    }
    
    .reduce_btn {
        background: url("../../../assets/images/reduce_btn.png") no-repeat;
        background-size: 100% 100%;
        right: 0px !important;
        top: 10px !important;
    }
    .wiper_on {
        background: url("../../../assets/images/wiper-on.png") no-repeat;
        background-size: 100% 100%;
        right: 50px !important;
        top: 80px !important;
    }
    .wiper_off {
        background: url("../../../assets/images/wiper-off.png") no-repeat;
        background-size: 100% 100%;
        right: 0px !important;
        top: 80px !important;
    }
    .slider {
        width: 70%;
        margin: 0 auto;
        height: 50px;
        line-height: 50px;
        margin-top: 20px;
    }
    .btn_box {
        margin-bottom: 20px;
    }
}
</style>