<template>
  <a-drawer
    :title="title"
    :closable="false"
    :maskClosable="false"
    width="50%"
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
      <a-form-model-item label="目标用户" prop="user">
        <a-select 
          show-search
          v-model="form.user" 
          placeholder="目标用户" 
          allowClear 
          style="width:50%;"
          :filter-option="(input, option) => option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0"
        >
          <a-select-option :value="item._id" v-for="item of parent.userList" :key="item._id">{{ item.nickname }}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="留言内容" prop="content">
        <a-textarea
          v-model="form.content"
          placeholder="留言内容"
          :auto-size="{ minRows: 3, maxRows: 5 }"
        />
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
import { insertMessage,updateMessage } from '@/api/manage'
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
      labelCol: {span: 3},
      wrapperCol: {span: 21},
      form: {
        user: undefined,
        content: undefined,
        status: true
      },
      rules: {
        user: [{required: true, message: '目标用户不能为空', trigger: 'change'}],
        content: [{required: true, message: '留言内容不能为空', trigger: 'blur'}],
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
            insertMessage(this.form).then(res => {
              this.showMessage(res, () => {
                this.onClose()
                this.parent.getList()
              })
            })
          }else {
            updateMessage({
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
      this.form.status = true
      this.status = undefined
      this.visible = false
      this.id = undefined
    }
  }
}
</script>