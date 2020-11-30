<template>
    <div>
        <h4>视频服务管理</h4>
        <div class='btnClass'>
            <Button type='info' icon='md-add' @click="addModel">新建</Button>
            <Upload 
                :action="serve.ApiUrl+'/videolinkages/import'" 
                :headers="token" 
                accept=".xls"
                :on-success="handleSuccess"
            >
                <Button type='primary' icon="ios-cloud-upload-outline">导入</Button>
            </Upload>
            <Button type='warning' icon='md-arrow-down' @click="exportFiles()">导出</Button>
        </div>
        <Table border :columns="columns" :data="videoServers">
            <template slot-scope="{ index }" slot="action">
                <Button type="success" size="small" style="margin-right: 5px" icon='md-create'
                    @click="edit(index)">编辑</Button>
                <Button type="error" size="small" icon='md-trash' @click="remove(index)">删除</Button>
            </template>
        </Table>
        <el-pagination style="text-align: right" :total="page.total" :page-size="page.pageSize"
            :current-page="page.current"
            layout="total, prev, pager, next, jumper" @current-change="currentChange"
            @size-change="pageSizeChange"></el-pagination>

        <Modal class="alarmDialog" v-model="flag_add" title="新增" @on-ok="addOk" @on-cancel="addCancel">
            <Form v-if="flag_add" :model="addItem" :label-width="120">
                <FormItem label="ID：">
                    <Input v-model="addItem.id" class="form-content-width"/>
                </FormItem>
                <FormItem label="视频服务名：">
                    <Input v-model="addItem.name" class="form-content-width"/>
                </FormItem>
                <FormItem label="所属场站：">
                    <el-select v-model="addItem.stationId" class="form-content-width">
                        <el-option v-for="station in stations" :value="station.id" :key="station.id"
                            :label="station.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="所属设备：">
                    <el-select v-model="addItem.equipmentId" class="form-content-width">
                        <el-option v-for="equipment in equipments" :value="equipment.id" :key="equipment.id"
                            :label="equipment.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="IP：">
                    <Input v-model="addItem.ip" class="form-content-width"/>
                </FormItem>
                <FormItem label="端口：">
                    <Input v-model="addItem.port" class="form-content-width"/>
                </FormItem>
                <FormItem label="通道数：">
                    <InputNumber :max="1000" :min="1" v-model="addItem.portNum" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="厂商：">
                    <el-select v-model="addItem.vendor" class="form-content-width">
                        <el-option v-for="vendor in videoVendors" :value="vendor.val" :key="vendor.val"
                            :label="vendor.key"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="用户名：">
                    <Input v-model="addItem.username" class="form-content-width"/>
                </FormItem>
                <FormItem label="密码：">
                    <Input v-model="addItem.password" class="form-content-width"/>
                </FormItem>
                <FormItem label="支持截图：">
                    <RadioGroup v-model="addItem.supportCapture">
                        <Radio :label="true">是</Radio>
                        <Radio :label="false">否</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="支持录像：">
                    <RadioGroup v-model="addItem.supportRecord">
                        <Radio :label="true">是</Radio>
                        <Radio :label="false">否</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="支持告警：">
                    <RadioGroup v-model="addItem.supportAlarm">
                        <Radio :label="true">是</Radio>
                        <Radio :label="false">否</Radio>
                    </RadioGroup>
                </FormItem>
            </Form>
        </Modal>
        <Modal class="alarmDialog" v-model="flag_edit" title="编辑" @on-ok="editOk" @on-cancel="editCancel">
            <Form :model="editItem" :label-width="120">
                <FormItem label="ID：">
                    <Input v-model="editItem.id" class="form-content-width"/>
                </FormItem>
                <FormItem label="视频服务名：">
                    <Input v-model="editItem.name" class="form-content-width"/>
                </FormItem>
                <FormItem label="所属场站：">
                    <el-select v-model="editItem.stationId" class="form-content-width">
                        <el-option v-for="station in stations" :value="station.id" :key="station.id"
                            :label="station.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="所属设备：">
                    <el-select v-model="editItem.equipmentId" class="form-content-width">
                        <el-option v-for="equipment in equipments" :value="equipment.id" :key="equipment.id"
                            :label="equipment.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="IP：">
                    <Input v-model="editItem.ip" class="form-content-width"/>
                </FormItem>
                <FormItem label="端口：">
                    <Input v-model="editItem.port" class="form-content-width"/>
                </FormItem>
                <FormItem label="通道数：">
                    <InputNumber :max="1000" :min="1" v-model="editItem.portNum" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="厂商：">
                    <el-select v-model="editItem.vendor" class="form-content-width">
                        <el-option v-for="vendor in videoVendors" :value="vendor.val" :key="vendor.val"
                            :label="vendor.key"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="用户名：">
                    <Input v-model="editItem.username" class="form-content-width"/>
                </FormItem>
                <FormItem label="密码：">
                    <Input v-model="editItem.password" class="form-content-width"/>
                </FormItem>
                <FormItem label="支持截图：">
                    <RadioGroup v-model="editItem.supportCapture">
                        <Radio :label="true">是</Radio>
                        <Radio :label="false">否</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="支持录像：">
                    <RadioGroup v-model="editItem.supportRecord">
                        <Radio :label="true">是</Radio>
                        <Radio :label="false">否</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="支持告警：">
                    <RadioGroup v-model="editItem.supportAlarm">
                        <Radio :label="true">是</Radio>
                        <Radio :label="false">否</Radio>
                    </RadioGroup>
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue
    } from 'vue-property-decorator'
    import {
        VideoServer
    } from '@/types/videoserver.interface'
    import {
        Station
    } from '@/types/station.interface'
    import {
        PageQuery
    } from '@/types/pagequery.interface'
    import {
        getVideoServers,
        addVideoServer,
        editVideoServer,
        deleteVideoServer,
        getPageInfo,
        exportVideoServer
    } from '@/api/videoserver'
    import {
        getStations
    } from '@/api/station'
    import {
        EnumType
    } from '@/types/enumtype.interface'
    import { getEquipments } from '@/api/equipment'
    import { Equipment } from '@/types/equipment.interface'
    import request from '@/util/request'

    @Component({})
    export default class VideoServerClass extends Vue {
        stations: Station[] = []
        videoServers: VideoServer[] = []
        equipments: Equipment[] = []

        columns: any[] = [{
                title: 'ID',
                key: 'id',
                width: 90
            },
            {
                title: '视频服务名',
                key: 'name',
                width: 120
            },
            {
                title: '所属场站',
                key: 'stationName',
                width: 100
            },
            {
                title: '所属设备',
                key: 'equipmentName',
                width: 120
            },
            {
                title: 'IP',
                key: 'ip',
                width: 110
            },
            {
                title: '端口',
                key: 'port'
            },
            {
                title: '通道数',
                key: 'portNum'
            },
            {
                title: '厂商',
                key: 'vendorName'
            },
            {
                title: '用户名',
                key: 'username'
            },
            {
                title: '密码',
                key: 'password'
            },
            {
                title: '支持截图',
                key: 'supportCapture',
                align: 'center',
                render: (h, param) => {
                    let temp: string
                    if (param.row.supportCapture) {
                        temp = '是'
                    } else {
                        temp = '否'
                    }
                    return h('div', temp)
                }
            },
            {
                title: '支持录像',
                key: 'supportRecord',
                align: 'center',
                render: (h, param) => {
                    let temp: string
                    if (param.row.supportRecord) {
                        temp = '是'
                    } else {
                        temp = '否'
                    }
                    return h('div', temp)
                }
            },
            {
                title: '支持告警',
                key: 'supportAlarm',
                align: 'center',
                render: (h, param) => {
                    let temp: string
                    if (param.row.supportAlarm) {
                        temp = '是'
                    } else {
                        temp = '否'
                    }
                    return h('div', temp)
                }
            },
            {
                title: '创建时间',
                key: 'createTime',
                align: 'center',
                width: 150,
                render: (h: any, params: any) => {
                    return h(
                        "div",
                        new Date(params.row.createTime).format("yyyy-MM-dd hh:mm:ss")
                    );
                },
            },
            {
                title: '操作',
                slot: 'action',
                width: 170,
                align: 'center'
            }
        ]

        /** 对象类型 */
        objectType: Array < EnumType > = this.$store.state.objectType.filter((type: EnumType) => type.key.indexOf(
            '视频服务') >= 0)

        /** 数据类型 */
        dataType: Array < EnumType > = this.$store.state.dataType.filter((type: EnumType) => type.key.indexOf(
            '视频') >= 0)

        /** 视频供应商 */
        videoVendors: EnumType[] = this.$store.state.videoVendors

        /** 添加窗口是否弹出 */
        flag_add: boolean = false

        /** 待添加的对象 */
        addItem: VideoServer = this.getDefaultItem()

        /** 编辑窗口是否弹出 */
        flag_edit: boolean = false

        /** 待编辑的对象 */
        editItem: VideoServer = this.getDefaultItem()

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
            this.getEquipments()
            this.initData()
        }

        initData() {
            let pageParam: PageQuery = {
                pageNum: this.page.current,
                pageSize: this.page.pageSize
            }

            Promise.all([getStations(), getPageInfo(pageParam)]).then((res: any) => {
                // 场站
                if (res[0].data.code == 200) this.stations = res[0].data.data

                // 视频服务
                if (res[1].data.code == 200) {
                    this.page.total = res[1].data.data.totalSize
                    this.videoServers = res[1].data.data.content
                    this.videoServers.map((item: VideoServer) => {
                        item.createTime = new Date(item.createTime)

                        let tmp_station: Station | undefined = this.stations.find((tmp: Station) =>
                            tmp.id == item.stationId)
                        item.stationName = tmp_station ? tmp_station.name : ''

                        let vendorIndex = this.videoVendors.findIndex(
                            (tep: EnumType) => tep.val == item.vendor
                        )
                        item.vendorName = vendorIndex >=0 ? this.videoVendors[vendorIndex].key : ""

                        let equipmentIndex = this.equipments.findIndex(
                            (tep: Equipment) => tep.id == item.equipmentId
                        )
                        item.equipmentName = equipmentIndex >= 0 ? this.equipments[equipmentIndex].name : ''
                    })
                }

            })
        }

        getEquipments() {
            getEquipments().then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    this.equipments = data
                }
            })
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
        getDefaultItem(): VideoServer {
            if (!this.objectType) {
                this.objectType = this.$store.state.objectType.filter((type: EnumType) => type.key.indexOf(
                    '视频服务') >= 0)
            }
            if (!this.dataType) {
                this.dataType = this.$store.state.dataType.filter((type: EnumType) => type.key.indexOf(
                    '视频') >= 0)
            }
            return {
                id: 0,
                name: '',
                stationId: 0,
                stationName: '',
                objectType: this.objectType.length > 0 ? this.objectType[0].val : 0,
                objectTypeName: this.objectType.length > 0 ? this.objectType[0].key : '',
                dataType: this.dataType.length > 0 ? this.dataType[0].val : 0,
                dataTypeName: this.dataType.length > 0 ? this.dataType[0].key : '',
                equipmentId: 0,
                createTime: new Date(),
                ip: '127.0.0.1',
                port: 80,
                portNum: 100,
                username: '',
                password: '',
                vendor: 0,
                actived: true,
                online: true,
                supportAlarm: true,
                supportRecord: true,
                supportCapture: true
            }
        }

        /** 添加新对象 */
        addModel() {
            this.flag_add = true
        }

        edit(index: number) {
            this.flag_edit = true
            this.editItem = this.videoServers[index]
        }

        remove(index: number) {
            this.$Modal.confirm({
                title: '删除视频服务',
                content: '<p>确定要删除该视频服务吗？</p>',
                onOk: () => {
                    deleteVideoServer(this.videoServers[index].id).then((res: any) => {
                        let {
                            code,
                            data
                        } = res.data
                        if (code == 200) {
                            this.initData()
                            this.$Message.success("删除成功！")
                        } else {
                            this.$Message.error("删除出错！")
                        }
                    })
                }
            })
        }

        /** 添加对象 */
        addOk() {
            addVideoServer(this.addItem).then((res: any) => {
                let {
                    code,
                    data
                } = res.data
                if (code == 200) {
                    this.flag_add = false
                    this.addItem = this.getDefaultItem()
                    this.initData()
                    this.$Message.success('添加成功！')
                } else {
                    this.$Message.error("添加出错！")
                }
            })
        }

        /** 取消添加 */
        addCancel() {
            this.flag_add = false
            this.addItem = this.getDefaultItem()
        }

        /** 编辑对象 */
        editOk() {
            editVideoServer(this.editItem).then((res: any) => {
                let {
                    code,
                    data
                } = res.data
                if (code == 200) {
                    this.flag_edit = false
                    this.initData()
                } else {
                    this.$Message.info("编辑出错！！！")
                }
            })
        }

        /** 取消编辑 */
        editCancel() {
            this.flag_edit = false
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
            exportVideoServer().then(res => {
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
