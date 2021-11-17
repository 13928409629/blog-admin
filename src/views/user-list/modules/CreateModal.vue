<template>
  <a-drawer
    :title="title"
    :closable="false"
    :maskClosable="false"
    width="600px"
    :visible="visible"
    :body-style="{ paddingBottom: '80px'}"
    @close="onClose"
  >
    <a-form-model 
      ref="ruleForm"
      :model="form" 
      :rules="rules" 
      :label-col="labelCol" 
      :wrapper-col="wrapperCol" 
      :key="visible"
    >
      <a-form-model-item label="登录账号" prop="username">
        <a-input v-model="form.username" placeholder="登录账号" />
      </a-form-model-item>
      <a-form-model-item label="密码" prop="password">
        <a-input-password placeholder="密码" v-model="form.password" />
      </a-form-model-item>
      <a-form-model-item label="状态" prop="status">
        <a-select v-model="form.status" placeholder="用户状态" style="width:200px;">
          <a-select-option :value="0">正常</a-select-option>
          <a-select-option :value="1">冻结</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="用户昵称" prop="nickname">
        <a-input v-model="form.nickname" placeholder="用户昵称" />
      </a-form-model-item>
    </a-form-model>
    <div
      :style="{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: '100%',
        borderTop: '1px solid #e9e9e9',
        padding: '10px 16px',
        background: '#fff',
        textAlign: 'right',
        zIndex: 99999,
      }"
    >
      <a-button :style="{ marginRight: '8px' }" @click="onClose"> 关闭 </a-button>
      <a-button type="primary" @click="onSubmit"> 提交 </a-button>
    </div>
  </a-drawer>
</template>

<script>
import { addUser,updateUser } from '@/api/manage'
import { showMessage } from '@/utils/mixins'

export default {
  mixins: [showMessage],
  props: {
    parent: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      title: '',
      labelCol: {span: 4},
      wrapperCol: {span: 20},
      form: {
        nickname: undefined,
        status: undefined,
        password: undefined,
        username:undefined,
      },
      rules: {
        username: [{required: true, message: '登录账户不能为空', trigger: 'blur'}],
        status: [{required: true, message: '账户状态不能为空', trigger: 'change'}],
        password: [{required: true, message: '密码不能为空', trigger: 'blur'}],
        nickname: [{required: true, message: '用户昵称不能为空', trigger: 'blur'}],
      },
      status: undefined,
      id: undefined,
    }
  },
  methods: {
    // 提交
    onSubmit () {
      this.$refs.ruleForm.validate(vaild => {
        if(vaild) {
          if(this.status == 1) {
            addUser(this.form).then(res => {
              this.showMessage(res, () => {
                this.onClose()
                this.parent.getList()
              })
            })
          }else {
            updateUser({
              id: this.id,
              ...this.form
            }).then(res => {
              this.showMessage(res, () => {
                this.onClose()
                this.parent.getList()
              })
            })
          }
        }else {
          return false
        }
      })
    },
    // 关闭
    onClose() {
      for(const key in this.form) {
        this.form[key] = undefined
      }
      this.status = undefined
      this.id = undefined
      this.visible = false
    }
  }
}
</script>