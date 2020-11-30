<template>
    <div>
        <h4>激光甲烷</h4>
        <div class="btnClass">
            <Button type="info" icon="md-add" @click="addModel">新建</Button>
            <!-- <Button type="warning" icon="md-arrow-down">导出</Button> -->
        </div>
        <Table border :columns="columns" :data="tableData">
            <template slot-scope="{ index }" slot="action">
                <Button type="success" size="small" style="margin-right: 5px" icon="md-create"
                    @click="edit(index)">编辑</Button>
                <Button type="error" size="small" icon="md-trash" @click="remove(index)">删除</Button>
            </template>
        </Table>
        <el-pagination style="text-align: right" :total="page.total" :page-size="page.pageSize"
            :current-page="page.current"
            layout="total, prev, pager, next, jumper" @current-change="currentChange"></el-pagination>

        <Modal v-model="flag_add" title="新增" @on-ok="addOk" @on-cancel="addCancel" width="800">
            <Form :model="addItem" :label-width="120">
                <FormItem label="ID：">
                    <Input v-model="addItem.id" class="form-content-width"/>
                </FormItem>
                <FormItem label="对象名：">
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
                <FormItem label="所有子对象：">
                    <Table border :columns="childColumns" :data="addItem.children">
                        <template slot-scope="{ index }" slot="action">
                            <Button type="error" size="small" icon="md-trash" @click="addItemRemove(index)">删除</Button>
                        </template>
                    </Table>
                </FormItem>
                <FormItem label="新增子节点：">
                    <Input v-model="addChild.index" placeholder="填写序号" style="width: 100px" />
                    <Input v-model="addChild.id" placeholder="填写id" style="width: 200px" />
                    <Input v-model="addChild.description" placeholder="填写描述" style="width: 280px" />
                    <Button type="primary" @click="addItemChild">新增</Button>
                </FormItem>
            </Form>
        </Modal>
        <Modal v-model="flag_edit" title="编辑" @on-ok="editOk" @on-cancel="editCancel" width="800">
            <Form :model="editItem" :label-width="120">
                <FormItem label="ID：">
                    <Input v-model="editItem.id" class="form-content-width"/>
                </FormItem>
                <FormItem label="对象名：">
                    <Input v-model="editItem.name" class="form-content-width"/>
                </FormItem>
                <FormItem label="所属场站：">
                    <el-select v-model="editItem.stationId" class="form-content-width">
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
                <FormItem label="所有子对象：">
                    <Table border :columns="childColumns" :data="editItem.children">
                        <template slot-scope="{ index }" slot="action">
                            <Button type="error" size="small" icon="md-trash" @click="editItemRemove(index)">删除</Button>
                        </template>
                    </Table>
                </FormItem>
                <FormItem label="新增子节点：">
                    <Input v-model="addChild.index" placeholder="填写序号" style="width: 100px" />
                    <Input v-model="addChild.id" placeholder="填写id" style="width: 200px" />
                    <Input v-model="addChild.description" placeholder="填写描述" style="width: 280px" />
                    <Button type="primary" @click="editItemChild">新增</Button>
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue
    } from "vue-property-decorator"
    import {
        ComplexObject,
        ComplexChild
    } from "@/types/complexobject.interface"
    import {
        Station
    } from "@/types/station.interface"
    import {
        EnumType
    } from "@/types/enumtype.interface"
    import {
        PageQuery
    } from "@/types/pagequery.interface"
    import {
        getStations
    } from "@/api/station"
    import {
        getDefaultComplexObject,
        getDefaultComplexChild,
        getComplexObjectByCondition,
        deleteComplexObject,
        editComplexObject,
        addComplexObject,
    } from '@/api/complexobject'
    import {
        MeasObjectVo
    } from '@/types/measobject.interface'
    import { getEquipments } from '@/api/equipment'
    import { Equipment } from '@/types/equipment.interface'

    @Component({})
    export default class MeasObjectClass extends Vue {
        stations: Station[] = []
        objects: ComplexObject[] = []
        tableData: any[] = []
        equipments: Equipment[] = []

        columns: any[] = [{
                title: "ID",
                key: "id",
            },
            {
                title: "监测对象名",
                key: "name",
            },
            {
                title: "所属场站",
                key: "stationName",
            },
            {
                title: "操作",
                slot: "action",
                width: 170,
                align: "center",
            }
        ]

        childColumns: any[] = [{
            title: "序号",
            key: "index",
            width: 100
        }, {
            title: "对象ID",
            key: "id",
            width: 150
        }, {
            title: "描述",
            key: "description"
        }, {
            title: "操作",
            slot: "action",
            width: 150,
            align: "center",
        }]

        /** 添加窗口是否弹出 */
        flag_add: boolean = false

        /** 待添加的对象 */
        addItem: ComplexObject = getDefaultComplexObject()

        /** 编辑窗口是否弹出 */
        flag_edit: boolean = false

        /** 待编辑的对象 */
        editItem: ComplexObject = getDefaultComplexObject()

        /** 对象类型 激光甲烷 */
        objectType: number = 5

        /** 数据类型 复杂类型 */
        dataType: number = 5

        objectTypes: EnumType[] = this.$store.state.objectType
        dataTypes: EnumType[] = this.$store.state.dataType

        /** 待添加的孩子 */
        addChild: ComplexChild = getDefaultComplexChild()

        /** 分页 */
        page: any = {
            total: 0,
            pageSize: 10,
            current: 1,
        }

        mounted() {
            this.getEquipments()
            this.initData();
        }

        initData() {
            let vo: MeasObjectVo = {
                objectType: this.objectType,
                pageNum: this.page.current,
                pageSize: this.page.pageSize,
            }

            Promise.all([
                getStations(),
                getComplexObjectByCondition(vo),
            ]).then(res => {
                // 场站
                if (res[0].data.code == 200) this.stations = res[0].data.data;

                // 激光甲烷
                if (res[1].data.code == 200) {
                    this.page.total = res[1].data.data.totalSize
                    let tmpObjects: any[] = res[1].data.data.content

                    this.objects.length = 0
                    this.tableData.length = 0
                    tmpObjects.forEach(o => {
                        let tmp_station: Station | undefined = this.stations.find(
                            (tmp: Station) => tmp.id == o.stationId
                        )
                        let tmp_o: ComplexObject = Object.assign(o, {
                            createTime: new Date(o.createTime),
                            stationName: tmp_station ? tmp_station.name : ""
                        })
                        this.objects.push(tmp_o)
                        this.tableData.push({
                            id: tmp_o.id,
                            name: tmp_o.name,
                            stationName: tmp_o.stationName
                        })
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
            this.page.current = value
            this.initData()
        }

        /** 添加新对象 */
        addModel() {
            this.flag_add = true
        }

        edit(index: number) {
            this.flag_edit = true
            this.editItem = this.objects[index]
        }

        remove(index: number) {
            this.$Modal.confirm({
                title: '删除激光甲烷',
                content: '确定要删除该条激光甲烷信息吗？',
                onOk: () => {
                    deleteComplexObject(this.objects[index].id).then((res: any) => {
                        let {
                            code,
                            data
                        } = res.data;
                        if (code == 200) {
                            this.initData()
                            this.$Message.success("删除成功！")
                        } else {
                            this.$Message.error("删除出错！")
                        }
                    });
                }
            })
        }

        addItemRemove(index: number) {
            this.addItem.children.splice(index, 1)
        }

        addItemChild() {
            this.addItem.children.push(this.addChild)
            this.addChild = getDefaultComplexChild()
        }

        /** 添加对象 */
        addOk() {
            this.addItem.value = JSON.stringify(this.addItem.children)

            addComplexObject(this.addItem).then((res: any) => {
                let {
                    code,
                    data
                } = res.data;
                if (code == 200) {
                    this.flag_add = false
                    this.addItem = getDefaultComplexObject()
                    this.initData()
                    this.$Message.success('添加成功！')
                } else {
                    this.$Message.error("添加出错！")
                }
            });
        }

        /** 取消添加 */
        addCancel() {
            this.flag_add = false;
            this.addItem = getDefaultComplexObject()
        }

        editItemRemove(index: number) {
            this.editItem.children.splice(index, 1)
        }

        editItemChild() {
            this.editItem.children.push(this.addChild)
            this.addChild = getDefaultComplexChild()
        }

        /** 编辑对象 */
        editOk() {
            this.editItem.value = JSON.stringify(this.editItem.children)

            editComplexObject(this.editItem).then((res: any) => {
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
            this.flag_edit = false;
        }
    }
</script>