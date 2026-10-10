# HANDOFF.md — akach Maps Project

更新：2026-10-10

## 0. 这是什么

这是个人 GitHub Pages 网站 `aaaaakach.github.io` 的 Maps 二级页面：

`/maps/`

它不是传统 GIS / 地图工具，而是一个**极简、清透、可交互的个人旅行记忆地图**。

核心体验：
- 页面中央一个可旋转的 3D 地球
- 去过的国家点亮
- 点击中国后进入完整中国地图，并按省份展示
- 通过纸飞机新增国家 / 中国城市
- 通过 Pin 标记特殊地点
- Country / Province 具有 Memory Card，可展示照片与留言
- 管理员可在网页内编辑内容
- 数据最终使用 Supabase 持久化

参考项目：
`https://github.com/binzek/pinglobe`

只参考“3D 地球作为页面核心交互对象”的思路，不复制其 branding、视觉资产、代码结构或特有 UI。

---

# 1. 项目位置与关键文件

本地项目路径：

`C:\Users\蔡予\Documents\Codex\2026-08-14\ponytail\outputs\aaaaakach.github.io-git`

关键文档：
- `AGENTS.md`
- `PRD.md`
- `MAPS_PRD.md`
- 本文件：`HANDOFF.md`

Maps 页面：
- `maps/index.html`

全局样式：
- `style.css`

纸飞机素材：
- 当前正式素材：`maps/airplane.svg`

注意：
旧素材 `plane.svg` 已删除。页面继续使用 `airplane.svg`。

---

# 2. 已安装并应继续使用的 Skills

## Ponytail
用途：
- 保持现有 `akach` 网站的视觉语言
- 前端布局、比例、间距、排版、视觉一致性
- 不负责产品需求决策

原则：
`MAPS_PRD.md = source of truth`
`Ponytail = visual/frontend implementation assistance`

## threejs-errors-rendering
已安装位置：

`C:\Users\caiyu\.agents\skills\threejs-errors-rendering`

用途：
- 专门诊断 3D Globe / Three.js 渲染问题
- 包括：
  - z-fighting
  - polygon / border flicker
  - rendering artifacts
  - depth / overlap 问题
  - geometry / material 渲染异常

之前 Globe 曾出现：
- 国家边界线抖动
- polygon 色块抖动

如果问题再次出现，不要凭感觉改 CSS；优先调用此 skill 查根因。

---

# 3. 总体 Phase 规划

当前规划一共 9 个 Phase。

## Phase 1 — Website Integration
状态：已完成

完成内容：
- 将 MAPS 加入主页的实际目的地列表
- 新建 `/maps/`
- Maps 页面复用现有：
  - header
  - typography
  - spacing
  - navigation
  - visual language
- 保持响应式
- 同步 PhD Application 页的全局导航

## Phase 2 — 3D Globe
状态：已完成

目标：
- 真实 3D Globe
- 国家 polygon
- 国家边界
- 鼠标拖动旋转
- idle 自动旋转
- visited / unvisited 状态
- Places 统计逻辑初步接入

## Phase 3 — World Interaction & Memory Card
状态：已完成

目标：
- Country hover preview
- Country click persistent selection
- leader line
- Memory Card
- 三张代表图
- 留言
- 点击空白关闭
- 拖动 Globe 时隐藏 annotation

关键交互：
`Hover = Preview`
`Click = Keep Open`
`Click Blank = Close`

## Phase 4 — China Map
状态：已完成

目标：
- 点击 China
- World Globe → China Map transition
- 中国地图完整展开
- 包含南海相关地图表达
- 省级边界
- province visited / unvisited
- province Memory Card
- 返回 World

注意：
中国层必须**先点击中国、打开中国地图**，不能直接在 World Globe 上操作省份。

## Phase 5 — Paper Plane
状态：已完成初版

目标：
- 纸飞机作为新增 visited area 的主要入口
- World：新增国家
- China：新增城市并点亮对应省份
- `TO:`
- 飞行
- ripple
- 点亮

后续又做了大量 paper-plane refinement，详见第 8 节。

## Phase 6 — Pin System
状态：实现已在当前代码中；仍需最终验收

目标：
- 管理员模式下新增 Pin
- 输入：
  - latitude
  - longitude
  - optional note
- Pin 扎入地图
- hover Pin 显示 note
- Pin 与 visited/cities 统计完全独立

Phase 6 同时要求修：
- Globe 边界 / 色块抖动
- 中国地图横向拉伸
- 飞机素材位置

## Phase 7 — Supabase + Photos
状态：集成代码已在当前代码中；线上数据库与 Storage 状态需单独核实

目标：
- Supabase Database
- Supabase Storage
- visited 国家数据持久化
- China city / province 关系持久化
- Pins 持久化
- Country / Province Memory Card 真实照片
- 每个 Country / Province 支持 3 张代表图
- 留言持久化
- 核对本地 fallback 数据是否仍与 Supabase 中的实际旅行记录一致；不要在未核对前删除 fallback 数据

当前实现包括 Supabase 数据读写和照片 Storage 流程。代码存在不代表线上 schema、RLS 和 Storage policy 均已正确配置；发布前需按 Supabase 控制台和本文件验收项核实。

## Phase 8 — Admin / Edit Mode
状态：实现已在当前代码中；线上权限与各项编辑流程仍需最终验收

主要内容详见第 10 节。

## Phase 9 — Final Polish & QA
状态：尚未完成最终验收

只做收尾和验收，不加新功能。

---

# 4. 最终 Maps 配色

已经锁定，不要随意再换一套。

World / China 使用同一套 palette：

- Ocean：`#BDC6D9`
- Unvisited land / 中国未点亮省份：`#E3E7F1`
- Country borders / 中国省界：`#52688F`
- Visited country / visited province：`#7391C8`

要求：
- flat solid fill
- 不要 gradient
- 不要 glossy
- 不要 realistic Earth texture
- 不要 stars / atmosphere glow / clouds / particles
- 保持清透、简约、蓝灰体系

中国层和 World 层必须保持一致，不要各做一套视觉。

---

# 5. Places 区域

位置：
**右下角**

显示形式：

`PLACES`
`X countries · Y cities`

注意：
不是左下角。

## countries
`countries` 必须由 World 层当前已点亮国家数量自动计算。

不可直接手改数字。

逻辑：
`countries = number of visited countries`

## cities
`cities` 来自实际城市列表数量。

不是 Pin 数量。

管理员通过增删 Cities 列表改变数字。

Pin 完全独立。

---

# 6. 中国层的数据逻辑

这是后面非常重要的一处修改，不要退回“一个省份默认算一个城市”的旧逻辑。

现在正式逻辑是：

- 中国地图仍然展示到 Province polygon
- 但实际“去哪”的记录细化到 City
- City 决定对应 Province 是否点亮

Paper Plane 的 China `TO:` 格式：

`City, Province`

中文例子：

`广州，广东`

英文可对应：

`Guangzhou, Guangdong`

## 联动规则

### 新增城市
例如：

`广州，广东`

系统：
1. 新增 `广州` 到 Cities
2. 识别其 province = 广东
3. 如果广东未点亮，则自动点亮广东
4. cities +1

如果广东已经点亮：
- 只新增广州
- 广东继续保持点亮

### 删除城市
例如广东有：
- 广州
- 深圳

删广州：
- 广东仍然点亮

再删深圳：
- 广东已无任何城市
- **广东必须自动取消点亮**

即：

`该省至少有 1 个 city → province lit`
`删除该省最后一个 city → province unlit`

这是强制逻辑。

## 数据结构建议
China city 至少要保存：
- `city_name`
- `province_name`
- 最好还有 `province_code`
- 真实经纬度（如果用于飞机飞行）

不要只保存字符串 `"广州，广东"`。

---

# 7. Pin System

Pin 是一层**完全独立**的数据。

Pin 不参与：
- countries 统计
- cities 统计
- province visited 判断

管理员新增 Pin：
- latitude
- longitude
- note optional

当前统一使用一种 Pin 图标。
以后用户可能替换 SVG，但现在不要设计分类体系。

Pin hover：
- 有 note → 显示一句话
- note 为空 → 不强制弹空卡片

管理员后续应能：
- 编辑 latitude
- 编辑 longitude
- 编辑 note
- 删除 Pin

---

# 8. Paper Plane — 最新最终要求

正式素材：

`maps/airplane.svg`

## 外观
- 保持黑色
- 显示尺寸 = 原先当前尺寸的约 `1.5×`
- 不显示任何：
  - border
  - bounding box
  - hover frame
  - selected frame
  - button frame

## 默认位置
World Globe 时：
- 放在地球右边
- 是“地球场景的一部分”
- 不要像右下角 FAB

## 选中 / 激活时
原先是顺时针旋转。

必须改为：
**逆时针旋转**

保持 subtle。

不要显示外框。

## SVG 方向
这个素材是水平放置：

- 左边 = 机头
- 右边 = 机尾

这是后续所有旋转与 anchor 计算的前提。

## 飞行方向
不能让飞机横着滑。

飞行过程中必须：
- 根据 flight path 的 tangent 实时计算旋转角度
- 让**左侧机头始终指向实际飞行方向**
- rotation 要平滑
- 不能突然跳角

## 飞行轨迹的真正感觉

非常重要：
不是普通二维页面上的半圆 / 弧线。

用户想要的感觉是：

**像从电脑屏幕 / 地图平面外面的空间，把纸飞机抛进来，然后飞机沿抛物线飞行，最后俯冲并扎进电脑里的地图平面。**

可以概括：

`outside / foreground → thrown upward → clear apex → descend → dive → pierce into map plane`

视觉上要有明显的前后纵深感。

不是：
`icon moves along 2D arc`

应该通过：
- trajectory
- scale
- rotation
- depth perception
一起做出来。

前段：
- 飞机感觉离用户更近
- 相对更大

途中：
- 形成明确抛物线 apex

后段：
- 飞机逐渐缩小
- 向地图平面深处移动
- 最终俯冲
- 像“扎入”地图

终点不能只是停在地图表面。

要有：
**pierce / stick into map plane**

的感觉。

## 飞机终点必须精准

China level：

TO 输入：

`广州，广东`

飞机应该飞到：
**广州的真实城市坐标**

而不是：
- 广东 centroid
- 随便一个省内点
- 硬编码像素
- 视觉上“差不多”的位置

然后：
- impact 后点亮广东 province

## 最关键的 anchor
飞机最后命中目标时：

**不能用 SVG center 对齐目标。**

因为飞机的头在左侧。

最终要求：

`airplane left-center anchor = exact projected target coordinate`

也就是：
**飞机左侧正中间（机头位置）精准到达目标城市位置。**

最终帧：
- 左侧中点到达广州
- 然后飞机消失 / 扎入
- ripple
- 广东点亮

必须保证：
- responsive resize 后仍然准
- China Map resize 后仍然准
- 不同 viewport 仍然准

不要 per-province hard-coded offsets。

---

# 9. Country / Province Memory Card

已确定交互：

## Hover
临时预览。

`Hover visited region → highlight + leader line + Memory Card`

## Click
固定打开。

点击 visited country / province：
- selected
- highlight 保留
- leader line 保留
- Memory Card 保留
- 鼠标可移到 Card 上

## Click Blank
点击地图 / 页面空白处：
- selected 清除
- card fade out
- leader line fade out
- region 恢复普通 visited 状态
- 恢复 Globe / China Map 普通浏览

## Switch
如果 A 已 selected，再点 B：
- A 关闭
- B 打开
- 不需要先手动关闭 A

## 内容
Country / Province Memory Card：
- Name
- optional message
- 3 张代表照片

不要做成普通 tooltip / dashboard card。

---

# 10. Phase 8 — Admin / Edit Mode 详细需求

这是剩余最重要的大 Phase。

## 管理员登录入口

入口在主网站左上角：

普通：
`akach`

点击 `akach`：
- 页面背景 blur
- 轻微降亮度 / 饱和度
- 中央出现：
  `I'm`
- 可有 typewriter effect
- 进入 Google OAuth

不要再做“输入蔡予作为密码”。

## 登录成功
管理员登录成功后：

全站：
`akach → me`

使用：
- subtle crossfade / morph
- 不显示 Admin / Administrator 字样

登录状态要跨 Home / Maps / PhD Application 等页面继承。

## 管理员邮箱

授权管理员：

- `akach66666@gmail.com`
- `yucai2027@gmail.com`

注意：
不要把这两个邮箱仅写在前端做安全判断。

真实权限必须使用：
- Supabase Auth
- Supabase RLS
- Storage 权限

前端即便被查看源码，也不能绕过写权限。

## Edit Mode 中显示
普通访客看不到：
- Paper Plane 新增入口
- Add Pin
- Edit
- Delete
- Upload

管理员可见。

## Region 编辑
Country / Province Memory Card 右上角：
`Edit`

允许改：
- display name
- note
- photo 1
- photo 2
- photo 3

保存后原地恢复展示。

## Pin 编辑
允许：
- latitude
- longitude
- note
- delete

---

# 11. Places 管理界面（管理员模式）

管理员模式下：

点击右下角 `PLACES`

进入 Places 管理。

## 动效
- 页面其他部分 blur
- 地图 / Globe 作为背景保留
- 暂停其主要交互
- 原右下角：
  `X countries · Y cities`
  平滑移动到页面**中间偏上**
- 字体明显放大
- 下方浮现：
  - Countries
  - Cities

示意：

`8 countries · 23 cities`

`Countries              Cities`
`China        ×          Guangzhou        ×`
`France       ×          Hangzhou         ×`
`Japan        ×          Paris            ×`

## 数字逻辑
数字不能直接编辑。

必须通过：
**增删列表**
来改变数字。

### Countries
列表 = 当前 visited countries

删除 Country：
- country 从 visited data 删除
- World Globe 对应国家取消点亮
- countries 自动 -1

### Cities
列表 = 当前实际 city records

删除 City：
- city record 删除
- cities 自动 -1

如果删掉的是中国某省最后一个 city：
- 对应 Province 自动取消点亮

## 新增
Places 管理应支持后续：
- 增加 Country
- 增加 City

但主交互仍应优先与 Paper Plane 保持一致，避免出现两套冲突的“旅行新增”逻辑。

## 退出
- 点击背景空白
或
- 使用一个非常克制的小 `×`

然后：
- 列表 fade out
- 数字缩回右下角
- blur 解除
- Globe / China 恢复交互

---

# 12. 当前实现状态与后续检查

Phase 1–8 的主要功能代码已存在于当前 checkout。阶段规划保留作需求与验收清单，不代表线上服务已部署或外部 Supabase 设置已验证。

发布前需核实：
- Supabase Database
- Supabase Storage
- 真实数据持久化
- 真实照片
- Memory Card 3 photos
- Pins persistence
- visited countries persistence
- Chinese cities + province relationship persistence
- 核实数据库读取失败时的本地 fallback 行为及数据准确性

同时必须核对最新 Paper Plane requirements（见第 8 节）是否全部实现，并完成第 13 节的最终 QA。不要仅凭本地代码推断 GitHub Pages 或 Supabase 已完成部署。

---

# 13. Phase 9 — Final Polish & QA

最后只做 QA / polish，不增加功能。

重点检查：

## Globe
- 地球是否仍有 flicker / jitter
- country borders 是否稳定
- polygon fills 是否稳定
- zoom / drag / idle rotate 是否正常
- maximum zoom 是否仍保持完整 globe 视觉，不进入只剩局部圆形窗口的状态

## China
- 不允许横向拉伸
- 地图比例正确
- projection 正确
- coastline / province / 南海区域正常
- World → China → World transition 正常

之前明确踩过：
**China Map 横向拉伸**
不能用 `scaleX()` 等 CSS 暴力压缩修正。

必须修 projection / aspect ratio / sizing。

## Paper Plane
- `airplane.svg`
- 黑色
- 1.5×
- right side of globe
- no frame
- selected = counterclockwise
- nose points along tangent
- spatial parabolic flight
- dive into map plane
- nose anchor accurately hits target city

## Memory Cards
- hover
- click
- click blank
- switching
- photos
- responsive positioning

## Places
- right-bottom
- China / World 同风格
- countries count correct
- cities count correct
- admin list management correct

## Admin
- Google login
- only 2 authorized emails
- RLS prevents normal visitors from writes
- Storage upload/delete permissions correct
- `akach → me`
- session persistence

## Performance
- images lazy load
- avoid giant originals
- WebGL performance
- no unnecessary rerenders
- mobile usable
- no horizontal overflow

## Accessibility
- touch fallback
- keyboard-visible focus
- `prefers-reduced-motion`
- meaningful photo alt text

---

# 14. 已经踩过的坑：绝对不要再踩

## 坑 1：把 PRD 全部复制进每个 Phase Prompt
不要。

正确方式：
- `MAPS_PRD.md` 是 source of truth
- Phase Prompt 只写：
  - 本阶段做什么
  - 本阶段新增的修正
  - 明确“不做什么”

否则浪费 token，也容易 Prompt 与 PRD 冲突。

---

## 坑 2：过度拆分 Phase
不要每个小修正都新开一个 Phase。

当前 9 Phase 已经够了。

视觉问题 / bug 可以并入下一 Phase 修。

---

## 坑 3：让 Ponytail 决定产品需求
不要。

Ponytail 用于：
- visual polish
- layout
- consistency

产品需求由：
`MAPS_PRD.md`
决定。

---

## 坑 4：旧 AGENTS 里的“纯 HTML/CSS”限制压过 Maps
原网站早期是 static HTML/CSS。

但 Maps 已明确批准：
- JavaScript
- WebGL
- Three.js / Globe.GL
- Supabase
- animation

所以不要因为旧规则而拒绝 Maps 所需技术。

同时要尽量保持：
- 小改动
- 不无意义重构
- 主页不受影响

---

## 坑 5：Globe flicker 用“隐藏边界”掩盖
绝对不要。

必须查根因：
- z-fighting
- overlapping layers
- polygon altitude
- depth
- materials
- per-frame updates
等。

使用：
`threejs-errors-rendering`

---

## 坑 6：中国地图拉伸后用 CSS scaleX 修
不要。

必须修：
- projection
- viewBox
- width/height
- aspect ratio
- geographic fit

地图形状必须真实。

---

## 坑 7：飞机飞到“省份中心”
错。

China TO 已经细化到：
`City, Province`

飞机飞到：
**真实城市坐标**

province 只是最终点亮区域。

---

## 坑 8：飞机中心点对齐 destination
错。

必须：
`left-center nose anchor = target`

---

## 坑 9：纸飞机做成二维图标沿半圆移动
错。

目标是：
**从屏幕 / 电脑地图平面外抛入 → 抛物线 → 纵深 → 俯冲 → 扎入地图平面**

---

## 坑 10：Pin 参与 city 计数
错。

Pin 完全独立。

---

## 坑 11：把 Province 当成一个 city
这是旧方案，已废弃。

现在必须使用真实 Cities。

---

## 坑 12：直接允许手改数字
不要。

`countries / cities` 都应通过实际列表增删来变化。

---

## 坑 13：China Province 点亮与 City 数据分离
不要。

现在必须联动：
- first city added → province lights
- last city removed → province unlights

---

## 坑 14：管理员邮箱写前端判断就算权限
不安全。

必须：
- Google OAuth
- Supabase Auth
- RLS
- Storage policies

---

## 坑 15：普通访客看到编辑 UI
不要。

公开访问体验首先是：
**旅行记忆地图**
不是后台。

---

# 15. 下一会话推荐工作流

新会话拿到本文件后：

1. 先读：
   - `HANDOFF.md`
   - `MAPS_PRD.md`
   - `AGENTS.md`
   - `PRD.md`

2. 先检查当前 checkout 和 Git 状态；保留已有本地修改。

3. 不要重新从头讨论产品。
   以上需求已经基本定稿。

4. 按第 12–13 节核实 Supabase、Paper Plane、Edit Mode 与无障碍行为。
5. 记录尚未验证的线上配置；只有完成检查后才标记验收通过。

---

# 16. 重要产品原则

Maps 不应该像：
- GIS
- Google Maps clone
- dashboard
- admin console
- game UI

它应该像：
**一个安静、清透、可探索、有一点旅行手账感的个人记忆地球。**

视觉优先级：

`Globe / China Map → Geographic state → Memory → Editing tools`

编辑能力应尽量隐藏在管理员模式内。

普通访客打开 Maps 时第一感受应该是：

**一个简约、清透、可以旋转和探索的蓝灰色旅行地球。**
