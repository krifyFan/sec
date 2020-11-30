<template>
    <div :id="componentId" class="Unity3DClass" v-cancellation>
        <!-- <div :id="id" class="Unity3DClass"></div> -->
    </div>
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
        DirectiveOptions
    } from 'vue'
import { log } from 'three'


    const cancellation: DirectiveOptions = {
        unbind(els) {
            // 将所有子元素移开
            const childrenNum = els.children.length
            for (let index = childrenNum - 1; index >= 0; index--) {
                const element = els.children[index] as HTMLElement

                els.removeChild(element)
                element.style.display = 'none'
                document.body.appendChild(element)
            }
        }
    }

    @Component({
        directives: {
            cancellation
        }
    })
    export default class Unity3DClass extends Vue {

        componentId = "component3d_id"
        id = "unity3d_id"

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
        elesDOM: HTMLScriptElement[] = []

        // 当前版本 0：webplay; 1： webgl
        currentType: number = 0

        @Watch('modelName')
        onModelNameChange(val: string, oldVal: string) {
            setTimeout(() => {
                this.loadUnity()
            }, 1000)
        }

        get UnityInstance(): any {
            return this.currentType == 0 ? this.unityInstance.getUnity() : this.unityInstance
        }

        created() {

            this.currentType = this.currentBrower() == 'IE' ? 0 : 1

            this.importJS()
            this.insertUnityGlobalFunc()
            this.elesDOM.forEach((e: HTMLScriptElement) => {
                document.body.appendChild(e)
            })
        }

        mounted() {
            // 将3D的div添加进组件
            this._addElement()
        }

        // 载入需要的js文件
        importJS() {
            if (this.currentType == 0) {
                const s1 = document.createElement('script');
                s1.type = 'text/javascript';
                s1.src = '/unity3d/jquery.min.js';
                this.elesDOM.push(s1)
                const s2 = document.createElement('script');
                s2.type = 'text/javascript';
                s2.src = '/unity3d/UnityObject2.js';
                this.elesDOM.push(s2)
            } else {
                const s = document.createElement('script');
                s.type = 'text/javascript';
                s.src = '/unity3d/UnityLoader.js';
                this.elesDOM.push(s)
            }
        }

        // 加入unity3d全局方法
        insertUnityGlobalFunc() {
            window["showVideoTalkForm"] = (videoId: number) => this.showVideoTalkForm(videoId)
            window["raiseFakedAlarm"] = (id: any, source: any, type: any) => this.raiseFakedAlarm(id, source, type)
            window["clearAlarm"] = (alarmId: number) => this.clearEvent(alarmId)
        }

        currentBrower() {
            var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
            var isOpera = userAgent.indexOf("Opera") > -1;
            if (isOpera) {
                //判断是否Opera浏览器
                return "Opera";
            }
            if (userAgent.indexOf("Firefox") > -1) {
                //判断是否Firefox浏览器
                return "FF";
            }
            if (userAgent.indexOf("Chrome") > -1) {
                //判断是否Chrome浏览器
                return "Chrome";
            }
            if (userAgent.indexOf("Safari") > -1) {
                //判断是否Safari浏览器
                return "Safari";
            }
            if (
                userAgent.indexOf("compatible") > -1 &&
                userAgent.indexOf("MSIE") > -1 &&
                !isOpera
            ) {
                //判断是否IE浏览器
                return "IE";
            }
            return "";
        }

        /** 加载3D */
        loadUnity() {
            console.log(`Player加载模型：${this.modelName}`)
            if (this.modelName == '') return

            console.log(`当前缓存的模型名称：${window['modelName']}`)
            // 判断已加载的模型是否和当前要加载的模型一样，一样的话就不用加载了
            if (window['modelName'] && window['modelName'] == this.modelName) return
            // 将当前模型名缓存下来
            window['modelName'] = this.modelName

            if (this.currentType == 0) {
                let config: any = {
                    width: document.getElementById(this.id).offsetWidth,
                    height: document.getElementById(this.id).offsetHeight,
                    params: {
                        enableDebugging: "0"
                    }
                }

                this.unityInstance = new UnityObject2(config);
                let _this = this
                this.unityInstance.observeProgress(function(progress) {
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
            } else {
                this.unityInstance = UnityLoader.instantiate(this.id,
                    `/unity3d/WebGL/${this.modelName}/Build/model.json`, {
                        onProgress: this.unityProgress
                    });
            }
            console.log("加载后", this.UnityInstance)
            console.log("加载后2", this.UnityInstance.SendMessage)
        }

        /** webplayer事件 */
        completeUnity3DBox() {
            console.log("加载webplayer模型成功")
        }

        /** webgl 加载结束事件 */
        unityProgress(unityInstance: any, progress: any) {
            console.log("加载webgl模型成功", progress)
            if (!unityInstance.Module) return;
            if (!unityInstance.logo) {
                unityInstance.logo = document.createElement("div");
                unityInstance.logo.className = "logo " + unityInstance.Module.splashScreenStyle;
                unityInstance.container.appendChild(unityInstance.logo);
            }
            if (!unityInstance.progress) {
                unityInstance.progress = document.createElement("div");
                unityInstance.progress.className = "progress " + unityInstance.Module.splashScreenStyle;
                unityInstance.progress.empty = document.createElement("div");
                unityInstance.progress.empty.className = "empty";
                unityInstance.progress.appendChild(unityInstance.progress.empty);
                unityInstance.progress.full = document.createElement("div");
                unityInstance.progress.full.className = "full";
                unityInstance.progress.appendChild(unityInstance.progress.full);
                unityInstance.container.appendChild(unityInstance.progress);
            }
            unityInstance.progress.full.style.width = (100 * progress) + "%";
            unityInstance.progress.empty.style.width = (100 * (1 - progress)) + "%";
            if (progress == 1)
                unityInstance.logo.style.display = unityInstance.progress.style.display = "none";
        }

        /** 更新告警 */
        refreshAlarm(newAlarm: any) {
            console.log("模型更新告警", newAlarm)
            console.log("this.UnityInstance", this.UnityInstance)
            console.log("this.UnityInstance2", this.UnityInstance.SendMessage)
            this.UnityInstance.SendMessage("MainUI", "AddAlarm", JSON.stringify(newAlarm))
        }

        /** 清除告警 */
        clearAlarm(alarm: any) {
            this.UnityInstance.SendMessage("MainUI", "RemoveAlarm", JSON.stringify(alarm))
        }

        /** 更新数据 */
        refreshData(id: number, cv: number) {
            this.UnityInstance.SendMessage("MainUI", "UpdateCV", `[{'id': ${id}, 'cv': ${cv} }]`)
        }

        /** 设置3D视角*/
        setCameraRotation(id: string, yaw: any, pitch: any) {
            console.log('id', id, 'yaw', yaw, pitch)
            this.UnityInstance.SendMessage("MainUI", "flyto", `{'MeasObjID': ${id}, 'Yaw': ${yaw}, 'Pitch': ${pitch} }`)
        }

        /** 模拟告警 */
        raiseFakedAlarm(id: number, source: string, type: number) {
            console.log(`收到模拟告警点击事件，id:${id} source:${source} type:${type}`)
            this.raiseFakedAlarmEvent(id, source, type)
        }

        /** 点击相机后的弹窗 */
        showVideoTalkForm(videoId: number) {
            console.log(`收到相机点击事件，videoId:${videoId}`)
            this.clickVideoEvent(videoId)
        }

        /** 点击清除后的事件 */
        clearEvent(alarmId: number) {
            console.log(`收到告警清除事件，alarmId:${alarmId}`)
            this.clearAlarmEvent(alarmId)
        }

        @Emit("clickVideoEvent")
        clickVideoEvent(videoId: number) {}

        @Emit("clearAlarmEvent")
        clearAlarmEvent(alarmId: number) {}

        @Emit("raiseFakedAlarmEvent")
        raiseFakedAlarmEvent(id: number, source: string, type: number) {}

        _addElement() {
            console.log("将div加入到组件中")

            let result: HTMLDivElement = document.getElementById(this.id) as HTMLDivElement
            console.log("result", result)

            // 如果没有在body下找到，则需新建一个video标签
            if (result) {

                // 将video从原来的父dom中移除
                const parentDom = result.parentNode
                parentDom.removeChild(result)

            } else {
                result = document.createElement("DIV") as HTMLDivElement
                result.setAttribute('id', this.id)
                result.classList.add('Unity3DClass')
                result.style.width = "100%"
                result.style.height = "100%"

            }

            // 将video变为黑色，初始状态
            result.style.display = "block"
            console.log("result2", result)
            document.getElementById(this.componentId).appendChild(result)
        }

        beforeDestroy() {
            console.log('this.elesDOM', this.elesDOM)
            this.elesDOM.forEach((e: HTMLScriptElement) => {
                console.log('child', e)
                document.body.removeChild(e)
            })
        }

    }
</script>

<style lang="less" scoped>
    .Unity3DClass {
        width: 100%;
        height: 100%;
    }
</style>