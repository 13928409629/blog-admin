<template>
  <a-drawer
    :title="title"
    :closable="false"
    :maskClosable="false"
    width="70%"
    :visible="visible"
    :body-style="{ paddingBottom: '80px' }"
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
      <a-form-model-item label="产品名称" prop="title">
        <a-input v-model="form.title" placeholder="产品名称" />
      </a-form-model-item>
      <a-form-model-item label="产品描述" prop="description">
        <a-textarea v-model="form.description" placeholder="产品描述" :auto-size="{ minRows: 3, maxRows: 5 }" />
      </a-form-model-item>
      <a-form-model-item label="所属系列" prop="category2">
        <a-select
          v-model="form.category2"
          show-search
          placeholder="选择系列"
          option-filter-prop="children"
          allowClear
          style="width: 300px"
          :filter-option="(input,option) => option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0"
        >
          <a-select-option :value="item.id" v-for="item of parent.menuTree" :key="item.id">{{ item.title }}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="产品图片" required>
        <a-upload
          list-type="picture-card"
          :file-list="fileList"
          :remove="hanldeImgRemove"
          :openFileDialogOnClick="false"
          @preview="handlePreview"
          class="upload-half"
          accept="image/*"
        >
          <div @click="handleUploadImgClick" class="custom-btn">
            <a-icon type="ant-cloud" style="font-size: 26px" />
            <div class="ant-upload-text">添加图片</div>
          </div>
        </a-upload>
      </a-form-model-item>
      <a-form-model-item label="产品详情" required>
        <wangEditor :value="form.content" @change="editorChange"></wangEditor>
      </a-form-model-item>
      <a-form-model-item label="seo关键字">
        <a-input placeholder="最多32个汉字" v-model="form.seoKeyword" :maxLength="32"></a-input>
      </a-form-model-item>
      <a-form-model-item label="seo描述">
        <a-textarea
          v-model="form.seoDescription"
          placeholder="seo描述"
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
    <a-modal :visible="previewVisible" :footer="null" @cancel="previewVisible = false" width="60%">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
    <!-- 图片裁剪框 -->
    <a-modal
      title="裁切图片"
      :visible="cropperVisible"
      width="950px"
      :maskClosable="false"
      :keyboard="false"
      @cancel="handleCropperCancel"
      @ok="handleLimitImgClick"
      :confirmLoading="imgConfirmLoading"
    >
      <a-cropper
        :key="cropperVisible"
        ref="cropperNewsImg"
        :scale="[4, 4]"
        :width="240"
        :hegiht="240"
        imgName="选择图片"
        :size="2"
        @upload="handleUploadChange"
      ></a-cropper>
    </a-modal>
  </a-drawer>
</template>

<script>
import wangEditor from '@/components/Editor/WangEditor.vue'
import CropperImage from '@/components/CropperImage'
import { uploadFile,deleteFile } from '@/api/common'
import { getFileName } from '@/utils/util'
import { showMessage } from '@/utils/mixins'
import { addProduct,updatetProduct,getProductImgs } from '@/api/manage'

export default {
  mixins: [showMessage],
  props: {
    parent: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    CropperImage,
    wangEditor,
  },
  data() {
    return {
      title: '',
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
      form: {
        title: undefined,
        description: undefined,
        content: undefined,
        category1: undefined,
        category2: undefined,
        seoKeyword: undefined,
        seoDescription: undefined,
        images: [],
      },
      rules: {
        title: [{ required: true, message: '产品标题不能为空', trigger: 'blur' }],
        description: [{ required: true, message: '产品描述不能为空', trigger: 'blur' }],
        category2: [{ required: true, message: '所属系列不能为空', trigger: 'change' }],
      },
      visible: false,
      status: undefined,
      fileList: [],
      previewVisible: false,
      previewImage: '',
      cropperVisible: false,
      imgConfirmLoading: false,
      id: undefined
    }
  },
  watch: {
    'form.category2'(val) {
      this.form.category1 = this.parent.menuTree.filter(item => item.id == val)[0].parentId
      // this.form.category1 = this.parent.parentTree.filter(item => item.id == _parentId)[0].id
    },
    visible(val) {
      if(val && this.id) {
        getProductImgs({productId: this.id}).then(res => {
          if(res.code == 200) {
            res.data.forEach(item => {
              this.fileList.push({
                uid: item.id,
                url: process.env.VUE_APP_API_ORIGIN+item.url,
                name: getFileName(item.url)
              })
              this.form.images.push(item.url)
            })
          }
        })
      }
    }
  },
  methods: {
    // 输入框
    editorChange(val) {
      this.form.content = val
    },
    // 预览图片
    handlePreview(file) {
      this.previewVisible = true
      this.previewImage = file.url
    },
    //点击上传图片
    handleUploadImgClick() {
      this.cropperVisible = true
    },
    //关闭裁剪框
    handleCropperCancel() {
      this.cropperVisible = false
    },
    //裁剪框点击上传图片
    handleLimitImgClick() {
      this.$refs.cropperNewsImg.getLimitedFile()
    },
    //删除图片
    hanldeImgRemove(file) {
      const _index = this.form.images.findIndex(item => item == file.url)
      this.form.images.splice(_index,1)
      deleteFile({id: file.id}).then(res => {
        if(res.code == 200) {
          this.showMessage(res,() => {
            this.fileList.splice(_index,1)
          })
        }
      })
    },
    //自定义上传图片
    handleUploadChange(file) {
      const _this = this
      const formdata = new FormData()
      formdata.append('file', file)
      uploadFile(formdata).then(res => {
        if(res.code == 200) {
          file.url = res.data
          file.uid = Math.random()
          file.fileame = getFileName( res.data )
          _this.fileList.push(file)
          this.form.images.push(res.data)
        }else {
          _this.$message.error(res.message)
        }
        this.cropperVisible = false
      })
    },
    // 关闭
    onClose() {
      this.visible = false
      this.fileList = []
      this.status = undefined
      this.id = undefined
      for(const key in this.form) {
        if(key == 'images') {
          this.form[key] = []
        }else {
          this.form[key] = undefined
        }
      }
    },
    // 提交
    onSubmit() {
      this.$refs.ruleForm.validate((vaild) => {
        if (vaild) {
          if(this.status == 1) {
            addProduct(this.form).then(res => {
              this.showMessage(res,() => {
                this.onClose()
                this.parent.getList()
              })
            })
          }else {
            updatetProduct({
              id: this.id,
              ...this.form
            }).then(res => {
              this.showMessage(res,() => {
                this.onClose()
                this.parent.getList()
              })
            })
          }
        } else {
          return false
        }
      })
    },
  },
}
</script>

<style lang="less">
.ant-upload.ant-upload-disabled {
  cursor: pointer !important;
}
.ant-upload {
  position: relative;
  width: 100px !important;
  height: 100px !important;
}
.custom-btn {
  width: 100px;
  height: 100px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99;
}
</style>