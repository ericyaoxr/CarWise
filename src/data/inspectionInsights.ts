export interface InspectionInsight {
  id: string;
  title: string;
  detail: string;
  action: string;
  source: string;
  sourceUrl: string;
}

export const inspectionInsights: InspectionInsight[] = [
  {
    id: 'pay-after-inspection',
    title: '先验车再确认交付',
    detail: '多位车主提到交付现场会催尾款、保险或补贴节点，真正有主动权的是先把车况和权益确认清楚。',
    action: '验车、权益、问题留证都完成后，再处理签字和付款。',
    source: '汽车之家 007GT 车主提车分享',
    sourceUrl: 'https://club.m.autohome.com.cn/bbs/thread/249dbfb8949804ac/111816533-1.html',
  },
  {
    id: 'piano-paint-lights',
    title: '前后杠、侧裙和灯组要细看',
    detail: '007/007GT 的前后杠、侧裙等钢琴烤漆位置容易显划痕，前后大灯也要检查内部裂痕。',
    action: '带手电筒，重点看前后杠下沿、侧裙、轮胎附近和前后灯。',
    source: '汽车之家车家号 007 验车攻略',
    sourceUrl: 'https://chejiahao.autohome.com.cn/info/14399775',
  },
  {
    id: 'assembly-and-interior',
    title: '装配、内饰污渍和开合摩擦',
    detail: '车友反馈过扶手箱盖与主驾靠背摩擦、浅划痕、内饰污渍、装配问题等交付瑕疵。',
    action: '逐个开合门、后备箱、扶手箱和储物盖，发现摩擦或污渍直接拍照。',
    source: '汽车之家 007GT 车主提车分享',
    sourceUrl: 'https://club.m.autohome.com.cn/bbs/thread/249dbfb8949804ac/111816533-1.html',
  },
  {
    id: 'smart-driving-camera',
    title: '智驾、激光雷达和 360 要试',
    detail: '公开投诉和车友反馈里出现过激光雷达/NZP异常、360侧向画面清晰度不足、车机网络卡顿等问题。',
    action: '交付前确认车辆激活、App绑定、360画面、导航定位和智驾相关提示正常。',
    source: '车质网与懂车帝 007GT 车友反馈',
    sourceUrl: 'https://m.12365auto.com/threadforum/256497.shtml',
  },
  {
    id: 'air-suspension-bottom',
    title: '空悬版本关注底盘和高度',
    detail: '部分车友关注空悬自动升降和底盘通过性，低底盘车型更需要确认底部无磕碰。',
    action: '验车时看电池包和底盘护板，空悬车再试高度切换。',
    source: '懂车帝 007GT 车友圈',
    sourceUrl: 'https://www.dongchedi.com/community/25172/selected',
  },
];
