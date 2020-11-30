<template>
    <div class="test">
        <Button @click="click">测试声音</Button>
        <audio autoplay id="audio_id"></audio>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue
    } from "vue-property-decorator";
    import request from '@/util/request'

    @Component({})
    export default class Test extends Vue {
        click() {
            console.log("开始测试")
            request({
                url: 'alarm_voice/intercom',
                method: 'get',
                responseType: 'arraybuffer',
            }).then((res: any) => {
                document.getElementById("audio_id").setAttribute("src", "data:audio/wav;base64," + btoa(
                    new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(
                        byte), "")))
            })
        }
    }
</script>

<style lang="less">
    .test {
        width: 100%;
        height: 100%;
    }
</style>