import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { WebviewPanel } from  "vscode";
import axios from 'axios';
//  createFileAndFloder();
export default class FileAndFloderAction {
    public static baseURL = '';
    public static useName = '';
    public static usePwd = '';
    public static sapClient = '';
    public static systemIdentification = '';
    public static appName = '';
    public static targetFolder = "C:\\";
    public constructor(baseURL: string, useName: string, usePwd: string, sapClient: string, systemIdentification: string) {

    }
    // 删除文件夹下的所有文件和文件夹,但是不删除本身
    public static deleteFolder(directory: any) {
        if (fs.existsSync(directory)) {
            fs.readdirSync(directory).forEach((file, index) => {
              const curPath = path.join(directory, file);
              if (fs.lstatSync(curPath).isDirectory()) { // 如果是目录则递归删除
                this.deleteFolder(curPath);
              } else { // 删除文件
                fs.unlinkSync(curPath);
              }
            });
            // 如果目录和targetFolder相同就跳过
            if(directory!==FileAndFloderAction.targetFolder){
                fs.rmdirSync(directory); // 删除目录
            }
           
          }

    };
    public static async  upDateFile(dataStr: any){
        let arrData = this.myXMLPares(dataStr);
        await this.createFileAndFloderForUpdate(arrData).then(() => {
            // 发送命令,告诉前端,文件都已经下载完成
            // WebviewPanel.webview.postMessage({ command: 'ui5-download-object-complete' });
            // WebviewPanel.webview.postMessage({ command: 'ui5-download-object-complete' });
        });
    };
    public static async createFileAndFloder(floderName: string, dataStr: any) {
        try {
            // delDir(`./${floderName}`)
            // 创建文件夹
            // let mkdirSync = fs.mkdirSync(`${FileAndFloderAction.targetFolder}${floderName}`);
            // 如果文件夹存在就删除
            this.createDeepFloder(floderName);
            let arrData = this.myXMLPares(dataStr);
           await this.createFileAndFloder2(arrData).then(() => {
                // 发送命令,告诉前端,文件都已经下载完成
                // WebviewPanel.webview.postMessage({ command: 'ui5-download-object-complete' });
                // WebviewPanel.webview.postMessage({ command: 'ui5-download-object-complete' });
            });
        } catch (error: any) {
            if (error.code === 'EEXIST') {
                console.log('文件夹已存在');
            } else {
                console.log(error);
            }
        }

    }
    // 创建深度文件夹
    public static createDeepFloder(floderName: string) {
        let targetFolder = FileAndFloderAction.targetFolder;
        let separator = /\\/g;
        let strings = floderName.split(separator);
        //判读是什么系统,如果是mac系统,就用/分割,如果是windows系统,就用\分割
        if (process.platform === 'darwin') {//mac系统
            separator = /\//g;
            strings = floderName.split(separator);
        }else if(process.platform === 'win32'){//windows系统
            separator = /\\/g;
            strings = floderName.split(separator);
        }else{
            console.log('未知系统');
        }
       
        strings.forEach((element: any, index: any) => {
            if(element===""){
                return;
            }else{
                targetFolder = targetFolder + `\\${element}`;
                fs.mkdirSync(targetFolder);
            }
        }
        );

    }

    public static delDir(path: any) {
        let files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach((file: any, index: any) => {
                let curPath = path + "/" + file;
                //判断是否是文件夹
                if (fs.statSync(curPath).isDirectory()) {
                    this.delDir(curPath); //递归删除文件夹
                } else {
                    //是文件的话说明是最后一层不需要递归
                    fs.unlinkSync(curPath); //删除文件
                }
            });
            fs.rmdirSync(path);
        }
    }
    public static createFileAndFloderForUpdate(arrData: any) {
        let reg = /%2f/g;
        let promises:any = [];
        if (Array.isArray(arrData) && arrData.length > 0) {
             promises =   arrData.map(element => {
                if (element.category === 'file') {
                    let filePath = FileAndFloderAction.targetFolder + "//" + element.src.replace(reg, '/').replace('/content', '');
                    console.log('filePath', filePath);
                    // 'd:\\learningNew\\zhonghaiyou\\ZSFI_027\\webapp//./ZSFI_027/.project.json'
                    // 去掉 ./ZSFI_027/
                    filePath = filePath.replace(`./${FileAndFloderAction.appName}/`, '');
                    // 请求数据
                    console.log('请求数据', `${FileAndFloderAction.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects/${element.src.replace(`./`, '')}`);
                    return    axios({
                        method: 'get',
                        url: `${FileAndFloderAction.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects/${element.src.replace(`./`, '')}`,
                        auth: {
                            username: FileAndFloderAction.useName,
                            password: FileAndFloderAction.usePwd
                        }


                    }).then((res: any) => {
                         // 若是manifest.json文件和resources.json
                         if (element.src.indexOf('manifest.json') > -1 || element.src.indexOf('resources.json') > -1) {
                            // 对象转字符串
                            res.data = JSON.stringify(res.data);
                         }
                         fs.writeFile(filePath, res.data, function (err: any) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('文件写入成功');
                            }
                        });
                    });

                } else if (element.category === 'folder') {
                    let folderName = element.src.replace(reg, '/').replace('/content', '');
                    folderName = folderName.replace(`./${FileAndFloderAction.appName}/`, '');
                    let folderPath = FileAndFloderAction.targetFolder + "//" + folderName;
                    // 请求数据
                    axios({
                        method: 'get',
                        url: `${FileAndFloderAction.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects/${element.src.replace(`./`, '')}`,
                        auth: {
                            username: FileAndFloderAction.useName,
                            password: FileAndFloderAction.usePwd
                        }
                    }).then((res: any) => {
                        let arrTemp = this.myXMLPares(res.data);
                        // 判断是不是数组类型
                        if (Array.isArray(arrTemp) && arrTemp.length > 0) {
                       
                            fs.mkdir(folderPath, function (err: any) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('文件夹创建成功');
                                }
                            });
                          return  this.createFileAndFloderForUpdate(arrTemp);
                        }
                    }
                    );

                }
            });
           
        }
        return Promise.all(promises);

    };

    public static createFileAndFloder2(arrData: any) {
        let reg = /%2f/g;
        let promises:any = [];
        if (Array.isArray(arrData) && arrData.length > 0) {
             promises =   arrData.map(element => {
                if (element.category === 'file') {
                    let filePath = FileAndFloderAction.targetFolder + "//" + element.src.replace(reg, '/').replace('/content', '');
                    console.log('filePath', filePath);
                    // 请求数据
                    console.log('请求数据', `${FileAndFloderAction.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects/${element.src.replace(`./`, '')}`);
                    return    axios({
                        method: 'get',
                        url: `${FileAndFloderAction.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects/${element.src.replace(`./`, '')}`,
                        auth: {
                            username: FileAndFloderAction.useName,
                            password: FileAndFloderAction.usePwd
                        }


                    }).then((res: any) => {
                         // 若是manifest.json文件和resources.json
                         if (element.src.indexOf('manifest.json') > -1 || element.src.indexOf('resources.json') > -1) {
                            // 对象转字符串
                            res.data = JSON.stringify(res.data);
                         }
                         fs.writeFile(filePath, res.data, function (err: any) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('文件写入成功');
                            }
                        });
                    });

                } else if (element.category === 'folder') {
                    let folderName = element.src.replace(reg, '/').replace('/content', '');
                    let folderPath = FileAndFloderAction.targetFolder + "//" + folderName;
                    // 请求数据
                    axios({
                        method: 'get',
                        url: `${FileAndFloderAction.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects/${element.src.replace(`./`, '')}`,
                        auth: {
                            username: FileAndFloderAction.useName,
                            password: FileAndFloderAction.usePwd
                        }
                    }).then((res: any) => {
                        let arrTemp = this.myXMLPares(res.data);
                        // 判断是不是数组类型
                        if (Array.isArray(arrTemp) && arrTemp.length > 0) {
                       
                            fs.mkdir(folderPath, function (err: any) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('文件夹创建成功');
                                }
                            });
                          return  this.createFileAndFloder2(arrTemp);
                        }
                    }
                    );

                }
            });
           
        }
        return Promise.all(promises);

    }

    public static myXMLPares(value: any) {// 将xml转换成json(我需要的)
        const options = {
            ignoreAttributes: false, // 默认为false 不忽略属性
            attributeNamePrefix: '', // 属性前缀
            allowBooleanAttributes: true // 默认为false 允许布尔属性
        };
        const parser = new XMLParser(options);
        let jsonObj = parser.parse(value);
        let jsonObjElementElement = jsonObj['atom:feed']['atom:entry'];
        // console.log('jsonObjElementElement', jsonObjElementElement)
        let simpleArr = [];
        if (Array.isArray(jsonObjElementElement)) {
            jsonObjElementElement.forEach(element => {
                let simpleObj: any = {};
                simpleObj.category = element['atom:category'].term;
                simpleObj.src = element['atom:content'].src;
                simpleArr.push(simpleObj);
            }
            );
        } else if (typeof jsonObjElementElement === 'object' && jsonObjElementElement['atom:category']) {
            // 单个文件
            let simpleObj: any = {};
            simpleObj.category = jsonObjElementElement['atom:category'].term;
            simpleObj.src = jsonObjElementElement['atom:content'].src;
            simpleArr.push(simpleObj);
        }

        return simpleArr;

    }


}
