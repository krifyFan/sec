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
                    <span @click="getCurrentMenu(item, index)" class="station-name" :class="currentIndex === index ? 'activeMenu': ''">
                        {{item.name}}
                    </span>
                </div>
                <Child v-if="scope[index]" ref="menuLeaf" :data="item.children" @on-choosed="getMenu" />
            </li>
        </ul>
    </div>
</template>
<script lang="ts">
import { timers } from 'jquery';
    import { Component, Vue, Prop, Emit, Watch } from "vue-property-decorator";
    import Child from './alarmQueryTree.vue'

    @Component({
        name: "Child"
    })
    export default class alarmQueryTree extends Vue {

        @Prop({
            required: true,
            type: Array
        })data ? : any[]

        @Prop({
            required: false,
            type: Array,
            default: () => {
                return []
            }
        })scope: boolean[]

        @Watch('data', { deep: true })
        watchChild(newVal, oldVal) {
            console.log('newVal', newVal)
        }

        @Emit('on-choosed')
        sendId(videoObj) {}

        @Emit('change-show')
        changeShow(item) {}

        currentIndex: number = 0

        mounted() {
            this.getCurrentMenu(this.data[0], 0)
        }

        getCurrentMenu(item, index) {
            if (!item.children) {
                this.sendId(item)
            } else {
                this.$set(this.scope, index, !this.scope[index]);
            }
            this.currentIndex = index
        }

        getMenu(menu) {
            this.sendId(menu)
        }


        hiddenMenu(item) {
            this.changeShow(item)
        }

    }
</script>
<style lang="less" scoped>
    ul {
        position: relative;
        margin-left: 15px;

        li {
            list-style: none;
            cursor: pointer;
        }
    }

    .activeMenu {
        color: #25a2b5;
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