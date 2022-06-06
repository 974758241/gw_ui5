"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUri = void 0;
const vscode_1 = require("vscode");
/**
* 一个辅助函数，它将获得一个给定文件或资源的webview URI。
 *
 * 备注 这个URI可以在webview的HTML中作为一个链接到
 * 给定的文件/资源。
 *
 * @param webview 对 扩展Webview 的引用
 * @param extensionUri 包含 扩展的目录的URI
 * @param pathList 一个字符串数组，代表文件/资源的路径。
 * @returns 指向文件/资源的URI
 */
function getUri(webview, extensionUri, pathList) {
    return webview.asWebviewUri(vscode_1.Uri.joinPath(extensionUri, ...pathList));
}
exports.getUri = getUri;
//# sourceMappingURL=getUri.js.map