<template>
  <page-header-wrapper :title="false">
    <a-card class="content-card">
      <a-table 
        size="middle" 
        :columns="columns" 
        :data-source="data" 
        :rowKey="(r) => r._id" 
        :pagination="false"
        :scroll="{x: true}"
      >
        <template slot="type" slot-scope="t">
          <a-tag v-if="t == 1" color="green">视频</a-tag>
          <a-tag v-else color="red">图片</a-tag>
        </template>
        <template slot="action" slot-scope="t, r, i">
          <a @click="handleEditorClick(r, i)">修改</a>
        </template>
      </a-table>
    </a-card>
    <!-- 新增 -->
    <CreateModal ref="createModal" :parent="this"></CreateModal>
  </page-header-wrapper>
</template>

<script>
import CreateModal from './modules/CreateModal.vue'
import { getHomePages } from '@/api/manage'
import { getFileName } from '@/utils/util'

export default {
  name: 'HomePage',
  components: {
    CreateModal,
  },
  data() {
    return {
      columns: [
        { title: '屏数', customRender: (t, r, i) => `第${i + 1}屏`, align: 'center', width: 120,fixed: 'left'},
        { title: '屏标题', dataIndex: 'title', key: 'title', width: 300 },
        { title: '屏描述', dataIndex: 'description', key: 'description'},
        { title: '屏类型', scopedSlots: { customRender: 'type' } },
        { title: '排序', dataIndex: 'ordreNum', key: 'orderNum',width: 100,align:'center'},
        { title: '操作', scopedSlots: { customRender: 'action' },width:100, fixed: 'right', align: 'center' },
      ],
      data: []
    }
  },
  methods: {
    // 修改
    handleEditorClick(r, i) {
      const _form = this.$refs.createModal.form
      for(const key in _form) {
        if(key == 'description') {
          _form[key] = r[key].split('∮')
        }else {
          _form[key] = r[key]
        }
      }
      this.$refs.createModal.fileList = [
        {name: getFileName(r.url),uid: r._id,url: process.env.VUE_APP_API_ORIGIN+r.url}
      ]
      this.$refs.createModal.id = r._id
      this.$refs.createModal.title = `修改第${i + 1}屏`
      this.$refs.createModal.visible = true
    },
    // 获取首页数据
    getList() {
      getHomePages().then(res => {
        if(res.code == 200) {
          this.data = res.data
        }
      })
    }
  },
  mounted() {
    this.getList()
  }
}
</script>