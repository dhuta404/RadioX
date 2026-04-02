# RadioFlow Desktop

RadioFlow Desktop 是一个面向非技术用户的本地桌面电台自动播出软件。它运行在 Windows 10 / 11 上，界面接近现代广播排期平台，重点覆盖：

- 本地音频导入
- 日历式节目排期
- 自动按时间播出
- 节目块规则选歌
- 补位播放
- 双播放器交叉淡化
- 系统托盘常驻
- 离线本机持久化

## 项目特点

- 完全离线，不依赖远程服务器
- 不需要 MySQL、PostgreSQL、Redis、Docker
- 基于 Electron + React + TypeScript，适合 Windows 打包
- 所有数据保存到本机 `userData/radioflow-data.json`
- 启动后自带示例节目块，方便立刻上手

## 已实现功能

### 1. Dashboard

- 显示当前时间
- 显示当前节目块
- 显示当前音频和剩余时间
- 显示下一节目和下一音频
- 一键开始、暂停、停止自动播出
- 显示最近日志

### 2. Schedule

- Day / Week 视图
- 彩色节目块展示
- 新建节目块
- 双击编辑节目块
- 拖动节目块修改时间
- 拉伸节目块修改结束时间
- 复制节目块到明天
- 删除节目块
- 手动强切到指定节目块

### 3. Library

- 导入本地文件
- 导入整个文件夹
- 支持 `mp3 / wav / m4a / aac / flac`
- 自动尝试读取 metadata
- 搜索标题
- 分类筛选
- 编辑标题 / 分类 / 标签
- 启用或禁用单首音频
- 预听与停止预听
- 删除音频条目
- 统计总时长

### 4. Rules

- 默认补位分类
- Fallback 音频池
- 默认音量
- 交叉淡化秒数
- 节目切换淡化秒数
- 空白保护开关
- 损坏文件自动跳过开关

### 5. Automation Engine

- 自动识别当前时间命中的节目块
- 根据节目块规则选歌
- 当节目块音频不足时自动补位
- 当没有任何节目块命中时使用默认补位或 fallback
- 双 deck 音频播放器进行淡入淡出
- 记录已播放历史，避免最近重复
- 记录播放日志

## 技术栈

- Electron
- React 18
- TypeScript
- Vite
- Ant Design
- Zustand
- dayjs
- music-metadata
- electron-builder

## 项目结构

```text
Radio/
├─ assets/
├─ electron/
│  ├─ main/
│  │  ├─ default-data.ts
│  │  ├─ index.ts
│  │  ├─ ipc.ts
│  │  ├─ store.ts
│  │  └─ types.ts
│  ├─ preload/
│  │  └─ index.ts
│  └─ tsconfig.json
├─ src/
│  ├─ components/
│  │  ├─ schedule/
│  │  │  ├─ BlockEditorModal.tsx
│  │  │  └─ ScheduleTimeline.tsx
│  │  ├─ AppShell.tsx
│  │  └─ PageHeader.tsx
│  ├─ modules/
│  │  └─ automation/
│  │     └─ AutomationEngine.tsx
│  ├─ pages/
│  │  ├─ DashboardPage.tsx
│  │  ├─ LibraryPage.tsx
│  │  ├─ RulesPage.tsx
│  │  ├─ SchedulePage.tsx
│  │  └─ SettingsPage.tsx
│  ├─ services/
│  │  ├─ audio-selector.ts
│  │  └─ fader.ts
│  ├─ store/
│  │  ├─ app-store.ts
│  │  └─ transport-store.ts
│  ├─ types/
│  │  └─ app.ts
│  ├─ utils/
│  │  ├─ schedule.ts
│  │  └─ time.ts
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ styles.css
├─ index.html
├─ package.json
├─ tsconfig.json
└─ vite.config.ts
```

## 安装依赖

先安装 Node.js 20 或更新版本。

```bash
npm install
```

## 本地开发运行

```bash
npm run dev
```

这会同时启动：

- Vite 前端开发服务器
- Electron 主进程 TypeScript 监听编译
- Electron 桌面窗口

## 生产构建

```bash
npm run build
```

会输出：

- `dist/` 前端产物
- `dist-electron/` Electron 主进程与 preload 产物

## Windows 打包为 exe 安装包

在 Windows 机器上执行：

```bash
npm install
npm run dist:win
```

打包完成后，在 `release/` 目录中会得到安装包，例如：

```text
release/RadioFlow-Setup-1.0.0.exe
```

## 使用流程

1. 打开软件后先进入 `Library`
2. 点击“导入文件”或“导入文件夹”
3. 给音频设置分类，例如 `Music`、`News`、`Filler`
4. 进入 `Schedule`
5. 新建节目块，设置时间、来源类型和规则
6. 回到 `Dashboard`
7. 点击“开始自动播出”

## 数据保存位置

应用数据默认保存在 Electron 的用户目录中，例如 Windows 上通常类似：

```text
C:\Users\你的用户名\AppData\Roaming\RadioFlow Desktop\
```

其中核心数据文件是：

```text
radioflow-data.json
```

## 常见问题

### 1. 为什么导入了文件但没有播出？

请检查：

- 音频是否启用
- 音频分类是否和节目块规则匹配
- 当前时间是否命中了节目块
- 是否已经点击“开始自动播出”

### 2. 为什么会进入补位播放？

出现以下情况时会启用补位：

- 当前节目块没有匹配到足够音频
- 当前节目块剩余时间太短，不适合再播长音频
- 当前时段没有命中任何节目块

### 3. 文件损坏会不会让软件崩溃？

不会。当前版本会尽量跳过无法播放的文件，并记录日志。

### 4. 可以完全离线使用吗？

可以。整个项目就是为离线本地使用设计的。

## 后续可扩展方向

- 真正的 SQLite 持久化
- 更完整的周重复 / 例外日期编辑器
- 更强的拖拽日历交互
- 输出设备选择
- 开机自启真正接入系统注册表
- 月视图总览
- 更完整的日志筛选与导出
- 音频波形与更精细的电平表
- 多播放器预加载策略

## 已知限制

- 当前托盘图标使用空白占位，适合开发阶段，正式发布建议换成真实 `.ico`
- Day 视图支持拖动与拉伸，Week 视图当前以总览为主
- 开机启动开关目前只做本地设置保存，未真正写入系统
- 交叉淡化基于浏览器音频能力，已经可用，但还不是广播级 DSP 引擎
- 极少数 metadata 异常文件可能只能读取文件名，不能读取完整标签
