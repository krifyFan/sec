<template>
    <div>
        <h4>视频联动管理</h4>
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
        <Table border :columns="columns" :data="videoLinkages">
            <template slot-scope="{ index }" slot="action">
                <Button type="success" size="small" style="margin-right: 5px" icon='md-create'
                    @click="edit(index)">编辑</Button>
                <Button type="error" size="small" icon='md-trash' @click="remove(index)">删除</Button>
            </template>
        </Table>
        <el-pagination style="text-align: right" :total="page.total" :page-size="page.pageSize"
            :current-page="page.current" @current-change="currentChange"
            layout="total, prev, pager, next, jumper"></el-pagination>

        <Modal class="alarmDialog" v-model="flag" :title="modalTitle" @on-cancel="addCancel">
            <Form v-if="flag" :model="videoLinkagesItem" :label-width="120">
                <!-- <FormItem label="编号：">
                    <Input v-model="videoLinkagesItem.id" class="form-content-width"/>
                </FormItem> -->
                <FormItem label="联动对象：">
                    <el-select v-model="videoLinkagesItem.objId" class="form-content-width">
                        <el-option v-for="obj in measobjs" :value="obj.id" :key="obj.id"
                            :label="obj.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="开始位置：">
                    <InputNumber :max="1000" :min="0" v-model="videoLinkagesItem.startLocation" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="结束位置：">
                    <InputNumber :max="1000" :min="0" v-model="videoLinkagesItem.endLocation" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="视频对象：">
                    <el-select v-model="videoLinkagesItem.videoId" class="form-content-width">
                        <el-option v-for="video in videos" :value="video.id" :key="video.id"
                            :label="video.name"></el-option>
                    </el-select>
                </FormItem>
                <FormItem label="预置位：">
                    <InputNumber :max="1000" :min="0" v-model="videoLinkagesItem.preset" class="form-content-width"></InputNumber>
                </FormItem>
                <FormItem label="是否启动：">
                    <el-select v-model="videoLinkagesItem.actived" class="form-content-width">
                        <el-option :value="true" label="是"></el-option>
                        <el-option :value="false" label="否"></el-option>
                    </el-select>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="primary" v-show="modalTitle=='新增'" @click="addVideoLinkages()">确定</Button>
                <Button type="primary" v-show="modalTitle=='编辑'" @click="editVideoLinkages()">确定</Button>
            </div>
        </Modal>
    </div>
</template>
<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { VideoLinkages, VideoLinkagesVo } from '@/types/videoLinkages.interface'
    import { getMeasObjects } from '@/api/measobject'
    import { MeasObject } from '@/types/measobject.interface'
    import { getVideos } from '@/api/video'
    import { Video } from '@/types/video.interface'
    import {
        getPageVideoLinkages,
        addVideoLinkages,
        editVideoLinkages,
        deleteVideoLinkages,
        exportVideoLinkages
    } from '@/api/videoLinkages'
    import request from '@/util/request'

    @Component({})
    export default class VideoLinkagesClass extends Vue {

        measobjs: MeasObject[] = []

        videos: Video[] = []

        videoLinkages: VideoLinkages[] = []

        columns: any[] = [
            {
                title: '编号',
                key: 'id'
            },
            {
                title: '联动对象',
                key: 'measobjName'
            },
            {
                title: '开始位置',
                key: 'startLocation'
            },
            {
                title: '结束位置',
                key: 'endLocation'
            },
            {
                title: '视频对象',
                key: 'videoName'
            },
            {
                title: '预置位',
                key: 'preset'
            },
            {
                title: '是否启用',
                key: 'actived',
                render: (h, params) => {
                    let temp = ''
                    if (params.row.actived) {
                        temp = '是'
                    } else {
                        temp = '否'
                    }
                    return h('div', temp)
                }
            },
            {
                title: '操作',
                slot: 'action',
                width: 170,
                align: "center",
            }
        ]

        videoLinkagesItem: VideoLinkages = {
            id: null,
            objId: null,
            startLocation: null,
            endLocation: null,
            videoId: null,
            preset: null,
            actived: null
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

        get token() {
            return {
                'Authorization': this.$store.state.token
            }
        }

        mounted() {
            this.initData()
        }

        initData() {
            let pageParam: VideoLinkagesVo = {
                pageNum: this.page.current,
                pageSize: this.page.pageSize
            }

            Promise.all([getMeasObjects(), getVideos(), getPageVideoLinkages(pageParam)]).then((res: any) => {
                
                // 联动对象
                if (res[0].data.code === 200) this.measobjs = res[0].data.data

                // 视频对象
                if (res[1].data.code === 200) this.videos = res[1].data.data

                // 视频联动
                if (res[2].data.code == 200) {
                    this.page.total = res[2].data.data.totalSize
                    this.videoLinkages = res[2].data.data.content
                    this.videoLinkages.map((item: VideoLinkages) => {
                        let measobjIndex = this.measobjs.findIndex(
                            (tep: MeasObject) => tep.id == item.objId
                        )
                        item.measobjName = measobjIndex < 0 ? '' : this.measobjs[measobjIndex].name

                        let videoIndex = this.videos.findIndex(
                            (tep: Video) => tep.id == item.videoId
                        )
                        item.videoName = videoIndex < 0 ? '' : this.videos[videoIndex].name
                    })
                }

            })
        }

        currentChange(value: number) {
            this.page.current = value;
            this.initData();
        }

        getDefaultItem() {
            return {
                id: null,
                objId: null,
                startLocation: 0,
                endLocation: 0,
                videoId: null,
                preset: 0,
                actived: null
            }
        }

        addModel() {
            this.modalTitle = '新增'
            this.flag = true
            this.videoLinkagesItem = this.getDefaultItem()
        }

        addVideoLinkages() {
            addVideoLinkages(this.videoLinkagesItem).then(res => {
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

        addCancel() {
            this.flag = false
        }

        edit(index: number) {
            this.modalTitle = '编辑'
            this.flag = true
            this.videoLinkagesItem = this.videoLinkages[index]
        }

        editVideoLinkages() {
            editVideoLinkages(this.videoLinkagesItem).then(res => {
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

        remove(index: number) {
            this.$Modal.confirm({
                title: '删除视频',
                content: '<p>确定要删除该视频联动吗？</p>',
                onOk: () => {
                    deleteVideoLinkages(this.videoLinkages[index].id).then((res: any) => {
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
        exportFiles() {
            exportVideoLinkages().then(res => {
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