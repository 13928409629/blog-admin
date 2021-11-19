<template>
  <page-header-wrapper :title="false">
    <a-card class="content-card">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="6" :sm="24">
              <a-form-item label="评论内容">
                <a-input v-model="queryParam.content" placeholder="评论内容" allowClear />
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
      >
        <template slot="articleTitle" slot-scope="t,r">
          <a-tag color="green">{{ r.article && r.article.title }}</a-tag>
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
import { getCommentList,deleteComment,getArticleList } from '@/api/manage'

export default {
  name: 'Comment',
  mixins: [toggleQuery,showMessage],
  components: {
    CreateModal
  },
  data () {
    return {
      queryParam: {},
      columns: [
        {title: '序号',customRender: (t,r,i) => `${i+1}`,width: 70,align: 'center'},
        {title: '文章标题',scopedSlots: {customRender: 'articleTitle'},align:'center',width: 500,ellipsis:true},
        {title: '评论内容',dataIndex: 'content',key: 'content'},
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
      articleList: []
    }
  },
  
  methods: {
    // 新增
    handleAddClick() {
      this.$refs.CreateModal.status = 1
      this.$refs.CreateModal.visible = true
      this.$refs.CreateModal.title = '新增标签'
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
      this.$refs.CreateModal.title = '修改标签'
      for(const key in _form) {
        _form[key] = r[key]
      }
    },
    // 删除
    handleDeleteClick(r) {
      deleteComment({id: r._id}).then(res => {
        if(res.code == 200) {
          this.showMessage(res,this.getList)
        }
      })
    },
    // 获取列表
    getList() {
      this.loading = true
      getCommentList({
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
    //获取文章列表
    getArticleList() {
      getArticleList({
        pageNum: 1,
        pageSize: 999
      }).then(res => {
        if(res.code == 200) {
          this.articleList = res.data.list
        }
      })
    }
  },
  mounted() {
    this.getList()
    this.getArticleList()
  }
}
</script>