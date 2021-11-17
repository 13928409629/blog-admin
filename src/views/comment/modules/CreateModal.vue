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
      <a-form-model-item label="选择文章" prop="article">
        <a-select 
          show-search
          v-model="form.article" 
          placeholder="选择文章" 
          allowClear 
          style="width:50%;"
          :filter-option="(input, option) => option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0"
        >
          <a-select-option :value="item._id" v-for="item of parent.articleList" :key="item._id">{{ item.title }}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="评论内容" prop="content">
        <a-textarea
          v-model="form.content"
          placeholder="评论内容"
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
import { insertComment,updateComment } from '@/api/manage'
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
        article: undefined,
        content: undefined,
      },
      rules: {
        article: [{required: true, message: '文章不能为空', trigger: 'change'}],
        content: [{required: true, message: '评论内容不能为空', trigger: 'blur'}],
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
            insertComment(this.form).then(res => {
              this.showMessage(res, () => {
                this.onClose()
                this.parent.getList()
              })
            })
          }else {
            updateComment({
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