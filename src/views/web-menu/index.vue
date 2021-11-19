<template>
  <page-header-wrapper :title="false">
    <a-button icon="plus" @click="handleAddMenu" type="primary" style="margin-bottom:20px;">添加一级菜单</a-button>
    <a-card class="content-card">
      <a-table 
        size="middle"
        :columns="columns" 
        :data-source="data" 
        :rowKey="r=> r._id" 
      >
        <template slot="type" slot-scope="r">
          <a-tag v-if="r.type==1" color="green">链接菜单</a-tag>
          <a-tag v-else color="red">系列菜单</a-tag>
        </template>
        <template slot="action" slot-scope="r">
          <template v-if="!r.parentId">
            <a @click="handleAddClick(r)">新增</a>
            <a-divider type="vertical"></a-divider>
          </template>
          <a @click="handleEditorClick(r)">修改</a>
          <a-divider type="vertical"></a-divider>
          <a-popconfirm
            title="您确定要删除吗?"
            ok-text="确定"
            cancel-text="取消"
            @confirm="hanldeDelete(r)"
          >
            <a>删除</a>
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>
    <!-- 新增 -->
    <CreateModal ref="createModal" :parent="this"></CreateModal>
  </page-header-wrapper>
</template>

<script>
import { getMenuList,deleteMenu } from '@/api/manage'
import { showMessage } from '@/utils/mixins'
import CreateModal from './modules/CreateModal.vue'

export default {
  name: 'WebMenu',
  mixins: [showMessage],
  components: {
    CreateModal
  },
  data() {
    return {
      columns: [
        { title: '菜单名称', dataIndex: 'title', key: 'title' },
        { title: '菜单路由', dataIndex: 'path', key: 'path',customRender: (t) => {
          return <a-tag color="green">{t}</a-tag>
        }},
        { title: '排序', dataIndex: 'sortNum', key: 'sortNum',align:'center' },
        { title: '操作', scopedSlots: { customRender: 'action' }, align: 'left', fixed: 'right',width: 160 },
      ],
      data: [],
    }
  },
  methods: {
    // 删除列表
    hanldeDelete(r) {
      deleteMenu({id: r._id}).then(res => {
        this.showMessage(res,this.getList)
      })
    },
    //添加一级菜单
    handleAddMenu() {
      this.$refs.createModal.status = 1
      this.$refs.createModal.visible = true
      this.$refs.createModal.form.parentId = undefined
    },
    // 新增子菜单
    handleAddClick(r) {
      this.$refs.createModal.form.parentId = r._id
      this.$refs.createModal.visible = true
      this.$refs.createModal.status = 1
    },
    // 修改
    handleEditorClick(r) {
      this.$refs.createModal.status = 2
      this.$refs.createModal.visible = true
      this.$refs.createModal.id = r._id
      const _form = this.$refs.createModal.form
      for(const key in _form) {
        _form[key] = r[key]
      }
      // 这是系列带图片的菜单
      if(r.type==2) {
        this.$refs.createModal.fileList = [
          {
            name: r.title,
            uid: r._id,
            url: process.env.VUE_APP_API_ORIGIN+r.imgUrl || ''
          }
        ]
      }
    },
    // 获取列表
    getList() {
      getMenuList().then(res => {
        if(res.code == 200) {
          this.data = res.data
        }
      })
    },
  },
  mounted() {
    this.getList()
  }
}
</script>