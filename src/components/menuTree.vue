<template>
    <div class="tree">
        <ul>
            <li v-for="(item, index) in data" :key="item.id">
                <div class="station-name-wrap">
                    <Icon :type="item.level === 0 ? 'ios-analytics' : 
                            (item.level === 1 ? 'ios-leaf' : 
                            (item.level === 2) ? 'ios-infinite' : 
                            (item.children) ? 'md-flag' :
                            'ios-videocam')" size="22" class="menu-icon" />
                    <span @click="choosedVideo(item, index)" class="station-name">
                        {{item.name}}
                    </span>
                </div>
                <Child v-if="scope[index]" ref="menuLeaf" :data="item.children" @on-choosed="getVideoId" />
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
        Prop,
        Emit,
        Watch
    } from "vue-property-decorator";
    import Child from './menuTree.vue'

    @Component({
        name: "Child"
    })
    export default class menuTree extends Vue {

        @Prop({
            required: true,
            type: Array
        })
        data ? : any[]

        @Prop({
            required: false,
            type: Array,
            default: () => {
                return []
            }
        })
        scope: boolean[]

        @Watch('data', {
            deep: true
        })
        watchChild(newVal, oldVal) {
            console.log('newVal', newVal, 'oldVal', oldVal)
        }

        @Emit('on-choosed')
        sendId(videoObj) {}

        @Emit('change-show')
        changeShow(item) {}

        choosedVideo(item, index) {
            if (!item.children) {
                this.sendId(item)
            } else {
                this.$set(this.scope, index, !this.scope[index]);
            }
        }

        getVideoId(videoObj) {
            this.sendId(videoObj)
        }


        hiddenMenu(item) {
            this.changeShow(item)
        }

    }
</script>
<style lang="less">
    .station-name-wrap {
        display: block;

        .menu-icon {
            margin-right: 10px;
        }

        .down_arrow,
        .station-name {
            display: inline-block;
            vertical-align: middle;
        }

        .down_arrow {
            width: 16px;
            height: 10px;
            background: url("../assets/images/down_arrow.png") no-repeat;
            background-size: 100% 100%;
            margin-right: 5px;
        }

        .station-name {
            font-size: 16px;
            cursor: pointer;
        }
    }

    .video-name-wrap {
        li {
            font-size: 16px;
            margin-left: 40px;
            line-height: 40px;
            cursor: pointer;
        }
    }

    ul {
        position: relative;
        margin-left: 15px;

        li {
            list-style: none;
        }
    }

    .trans-enter-to {
        transition: all 2s ease;
        transform: translateY(0);
    }

    .trans-leave-active {
        transition: all 2s ease;
        transform: translateY(-100%)
    }

    .trans-enter {
        transform: translateY(100%)
    }

    .tans-leave {
        transform: translateY(0)
    }
</style>