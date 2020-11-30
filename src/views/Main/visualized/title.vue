<template>
    <div class="title-Class">
        <span>{{title}}</span>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
        Prop
    } from "vue-property-decorator";

    @Component({})
    export default class EquipmentCondition extends Vue {

        @Prop({
            required: true,
            type: String,
            default: '111'
        })
        title: string

    }
</script>

<style lang="less" scoped>
    @import "~@/assets/commonCss.less"; 
    .title-Class {
        // width: 100%;
        // height: 100%;
        // background: url(../../../assets/images/modelTitle-bg.png) no-repeat center no-repeat;
        // background-size: 140% 70%;
        // text-align: center;
        // vertical-align: middle;
        // color: #21cada;
        // font-size: 18px;
        .componentTitleStyle();
    }
</style>