<template>
    <div>
        <h4>设备管理</h4>
        <div class='btnClass'>
            <Button type='info' icon='md-add' @click="addModel">新建</Button>
            <Upload 
                :action="serve.ApiUrl+'/equipments/import'" 
                :headers="token" 
                accept=".xls"
                :on-success="handleSuccess"
            >
                <Button type='primary' icon="ios-cloud-upload-outline">导入</Button>
            </Upload>
            <Button type='warning' icon='md-arrow-up' @click="exportFiles()">导出</Button>
        </div>
        <Table border :columns="columns" :data="equipments">
            <template slot-scope="{ index }" slot="action">
                <Button type="success" size="small" style="margin-right: 5px" icon='md-create'
                    @click="edit(index)">编辑</Button>
                <Button type="error" size="small" icon='md-trash' @click="remove(index)">删除</Button>
            </template>
        </Table>
        <el-pagination style="text-align: right" :total="page.total" :page-size="page.pageSize"
            :current-page="page.current" :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, jumper" @current-change="currentChange"
            @size-change="pageSizeChange"></el-pagination>

        <Modal v-model="flag_add" title="新增" @on-ok="addOk" @on-cancel="addCancel">
            <Form :model="addItem" :label-width="120">
                <FormItem label="ID:">
                    <InputNumber :min="0" v-model="addItem.id" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="设备名:">
                    <Input v-model="addItem.name" class="form-content-width"/>
                </FormItem>
                <FormItem label="IP:">
                    <Input v-model="addItem.ip" class="form-content-width"/>
                </FormItem>
                <FormItem label="端口:">
                    <InputNumber :min="0" v-model="addItem.port" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="父节点:">
                    <el-select v-model="addItem.connectFatherId" class="form-content-width">
                        <el-option v-for="equipment in allEquipments" :value="equipment.id" :key="equipment.id"
                            :label="equipment.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="所属场站:">
                    <el-select v-model="addItem.stationId" class="form-content-width">
                        <el-option v-for="station in stations" :value="station.id" :key="station.id"
                            :label="station.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="设备类型:">
                    <el-select v-model="addItem.equipmentType" class="form-content-width">
                        <el-option v-for="type in equipmentTypes" :value="type.val" :key="type.val" :label="type.key">
                        </el-option>
                    </el-select>
                </FormItem>
                <FormItem label="设备状态:">
                    <el-select v-model="addItem.equipmentState" class="form-content-width">
                        <el-option v-for="state in equipmentStates" :value="state.val" :key="state.val"
                            :label="state.key"></el-option>
                    </el-select>
                </FormItem>
            </Form>
        </Modal>
        <Modal v-model="flag_edit" title="编辑" @on-ok="editOk" @on-cancel="editCancel">
            <Form :model="editItem" :label-width="120">
                <FormItem label="ID:">
                    <InputNumber :min="0" v-model="editItem.id" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="设备名:">
                    <Input v-model="editItem.name" class="form-content-width"/>
                </FormItem>
                <FormItem label="IP:">
                    <Input v-model="editItem.ip" class="form-content-width"/>
                </FormItem>
                <FormItem label="端口:">
                    <InputNumber :min="0" v-model="editItem.port" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="父节点:">
                    <el-select v-model="editItem.connectFatherId" class="form-content-width">
                        <el-option v-for="equipment in allEquipments" :value="equipment.id" :key="equipment.id"
                            :label="equipment.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="所属场站:">
                    <el-select v-model="editItem.stationId" class="form-content-width">
                        <el-option v-for="station in stations" :value="station.id" :key="station.id"
                            :label="station.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="设备类型:">
                    <el-select v-model="editItem.equipmentType" class="form-content-width">
                        <el-option v-for="type in equipmentTypes" :value="type.val" :key="type.val" :label="type.key">
                        </el-option>
                    </el-select>
                </FormItem>
                <FormItem label="设备状态:">
                    <el-select v-model="editItem.equipmentState" class="form-content-width">
                        <el-option v-for="state in equipmentStates" :value="state.val" :key="state.val"
                            :label="state.key"></el-option>
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
    } from 'vue-property-decorator'
    import {
        Equipment,
        EquipmentVo
    } from '@/types/equipment.interface'
    import {
        getEquipments,
        addEquipment,
        editEquipment,
        deleteEquipment,
        getPageEquipmentsByCondition,
        exportEquipment
    } from '@/api/equipment'
    import {
        getStations
    } from '@/api/station'
    import {
        EnumType
    } from '@/types/enumtype.interface'
    import {
        Station
    } from '@/types/station.interface'
    import request from '@/util/request'

    @Component({})
    export default class ManagementClass extends Vue {
        allEquipments: Equipment[] = []
        equipments: Equipment[] = []
        stations: Station[] = []

        columns: any[] = [{
                title: 'ID',
                key: 'id',
                width: 100,
            },
            {
                title: '设备名',
                key: 'name',
            },
            {
                title: 'IP',
                key: 'ip',   
                width: 130,   
            },
            {
                title: '端口',
                key: 'port',
                width: 80
            },
            {
                title: '父节点',
                key: 'connectFatherName',
            },
            {
                title: '所属场站',
                key: 'stationName'
            },
            {
                title: '设备类型',
                key: 'equipmentTypeName'
            },
            {
                title: '设备状态',
                key: 'equipmentStateName'
            },
            {
                title: '创建时间',
                key: 'createTime',
                render: (h: any, params: any) => {
                    return h(
                        "div",
                        new Date(params.row.createTime).format("yyyy-MM-dd hh:mm:ss")
                    );
                },
                width: 150
            },
            {
                title: '操作',
                slot: 'action',
                width: 170,
                align: 'center'
            }
        ]

        /** 添加窗口是否弹出 */
        flag_add: boolean = false

        /** 下拉框中待选择的 */
        selectequipments: Equipment[] = [this.getDefaultItem()]

        /** 待添加的设备对象 */
        addItem: Equipment = this.getDefaultItem()

        /** 编辑窗口是否弹出 */
        flag_edit: boolean = false

        /** 待编辑的设备对象 */
        editItem: Equipment = this.getDefaultItem()

        /** 设备类型 */
        equipmentTypes: Array < EnumType > = this.$store.state.equipmentType

        /** 设备状态 */
        equipmentStates: Array < EnumType > = this.$store.state.equipmentStateType

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
            this.initData()
        }

        initData() {
            let vo: EquipmentVo = {
                pageNum: this.page.current,
                pageSize: this.page.pageSize
            }

            getEquipments().then(res => {
                if (res.data.code == 200) {
                    let tmp: Equipment = this.getDefaultItem()
                    tmp.name = "无"
                    this.allEquipments = res.data.data
                    this.allEquipments.unshift(tmp)
                }
            })

            Promise.all([getStations(), getPageEquipmentsByCondition(vo)]).then((res: any) => {
                // 场站
                if (res[0].data.code == 200) this.stations = res[0].data.data

                // 设备
                if (res[1].data.code == 200) {
                    this.page.total = res[1].data.data.totalSize
                    this.equipments = res[1].data.data.content

                    this.equipments.map((item: Equipment) => {
                        item.createTime = new Date(item.createTime)

                        let tmp_station: Station | undefined = this.stations.find((tmp: Station) =>
                            tmp.id == item.stationId)
                        item.stationName = tmp_station ? tmp_station.name : ''
                        let tmp_type: EnumType | undefined = this.equipmentTypes.find((tmp: EnumType) =>
                            tmp.val == item.equipmentType)
                        item.equipmentTypeName = tmp_type ? tmp_type.key : ''
                        let tmp_state: EnumType | undefined = this.equipmentStates.find((tmp:
                            EnumType) => tmp.val == item.equipmentState)
                        item.equipmentStateName = tmp_state ? tmp_state.key : ''

                        this.allEquipments.find((tep: Equipment) => {
                            if (tep.id == item.connectFatherId)
                                item.connectFatherName = tep.name
                        })
                    })
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
        getDefaultItem(): Equipment {
            return {
                id: 0,
                name: '',
                sn: '',
                ip: '127.0.0.1',
                port: 0,
                connectFatherId: 0,
                stationId: 0,
                stationName: '',
                equipmentType: 0,
                equipmentTypeName: '',
                equipmentState: 0,
                equipmentStateName: '',
                createTime: new Date()
            }
        }

        /** 添加新对象 */
        addModel() {
            this.flag_add = true
        }

        edit(index: number) {
            this.flag_edit = true
            this.editItem = this.equipments[index]
        }

        remove(index: number) {
            deleteEquipment(this.equipments[index].id).then((res: any) => {
                let {
                    code,
                    data
                } = res.data
                if (code == 200) {
                    this.initData()
                    this.$Message.success("删除成功！！！")
                } else {
                    this.$Message.info("删除出错！！！")
                }
            })
        }

        /** 添加设备 */
        addOk() {
            addEquipment(this.addItem).then((res: any) => {
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

        /** 取消添加设备 */
        addCancel() {
            this.flag_add = false
            this.addItem = this.defaultItem
        }

        /** 编辑设备 */
        editOk() {
            editEquipment(this.editItem).then((res: any) => {
                let {
                    code,
                    data
                } = res.data
                if (code == 200) {
                    this.flag_edit = false
                    this.initData()
                    this.$Message.success("编辑成功！")
                } else {
                    this.$Message.error("编辑出错！")
                }
            })
        }

        /** 取消编辑设备 */
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
            exportEquipment().then(res => {
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

<style scoped>
    .btnClass button {
        margin: 0px 10px;
    }
</style>