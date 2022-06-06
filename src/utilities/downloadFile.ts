import * as fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
//  createFileAndFloder();
export default class FileAndFloderAction {
    public static baseURL = '';
    public static useName = '';
    public static usePwd = '';
    public static sapClient = '';
    public static systemIdentification = '';
    public static targetFolder = "C:\\";
    public constructor(baseURL: string, useName: string, usePwd: string, sapClient: string, systemIdentification: string) {

    }
    public static async createFileAndFloder(floderName: string, dataStr: any) {
        try {
            // delDir(`./${floderName}`)
            // 创建文件夹
            // let mkdirSync = fs.mkdirSync(`${FileAndFloderAction.targetFolder}${floderName}`);
            // 如果文件夹存在就删除
            this.createDeepFloder(floderName);
            let arrData = this.myXMLPares(dataStr);
            this.createFileAndFloder2(arrData,);
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


    public static createFileAndFloder2(arrData: any) {
        let reg = /%2f/g;
        if (Array.isArray(arrData) && arrData.length > 0) {
            arrData.forEach(element => {
                if (element.category === 'file') {
                    let filePath = FileAndFloderAction.targetFolder + "//" + element.src.replace(reg, '/').replace('/content', '');
                    console.log('filePath', filePath);
                    // 请求数据
                    console.log('请求数据', `${FileAndFloderAction.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects/${element.src.replace(`./`, '')}`);
                    axios({
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
                            this.createFileAndFloder2(arrTemp);
                            fs.mkdir(folderPath, function (err: any) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('文件夹创建成功');
                                }
                            });
                        }
                    }
                    );

                }
            });
        }

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
