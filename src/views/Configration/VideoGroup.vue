<template>
    <div>
        <h4>视频分组管理</h4>
        <div class="btnClass">
            <Button type="info" icon="md-add" @click="addModel">新建</Button>
            <!-- <Button type="warning" icon="md-arrow-down">导出</Button> -->
        </div>
        <Table border :columns="columns" :data="videoGroups">
            <template slot-scope="{ row, index }" slot="action">
                <Button
                    type="success"
                    size="small"
                    style="margin-right: 5px"
                    icon="md-create"
                    @click="edit(row, index)"
                    >编辑</Button
                >
                <Button
                    type="error"
                    size="small"
                    icon="md-trash"
                    @click="remove(index)"
                    >删除</Button
                >
            </template>
        </Table>
        <el-pagination
            style="text-align: right"
            :total="page.total"
            :page-size="page.pageSize"
            :current-page="page.current"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, jumper"
            @current-change="currentChange"
            @size-change="pageSizeChange"
        ></el-pagination>

        <!-- 新增 -->
        <Modal
            v-model="flag_add"
            title="新增"
            @on-ok="addOk"
            @on-cancel="addCancel"
        >
            <Form :model="addItem" :label-width="120">
                <!-- <FormItem label="ID:">
                    <Input v-model="addItem.id" disabled class="form-content-width"/>
                </FormItem> -->
                <FormItem label="视频分组名:">
                    <Input v-model="addItem.name" class="form-content-width"/>
                </FormItem>
                <FormItem label="所属场站:">
                    <el-select v-model="addItem.stationId" class="form-content-width">
                        <el-option
                            v-for="station in stations"
                            :value="station.id"
                            :key="station.id"
                            :label="station.name"
                        ></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="视频类型:">
                    <el-select v-model="addVideoCate" class="form-content-width">
                        <el-option
                            v-for="cate in addVideoCates"
                            :value="cate.val"
                            :key="cate.id"
                            :label="cate.key"
                        ></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="视频选择:">
                    <span v-show="!this.addSelectVideosArr.length">无视频</span>
                    <el-checkbox
                        :indeterminate="addIsIndeterminate"
                        v-model="addCheckAll"
                        v-show="this.addSelectVideosArr.length"
                        @change="handleAddCheckAllChange"
                        >全选</el-checkbox
                    >
                    <el-checkbox-group
                        v-model="addCheckedVideos"
                        @change="handleAddCheckedVideosChange"
                    >
                        <el-checkbox
                            v-for="videoName in addSelectVideosArr"
                            :label="videoName"
                            :key="videoName"
                            >{{ videoName }}</el-checkbox
                        >
                    </el-checkbox-group>
                </FormItem>
                <FormItem label="视频:">
                    <Input v-model="addCheckedVideosName" disabled class="form-content-width"/>
                </FormItem>
            </Form>
        </Modal>

        <!-- 编辑 -->
        <Modal
            v-model="flag_edit"
            title="编辑"
            @on-ok="editOk"
            @on-cancel="editCancel"
        >
            <Form :model="editItem" :label-width="120">
                <!-- <FormItem label="ID:">
                    <Input v-model="editItem.id" disabledclass="form-content-width" />
                </FormItem> -->
                <FormItem label="视频分组名:">
                    <Input v-model="editItem.name" class="form-content-width"/>
                </FormItem>
                <FormItem label="所属场站:">
                    <el-select v-model="editItem.stationId" class="form-content-width">
                        <el-option
                            v-for="station in stations"
                            :value="station.id"
                            :key="station.id"
                            :label="station.name"
                        ></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="视频类型:">
                    <el-select v-model="editVideoCate" class="form-content-width">
                        <el-option
                            v-for="cate in editVideoCates"
                            :value="cate.val"
                            :key="cate.id"
                            :label="cate.key"
                        ></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="视频选择:">
                    <span v-show="!this.editSelectVideosArr.length"
                        >无视频</span
                    >
                    <el-checkbox
                        :indeterminate="editIsIndeterminate"
                        v-model="editCheckAll"
                        v-show="this.editSelectVideosArr.length"
                        @change="handleEditCheckAllChange"
                        >全选</el-checkbox
                    >
                    <el-checkbox-group
                        v-model="editCheckedVideos"
                        @change="handleEditCheckedVideosChange"
                    >
                        <el-checkbox
                            v-for="videoName in editSelectVideosArr"
                            :label="videoName"
                            :key="videoName"
                            >{{ videoName }}</el-checkbox
                        >
                    </el-checkbox-group>
                </FormItem>
                <FormItem label="视频:">
                    <Input v-model="editCheckedVideosName" disabled class="form-content-width"/>
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { VideoServer } from "@/types/videoserver.interface";
import { VideoGroup } from "@/types/videogroup.interface";
import { Station } from "@/types/station.interface";
import { PageQuery } from "@/types/pagequery.interface";
import {
    getVideoServers,
    addVideoServer,
    editVideoServer,
    deleteVideoServer,
    getPageInfo,
} from "@/api/videoserver";
import {
    getVideoGroups,
    getVideoGroupsByStation,
    deleteVideoGroup,
    editVideoGroup,
    addVideoGroup,
} from "@/api/videogroup";
import { getStations } from "@/api/station";
import { getVideoCategory } from "@/api/enum";
import { getVideoDto, getVideoDtosByCondition } from "@/api/video";
import { Video, VideoVo } from "@/types/video.interface";
import { EnumType } from "@/types/enumtype.interface";

@Component({})
export default class VideoGroupClass extends Vue {
    stations: Station[] = [];
    videoGroups: VideoGroup[] = [];

    /** 编辑弹框视频类型数组 */
    editVideoCates: any = [];

    /** 编辑弹框当前所选视频类型 */
    editVideoCate: number = 1;

    /** 编辑弹框视频选择 */
    editIsIndeterminate: boolean = true;
    editCheckAll: boolean = false;
    editCheckedVideos: any = []; //选中视频数组
    editSelectVideosArr: String[] = []; // 所有视频数组

    /** 编辑弹框选中视频名称字符串 */
    editCheckedVideosName: string = "";

    /** 新建弹框视频类型数组 */
    addVideoCates: any = [];

    /** 新建弹框当前所选视频类型 */
    addVideoCate: number = 1;

    /** 新建弹框视频选择 */
    addIsIndeterminate: boolean = true;
    addCheckAll: boolean = false;
    addCheckedVideos: any = []; //选中视频数组
    addSelectVideosArr: String[] = []; // 所有视频数组

    /** 新建弹框选中视频名称字符串 */
    addCheckedVideosName: string = "";

    columns: any[] = [
        {
            title: "ID",
            key: "id",
        },
        {
            title: "视频分组名",
            key: "name",
        },
        {
            title: "所属场站",
            key: "stationName",
        },
        {
            title: "视频",
            key: "videos",
        },
        {
            title: "创建时间",
            key: "createTime",
            width: 150,
            render: (h: any, params: any) => {
                return h(
                    "div",
                    new Date(params.row.createTime).format(
                        "yyyy-MM-dd hh:mm:ss"
                    )
                );
            },
        },
        {
            title: "操作",
            slot: "action",
            width: 170,
            align: "center",
        },
    ];

    /** 添加窗口是否弹出 */
    flag_add: boolean = false;

    /** 待添加的对象 */
    addItem: VideoGroup = this.getDefaultItem();

    /** 编辑窗口是否弹出 */
    flag_edit: boolean = false;

    /** 待编辑的对象 */
    editItem: VideoGroup = this.getDefaultItem();

    /** 分页 */
    page: any = {
        total: 0,
        pageSize: 10,
        current: 1,
    };

    /** 监听编辑场站 */
    @Watch("editItem.stationId")
    getEditstationId(newVal, oldVal) {
        this.getEditVideosByCondition({
            stationId: newVal,
            category: this.editVideoCate,
        });
    }

    /** 编辑弹框监听编辑视频分类 */
    @Watch("editVideoCate")
    getEditVideoCate(newVal, oldVal) {
        this.getEditVideosByCondition({
            stationId: this.editItem.stationId,
            category: newVal,
        });
    }

    /** 编辑弹框监听选中视频数组 */
    @Watch("editCheckedVideos")
    getEditCheckedVideos(newVal, oldVal) {
        this.editCheckedVideosName = newVal.join(",");
    }

    /** 监听新建场站 */
    @Watch("addItem.stationId")
    getAddstationId(newVal, oldVal) {
        this.getAddVideosByCondition({
            stationId: newVal,
            category: this.addVideoCate,
        });
    }

    /** 新建弹框监听新建视频分类 */
    @Watch("addVideoCate")
    getAddVideoCate(newVal, oldVal) {
        this.getAddVideosByCondition({
            stationId: this.addItem.stationId,
            category: newVal,
        });
    }

    /** 新建弹框监听选中视频数组 */
    @Watch("addCheckedVideos")
    getAddCheckedVideos(newVal, oldVal) {
        this.addCheckedVideosName = newVal.join(",");
    }

    mounted() {
        this.initData();
    }

    /**编辑弹框视频选择是否全选*/
    handleEditCheckAllChange(val) {
        this.editCheckedVideos = val ? this.editSelectVideosArr : [];
        this.editIsIndeterminate = false;
    }

    /**编辑弹框视频选择复选框*/
    handleEditCheckedVideosChange(value) {
        let checkedCount = value.length;
        this.editCheckAll = checkedCount === this.editSelectVideosArr.length;
        this.editIsIndeterminate =
            checkedCount > 0 && checkedCount < this.editSelectVideosArr.length;
    }

    /**新建弹框视频选择是否全选*/
    handleAddCheckAllChange(val) {
        this.addCheckedVideos = val ? this.addSelectVideosArr : [];
        this.addIsIndeterminate = false;
    }

    /**新建弹框视频选择复选框*/
    handleAddCheckedVideosChange(value) {
        let checkedCount = value.length;
        this.addCheckAll = checkedCount === this.addSelectVideosArr.length;
        this.addIsIndeterminate =
            checkedCount > 0 && checkedCount < this.addSelectVideosArr.length;
    }

    initData() {
        let pageParam: PageQuery = {
            pageNum: this.page.current,
            pageSize: this.page.pageSize,
        };

        Promise.all([getStations(), getVideoGroups(), getVideoCategory()]).then(
            (res: any) => {
                /**视频类型*/
                this.editVideoCates = res[2].data.data;
                this.addVideoCates = res[2].data.data;
                // 场站
                if (res[0].data.code == 200) this.stations = res[0].data.data;

                // 视频分组
                if (res[1].data.code == 200) {
                    this.page.total = res[1].data.data.length;
                    this.videoGroups = res[1].data.data;

                    // 创建时间和场站名字
                    this.videoGroups.map((item: any) => {
                        item.createTime = new Date(item.createTime);

                        let tmp_station:
                            | Station
                            | undefined = this.stations.find(
                            (tmp: Station) => tmp.id == item.stationId
                        );
                        item.stationName = tmp_station ? tmp_station.name : "";
                    });
                }
            }
        );
    }

    /**编辑弹框根据条件获取视频*/
    getEditVideosByCondition(Vo: VideoVo) {
        getVideoDtosByCondition(Vo).then((res) => {
            this.editSelectVideosArr = [];
            let { data, code } = res.data;
            if (code != 200) return;
            data.forEach((ele) => {
                this.editSelectVideosArr.push(ele.name);
            });
        });
    }

    /**新建弹框根据条件获取视频*/
    getAddVideosByCondition(Vo: VideoVo) {
        getVideoDtosByCondition(Vo).then((res) => {
            this.addSelectVideosArr = [];
            let { data, code } = res.data;
            if (code != 200) return;
            data.forEach((ele) => {
                this.addSelectVideosArr.push(ele.name);
            });
        });
    }

    currentChange(value: number) {
        this.page.current = value;
        this.initData();
    }

    pageSizeChange(value: number) {
        this.page.pageSize = value;
        this.initData();
    }

    /** 获取默认值 */
    getDefaultItem(): VideoGroup {
        return {
            id: 0,
            name: "",
            stationId: 1,
            videos: "",
            createTime: new Date(),
            isVideoGroupsEdited: true, //是否只读，默认只读

            videoList: [],
        };
    }

    /** 点击新建按钮 */
    addModel() {
        /** 每次点开新建弹框选中视频数组和视频名称清空 */
        this.addCheckedVideos = [];
        this.addCheckedVideosName = "";
        this.addVideoCate = 1;

        /** 根据默认的stationId和视频类型获取视频 */
        this.getAddVideosByCondition({
            stationId: this.addItem.stationId,
            category: this.addVideoCate,
        });

        this.flag_add = true;
    }

    /** 添加对象 */
    addOk() {
        getVideoDtosByCondition({}).then((res) => {
            let { data } = res.data;

            /** 处理videos */
            let videosId = [];
            data.forEach((ele) => {
                if (this.addCheckedVideos.indexOf(ele.name) != -1) {
                    videosId.push(ele.id);
                    this.addItem.videos = videosId.join(",");
                }
            });

            addVideoGroup(this.addItem).then((res: any) => {
                let { code, data } = res.data;
                if (code == 200) {
                    this.flag_add = false;
                    this.addItem = this.getDefaultItem();
                    this.initData();
                } else {
                    this.$Message.info("添加出错！！！");
                }
            });
        });
    }

    /** 取消添加 */
    addCancel() {
        this.flag_add = false;
        this.addItem = this.getDefaultItem();
    }

    /** 点击编辑按钮 */
    edit(row, index: number) {
        /** 每次点开编辑弹框选中视频数组和视频名称清空 */
        this.editCheckedVideos = [];
        this.editCheckedVideosName = "";

        /** 根据默认的stationId和视频类型获取视频 */
        this.getEditVideosByCondition({
            stationId: this.editItem.stationId,
            category: this.editVideoCate,
        });

        /** 获取选中视频数组和视频名称 */
        let videoIdArr = row.videos.split(",");
        videoIdArr.forEach((item) => {
            getVideoDto(item).then((res) => {
                let resname = res.data.data.name;
                this.editCheckedVideos.push(resname);
                this.editCheckedVideosName = this.editCheckedVideos.join(",");
            });
        });

        this.flag_edit = true;
        this.editItem = this.videoGroups[index];
    }

    /** 编辑对象 */
    editOk() {
        getVideoDtosByCondition({}).then((res) => {
            let { data } = res.data;

            /** 处理videos */
            let videosId = [];
            data.forEach((ele) => {
                if (this.editCheckedVideos.indexOf(ele.name) != -1) {
                    videosId.push(ele.id);
                    this.editItem.videos = videosId.join(",");
                }
            });

            editVideoGroup(this.editItem).then((res: any) => {
                let { code, data } = res.data;
                if (code == 200) {
                    this.flag_edit = false;
                    this.initData();
                } else {
                    this.$Message.info("编辑出错！！！");
                }
            });
        });
    }

    /** 取消编辑 */
    editCancel() {
        this.flag_edit = false;
    }

    remove(index: number) {
        this.$Modal.confirm({
            title: '删除视频分组',
            content: '确定要删除该视频分组吗？',
            onOk: () => {
                deleteVideoGroup(this.videoGroups[index].id).then((res: any) => {
                    let { code, data } = res.data;
                    if (code == 200) {
                        this.initData();
                        this.$Message.success("删除成功！");
                    } else {
                        this.$Message.info("删除出错！");
                    }
                });
            }
        })
    }
}
</script>

<style lang="less" scoped>
.btnClass button {
    margin: 0px 10px;
}
</style>
