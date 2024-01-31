"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode_1 = require("vscode"); //  commands 用于管理命令(比如注册命令) , ExtensionContext 用于获取扩展的上下文
const UI5Panel_1 = require("./panels/UI5Panel");
const fs_1 = require("fs");
function activate(context) {
    const downloadFileList = vscode_1.commands.registerCommand("UI5.getUI5List", (uri) => {
        console.log("uri", uri);
        // 提示 目前无法从命令面板操作
        if (!uri) {
            vscode_1.window.showErrorMessage("目前无法从命令面板进行操作");
            return;
        }
        // 读取 当前文件夹下的connectSAP.json文件
        (0, fs_1.readFile)(uri.fsPath + "\\connectSAP.json", "utf-8", (err, data) => __awaiter(this, void 0, void 0, function* () {
            if (err) {
                vscode_1.window.showErrorMessage("请配置connectSAP.json文件");
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
            // 测试连接,连接成功后,创建UI5Panel
            let res = yield UI5Panel_1.UI5Panel.testConnection();
            if (res) {
                vscode_1.window.showInformationMessage("SAP系统连接成功");
            }
            else {
                vscode_1.window.showErrorMessage("SAP系统连接失败");
                return;
            }
            // 创建 UI5Panel
            console.log("context.extensionUri", context.extensionUri);
            UI5Panel_1.UI5Panel.render(context.extensionUri); // 执行命令
        }));
    });
    context.subscriptions.push(downloadFileList); // 将命令添加到上下文中(用户就可以使用命令)
    // 注册更新工程命令
    const updateProjectCMD = vscode_1.commands.registerCommand("UI5.updateUI5Porject", (uri) => {
        console.log("updateProject");
        // 提示 目前无法从命令面板操作
        (0, fs_1.readFile)(uri.fsPath + "\\connectSAP.json", "utf-8", (err, data) => __awaiter(this, void 0, void 0, function* () {
            if (err) {
                vscode_1.window.showErrorMessage("请配置connectSAP.json文件");
                return;
            }
            const json = JSON.parse(data);
            UI5Panel_1.UI5Panel.baseURL = json.baseURL;
            UI5Panel_1.UI5Panel.useName = json.useName;
            UI5Panel_1.UI5Panel.usePwd = json.usePwd;
            UI5Panel_1.UI5Panel.systemIdentification = json.systemIdentification;
            UI5Panel_1.UI5Panel.sapClient = json.sapClient;
            UI5Panel_1.UI5Panel.targetFolder = uri.fsPath;
            // 更新目录
            let updateFolder = uri.fsPath + "\\webapp";
            // 判读用户是否指定了目录
            if (json.updateFolder) {
                updateFolder = uri.fsPath + "\\" + json.updateFolder;
            }
            // 测试连接,连接成功后,创建UI5Panel
            let res = yield UI5Panel_1.UI5Panel.testConnection();
            if (res) {
                vscode_1.window.showInformationMessage("SAP系统连接成功");
            }
            else {
                vscode_1.window.showErrorMessage("SAP系统连接失败");
                return;
            }
            json.updateFolder = updateFolder;
            //判读改目录updateFolder是否存在
            (0, fs_1.exists)(updateFolder, (exists) => __awaiter(this, void 0, void 0, function* () {
                if (!exists) {
                    vscode_1.window.showErrorMessage("请配置updateFolder目录");
                    return;
                }
                // 判读是否是文件夹
                let isDirectory = (0, fs_1.lstatSync)(updateFolder).isDirectory();
                if (!isDirectory) {
                    vscode_1.window.showErrorMessage("updateFolder目录必须是文件夹");
                    return;
                }
                UI5Panel_1.UI5Panel.updateProject(json); // 执行命令
            }));
        }));
    });
    context.subscriptions.push(updateProjectCMD); // 将命令添加到上下文中(用户就可以使用命令)
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map