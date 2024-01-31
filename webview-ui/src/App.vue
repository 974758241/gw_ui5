<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { provideVSCodeDesignSystem, vsCodeButton } from "@vscode/webview-ui-toolkit";
// import { vscode } from "@/utilities/vscode";
const testMode = false;
let loading = ref(true);
var vscode = acquireVsCodeApi();
let result = ref("");
const search = ref("");
interface Ui5Project {
  id: string;
  summary: string;
  title: string;
}
// 刚进入页面的时候设置成busy状态
// 当接收到"ui5-objects"消息的时候，取消busy状态
let tableData =ref([]);

window.addEventListener("message", (event) => { // 监听消息
  const message = event.data;
  if (message.command == undefined || !message.command) {
    // console.log('---------------------------message：aaaa');
    return;
  }
  if (message.command == "ui5-rt-version") {
    result.value = message.data;
    ElMessage({
      message: '获取列表成功!',
      type: 'success'
    })
  }
  if (message.command == "ui5-objects") {
    tableData.value = message.data;


    
    ElMessage({
      message: '获取列表成功!',
      type: 'success'
    })
  }
  if (message.command == "ui5-download-object-complete") {
    loading = ref(false)
    // 弹出下载成功的提示
    ElMessage({
      message: '文件下载成功!请到本地查看!',
      type: 'success'
    })
   
  }
});
const handleCurrentChange = (item: any) => {
  vscode.postMessage({ command: "ui5-object-detail", data: item });
};
// In order to use the Webview UI Toolkit web components they
// must be registered with the browser (i.e. webview) using the
// syntax below.
provideVSCodeDesignSystem().register(vsCodeButton());

// To register more toolkit components, simply import the component
// registration function and call it from within the register
// function, like so:
//
// provideVSCodeDesignSystem().register(
//   vsCodeButton(),
//   vsCodeCheckbox()
// );
//
// Finally, if you would like to register all of the toolkit
// components at once, there's a handy convenience function:
//
// provideVSCodeDesignSystem().register(allComponents.register());


const handleDownLoadClick = (index: any, data: any) => {
  //设置成busy状态
  loading = ref(true);
 vscode.postMessage({ command: "ui5-download-object", text:data });
};
const handleDeleteClick = (index: any, data: any) => {
  vscode.postMessage({ command: "ui5-delete-object", text:data });
};
const filterTableData = computed(() =>{

  setTimeout(() => {
    loading = ref(false);
  }, 3000);
  return tableData.value.filter(
    (data: any) => !search.value || (data.summary.toLowerCase().includes(search.value.toLowerCase()) || data.title.toLowerCase().includes(search.value.toLowerCase()))
    );
   
  }
  
  
  
);
const handleDataUpdate = (data: any) => {
  loading = ref(false);
};
</script>

<template>
  <main v-loading="loading">
    <h1>注意:服务器使用的sapui5版本是:{{ result }}</h1>
    <el-table
      stripe
      ref="singleTableRef"
      :data="filterTableData"
      highlight-current-row
      @update:data="handleDataUpdate"
      style="width: 100%"
      height="800"
    >
      <el-table-column fixed prop="index"  type="index" width="100" label="序号"/>
      <el-table-column property="title" label="程序" />
      <el-table-column property="summary" label="描述" />
      <el-table-column align="right">
        <template #header>
          <el-input v-model="search" size="small" placeholder="搜索你需要操作的UI5程序" />
        </template>
        <template #default="scope">
          <el-button size="small" @click="handleDownLoadClick(scope.$index, scope.row.title)"
            >下载</el-button
          >
          <!-- <el-button size="small" type="danger" @click="handleDeleteClick(scope.$index, scope.row.title)"
            >删除</el-button
          > -->
        </template>
      </el-table-column>
    </el-table>
  </main>
</template>

<style>
main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
}

main > * {
  margin: 1rem 0;
}
</style>
