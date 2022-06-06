import { commands, ExtensionContext,window } from "vscode"; //  commands 用于管理命令(比如注册命令) , ExtensionContext 用于获取扩展的上下文
import { UI5Panel } from "./panels/UI5Panel";
import {readFile} from "fs";

export function activate(context: ExtensionContext) {
  const showHelloWorldCommand = commands.registerCommand("UI5.getUI5List", (uri) => {// 注册命令
    console.log("uri",uri);
    // 提示 目前无法从命令面板操作
    if (!uri) {
      window.showErrorMessage("目前无法从命令面板进行操作");
      return;
    }
    // 读取 当前文件夹下的connectSAP.json文件
    readFile(uri.fsPath + "\\connectSAP.json", "utf-8", (err:any, data:any) => {
      if (err) {
        window.showErrorMessage("请正确配置connectSAP.json文件");
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
      // 创建 UI5Panel
      console.log("context.extensionUri",context.extensionUri);
      UI5Panel.render(context.extensionUri);// 执行命令
      });
 
  });
  context.subscriptions.push(showHelloWorldCommand);// 将命令添加到上下文中(用户就可以使用命令)
}
