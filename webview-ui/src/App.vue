<script setup lang="ts">
import { ref, computed } from "vue";
import { provideVSCodeDesignSystem, vsCodeButton } from "@vscode/webview-ui-toolkit";
// import { vscode } from "@/utilities/vscode";
const testMode = false;

var vscode = acquireVsCodeApi();
let result = ref("");
const search = ref("");
interface Ui5Project {
  id: string;
  summary: string;
  title: string;
}
// let tableData: Ui5Project[] = [
//   {
//     id: "%2fSCMTMS%2fGANTT_PROXY",
//     summary: "Proxy for Gantt Chart >= 9.4",
//     title: "/SCMTMS/GANTT_PROXY",
//   },
//   {
//     id: "%2fSCMTMS%2fGEOMAP",
//     summary: "GeoMap FrontEnd application",
//     title: "/SCMTMS/GEOMAP",
//   },
// ];
let tableData =ref([]);
window.addEventListener("message", (event) => {
  const message = event.data;
  if (message.command == undefined || !message.command) {
    // console.log('---------------------------message：aaaa');
    return;
  }
  if (message.command == "ui5-rt-version") {
    result.value = message.data;
  }
  if (message.command == "ui5-objects") {
    tableData.value = message.data;
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
 vscode.postMessage({ command: "ui5-download-object", text:data });
};
const handleDeleteClick = (index: any, data: any) => {
  vscode.postMessage({ command: "ui5-delete-object", text:data });
};
const filterTableData = computed(() =>
  tableData.value.filter(
    (data: any) => !search.value || (data.summary.toLowerCase().includes(search.value.toLowerCase()) || data.title.toLowerCase().includes(search.value.toLowerCase()))
  )
);
</script>

<template>
  <main>
    <h1>注意:服务器使用的sapui5版本是:{{ result }}</h1>
    <el-table
      stripe
      ref="singleTableRef"
      :data="filterTableData"
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column type="index" width="50" />
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
