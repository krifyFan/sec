<template>
    <div>
        <h4>角色管理</h4>
        <div class='btnClass'>
            <Button type='info' icon='md-add' v-permission="['role:add']" @click="addModel">新建</Button>
            <!-- <Button type='success' icon='md-create' v-permission="['role:edit']">修改</Button>
            <Button type='error' icon='md-trash' v-permission="['role:delete']">删除</Button> -->
            <!-- <Button type='warning' icon='md-arrow-down'>导出</Button> -->
        </div>
        <Table border :columns="columns" :data="roles">
            <template slot-scope="{ index }" slot="action">
                <Button type="success" size="small" style="margin-right: 5px" icon='md-create'
                    @click="edit(index)">编辑</Button>
                <Button type="error" size="small" icon='md-trash' @click="remove(index)">删除</Button>
            </template>
        </Table>
        <Modal v-model="flag_add" title="新增" @on-ok="addOk" @on-cancel="addCancel">
            <Form v-if="flag_add" :model="addItem" :label-width="120">
                <FormItem label="角色名:">
                    <Input v-model="addItem.name" class="form-content-width"/>
                </FormItem>
                <FormItem label="角色权限:">
                    <el-select v-model='addPermissions' multiple class="form-content-width">
                        <el-option v-for="item in permissions" :value="item.name" :key="item.id" :label="item.name">
                        </el-option>
                    </el-select>
                </FormItem>
                <FormItem label="角色告警权限:">
                    <el-select v-model='addItem.permissions' multiple @change="editChange" class="form-content-width">
                        <el-option v-for="(item, index) in alarmPermissions" :value="item.val" :key="index" :label="item.key">
                        </el-option>
                    </el-select>
                </FormItem>
            </Form>
        </Modal>
        <Modal v-model="flag_edit" title="编辑角色" @on-ok='editOk' @on-cancel='editCancel'>
            <Form :model="editItem" :label-width="120">
                <FormItem label="角色名:">
                    <Input v-model="editItem.name" class="form-content-width"/>
                </FormItem>
                <FormItem label="角色权限:">
                    <el-select v-model='editPermissions' multiple class="form-content-width">
                        <el-option v-for="item in permissions" :value="item.name" :key="item.id" :label="item.name">
                        </el-option>
                    </el-select>
                </FormItem>
                <FormItem label="角色告警权限:">
                    <el-select v-model='editItem.permissions' multiple @change="editChange" class="form-content-width">
                        <el-option v-for="(item, index) in alarmPermissions" :value="item.val" :key="index" :label="item.key">
                        </el-option>
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
        Role
    } from '@/types/role.interface'
    import {
        Permission,
        AlarmPermission
    } from '@/types/permission.interface'
    import {
        getRoles,
        getDefaultItem,
        addRole,
        editRole,
        deleteRole
    } from '@/api/role'
    import {
        getPermissions,
        getPermissionsByRole,
        updateRelationShipOfRoleAndPermission
    } from '@/api/permission'
    import { getAlarmType } from '@/api/alarm'
import { log } from 'three'

    @Component({})
    export default class RoleClass extends Vue {
        /** 添加窗口是否弹出 */
        flag_add: boolean = false
        /** 新增角色 */
        addItem: Role = getDefaultItem()
        /** 编辑窗口是否弹出 */
        flag_edit: boolean = false
        /** 当前编辑角色 */
        editItem: Role = getDefaultItem()
        /** 新增角色可关联的权限 */
        addPermissions: string[] = []
        /** 当前角色可关联的权限 */
        editPermissions: string[] = []
        /** 所有的权限 */
        permissions: Permission[] = []
        /** 所有告警权限集合 */
        alarmPermissions = []

        roles: Role[] = []

        columns: any[] = [{
                title: 'ID',
                key: 'id',
                width: 100
            },
            {
                title: '角色名',
                key: 'name',
                width: 150
            },
            {
                title: '告警权限',
                key: 'permissionNames'
            },
            {
                title: '操作',
                slot: 'action',
                width: 200,
                align: 'center'
            }
        ]

        mounted() {
            this.initData()
        }

        editChange(val: any) {
            console.log("change", val)
        }

        initData() {
            getAlarmType().then(res => {
                let {
                    code,
                    data
                } = res.data
                if (code == 200) {
                    this.alarmPermissions = data
                }
            })
            getRoles().then((res: any) => {
                let {
                    code,
                    data
                } = res.data
                this.roles = []
                if (code == 200) {
                    (data as any[]).forEach((d: any) => {
                        
                        this.roles.push({
                            id: d.id,
                            name: d.name,
                            alarmPermissionStr: d.alarmPermissionStr,
                            permissions: [],
                            permissionNames: []
                        })
                    })

                    this.roles.map((role: Role) => {
                        role.permissions = new Array()
                        role.alarmPermissionStr.split(',').forEach((s: string) => {
                            
                            let permissionIndex = this.alarmPermissions.findIndex(
                                (t) => t.val == Number(s) 
                            )
                            if (permissionIndex < 0) return
                            role.permissions.push(this.alarmPermissions[permissionIndex].val)
                            role.permissionNames.push(this.alarmPermissions[permissionIndex].key)
                        })
                    })

                }
            })
            getPermissions().then((res: any) => {
                let {
                    code,
                    data
                } = res.data
                if (code == 200) {
                    this.permissions = data
                }
            })
            
        }

        addModel() {
            this.flag_add = true
        }

        edit(index: number) {
            this.flag_edit = true
            this.editItem = this.roles[index]
            getPermissionsByRole(this.editItem.id).then((res: any) => {
                let {
                    code,
                    data
                } = res.data
                if (code == 200) {
                    this.editPermissions = (data as any[]).map((a: any) => {
                        return a.name
                    })
                }
            })
        }

        remove(index: number) {
            this.$Modal.confirm({
                title: '删除角色',
                content: '<p>确定要删除角色吗</p>',
                onOk: ()=>{
                    deleteRole(this.roles[index].id).then(res => {
                        if (res.data.code == 200) {
                            this.$Message.success("删除成功！")
                            this.initData()
                        } else {
                            this.$Message.warning("删除失败！")
                        }
                    }).catch(err => {
                        this.$Message.error("删除失败！" + err)
                    })
                }
            })
        }

        /** 添加场站 */
        addOk() {
            this.addItem.alarmPermissionStr = ""
            this.addItem.alarmPermissionStr += this.addItem.permissions.toString()
            addRole(this.addItem).then((res: any) => {
                if (res.data.code != 200) return

                let afterAddItem: Role = res.data.data
                this.$Message.success('添加成功！')
                this.initData()

                this.updateRoleAndPermissionRelationShip(afterAddItem.id, this.addPermissions)
            })
        }

        /** 取消添加场站 */
        addCancel() {
            this.flag_add = false
            this.addItem = getDefaultItem()
        }

        editOk() {
            this.editItem.alarmPermissionStr = ""
            this.editItem.alarmPermissionStr += this.editItem.permissions.toString()

            editRole(this.editItem).then((res: any) => {
                if (res.data.code != 200) return

                this.$Message.success('修改成功！')
                this.initData()                
            })
            // this.updateRoleAndPermissionRelationShip(this.editItem.id, this.editPermissions)
        }

        editCancel() {
            this.flag_edit = false
            location.reload()
        }

        /** 更新角色和权限之间的关联关系 */
        updateRoleAndPermissionRelationShip(roleId: number, permissions: string[]) {
            let permissionIds: number[] = []
            permissions.forEach((element: string) => {
                let t: Permission | undefined = this.permissions.find((a: Permission) => {
                    return a.name === element
                })

                if (t != undefined) permissionIds.push(t.id as number)
            });

            updateRelationShipOfRoleAndPermission({
                roleId: roleId,
                permissionIds: permissionIds
            }).then((res: any) => {
                let {
                    code,
                    data
                } = res.data
                if (code == 200) {
                    location.reload()
                }
            })
        }

        cancel() {
            console.log("cancel")
        }
    }
</script>

<style scoped>
    .btnClass button {
        margin: 0px 10px;
    }
</style>