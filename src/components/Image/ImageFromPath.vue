<template>
    <div class="img-wrap">
        <img style="width:100%; height:100%;" :src="imgSrc" v-if="imgShowFlag" @dblclick="dbImage = true">
        <Modal v-model="dbImage" width="50%"  footer-hide class="en-large">
            <img style="width:100%; height:100%;z-index: 9999" :src="imgSrc" v-if="imgShowFlag">
        </Modal>
    </div>
</template>

<script lang="ts">
    import request from '@/util/request'
    import {
        Component,
        Vue,
        Prop,
        Watch
    } from "vue-property-decorator"

    @Component({})
    export default class ImageFromPath extends Vue {

        @Prop({
            required: true,
            type: String
        }) path: string

        @Watch('path', {
            immediate: true
        })
        onPathChange(val: any, oldVal: any) {
            this.loadFile()
        }

        imgSrc: string = ''
        imgShowFlag: boolean = false
        /** 后端访问地址 */
        url: string = '/file'
        dbImage: boolean = false

        // mounted() {
        //     this.loadFile();
        // }

        loadFile() {
            let _this = this
            if (this.path.length > 0) {
                request({
                    url: this.url,
                    method: 'post',
                    data: {
                        path: this.path
                    },
                    responseType: 'arraybuffer'
                }).then((response: any) => {

                    _this.imgSrc = "data:image/jpeg;base64," + btoa(new Uint8Array(response.data)
                        .reduce((data, byte) => data + String.fromCharCode(byte), ""))
                    _this.imgShowFlag = true

                })
            }

        }

    };
</script>

<style scoped>
.img-wrap {
    height: 100%;
}
</style>
<style lang="less">
    .en-large {
        .ivu-modal-wrap {
            z-index: 6666 !important;
        }
    }
</style>