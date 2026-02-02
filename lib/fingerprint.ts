// lib/fingerprint.ts
import crypto from 'crypto';

export function generateFingerprint(email: string, moduleType: string, inputData: any, image?: string | null) {
  let coreData = "";

  // 根據不同模塊，提取「不可變」的核心特徵
  if (moduleType === 'naming' || moduleType === 'bazi') {
    // 姓名 + 生日 + 性別 (這些變了就代表是幫別人測，需重新付費)
    coreData = `${inputData.name}-${inputData.birthday}-${inputData.gender}`;
  } else if (moduleType === 'dream') {
    // 夢境取前 50 個字 (防止標點符號微調，但大意不變)
    coreData = inputData.dream?.substring(0, 50);
  } else if (moduleType === 'face' || moduleType === 'fengshui') {
    // 圖片 Hash (如果換了圖，就視為新請求)
    coreData = image ? crypto.createHash('md5').update(image).digest('hex') : "no-image";
  }

  // 最終組合：Email + 模塊 + 核心特徵
  const rawString = `${email.toLowerCase()}-${moduleType}-${coreData}`;
  return crypto.createHash('sha256').update(rawString).digest('hex');
}