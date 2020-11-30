<template>
    <div class="version-info-wrap">
        <div class="logo">
            <img :src="bwLogo" alt="波汇科技有限公司">
        </div>
        <div class="verison">
            版本信息：{{versionInfo}}
        </div>
        <div class="public-time">
            发布时间：{{publicTime}}
        </div>
    </div>
</template>
<script lang="ts">
    import { Component, Vue } from "vue-property-decorator";
    import { getVersionInfo } from '@/api/versionInfo'
    @Component({})
    export default class VersionInfo extends Vue {
        bwLogo:string = require("@/assets/images/bw-logo.png")

        versionInfo:string = ''

        publicTime:string = ''

        mounted() {
            this.getVersionInfo()
        }

        getVersionInfo() {
            getVersionInfo().then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    this.versionInfo = data[0].version
                    this.publicTime = data[0].release
                }
            })
        }
    }
</script>