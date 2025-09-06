---
description: Ionicons 图标使用规范和最佳实践
globs: ["src/app/**/*.jsx", "src/app/**/*.js", "src/app/**/*.tsx", "src/app/**/*.ts"]
alwaysApply: true
---

# Ionicons 图标使用规范

基于 Ionicons 7.4.0 的完整图标使用指南，确保在 MorphixAI 应用中正确使用图标。

## 🎨 图标样式系统

### 三种图标样式
每个图标都有三种不同的样式变体：

```jsx
import { 
  home,        // 默认样式（实心）- 用于激活/选中状态
  homeOutline, // 轮廓样式（线条）- 用于未激活/默认状态  
  homeSharp    // 锐角样式（方形）- 用于现代/简洁风格
} from 'ionicons/icons';
```

### 样式使用原则

1. **状态切换** - 根据激活状态选择合适样式
2. **视觉一致性** - 同一界面保持相同样式风格
3. **用户体验** - 提供清晰的视觉反馈

## 📋 常用图标清单

### 导航和操作类
```jsx
import {
  // 主要导航
  home, homeOutline, homeSharp,
  search, searchOutline, searchSharp,
  settings, settingsOutline, settingsSharp,
  person, personOutline, personSharp,
  menu, menuOutline, menuSharp,

  // 基本操作
  add, addOutline, addSharp,
  close, closeOutline, closeSharp,
  checkmark, checkmarkOutline, checkmarkSharp,
  trash, trashOutline, trashSharp,
  edit, editOutline, editSharp,
  save, saveOutline, saveSharp,
  
  // 方向和导航
  arrowBack, arrowBackOutline, arrowBackSharp,
  arrowForward, arrowForwardOutline, arrowForwardSharp,
  chevronBack, chevronBackOutline, chevronBackSharp,
  chevronForward, chevronForwardOutline, chevronForwardSharp
} from 'ionicons/icons';
```

### 媒体和通信类
```jsx
import {
  // 媒体操作
  camera, cameraOutline, cameraSharp,
  image, imageOutline, imageSharp,
  play, playOutline, playSharp,
  pause, pauseOutline, pauseSharp,
  stop, stopOutline, stopSharp,
  
  // 通信
  mail, mailOutline, mailSharp,
  call, callOutline, callSharp,
  videocam, videocamOutline, videocamSharp,
  chatbubble, chatbubbleOutline, chatbubbleSharp,
  notifications, notificationsOutline, notificationsSharp,
  
  // 分享和传输
  share, shareOutline, shareSharp,
  download, downloadOutline, downloadSharp,
  upload, uploadOutline, uploadSharp,
  copy, copyOutline, copySharp
} from 'ionicons/icons';
```

### 内容和数据类
```jsx
import {
  // 文件和文档
  document, documentOutline, documentSharp,
  folder, folderOutline, folderSharp,
  archive, archiveOutline, archiveSharp,
  
  // 时间和日期
  calendar, calendarOutline, calendarSharp,
  time, timeOutline, timeSharp,
  alarm, alarmOutline, alarmSharp,
  
  // 位置
  location, locationOutline, locationSharp,
  map, mapOutline, mapSharp,
  
  // 安全
  lockClosed, lockClosedOutline, lockClosedSharp,
  lockOpen, lockOpenOutline, lockOpenSharp,
  eye, eyeOutline, eyeSharp,
  eyeOff, eyeOffOutline, eyeOffSharp
} from 'ionicons/icons';
```

### 状态和反馈类
```jsx
import {
  // 反馈状态
  heart, heartOutline, heartSharp,
  star, starOutline, starSharp,
  thumbsUp, thumbsUpOutline, thumbsUpSharp,
  thumbsDown, thumbsDownOutline, thumbsDownSharp,
  
  // 系统状态
  refresh, refreshOutline, refreshSharp,
  sync, syncOutline, syncSharp,
  checkmarkCircle, checkmarkCircleOutline, checkmarkCircleSharp,
  closeCircle, closeCircleOutline, closeCircleSharp,
  warning, warningOutline, warningSharp,
  
  // 网络和连接
  wifi, wifiOutline, wifiSharp,
  bluetooth, bluetoothOutline, bluetoothSharp,
  cloud, cloudOutline, cloudSharp,
  globe, globeOutline, globeSharp
} from 'ionicons/icons';
```

### 商务和工具类
```jsx
import {
  // 商务
  card, cardOutline, cardSharp,
  cash, cashOutline, cashSharp,
  cart, cartOutline, cartSharp,
  bag, bagOutline, bagSharp,
  gift, giftOutline, giftSharp,
  
  // 工具和设置
  construct, constructOutline, constructSharp,
  hammer, hammerOutline, hammerSharp,
  build, buildOutline, buildSharp,
  cog, cogOutline, cogSharp,
  
  // 娱乐和生活
  game, gameOutline, gameSharp,
  musical, musicalOutline, musicalSharp,
  fitness, fitnessOutline, fitnessSharp,
  restaurant, restaurantOutline, restaurantSharp,
  
  // 特殊标识
  rocket, rocketOutline, rocketSharp,
  flash, flashOutline, flashSharp,
  diamond, diamondOutline, diamondSharp,
  trophy, trophyOutline, trophySharp
} from 'ionicons/icons';
```

## 🎯 使用最佳实践

### 1. Tab 导航中的图标状态切换

```jsx
import { IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { home, homeOutline, library, libraryOutline } from 'ionicons/icons';

// 推荐：根据选中状态动态切换图标
const TabBar = ({ activeTab }) => (
  <IonTabBar slot="bottom">
    <IonTabButton tab="home" href="/home">
      <IonIcon icon={activeTab === 'home' ? home : homeOutline} />
      <IonLabel>首页</IonLabel>
    </IonTabButton>
    <IonTabButton tab="library" href="/library">
      <IonIcon icon={activeTab === 'library' ? library : libraryOutline} />
      <IonLabel>图书馆</IonLabel>
    </IonTabButton>
  </IonTabBar>
);
```

### 2. 按钮中的图标使用

```jsx
import { IonButton, IonIcon } from '@ionic/react';
import { add, camera, save, trash } from 'ionicons/icons';

// 主要操作按钮 - 使用实心图标
<IonButton fill="solid">
  <IonIcon icon={add} slot="start" />
  添加项目
</IonButton>

// 次要操作按钮 - 可使用轮廓图标
<IonButton fill="outline">
  <IonIcon icon={cameraOutline} slot="start" />
  拍照
</IonButton>

// 危险操作 - 使用实心图标增强警示
<IonButton fill="solid" color="danger">
  <IonIcon icon={trash} slot="start" />
  删除
</IonButton>
```

### 3. 列表项中的图标

```jsx
import { IonItem, IonIcon, IonLabel } from '@ionic/react';
import { 
  person, mail, call, location, 
  chevronForward, heart, heartOutline 
} from 'ionicons/icons';

// 信息展示 - 使用轮廓图标
<IonItem>
  <IonIcon icon={personOutline} slot="start" />
  <IonLabel>用户信息</IonLabel>
  <IonIcon icon={chevronForward} slot="end" />
</IonItem>

// 可切换状态 - 动态图标
<IonItem button onClick={() => toggleFavorite(item.id)}>
  <IonIcon 
    icon={item.isFavorite ? heart : heartOutline} 
    slot="start" 
    color={item.isFavorite ? "danger" : "medium"}
  />
  <IonLabel>{item.title}</IonLabel>
</IonItem>
```

### 4. 浮动操作按钮（FAB）

```jsx
import { IonFab, IonFabButton, IonIcon } from '@ionic/react';
import { add, camera, share } from 'ionicons/icons';

// 主要 FAB - 使用实心图标
<IonFab vertical="bottom" horizontal="end" slot="fixed">
  <IonFabButton>
    <IonIcon icon={add} />
  </IonFabButton>
</IonFab>

// 带展开的 FAB 组
<IonFab vertical="bottom" horizontal="center" slot="fixed">
  <IonFabButton>
    <IonIcon icon={add} />
  </IonFabButton>
  <IonFabList side="top">
    <IonFabButton>
      <IonIcon icon={camera} />
    </IonFabButton>
    <IonFabButton>
      <IonIcon icon={share} />
    </IonFabButton>
  </IonFabList>
</IonFab>
```

### 5. 工具栏中的图标按钮

```jsx
import { IonToolbar, IonButton, IonIcon } from '@ionic/react';
import { search, notifications, menu } from 'ionicons/icons';

<IonToolbar>
  <IonButton slot="start" fill="clear">
    <IonIcon icon={menu} />
  </IonButton>
  
  <IonButton slot="end" fill="clear">
    <IonIcon icon={search} />
  </IonButton>
  
  <IonButton slot="end" fill="clear">
    <IonIcon icon={notifications} />
  </IonButton>
</IonToolbar>
```

## 📐 图标大小和颜色规范

### 大小规范
```jsx
// 标准大小（默认）
<IonIcon icon={home} />

// 自定义大小
<IonIcon icon={home} size="small" />   // 小图标
<IonIcon icon={home} size="large" />   // 大图标

// CSS 自定义大小
<IonIcon 
  icon={home} 
  style={{ fontSize: '24px', width: '24px', height: '24px' }} 
/>
```

### 颜色规范
```jsx
// 使用 Ionic 颜色主题
<IonIcon icon={heart} color="danger" />      // 红色
<IonIcon icon={star} color="warning" />      // 黄色
<IonIcon icon={checkmark} color="success" /> // 绿色
<IonIcon icon={info} color="primary" />      // 主题色
<IonIcon icon={help} color="medium" />       // 灰色

// 自定义颜色
<IonIcon icon={home} style={{ color: '#3880ff' }} />
```

## 🚫 使用注意事项

### 避免的做法
```jsx
// ❌ 不要混合使用不同样式风格
<IonTabBar>
  <IonTabButton>
    <IonIcon icon={home} />        // 实心
  </IonTabButton>
  <IonTabButton>
    <IonIcon icon={searchOutline} /> // 轮廓 - 风格不一致
  </IonTabButton>
</IonTabBar>

// ❌ 不要在同一状态下使用不同样式
const MenuItem = ({ isActive }) => (
  <IonIcon icon={isActive ? homeOutline : home} /> // 逻辑颠倒
);

// ❌ 不要过度使用图标
<IonButton>
  <IonIcon icon={save} slot="start" />
  <IonIcon icon={checkmark} slot="end" />  // 冗余图标
  保存并确认
</IonButton>
```

### 推荐的做法
```jsx
// ✅ 保持样式一致性
<IonTabBar>
  <IonTabButton>
    <IonIcon icon={isHomeActive ? home : homeOutline} />
  </IonTabButton>
  <IonTabButton>
    <IonIcon icon={isSearchActive ? search : searchOutline} />
  </IonTabButton>
</IonTabBar>

// ✅ 语义化使用图标
const StatusIcon = ({ status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'success': return { icon: checkmarkCircle, color: 'success' };
      case 'error': return { icon: closeCircle, color: 'danger' };
      case 'warning': return { icon: warning, color: 'warning' };
      default: return { icon: informationCircle, color: 'primary' };
    }
  };
  
  const { icon, color } = getStatusIcon();
  return <IonIcon icon={icon} color={color} />;
};
```

## 🎨 图标组合模式

### 带徽章的图标
```jsx
import { IonIcon, IonBadge } from '@ionic/react';
import { notifications } from 'ionicons/icons';

<div style={{ position: 'relative', display: 'inline-block' }}>
  <IonIcon icon={notifications} size="large" />
  <IonBadge 
    color="danger" 
    style={{
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      fontSize: '12px'
    }}
  >
    5
  </IonBadge>
</div>
```

### 图标与文字组合
```jsx
import { IonIcon, IonLabel } from '@ionic/react';
import { location, time } from 'ionicons/icons';

<div className="info-row">
  <IonIcon icon={location} color="primary" />
  <IonLabel>北京市朝阳区</IonLabel>
</div>

<div className="info-row">
  <IonIcon icon={time} color="medium" />
  <IonLabel>2小时前</IonLabel>
</div>
```

这个图标使用规范将帮助Cursor在开发时正确选择和使用ionicons，确保应用界面的一致性和用户体验。