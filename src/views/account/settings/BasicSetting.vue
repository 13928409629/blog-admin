<template>
  <div class="account-settings-info-view">
    <a-row :gutter="16" type="flex">
      <a-col :order="isMobile ? 2 : 1" :md="16" :lg="16">
        <a-form layout="vertical" :form="form">
          <a-form-item label="用户头像">
            <div class="ant-upload-preview" @click="$refs.modal.edit()">
              <a-icon type="cloud-upload-o" class="upload-icon" />
              <div class="mask">
                <a-icon type="plus" />
              </div>
              <img :src="option.img" />
            </div>
          </a-form-item>
          <a-form-item label="博客名">
            <a-input placeholder="博客名" v-model="form.name" style="width:50%" />
          </a-form-item>
          <a-form-item label="关于我">
            <wangEditor v-model="form.aboutMe" @change="editorChange"></wangEditor>
          </a-form-item>
          <a-form-item label="座右铭">
            <a-textarea
              v-model="form.motto"
              placeholder="座右铭"
              :auto-size="{ minRows: 3, maxRows: 5 }"
            />
          </a-form-item>
          <a-form-item label="个性签名">
            <a-textarea
              v-model="form.signature"
              placeholder="个性签名"
              :auto-size="{ minRows: 3, maxRows: 5 }"
            />
          </a-form-item>
          <!-- <a-form-item label="公司成立时间">
            <a-date-picker v-model="form.establishDate" valueFormat="YYYY-MM-DD" style="width:50%" />
          </a-form-item> -->
          <a-form-item label="QQ">
            <a-input-number placeholder="客服QQ" v-model="form.qq" style="width:50%;" />
          </a-form-item>
          <a-form-item label="微信">
            <a-input placeholder="微信" v-model="form.wx" style="width: 100%" />
          </a-form-item>
          <a-form-item label="网站seo关键字">
            <a-input placeholder="seo关键字" v-model="form.seoKeywords" />
          </a-form-item>
          <a-form-item label="网站seo描述">
            <a-textarea
              v-model="form.seoDescription"
              placeholder="网站seo描述"
              :auto-size="{ minRows: 3, maxRows: 5 }"
            />
          </a-form-item>
          <a-form-item label="邮箱">
            <a-input placeholder="邮箱" v-model="form.email" />
          </a-form-item>
          <!-- <a-form-item label="公司Logo">
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
          </a-form-item> -->
          <a-form-item>
            <a-button type="primary" @click="hanldeUpdateClick">更新基本设置</a-button>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>
    <avatar-modal ref="modal" @ok="setavatar" :parent="this" />
    <a-modal :visible="previewVisible" :footer="null" @cancel="previewVisible = false" width="60%">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script>
import AvatarModal from './AvatarModal'
import { baseMixin } from '@/store/app-mixin'
import { showMessage } from '@/utils/mixins'
import { getSystemInfo,updateSystemInfo } from '@/api/manage'
import { uploadFile,deleteFile } from '@/api/common'
import { getFileName } from '@/utils/util'
import wangEditor from '@/components/Editor/WangEditor.vue'

export default {
  mixins: [baseMixin,showMessage],
  components: {
    AvatarModal,
    wangEditor
  },
  data () {
    return {
      preview: {},
      form: {
        name: undefined,
        qq: undefined,
        wx: undefined,
        avatar: undefined,
        motto: undefined,
        signature: undefined,
        aboutMe: undefined,
        seoKeywords: undefined,
        seoDescription:undefined,
        email: undefined
      },
      option: {
        img: '',
        info: true,
        size: 1,
        outputType: 'jpeg',
        canScale: false,
        autoCrop: true,
        // 只有自动截图开启 宽度高度才生效
        autoCropWidth: 180,
        autoCropHeight: 180,
        fixedBox: true,
        // 开启宽度和高度比例
        fixed: true,
        fixedNumber: [1, 1]
      },
      fileList: [],
      previewVisible: false,
      previewImage: '',
      locationOrigin: process.env.VUE_APP_API_ORIGIN,
      avatarId: undefined
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
          _this.form.logo = res.data
        }else {
          _this.$message.error(res.message)
        }
      })
    },
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
    editorChange(val) {
      this.form.aboutMe = val
    },
    setavatar (data) {
      this.form.avatar = data._id
      this.option.img = data.link
      this.hanldeUpdateClick()
    },
    // 获取公司介绍
    getSystemInfo() {
      getSystemInfo().then(res => {
        if(res.code == 200) {
          res = res.data
          if(res) {
            for(const key in this.form) {
              if(key != 'avatar') {
                this.form[key] = res[key]
              }else {
                this.form[key] = res[key] && res[key]._id
              }
            }
            if(res.avatar) {
              this.avatarId = res.avatar._id
              this.fileList = [
                {uid: this.avatarId, name: getFileName(res.avatar.link),url: res.avatar.link}
              ]
              this.option.img = res.avatar.link || ''
            }
          }
        }
      })
    },
    // 更新公司介绍
    hanldeUpdateClick() {
      this.loading = true
      updateSystemInfo(this.form).then(res => {
        this.loading = false
        if(res.code == 200) {
          this.showMessage(res,this.getSystemInfo)
        }
      })
    }
  },
  mounted() {
    this.getSystemInfo()
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
  width: 140px;
  box-shadow: 0 0 4px #ccc;
  border-radius: 50%;
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
    width: 140px !important;
    height: 140px !important;
    overflow: hidden;
    border-radius: 50%;
  }

}
</style>
