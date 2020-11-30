<template>
    <el-dialog title="新增人员" class="card-dialog" :visible.sync="cardModalVisible" :close-on-click-modal="false" :show-close="false" width="30%">
        <el-form :model="card">
            <el-form-item label="工号：" :label-width="labelWidth">
                <el-input v-model="card.employeeNo" size="small" class="content-width"></el-input>
            </el-form-item>
            <el-form-item label="人名：" :label-width="labelWidth">
                <el-input v-model="card.name" size="small" class="content-width"></el-input>
            </el-form-item>
            <el-form-item label="部门：" :label-width="labelWidth">
                <el-select v-model="card.department" placeholder="请选择" size="small" class="content-width">
                    <el-option v-for="(item, i) in departments" :key="`${item.value}${i}`" :label="item.name" :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="有效期开始：" :label-width="labelWidth">
                <el-date-picker v-model="card.begin" type="date" placeholder="选择日期" size="small" class="content-width">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="有效期结束：" :label-width="labelWidth">
                <el-date-picker v-model="card.end" type="date" placeholder="选择日期" size="small" class="content-width">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="头像上传：" :label-width="labelWidth">
                <el-upload 
                    class="upload content-width" 
                    :headers="token" 
                    :action="action" 
                    :before-remove="beforeRemove" 
                    :multiple="false" 
                    :limit="1" 
                    :on-exceed="handleExceed"
                >
                    <el-button size="small" type="primary">点击上传</el-button>
                </el-upload>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="cancel" size="small">取 消</el-button>
            <el-button type="primary" @click="submit" size="small">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts">
    import request from '@/util/request'
    import {
        Component,
        Vue,
        Prop,
        Watch,
        Emit
    } from "vue-property-decorator"
    import store from '@/store'
    import {
        setCard,
        getDepartments
    } from "@/api/intercom";
    import {
        Card
    } from "@/types/intercom.interface";

    @Component({})
    export default class extends Vue {
        @Prop({
            required: false,
            type: Array,
            default: []
        }) cards: Card[]

        @Prop({
            default: true
        })
        cardModalVisible!: boolean

        @Prop({
            required: true
        })
        videoId!: number

        @Watch("cards")
        onCardsChange(nv: any, ov: any) {
            let tmp: number = 0
            this.cards.forEach(c => tmp = Math.max(tmp, Number(c.employeeNo)))
            this.card.employeeNo = tmp + 1
        }

        card: any = {
            cardNo: '',
            employeeNo: '',
            name: '',
            department: 1,
            begin: new Date().getTime(),
            end: (new Date() as any).setYear((new Date() as any).getYear() + 10 + 1900)
        }
        labelWidth: string = '120px'
        departments: any[] = []

        get action() {
            return `${request.defaults.baseURL}/intercom/${this.videoId}/uploadFaceFile` // 上传地址
        }

        get token() {
            return {
                'Authorization': store.state.token
            }
        }

        @Emit('changeModalState')
        changeState(state: boolean) {}

        created() {
            this.getDepartments()

        }

        mounted() {

        }

        handleExceed(files, fileList) {
            this.$message.warning(
                `当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
        }

        beforeRemove(file, fileList) {
            return this.$confirm(`确定移除 ${ file.name }？`);
        }

        cancel() {
            this.changeState(false)
        }

        async submit() {
            let {
                videoId,
                card
            } = this

            let index: number = this.cards.findIndex(c => Number(c.employeeNo) == Number(card.employeeNo))

            if (index == -1) {
                await setCard(videoId, card)
                this.changeState(false)
            } else {
                this.$Message.info("工号重复，请重新输入！")
            }
        }

        getDepartments() {
            getDepartments().then((res: any) => {
                let {
                    data,
                    code
                } = res.data
                if (code === 200) {
                    this.departments = data
                }
            })
        }

    }
</script>

<style lang="less">

    .el-dialog__wrapper.card-dialog {

        .el-dialog__title {
            color: #fff;
        }

        .el-dialog__body {

            // max-height: 30rem !important;
            overflow-y: auto;
            height: auto;

            .el-form-item {
                margin-bottom: 0.475rem;
            }

            .content-width {
                width: 70%;
                .el-upload-list__item-name,
                .el-upload-list__item-name [class^=el-icon] {
                    color: #fff;
                }
            }
        }
    }
</style>