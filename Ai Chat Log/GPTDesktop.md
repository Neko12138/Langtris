# 适配不同屏幕尺寸

> 修改HTML文件，使得画布内容能根据浏览器不同自动放大或缩小。使其适用大屏幕显示器或者笔记本。

<details><summary>7 previous messages</summary>

> 我先看一下项目里的 HTML 和相关脚本结构，确认画布是怎么创建和定尺寸的，再做一个贴合现有代码的响应式调整。
>
> 项目很小，主要就是 `index.html`、`styles.css` 和 `src/main.js`。我现在读画布初始化部分，重点找 Phaser 的 scale 配置和页面容器样式。
>
> 画布本身是按固定逻辑尺寸 `400x900` 和 `220x900` 画的。为了不影响游戏坐标和碰撞逻辑，我会保持内部尺寸不变，只把包含两个 canvas 的外层按浏览器视口统一缩放，这样大屏会放大、笔记本会缩小。
>
> <details><summary>Edited a file</summary>
>
> - Wrote `./index.html` (+27 -4)
>
> </details>
>
> HTML 里已经加了一个视口适配脚本；接下来我补上 CSS 的缩放容器尺寸和页面溢出处理，让缩放后的画布在不同屏幕上居中且不撑出滚动条。
>
> <details><summary>Edited a file</summary>
>
> - Wrote `./styles.css` (+25 -19)
>
> </details>
>
> 改动已经落地。我再快速看一下 diff，确认只动了响应式缩放相关内容，没有碰游戏逻辑。
</details>

已完成响应式缩放：

- 在 [index.html](./index.html:18) 增加了根据浏览器窗口计算缩放比例的脚本。
- 在 [styles.css](./styles.css:16) 给 `#game-wrapper` 设置固定逻辑尺寸，并用 `transform: scale(...)` 统一缩放主画布和辅助画布。
- 页面会自动适配大屏显示器和笔记本窗口大小，窗口变化时也会重新缩放。

没有改动游戏逻辑，只调整显示层。可以直接打开 `index.html` 试效果。

> 增加导出功能，允许用户下载右方累计起来的文本

<details><summary>10 previous messages</summary>

> 我会在现有右侧辅助面板旁加一个下载入口，并把当前累计的文本按行导出成 `.txt`。先确认一下当前文件状态，再改 HTML/CSS/JS。
>
> 当前未提交改动就是上一轮的缩放修改。我会在这个基础上继续，只加导出按钮和下载逻辑，不碰方块玩法。
>
> 我准备把下载按钮作为 HTML 控件叠在右侧面板顶部，这样不用重做 Phaser 画布尺寸；同时把右侧文本顶部留出空间，避免按钮盖住内容。
>
> <details><summary>Edited a file</summary>
>
> - Wrote `./index.html` (+9 -4)
>
> </details>
>
> 按钮结构已经加好。接下来补样式，让按钮随整个游戏一起缩放，并在没有可导出文本时呈禁用状态。
>
> <details><summary>Edited a file</summary>
>
> - Wrote `./styles.css` (+33 -4)
>
> </details>
>
> 现在改 JS：累计文本变化时更新按钮状态，点击时生成文本文件并触发浏览器下载。
>
> <details><summary>Edited a file</summary>
>
> - Wrote `./src/main.js` (+124 -29)
>
> </details>
>
> 导出逻辑已经接上了。我再检查一遍 diff 和关键位置，确认按钮状态、文件名、右侧滚动计算都一致。
>
> 代码检查结果看起来干净。最后我跑一个 JS 语法检查，避免手工补函数时留下拼写或括号问题。
</details>

已增加导出功能。

现在右侧累计文本面板顶部会有 `Export Text` 按钮：

- 没有累计文本时按钮禁用。
- 有消除行产生文本后按钮自动启用。
- 点击后下载 `.txt` 文件，内容为右侧累计文本，每条一行。
- 文件名类似 `langtris-text-20260810-153012.txt`。

改动在 [index.html](./index.html:13)、[styles.css](./styles.css:24)、[src/main.js](./src/main.js:1655)。

已通过 `node --check src\main.js` 语法检查。

> 为字母增加一个黑色描边，下划线不用

<details><summary>5 previous messages</summary>

> 我会把方块里的字符渲染样式改成：普通字母加黑色描边，`_` 保持原样。顺手也让预览区保持同样规则，这样视觉一致。
>
> 我找到两处字符样式：主棋盘大字母和顶部 Next 预览小字母。现在补一个共用样式函数，按字符判断是否加描边。
>
> 准备编辑 `src/main.js`：主棋盘 `22px` 字符用较厚黑描边，预览 `10px` 字符用较细黑描边，`_` 不加描边。
>
> <details><summary>Edited a file</summary>
>
> - Wrote `./src/main.js` (+47 -27)
>
> </details>
>
> 改好了。我跑一下 JS 语法检查，确保新增样式函数没有影响加载。
</details>

已完成：方块里的字母现在有黑色描边，`_` 不加描边。

具体改在 [src/main.js](./src/main.js:1235)，新增了 `createLetterTextStyle()`，主棋盘和 Next 预览都使用同一规则。

已通过 `node --check src\main.js` 语法检查。

> 黑色描边厚度减至三分之一

<details><summary>3 previous messages</summary>

> 我会把现有描边厚度直接降到三分之一：主棋盘从 `4` 改成约 `1.33`，预览从 `2` 改成约 `0.67`。
>
> <details><summary>Edited a file</summary>
>
> - Wrote `./src/main.js` (+2 -2)
>
> </details>
>
> 厚度已调低。我再做一次语法检查，确认表达式作为描边厚度可以正常解析。
</details>

已把黑色描边厚度减到三分之一：

- 主棋盘字母：`4` → `4 / 3`
- Next 预览字母：`2` → `2 / 3`
- `_` 仍然不加描边

已通过 `node --check src\main.js`。
