<template>
    <div class="auto-cruise-wrap">
        <div class="modular-title">自动巡航</div>
        <div class="auto-cruise-content-wrap">
            <Table 
                :columns="patrolColumns" 
                :data="patrolData" 
                class="scrollbar" 
                highlight-row 
                ref="currentRowTable"
                @on-current-change="choosedCurrent"
            >
                <template slot-scope="{ row }" slot="action">
                    <Button type="info" size="small" style="margin-right: 5px" @click="patrolptzStart(row.id)">开始</Button>
                    <Button type="error" size="small" @click="patrolptzStop(row.id)">结束</Button>
                </template>
            </Table>
        </div>
        <div class="option-wrap">
            <div class="add-icon" @click="addLine()">
                <img :src="addIcon">
            </div>
            <div class="edit-icon" @click="editLine()">
                <img :src="editIcon">
            </div>
            <div class="delete-icon">
                <img :src="deleteIcon">
            </div>
        </div>
        <Modal
            v-model="isShow"
            :title="title"
            width="1000px"
        >
            <div class="cruise-line-wrap">
                <div class="left-wrap">
                    <div class="camera-wrap">
                        <div class="modular-title">摄像头</div>
                        <div class="video-wrap">
                            <VideoComponent id="autoCruise_id" ref="autoCruiseVideoRef" :video="autoCruiseVideo" :speed="speedValue"/>
                        </div>
                    </div>
                    <div class="control-wrap">
                        <div class="control_box">
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
                                <el-slider v-model="speedValue" :min="1" :max="7" @change="changeSpeed"></el-slider>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="right-wrap">
                    <Form :label-width="80" v-model="lineForm">
                        <FormItem label="巡航路线：">
                            <Input v-model="lineForm.name" />
                        </FormItem>
                        <FormItem label="间隔分钟：">
                            <Input-number :max="60" :min="0" style="width: 100%" v-model="lineForm.time"></Input-number>
                        </FormItem>
                    </Form>
                    <!-- 路线展示区 -->
                    <div class="all-item-wrap">
                        <div class="modular-title">点位信息</div>
                        <div class="item-wrap" 
                            v-for="(item, index) in lineItems" 
                            :key="`${item.name}-${index}`"
                            @click="choosedItem(index)"
                            draggable="true" 
                            ondragstart="event.dataTransfer.setData('text/plain',null)"
                            :class="{'active-item': currentIndex === index}"
                        >
                            <div class="item-info">
                                {{item.name}}—间隔时间：{{item.time}}s
                            </div>
                            <div class="item-opera">
                                <Button type="primary" size="small" @click.stop="jump(item, item.id)">跳转</Button>
                            </div>
                        </div>
                    </div>
                    <!-- 添加路线区 -->
                    <div class="add-item-wrap" v-if="isAddItem">
                        <Input class="name" v-model="item.name" placeholder="名称" />
                        <Input class="interval" v-model="item.time" placeholder="停留时间（s）" />
                        <Icon 
                            class="confirm-add" 
                            :size="22" 
                            color="#61beff" 
                            type="md-checkmark" 
                            @click="confirmAddItem()"
                        />
                    </div>
                    <!-- 添加按钮与删除按钮区 -->
                    <div class="option-wrap">
                        <div class="add-icon" @click="isAddItem = true">
                            <img :src="addIcon">
                        </div>
                        <div class="delete-icon" @click="deleteItem()">
                            <img :src="deleteIcon">
                        </div>
                    </div>
                </div>
            </div>
            <div slot="footer">
                <Button type="primary" v-if="modalType==='add'" @click="submitAddLine()">确定</Button>
                <Button type="primary" v-if="modalType==='edit'" @click="submitEditLine()">确定</Button>
            </div>
        </Modal>
    </div>
</template>
<script lang="ts">
    import { Component, Vue, Watch, Prop } from "vue-property-decorator"
    import { SchedulePatrol } from '@/types/schedule.interface'
    import { getMapping, patrolptzStart, patrolptzStop } from '@/api/lasermethane'
    import { getSchedules, editSchedules, addSchedules, deleteSchedules } from '@/api/schedule'
    import VideoComponent from "@/components/Video/CommonVideo.vue";
    import { Video } from "@/types/video.interface";
    import { getDefaultVideo } from "@/api/video";
    import { getVideoPTZ, jumpPtz } from '@/api/lasermethane'

    @Component({
        components: { VideoComponent }
    })
    export default class autoCruise extends Vue {

        @Prop({
            required: true,
            default: 1
        })videoId

        @Prop({
            required: false
        })autoCruiseVideo

        // 获取自动巡航路线
        @Watch('videoId')
        watchVideoId(newVal: number) {
            getMapping(newVal).then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    this.patrolData = data
                }
            })
        }

        patrolColumns: any[] = [
            {
                title: '巡航路线',
                key: 'name',
                align: 'center'
            },
            {
                title: '点位数',
                key: 'count',
                align: 'center'
            },
            {
                title: '间隔(分钟)',
                key: 'time',
                align: 'center',
            },
            {
                title: '手动执行',
                align: 'center',
                slot: 'action',
                width: 90
            }
        ]

        patrolData: SchedulePatrol[] = []

        stationId: number = 0

        addIcon: string = require('@/assets/add-icon.png')
        editIcon: string = require('@/assets/edit-icon.png')
        deleteIcon: string = require('@/assets/delete-icon.png')

        isShow: boolean = false 
        title: string = '添加巡航路线'

        speedValue:number = 1

        lineForm = {
            name: '',
            count: 0,
            time: 0
        }

        isAddItem: boolean = false

        lineItems = [
            // { id: 1, name: '路线1', time: 3 },
            // { id: 2, name: '路线2', time: 3 },
            // { id: 3, name: '路线3', time: 3 },
            // { id: 4, name: '路线4', time: 3 },
        ]

        item: {name: string, time: number} = {
            name: '',
            time: 0
        }

        currentIndex: number = -1

        currentRow!: any

        $refs: {
            autoCruiseVideoRef: HTMLFormElement;
        }

        dragged!: any

        modalType: string  = 'add'

        lineId: number = 0
        
        mounted() {
            let self = this
            this.stationId = this.$store.state.stationId
            // this.getPatrolByStation()
            /* 拖动目标元素时触发drag事件 */
            // document.addEventListener("drag", function( event ) {
                
            // }, false);
            document.addEventListener("dragstart", function( event: any ) {
                // 保存拖动元素的引用(ref.)
                self.dragged = event.target;
                // 使其半透明
                (event.target as any).style.opacity = .5;
            }, false);

            document.addEventListener("dragend", function( event: any ) {
                // 重置透明度
                event.target.style.opacity = "";
            }, false);

            /* 放置目标元素时触发事件 */
            document.addEventListener("dragover", function( event ) {
                // 阻止默认动作以启用drop
                event.preventDefault();
            }, false);

            document.addEventListener("dragenter", function( event: any ) {
                // 当可拖动的元素进入可放置的目标时高亮目标节点
                if ( event.target.className == "item-wrap" ) {
                    event.target.style.background = "purple";
                }

            }, false);

            document.addEventListener("dragleave", function( event: any ) {
                // 当拖动元素离开可放置目标节点，重置其背景
                if ( event.target.className == "item-wrap" ) {
                    event.target.style.background = "";
                }

            }, false);

            document.addEventListener("drop", function( event: any ) {
                // 阻止默认动作（如打开一些元素的链接）
                event.preventDefault();
                // 将拖动的元素到所选择的放置目标节点中
                if ( event.target.className == "item-wrap" ) {
                    event.target.style.background = ""; 
                    // 要被替换元素的索引
                    let targetIndex = self.getIndex(event.target)
                    // 拖拽元素的目标索引
                    let draggedIndex = self.getIndex(self.dragged)
                    // 拖拽元素对应的数组中的数据
                    let arrItem = self.lineItems[draggedIndex]
                    // 删除原位置的拖拽元素对应的数据
                    self.lineItems.splice(draggedIndex, 1)
                    // 添加到指定位置
                    self.lineItems.splice(targetIndex, 0, arrItem)
                    // 减少对dom的操作,所以下面这边不不推荐，但是这两步也可以实现与上面同意的效果
                    // self.dragged.parentNode.removeChild(self.dragged);
                    // event.target.parentNode.insertBefore(self.dragged, event.target)
                }
                
            }, false);
        }

        getIndex(element) {
            return Array.prototype.slice.call(element.parentNode.children).indexOf(element)
        }

        // 向上、下、左、右
        ptzTurn(direction) {
            this.$refs.autoCruiseVideoRef.ptzTurn(direction);
        }
        // 停止
        ptzStop() {
            this.$refs.autoCruiseVideoRef.ptzStop();
        }

        addLine() {
            this.isShow = true
            this.title = '添加巡航路线'
            this.modalType = 'add'
        }

        editLine() {
            this.isShow = true
            this.modalType = 'edit'
            this.title = '修改巡航路线'
            if (this.currentRow.id === 'undefined') {
                this.$Message.warning('请选择需要修改的路线')
            } else {
                getSchedules(this.currentRow.id).then(res => {
                    let { code, data } = res.data
                    if (code === 200) {
                        this.lineForm.name = data.name
                        this.lineForm.time = Number(data.cron.slice(4,6))
                        this.lineItems = JSON.parse(data.param)
                        this.lineId = data.id
                    }
                })
            }
        }

        // 添加点位
        confirmAddItem() {
            this.isAddItem = false
            let temp = {
                id: 0,
                name: null,
                pan: 46.9,
                tilt: 359.5,
                time: 0,
                zoom: 1.2
            }
            getVideoPTZ(this.videoId).then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    temp = data
                    temp.id = this.lineItems.length + 1
                    temp.name = this.item.name
                    temp.time = this.item.time
                    this.lineItems.push(temp)
                    this.item.name = ''
                    this.item.time = 0
                }
            })
        }

        choosedItem(index) {
            this.currentIndex = index
        }

        // 删除点位
        deleteItem() {
            if (this.currentIndex === -1) {
                this.$Message.warning('请选择要删除的点位')
            } else {
                this.lineItems.splice(this.currentIndex, 1)
                this.currentIndex = -1
            }
        }

        // 手动开始巡检
        patrolptzStart(id: number) {
            patrolptzStart(id).then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    this.$Message.success('手动巡检开始！')
                } else {
                    this.$Message.error('手动巡检开启失败！')
                }
            })
        }

        // 结束巡检
        patrolptzStop(id: number) {
            patrolptzStop(id).then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    this.$Message.success('巡检结束！')
                } else {
                    this.$Message.error('巡检结束操作失败！')
                }
            })
        }

        //选中table路线数据
        choosedCurrent(currentRow: any) {
            this.currentRow = currentRow
        }

        // 速度
        changeSpeed(value) {
            this.speedValue = value
        }

        // 点位跳转
        jump(dto, id) {
            jumpPtz(dto, id).then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    this.$Message.success('跳转成功！')
                } else {
                    this.$Message.error('跳转失败！')
                }
            })
        }

        //add
        submitAddLine() {
            this.lineItems.map((item, index) => {
                item.id = index + 1
            })
            let params = {
                name: this.lineForm.name,
                cron: `0 0/${this.lineForm.time} * * * ?`,
                param: JSON.stringify(this.lineItems),
                actived: true,
                type: 6,
                className: null,
                methodName: null,
                stationId: this.stationId,
                objectId: this.videoId
            }
            addSchedules(params).then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    this.$Message.success('路线新增成功！')
                    this.isShow = false
                } else {
                    this.$Message.error('新增失败！')
                }
            })
        }

        // edit
        submitEditLine() {
             this.lineItems.map((item, index) => {
                item.id = index + 1
            })
            let params = {
                name: this.lineForm.name,
                cron: `0 0/${this.lineForm.time} * * * ?`,
                param: JSON.stringify(this.lineItems),
                actived: true,
                type: 6,
                className: null,
                methodName: null,
                stationId: this.stationId,
                objectId: this.videoId,
                id: this.lineId
            }
            editSchedules(params).then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    this.$Message.success('修改成功！')
                    this.isShow = false
                } else {
                    this.$Message.error('修改失败！')
                }
            })
        }
    }
</script>
<style lang="less">
.auto-cruise-wrap {
    .ivu-table-wrapper {
        border: none;
        position: static !important;
    }
    .ivu-table {
        background-color: rgba(0,0,0,0);
        color: #ffffff;
        th,
        td {
            background-color: inherit;
            border-bottom: none;
        }
        th {
            font-size: 10px;
        }
        td {
            font-size: 10px;
        }
        .ivu-table-cell {
            padding-left: 0;
            padding-right: 0;
        }
        .ivu-table-body {
            height: 180px;
            overflow-y: auto;
        }
        .ivu-table-row-highlight.ivu-table-row-hover {
            td {
                color:#2ed1f6;
            }
        } 
    }
    .option-wrap {
        margin-top: 10px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        div {
            margin-right: 10px;
            cursor: pointer;
        }
    }
}
.cruise-line-wrap {
    display: flex;
    height: 600px;
    .left-wrap {
        flex: 3;
        display: flex;
        flex-direction: column;
        .camera-wrap {
            flex: 1;
            height: 400px;
            .video-wrap {
                height: 350px;
            }
        }
        .control-wrap {
            flex: 1;
            .control {
                margin-top: 0;
                width: 35%;
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
                right: 50px !important;
                top: 70px !important;
            }
            .slider {
                width: 70%;
                margin: 0 auto;
                height: 50px;
                line-height: 50px;
            }
            .btn_box {
                margin-bottom: 20px;
            }
        }
    }
    .right-wrap {
        flex: 2;
        position: relative;
        .all-item-wrap {
            max-height: 320px;
            overflow-y: auto;
            padding-left: 10px;
            .item-wrap {
                line-height: 40px;
                border: 1px solid #eee;
                border-radius: 4px;
                margin: 5px;
                padding: 0 5px;
                .item-info {
                    display: inline-block;
                    width: 75%;
                }
                .item-opera {
                    display: inline-block;
                    text-align: right;
                }
            }
            .active-item {
                border: 1px solid red;
            }
        }
        .option-wrap {
            position: absolute;
            bottom: 0px;
            right: 2px;
            .add-icon,
            .delete-icon {
                cursor: pointer;
                display: inline-block;
            }
        }
        .add-item-wrap {
            position: absolute;
            left: 2rem;
            bottom: 2.9rem;
            display: flex;
            align-items: center;
            .name,
            .interval {
                flex: 3;
            }
            .confirm-add {
                flex: 1;
                cursor: pointer;
            }
        }
    }
}
</style>