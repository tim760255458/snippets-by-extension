// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";

type RuleItem = [string, string];
type Configuration = {
  maxInputLength: number;
  configJsonUrl: string | null;
};

// 当前活动文件的扩展名
let currentFileExtension: string | null = "";
// 存储用户输入
let inputTextArr: String[] = [];
// 存储的最大值
let maxInputLength: number = 6;
// 是否在修改文档
let isProcessingDocumentChange: boolean = false;
// 配置文件在本地的地址
let localProfileAddress: string = "";
/**
 * 匹配规则
 * ! 注意将字符串当正则使用时的语法问题
 */
let rules: { [key: string]: RuleItem[] } = {
  // "tmp-cp": [
  //   ["\\s+computed:\\s*{", "value2(){return 2},"],
  //   ["\\s+watch:\\s*{", "text: 2,"],
  // ],
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  initializeExtension();

  // 注册事件监听器，当文档被打开时触发
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(onDocumentOpened)
  );

  // 注册文档更改事件监听器
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(onDocumentChanged)
  );

  // 注册活动文档编辑器更改事件监听器
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(onActiveTextEditorChanged)
  );
}

// 文档被打开时回调
function onDocumentOpened(document: vscode.TextDocument) {
  // 在文档打开时执行初始化操作
  console.log(`Document opened: ${document.fileName}`);

  // 在这里执行你的初始化代码
  // initializeExtension();
}

// 文档内容改变时的回调
function onDocumentChanged(event: vscode.TextDocumentChangeEvent) {
  if (isProcessingDocumentChange) {
    return;
  }

  // 只处理vue文件
  if (currentFileExtension !== "vue") {
    return;
  }

  // 获取用户最后一次的输入
  const userInput = event.contentChanges[event.contentChanges.length - 1];

  // 存储最近 maxInputLength 次的用户输入
  if (inputTextArr.length >= maxInputLength) {
    inputTextArr.shift();
  }
  inputTextArr.push(userInput.text);

  // 根据规则处理文件
  const inputText = inputTextArr.join("");
  if (Object.keys(rules).includes(inputText)) {
    isProcessingDocumentChange = true;

    // 文件的最新内容
    const currentFileText = event.document.getText();

    // 去除输入的标志
    const removedText =
      currentFileText.slice(0, userInput.rangeOffset - inputText.length + 1) +
      currentFileText.slice(userInput.rangeOffset + 1);

    // 根据规则处理文件
    dealFile(removedText, inputText);
  }
}

// 文档编辑器改变时的回调
function onActiveTextEditorChanged(event: vscode.TextEditor | undefined) {
  if (event) {
    // 获取当前文件的扩展名
    getCurrentFileExtension();
  }
}

// 初始化插件
async function initializeExtension() {
  // 在这里执行插件启动时的初始化代码
  console.log("Extension initialized!");

  // 加载用户配置
  loadConfig();

  // 获取当前文件的扩展名
  getCurrentFileExtension();
}

// 加载用户配置
async function loadConfig() {
  const settings = vscode.workspace.getConfiguration(
    "template"
  ) as unknown as Configuration;
  maxInputLength = settings.maxInputLength || 6;
  if (settings.configJsonUrl) {
    localProfileAddress = settings.configJsonUrl;
    try {
      const document = await vscode.workspace.openTextDocument(
        localProfileAddress
      );
      rules = JSON.parse(document.getText());
    } catch (error) {
      vscode.window.showErrorMessage(
        "读取规则文件出错：规则文件地址错误或者规则文件不是合规的 json 文件"
      );
    }
  } else {
    vscode.window.showWarningMessage("未配置规则文件的本地地址");
  }
}

// 获取当前活动文件的扩展名
function getCurrentFileExtension() {
  // 获取当前活动的文本编辑器
  const editor = vscode.window.activeTextEditor;

  // 检查是否有活动的编辑器
  if (editor) {
    // 获取当前文档对象
    const document = editor.document;

    // 获取文件路径
    const filePath = document.fileName;

    // 使用 path 模块获取文件扩展名
    const fileExtension = path.extname(filePath);

    currentFileExtension = fileExtension.slice(1);
  } else {
    currentFileExtension = null;
  }
}

// 获取当前活动文件的内容
function getActiveTextEditorContent(): Promise<string> {
  return new Promise((resolve, reject) => {
    // 获取当前活动的编辑器
    const editor = vscode.window.activeTextEditor;

    // 检查是否有活动的编辑器
    if (editor) {
      // 获取文档的 URI
      const uri = editor.document.uri;

      // 通过 URI 读取文档的内容
      vscode.workspace.fs.readFile(uri).then((content) => {
        // 将内容转换为字符串
        const contentString = new TextDecoder().decode(content);

        resolve(contentString);
      });
    } else {
      // 如果没有活动的编辑器，则显示错误消息
      // vscode.window.showErrorMessage("No active text editor.");
      reject("No active text editor.");
    }
  });
}

// 根据用户输入，处理文档
async function dealFile(currentFileText: string, inputText: string) {
  try {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const ruleArr = rules[inputText];
      let newText = currentFileText;
      ruleArr.forEach((rule) => {
        newText = insertTextInComputed(newText, rule);
      });

      await editor
        .edit((editBuilder) => {
          const textRange = new vscode.Range(
            0,
            0,
            editor.document.lineCount,
            editor.document.getText().length
          );
          editBuilder.replace(textRange, newText);
        })
        .then(
          () => {
            console.log("edit success.");
          },
          (error) => new Error("Error modifying file: " + error.message)
        );
    } else {
      new Error("No active text editor.");
    }
  } catch (error) {
    console.log(error);
    vscode.window.showErrorMessage("some thing is wrong.");
  } finally {
    isProcessingDocumentChange = false;
  }
}

// 根据规则处理文档
function insertTextInComputed(originalText: string, rule: RuleItem) {
  const regex = new RegExp(rule[0]);
  const match = originalText.match(regex);

  if (match && match.index !== undefined) {
    const insertIndex = match.index + match[0].length;
    return (
      originalText.slice(0, insertIndex) +
      rule[1] +
      originalText.slice(insertIndex)
    );
  }

  // 如果没有匹配到模式，则直接返回原始文本
  return originalText;
}

// This method is called when your extension is deactivated
export function deactivate() {}
