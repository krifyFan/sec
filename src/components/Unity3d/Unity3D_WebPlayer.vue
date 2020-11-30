<template>
    <div :id="id" class="WebPlayer"></div>
</template>
<script lang="ts">
    import {
        Component,
        Vue,
        Prop,
        Watch,
        Emit
    } from 'vue-property-decorator'
    import {
        Alarm
    } from '@/types/alarm.interface'

    @Component({})
    export default class Unity3d_WebGL extends Vue {

        id = "unityContainer"

        /** 待加载的模型 */
        @Prop({
            type: String,
            required: true,
            default: ''
        })
        modelName: String

        // 实例
        unityInstance: any

        // 新引入的script
        eles: HTMLScriptElement[] = []

        @Watch('modelName')
        onModelNameChange(val: string, oldVal: string) {
            this.loadUnity()
        }

        created() {
            this.importJS()
            this.insertUnityGlobalFunc()
            this.eles.forEach((e: HTMLScriptElement) => {
                document.body.appendChild(e)
            })

        }

        mounted() {
            this.loadUnity()
        }

        // 载入需要的js文件
        importJS() {
            const s1 = document.createElement('script');
            s1.type = 'text/javascript';
            s1.src = '/unity3d/jquery.min.js';
            this.eles.push(s1)
            const s2 = document.createElement('script');
            s2.type = 'text/javascript';
            s2.src = '/unity3d/UnityObject2.js';
            this.eles.push(s2)
        }

        // 加入unity3d全局方法
        insertUnityGlobalFunc() {
            // // 简单粗暴的向全局添加3D中的事件方法
            // const s1 = document.createElement('script');
            // s1.type = 'text/javascript';
            // s1.src = '/unity3d/unity3dGlobal.js';
            // this.eles.push(s1)

            window["showVideoTalkForm"] = (videoId: number) => this.showVideoTalkForm(videoId)
            window["raiseFakedAlarm"] = (id: any, source: any, type: any) => this.raiseFakedAlarm(id, source, type)
            window["clearAlarm"] = (alarmId: number) => this.clearEvent(alarmId)
        }

        /** 加载3D */
        loadUnity() {
            if (this.modelName == '') return

            console.log(`Player加载模型：${this.modelName}`)

            let config: any = {
                width: document.getElementById(this.id).offsetWidth,
                height: document.getElementById(this.id).offsetHeight,
                params: {
                    enableDebugging: "0"
                }
            }

            this.unityInstance = new UnityObject2(config);
            let _this = this
            this.unityInstance.observeProgress(function (progress) {

                switch (progress.pluginStatus) {
                    case "broken":
                        break;
                    case "missing":
                        break;
                    case "installed":
                        break;
                    case "first":
                        _this.completeUnity3DBox();
                        break;
                }
            });

            this.unityInstance.initPlugin(document.getElementById(this.id),
                encodeURI(`/unity3d/WebPlayer/${this.modelName}/model.unity3d`))
        }

        completeUnity3DBox() {

        }

        /** 更新告警 */
        refreshAlarm(newAlarm: Alarm) {
            console.log("模型更新告警", newAlarm)
            this.unityInstance.getUnity().SendMessage("MainUI", "AddAlarm", JSON.stringify(newAlarm))
        }

        /** 清除告警 */
        clearAlarm(alarm: Alarm) {
            this.unityInstance.getUnity().SendMessage("MainUI", "RemoveAlarm", JSON.stringify(alarm))
        }

        /** 更新数据 */
        refreshData(id: number, cv: number) {
            this.unityInstance.getUnity().SendMessage("MainUI", "UpdateCV", `[{'id': ${id}, 'cv': ${cv} }]`)
        }

        /** 模拟告警 */
        raiseFakedAlarm(id: number, source: string, type: number) {
            this.$Message.info(`收到模拟告警id:${id} source:${source} type:${type}`)
            let alarm: Alarm = {
                id: Math.floor(Math.random() * 1000),
                objId: id,
                source: source,
                alarmTypeId: type
            }
            this.refreshAlarm(alarm)
            // emit
        }

        /** 点击相机后的弹窗 */
        showVideoTalkForm(videoId: number) {
            this.$Message.info("点击相机事件" + videoId)
            // Emit
        }

        /** 点击清除后的事件 */
        clearEvent(alarmId: number) {
            // emit
            console.log("clear event2", alarmId)
            let alarm: Alarm = {
                id: alarmId,
                objId: 1002,
                source: "165",
                alarmTypeId: 99
            }
            this.clearAlarm(alarm)
        }

        beforeDestroy() {
            this.eles.forEach((e: HTMLScriptElement) => {
                document.body.removeChild(e)
            })
        }
    }
</script>
<style lang="less" scoped>
    .WebPlayer {
        width: 100%;
        height: 100%;
    }
</style>