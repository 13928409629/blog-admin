<template>
  <page-header-wrapper :title="false">
    <a-card class="content-card">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="6" :sm="24">
              <a-form-item label="文件名">
                <a-input v-model="queryParam.title" placeholder="文件名" allowClear />
              </a-form-item>
            </a-col>
            <a-col :md="!advanced && 6 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="getSearch">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
                <!-- <a @click="toggleAdvanced" style="margin-left: 8px">
                  {{ advanced ? '收起' : '展开' }}
                  <a-icon :type="advanced ? 'up' : 'down'"/>
                </a> -->
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
        :loading="loading"
        :rowKey="r => r._id"
        :pagination="pagination"
      >
        <template slot="model" slot-scope="r">
          <a-tag color="green">{{ r.model }}</a-tag>
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
import { getInformation,getMenuTree,deleteInformation } from '@/api/manage'
import { getFileName } from '@/utils/util'
export default {
  name: 'News',
  mixins: [toggleQuery,showMessage],
  components: {
    CreateModal
  },
  data () {
    return {
      queryParam: {},
      columns: [
        {title: '序号',customRender: (t,r,i) => `${i+1}`,width: 70,align: 'center'},
        {title: '所属系列',dataIndex: 'series',key: 'series',ellipsis: true},
        {title: '文件名',dataIndex: 'title',key: 'title',align:'center'},
        {title: '所属系列',dataIndex: 'series',key: 'series',align:'center'},
        {title: '所属型号',scopedSlots: {customRender: 'model'},align:'center'},
        {title: '下载地址',dataIndex: 'url',key:'url',align:'center'},
        {title: '操作',scopedSlots: {customRender: 'action'},width: 120,align: 'center'}
      ],
      data: [],
      pagination: {
        total: 0,
        pageSize: 10,
        // showSizeChanger: true,
        // pageSizeOptions: ['10', '20', '30', '40'],
        showTotal: total => `共 ${total} 条`
      },
      pageNum: 1,
      pageSize: 10,
      loading: false,
      menuTree: []
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
      this.$refs.CreateModal.id = r._id
      this.$refs.CreateModal.status = 2
      this.$refs.CreateModal.visible = true
      this.$refs.CreateModal.title = '修改新闻'
      const _form = this.$refs.CreateModal.form
      for(const key in _form) {
        _form[key] = r[key]
      }
      this.$refs.CreateModal.fileList = [{
        uid: r._id,
        name: getFileName(r.url),
        url: process.env.VUE_APP_API_ORIGIN+r.url
      }]
    },
    // 删除
    handleDeleteClick(r) {
      deleteInformation({id: r._id}).then(res => {
        this.showMessage(res,this.getList)
      })
    },
    // 获取列表
    getList() {
      this.loading = true
      getInformation(this.queryParam).then(res => {
        this.loading = false
        if(res.code == 200) {
          this.data = res.data
        }
      })
    },
    //获取系列树结构
    getMenuTree() {
      getMenuTree().then(res => {
        if(res.code == 200) {
          const _data = this.dealMenuList(res.data.filter(item => item.id == 5))[0].children
          for(let i=0; i<_data.length;i++) {
            if(_data[i].children && _data[i].children.length) {
              _data[i].children.forEach(item => {
                this.menuTree.push(item)
              })
            }
          }
        }
      })
    },
    dealMenuList(list) {
      list.forEach(item => {
        if(!item.children || !item.children.length) {
          delete item.children
        }else {
          this.dealMenuList(item.children)
        }
      })
      return list
    }
  },
  created() {
    this.getMenuTree()
  },
  mounted() {
    this.getList()
  }
}
</script>