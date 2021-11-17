<template>
  <a-drawer
    :title="title"
    width="40%"
    :closable="false"
    :maskClosable="false"
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
      <a-form-model-item label="屏标题" prop="title">
        <a-input v-model="form.title" />
      </a-form-model-item>
      <a-form-model-item label="屏描述">
        <a-row v-for="(item,index) of form.description" :key="index">
          <a-col :span="20">
            <a-input v-model="form.description[index]" />
          </a-col>
          <a-col :span="4">
            <a-icon type="plus-circle" class="plus-icon" v-if="index == form.description.length-1" @click="handlePlusClick" />
            <a-icon type="minus-circle" class="minus-icon" v-if="index > 0" @click="handleMinusClick(index)" />
          </a-col>
        </a-row>
      </a-form-model-item>
      <a-form-model-item label="屏类型" prop="type">
        <a-select v-model="form.type">
          <a-select-option :value="2">图片</a-select-option>
          <a-select-option :value="1">视频</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="图片" required>
        <a-upload
          list-type="picture-card"
          :file-list="fileList"
          :remove="hanldeImgRemove"
          @preview="handlePreview"
          :customRequest="handleUploadChange"
          class="upload-half"
          accept="image/*,video/*"
        >
          <div class="custom-btn" v-if="fileList.length<1">
            <a-icon type="ant-cloud" style="font-size: 26px" />
            <div class="ant-upload-text">上传图片/视频</div>
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
      <img alt="example" style="width: 100%" :src="previewImage" v-if="previewImage.indexOf('.mp4') == -1" />
      <video :src="previewImage" v-else controls style="width: 100%"></video>
    </a-modal>
  </a-drawer>
</template>

<script>

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}
import { updateHomePages } from '@/api/manage'
import { showMessage } from '@/utils/mixins'
import { uploadFile, deleteFile } from '@/api/common'
import { getFileName } from '@/utils/util'

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
      title: '',
      visible: false,
      labelCol: {span: 3},
      wrapperCol: {span: 21},
      form: {
        title: undefined,
        type: undefined,
        url: undefined,
        description: []
      },
      rules: {},
      fileList: [],
      previewVisible: false,
      previewImage: '',
      id: undefined
    }
  },
  methods: {
    //自定义上传图片
    handleUploadChange(file) {
      file = file.file
      const _this = this
      const formdata = new FormData()
      formdata.append('file', file)
      uploadFile(formdata).then(res => {
        if(res.code == 200) {
          file.url = process.env.VUE_APP_API_ORIGIN+res.data
          file.uid = Math.random()
          file.fileame = getFileName( res.data )
          _this.fileList.push(file)
          _this.form.url = res.data
        }else {
          _this.$message.error(res.message)
        }
      })
    },
    //删除图片
    hanldeImgRemove(file) {
     deleteFile({id: file.id}).then(res => {
        if(res.code == 200) {
          this.showMessage(res,() => {
            this.fileList = []
          })
        }
      })
    },
    // 减去
    handleMinusClick(index) {
      this.form.description.splice(index, 1)
    },
    // 添加
    handlePlusClick() {
      this.form.description.push('')
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
      this.form.description = this.form.description.join('∮')
      updateHomePages({id:this.id,...this.form}).then(res => {
        if(res.code == 200) {
          this.showMessage(res,() => {
            this.onClose()
            this.parent.getList()
          })
        }
      })
    },
    // 关闭
    onClose() {
      this.visible = false
      this.id = undefined
      for(const key in this.form) {
        if(key == 'description') {
          this.form[key] = []
        }else {
          this.form[key] = undefined
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.plus-icon,
.minus-icon {
  font-size: 20px;
  margin-right: 6px;
  float: right;
  color: #F5222D;
  margin-top: 10px;
}
.minus-icon {
  color: #1890ff;
}
</style>