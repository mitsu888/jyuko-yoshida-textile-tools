/**
 * 織り組織データベース
 * 30種類以上の織り組織を定義
 * 各組織には描画パターン、特性、推奨用途を含む
 */

// 織り組織のカテゴリ
export const WEAVE_CATEGORIES = {
  PLAIN: { id: 'plain', name: '平織系', description: '最も基本的な織り構造。耐久性が高い。' },
  TWILL: { id: 'twill', name: '綾織系', description: '斜めの畝が特徴。しなやかで光沢がある。' },
  SATIN: { id: 'satin', name: '朱子織系', description: '滑らかな表面。高級感のある光沢。' },
  DOBBY: { id: 'dobby', name: 'ドビー織', description: '小柄な幾何学模様。多様なテクスチャ。' },
  JACQUARD: { id: 'jacquard', name: 'ジャカード', description: '複雑な大柄模様。高度な織り技術。' },
  PILE: { id: 'pile', name: 'パイル織', description: 'ループや毛羽立ち。厚みと保温性。' },
  SPECIAL: { id: 'special', name: '特殊織', description: '独自の構造や効果を持つ織り。' },
};

// 織り組織マトリックス生成ヘルパー
function createMatrix(rows, cols, pattern) {
  const matrix = [];
  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      row.push(pattern(x, y));
    }
    matrix.push(row);
  }
  return matrix;
}

// 織り組織データベース
export const WEAVE_DATABASE = [
  // ============ 平織系 ============
  {
    id: 'plain',
    name: '平織',
    nameEn: 'Plain Weave',
    category: 'plain',
    matrix: createMatrix(2, 2, (x, y) => (x + y) % 2 === 0),
    repeatX: 2,
    repeatY: 2,
    characteristics: {
      durability: 5,
      drape: 2,
      breathability: 5,
      wrinkleResistance: 2,
      shine: 1,
    },
    gsmModifier: 1.0,
    description: '経糸と緯糸が1本ずつ交互に交差する最も基本的な織り。',
    applications: ['シャツ', 'ブラウス', 'ハンカチ', '裏地'],
    productionDifficulty: 1,
  },
  {
    id: 'oxford',
    name: 'オックスフォード',
    nameEn: 'Oxford',
    category: 'plain',
    matrix: createMatrix(4, 4, (x, y) => {
      const px = Math.floor(x / 2);
      const py = Math.floor(y / 2);
      return (px + py) % 2 === 0;
    }),
    repeatX: 4,
    repeatY: 4,
    characteristics: {
      durability: 4,
      drape: 3,
      breathability: 4,
      wrinkleResistance: 3,
      shine: 2,
    },
    gsmModifier: 1.15,
    description: '2本ずつの糸を平織にしたバスケット織の一種。通気性が良く丈夫。',
    applications: ['ボタンダウンシャツ', 'カジュアルシャツ', 'スポーツウェア'],
    productionDifficulty: 2,
  },
  {
    id: 'broadcloth',
    name: 'ブロード',
    nameEn: 'Broadcloth',
    category: 'plain',
    matrix: createMatrix(2, 2, (x, y) => (x + y) % 2 === 0),
    repeatX: 2,
    repeatY: 2,
    characteristics: {
      durability: 4,
      drape: 3,
      breathability: 4,
      wrinkleResistance: 3,
      shine: 3,
    },
    gsmModifier: 0.95,
    description: '高密度平織。経糸密度を高くすることで滑らかで光沢のある表面。',
    applications: ['ドレスシャツ', 'ブラウス', 'フォーマルウェア'],
    productionDifficulty: 2,
  },
  {
    id: 'poplin',
    name: 'ポプリン',
    nameEn: 'Poplin',
    category: 'plain',
    matrix: createMatrix(2, 2, (x, y) => (x + y) % 2 === 0),
    repeatX: 2,
    repeatY: 2,
    characteristics: {
      durability: 4,
      drape: 4,
      breathability: 4,
      wrinkleResistance: 3,
      shine: 3,
    },
    gsmModifier: 0.9,
    description: '経糸を緯糸より細く密にした平織。軽くてなめらか。',
    applications: ['スーツ', 'コート', 'ドレス', 'シャツ'],
    productionDifficulty: 2,
  },
  {
    id: 'chambray',
    name: 'シャンブレー',
    nameEn: 'Chambray',
    category: 'plain',
    matrix: createMatrix(2, 2, (x, y) => (x + y) % 2 === 0),
    repeatX: 2,
    repeatY: 2,
    characteristics: {
      durability: 4,
      drape: 3,
      breathability: 4,
      wrinkleResistance: 2,
      shine: 2,
    },
    gsmModifier: 1.0,
    description: '色経と白緯（または逆）を用いた平織。独特の霜降り調。',
    applications: ['カジュアルシャツ', 'ワークウェア', 'サマードレス'],
    productionDifficulty: 2,
    colorRequirement: 'bicolor',
  },
  {
    id: 'voile',
    name: 'ボイル',
    nameEn: 'Voile',
    category: 'plain',
    matrix: createMatrix(2, 2, (x, y) => (x + y) % 2 === 0),
    repeatX: 2,
    repeatY: 2,
    characteristics: {
      durability: 2,
      drape: 5,
      breathability: 5,
      wrinkleResistance: 1,
      shine: 2,
    },
    gsmModifier: 0.5,
    description: '細番手糸を使用した薄地平織。透け感がある軽やかな生地。',
    applications: ['カーテン', 'スカーフ', 'サマーブラウス'],
    productionDifficulty: 3,
    yarnRequirement: { minNe: 60 },
  },
  {
    id: 'canvas',
    name: '帆布（キャンバス）',
    nameEn: 'Canvas',
    category: 'plain',
    matrix: createMatrix(2, 2, (x, y) => (x + y) % 2 === 0),
    repeatX: 2,
    repeatY: 2,
    characteristics: {
      durability: 5,
      drape: 1,
      breathability: 3,
      wrinkleResistance: 4,
      shine: 1,
    },
    gsmModifier: 2.0,
    description: '太い糸を高密度で織った堅牢な平織。',
    applications: ['バッグ', 'テント', 'スニーカー', '作業着'],
    productionDifficulty: 2,
    yarnRequirement: { maxNe: 20 },
  },
  {
    id: 'ripstop',
    name: 'リップストップ',
    nameEn: 'Ripstop',
    category: 'plain',
    matrix: createMatrix(8, 8, (x, y) => {
      if (x % 8 === 0 || y % 8 === 0) return true;
      return (x + y) % 2 === 0;
    }),
    repeatX: 8,
    repeatY: 8,
    characteristics: {
      durability: 5,
      drape: 3,
      breathability: 4,
      wrinkleResistance: 4,
      shine: 2,
    },
    gsmModifier: 1.1,
    description: '一定間隔で補強糸を入れた平織。引き裂き強度が高い。',
    applications: ['アウトドアウェア', 'パラシュート', 'バックパック'],
    productionDifficulty: 3,
  },

  // ============ 綾織系 ============
  {
    id: 'twill_2_1',
    name: '2/1ツイル',
    nameEn: '2/1 Twill',
    category: 'twill',
    matrix: createMatrix(3, 3, (x, y) => {
      const pos = (x + y) % 3;
      return pos < 2;
    }),
    repeatX: 3,
    repeatY: 3,
    twillAngle: 63,
    characteristics: {
      durability: 4,
      drape: 4,
      breathability: 3,
      wrinkleResistance: 3,
      shine: 3,
    },
    gsmModifier: 1.05,
    description: '経糸2本・緯糸1本の比率で綾目を形成。',
    applications: ['チノパン', 'ジャケット', 'ユニフォーム'],
    productionDifficulty: 2,
  },
  {
    id: 'twill_2_2',
    name: '2/2ツイル',
    nameEn: '2/2 Twill',
    category: 'twill',
    matrix: createMatrix(4, 4, (x, y) => {
      const pos = (x + y) % 4;
      return pos < 2;
    }),
    repeatX: 4,
    repeatY: 4,
    twillAngle: 45,
    characteristics: {
      durability: 4,
      drape: 4,
      breathability: 3,
      wrinkleResistance: 4,
      shine: 3,
    },
    gsmModifier: 1.1,
    description: '均等な2/2綾。表裏同じ外観。',
    applications: ['スーツ', 'コート', 'スカート'],
    productionDifficulty: 2,
  },
  {
    id: 'twill_3_1',
    name: '3/1ツイル',
    nameEn: '3/1 Twill',
    category: 'twill',
    matrix: createMatrix(4, 4, (x, y) => {
      const pos = (x + y) % 4;
      return pos < 3;
    }),
    repeatX: 4,
    repeatY: 4,
    twillAngle: 63,
    characteristics: {
      durability: 4,
      drape: 4,
      breathability: 3,
      wrinkleResistance: 4,
      shine: 4,
    },
    gsmModifier: 1.1,
    description: '経糸3本・緯糸1本。表面に経糸が多く出る。',
    applications: ['デニム', 'チノ', 'ワークウェア'],
    productionDifficulty: 2,
  },
  {
    id: 'denim',
    name: 'デニム（右綾）',
    nameEn: 'Denim (Right-hand Twill)',
    category: 'twill',
    matrix: createMatrix(4, 4, (x, y) => {
      const pos = (x - y + 4) % 4;
      return pos < 3;
    }),
    repeatX: 4,
    repeatY: 4,
    twillAngle: -63,
    characteristics: {
      durability: 5,
      drape: 2,
      breathability: 3,
      wrinkleResistance: 3,
      shine: 2,
    },
    gsmModifier: 1.4,
    description: 'インディゴ経糸と白緯糸を使った右上がり3/1綾織。',
    applications: ['ジーンズ', 'ジャケット', 'バッグ'],
    productionDifficulty: 2,
    colorRequirement: 'indigoDenim',
  },
  {
    id: 'denim_left',
    name: 'デニム（左綾）',
    nameEn: 'Denim (Left-hand Twill)',
    category: 'twill',
    matrix: createMatrix(4, 4, (x, y) => {
      const pos = (x + y) % 4;
      return pos < 3;
    }),
    repeatX: 4,
    repeatY: 4,
    twillAngle: 63,
    characteristics: {
      durability: 5,
      drape: 2,
      breathability: 3,
      wrinkleResistance: 3,
      shine: 2,
    },
    gsmModifier: 1.4,
    description: '左上がりの綾織デニム。右綾よりソフトな風合い。',
    applications: ['ジーンズ', 'カジュアルウェア'],
    productionDifficulty: 2,
    colorRequirement: 'indigoDenim',
  },
  {
    id: 'broken_twill',
    name: 'ブロークンツイル',
    nameEn: 'Broken Twill',
    category: 'twill',
    matrix: createMatrix(8, 4, (x, y) => {
      const section = Math.floor(x / 4);
      if (section % 2 === 0) {
        return ((x + y) % 4) < 2;
      } else {
        return ((x - y + 4) % 4) < 2;
      }
    }),
    repeatX: 8,
    repeatY: 4,
    twillAngle: 0,
    characteristics: {
      durability: 5,
      drape: 3,
      breathability: 3,
      wrinkleResistance: 4,
      shine: 2,
    },
    gsmModifier: 1.35,
    description: '綾目が途中で反転するジグザグ模様。ねじれ防止効果。',
    applications: ['ジーンズ', 'ワークウェア'],
    productionDifficulty: 3,
  },
  {
    id: 'herringbone',
    name: 'ヘリンボーン',
    nameEn: 'Herringbone',
    category: 'twill',
    matrix: createMatrix(8, 8, (x, y) => {
      const period = 4;
      const xMod = x % (period * 2);
      const offset = xMod < period ? xMod : (period * 2 - 1 - xMod);
      return ((y + offset) % 4) < 2;
    }),
    repeatX: 8,
    repeatY: 8,
    characteristics: {
      durability: 4,
      drape: 4,
      breathability: 3,
      wrinkleResistance: 4,
      shine: 3,
    },
    gsmModifier: 1.15,
    description: '魚の骨のようなV字パターン。クラシックな印象。',
    applications: ['スーツ', 'コート', 'ジャケット', 'ブレザー'],
    productionDifficulty: 3,
  },
  {
    id: 'gabardine',
    name: 'ギャバジン',
    nameEn: 'Gabardine',
    category: 'twill',
    matrix: createMatrix(4, 4, (x, y) => {
      const pos = (x + y * 2) % 4;
      return pos < 2;
    }),
    repeatX: 4,
    repeatY: 4,
    twillAngle: 63,
    characteristics: {
      durability: 5,
      drape: 3,
      breathability: 3,
      wrinkleResistance: 5,
      shine: 4,
    },
    gsmModifier: 1.2,
    description: '急角度の綾目が特徴。耐久性が高く、シワになりにくい。',
    applications: ['トレンチコート', 'スーツ', 'パンツ'],
    productionDifficulty: 3,
  },
  {
    id: 'cavalry_twill',
    name: 'カバルリーツイル',
    nameEn: 'Cavalry Twill',
    category: 'twill',
    matrix: createMatrix(6, 6, (x, y) => {
      const pos = (x * 2 + y) % 6;
      return pos < 4;
    }),
    repeatX: 6,
    repeatY: 6,
    twillAngle: 63,
    characteristics: {
      durability: 5,
      drape: 3,
      breathability: 3,
      wrinkleResistance: 5,
      shine: 3,
    },
    gsmModifier: 1.25,
    description: '二重の斜め畝が特徴。乗馬服に由来。',
    applications: ['乗馬パンツ', 'ジャケット', 'スラックス'],
    productionDifficulty: 4,
  },
  {
    id: 'whipcord',
    name: 'ウィップコード',
    nameEn: 'Whipcord',
    category: 'twill',
    matrix: createMatrix(4, 4, (x, y) => {
      const pos = (x + y * 2) % 4;
      return pos < 3;
    }),
    repeatX: 4,
    repeatY: 4,
    twillAngle: 75,
    characteristics: {
      durability: 5,
      drape: 2,
      breathability: 3,
      wrinkleResistance: 5,
      shine: 3,
    },
    gsmModifier: 1.3,
    description: '急勾配で明瞭な斜め畝。非常に丈夫。',
    applications: ['ユニフォーム', '乗馬服', 'アウトドアウェア'],
    productionDifficulty: 4,
  },

  // ============ 朱子織系 ============
  {
    id: 'satin_5',
    name: '5枚朱子',
    nameEn: '5-Shaft Satin',
    category: 'satin',
    matrix: createMatrix(5, 5, (x, y) => {
      return (x + y * 2) % 5 === 0;
    }),
    repeatX: 5,
    repeatY: 5,
    characteristics: {
      durability: 2,
      drape: 5,
      breathability: 3,
      wrinkleResistance: 2,
      shine: 5,
    },
    gsmModifier: 1.0,
    description: '5本飛びの朱子織。光沢があり滑らか。',
    applications: ['ドレス', 'スカーフ', 'ネクタイ', '裏地'],
    productionDifficulty: 3,
  },
  {
    id: 'satin_8',
    name: '8枚朱子',
    nameEn: '8-Shaft Satin',
    category: 'satin',
    matrix: createMatrix(8, 8, (x, y) => {
      return (x + y * 3) % 8 === 0;
    }),
    repeatX: 8,
    repeatY: 8,
    characteristics: {
      durability: 2,
      drape: 5,
      breathability: 3,
      wrinkleResistance: 2,
      shine: 5,
    },
    gsmModifier: 1.05,
    description: '8本飛びのより滑らかな朱子織。',
    applications: ['イブニングドレス', '高級裏地', 'リボン'],
    productionDifficulty: 4,
  },
  {
    id: 'sateen',
    name: 'サテン（緯朱子）',
    nameEn: 'Sateen',
    category: 'satin',
    matrix: createMatrix(5, 5, (x, y) => {
      return (y + x * 2) % 5 === 0;
    }),
    repeatX: 5,
    repeatY: 5,
    characteristics: {
      durability: 3,
      drape: 5,
      breathability: 3,
      wrinkleResistance: 2,
      shine: 4,
    },
    gsmModifier: 1.0,
    description: '緯糸が表面に多く出る朱子織。コットンでよく使用。',
    applications: ['シーツ', 'ピローケース', 'カーテン'],
    productionDifficulty: 3,
  },
  {
    id: 'crepe_back_satin',
    name: 'クレープバックサテン',
    nameEn: 'Crepe Back Satin',
    category: 'satin',
    matrix: createMatrix(5, 5, (x, y) => {
      return (x + y * 2) % 5 === 0;
    }),
    repeatX: 5,
    repeatY: 5,
    characteristics: {
      durability: 3,
      drape: 5,
      breathability: 3,
      wrinkleResistance: 3,
      shine: 4,
    },
    gsmModifier: 1.1,
    description: '表が光沢のサテン、裏がクレープ調のリバーシブル。',
    applications: ['ドレス', 'ブラウス', 'スカーフ'],
    productionDifficulty: 4,
  },

  // ============ ドビー織 ============
  {
    id: 'dobby_diamond',
    name: 'ドビーダイヤ',
    nameEn: 'Dobby Diamond',
    category: 'dobby',
    matrix: createMatrix(8, 8, (x, y) => {
      const cx = Math.abs(x - 3.5);
      const cy = Math.abs(y - 3.5);
      return (cx + cy) < 3;
    }),
    repeatX: 8,
    repeatY: 8,
    characteristics: {
      durability: 4,
      drape: 3,
      breathability: 4,
      wrinkleResistance: 3,
      shine: 2,
    },
    gsmModifier: 1.05,
    description: 'ダイヤ柄の小紋ドビー。',
    applications: ['シャツ', 'ブラウス', 'ネクタイ'],
    productionDifficulty: 4,
  },
  {
    id: 'dobby_dot',
    name: 'ドビードット',
    nameEn: 'Dobby Dot',
    category: 'dobby',
    matrix: createMatrix(6, 6, (x, y) => {
      return (x === 2 || x === 3) && (y === 2 || y === 3);
    }),
    repeatX: 6,
    repeatY: 6,
    characteristics: {
      durability: 4,
      drape: 3,
      breathability: 4,
      wrinkleResistance: 3,
      shine: 2,
    },
    gsmModifier: 1.0,
    description: '規則的なドットパターン。',
    applications: ['シャツ', 'ブラウス', 'ハンカチ'],
    productionDifficulty: 3,
  },
  {
    id: 'pique',
    name: 'ピケ',
    nameEn: 'Piqué',
    category: 'dobby',
    matrix: createMatrix(4, 4, (x, y) => {
      return y % 2 === 0;
    }),
    repeatX: 4,
    repeatY: 4,
    characteristics: {
      durability: 4,
      drape: 2,
      breathability: 5,
      wrinkleResistance: 4,
      shine: 2,
    },
    gsmModifier: 1.15,
    description: '畝のある立体的なテクスチャ。',
    applications: ['ポロシャツ', 'スポーツウェア', '子供服'],
    productionDifficulty: 3,
  },
  {
    id: 'waffle',
    name: 'ワッフル',
    nameEn: 'Waffle Weave',
    category: 'dobby',
    matrix: createMatrix(8, 8, (x, y) => {
      const zone = (Math.floor(x / 4) + Math.floor(y / 4)) % 2;
      if (zone === 0) {
        return (x % 4 < 2) === (y % 4 < 2);
      } else {
        return (x % 4 >= 2) === (y % 4 >= 2);
      }
    }),
    repeatX: 8,
    repeatY: 8,
    characteristics: {
      durability: 3,
      drape: 3,
      breathability: 5,
      wrinkleResistance: 2,
      shine: 1,
    },
    gsmModifier: 1.3,
    description: 'ワッフル状の凹凸。吸水性が高い。',
    applications: ['タオル', 'バスローブ', 'カジュアルウェア'],
    productionDifficulty: 4,
  },
  {
    id: 'houndstooth',
    name: '千鳥格子',
    nameEn: 'Houndstooth',
    category: 'dobby',
    matrix: createMatrix(8, 8, (x, y) => {
      const block = 4;
      const bx = Math.floor(x / block);
      const by = Math.floor(y / block);
      const lx = x % block;
      const ly = y % block;
      if ((bx + by) % 2 === 0) {
        return lx < 2 || ly < 2;
      } else {
        return lx >= 2 && ly >= 2;
      }
    }),
    repeatX: 8,
    repeatY: 8,
    characteristics: {
      durability: 4,
      drape: 3,
      breathability: 3,
      wrinkleResistance: 4,
      shine: 2,
    },
    gsmModifier: 1.1,
    description: '犬の歯に似た特徴的なパターン。',
    applications: ['ジャケット', 'コート', 'スカート', 'パンツ'],
    productionDifficulty: 4,
  },
  {
    id: 'birds_eye',
    name: 'バーズアイ',
    nameEn: "Bird's Eye",
    category: 'dobby',
    matrix: createMatrix(4, 4, (x, y) => {
      const cx = x % 4;
      const cy = y % 4;
      return (cx === 1 || cx === 2) && (cy === 1 || cy === 2);
    }),
    repeatX: 4,
    repeatY: 4,
    characteristics: {
      durability: 4,
      drape: 3,
      breathability: 4,
      wrinkleResistance: 3,
      shine: 2,
    },
    gsmModifier: 1.05,
    description: '鳥の目のような小さな菱形模様。',
    applications: ['タオル', 'おむつ', 'ドレスシャツ'],
    productionDifficulty: 3,
  },
  {
    id: 'dobby_stripe',
    name: 'ドビーストライプ',
    nameEn: 'Dobby Stripe',
    category: 'dobby',
    matrix: createMatrix(8, 2, (x, y) => {
      const pattern = [1, 1, 0, 0, 1, 0, 1, 0];
      return pattern[x % 8] === 1;
    }),
    repeatX: 8,
    repeatY: 2,
    characteristics: {
      durability: 4,
      drape: 3,
      breathability: 4,
      wrinkleResistance: 3,
      shine: 2,
    },
    gsmModifier: 1.0,
    description: 'ドビー機構で作られた変化のあるストライプ。',
    applications: ['ドレスシャツ', 'タイ', 'スカーフ'],
    productionDifficulty: 3,
  },

  // ============ ジャカード ============
  {
    id: 'jacquard_damask',
    name: 'ダマスク',
    nameEn: 'Damask',
    category: 'jacquard',
    matrix: createMatrix(16, 16, (x, y) => {
      // Simplified damask-like pattern
      const cx = Math.abs(x - 7.5);
      const cy = Math.abs(y - 7.5);
      const diamond = cx + cy < 6;
      const dots = (x % 4 === 0 && y % 4 === 0);
      return diamond || dots;
    }),
    repeatX: 16,
    repeatY: 16,
    characteristics: {
      durability: 4,
      drape: 4,
      breathability: 3,
      wrinkleResistance: 3,
      shine: 4,
    },
    gsmModifier: 1.2,
    description: '対照的な織りで模様を表現する伝統的なジャカード織。',
    applications: ['テーブルクロス', 'ナプキン', 'カーテン', 'ドレス'],
    productionDifficulty: 5,
  },
  {
    id: 'jacquard_paisley',
    name: 'ペイズリー',
    nameEn: 'Paisley',
    category: 'jacquard',
    matrix: createMatrix(16, 16, (x, y) => {
      // Simplified paisley-like teardrop
      const cx = x - 8;
      const cy = y - 8;
      const angle = Math.atan2(cy, cx);
      const dist = Math.sqrt(cx * cx + cy * cy);
      const targetDist = 5 + 2 * Math.sin(angle * 2);
      return dist < targetDist;
    }),
    repeatX: 16,
    repeatY: 16,
    characteristics: {
      durability: 3,
      drape: 4,
      breathability: 3,
      wrinkleResistance: 3,
      shine: 3,
    },
    gsmModifier: 1.15,
    description: 'ペイズリー模様のジャカード織。',
    applications: ['ネクタイ', 'スカーフ', 'ドレス', '装飾品'],
    productionDifficulty: 5,
  },
  {
    id: 'brocade',
    name: 'ブロケード',
    nameEn: 'Brocade',
    category: 'jacquard',
    matrix: createMatrix(12, 12, (x, y) => {
      // Raised pattern simulation
      const floral = Math.sin(x * 0.8) * Math.cos(y * 0.8) > 0.3;
      const background = (x + y) % 3 === 0;
      return floral || background;
    }),
    repeatX: 12,
    repeatY: 12,
    characteristics: {
      durability: 3,
      drape: 3,
      breathability: 2,
      wrinkleResistance: 4,
      shine: 5,
    },
    gsmModifier: 1.4,
    description: '浮き上がった装飾模様が特徴の豪華な織物。',
    applications: ['フォーマルウェア', 'カーテン', '家具', '民族衣装'],
    productionDifficulty: 5,
  },

  // ============ パイル織 ============
  {
    id: 'velvet',
    name: 'ベルベット',
    nameEn: 'Velvet',
    category: 'pile',
    matrix: createMatrix(4, 4, (x, y) => {
      return y % 2 === 0;
    }),
    repeatX: 4,
    repeatY: 4,
    isPile: true,
    pileHeight: 'short',
    characteristics: {
      durability: 3,
      drape: 4,
      breathability: 2,
      wrinkleResistance: 2,
      shine: 4,
    },
    gsmModifier: 1.8,
    description: '短いパイルが密に立つ高級感のある生地。',
    applications: ['ドレス', 'ジャケット', 'カーテン', '家具'],
    productionDifficulty: 5,
  },
  {
    id: 'corduroy',
    name: 'コーデュロイ',
    nameEn: 'Corduroy',
    category: 'pile',
    matrix: createMatrix(8, 4, (x, y) => {
      const stripe = x % 8;
      return stripe < 4 && y % 2 === 0;
    }),
    repeatX: 8,
    repeatY: 4,
    isPile: true,
    pileHeight: 'medium',
    characteristics: {
      durability: 4,
      drape: 3,
      breathability: 3,
      wrinkleResistance: 3,
      shine: 2,
    },
    gsmModifier: 1.6,
    description: '縦畝のパイル織。カジュアルで暖かみがある。',
    applications: ['パンツ', 'ジャケット', 'スカート', '子供服'],
    productionDifficulty: 4,
    waleOptions: [8, 11, 14, 16, 21], // wales per inch
  },
  {
    id: 'terry',
    name: 'テリー（タオル地）',
    nameEn: 'Terry Cloth',
    category: 'pile',
    matrix: createMatrix(4, 4, (x, y) => {
      return true; // All loops
    }),
    repeatX: 4,
    repeatY: 4,
    isPile: true,
    pileHeight: 'loop',
    characteristics: {
      durability: 4,
      drape: 2,
      breathability: 5,
      wrinkleResistance: 2,
      shine: 1,
    },
    gsmModifier: 2.0,
    description: 'ループパイルで吸水性が高い。',
    applications: ['タオル', 'バスローブ', 'スポーツウェア'],
    productionDifficulty: 3,
  },

  // ============ 特殊織 ============
  {
    id: 'leno',
    name: '絡み織（レノ）',
    nameEn: 'Leno Weave',
    category: 'special',
    matrix: createMatrix(4, 4, (x, y) => {
      return x % 2 === 0;
    }),
    repeatX: 4,
    repeatY: 4,
    characteristics: {
      durability: 3,
      drape: 4,
      breathability: 5,
      wrinkleResistance: 2,
      shine: 2,
    },
    gsmModifier: 0.7,
    description: '経糸同士が絡み合う透かし織。',
    applications: ['カーテン', 'スカーフ', '夏物'],
    productionDifficulty: 4,
  },
  {
    id: 'double_cloth',
    name: '二重織',
    nameEn: 'Double Cloth',
    category: 'special',
    matrix: createMatrix(8, 8, (x, y) => {
      const layer = Math.floor(y / 4);
      if (layer === 0) {
        return (x + y) % 2 === 0;
      } else {
        return (x + y) % 2 === 1;
      }
    }),
    repeatX: 8,
    repeatY: 8,
    characteristics: {
      durability: 5,
      drape: 2,
      breathability: 2,
      wrinkleResistance: 4,
      shine: 2,
    },
    gsmModifier: 2.0,
    description: '2層の布を同時に織り上げる。リバーシブル可能。',
    applications: ['コート', 'ジャケット', 'ブランケット'],
    productionDifficulty: 5,
  },
  {
    id: 'crepe',
    name: 'クレープ',
    nameEn: 'Crepe',
    category: 'special',
    matrix: createMatrix(4, 4, (x, y) => {
      // Irregular pattern for crinkled effect
      const noise = Math.sin(x * 3.7) * Math.cos(y * 2.3);
      return noise > 0;
    }),
    repeatX: 4,
    repeatY: 4,
    characteristics: {
      durability: 3,
      drape: 5,
      breathability: 4,
      wrinkleResistance: 1,
      shine: 2,
    },
    gsmModifier: 0.9,
    description: 'シボ（しわ）のある独特の風合い。',
    applications: ['ドレス', 'ブラウス', 'スカーフ'],
    productionDifficulty: 4,
    yarnRequirement: { crepeYarn: true },
  },
  {
    id: 'seersucker',
    name: 'シアサッカー',
    nameEn: 'Seersucker',
    category: 'special',
    matrix: createMatrix(8, 4, (x, y) => {
      const zone = Math.floor(x / 4) % 2;
      if (zone === 0) {
        return (x + y) % 2 === 0;
      } else {
        return y % 2 === 0;
      }
    }),
    repeatX: 8,
    repeatY: 4,
    characteristics: {
      durability: 4,
      drape: 3,
      breathability: 5,
      wrinkleResistance: 4,
      shine: 1,
    },
    gsmModifier: 1.0,
    description: '交互に平坦部と波打つ部分がある。涼しげで夏向き。',
    applications: ['夏物スーツ', 'シャツ', 'パジャマ'],
    productionDifficulty: 4,
  },
  {
    id: 'ottoman',
    name: 'オットマン',
    nameEn: 'Ottoman',
    category: 'special',
    matrix: createMatrix(2, 6, (x, y) => {
      return y < 3;
    }),
    repeatX: 2,
    repeatY: 6,
    characteristics: {
      durability: 4,
      drape: 2,
      breathability: 3,
      wrinkleResistance: 4,
      shine: 3,
    },
    gsmModifier: 1.3,
    description: '太い横畝が特徴のしっかりした生地。',
    applications: ['ジャケット', 'コート', 'インテリア'],
    productionDifficulty: 3,
  },
  {
    id: 'honeycomb',
    name: 'ハニカム',
    nameEn: 'Honeycomb',
    category: 'special',
    matrix: createMatrix(12, 12, (x, y) => {
      // Hexagonal pattern approximation
      const hx = x % 6;
      const hy = y % 6;
      const offset = Math.floor(y / 6) % 2 === 0 ? 0 : 3;
      const ax = (x + offset) % 6;
      return !((ax === 2 || ax === 3) && (hy === 2 || hy === 3));
    }),
    repeatX: 12,
    repeatY: 12,
    characteristics: {
      durability: 4,
      drape: 3,
      breathability: 5,
      wrinkleResistance: 3,
      shine: 1,
    },
    gsmModifier: 1.2,
    description: '蜂の巣状の立体構造。吸水性と保温性が高い。',
    applications: ['タオル', '寝具', 'スポーツウェア'],
    productionDifficulty: 4,
  },
  {
    id: 'mock_leno',
    name: 'モックレノ',
    nameEn: 'Mock Leno',
    category: 'special',
    matrix: createMatrix(6, 6, (x, y) => {
      // Creates open areas without actual crossing
      return !((x % 3 === 1) && (y % 3 === 1));
    }),
    repeatX: 6,
    repeatY: 6,
    characteristics: {
      durability: 3,
      drape: 4,
      breathability: 5,
      wrinkleResistance: 2,
      shine: 2,
    },
    gsmModifier: 0.8,
    description: 'レノ織に似た透かし効果を平織で実現。',
    applications: ['夏物', 'カーテン', 'インテリア'],
    productionDifficulty: 2,
  },
];

// カテゴリ別に織りを取得
export function getWeavesByCategory(categoryId) {
  return WEAVE_DATABASE.filter(w => w.category === categoryId);
}

// IDで織りを取得
export function getWeaveById(weaveId) {
  return WEAVE_DATABASE.find(w => w.id === weaveId);
}

// 用途で織りを検索
export function searchWeavesByApplication(application) {
  return WEAVE_DATABASE.filter(w =>
    w.applications.some(app =>
      app.toLowerCase().includes(application.toLowerCase())
    )
  );
}

// 特性でフィルタリング
export function filterWeavesByCharacteristics(minValues) {
  return WEAVE_DATABASE.filter(weave => {
    for (const [key, minVal] of Object.entries(minValues)) {
      if (weave.characteristics[key] < minVal) return false;
    }
    return true;
  });
}
