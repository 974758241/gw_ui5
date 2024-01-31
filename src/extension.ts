import { commands, ExtensionContext,window } from "vscode"; //  commands 用于管理命令(比如注册命令) , ExtensionContext 用于获取扩展的上下文
import { UI5Panel } from "./panels/UI5Panel";
import {readFile,exists,lstatSync} from "fs";

export function activate(context: ExtensionContext) {
  const downloadFileList = commands.registerCommand("UI5.getUI5List", (uri) => {// 注册命令
    console.log("uri",uri);
    // 提示 目前无法从命令面板操作
    if (!uri) {
      window.showErrorMessage("目前无法从命令面板进行操作");
      return;
    }
    // 读取 当前文件夹下的connectSAP.json文件
    readFile(uri.fsPath + "\\connectSAP.json", "utf-8", async (err:any, data:any) => {
      if (err) {
        window.showErrorMessage("请配置connectSAP.json文件");
        return;
      }
      console.log("data",data);
      
      const json = JSON.parse(data);
      UI5Panel.baseURL = json.baseURL;
      UI5Panel.useName = json.useName;
      UI5Panel.usePwd = json.usePwd;
      UI5Panel.systemIdentification = json.systemIdentification;
      UI5Panel.sapClient = json.sapClient;
      UI5Panel.targetFolder = uri.fsPath;
      // 测试连接,连接成功后,创建UI5Panel
      let res =  await UI5Panel.testConnection();
      if (res) {
       window.showInformationMessage("SAP系统连接成功");
      }else{
       window.showErrorMessage("SAP系统连接失败");
       return;
      }
      
      // 创建 UI5Panel
      console.log("context.extensionUri",context.extensionUri);
      UI5Panel.render(context.extensionUri);// 执行命令
      });
 
  });
  context.subscriptions.push(downloadFileList);// 将命令添加到上下文中(用户就可以使用命令)

  // 注册更新工程命令
  const updateProjectCMD = commands.registerCommand("UI5.updateUI5Porject", (uri) => {
    console.log("updateProject");
    // 提示 目前无法从命令面板操作
    readFile(uri.fsPath + "\\connectSAP.json", "utf-8", async (err:any, data:any) => {
      if (err) {
        window.showErrorMessage("请配置connectSAP.json文件");
        return;
      }
      const json = JSON.parse(data);
      UI5Panel.baseURL = json.baseURL;
      UI5Panel.useName = json.useName;
      UI5Panel.usePwd = json.usePwd;
      UI5Panel.systemIdentification = json.systemIdentification;
      UI5Panel.sapClient = json.sapClient;
      UI5Panel.targetFolder = uri.fsPath;
      // 更新目录
      let updateFolder = uri.fsPath + "\\webapp";
      // 判读用户是否指定了目录
      if (json.updateFolder) {
        updateFolder = uri.fsPath + "\\" + json.updateFolder;
      }
      
      // 测试连接,连接成功后,创建UI5Panel
     let res =  await UI5Panel.testConnection();
     if (res) {
      window.showInformationMessage("SAP系统连接成功");
     }else{
      window.showErrorMessage("SAP系统连接失败");
      return;
     }
     json.updateFolder = updateFolder;
      //判读改目录updateFolder是否存在
      exists(updateFolder,async (exists:boolean) => {
        if (!exists) {
          window.showErrorMessage("请配置updateFolder目录");
          return;
        }
        // 判读是否是文件夹
        let isDirectory = lstatSync(updateFolder).isDirectory();
        if (!isDirectory) {
          window.showErrorMessage("updateFolder目录必须是文件夹");
          return;
        }
        UI5Panel.updateProject(json);// 执行命令
      });
      });
 
  });
  context.subscriptions.push(updateProjectCMD);// 将命令添加到上下文中(用户就可以使用命令)

}
