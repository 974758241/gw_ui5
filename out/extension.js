"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode_1 = require("vscode"); //  commands 用于管理命令(比如注册命令) , ExtensionContext 用于获取扩展的上下文
const UI5Panel_1 = require("./panels/UI5Panel");
const fs_1 = require("fs");
function activate(context) {
    const showHelloWorldCommand = vscode_1.commands.registerCommand("UI5.getUI5List", (uri) => {
        console.log("uri", uri);
        // 提示 目前无法从命令面板操作
        if (!uri) {
            vscode_1.window.showErrorMessage("目前无法从命令面板进行操作");
            return;
        }
        // 读取 当前文件夹下的connectSAP.json文件
        (0, fs_1.readFile)(uri.fsPath + "\\connectSAP.json", "utf-8", (err, data) => {
            if (err) {
                vscode_1.window.showErrorMessage("请正确配置connectSAP.json文件");
                return;
            }
            console.log("data", data);
            const json = JSON.parse(data);
            UI5Panel_1.UI5Panel.baseURL = json.baseURL;
            UI5Panel_1.UI5Panel.useName = json.useName;
            UI5Panel_1.UI5Panel.usePwd = json.usePwd;
            UI5Panel_1.UI5Panel.systemIdentification = json.systemIdentification;
            UI5Panel_1.UI5Panel.sapClient = json.sapClient;
            UI5Panel_1.UI5Panel.targetFolder = uri.fsPath;
            // 创建 UI5Panel
            console.log("context.extensionUri", context.extensionUri);
            UI5Panel_1.UI5Panel.render(context.extensionUri); // 执行命令
        });
    });
    context.subscriptions.push(showHelloWorldCommand); // 将命令添加到上下文中(用户就可以使用命令)
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map
