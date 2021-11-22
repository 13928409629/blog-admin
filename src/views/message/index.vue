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
        <template slot="user" slot-scope="t,r">
          <a-tag color="green">{{ r.user.nickname }}</a-tag>
        </template>
        <template slot="target">
          <a-tag color="green">系统管理员</a-tag>
        </template>
        <template slot="action" slot-scope="r">
          <a @click="handleReplyClick(r)">回复</a>
          <a-divider type="vertical"></a-divider>
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
    <!-- 回复框 -->
    <a-modal
      title="回复留言"
      :visible="visible"
      @ok="handleReplyOk"
      @cancel="visible=false"
    >
      <a-textarea
        v-model="content"
        placeholder="留言内容"
        :auto-size="{ minRows: 3, maxRows: 5 }"
      />
    </a-modal>
  </page-header-wrapper>
</template>

<script>
import CreateModal from './modules/CreateModal.vue'
import { toggleQuery,showMessage } from '@/utils/mixins'
import { getMessageList,deleteMessage,getUserList,replyMessage } from '@/api/manage'

export default {
  name: 'Message',
  mixins: [toggleQuery,showMessage],
  components: {
    CreateModal
  },
  data () {
    return {
      visible: false,
      content: '',
      queryParam: {},
      columns: [
        {title: '序号',customRender: (t,r,i) => `${i+1}`,width: 70,align: 'center'},
        {title: '留言用户',scopedSlots: {customRender: 'user'},align:'center',width: 150},
        {title: '目标用户',scopedSlots: {customRender: 'target'},align:'center',width: 150},
        {title: '留言内容',dataIndex: 'content',key: 'content',width: 500},
        {title: '回复内容',dataIndex: 'replyContent',key: 'replyContent'},
        {title: '操作',scopedSlots: {customRender: 'action'},width: 140,align: 'center',fixed: 'right'}
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
      userList: [],
      id: undefined
    }
  },
  watch: {
    visible(val) {
      if(!val) {
        this.content = ''
        this.id = undefined
      }
    }
  },
  methods: {
    // 回复提交
    handleReplyOk() {
      replyMessage({
        id: this.id,
        replyContent: this.content
      }).then(res => {
        if(res.code == 200) {
          this.showMessage(res,this.getList)
          this.visible = false
        }
      })
    },
    // 回复
    handleReplyClick(r) {
      console.log(r)
      this.visible = true
      this.id = r._id
    },
    // 新增
    handleAddClick() {
      this.$refs.CreateModal.status = 1
      this.$refs.CreateModal.visible = true
      this.$refs.CreateModal.title = '新增留言'
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
      this.$refs.CreateModal.title = '修改留言'
      _form.content = r.content
      _form.target = r.target._id
    },
    // 删除
    handleDeleteClick(r) {
      deleteMessage({id: r._id}).then(res => {
        if(res.code == 200) {
          this.showMessage(res,this.getList)
        }
      })
    },
    // 获取列表
    getList() {
      this.loading = true
      getMessageList({
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
    // 获取用户列表
    getUserList() {
      getUserList().then(res => {
        if(res.code == 200) {
          this.userList = res.data
        }
      })
    }
  },
  mounted() {
    this.getList()
    this.getUserList()
  }
}
</script>