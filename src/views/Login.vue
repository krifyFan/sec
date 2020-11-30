<template>
    <div class="login">
        <!-- <Pointwave></Pointwave> -->
        <div class="sys-title">广东管网粤西综合安防平台</div>
        <div class="form-wrap">
            <Form ref="loginData" :model="loginData" :rules="ruleValidate">
                <h4 class="title">用户登录</h4>
                <div class="login-form-wrap">
                    <FormItem prop="acct">
                        <Input 
                            prefix="ios-contact" 
                            placeholder="请输入账号" 
                            style="width: 100%" 
                            v-model="loginData.acct" 
                        />
                    </FormItem>
                    <FormItem prop="pass">
                        <Input 
                            prefix="md-lock" 
                            type="password" 
                            v-model="loginData.pass" 
                            placeholder="请输入密码"
                            style="width: 100%" 
                        />
                    </FormItem>
                    <FormItem>
                        <Button type="primary" long @click="handleSubmit('loginData')" class="submit">登录</Button>
                        <!-- <Button type="default"  @click="handleReset('loginData')"  style="margin-left: 8px">重置</Button> -->
                    </FormItem>
                </div>
            </Form>
        </div>
    </div>
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Vue
    } from "vue-property-decorator";
    import router from "../router";
    import {
        sha256
    } from "js-sha256";
    import {
        Message
    } from "iview";
    import Pointwave from '@/components/Pointwave/index.vue'

    @Component({
        components: {
            // 登录页水波纹背景，此注释放开IE页面会打不开，谷歌没问题
            // Pointwave,
        },
    })
    export default class Login extends Vue {
        loginData: any = {
            acct: "",
            pass: "",
        };
        ruleValidate: any = {
            acct: [{
                    required: true,
                    message: "账号不能为空",
                    trigger: "blur",
                },
                {
                    min: 3,
                    max: 16,
                    message: "账号长度3-16个字符",
                    trigger: "blur",
                },
            ],
            pass: [{
                    required: true,
                    message: "密码不能为空",
                    trigger: "blur",
                },
                {
                    type: "string",
                    min: 6,
                    max: 16,
                    message: "密码长度6-16个字符",
                    trigger: "blur",
                },
            ],
        };

        mounted() {
            window.addEventListener('keydown', this.keyDown)
        }

        keyDown(e) {
            let ev: any = document.all ? window.event : e
            if (ev.keyCode === 13) {
                this.handleSubmit('loginData')
            }
        }

        handleSubmit(name: string) {
            (this.$refs[name] as any).validate((valid: boolean) => {
                if (valid) {
                    let loginParams: any = {
                        username: this.loginData.acct,
                        password: sha256(this.loginData.pass),
                    };


                    this.$store.dispatch("login", loginParams).then((result: any) => {

                            let roles: any[] = result.roles
                            console.log("login roles", roles)
                            if (roles.findIndex(r => r.name.indexOf("保安") >= 0) >= 0) {
                                router.push({
                                    path: "/security-staff-page",
                                })
                            } else if (roles.findIndex(r => r.name.indexOf("激光甲烷") >= 0) >= 0) {
                                router.push({
                                    path: "/laser-methane-page",
                                })
                            } else {
                                router.push({
                                    path: "/main",
                                })
                            }
                        })
                        .catch((err) => {
                            this.$Message.warning("登陆失败！");
                        });
                } else {
                    this.$Message.error("表单验证失败!");
                }
            });
        }


        destroyed() {
            window.removeEventListener('keydown', this.keyDown, false)
        }
    }
</script>

<style lang="less">
    .login {
        width: 100%;
        height: 100%;
        background-color: #1c2438;
        background: url('../assets/images/loginBG.png') center no-repeat;
        background-size: 100% 100%;
        position: relative;

        .sys-title {
            position: absolute;
            left: 50%;
            top: 20%;
            transform: translateX(-50%);
            color: #fff;
            font-size: 38px;
            font-weight: bold;
            // -moz-user-select: none;
            // -webkit-user-select: none;
            // user-select: none;
            // -ms-user-select: none;
        }

        .form-wrap {
            background: url('../assets/images/login-box-bg.png') center no-repeat;
            background-size: 100% 100%;
            position: absolute;
            left: 50%;
            top: 30%;
            transform: translateX(-50%);
            width: 400px;
            height: 400px;

            h4 {
                text-align: center;
                margin-bottom: 20px;
                font-size: 30px;
                color: #fff;
                margin-top: 32px;
                -ms-user-select: none;
            }

            .login-form-wrap {
                width: 80%;
                margin: 0 auto;
                margin-top: 2.7rem;

                .ivu-form-item {
                    margin-bottom: 2rem;

                }

                .ivu-form-item-content {
                    .ivu-input {
                        height: 2.7rem;
                        background-color: rgba(0, 0, 0, 0);
                        color: #ffffff;
                        border: 1px solid #00b8ff;
                    }

                    .ivu-input-prefix {
                        i {
                            color: #ffffff;
                            font-size: 24px;
                            line-height: 2.7rem;
                        }
                    }

                    .ivu-btn-primary {
                        // height: 2.7rem;
                        // line-height: 2.7rem;
                        margin-top: 1.5rem;
                        font-size: 1.2rem;
                        background-image: linear-gradient(to bottom, rgb(0, 185, 255), rgb(0, 132, 235));
                    }
                }
            }
        }
    }
</style>