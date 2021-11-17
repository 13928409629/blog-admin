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
      <a-form-model-item label="标签标题" prop="title">
        <a-input v-model="form.title" placeholder="标签标题" />
      </a-form-model-item>
      <a-form-model-item label="标签排序" prop="sortNum">
        <a-input v-model="form.sortNum" placeholder="标签排序" />
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
import { insertTag,updateTag } from '@/api/manage'
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
        title: undefined,
        sortNum: undefined,
      },
      rules: {
        title: [{required: true, message: '标签标题不能为空', trigger: 'blur'}],
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
            insertTag(this.form).then(res => {
              this.showMessage(res, () => {
                this.onClose()
                this.parent.getList()
              })
            })
          }else {
            updateTag({
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
      this.visible = false
      this.id = undefined
    }
  }
}
</script>