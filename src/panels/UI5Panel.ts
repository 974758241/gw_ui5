import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode"; //  Disposable-- 用于管理资源的接口
import { getUri } from "../utilities/getUri";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
// import   downloadFile
import FileAndFloderAction from "../utilities/downloadFile";
import * as fs from 'fs';

/**
 * 该类管理HelloWorld webview 面板 的状态和行为。
 *
 * 它包含了所有的数据和方法。
 *
 * - 创建和渲染HelloWorld webview 面板
 * - 在 面板 关闭时正确地清理和处理webview资源
 * - 设置webview面板的HTML（以及代理CSS/JavaScript）内容
 * - 设置消息监听器，以便数据可以在webview和扩展之间传递
 */
export class UI5Panel {

  public static currentPanel: UI5Panel | any;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];
  // public static baseURL = "http://10.10.159.68:8000";
  // public static useName = "202101041054";
  // public static usePwd = "Qwe974758241";
  // public static systemIdentification = "SFD";
  // public static sapClient = "110";
  public static baseURL = "";
  public static useName = "";
  public static usePwd = "";
  public static systemIdentification = "";
  public static sapClient = "";
  public static targetFolder="C:\\"; // 默认放置在C盘

  /**
   * HelloWorldPanel类的私有构造函数（只从渲染方法中调用）。
   *
   * @param panel 对webview面板的引用
   * @param extensionUri 包含扩展的目录的URI
   */
  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(this.dispose, null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);
  }
  // 测试能否连接到SAP系统
  public static testConnection(){
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: `${UI5Panel.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects`,
        auth: {
          username: UI5Panel.useName,
          password: UI5Panel.usePwd
        },
      }).then((res: any) => {
        resolve(true);
      }).catch((err: any) => {
        reject(false);
      });
    });

  };
  public static updateProject(obj:any){
    // 首先删除 obj.updateFolder这个目录下的所有文件
FileAndFloderAction.baseURL = obj.baseURL;
FileAndFloderAction.useName = obj.useName;
FileAndFloderAction.usePwd = obj.usePwd;
FileAndFloderAction.systemIdentification = obj.systemIdentification;
FileAndFloderAction.sapClient = obj.sapClient;
FileAndFloderAction.targetFolder = obj.updateFolder;

FileAndFloderAction.deleteFolder(obj.updateFolder);
 
    // 然后再下载
    // uri地址 转义
    // 获取obj.updateFolder上一次目录作为根目录,也就是项目的名称
    // C:\\Users\\ZMM_PRO\\webapp 得到 ZMM_PRO
    // 判读系统进行分割
    let arrT ="";
    let reg = /\//g;
    if (process.platform === 'darwin') {//mac系统
      arrT = obj.updateFolder.split("/");
    } else if (process.platform === 'win32') {//windows系统
      arrT = obj.updateFolder.split("\\");
     
    }
    //创建webpp 或者用户指定的目录
    let webpp = arrT[arrT.length - 1];
    let targetFolder = obj.updateFolder + "\\" + webpp;
    // fs.mkdirSync(targetFolder);

    let objName =arrT[arrT.length-2] ;
    // 如果obj.appName存在,则使用obj.appName作为项目名称
    if (obj.appName) {
      objName = obj.appName;
    }
    FileAndFloderAction.appName = obj.appName;
      axios({
        method: 'get',
        url: `${UI5Panel.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects/${objName}/content`,
        auth: {
          username: UI5Panel.useName,
          password: UI5Panel.usePwd
        },
      }).then((res: any) => {
        console.log("res", res);
        FileAndFloderAction.upDateFile(res.data);
        window.showInformationMessage("工程更新成功");
        
      });
  };
  /**
   * 渲染当前的webview面板，如果它存在的话，否则将创建一个新的webview面板。
   * @param extensionUri 包含扩展的目录的URI。
   */
public static render(extensionUri: Uri) {
console.log("baseURL",UI5Panel.baseURL);
console.log("useName",UI5Panel.useName);
console.log("usePwd",UI5Panel.usePwd);
console.log("systemIdentification",UI5Panel.systemIdentification);
console.log("sapClient",UI5Panel.sapClient);

FileAndFloderAction.baseURL = UI5Panel.baseURL;
FileAndFloderAction.useName = UI5Panel.useName;
FileAndFloderAction.usePwd = UI5Panel.usePwd;
FileAndFloderAction.systemIdentification = UI5Panel.systemIdentification;
FileAndFloderAction.sapClient = UI5Panel.sapClient;
FileAndFloderAction.targetFolder = UI5Panel.targetFolder;




    if (UI5Panel.currentPanel) {
      // If the webview panel already exists reveal it
      UI5Panel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        "UI5-abap-list",
        // Panel title
        "UI5 列表页面",
        // The editor column the panel should be displayed in
        ViewColumn.One,
        // 额外的panel配置  
        {
          // 在webview中启用JavaScript
          enableScripts: true,
        }
      );

      UI5Panel.currentPanel = new UI5Panel(panel, extensionUri);
    }
    axios({
      method: 'get',
      url: `${UI5Panel.baseURL}/sap/bc/adt/filestore/ui5-bsp/ui5-rt-version`,
      auth: {
        username: UI5Panel.useName,
        password: UI5Panel.usePwd
      },


    }).then((res: any) => {
      UI5Panel.currentPanel._panel.webview.postMessage({ command: "ui5-rt-version", data: res.data }); // 发送消息
    }).catch((err: any) => {
      window.showErrorMessage("SAP系统连接失败");
      window.showErrorMessage(err);
    });

    axios({
      method: 'get',
      url: `${UI5Panel.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects`,
      auth: {
        username: UI5Panel.useName,
        password: UI5Panel.usePwd
      },
    }).then((res: any) => {
      // parser xml to json
      const parser = new XMLParser();
      let jObj = parser.parse(res.data);
      let simpleJson: any = [];
      jObj["atom:feed"]["atom:entry"].forEach((item: any) => {
        let obj: any = {};
        obj["title"] = item["atom:title"];
        obj["id"] = item["atom:id"];
        obj["summary"] = item["atom:summary"];
        simpleJson.push(obj);
      });
      UI5Panel.currentPanel._panel.webview.postMessage({ command: "ui5-objects", data: simpleJson });
    });
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    UI5Panel.currentPanel = undefined;

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the Vue webview build files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    // The CSS file from the Vue build output
    const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.css"]);
    // The JS file from the Vue build output
    const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.js"]);

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en" class="dark">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Hello World</title>
        </head>
        <body>
          <div id="app"></div>
          <script type="module" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   * @param context A reference to the extension context
   */
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        const text = message.text;

        switch (command) {
          case "hello":
            window.showInformationMessage(text);
            return;
          case "ui5-download-object":
            // 执行下载服务
            this.downloadFileByUri(text);
            return;


        }
      },
      undefined,
      this._disposables
    );
  }
  private downloadFileByUri(uri: string) {
    // uri地址 转义
    let reg = /\//g;
    axios({
      method: 'get',
      url: `${UI5Panel.baseURL}/sap/bc/adt/filestore/ui5-bsp/objects/${uri.replace(reg,"%2f")}/content`,
      auth: {
        username: UI5Panel.useName,
        password: UI5Panel.usePwd
      },
    }).then((res: any) => {
      console.log("res", res);
      console.log("uri", uri);
      debugger;
      FileAndFloderAction.createFileAndFloder(uri.replace(/\//g,"\\"), res.data);
      UI5Panel.currentPanel._panel.webview.postMessage({ command: "ui5-download-object-complete", data: "工程下载成功" });
    });
  }
  private myParseXml(xml: string) {
    const parser = new XMLParser();
    let jObj = parser.parse(xml);
    return jObj;
  }
}
