<template>
    <div>
        <h4>监测对象管理</h4>
        <div class='btnClass'>
            <Button type='info' icon='md-add' @click="addModel">新建</Button>
            <Upload 
                :action="serve.ApiUrl+'/measobjects/import'" 
                :headers="token" 
                accept=".xls"
                :on-success="handleSuccess"
            >
                <Button type='primary' icon="ios-cloud-upload-outline">导入</Button>
            </Upload>
            <Button type='warning' icon='md-arrow-down' @click="exportFiles()">导出</Button>
        </div>
        <Table border :columns="columns" :data="measObjects">
            <template slot-scope="{ index }" slot="action">
                <Button type="success" size="small" style="margin-right: 5px" icon='md-create'
                    @click="edit(index)">编辑</Button>
                <Button type="error" size="small" icon='md-trash' @click="remove(index)">删除</Button>
            </template>
        </Table>
        <el-pagination 
            style="text-align: right" 
            :total="page.total" 
            :page-size="page.pageSize"
            :current-page="page.current"
            layout="total, prev, pager, next, jumper" 
            @current-change="currentChange"
            @size-change="pageSizeChange"></el-pagination>


        <Modal v-model="flag_add" title="新增" @on-ok="addOk" @on-cancel="addCancel">
            <Form v-if="flag_add" :model="addItem" :label-width="120">
                <FormItem label="ID:">
                    <InputNumber :min="0" v-model="addItem.id" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="对象名:">
                    <Input v-model="addItem.name" class="form-content-width"/>
                </FormItem>
                <FormItem label="所属场站:">
                    <el-select v-model="addItem.stationId" class="form-content-width">
                        <el-option v-for="station in stations" :value="station.id" :key="station.id"
                            :label="station.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="对象类型:">
                    <el-select v-model="addItem.objectType" class="form-content-width">
                        <el-option v-for="type in objectType" :value="type.val" :key="type.val" :label="type.key">
                        </el-option>
                    </el-select>
                </FormItem>
                <FormItem label="数据类型:">
                    <el-select v-model="addItem.dataType" class="form-content-width">
                        <el-option v-for="type in dataType" :value="type.val" :key="type.val" :label="type.key">
                        </el-option>
                    </el-select>
                </FormItem>
                <FormItem label="所属设备:">
                    <el-select v-model="addItem.equipmentId" class="form-content-width">
                        <el-option v-for="item in equipments" :key="item.id" :value="item.id" :label="item.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="使用情况:">
                    <Checkbox v-model="addItem.actived">是否使用</Checkbox>
                </FormItem>
            </Form>
        </Modal>
        <Modal v-model="flag_edit" title="编辑" @on-ok="editOk" @on-cancel="editCancel">
            <Form :model="editItem" :label-width="120">
                <FormItem label="ID:">
                    <InputNumber :min="0" v-model="editItem.id" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="对象名:">
                    <Input v-model="editItem.name" class="form-content-width"/>
                </FormItem>
                <FormItem label="所属场站:">
                    <el-select v-model="editItem.stationId" class="form-content-width">
                        <el-option v-for="station in stations" :value="station.id" :key="station.id"
                            :label="station.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="对象类型:">
                    <el-select v-model="editItem.objectType" class="form-content-width">
                        <el-option v-for="type in objectType" :value="type.val" :key="type.val" :label="type.key">
                        </el-option>
                    </el-select>
                </FormItem>
                <FormItem label="数据类型:">
                    <el-select v-model="editItem.dataType" class="form-content-width">
                        <el-option v-for="type in dataType" :value="type.val" :key="type.val" :label="type.key">
                        </el-option>
                    </el-select>
                </FormItem>
                <FormItem label="所属设备:">
                    <el-select v-model="editItem.equipmentId" class="form-content-width">
                        <el-option v-for="item in equipments" :key="item.id" :value="item.id" :label="item.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="使用情况:">
                    <Checkbox v-model="editItem.actived">是否使用</Checkbox>
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
        MeasObject,
        MeasObjectVo
    } from '@/types/measobject.interface'
    import {
        Station
    } from '@/types/station.interface'
    import {
        getMeasObjects,
        addMeasObject,
        editMeasObject,
        deleteMeasObject,
        selectMeasObjectsByCondition,
        exportMeasObj
    } from '@/api/measobject'
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
    export default class MeasObjectClass extends Vue {
        stations: Station[] = []
        measObjects: MeasObject[] = []
        equipments: Equipment[] = []

        columns: any[] = [
            {
                title: 'ID',
                key: 'id'
            },
            {
                title: '监测对象名',
                key: 'name'
            },
            {
                title: '所属场站',
                key: 'stationName'
            },
            {
                title: '对象类型',
                key: 'objectTypeName'
            },
            {
                title: '数据类型',
                key: 'dataTypeName'
            },
            {
                title: '所属设备',
                key: 'equipmentName'
            },
            {
                title: '是否使用',
                key: 'actived',
                align: 'center',
                render: (h, param) => {
                    let name: string = ''
                    if (param.row.actived) {
                        name = '是'
                    } else {
                        name = '否'
                    }
                    return h('div', name)
                }
            },
            {
                title: '创建时间',
                key: 'createTime',
                align: 'center',
                render: (h: any, params: any) => {
                    return h(
                        "div",
                        new Date(params.row.createTime).format("yyyy-MM-dd hh:mm:ss")
                    );
                },
                width: 160
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

        /** 待添加的对象 */
        addItem: MeasObject = this.getDefaultItem()

        /** 编辑窗口是否弹出 */
        flag_edit: boolean = false

        /** 待编辑的对象 */
        editItem: MeasObject = this.getDefaultItem()

        /** 对象类型 */
        objectType: Array < EnumType > = this.$store.state.objectType

        /** 数据类型 */
        dataType: Array < EnumType > = this.$store.state.dataType

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
            let pageParam: MeasObjectVo = {
                pageNum: this.page.current,
                pageSize: this.page.pageSize
            }

            Promise.all([getStations(), getEquipments(), selectMeasObjectsByCondition(pageParam)]).then((res: any) => {
                // 场站
                if (res[0].data.code == 200) this.stations = res[0].data.data

                // 设备
                if (res[1].data.code == 200) this.equipments = res[1].data.data

                // 监测对象
                if (res[2].data.code == 200) {
                    this.page.total = res[2].data.data.totalSize

                    this.measObjects = res[2].data.data.content
                    this.measObjects.map((item: MeasObject) => {
                        item.createTime = new Date(item.createTime)

                        let tmp_station: Station | undefined = this.stations.find((tmp: Station) =>
                            tmp.id == item.stationId)
                        item.stationName = tmp_station ? tmp_station.name : ''
                        let tmp_objtype: EnumType | undefined = this.objectType.find((tmp: EnumType) =>
                            tmp.val == item.objectType)
                        item.objectTypeName = tmp_objtype ? tmp_objtype.key : ''
                        let tmp_datatype: EnumType | undefined = this.dataType.find((tmp:
                            EnumType) => tmp.val == item.dataType)
                        item.dataTypeName = tmp_datatype ? tmp_datatype.key : ''

                        let tmp_equipment: Equipment | undefined = this.equipments.find((tmp: 
                            Equipment) => tmp.id == item.equipmentId)
                        item.equipmentName = tmp_equipment ? tmp_equipment.name : ''
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
        getDefaultItem(): MeasObject {
            return {
                id: 0,
                name: '',
                stationId: 0,
                stationName: '',
                objectType: 0,
                objectTypeName: '',
                dataType: 0,
                dataTypeName: '',
                equipmentId: null,
                actived: true,
                createTime: new Date()
            }
        }

        /** 添加新对象 */
        addModel() {
            this.flag_add = true
        }

        edit(index: number) {
            this.flag_edit = true
            this.editItem = this.measObjects[index]
        }

        remove(index: number) {
            this.$Modal.confirm({
                title: '删除检测对象',
                content: '<p>确定要删除监测对象吗？</p>',
                onOk: () => {
                    deleteMeasObject(this.measObjects[index].id).then((res: any) => {
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
            addMeasObject(this.addItem).then((res: any) => {
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
            editMeasObject(this.editItem).then((res: any) => {
                let {
                    code,
                    data
                } = res.data
                if (code == 200) {
                    this.flag_edit = false
                    this.initData()
                    this.$Message.success('编辑成功！')
                } else {
                    this.$Message.error("编辑出错！")
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
            exportMeasObj().then(res => {
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