<template>
  <a-drawer
    :closable="false"
    :maskClosable="false"
    title="修改菜单"
    width="40%"
    :visible="visible"
    :body-style="{ paddingBottom: '80px'}"
    @close="onClose"
  >
    <a-form-model 
      ref="ruleForm"
      :model="form" 
      :rule="rules"
      :label-col="labelCol" 
      :wrapper-col="wrapperCol" 
      :key="visible"
    >
      <a-form-model-item label="菜单名称" prop="title">
        <a-input v-model="form.title" placeholder="菜单名称" />
      </a-form-model-item>
      <a-form-model-item label="菜单路由" prop="path">
        <a-input v-model="form.path" placeholder="菜单路由" :disabled="status==2" />
      </a-form-model-item>
      <a-form-model-item label="排序">
        <a-input-number style="width:100px" v-model="form.sortNum" placeholder="排序" />
      </a-form-model-item>
      <a-form-model-item label="图片">
        <a-upload
          :customRequest="handleUploadChange"
          list-type="picture-card"
          :file-list="fileList"
          @preview="handlePreview"
          :remove="hanldeImgRemove"
        >
          <div v-if="fileList.length < 1">
            <a-icon type="plus" />
            <div class="ant-upload-text">上传图片</div>
          </div>
        </a-upload>
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
    <a-modal :visible="previewVisible" :footer="null" @cancel="previewVisible=false" width="60%">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </a-drawer>
</template>

<script>
import { uploadFile,deleteFile } from '@/api/common'
import { getFileName } from '@/utils/util'
import { showMessage } from '@/utils/mixins'
import { updateMenu,insertMenu } from '@/api/manage'

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
      labelCol: {span: 3},
      wrapperCol: {span: 21},
      form: {
        parentId: undefined,
        title: undefined,
        path: undefined,
        menuImg: undefined,
        sortNum: undefined
      },
      rules: {
        tilte: [{required: true,message: '菜单名称不能为空',trigger: 'blur'}],
      },
      status: undefined,
      fileList: [],
      previewVisible: false,
      previewImage: undefined,
      id: undefined,
    }
  },
  methods: {
    // 删除图片
    hanldeImgRemove(file) {
      deleteFile({id: file.id}).then(res => {
        if(res.code == 200) {
          this.showMessage(res,() => {
            this.fileList = []
          })
        }
      })
    },
    //自定义上传图片
    handleUploadChange(file) {
      file = file.file
      const _this = this
      const formdata = new FormData()
      formdata.append('file', file)
      uploadFile(formdata).then(res => {
        if(res.code == 200) {
          file.url = res.data.link
          file.uid = res.data._id
          file.id = res.data._id
          file.fileame = getFileName( res.data.link )
          _this.fileList.push(file)
          _this.form.menuImg = res.data._id
        }else {
          _this.$message.error(res.message)
        }
      })
    },
    // 预览
    async handlePreview(file) {
      if (!file.url && !file.preview ) {
        file.preview = await getBase64(file.originFileObj)
      }
      this.previewImage = file.url || file.preview
      this.previewVisible = true
    },
    // 提交
    onSubmit () {
      this.$refs.ruleForm.validate(vaild => {
        if(vaild) {
          if(this.status==1) {
            insertMenu(this.form).then(res => {
              if(res.code == 200) {
                this.showMessage(res,() => {
                  this.parent.getList()
                  this.onClose()
                })
              }
            })
          }else {
            updateMenu({
              id: this.id,
              ...this.form
            }).then(res => {
              this.showMessage(res,() => {
                this.parent.getList()
                this.onClose()
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
      this.status = undefined
      this.visible = false
      this.id = undefined
      for(const key in this.form) {
        this.form[key] = undefined
      }
      this.fileList = []
    }
  }
}
</script>