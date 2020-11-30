<template>
    <div class="regular_inspection">
        <h4>定时巡检设置</h4>
        <div class='btnClass'>
            <Button type='info' icon='md-add' @click="showAddInspectionModel" v-permission="['permission:add']">新建</Button>
        </div>
        <Table border :columns="inspectionColumns" :data="inspections">
            <template slot-scope="{ index }" slot="action">
                <Button
                    type="success"
                    size="small"
                    style="margin-right: 5px"
                    icon="md-create"
                    @click="edit(index)"
                    >编辑</Button
                >
                <Button type="error" size="small" icon="md-trash" @click="deletePatrol(index)">删除</Button>
            </template>
        </Table>

        <!-- 新建 -->
        <Modal
            v-model="showAddInspection"
            :title="title"
            @on-cancel="cancel"
        >
            <el-form ref="addInspectionForm" :model="addInspectionItem">
                <el-form-item label="巡检名称：">
                    <el-col :span="14">
                        <el-input v-model="inspectionName" style="width:100%" placeholder="请输入巡检名称"></el-input>
                    </el-col>
                </el-form-item>

                <el-form-item label="选择视频：">
                    <el-col :span="14">
                        <el-select
                            style="width:100%"
                            v-model="videoId"
                            placeholder="请选择视频"
                            @change="selectVideoId"
                        >
                            <el-option
                                v-for="item in videos"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            >
                            </el-option>
                        </el-select>
                    </el-col>
                </el-form-item>

                <el-form-item label="巡检点：" class="point">
                    <el-col :span="14"
                        ><el-input
                            v-model="inspectionPoints"
                            placeholder="请输入巡检点"
                            style="margin-left:5%"
                        ></el-input
                    ></el-col>
                    <el-col :span="6" style="margin-left:5%">
                        (格式：1,2,3,4,5)
                    </el-col>
                </el-form-item>

                <el-form-item label="停留时间：">
                    <el-col :span="14"><el-input v-model="stayTime" style="width: 100%"></el-input></el-col>
                    <el-col :span="2" style="margin-left:10px">
                        <span class="unit">
                            秒
                        </span>
                    </el-col>
                </el-form-item>

                <el-form-item label="间隔时间：">
                    <el-col :span="14"><el-input v-model="intervalTime" style="width: 100%"></el-input></el-col>
                    <el-col :span="2" style="margin-left:10px">
                        <span class="unit">
                            分钟
                        </span>
                    </el-col>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <Button v-if="title=='添加巡检'" type="primary" @click="addInspection()">确定</Button>
                <Button v-if="title=='编辑巡检'" type="primary" @click="editInspection()">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Video } from "@/types/video.interface";
import { getInspections, addInspections, editSchedules, deleteSchedules } from "@/api/schedule.ts";
import { getVideos } from "@/api/video.ts";
import { Inspection } from "@/types/inspections.interface";

@Component({
    components: {},
})
export default class RegularInspection extends Vue {
    videoId: number = 0;
    videos: any[] = [];

    /**巡检点 */
    inspectionPoints: string = "";

    /**停留时间 */
    stayTime: string = "0";

    /**间隔时间 */
    intervalTime: string = "0";

    /**巡检名称 */
    inspectionName: string = "";

    id: number = 0

    /**添加巡检 */
    showAddInspection: boolean = false;
    addInspectionItem: Inspection = {};

    /**编辑巡检 */
    // showEditInspection: boolean = false;

    /**巡检数组*/
    inspections: Inspection[] = [];

    inspectionColumns: any[] = [
        {
            title: "巡检名称",
            key: "name",
        },
        {
            title: "视频",
            key: "objectId",
        },
        {
            title: "巡检点",
            key: "presets",
        },
        {
            title: "停留时间(秒)",
            key: "stayTime",
        },
        {
            title: "间隔时间(分钟)",
            key: "intervalTime",
        },
        {
            title: "操作",
            slot: "action",
            width: 350,
            align: "center",
        },
    ];

    title: string = '添加巡检'

    /**间隔时间传参处理*/
    get cron() {
        return `0 0/${this.intervalTime} * * * ?`;
    }

    /**巡检点和停留时间传参处理*/
    get param() {
        let inspectionPoints = JSON.stringify(
            this.inspectionPoints.split(",").map(Number)
        );
        return `{"presets":${inspectionPoints},"stayTime":${this.stayTime}}`; // {"presets":[1,2,3,4,5,6],"stayTime":5}
    }

    mounted() {
        this.initData();
    }

    /**获取添加巡检数据默认值*/
    getDefaultAddInspectionItem() {}

    initData() {
        /**获取视频*/
        getVideos().then((res) => {
            let { code, data } = res.data;
            if (code == 200) {
                data.forEach((video: Video) => {
                    this.videos.push({ value: video.id, label: video.name });
                });
            }
        });

        /**获取巡检*/
        getInspections().then((res) => {
            let { code, data } = res.data;
            if (code == 200) {
                this.inspections = data.filter((inspection: Inspection) => {
                    return inspection.type == 1;
                });
            }
            this.handleParam();
        });
    }

    /**处理巡视点,停留时间,间隔时间 */
    handleParam() {
        if (this.inspections.length == 0) return;
        this.inspections.forEach((ele) => {
            let param: any[] = [];

            /**巡视点 */
            let presets: string = "";

            /**停留时间 */
            let stayTime: number = 0;

            /**间隔时间 */
            let intervalTime: string = "";

            param = JSON.parse(ele.param);

            /**添加巡视点字段 */
            presets = param["presets"].join(",");
            Object.assign(ele, { presets });

            /**添加停留时间字段 */
            stayTime = param["stayTime"];
            Object.assign(ele, { stayTime });

            let cron: string;
            let cronLength: number;
            cron = ele.cron; //"0 0/10 * * * ?"
            cronLength = cron.length;
            cron = cron.substring(0, cronLength - 8);
            intervalTime = cron.split("/")[1];

            /**添加间隔时间字段 */
            Object.assign(ele, { intervalTime });
        });
    }

    selectVideoId(e) {
        this.addInspectionItem.objectId = e;
    }

    showAddInspectionModel() {
        this.showAddInspection = true;
        this.title = '添加巡检'
    }

    /**添加巡检*/
    addInspection() {
        Object.assign(this.addInspectionItem, {
            objectId: this.videoId,
            cron: this.cron,
            param: this.param,
            type: 1,
            name: this.inspectionName,
            actived: true,
        });
        if (this.addInspectionItem.objectId == 0) return;
        addInspections(this.addInspectionItem).then((res) => {
            let { code, data } = res.data
            if (code === 200) {
                this.$Message.success('添加成功！')
                this.initData()
                this.showAddInspection = false
            } else {
                this.$Message.error('添加失败！')
            }
        });
    }

    edit(index: number) {
        this.showAddInspection = true;
        this.title = '编辑巡检'
        let a = this.inspections[index]
        this.inspectionName = this.inspections[index].name
        this.videoId = this.inspections[index].objectId
        this.inspectionPoints = this.inspections[index].presets
        this.stayTime = this.inspections[index].stayTime
        this.intervalTime = this.inspections[index].intervalTime
        this.id = this.inspections[index].id
    }

    editInspection() {
        Object.assign(this.addInspectionItem, {
            objectId: this.videoId,
            cron: this.cron,
            param: this.param,
            type: 1,
            name: this.inspectionName,
            actived: true,
            id: this.id
        });
        editSchedules(this.addInspectionItem).then(res => {
            let { code, data } = res.data
            if (code === 200) {
                this.$Message.success('修改成功！')
                this.initData()
                this.showAddInspection = false

            } else {
                this.$Message.error('修改失败！')
            }
        })
    }

    cancel() {
        this.showAddInspection = false;
    }

    deletePatrol(index) {
        this.$Modal.confirm({
            title: '删除定时巡检',
            content: '确定要删除该定时巡检吗？',
            onOk: () => {
                deleteSchedules(this.inspections[index].id).then(res => {
                    let { code, data } = res.data
                    if (code === 200) {
                        this.$Message.success('删除成功！')
                        this.initData()
                    } else {
                        this.$Message.error('删除失败！')
                    }
                })
            }
        })
    }
}
</script>

<style lang="less" scoped>
.regular_inspection {
    h4 {
        margin-bottom: 20px;
    }
    .unit {
        color: pink;
    }
}
</style>
