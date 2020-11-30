<template>
    <div>
        <h4>视频管理</h4>
        <div class="btnClass">
            <Button type="info" icon="md-add" @click="addModel">新建</Button>
            <Upload 
                :action="serve.ApiUrl+'/videos/import'" 
                :headers="token" 
                accept=".xls"
                :on-success="handleSuccess"
            >
                <Button type='primary' icon="ios-cloud-upload-outline">导入</Button>
            </Upload>
            <Button type='warning' icon='md-arrow-down' @click="exportFiles()">导出</Button>
        </div>
        <Table border :columns="columns" :data="videos">
            <template slot-scope="{ index }" slot="action">
                <Button type="success" size="small" style="margin-right: 5px" icon="md-create"
                    @click="edit(index)">编辑</Button>
                <Button type="error" size="small" icon="md-trash" @click="remove(index)">删除</Button>
            </template>
        </Table>
        <el-pagination style="text-align: right" :total="page.total" :page-size="page.pageSize"
            :current-page="page.current" :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, jumper" @current-change="currentChange"
            @size-change="pageSizeChange"></el-pagination>

        <Modal v-model="flag_add" title="新增" class="alarmDialog" @on-ok="addOk" @on-cancel="addCancel">
            <Form v-if="flag_add" :model="addItem" :label-width="120">
                <FormItem label="ID:">
                    <InputNumber :min="0" v-model="addItem.id" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="视频名:">
                    <Input v-model="addItem.name" class="form-content-width"/>
                </FormItem>
                <FormItem label="所属场站:">
                    <el-select v-model="addItem.stationId" class="form-content-width">
                        <el-option v-for="station in stations" :value="station.id" :key="station.id"
                            :label="station.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="对象类型:">
                    <RadioGroup v-model="addItem.objectType" class="form-content-width">
                        <Radio v-for="type in objectType" :label="type.val" :key="type.val">
                            {{ type.key }}
                        </Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="所属设备：">
                    <el-select v-model="addItem.equipmentId" class="form-content-width">
                        <el-option v-for="equipment in equipments" :value="equipment.id" :key="equipment.id"
                            :label="equipment.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="IP:">
                    <Input v-model="addItem.ip" class="form-content-width"/>
                </FormItem>
                <FormItem label="端口:">
                    <InputNumber :min="0" v-model="addItem.port" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="用户名:">
                    <Input v-model="addItem.username" class="form-content-width"/>
                </FormItem>
                <FormItem label="password:">
                    <Input v-model="addItem.password" class="form-content-width"/>
                </FormItem>
                <FormItem label="视频服务:">
                    <el-select v-model="addItem.serverId" class="form-content-width">
                        <el-option v-for="server in videoServers" :value="server.id" :key="server.id"
                            :label="server.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="播放服务:">
                    <el-select v-model="addItem.playServerId" class="form-content-width">
                        <el-option v-for="server in videoServers" :value="server.id" :key="server.id"
                            :label="server.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="通道号:">
                    <InputNumber :min="0" v-model="addItem.channelNo" class="form-content-width"></InputNumber>
                </FormItem>
                <!-- <FormItem label="通道名称:">
                    <Input v-model="addItem.channelName" class="form-content-width"/>
                </FormItem> -->
                <FormItem label="默认预置位:">
                    <InputNumber :min="0" v-model="addItem.defaultPreset" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="厂商:">
                    <el-select v-model="addItem.vendor" class="form-content-width">
                        <el-option v-for="vendor in videoVendors" :value="vendor.val" :key="vendor.val"
                            :label="vendor.key"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="编码:">
                    <Input v-model="addItem.code" placeholder="中科填code，h5设备类视频填关联的设备编号" class="form-content-width"/>
                </FormItem>
                <FormItem label="视频类型:">
                    <el-select v-model="addItem.category" class="form-content-width">
                        <el-option v-for="category in videoCategory" :value="category.val" :key="category.val"
                            :label="category.key"></el-option>
                    </el-select>
                </FormItem>
            </Form>
        </Modal>
        <Modal v-model="flag_edit" title="编辑" class="alarmDialog" @on-ok="editOk" @on-cancel="editCancel">
            <Form :model="editItem" :label-width="120">
                <FormItem label="ID:">
                    <InputNumber :min="0" v-model="editItem.id" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="视频名:">
                    <Input v-model="editItem.name" class="form-content-width"/>
                </FormItem>
                <FormItem label="所属场站:">
                    <el-select v-model="editItem.stationId" class="form-content-width">
                        <el-option v-for="station in stations" :value="station.id" :key="station.id"
                            :label="station.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="对象类型:">
                    <RadioGroup v-model="editItem.objectType" class="form-content-width">
                        <Radio v-for="type in objectType" :label="type.val" :key="type.val">
                            {{ type.key }}
                        </Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="所属设备：">
                    <el-select v-model="editItem.equipmentId" class="form-content-width">
                        <el-option v-for="equipment in equipments" :value="equipment.id" :key="equipment.id"
                            :label="equipment.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="IP:">
                    <Input v-model="editItem.ip" class="form-content-width"/>
                </FormItem>
                <FormItem label="端口:">
                    <InputNumber :min="0" v-model="editItem.port" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="用户名:">
                    <Input v-model="editItem.username" class="form-content-width"/>
                </FormItem>
                <FormItem label="password:">
                    <Input v-model="editItem.password" class="form-content-width"/>
                </FormItem>
                <FormItem label="视频服务:">
                    <el-select v-model="editItem.serverId" class="form-content-width">
                        <el-option v-for="server in videoServers" :value="server.id" :key="server.id"
                            :label="server.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="播放服务:">
                    <el-select v-model="editItem.playServerId" class="form-content-width">
                        <el-option v-for="server in videoServers" :value="server.id" :key="server.id"
                            :label="server.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="通道号:">
                    <InputNumber :min="0" v-model="editItem.channelNo" class="form-content-width"></InputNumber>
                </FormItem>
                <!-- <FormItem label="通道名称:">
                    <Input v-model="editItem.channelName" class="form-content-width"/>
                </FormItem> -->
                <FormItem label="默认预置位:">
                    <InputNumber :min="0" v-model="editItem.defaultPreset" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="厂商:">
                    <el-select v-model="editItem.vendor" class="form-content-width">
                        <el-option v-for="vendor in videoVendors" :value="vendor.val" :key="vendor.val"
                            :label="vendor.key"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="编码:">
                    <Input v-model="editItem.code" placeholder="中科填code，h5设备类视频填关联的设备编号" class="form-content-width"/>
                </FormItem>
                <FormItem label="视频类型:">
                    <el-select v-model="editItem.category" class="form-content-width">
                        <el-option v-for="category in videoCategory" :value="category.val" :key="category.val"
                            :label="category.key"></el-option>
                    </el-select>
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue
    } from "vue-property-decorator";
    import {
        Video
    } from "@/types/video.interface";
    import {
        Station
    } from "@/types/station.interface";
    import {
        EnumType
    } from "@/types/enumtype.interface";
    import {
        VideoServer
    } from "@/types/videoserver.interface";
    import {
        PageQuery
    } from "@/types/pagequery.interface";
    import {
        getVideoDtos,
        addVideo,
        editVideo,
        deleteVideo,
        getPageInfo,
        getDefaultVideo,
        exportVideo
    } from "@/api/video";
    import {
        getStations
    } from "@/api/station";
    import {
        getVideoServers
    } from "@/api/videoserver";
    import { getEquipments } from '@/api/equipment'
    import { Equipment } from '@/types/equipment.interface'
    import request from '@/util/request'

    @Component({})
    export default class MeasObjectClass extends Vue {
        stations: Station[] = [];
        videos: Video[] = [];
        videoServers: VideoServer[] = [];
        equipments: Equipment[] = []

        columns: any[] = [{
                title: "ID",
                key: "id"
            },
            {
                title: "监测对象名",
                key: "name"
            },
            {
                title: "所属场站",
                key: "stationName"
            },
            {
                title: "所属设备",
                key: "equipmentName"
            },
            {
                title: "IP",
                key: "ip",
                width: 130,
            },
            {
                title: "端口",
                key: "port",
                width: 80,
            },
            {
                title: "用户名",
                key: "username",
                width: 80,
            },
            {
                title: "密码",
                key: "password"
            },
            {
                title: "所属服务",
                key: "serverName"
            },
            {
                title: "播放服务",
                key: "playServerName"
            },
            {
                title: "通道号",
                key: "channelNo",
                width: 80,
                align: 'center'
            },
            {
                title: "识别码",
                key: "code",
            },
            {
                title: "类型",
                key: "categoryName",
                width: 90,
            },
            {
                title: "厂商",
                key: "vendorName",
                // width: 100,
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
        addItem: Video = getDefaultVideo();

        /** 编辑窗口是否弹出 */
        flag_edit: boolean = false;

        /** 待编辑的对象 */
        editItem: Video = getDefaultVideo();

        /** 对象类型 */
        objectType: EnumType[] = this.$store.state.objectType.filter(
            (type: EnumType) => type.key.indexOf("视频") >= 0 || type.key.indexOf("电视") >= 0 || type.key.indexOf(
                "可视对讲") >= 0
        );

        /** 数据类型 */
        dataType: EnumType[] = this.$store.state.dataType.filter(
            (type: EnumType) => type.key.indexOf("视频") >= 0
        );

        /** 视频类型 */
        videoCategory: EnumType[] = this.$store.state.videoCategory

        /** 视频供应商 */
        videoVendors: EnumType[] = this.$store.state.videoVendors

        /** 分页 */
        page: any = {
            total: 0,
            pageSize: 10,
            current: 1,
        }

        /** 后端访问地址 */
        url: string = '/file'

        get token() {
            return {
                'Authorization': this.$store.state.token
            }
        }

        mounted() {
            this.initData();
        }

        initData() {
            let pageParam: PageQuery = {
                pageNum: this.page.current,
                pageSize: this.page.pageSize,
            };

            Promise.all([ getStations(), getEquipments(), getVideoServers(), getPageInfo(pageParam) ]).then((res: any) => {
                // 场站
                if (res[0].data.code == 200) this.stations = res[0].data.data;

                //设备
                if (res[1].data.code == 200) this.equipments = res[1].data.data

                // 服务
                if (res[2].data.code == 200) this.videoServers = res[2].data.data;
                
                // 视频
                if (res[3].data.code == 200) {
                    this.page.total = res[3].data.data.totalSize;
                    this.videos = res[3].data.data.content;
                    
                    this.videos.map((item: Video) => {
                        item.createTime = new Date(item.createTime);

                        let tmp_station: Station | undefined = this.stations.find(
                            (tmp: Station) => tmp.id == item.stationId
                        );
                        item.stationName = tmp_station ? tmp_station.name : "";

                        let categoryIndex = this.videoCategory.findIndex(
                            (tmp: EnumType) => tmp.val == item.category
                        );
                        item.categoryName = categoryIndex >= 0 ?
                            this.videoCategory[categoryIndex].key : ""

                        let vendorIndex = this.videoVendors.findIndex(
                            (tep: EnumType) => tep.val == item.vendor
                        )
                        item.vendorName = vendorIndex >=0 ? this.videoVendors[vendorIndex].key : ""

                        let equipmentIndex = this.equipments.findIndex(
                            (tep: Equipment) => tep.id == item.equipmentId
                        )
                        item.equipmentName = equipmentIndex >= 0 ? this.equipments[equipmentIndex].name : ''

                        let server: VideoServer | undefined = this.videoServers.find((tmp: VideoServer) => tmp.id == item.serverId)
                        item.serverName = server ? server.name : ''
                        item.playServerName = server ? server.name : ''
                    });
                }
                
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

        /** 添加新对象 */
        addModel() {
            this.flag_add = true;
        }

        edit(index: number) {
            this.flag_edit = true;
            this.editItem = this.videos[index];
        }

        remove(index: number) {
            this.$Modal.confirm({
                title: '删除视频',
                content: '<p>确定要删除该视频吗？</p>',
                onOk: () => {
                    deleteVideo(this.videos[index].id).then((res: any) => {
                        let {
                            code,
                            data
                        } = res.data;
                        if (code == 200) {
                            this.initData();
                            this.$Message.success("删除成功！");
                        } else {
                            this.$Message.error("删除出错！");
                        }
                    });
                }
            })
        }

        /** 添加对象 */
        addOk() {
            addVideo(this.addItem).then((res: any) => {
                let {
                    code,
                    data
                } = res.data;
                if (code == 200) {
                    this.flag_add = false;
                    this.addItem = getDefaultVideo();
                    this.initData();
                    this.$Message.success('添加成功！')
                } else {
                    this.$Message.error("添加出错！");
                }
            });
        }

        /** 取消添加 */
        addCancel() {
            this.flag_add = false;
            this.addItem = this.getDefaultItem();
        }

        /** 编辑对象 */
        editOk() {
            editVideo(this.editItem).then((res: any) => {
                let {
                    code,
                    data
                } = res.data;
                if (code == 200) {
                    this.flag_edit = false;
                    this.initData();
                    this.$Message.success('编辑成功！')
                } else {
                    this.$Message.error("编辑出错！");
                }
            });
        }

        /** 取消编辑 */
        editCancel() {
            this.flag_edit = false;
        }

        /** 导入 */
        handleSuccess (res, file) {
            if (res.code === 200) {
                this.$Message.success('文件上次成功！')
                this.initData()
            }
        }

        /** 导出 */
        exportFiles() {
            exportVideo().then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    if (data.length > 0) {
                        let index=data.lastIndexOf("\\");
                        let fileName=data.substring(index+1,data.length);
                        request({
                            url: this.url,
                            method: 'post',
                            data: {
                                path: data
                            },
                            responseType: 'blob'
                        }).then((response: any) => {
                            var link = document.createElement('a');
                            link.download = fileName
                            let href = window.URL.createObjectURL(response.data)
                            link.href = href
                            
                            document.body.append(link)
                            link.click();
                            document.body.removeChild(link)
                        })
                    }
                }
            })
        }
    }
</script>