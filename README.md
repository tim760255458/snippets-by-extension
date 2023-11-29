# snippets by extension

A single instruction inserts code snippets in multiple places, based on file extension matching

## Features

When you enter a directive, you can insert the template in multiple places in the file according to the configured rules

![test](/images/test.gif)

<!-- ## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them. -->

## Extension Settings

This extension contributes the following settings:

* `snippets-by-extension.maxInputLength`: The maximum length of the instruction (default 6).
* `snippets-by-extension.configJsonUrl`: Required, folder address of the configuration file.

## Configuration description

> Note: Formatting issues when regular expressions are written as strings
>
> Note: When adding rules to different file extensions, you need to create a JOSN file and name it with the file extension

```json
// The plugin matches the rules based on the name of the profile
// Like the vue.json file below, the plugin will use the rules when editing the .vue file

// vue.json
{
  "tmp-cp": {
    "default": [
      "<div id=\"test\"></div>"
    ],
    "rules": [
      ["\\s+computed:\\s*{", [
        "value2() {",
        "  return 2;",
        "},"
      ]],
      ["\\s+watch:\\s*{", [
        "text: 2"
      ]]
    ]
  }
}
```

<!-- ## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

--- -->

<!-- ## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/) -->

**Enjoy!**
