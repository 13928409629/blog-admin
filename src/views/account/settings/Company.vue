<template>
  <div class="account-settings-info-view">
    <a-row :gutter="16" type="flex">
      <a-col :order="isMobile ? 2 : 1" :md="16" :lg="16">
        <a-form layout="vertical" :form="form">
          <a-form-item label="公司简介">
            <a-textarea
              v-model="form.profile"
              placeholder="公司简介"
              :auto-size="{ minRows: 3, maxRows: 5 }"
            />
          </a-form-item>
          <a-form-item label="公司描述">
            <a-textarea
              v-model="form.description"
              placeholder="公司描述"
              :auto-size="{ minRows: 3, maxRows: 5 }"
            />
          </a-form-item>
          <a-form-item label="价值观">
            <a-input v-model="form.worth" placeholder="公司简介" />
          </a-form-item>
          <a-form-item label="企业文化">
            <a-textarea
              v-model="form.corporateCulture"
              placeholder="企业文化"
              :auto-size="{ minRows: 3, maxRows: 5 }"
            />
          </a-form-item>
          <a-form-item label="省市自治区的产品和服务覆盖">
            <a-input-number
              v-model="form.serviceProvince"
              placeholder="省市自治区的产品和服务覆盖"
              style="width:50%;"
            />
          </a-form-item>
          <a-form-item label="备案号">
            <a-input v-model="form.beian" placeholder="备案号" />
          </a-form-item>
          <a-form-item label="企业文化配图">
            <a-upload
              list-type="picture-card"
              :file-list="fileList"
              :remove="hanldeImgRemove"
              @preview="handlePreview"
              :customRequest="handleUploadChange"
              class="upload-half"
              accept="image/*"
            >
              <div class="custom-btn" v-if="fileList.length<1">
                <a-icon type="ant-cloud" style="font-size: 26px" />
                <div class="ant-upload-text">添加图片</div>
              </div>
            </a-upload>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="hanldeUpdateClick" :loading="loading">更新公司介绍</a-button>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>
    <a-modal :visible="previewVisible" :footer="null" @cancel="previewVisible = false" width="60%">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script>
import { getCompanyDetail,updateCompanyInfo } from '@/api/manage'
import { uploadFile,deleteFile } from '@/api/common'
import { getFileName } from '@/utils/util'
import { baseMixin } from '@/store/app-mixin'
import { showMessage } from '@/utils/mixins'

export default {
  mixins: [baseMixin,showMessage],
  data () {
    return {
      form: {
        profile: undefined,
        corporateCulture: undefined,
        corporateCultureImage: undefined,
        serviceProvince: undefined,
        worth: undefined,
        description: undefined,
        beian: undefined
      },
      previewVisible: false,
      previewImage: '',
      fileList: [],
      userInfo: null,
      loading: false
    }
  },
  methods: {
    // 预览图片
    handlePreview(file) {
      this.previewVisible = true
      this.previewImage = file.url
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
          _this.form.corporateCultureImage = res.data
        }else {
          _this.$message.error(res.message)
        }
      })
    },
    // 获取公司介绍
    getCompanyDetail() {
      getCompanyDetail().then(res => {
        if(res.code == 200) {
          for(const key in this.form) {
            this.form[key] = res.data[key]
          }
          if(res.data.corporateCultureImage) {
            this.fileList = [{
              uid: Math.random(),
              url: process.env.VUE_APP_API_ORIGIN+res.data.corporateCultureImage
            }]
          }
        }
      })
    },
    // 更新公司介绍
    hanldeUpdateClick() {
      this.loading = true
      updateCompanyInfo(this.form).then(res => {
        this.loading = false
        if(res.code == 200) {
          this.showMessage(res,this.getCompanyDetail)
        }
      })
    }
  },
  mounted() {
    this.getCompanyDetail()
  }
}
</script>

<style lang="less" scoped>
.ant-form-item {
  margin-bottom: 10px;
}
.avatar-upload-wrapper {
  height: 200px;
  width: 100%;
}

.ant-upload-preview {
  position: relative;
  width: 120px;
  box-shadow: 0 0 4px #ccc;
  .upload-icon {
    position: absolute;
    top: 0;
    right: 10px;
    font-size: 1.4rem;
    padding: 0.5rem;
    background: rgba(222, 221, 221, 0.7);
    border: 1px solid rgba(0, 0, 0, 0.2);
  }
  .mask {
    opacity: 0;
    position: absolute;
    background: rgba(0, 0, 0, 0.4);
    cursor: pointer;
    transition: opacity 0.4s;

    &:hover {
      opacity: 1;
    }

    i {
      font-size: 2rem;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -1rem;
      margin-top: -1rem;
      color: #d6d6d6;
    }
  }
  img,
  .mask {
    width: 100%;
    max-width: 180px;
    height: 100%;
    overflow: hidden;
  }

}
</style>

<style lang="less">

.custom-btn {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}
</style>
