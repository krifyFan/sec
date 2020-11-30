<template>
    <div>
        <h4>部门管理</h4>
        <div class='btnClass'>
            <Button type='info' icon='md-add' @click="addModel">新建</Button>
        </div>
        <Table border :columns="columns" :data="departmentData">
            <template slot-scope="{ index }" slot="action">
                <Button type="success" size="small" style="margin-right: 5px" icon='md-create'
                    @click="edit(index)">编辑</Button>
                <Button type="error" size="small" icon='md-trash' @click="remove(index)">删除</Button>
            </template>
        </Table>
        <!-- <el-pagination style="text-align: right" :total="page.total" :page-size="page.pageSize"
            :current-page="page.current" @current-change="currentChange"
            layout="total, prev, pager, next, jumper"></el-pagination> -->

        <Modal class="departmentDialog" v-model="flag" :title="modalTitle" @on-cancel="addCancel">
            <Form v-if="flag" ref="departmentForm" :model="departmentItem" :label-width="120" :rules="ruleInline">
                <FormItem label="编号" prop="id">
                    <Input v-model="departmentItem.id" @on-blur="checkId(departmentItem.id)"></Input>
                    <div class="ivu-form-item-error-tip" v-if="isExist">
                        id已经存在，请重新输入
                    </div>
                </FormItem>
                <FormItem label="部门名称" prop="name">
                    <Input v-model="departmentItem.name"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="primary" v-show="modalTitle=='新增'" @click="addDepartment()">确定</Button>
                <Button type="primary" v-show="modalTitle=='编辑'" @click="editDepartment()">确定</Button>
            </div>
        </Modal>
    </div>
</template>
<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import {
        getDepartment,
        addDepartment,
        editDepartment,
        deleteDepartment,
        exportDepartment,
        getDepartmentDetails
    } from '@/api/department'
    import request from '@/util/request'
    interface Department {
        id?: number | null
        name: string | null
    }

    @Component({})
    export default class DepartmentClass extends Vue {


        departmentData: {id: number, name: string}[] = []

        columns: any[] = [
            {
                title: '编号',
                key: 'id'
            },
            {
                title: '部门名称',
                key: 'name'
            },
            {
                title: '操作',
                slot: 'action',
                width: 170,
                align: "center",
            }
        ]

        departmentItem: Department = {
            id: null,
            name: null
        }

        flag: boolean = false

        modalTitle: string = '新增'

        /** 分页 */
        page: any = {
            total: 0,
            pageSize: 10,
            current: 1,
        }

        /** 后端访问地址 */
        url: string = '/file'

        isExist: boolean = false

        get token() {
            return {
                'Authorization': this.$store.state.token
            }
        }

        mounted() {
            this.initData()
        }

        initData() {
            Promise.all([getDepartment()]).then((res: any) => {
                if (res[0].data.code === 200) this.departmentData = res[0].data.data
            })
        }

        currentChange(value: number) {
            this.page.current = value;
            this.initData();
        }

        getDefaultItem() {
            return {
                id: null,
                name: ''
            }
        }

        addModel() {
            this.modalTitle = '新增'
            this.flag = true
            this.departmentItem = this.getDefaultItem()
        }

        checkId(id: number) {
            if (this.departmentData.some(item => { return item.id == id})) {
                this.isExist = true
            } else {
                this.isExist = false
            } 
        }

        addDepartment() {
            if (this.isExist == false) {
                addDepartment(this.departmentItem).then(res => {
                    let { code, data } = res.data
                    if (code === 200) {
                        this.$Message.success('添加成功！')
                        this.flag = false
                        this.initData()
                    } else {
                        this.$Message.error('添加失败！')
                    }
                })
            }
        }

        addCancel() {
            this.flag = false
        }

        edit(index: number) {
            this.modalTitle = '编辑'
            this.flag = true
            getDepartmentDetails(this.departmentData[index].id).then(res => {
                let { code, data } = res.data
                if (code == 200) {
                    this.departmentItem = data
                }    
            })
        }

        editDepartment() {
            if (this.isExist == false) {
                editDepartment(this.departmentItem).then(res => {
                    let { code, data } = res.data
                    if (code === 200) {
                        this.$Message.success('编辑成功！')
                        this.flag = false
                        this.initData()
                    } else {
                        this.$Message.error('编辑失败！')
                    }
                })
            }
        }

        remove(index: number) {
            this.$Modal.confirm({
                title: '删除部门',
                content: '<p>确定要删除该部门吗？</p>',
                onOk: () => {
                    deleteDepartment(this.departmentData[index].id).then((res: any) => {
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

        /** 导入 */
        handleSuccess (res, file) {
            if (res.code === 200) {
                this.$Message.success('文件上次成功！')
                this.initData()
            }
        }

        /** 导出 */
        // exportFiles() {
        //     exportDepartment().then(res => {
        //         let { code, data } = res.data
        //         if (code === 200) {
        //             if (data.length > 0) {
        //                 let index=data.lastIndexOf("\\");
        //                 let fileName=data.substring(index+1,data.length);
        //                 request({
        //                     url: this.url,
        //                     method: 'post',
        //                     data: {
        //                         path: data
        //                     },
        //                     responseType: 'blob'
        //                 }).then((response: any) => {
        //                     var link = document.createElement('a');
        //                     link.download = fileName
        //                     let href = window.URL.createObjectURL(response.data)
        //                     link.href = href
                            
        //                     document.body.append(link)
        //                     link.click();
        //                     document.body.removeChild(link)
        //                 })
        //             }
        //         }
        //     })
        // }
    }
</script>