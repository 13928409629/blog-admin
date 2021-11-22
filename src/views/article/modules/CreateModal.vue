<template>
  <a-drawer
    :title="title"
    :closable="false"
    :maskClosable="false"
    width="60%"
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
      <a-form-model-item label="文章归类" prop="menuId">
        <a-tree-select
          v-model="form.menuId"
          style="width: 50%"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          :tree-data="parent.treeData"
          placeholder="文章归类"
          tree-default-expand-all
          :replaceFields="{
            key: '_id',
            value: '_id'
          }"
        >
        </a-tree-select>
      </a-form-model-item>
      <a-form-model-item label="文章标题" prop="title">
        <a-input v-model="form.title" placeholder="文章标题" />
      </a-form-model-item>
      <a-form-model-item label="文章封面图">
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
      </a-form-model-item>
      <a-form-model-item label="文章摘要" prop="description">
        <a-textarea
          v-model="form.description"
          placeholder="文章摘要"
          :auto-size="{ minRows: 2, maxRows: 6 }"
        />
      </a-form-model-item>
      <a-form-item label="文章标签">
        <a-select v-model="form.tag" placeholder="文章标签" allowClear>
          <a-select-option :value="item._id" v-for="item of parent.tagList" :key="item._id">{{ item.title }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-model-item label="来源">
        <a-input v-model="form.source" placeholder="文章来源" />
      </a-form-model-item>
      <a-form-model-item label="是否推荐" prop="isRecommend">
        <a-select v-model="form.isRecommend" placeholder="是否推荐" style="width:50%;">
          <a-select-option :value="true">是</a-select-option>
          <a-select-option :value="false">否</a-select-option>
        </a-select>
      </a-form-model-item>
      <!-- <a-form-model-item label="文章标签" prop="type">
        <a-select v-model="form.type" placeholder="文章类型" style="width:50%;">
          <a-select-option :value="1">公司文章</a-select-option>
          <a-select-option :value="2">行内资讯</a-select-option>
        </a-select>
      </a-form-model-item> -->
      <a-form-model-item label="文章排序" prop="sortNum">
        <a-input v-model="form.sortNum" placeholder="文章排序" />
      </a-form-model-item>
      <a-form-model-item label="文章内容" required>
        <wangEditor :value="form.content" @change="editorChange"></wangEditor>
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
  </a-drawer>
</template>

<script>
import { insertArticle,updateArticle,getTagList } from '@/api/manage'
import { showMessage } from '@/utils/mixins'
import { uploadFile,deleteFile } from '@/api/common'
import { getFileName } from '@/utils/util'
import wangEditor from '@/components/Editor/WangEditor.vue'

export default {
  mixins: [showMessage],
  components: {
    wangEditor
  },
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
        menuId: undefined,
        tag: [],
        title: undefined,
        description: undefined,
        type: undefined,
        fileId:undefined,
        isRecommend: undefined,
        content: undefined,
        sortNum: undefined,
        source: undefined
      },
      rules: {
        title: [{required: true, message: '文章标题不能为空', trigger: 'blur'}],
        description: [{required: true, message: '文章描述不能为空', trigger: 'blur'}],
        type: [{required: true, message: '文章类型不能为空', trigger: 'change'}],
        isRecommend: [{required: true, message: '是否推荐到首页不能为空', trigger: 'change'}],
      },
      status: undefined,
      id: undefined,
      fileList: [],
      previewVisible: false,
      previewImage: ''
    }
  },
  methods: {
    // 预览图片
    handlePreview(file) {
      this.previewVisible = true
      this.previewImage = file.url
    },
    // 删除图片
    hanldeImgRemove(file) {
      deleteFile({id: file.uid}).then(res => {
        if(res.code == 200) {
          this.showMessage(res,() => {
            this.fileList = []
          })
        }
      })
    },
    //自定义上传图片
    handleUploadChange(file) {
      const _this = this
      file = file.file
      const formdata = new FormData()
      formdata.append('file', file)
      uploadFile(formdata).then(res => {
        if(res.code == 200) {
          file.url = res.data.link
          file.id = res.data._id
          file.uid = res.data._id
          file.fileame = getFileName( res.data.link )
          _this.fileList.push(file)
          _this.form.fileId = res.data._id
        }else {
          _this.$message.error(res.message)
        }
      })
    },
    editorChange(val) {
      this.form.content = val
    },
    // 提交
    onSubmit () {
      this.$refs.ruleForm.validate(vaild => {
        if(vaild) {
          if(!this.form.content) {
            this.$message.warning('文章内容不能为空！')
            return
          }
          if(this.status == 1) {
            insertArticle(this.form).then(res => {
              this.showMessage(res, () => {
                this.onClose()
                this.parent.getList()
              })
            })
          }else {
            updateArticle({
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
        if(key == 'tag') {
          this.form[key] = []
        }else {
          this.form[key] = undefined
        }
      }
      this.status = undefined
      this.visible = false
      this.id = undefined
      this.fileList = []
    }
  }
}
</script>