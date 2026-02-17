/**
 * 紡績リスク警告システム & 販売訴求ポイント生成
 */

import { getWeaveById } from '../data/weaveDatabase';
import { getYarnById } from '../data/yarnDatabase';

// リスクレベル
export const RISK_LEVELS = {
  NONE: { id: 'none', label: 'なし', color: '#10B981', priority: 0 },
  LOW: { id: 'low', label: '低', color: '#84CC16', priority: 1 },
  MEDIUM: { id: 'medium', label: '中', color: '#F59E0B', priority: 2 },
  HIGH: { id: 'high', label: '高', color: '#EF4444', priority: 3 },
  CRITICAL: { id: 'critical', label: '要注意', color: '#DC2626', priority: 4 },
};

// リスクカテゴリ
export const RISK_CATEGORIES = {
  YARN_BREAKAGE: { id: 'yarn_breakage', name: '糸切れ', icon: '🧵' },
  WEAVING_DIFFICULTY: { id: 'weaving_difficulty', name: '織り難度', icon: '🔧' },
  QUALITY_VARIATION: { id: 'quality_variation', name: '品質ムラ', icon: '📊' },
  SHRINKAGE: { id: 'shrinkage', name: '収縮', icon: '📐' },
  DURABILITY: { id: 'durability', name: '耐久性', icon: '💪' },
  COLOR_FASTNESS: { id: 'color_fastness', name: '堅牢度', icon: '🎨' },
  SPECIAL_HANDLING: { id: 'special_handling', name: '特殊処理', icon: '⚠️' },
  COST: { id: 'cost', name: 'コスト', icon: '💰' },
};

/**
 * 生産リスク分析
 */
export function analyzeProductionRisks(config) {
  const {
    weaveId,
    warpYarnId,
    weftYarnId,
    epi,
    ppi,
    customWarpYarn,
    customWeftYarn,
  } = config;

  const risks = [];
  const weave = getWeaveById(weaveId);
  const warpYarn = customWarpYarn || getYarnById(warpYarnId);
  const weftYarn = customWeftYarn || getYarnById(weftYarnId);

  if (!weave || !warpYarn) {
    return { risks: [], overallRisk: RISK_LEVELS.NONE };
  }

  // 1. 糸切れリスク分析
  analyzeYarnBreakageRisk(risks, weave, warpYarn, weftYarn, epi, ppi);

  // 2. 織り難度分析
  analyzeWeavingDifficultyRisk(risks, weave, warpYarn, weftYarn);

  // 3. 品質ムラリスク
  analyzeQualityVariationRisk(risks, warpYarn, weftYarn);

  // 4. 収縮リスク
  analyzeShrinkageRisk(risks, warpYarn, weftYarn);

  // 5. 耐久性リスク
  analyzeDurabilityRisk(risks, weave, warpYarn, weftYarn);

  // 6. 堅牢度リスク
  analyzeColorFastnessRisk(risks, warpYarn, weftYarn);

  // 7. 特殊処理リスク
  analyzeSpecialHandlingRisk(risks, weave, warpYarn, weftYarn);

  // 8. コストリスク
  analyzeCostRisk(risks, weave, warpYarn, weftYarn);

  // 全体リスクレベル算出
  const overallRisk = calculateOverallRisk(risks);

  return {
    risks,
    overallRisk,
    summary: generateRiskSummary(risks),
  };
}

function analyzeYarnBreakageRisk(risks, weave, warpYarn, weftYarn, epi, ppi) {
  const warpNe = warpYarn.count?.ne || 30;
  const weftNe = weftYarn?.count?.ne || warpNe;

  // 細番手 + 高密度 = 糸切れリスク増
  if (warpNe > 60 && epi > 120) {
    risks.push({
      category: RISK_CATEGORIES.YARN_BREAKAGE,
      level: RISK_LEVELS.HIGH,
      title: '経糸切れリスク（高）',
      description: `細番手（${warpNe}Ne）と高密度（EPI ${epi}）の組み合わせにより糸切れが発生しやすい`,
      recommendations: [
        '織機速度を20-30%低下させる',
        '経糸テンションを細かく調整',
        'サイジング（糊付け）強度を上げる',
        '湿度管理を60-65%に維持',
      ],
    });
  } else if (warpNe > 50 && epi > 100) {
    risks.push({
      category: RISK_CATEGORIES.YARN_BREAKAGE,
      level: RISK_LEVELS.MEDIUM,
      title: '経糸切れリスク（中）',
      description: '細番手糸のため通常より糸切れに注意が必要',
      recommendations: [
        '織機速度を10-15%低下',
        '定期的なテンションチェック',
      ],
    });
  }

  // 強度の低い糸
  if (warpYarn.characteristics?.strength <= 2) {
    risks.push({
      category: RISK_CATEGORIES.YARN_BREAKAGE,
      level: RISK_LEVELS.MEDIUM,
      title: '経糸強度不足',
      description: '糸の引張強度が低いため織り中の糸切れに注意',
      recommendations: [
        'サイジング強化',
        '低速織りを検討',
      ],
    });
  }

  // 織り組織との相性
  if (weave.productionDifficulty >= 4 && warpNe > 50) {
    risks.push({
      category: RISK_CATEGORIES.YARN_BREAKAGE,
      level: RISK_LEVELS.MEDIUM,
      title: '組織-糸相性リスク',
      description: `複雑な織り組織（${weave.name}）と細番手糸の組み合わせ`,
      recommendations: [
        '試織りで問題点を確認',
        '段階的に速度を上げる',
      ],
    });
  }
}

function analyzeWeavingDifficultyRisk(risks, weave, warpYarn, weftYarn) {
  if (weave.productionDifficulty >= 5) {
    risks.push({
      category: RISK_CATEGORIES.WEAVING_DIFFICULTY,
      level: RISK_LEVELS.HIGH,
      title: '高難度織り組織',
      description: `${weave.name}は熟練オペレーターと専門機械が必要`,
      recommendations: [
        '専門工場への外注を検討',
        '十分なリードタイムを確保',
        '試作でノウハウを蓄積',
      ],
    });
  } else if (weave.productionDifficulty >= 4) {
    risks.push({
      category: RISK_CATEGORIES.WEAVING_DIFFICULTY,
      level: RISK_LEVELS.MEDIUM,
      title: '中難度織り組織',
      description: '一定の技術レベルが必要な織り組織',
      recommendations: [
        '事前に工場と打ち合わせ',
        '少量試作を推奨',
      ],
    });
  }

  // パイル織特有のリスク
  if (weave.isPile) {
    risks.push({
      category: RISK_CATEGORIES.WEAVING_DIFFICULTY,
      level: RISK_LEVELS.MEDIUM,
      title: 'パイル織特有の管理',
      description: 'パイル高さの均一性確保が必要',
      recommendations: [
        'パイルカッター/シャーリングの精度確認',
        'パイル倒れ防止の仕上げ処理',
      ],
    });
  }
}

function analyzeQualityVariationRisk(risks, warpYarn, weftYarn) {
  // オーガニック素材のロット差
  const hasOrganic = warpYarn.composition?.some(c => c.organic) ||
                     weftYarn?.composition?.some(c => c.organic);
  if (hasOrganic) {
    risks.push({
      category: RISK_CATEGORIES.QUALITY_VARIATION,
      level: RISK_LEVELS.LOW,
      title: 'オーガニック素材のロット差',
      description: '自然素材のため色調や風合いにロット間差が生じやすい',
      recommendations: [
        '同一ロットでまとめ発注',
        '色調確認のための先行サンプル',
      ],
    });
  }

  // 麻糸のネップ
  const hasLinen = warpYarn.category === 'linen' || weftYarn?.category === 'linen';
  if (hasLinen) {
    risks.push({
      category: RISK_CATEGORIES.QUALITY_VARIATION,
      level: RISK_LEVELS.LOW,
      title: '麻特有のネップ・節',
      description: '自然な風合いとして許容されるが、均一性を求める場合は注意',
      recommendations: [
        '湿式紡績糸を選択',
        '仕様書でネップ許容範囲を明記',
      ],
    });
  }
}

function analyzeShrinkageRisk(risks, warpYarn, weftYarn) {
  // レーヨン系の収縮
  const hasRayon = warpYarn.composition?.some(c =>
    ['viscose', 'modal', 'lyocell', 'cupro'].includes(c.fiber)
  );
  if (hasRayon) {
    risks.push({
      category: RISK_CATEGORIES.SHRINKAGE,
      level: RISK_LEVELS.MEDIUM,
      title: '再生繊維の収縮リスク',
      description: '洗濯による収縮が発生しやすい',
      recommendations: [
        '防縮加工を施す',
        '製品仕様に収縮率を明記',
        '大きめサイズでカットパターン作成',
      ],
    });
  }

  // ウールの収縮
  const hasWool = warpYarn.category === 'wool' || weftYarn?.category === 'wool';
  if (hasWool) {
    risks.push({
      category: RISK_CATEGORIES.SHRINKAGE,
      level: RISK_LEVELS.MEDIUM,
      title: 'ウールのフェルト化リスク',
      description: '不適切な洗濯でフェルト化・収縮が発生',
      recommendations: [
        '防縮加工（スケールオフ等）',
        'ケアラベルに洗濯方法を明記',
      ],
    });
  }
}

function analyzeDurabilityRisk(risks, weave, warpYarn, weftYarn) {
  const weaveDurability = weave.characteristics?.durability || 3;
  const yarnDurability = warpYarn.characteristics?.durability || 3;

  if (weaveDurability <= 2 || yarnDurability <= 2) {
    risks.push({
      category: RISK_CATEGORIES.DURABILITY,
      level: RISK_LEVELS.MEDIUM,
      title: '耐久性への注意',
      description: '繊細な素材・組織のため取扱いに注意が必要',
      recommendations: [
        '用途を限定（デリケート衣料等）',
        'ケアラベルで注意喚起',
        '補強が必要な箇所を検討',
      ],
    });
  }

  // 朱子織の摩擦弱さ
  if (weave.category === 'satin') {
    risks.push({
      category: RISK_CATEGORIES.DURABILITY,
      level: RISK_LEVELS.LOW,
      title: '朱子織の摩擦注意',
      description: '浮き糸が多いため引っかかりや摩擦に弱い',
      recommendations: [
        '裏地使用を推奨',
        '摩擦の多い用途は避ける',
      ],
    });
  }
}

function analyzeColorFastnessRisk(risks, warpYarn, weftYarn) {
  // インディゴデニム
  if (warpYarn.id?.includes('denim') ||
      warpYarn.colorRequirement === 'indigoDenim') {
    risks.push({
      category: RISK_CATEGORIES.COLOR_FASTNESS,
      level: RISK_LEVELS.LOW,
      title: 'インディゴの色落ち',
      description: 'デニム特有の経年変化として意図的な場合もあるが、他衣料への色移りに注意',
      recommendations: [
        '初回洗濯は単独で',
        '色移り防止処理を検討',
        '製品表示で注意喚起',
      ],
    });
  }

  // シルクの変色
  const hasSilk = warpYarn.category === 'silk' || weftYarn?.category === 'silk';
  if (hasSilk) {
    risks.push({
      category: RISK_CATEGORIES.COLOR_FASTNESS,
      level: RISK_LEVELS.MEDIUM,
      title: 'シルクの日光変色',
      description: '直射日光で変色・劣化しやすい',
      recommendations: [
        'UV加工を検討',
        '保管・陳列時の紫外線対策',
      ],
    });
  }
}

function analyzeSpecialHandlingRisk(risks, weave, warpYarn, weftYarn) {
  // スパンデックス混
  const hasSpandex = warpYarn.composition?.some(c => c.fiber === 'spandex') ||
                     weftYarn?.composition?.some(c => c.fiber === 'spandex');
  if (hasSpandex) {
    risks.push({
      category: RISK_CATEGORIES.SPECIAL_HANDLING,
      level: RISK_LEVELS.MEDIUM,
      title: 'スパンデックスの熱・塩素劣化',
      description: '高温や塩素系漂白剤でストレッチ性能が低下',
      recommendations: [
        '低温乾燥・アイロン',
        '塩素系漂白剤不可の表示',
        '縫製時の針熱にも注意',
      ],
    });
  }

  // 特殊機能糸
  if (warpYarn.brandName || weftYarn?.brandName) {
    risks.push({
      category: RISK_CATEGORIES.SPECIAL_HANDLING,
      level: RISK_LEVELS.LOW,
      title: '機能性糸の処理注意',
      description: '機能性を損なわない加工・仕上げが必要',
      recommendations: [
        'メーカー推奨の加工条件を確認',
        '機能性テストを実施',
      ],
    });
  }

  // クレープ糸要件
  if (weave.yarnRequirement?.crepeYarn) {
    risks.push({
      category: RISK_CATEGORIES.SPECIAL_HANDLING,
      level: RISK_LEVELS.MEDIUM,
      title: 'クレープ織の強撚糸',
      description: 'シボを出すため強撚糸が必要',
      recommendations: [
        '強撚糸を指定',
        'セット加工でシボを固定',
      ],
    });
  }
}

function analyzeCostRisk(risks, weave, warpYarn, weftYarn) {
  const warpPrice = warpYarn.priceLevel || 3;
  const weftPrice = weftYarn?.priceLevel || warpPrice;
  const avgPrice = (warpPrice + weftPrice) / 2;

  if (avgPrice >= 6) {
    risks.push({
      category: RISK_CATEGORIES.COST,
      level: RISK_LEVELS.MEDIUM,
      title: '高コスト素材',
      description: '高価な素材のため原価管理に注意',
      recommendations: [
        '歩留まり向上策を検討',
        'B品発生時の対策を事前に決定',
        '価格転嫁の妥当性を確認',
      ],
    });
  }

  if (weave.productionDifficulty >= 4) {
    risks.push({
      category: RISK_CATEGORIES.COST,
      level: RISK_LEVELS.LOW,
      title: '工賃上昇リスク',
      description: '難度の高い織りのため加工賃が割高になる可能性',
      recommendations: [
        '複数工場から見積もり取得',
        'ロットサイズによる単価交渉',
      ],
    });
  }
}

function calculateOverallRisk(risks) {
  if (risks.length === 0) return RISK_LEVELS.NONE;

  const maxPriority = Math.max(...risks.map(r => r.level.priority));
  const criticalCount = risks.filter(r => r.level.priority >= 3).length;

  if (criticalCount >= 3 || maxPriority >= 4) {
    return RISK_LEVELS.CRITICAL;
  } else if (criticalCount >= 1 || maxPriority >= 3) {
    return RISK_LEVELS.HIGH;
  } else if (maxPriority >= 2) {
    return RISK_LEVELS.MEDIUM;
  } else if (maxPriority >= 1) {
    return RISK_LEVELS.LOW;
  }
  return RISK_LEVELS.NONE;
}

function generateRiskSummary(risks) {
  const highRisks = risks.filter(r => r.level.priority >= 3);
  const mediumRisks = risks.filter(r => r.level.priority === 2);

  if (highRisks.length === 0 && mediumRisks.length === 0) {
    return '特に問題なく生産可能と思われます。';
  }

  const parts = [];
  if (highRisks.length > 0) {
    parts.push(`高リスク ${highRisks.length}件`);
  }
  if (mediumRisks.length > 0) {
    parts.push(`中リスク ${mediumRisks.length}件`);
  }

  return `${parts.join('、')}の確認が必要です。詳細をご確認ください。`;
}


/**
 * 販売訴求ポイント生成
 */
export function generateSellingPoints(config) {
  const {
    weaveId,
    warpYarnId,
    weftYarnId,
    pattern,
    customWarpYarn,
    customWeftYarn,
  } = config;

  const sellingPoints = [];
  const weave = getWeaveById(weaveId);
  const warpYarn = customWarpYarn || getYarnById(warpYarnId);
  const weftYarn = customWeftYarn || getYarnById(weftYarnId);

  if (!weave || !warpYarn) {
    return { sellingPoints: [], keywords: [], copyText: '' };
  }

  // 素材由来の訴求
  generateMaterialSellingPoints(sellingPoints, warpYarn, weftYarn);

  // 織り由来の訴求
  generateWeaveSellingPoints(sellingPoints, weave);

  // 機能性訴求
  generateFunctionalSellingPoints(sellingPoints, warpYarn, weftYarn);

  // サステナビリティ訴求
  generateSustainabilityPoints(sellingPoints, warpYarn, weftYarn);

  // キーワード生成
  const keywords = extractKeywords(sellingPoints, weave, warpYarn, weftYarn);

  // コピー文生成
  const copyText = generateCopyText(sellingPoints, weave, warpYarn);

  return {
    sellingPoints,
    keywords,
    copyText,
  };
}

function generateMaterialSellingPoints(points, warpYarn, weftYarn) {
  // 高級素材
  if (warpYarn.category === 'silk') {
    points.push({
      category: '素材',
      title: 'シルクの上質な光沢',
      description: '天然シルクならではの美しい光沢と滑らかな肌触り',
      appeal: 'luxury',
    });
  }

  if (warpYarn.composition?.some(c => c.fiber === 'cashmere')) {
    points.push({
      category: '素材',
      title: 'カシミヤの極上の柔らかさ',
      description: '「繊維の宝石」と呼ばれるカシミヤの贅沢な風合い',
      appeal: 'luxury',
    });
  }

  if (warpYarn.composition?.some(c => c.fiber === 'merino_wool')) {
    points.push({
      category: '素材',
      title: 'メリノウールの上質感',
      description: '極細繊維のメリノウールによる柔らかくしなやかな着心地',
      appeal: 'quality',
    });
  }

  // 天然素材
  if (['cotton', 'linen', 'wool', 'silk'].includes(warpYarn.category)) {
    points.push({
      category: '素材',
      title: '天然素材の心地よさ',
      description: '天然繊維ならではの通気性と快適な着用感',
      appeal: 'comfort',
    });
  }

  // 混紡のメリット
  if (warpYarn.category === 'blend' && warpYarn.blendAdvantages) {
    points.push({
      category: '素材',
      title: '素材のいいとこ取り',
      description: warpYarn.blendAdvantages.join('、'),
      appeal: 'functional',
    });
  }

  // コーマ糸
  if (warpYarn.id?.includes('combed')) {
    points.push({
      category: '素材',
      title: 'コーマ糸の滑らかさ',
      description: '短繊維を除去したコーマ糸による毛羽立ちの少ない上質な生地',
      appeal: 'quality',
    });
  }

  // マーセライズ
  if (warpYarn.id?.includes('mercerized')) {
    points.push({
      category: '素材',
      title: 'シルケット加工の光沢',
      description: 'シルクのような美しい光沢と優れた染色性',
      appeal: 'aesthetic',
    });
  }
}

function generateWeaveSellingPoints(points, weave) {
  // 織り組織の特徴
  const characteristics = weave.characteristics || {};

  if (characteristics.drape >= 4) {
    points.push({
      category: '織り',
      title: '優美なドレープ性',
      description: '美しく流れ落ちるドレープで上品なシルエットを演出',
      appeal: 'aesthetic',
    });
  }

  if (characteristics.durability >= 4) {
    points.push({
      category: '織り',
      title: '長く愛せる丈夫さ',
      description: '耐久性に優れた織り構造で長くご使用いただけます',
      appeal: 'practical',
    });
  }

  if (characteristics.breathability >= 4) {
    points.push({
      category: '織り',
      title: '通気性の良さ',
      description: '風通しの良い織り構造で快適な着心地',
      appeal: 'comfort',
    });
  }

  if (characteristics.shine >= 4) {
    points.push({
      category: '織り',
      title: '上品な光沢感',
      description: '織り構造が生み出す美しい光沢',
      appeal: 'aesthetic',
    });
  }

  if (characteristics.wrinkleResistance >= 4) {
    points.push({
      category: '織り',
      title: 'シワになりにくい',
      description: 'お手入れ簡単、シワになりにくい織り構造',
      appeal: 'practical',
    });
  }

  // 特殊織りの訴求
  if (weave.category === 'jacquard') {
    points.push({
      category: '織り',
      title: 'ジャカード織の芸術性',
      description: '織りで表現される繊細で美しい模様',
      appeal: 'aesthetic',
    });
  }

  if (weave.id === 'herringbone') {
    points.push({
      category: '織り',
      title: 'ヘリンボーンの伝統美',
      description: 'クラシックな魚の骨模様がエレガントな印象に',
      appeal: 'tradition',
    });
  }

  if (weave.id === 'oxford') {
    points.push({
      category: '織り',
      title: 'オックスフォードの信頼感',
      description: '名門大学の名を冠した上質カジュアルの定番',
      appeal: 'tradition',
    });
  }
}

function generateFunctionalSellingPoints(points, warpYarn, weftYarn) {
  // ストレッチ性
  const hasStretch = warpYarn.composition?.some(c => c.fiber === 'spandex') ||
                     weftYarn?.composition?.some(c => c.fiber === 'spandex');
  if (hasStretch) {
    points.push({
      category: '機能',
      title: '快適なストレッチ性',
      description: '動きやすさを追求したストレッチ素材',
      appeal: 'comfort',
    });
  }

  // 速乾性
  if (warpYarn.specialProperties?.includes('quick_dry') ||
      warpYarn.specialProperties?.includes('moisture_wicking')) {
    points.push({
      category: '機能',
      title: '吸汗速乾',
      description: '汗を素早く吸収・発散して快適さをキープ',
      appeal: 'functional',
    });
  }

  // 保温性
  if (warpYarn.specialProperties?.includes('insulation')) {
    points.push({
      category: '機能',
      title: '軽くて暖かい',
      description: '軽量でありながら優れた保温性を発揮',
      appeal: 'functional',
    });
  }

  // 温度調節
  if (warpYarn.specialProperties?.includes('temperature_regulation')) {
    points.push({
      category: '機能',
      title: '温度調節機能',
      description: '体温に応じて温度を調整、オールシーズン快適',
      appeal: 'functional',
    });
  }

  // 抗菌
  if (warpYarn.specialProperties?.includes('antibacterial')) {
    points.push({
      category: '機能',
      title: '抗菌・防臭',
      description: '菌の繁殖を抑え、いつでも清潔',
      appeal: 'functional',
    });
  }

  // 吸湿性（天然繊維）
  if (warpYarn.characteristics?.absorbency >= 4) {
    points.push({
      category: '機能',
      title: '優れた吸湿性',
      description: '汗をしっかり吸収してサラッと快適',
      appeal: 'comfort',
    });
  }
}

function generateSustainabilityPoints(points, warpYarn, weftYarn) {
  // オーガニック認証
  const certifications = [...(warpYarn.certifications || []), ...(weftYarn?.certifications || [])];

  if (certifications.includes('GOTS') || certifications.includes('OCS')) {
    points.push({
      category: 'サステナビリティ',
      title: 'オーガニック認証取得',
      description: '環境に配慮したオーガニック素材を使用',
      appeal: 'sustainability',
    });
  }

  if (certifications.includes('FSC')) {
    points.push({
      category: 'サステナビリティ',
      title: 'FSC認証素材',
      description: '持続可能な森林資源から生まれた素材',
      appeal: 'sustainability',
    });
  }

  if (certifications.includes('OEKO-TEX')) {
    points.push({
      category: 'サステナビリティ',
      title: 'エコテックス認証',
      description: '有害物質テスト済みの安心素材',
      appeal: 'safety',
    });
  }

  // 環境配慮型繊維
  if (warpYarn.composition?.some(c => c.fiber === 'lyocell')) {
    points.push({
      category: 'サステナビリティ',
      title: '環境にやさしいテンセル',
      description: '持続可能な方法で生産されたセルロース繊維',
      appeal: 'sustainability',
    });
  }

  if (warpYarn.composition?.some(c => c.fiber === 'hemp')) {
    points.push({
      category: 'サステナビリティ',
      title: 'サステナブルなヘンプ',
      description: '農薬・化学肥料不要で環境負荷の低いヘンプ素材',
      appeal: 'sustainability',
    });
  }
}

function extractKeywords(points, weave, warpYarn, weftYarn) {
  const keywords = new Set();

  // 素材キーワード
  warpYarn.composition?.forEach(c => {
    const fiberNames = {
      cotton: 'コットン',
      linen: 'リネン',
      wool: 'ウール',
      silk: 'シルク',
      polyester: 'ポリエステル',
      nylon: 'ナイロン',
      viscose: 'レーヨン',
      modal: 'モダール',
      lyocell: 'テンセル',
      cashmere: 'カシミヤ',
      merino_wool: 'メリノウール',
      spandex: 'ストレッチ',
    };
    if (fiberNames[c.fiber]) {
      keywords.add(fiberNames[c.fiber]);
    }
  });

  // 織りキーワード
  keywords.add(weave.name);

  // 訴求からキーワード抽出
  points.forEach(p => {
    if (p.appeal === 'luxury') keywords.add('高級感');
    if (p.appeal === 'comfort') keywords.add('快適');
    if (p.appeal === 'practical') keywords.add('実用的');
    if (p.appeal === 'sustainability') keywords.add('サステナブル');
    if (p.appeal === 'functional') keywords.add('機能性');
  });

  return Array.from(keywords);
}

function generateCopyText(points, weave, warpYarn) {
  const luxuryPoints = points.filter(p => p.appeal === 'luxury');
  const comfortPoints = points.filter(p => p.appeal === 'comfort');
  const functionalPoints = points.filter(p => p.appeal === 'functional');

  let copy = '';

  // メイン素材に応じたリード文
  const mainFiber = warpYarn.composition?.[0]?.fiber;
  const fiberLeads = {
    silk: '贅沢なシルクの輝きをまとう',
    cashmere: '極上のカシミヤに包まれる喜び',
    merino_wool: 'メリノウールの上質な柔らかさ',
    cotton: 'コットンの心地よさを日常に',
    linen: 'リネンの涼やかな風合い',
  };

  if (fiberLeads[mainFiber]) {
    copy += fiberLeads[mainFiber] + '。';
  }

  // 織りの特徴
  copy += `${weave.name}ならではの`;
  if (weave.characteristics?.shine >= 4) {
    copy += '美しい光沢と';
  }
  if (weave.characteristics?.drape >= 4) {
    copy += '優雅なドレープ感が';
  } else if (weave.characteristics?.durability >= 4) {
    copy += '確かな品質が';
  }
  copy += '魅力。';

  // 機能性があれば追加
  if (functionalPoints.length > 0) {
    copy += functionalPoints[0].description + '。';
  }

  return copy;
}


/**
 * 目付（GSM）計算
 */
export function calculateGSM(config) {
  const {
    weaveId,
    warpYarnId,
    weftYarnId,
    epi,
    ppi,
    customWarpYarn,
    customWeftYarn,
  } = config;

  const weave = getWeaveById(weaveId);
  const warpYarn = customWarpYarn || getYarnById(warpYarnId);
  const weftYarn = customWeftYarn || getYarnById(weftYarnId) || warpYarn;

  if (!weave || !warpYarn) return null;

  // 糸の太さ（tex）を取得
  const warpTex = warpYarn.count?.tex || (590.5 / (warpYarn.count?.ne || 30));
  const weftTex = weftYarn.count?.tex || warpTex;

  // 基本GSM計算
  // GSM ≈ (EPI × warpTex + PPI × weftTex) × カバーファクター × 織り係数
  const coverFactor = 0.4; // 織物の被覆率（調整可能）
  const weaveModifier = weave.gsmModifier || 1.0;

  let baseGSM = (epi * warpTex * 0.0254 + ppi * weftTex * 0.0254) * coverFactor;
  baseGSM *= weaveModifier;

  // パイル織は追加重量
  if (weave.isPile) {
    const pileMultiplier = weave.pileHeight === 'short' ? 1.3 :
                           weave.pileHeight === 'medium' ? 1.5 :
                           weave.pileHeight === 'loop' ? 1.4 : 1.2;
    baseGSM *= pileMultiplier;
  }

  return {
    gsm: Math.round(baseGSM),
    weight: Math.round(baseGSM * 0.0295), // oz/yd² 参考値
    category: categorizeWeight(baseGSM),
  };
}

function categorizeWeight(gsm) {
  if (gsm < 100) return { name: '極薄地', description: 'ボイル、オーガンジー級' };
  if (gsm < 150) return { name: '薄地', description: 'ブロード、ローン級' };
  if (gsm < 200) return { name: '中薄地', description: '一般シャツ地' };
  if (gsm < 280) return { name: '中厚地', description: 'オックス、ツイル級' };
  if (gsm < 350) return { name: '厚地', description: 'デニム、キャンバス級' };
  return { name: '極厚地', description: 'ヘビーツイル、コート地級' };
}
