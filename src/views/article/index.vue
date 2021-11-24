<template>
  <page-header-wrapper :title="false">
    <a-card class="content-card">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="6" :sm="24">
              <a-form-item label="文章标题">
                <a-input v-model="queryParam.title" placeholder="文章标题" allowClear />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="24">
              <a-form-item label="文章标签">
                <a-select v-model="queryParam.tag" placeholder="文章标签" allowClear>
                  <a-select-option :value="item._id" v-for="item of tagList" :key="item._id">{{ item.title }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="!advanced && 6 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="getSearch">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <!-- 新增 -->
      <a-row style="margin-bottom:20px;">
        <a-button icon="plus" @click="handleAddClick" type="primary">新增</a-button>
      </a-row>
      <a-table 
        size="middle"
        :columns="columns" 
        :data-source="data" 
        :rowKey="r=>r._id"
        :pagination="pagination"
        @change="paginationChange"
        :loading="loading"
        :scroll="{x: _width}"
      >
        <template slot="image" slot-scope="t,r">
          <img :src="r.fileId.link" alt="" class="table-img">
        </template>
        <template slot="tag" slot-scope="t">
          <a-tag color="green" v-if="t.length">{{ t[0].title }}</a-tag>
        </template>
        <template slot="type" slot-scope="t,r">
          <a-tag color="red">{{ r.menuId.title }}</a-tag>
        </template>
        <template slot="isRecommend" slot-scope="t">
          <a-tag v-if="!t">否</a-tag>
          <a-tag v-else color="green">是</a-tag>
        </template>
        <template slot="action" slot-scope="r">
          <a @click="handleEditorClick(r)">修改</a>
          <a-divider type="vertical"></a-divider>
          <a-popconfirm
            title="您确定要删除吗?"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleDeleteClick(r)"
          >
            <a>删除</a>
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>
    <!-- 新增 -->
    <CreateModal ref="CreateModal" :parent="this"></CreateModal>
  </page-header-wrapper>
</template>

<script>
import CreateModal from './modules/CreateModal.vue'
import { toggleQuery,showMessage } from '@/utils/mixins'
import { getArticleList,deleteArticle,getTagList,getMenuList } from '@/api/manage'
import { getFileName } from '@/utils/util'

export default {
  name: 'Article',
  mixins: [toggleQuery,showMessage],
  components: {
    CreateModal
  },
  data () {
    return {
      queryParam: {},
      columns: [
        {title: '序号',customRender: (t,r,i) => `${i+1}`,width: 70,align: 'center'},
        {title: '文章配图',scopedSlots: {customRender: 'image'},align:'center',width: 140},
        {title: '文章标题',dataIndex: 'title',key: 'title',ellipsis: true,width:300},
        {title: '文章摘要',dataIndex: 'description',key: 'description',ellipsis: true,width:500},
        {title: '文章标签',dataIndex: 'tag',key: 'tag', scopedSlots: {customRender: 'tag'},align:'center'},
        {title: '文章归类',scopedSlots: {customRender: 'type'},align:'center'},
        // {title: '状态',dataIndex: 'status',key: 'status',scopedSlots: {customRender: 'status'},align:'center'},
        {title: '是否推荐',dataIndex: 'isRecommend',key: 'isRecommend',scopedSlots: {customRender: 'isRecommend'},align:'center',width: 100},
        {title: '操作',scopedSlots: {customRender: 'action'},width: 120,align: 'center',fixed: 'right'}
      ],
      data: [],
      loading: false,
      pagination: {
        total: 0,
        pageSize: 10,
        showTotal: total => `共 ${total} 条`
        // showSizeChanger: true,
        // pageSizeOptions: ['10', '20', '30', '40']
      },
      pageNum: 1,
      pageSize: 10,
      tagList: [],
      treeData: []
    }
  },
  computed: {
    _width() {
      return this.columns.reduce((x,y) => {return x+y.width},0)
    }
  },
  methods: {
    // 新增
    handleAddClick() {
      this.$refs.CreateModal.status = 1
      this.$refs.CreateModal.visible = true
      this.$refs.CreateModal.title = '新增新闻'
    },
    // 分页查询
    paginationChange(e) {
      this.pageNum = e.current
      this.pageSize = e.pageSize
      this.getList()
    },
    // 查询
    getSearch() {
      this.pageNum = 1
      this.getList()
    },
    // 修改
    handleEditorClick(r) {
      const _form = this.$refs.CreateModal.form
      this.$refs.CreateModal.id = r._id
      this.$refs.CreateModal.status = 2
      this.$refs.CreateModal.visible = true
      this.$refs.CreateModal.title = '修改文章'
      for(const key in _form) {
        if(key == 'tag') {
          if(r.tag && r.tag.length) {
            _form[key] = r.tag[0]._id
          }
        }else if(key == 'menuId') {
          _form[key] = r.menuId && r.menuId._id
        }else {
          _form[key] = r[key]
        }
      }
      if(r.fileId) {
        this.$refs.CreateModal.fileList.push({
          uid: r.fileId._id,
          name: getFileName(r.fileId.link),
          url: r.fileId.link
        })
      }
    },
    // 删除
    handleDeleteClick(r) {
      deleteArticle({id: r._id}).then(res => {
        if(res.code == 200) {
          this.showMessage(res,this.getList)
        }
      })
    },
    // 获取列表
    getList() {
      this.loading = true
      getArticleList({
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        ...this.queryParam
      }).then(res => {
        this.loading = false
        if(res.code == 200) {
          this.data = res.data.list
          this.pagination.total = res.data.total
        }
      })
    },
    // 获取标签
    getTagList() {
      getTagList({pageNum: 1,pageSize: 99}).then(res => {
        if(res.code == 200) {
          this.tagList = res.data.list
        }
      })
    },
    // 获取菜单
    getMenuList() {
      getMenuList().then(res => {
        if(res.code == 200) {
          this.treeData = res.data
        }
      })
    }
  },
  mounted() {
    this.getList()
    this.getTagList()
    this.getMenuList()
  }
}
</script>