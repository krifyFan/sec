<template>
    <div>
        <h4>用户管理</h4>
        <div class='btnClass'>
            <Button type='info' icon='md-add' v-permission="['user:add']" @click="addModel">新建</Button>
            <!-- <Button type='warning' icon='md-arrow-down'>导出</Button> -->
        </div>
        <Table border :columns="columns" :data="users">
            <template slot-scope="{ row, index }" slot="action">
                <Button type="success" size="small" style="margin-right: 5px" icon='md-create'
                    @click="edit(index)">编辑</Button>
                <Button type="error" size="small" icon='md-trash' @click="remove(index)">删除</Button>
            </template>
        </Table>

        <Modal v-model="flag_add" title="新增" @on-ok="addOk" @on-cancel="addCancel">
            <Form v-if="flag_add" :model="addItem" :label-width="120">
                <FormItem label="用户名:">
                    <Input v-model="addItem.name" class="form-content-width"/>
                </FormItem>
                <FormItem label="密码:">
                    <Input type="password" v-model="addItem.password" class="form-content-width"/>
                </FormItem>
                <FormItem label="确认密码:">
                    <Input type="password" v-model="addItem.confirmPassword" class="form-content-width"/>
                </FormItem>
                <FormItem label="用户角色:">
                    <el-select v-model="editRoleIds" multiple class="form-content-width">
                        <el-option v-for="item in roles" :value="item.id" :key="item.id" :label="item.name">
                        </el-option>
                    </el-select>
                </FormItem>
                <FormItem label="默认部门:">
                    <el-select v-model="addItem.managementId" class="form-content-width" @change="changeManage">
                        <el-option v-for="management in managements" :value="management.id" :key="management.id"
                            :label="management.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="默认场站:">
                    <el-select v-model="addItem.stationId" class="form-content-width">
                        <el-option v-for="station in selectStaton" :value="station.id" :key="station.id"
                            :label="station.name"></el-option>
                    </el-select>
                </FormItem>
            </Form>
        </Modal>
        <Modal v-model="flag_edit" title="编辑" @on-ok="editOk" @on-cancel="editCancel">
            <Form :model="editItem" :label-width="120">
                <FormItem label="用户名:">
                    <Input v-model="editItem.name" class="form-content-width"/>
                </FormItem>
                <FormItem label="用户角色:">
                    <el-select v-model='editRoleIds' multiple class="form-content-width">
                        <el-option v-for="item in roles" :value="item.id" :key="item.id" :label="item.name">
                        </el-option>
                    </el-select>
                </FormItem>
                <FormItem label="默认部门:">
                    <el-select v-model="editItem.managementId" class="form-content-width" @change="changeManage">
                        <el-option v-for="management in managements" :value="management.id" :key="management.id"
                            :label="management.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="默认场站:">
                    <el-select v-model="editItem.stationId" class="form-content-width">
                        <el-option v-for="station in selectStaton" :value="station.id" :key="station.id"
                            :label="station.name"></el-option>
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
        User
    } from '@/types/user.interface'
    import {
        Management
    } from '@/types/management.interface'
    import {
        Station
    } from '@/types/station.interface'
    import {
        getUsers,
        addUser,
        deleteUser,
        editUser,
    } from '@/api/user'
    import {
        getManagements,
        getDefaultManagement
    } from '@/api/management'
    import {
        getStations,
        getStationsByManagement
    } from '@/api/station'
    import {
        getRoles,
        getRolesByUser,
        updateRelationShipOfUserAndRole
    } from '@/api/role'
    import {
        sha256
    } from 'js-sha256';
    import {
        Role
    } from '@/types/role.interface'

    @Component({})
    export default class UserClass extends Vue {
        users: User[] = []
        managements: Management[] = []
        stations: Station[] = []
        selectStaton: Station[] = []

        columns: any[] = [{
                title: 'ID',
                key: 'id'
            },
            {
                title: '用户名',
                key: 'name'
            },
            {
                title: '默认部门',
                key: 'managementName'
            },
            {
                title: '默认场站',
                key: 'stationName'
            },
            {
                title: '操作',
                slot: 'action',
                width: 200,
                align: 'center'
            }
        ]

        /** 添加窗口是否弹出 */
        flag_add: boolean = false

        /** 待添加的用户对象 */
        addItem: User = this.getDefaultItem()

        /** 编辑窗口是否弹出 */
        flag_edit: boolean = false

        /** 待编辑的用户对象 */
        editItem: User = this.getDefaultItem()

        /** 所有的角色 */
        roles: Role[] = []
        /** 待添加或编辑的角色 */
        editRoleIds: number[] = []

        mounted() {
            this.initData()
        }

        initData() {
            Promise.all([getUsers(), getManagements(), getStations(), getRoles()]).then((res: any) => {
                if (res[0].data.code == 200) this.users = res[0].data.data
                // 筛选根节点的管理部门，用户只能与这样的管理部门挂钩
                if (res[1].data.code == 200) this.managements = res[1].data.data
                this.managements.unshift(getDefaultManagement())
                if (res[2].data.code == 200) this.stations = res[2].data.data
                this.stations.unshift({
                    id: 0,
                    name: '无',
                })

                this.users.map((item: User) => {
                    let tmp: Management | undefined = this.managements.find((mana: Management) => item
                        .managementId == mana.id)
                    item.managementName = tmp ? tmp.name : "无"

                    let stationIndex: number = this.stations.findIndex(a => a.id == item.stationId)
                    item.stationName = stationIndex < 0 ? "" : this.stations[stationIndex].name
                })

                if (res[3].data.code == 200) this.roles = res[3].data.data
            })
        }

        changeManage(id: number) {
            this.selectStaton = []
            getStationsByManagement(id).then(res => {
                let { code, data } = res.data
                if (code === 200) {
                    this.selectStaton = data
                }
            })
        }

        getDefaultItem(): User {
            return {
                id: 0,
                name: '',
                password: '',
                confirmPassword: '',
                managementId: 0,
                managementName: '',
                stationId: null,
                stationName: '',
            }
        }

        /** 添加新对象 */
        addModel() {
            this.flag_add = true
        }

        edit(index: number) {
            this.flag_edit = true
            this.editItem = this.users[index]

            getRolesByUser(this.editItem.id).then(res => {
                if (res.data.code == 200) {
                    this.editRoleIds = res.data.data.map(d => {
                        return d.id
                    })
                }
            })
        }

        remove(index: number) {
            this.$Modal.confirm({
                title: '删除用户',
                content: '<p>确定要删除该用户吗？</p>',
                onOk: ()=>{
                    deleteUser(this.users[index].id).then((res: any) => {
                        let {
                            code,
                            data
                        } = res.data
                        if (code == 200) {
                            this.$Message.success("删除成功！")
                            this.initData()
                        } else {
                            this.$Message.info("删除出错！")
                        }
                    }).catch(err => {
                        this.$Message.error("删除失败！" + err)
                    })
                }
            })
        }

        /** 添加用户 */
        addOk() {
            if (this.addItem.password == this.addItem.confirmPassword) {
                this.addItem.password = sha256(this.addItem.password)
                let params = {
                    name: this.addItem.name,
                    password: this.addItem.password,
                    confirmPassword: this.addItem.confirmPassword,
                    managementId: this.addItem.managementId,
                    managementName: this.addItem.managementName,
                    stationId: this.addItem.stationId,
                    stationName: this.addItem.stationName,
                }
                addUser(params).then((res: any) => {
                    let {
                        code,
                        data
                    } = res.data
                    if (code == 200) {

                        let afterAddItem: User = res.data.data
                        this.updateUserAndRoleRelationShip(afterAddItem.id, this.editRoleIds)
                        this.$Message.success('添加成功！')
                        this.initData()

                    } else {
                        this.$Message.info("添加出错！")
                    }
                }).catch(err=>{
                    this.$Message.warning('添加出错'+err)        
                })
            } else {
                this.$Message.info("密码不一致！")
            }
        }

        /** 取消添加用户 */
        addCancel() {
            this.flag_add = false
            this.addItem = this.getDefaultItem()
        }

        /** 编辑用户 */
        editOk() {
            editUser(this.editItem).then((res: any) => {
                let {
                    code,
                    data
                } = res.data
                if (code == 200) {
                    this.flag_edit = false
                    this.initData()
                } else {
                    this.$Message.info("编辑出错！")
                }
            })

            this.updateUserAndRoleRelationShip(this.editItem.id, this.editRoleIds)
        }

        /** 取消编辑用户 */
        editCancel() {
            this.flag_edit = false
        }


        /** 更新用户和角色之间的关联关系 */
        updateUserAndRoleRelationShip(userId: number, roleIds: number[]) {
            updateRelationShipOfUserAndRole(userId, roleIds).then(res => {
                if (res.data.code == 200) {
                    location.reload()
                }
            }).catch(err => {
                this.$Message.error("更新关系出错！" + err)
            })
        }
    }
</script>
