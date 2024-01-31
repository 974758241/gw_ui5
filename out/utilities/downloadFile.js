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
const fs = require("fs");
const path = require("path");
const fast_xml_parser_1 = require("fast-xml-parser");
const axios_1 = require("axios");
//  createFileAndFloder();
class FileAndFloderAction {
    constructor(baseURL, useName, usePwd, sapClient, systemIdentification) {
    }
    // 删除文件夹下的所有文件和文件夹,但是不删除本身
    static deleteFolder(directory) {
        if (fs.existsSync(directory)) {
            fs.readdirSync(directory).forEach((file, index) => {
                const curPath = path.join(directory, file);
                if (fs.lstatSync(curPath).isDirectory()) { // 如果是目录则递归删除
                    this.deleteFolder(curPath);
                }
                else { // 删除文件
                    fs.unlinkSync(curPath);
                }
            });
            // 如果目录和targetFolder相同就跳过
            if (directory !== FileAndFloderAction.targetFolder) {
                fs.rmdirSync(directory); // 删除目录
            }
        }
    }
    ;
    static upDateFile(dataStr) {
        return __awaiter(this, void 0, void 0, function* () {
            let arrData = this.myXMLPares(dataStr);
            yield this.createFileAndFloderForUpdate(arrData).then(() => {
                // 发送命令,告诉前端,文件都已经下载完成
                // WebviewPanel.webview.postMessage({ command: 'ui5-download-object-complete' });
                // WebviewPanel.webview.postMessage({ command: 'ui5-download-object-complete' });
            });
        });
    }
    ;
    static createFileAndFloder(floderName, dataStr) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // delDir(`./${floderName}`)
                // 创建文件夹
                // let mkdirSync = fs.mkdirSync(`${FileAndFloderAction.targetFolder}${floderName}`);
                // 如果文件夹存在就删除
                this.createDeepFloder(floderName);
                let arrData = this.myXMLPares(dataStr);
                yield this.createFileAndFloder2(arrData).then(() => {
                    // 发送命令,告诉前端,文件都已经下载完成
                    // WebviewPanel.webview.postMessage({ command: 'ui5-download-object-complete' });
                    // WebviewPanel.webview.postMessage({ command: 'ui5-download-object-complete' });
                });
            }
            catch (error) {
                if (error.code === 'EEXIST') {
                    console.log('文件夹已存在');
                }
                else {
                    console.log(error);
                }
            }
        });
    }
    // 创建深度文件夹
    static createDeepFloder(floderName) {
        let targetFolder = FileAndFloderAction.targetFolder;
        let separator = /\\/g;
        let strings = floderName.split(separator);
        //判读是什么系统,如果是mac系统,就用/分割,如果是windows系统,就用\分割
        if (process.platform === 'darwin') { //mac系统
            separator = /\//g;
            strings = floderName.split(separator);
        }
        else if (process.platform === 'win32') { //windows系统
            separator = /\\/g;
            strings = floderName.split(separator);
        }
        else {
            console.log('未知系统');
        }
        strings.forEach((element, index) => {
            if (element === "") {
                return;
            }
            else {
                targetFolder = targetFolder + `\\${element}`;
                fs.mkdirSync(targetFolder);
            }
        });
    }
    static delDir(path) {
        let files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach((file, index) => {
                let curPath = path + "/" + file;
                //判断是否是文件夹
                if (fs.statSync(curPath).isDirectory()) {
                    this.delDir(curPath); //递归删除文件夹
                }
                else {
                    //是文件的话说明是最后一层不需要递归
                    fs.unlinkSync(curPath); //删除文件
                }
            });
            fs.rmdirSync(path);
        }
    }
    static createFileAndFloderForUpdate(arrData) {
        let reg = /%2f/g;
        let promises = [];
        if (Array.isArray(arrData) && arrData.length > 0) {
            promises = arrData.map(element => {
                if (element.category === 'file') {
                    let filePath = FileAndFloderAction.targetFolder + "//" + element.src.replace(reg, '/').replace('/content', '');
                    console.log('filePath', filePath);
                    // 'd:\\learningNew\\zhonghaiyou\\ZSFI_027\\webapp//./ZSFI_027/.project.json'
                    // 去掉 ./ZSFI_027/
                    filePath = filePath.replace(`./${FileAndFloderAction.appName}/`, '');
                    // 请求数据
                    console.log('请求数据', `${FileAndFloderAction.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects/${element.src.replace(`./`, '')}`);
                    return (0, axios_1.default)({
                        method: 'get',
                        url: `${FileAndFloderAction.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects/${element.src.replace(`./`, '')}`,
                        auth: {
                            username: FileAndFloderAction.useName,
                            password: FileAndFloderAction.usePwd
                        }
                    }).then((res) => {
                        // 若是manifest.json文件和resources.json
                        if (element.src.indexOf('manifest.json') > -1 || element.src.indexOf('resources.json') > -1) {
                            // 对象转字符串
                            res.data = JSON.stringify(res.data);
                        }
                        fs.writeFile(filePath, res.data, function (err) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log('文件写入成功');
                            }
                        });
                    });
                }
                else if (element.category === 'folder') {
                    let folderName = element.src.replace(reg, '/').replace('/content', '');
                    folderName = folderName.replace(`./${FileAndFloderAction.appName}/`, '');
                    let folderPath = FileAndFloderAction.targetFolder + "//" + folderName;
                    // 请求数据
                    (0, axios_1.default)({
                        method: 'get',
                        url: `${FileAndFloderAction.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects/${element.src.replace(`./`, '')}`,
                        auth: {
                            username: FileAndFloderAction.useName,
                            password: FileAndFloderAction.usePwd
                        }
                    }).then((res) => {
                        let arrTemp = this.myXMLPares(res.data);
                        // 判断是不是数组类型
                        if (Array.isArray(arrTemp) && arrTemp.length > 0) {
                            fs.mkdir(folderPath, function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    console.log('文件夹创建成功');
                                }
                            });
                            return this.createFileAndFloderForUpdate(arrTemp);
                        }
                    });
                }
            });
        }
        return Promise.all(promises);
    }
    ;
    static createFileAndFloder2(arrData) {
        let reg = /%2f/g;
        let promises = [];
        if (Array.isArray(arrData) && arrData.length > 0) {
            promises = arrData.map(element => {
                if (element.category === 'file') {
                    let filePath = FileAndFloderAction.targetFolder + "//" + element.src.replace(reg, '/').replace('/content', '');
                    console.log('filePath', filePath);
                    // 请求数据
                    console.log('请求数据', `${FileAndFloderAction.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects/${element.src.replace(`./`, '')}`);
                    return (0, axios_1.default)({
                        method: 'get',
                        url: `${FileAndFloderAction.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects/${element.src.replace(`./`, '')}`,
                        auth: {
                            username: FileAndFloderAction.useName,
                            password: FileAndFloderAction.usePwd
                        }
                    }).then((res) => {
                        // 若是manifest.json文件和resources.json
                        if (element.src.indexOf('manifest.json') > -1 || element.src.indexOf('resources.json') > -1) {
                            // 对象转字符串
                            res.data = JSON.stringify(res.data);
                        }
                        fs.writeFile(filePath, res.data, function (err) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log('文件写入成功');
                            }
                        });
                    });
                }
                else if (element.category === 'folder') {
                    let folderName = element.src.replace(reg, '/').replace('/content', '');
                    let folderPath = FileAndFloderAction.targetFolder + "//" + folderName;
                    // 请求数据
                    (0, axios_1.default)({
                        method: 'get',
                        url: `${FileAndFloderAction.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects/${element.src.replace(`./`, '')}`,
                        auth: {
                            username: FileAndFloderAction.useName,
                            password: FileAndFloderAction.usePwd
                        }
                    }).then((res) => {
                        let arrTemp = this.myXMLPares(res.data);
                        // 判断是不是数组类型
                        if (Array.isArray(arrTemp) && arrTemp.length > 0) {
                            fs.mkdir(folderPath, function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    console.log('文件夹创建成功');
                                }
                            });
                            return this.createFileAndFloder2(arrTemp);
                        }
                    });
                }
            });
        }
        return Promise.all(promises);
    }
    static myXMLPares(value) {
        const options = {
            ignoreAttributes: false,
            attributeNamePrefix: '',
            allowBooleanAttributes: true // 默认为false 允许布尔属性
        };
        const parser = new fast_xml_parser_1.XMLParser(options);
        let jsonObj = parser.parse(value);
        let jsonObjElementElement = jsonObj['atom:feed']['atom:entry'];
        // console.log('jsonObjElementElement', jsonObjElementElement)
        let simpleArr = [];
        if (Array.isArray(jsonObjElementElement)) {
            jsonObjElementElement.forEach(element => {
                let simpleObj = {};
                simpleObj.category = element['atom:category'].term;
                simpleObj.src = element['atom:content'].src;
                simpleArr.push(simpleObj);
            });
        }
        else if (typeof jsonObjElementElement === 'object' && jsonObjElementElement['atom:category']) {
            // 单个文件
            let simpleObj = {};
            simpleObj.category = jsonObjElementElement['atom:category'].term;
            simpleObj.src = jsonObjElementElement['atom:content'].src;
            simpleArr.push(simpleObj);
        }
        return simpleArr;
    }
}
exports.default = FileAndFloderAction;
FileAndFloderAction.baseURL = '';
FileAndFloderAction.useName = '';
FileAndFloderAction.usePwd = '';
FileAndFloderAction.sapClient = '';
FileAndFloderAction.systemIdentification = '';
FileAndFloderAction.appName = '';
FileAndFloderAction.targetFolder = "C:\\";
//# sourceMappingURL=downloadFile.js.map