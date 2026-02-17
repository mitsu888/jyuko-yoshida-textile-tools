import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { WEAVE_DATABASE, WEAVE_CATEGORIES, getWeaveById } from "./data/weaveDatabase";
import { YARN_DATABASE, FIBER_CATEGORIES, getYarnById, getCompositionString } from "./data/yarnDatabase";
import { analyzeProductionRisks, generateSellingPoints, calculateGSM, RISK_LEVELS } from "./utils/productionAnalysis";

// --- Preset color swatches
const SWATCHES = [
  "#000000","#ffffff","#c1121f","#2a6f97","#1d3557","#457b9d","#e9c46a","#f4a261","#e76f51","#264653",
  "#4f772d","#90a955","#8a5a44","#6a4c93","#b5179e","#7209b7","#560bad","#480ca8","#3a0ca3","#4361ee",
  "#4895ef","#4cc9f0","#118ab2","#06d6a0","#ffd166","#ef476f","#073b4c","#f72585","#3a5a40","#bc6c25"
];

const PATTERNS = [
  { key: "check", label: "チェック" },
  { key: "stripe", label: "ストライプ" },
  { key: "solid", label: "無地(織目のみ)" }
];

// --- Draw functions
function drawFabric({ ctx, w, h, pattern, pitch, warpColors, weftColors, weave, zoom }) {
  ctx.clearRect(0, 0, w, h);

  const scaledPitch = pitch * zoom;
  const matrix = weave.matrix;
  const repeatX = weave.repeatX;
  const repeatY = weave.repeatY;

  // Draw based on pattern type
  if (pattern === "solid") {
    drawWeavePattern(ctx, w, h, matrix, repeatX, repeatY, warpColors[0], weftColors[0], scaledPitch);
  } else if (pattern === "stripe") {
    drawStripePattern(ctx, w, h, matrix, repeatX, repeatY, warpColors, weftColors, scaledPitch);
  } else if (pattern === "check") {
    drawCheckPattern(ctx, w, h, matrix, repeatX, repeatY, warpColors, weftColors, scaledPitch);
  }
}

function drawWeavePattern(ctx, w, h, matrix, repeatX, repeatY, warpColor, weftColor, pitch) {
  const cellW = pitch / repeatX;
  const cellH = pitch / repeatY;

  for (let y = 0; y < h; y += cellH) {
    for (let x = 0; x < w; x += cellW) {
      const mx = Math.floor((x / cellW) % repeatX);
      const my = Math.floor((y / cellH) % repeatY);
      const isWarp = matrix[my]?.[mx] ?? true;

      ctx.fillStyle = isWarp ? warpColor : weftColor;
      ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);

      // Add subtle texture
      ctx.fillStyle = isWarp ? withAlpha(weftColor, 0.1) : withAlpha(warpColor, 0.1);
      ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);
    }
  }
}

function drawStripePattern(ctx, w, h, matrix, repeatX, repeatY, warpColors, weftColors, pitch) {
  const stripeWidth = pitch;
  const cellW = pitch / repeatX;
  const cellH = pitch / repeatY;

  for (let y = 0; y < h; y += cellH) {
    for (let x = 0; x < w; x += cellW) {
      const stripeIdx = Math.floor(x / stripeWidth) % warpColors.length;
      const warpColor = warpColors[stripeIdx];
      const weftColor = weftColors[0];

      const mx = Math.floor((x / cellW) % repeatX);
      const my = Math.floor((y / cellH) % repeatY);
      const isWarp = matrix[my]?.[mx] ?? true;

      ctx.fillStyle = isWarp ? warpColor : weftColor;
      ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);
    }
  }
}

function drawCheckPattern(ctx, w, h, matrix, repeatX, repeatY, warpColors, weftColors, pitch) {
  const cellW = pitch / repeatX;
  const cellH = pitch / repeatY;

  for (let y = 0; y < h; y += cellH) {
    for (let x = 0; x < w; x += cellW) {
      const warpStripeIdx = Math.floor(x / pitch) % warpColors.length;
      const weftStripeIdx = Math.floor(y / pitch) % weftColors.length;

      const warpColor = warpColors[warpStripeIdx];
      const weftColor = weftColors[weftStripeIdx];

      const mx = Math.floor((x / cellW) % repeatX);
      const my = Math.floor((y / cellH) % repeatY);
      const isWarp = matrix[my]?.[mx] ?? true;

      // Blend colors at intersections
      if (warpStripeIdx === weftStripeIdx) {
        ctx.fillStyle = isWarp ? warpColor : weftColor;
      } else {
        ctx.fillStyle = isWarp ? warpColor : weftColor;
      }
      ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);
    }
  }
}

function withAlpha(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function hexToRgb(hex) {
  const c = hex.replace('#','');
  const bigint = parseInt(c.length === 3 ? c.split('').map(x=>x+x).join('') : c, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

// --- Main App Component
export default function App() {
  // Pattern & Weave
  const [pattern, setPattern] = useState("check");
  const [weaveId, setWeaveId] = useState("oxford");
  const [weaveCategory, setWeaveCategory] = useState("plain");

  // Colors
  const [warpColors, setWarpColors] = useState(["#1d3557", "#e76f51"]);
  const [weftColors, setWeftColors] = useState(["#ffffff", "#e9c46a"]);
  const [editingColorIndex, setEditingColorIndex] = useState({ type: null, index: null });

  // Yarn
  const [warpYarnId, setWarpYarnId] = useState("cotton_combed_40");
  const [weftYarnId, setWeftYarnId] = useState("cotton_combed_40");
  const [yarnCategory, setYarnCategory] = useState("cotton");

  // Custom Yarn
  const [showCustomYarnModal, setShowCustomYarnModal] = useState(false);
  const [customYarnTarget, setCustomYarnTarget] = useState(null);
  const [customWarpYarn, setCustomWarpYarn] = useState(null);
  const [customWeftYarn, setCustomWeftYarn] = useState(null);

  // Fabric specs
  const [pitch, setPitch] = useState(28);
  const [epi, setEpi] = useState(110);
  const [ppi, setPpi] = useState(90);
  const [zoom, setZoom] = useState(1);

  // UI State
  const [activeTab, setActiveTab] = useState("design");
  const [showRiskPanel, setShowRiskPanel] = useState(false);
  const [showSellingPointsPanel, setShowSellingPointsPanel] = useState(false);

  const canvasRef = useRef(null);

  // Get current weave
  const currentWeave = useMemo(() => getWeaveById(weaveId), [weaveId]);
  const currentWarpYarn = useMemo(() => customWarpYarn || getYarnById(warpYarnId), [warpYarnId, customWarpYarn]);
  const currentWeftYarn = useMemo(() => customWeftYarn || getYarnById(weftYarnId), [weftYarnId, customWeftYarn]);

  // Filtered weaves by category
  const filteredWeaves = useMemo(() =>
    WEAVE_DATABASE.filter(w => w.category === weaveCategory),
    [weaveCategory]
  );

  // Filtered yarns by category
  const filteredYarns = useMemo(() =>
    YARN_DATABASE.filter(y => y.category === yarnCategory),
    [yarnCategory]
  );

  // Production analysis
  const productionAnalysis = useMemo(() => {
    const config = {
      weaveId,
      warpYarnId,
      weftYarnId,
      epi,
      ppi,
      customWarpYarn,
      customWeftYarn,
    };
    return {
      risks: analyzeProductionRisks(config),
      sellingPoints: generateSellingPoints({ ...config, pattern }),
      gsm: calculateGSM(config),
    };
  }, [weaveId, warpYarnId, weftYarnId, epi, ppi, pattern, customWarpYarn, customWeftYarn]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentWeave) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 520, h = 520;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    drawFabric({
      ctx,
      w,
      h,
      pattern,
      pitch,
      warpColors,
      weftColors,
      weave: currentWeave,
      zoom,
    });
  }, [pattern, pitch, warpColors, weftColors, currentWeave, zoom]);

  // Color management
  const addColor = useCallback((type) => {
    if (type === 'warp' && warpColors.length < 8) {
      setWarpColors([...warpColors, SWATCHES[Math.floor(Math.random() * SWATCHES.length)]]);
    } else if (type === 'weft' && weftColors.length < 8) {
      setWeftColors([...weftColors, SWATCHES[Math.floor(Math.random() * SWATCHES.length)]]);
    }
  }, [warpColors, weftColors]);

  const removeColor = useCallback((type, index) => {
    if (type === 'warp' && warpColors.length > 1) {
      setWarpColors(warpColors.filter((_, i) => i !== index));
    } else if (type === 'weft' && weftColors.length > 1) {
      setWeftColors(weftColors.filter((_, i) => i !== index));
    }
  }, [warpColors, weftColors]);

  const updateColor = useCallback((type, index, color) => {
    if (type === 'warp') {
      const newColors = [...warpColors];
      newColors[index] = color;
      setWarpColors(newColors);
    } else {
      const newColors = [...weftColors];
      newColors[index] = color;
      setWeftColors(newColors);
    }
  }, [warpColors, weftColors]);

  function downloadPng() {
    const link = document.createElement('a');
    link.download = `PlaidColorways_${pattern}_${weaveId}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">先染めシミュレーター</h1>
            <p className="text-sm text-neutral-500">織り組織 × 糸 × 色のリアルタイムプレビュー</p>
          </div>
          <div className="flex items-center gap-2">
            {productionAnalysis.risks.overallRisk.priority > 0 && (
              <button
                onClick={() => setShowRiskPanel(true)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
                style={{ background: productionAnalysis.risks.overallRisk.color, color: '#fff' }}
              >
                {productionAnalysis.risks.risks.length} 件のリスク
              </button>
            )}
            <button
              onClick={() => setShowSellingPointsPanel(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium"
            >
              訴求ポイント
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-4 bg-neutral-200 p-1 rounded-xl w-fit">
          {[
            { id: 'design', label: 'デザイン' },
            { id: 'weave', label: '織り組織' },
            { id: 'yarn', label: '糸選択' },
            { id: 'specs', label: '規格' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id ? 'bg-white shadow' : 'hover:bg-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Controls Panel */}
          <section className="lg:col-span-5 bg-white rounded-2xl shadow p-4 space-y-4">
            {/* Design Tab */}
            {activeTab === 'design' && (
              <>
                {/* Pattern Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">パターン</label>
                  <div className="flex gap-2">
                    {PATTERNS.map(p => (
                      <button
                        key={p.key}
                        onClick={() => setPattern(p.key)}
                        className={`px-4 py-2 rounded-lg border text-sm transition ${
                          pattern === p.key ? 'bg-neutral-900 text-white border-neutral-900' : 'hover:border-neutral-400'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warp Colors */}
                <ColorManager
                  label="経糸（たて糸）の色"
                  colors={warpColors}
                  type="warp"
                  onAdd={() => addColor('warp')}
                  onRemove={(i) => removeColor('warp', i)}
                  onUpdate={(i, c) => updateColor('warp', i, c)}
                  swatches={SWATCHES}
                />

                {/* Weft Colors */}
                <ColorManager
                  label="緯糸（よこ糸）の色"
                  colors={weftColors}
                  type="weft"
                  onAdd={() => addColor('weft')}
                  onRemove={(i) => removeColor('weft', i)}
                  onUpdate={(i, c) => updateColor('weft', i, c)}
                  swatches={SWATCHES}
                />

                {/* Pitch */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    柄ピッチ: <span className="font-bold">{pitch}px</span>
                  </label>
                  <input
                    type="range"
                    min={8}
                    max={80}
                    value={pitch}
                    onChange={e => setPitch(parseInt(e.target.value))}
                    className="w-full accent-neutral-900"
                  />
                </div>

                {/* Zoom */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ズーム: <span className="font-bold">{zoom.toFixed(1)}x</span>
                  </label>
                  <input
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={e => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-neutral-900"
                  />
                  <div className="flex gap-2 mt-1">
                    {[0.5, 1, 1.5, 2, 3].map(z => (
                      <button
                        key={z}
                        onClick={() => setZoom(z)}
                        className={`px-2 py-1 text-xs rounded ${zoom === z ? 'bg-neutral-900 text-white' : 'bg-neutral-100'}`}
                      >
                        {z}x
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Weave Tab */}
            {activeTab === 'weave' && (
              <>
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">織りカテゴリ</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(WEAVE_CATEGORIES).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setWeaveCategory(cat.id);
                          const firstWeave = WEAVE_DATABASE.find(w => w.category === cat.id);
                          if (firstWeave) setWeaveId(firstWeave.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                          weaveCategory === cat.id ? 'bg-neutral-900 text-white' : 'hover:border-neutral-400'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weave Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">織り組織を選択</label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {filteredWeaves.map(weave => (
                      <button
                        key={weave.id}
                        onClick={() => setWeaveId(weave.id)}
                        className={`p-3 rounded-lg border text-left transition ${
                          weaveId === weave.id ? 'border-neutral-900 bg-neutral-50' : 'hover:border-neutral-400'
                        }`}
                      >
                        <div className="font-medium text-sm">{weave.name}</div>
                        <div className="text-xs text-neutral-500">{weave.nameEn}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Weave Info */}
                {currentWeave && (
                  <div className="bg-neutral-50 rounded-xl p-3">
                    <h4 className="font-medium mb-2">{currentWeave.name}</h4>
                    <p className="text-sm text-neutral-600 mb-2">{currentWeave.description}</p>
                    <div className="grid grid-cols-5 gap-1 text-xs">
                      {Object.entries(currentWeave.characteristics || {}).map(([key, val]) => (
                        <div key={key} className="text-center">
                          <div className="font-medium">{val}/5</div>
                          <div className="text-neutral-500">
                            {key === 'durability' ? '耐久' :
                             key === 'drape' ? 'ドレープ' :
                             key === 'breathability' ? '通気' :
                             key === 'wrinkleResistance' ? '防シワ' :
                             key === 'shine' ? '光沢' : key}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {currentWeave.applications?.map(app => (
                        <span key={app} className="px-2 py-0.5 bg-neutral-200 rounded text-xs">{app}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Yarn Tab */}
            {activeTab === 'yarn' && (
              <>
                {/* Yarn Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">素材カテゴリ</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(FIBER_CATEGORIES).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setYarnCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                          yarnCategory === cat.id ? 'bg-neutral-900 text-white' : 'hover:border-neutral-400'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warp Yarn Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">経糸（たて糸）</label>
                    <button
                      onClick={() => {
                        setCustomYarnTarget('warp');
                        setShowCustomYarnModal(true);
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      + カスタム糸
                    </button>
                  </div>
                  {customWarpYarn ? (
                    <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{customWarpYarn.name}</div>
                          <div className="text-xs text-neutral-500">
                            {getCompositionString(customWarpYarn)} | {customWarpYarn.count.ne}Ne
                          </div>
                        </div>
                        <button
                          onClick={() => setCustomWarpYarn(null)}
                          className="text-xs text-red-600"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ) : (
                    <select
                      value={warpYarnId}
                      onChange={e => setWarpYarnId(e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm"
                    >
                      {filteredYarns.map(yarn => (
                        <option key={yarn.id} value={yarn.id}>
                          {yarn.name} ({yarn.count.ne || yarn.count.nm}
                          {yarn.count.ne ? 'Ne' : 'Nm'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Weft Yarn Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">緯糸（よこ糸）</label>
                    <button
                      onClick={() => {
                        setCustomYarnTarget('weft');
                        setShowCustomYarnModal(true);
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      + カスタム糸
                    </button>
                  </div>
                  {customWeftYarn ? (
                    <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{customWeftYarn.name}</div>
                          <div className="text-xs text-neutral-500">
                            {getCompositionString(customWeftYarn)} | {customWeftYarn.count.ne}Ne
                          </div>
                        </div>
                        <button
                          onClick={() => setCustomWeftYarn(null)}
                          className="text-xs text-red-600"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ) : (
                    <select
                      value={weftYarnId}
                      onChange={e => setWeftYarnId(e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm"
                    >
                      {filteredYarns.map(yarn => (
                        <option key={yarn.id} value={yarn.id}>
                          {yarn.name} ({yarn.count.ne || yarn.count.nm}
                          {yarn.count.ne ? 'Ne' : 'Nm'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Current Yarn Info */}
                {currentWarpYarn && (
                  <div className="bg-neutral-50 rounded-xl p-3">
                    <h4 className="font-medium text-sm mb-2">経糸: {currentWarpYarn.name}</h4>
                    <div className="text-xs text-neutral-600 mb-2">
                      {getCompositionString(currentWarpYarn)}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {Object.entries(currentWarpYarn.characteristics || {}).slice(0, 6).map(([key, val]) => (
                        <div key={key}>
                          <div className="font-medium">{val}/5</div>
                          <div className="text-neutral-500">
                            {key === 'strength' ? '強度' :
                             key === 'softness' ? '柔らかさ' :
                             key === 'luster' ? '光沢' :
                             key === 'elasticity' ? '弾力' :
                             key === 'absorbency' ? '吸湿' :
                             key === 'durability' ? '耐久' : key}
                          </div>
                        </div>
                      ))}
                    </div>
                    {currentWarpYarn.risks?.length > 0 && (
                      <div className="mt-2 text-xs text-amber-600">
                        {currentWarpYarn.risks.map((risk, i) => (
                          <div key={i}>* {risk}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Specs Tab */}
            {activeTab === 'specs' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      経糸密度 (EPI): <span className="font-bold">{epi}</span>
                    </label>
                    <input
                      type="range"
                      min={40}
                      max={200}
                      value={epi}
                      onChange={e => setEpi(parseInt(e.target.value))}
                      className="w-full accent-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      緯糸密度 (PPI): <span className="font-bold">{ppi}</span>
                    </label>
                    <input
                      type="range"
                      min={40}
                      max={200}
                      value={ppi}
                      onChange={e => setPpi(parseInt(e.target.value))}
                      className="w-full accent-neutral-900"
                    />
                  </div>
                </div>

                {/* GSM Display */}
                {productionAnalysis.gsm && (
                  <div className="bg-neutral-100 rounded-xl p-4">
                    <div className="text-lg font-bold">
                      {productionAnalysis.gsm.gsm} gsm
                    </div>
                    <div className="text-sm text-neutral-600">
                      {productionAnalysis.gsm.category.name}
                      <span className="mx-2">|</span>
                      {productionAnalysis.gsm.category.description}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      約 {productionAnalysis.gsm.weight} oz/yd²
                    </div>
                  </div>
                )}

                {/* Fabric Summary */}
                <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
                  <h4 className="font-medium">生地構成サマリー</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-neutral-500">織り組織</div>
                      <div className="font-medium">{currentWeave?.name}</div>
                    </div>
                    <div>
                      <div className="text-neutral-500">難易度</div>
                      <div className="font-medium">{'★'.repeat(currentWeave?.productionDifficulty || 1)}</div>
                    </div>
                    <div>
                      <div className="text-neutral-500">経糸</div>
                      <div className="font-medium">{currentWarpYarn?.name}</div>
                    </div>
                    <div>
                      <div className="text-neutral-500">緯糸</div>
                      <div className="font-medium">{currentWeftYarn?.name}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <button onClick={downloadPng} className="flex-1 px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-medium">
                    PNG保存
                  </button>
                  <button
                    onClick={() => setShowRiskPanel(true)}
                    className="flex-1 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium"
                  >
                    リスク分析
                  </button>
                </div>
              </>
            )}
          </section>

          {/* Preview Panel */}
          <section className="lg:col-span-7 bg-white rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium">プレビュー</h2>
              <div className="text-sm text-neutral-500">
                {currentWeave?.name} | {currentWarpYarn?.name?.split(' ')[0]}
              </div>
            </div>
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className="rounded-xl border shadow-inner"
                style={{ maxWidth: '100%' }}
              />
            </div>

            {/* Quick Swatches */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">クイックカラー</label>
              <div className="flex flex-wrap gap-1">
                {SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    className="w-7 h-7 rounded-md border border-neutral-300 hover:scale-110 transition"
                    style={{ background: hex }}
                    onClick={() => {
                      if (warpColors.length < 2) {
                        setWarpColors([...warpColors, hex]);
                      } else {
                        setWarpColors([warpColors[0], hex]);
                      }
                    }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Risk Panel Modal */}
      {showRiskPanel && (
        <Modal onClose={() => setShowRiskPanel(false)} title="生産リスク分析">
          <RiskPanel analysis={productionAnalysis.risks} />
        </Modal>
      )}

      {/* Selling Points Panel Modal */}
      {showSellingPointsPanel && (
        <Modal onClose={() => setShowSellingPointsPanel(false)} title="販売訴求ポイント">
          <SellingPointsPanel analysis={productionAnalysis.sellingPoints} />
        </Modal>
      )}

      {/* Custom Yarn Modal */}
      {showCustomYarnModal && (
        <Modal onClose={() => setShowCustomYarnModal(false)} title="カスタム糸を作成">
          <CustomYarnForm
            onSave={(yarn) => {
              if (customYarnTarget === 'warp') {
                setCustomWarpYarn(yarn);
              } else {
                setCustomWeftYarn(yarn);
              }
              setShowCustomYarnModal(false);
            }}
            onCancel={() => setShowCustomYarnModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

// --- Color Manager Component
function ColorManager({ label, colors, type, onAdd, onRemove, onUpdate, swatches }) {
  const [editingIndex, setEditingIndex] = useState(null);

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 items-center">
        {colors.map((color, index) => (
          <div key={index} className="relative group">
            <button
              className="w-10 h-10 rounded-lg border-2 border-neutral-300 shadow-sm hover:border-neutral-500 transition"
              style={{ background: color }}
              onClick={() => setEditingIndex(editingIndex === index ? null : index)}
            />
            {colors.length > 1 && (
              <button
                onClick={() => onRemove(index)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition"
              >
                ×
              </button>
            )}
            {editingIndex === index && (
              <div className="absolute top-12 left-0 z-10 bg-white rounded-lg shadow-xl p-2 border">
                <input
                  type="color"
                  value={color}
                  onChange={e => onUpdate(index, e.target.value)}
                  className="w-full h-8 mb-2"
                />
                <div className="grid grid-cols-5 gap-1">
                  {swatches.slice(0, 15).map(hex => (
                    <button
                      key={hex}
                      className="w-6 h-6 rounded border"
                      style={{ background: hex }}
                      onClick={() => {
                        onUpdate(index, hex);
                        setEditingIndex(null);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {colors.length < 8 && (
          <button
            onClick={onAdd}
            className="w-10 h-10 rounded-lg border-2 border-dashed border-neutral-300 text-neutral-400 hover:border-neutral-500 hover:text-neutral-600 transition flex items-center justify-center"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

// --- Modal Component
function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- Risk Panel Component
function RiskPanel({ analysis }) {
  const { risks, overallRisk, summary } = analysis;

  return (
    <div className="space-y-4">
      {/* Overall Risk */}
      <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: overallRisk.color + '20' }}>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
          style={{ background: overallRisk.color }}
        >
          {risks.length}
        </div>
        <div>
          <div className="font-bold">全体リスク: {overallRisk.label}</div>
          <div className="text-sm text-neutral-600">{summary}</div>
        </div>
      </div>

      {/* Risk List */}
      {risks.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          特筆すべきリスクはありません
        </div>
      ) : (
        <div className="space-y-3">
          {risks.map((risk, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border-l-4"
              style={{ borderColor: risk.level.color, background: risk.level.color + '10' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{risk.category.icon}</span>
                <span className="font-medium">{risk.title}</span>
                <span
                  className="px-2 py-0.5 rounded text-xs text-white"
                  style={{ background: risk.level.color }}
                >
                  {risk.level.label}
                </span>
              </div>
              <p className="text-sm text-neutral-600 mb-2">{risk.description}</p>
              {risk.recommendations && (
                <div className="mt-2">
                  <div className="text-xs font-medium text-neutral-500 mb-1">推奨対策:</div>
                  <ul className="text-sm space-y-1">
                    {risk.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Selling Points Panel Component
function SellingPointsPanel({ analysis }) {
  const { sellingPoints, keywords, copyText } = analysis;

  return (
    <div className="space-y-4">
      {/* Copy Text */}
      {copyText && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
          <div className="text-xs font-medium text-neutral-500 mb-2">コピー文案</div>
          <p className="text-lg leading-relaxed">{copyText}</p>
          <button
            onClick={() => navigator.clipboard.writeText(copyText)}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            コピー
          </button>
        </div>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2">キーワード</div>
          <div className="flex flex-wrap gap-2">
            {keywords.map(kw => (
              <span key={kw} className="px-3 py-1 bg-neutral-100 rounded-full text-sm">
                #{kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Selling Points */}
      <div className="space-y-3">
        {sellingPoints.map((point, index) => (
          <div key={index} className="p-4 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-neutral-200 rounded text-xs">{point.category}</span>
              <span className="font-medium">{point.title}</span>
            </div>
            <p className="text-sm text-neutral-600">{point.description}</p>
          </div>
        ))}
      </div>

      {sellingPoints.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          訴求ポイントを生成中...
        </div>
      )}
    </div>
  );
}

// --- Custom Yarn Form Component
function CustomYarnForm({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [ne, setNe] = useState(40);
  const [fibers, setFibers] = useState([{ fiber: 'cotton', percentage: 100 }]);

  const fiberOptions = [
    { id: 'cotton', name: '綿' },
    { id: 'polyester', name: 'ポリエステル' },
    { id: 'wool', name: 'ウール' },
    { id: 'linen', name: '麻' },
    { id: 'silk', name: 'シルク' },
    { id: 'nylon', name: 'ナイロン' },
    { id: 'viscose', name: 'レーヨン' },
    { id: 'spandex', name: 'スパンデックス' },
    { id: 'modal', name: 'モダール' },
    { id: 'lyocell', name: 'テンセル' },
    { id: 'cashmere', name: 'カシミヤ' },
    { id: 'acrylic', name: 'アクリル' },
  ];

  const addFiber = () => {
    if (fibers.length < 4) {
      setFibers([...fibers, { fiber: 'polyester', percentage: 0 }]);
    }
  };

  const updateFiber = (index, field, value) => {
    const newFibers = [...fibers];
    newFibers[index][field] = field === 'percentage' ? parseInt(value) || 0 : value;
    setFibers(newFibers);
  };

  const removeFiber = (index) => {
    if (fibers.length > 1) {
      setFibers(fibers.filter((_, i) => i !== index));
    }
  };

  const totalPercentage = fibers.reduce((sum, f) => sum + f.percentage, 0);

  const handleSave = () => {
    if (!name.trim() || totalPercentage !== 100) return;

    const customYarn = {
      id: `custom_${Date.now()}`,
      name,
      nameEn: name,
      category: 'blend',
      composition: fibers,
      count: { ne, tex: 590.5 / ne },
      characteristics: {
        strength: 3,
        softness: 3,
        luster: 3,
        elasticity: 3,
        absorbency: 3,
        durability: 3,
      },
      colors: ['dyed'],
      applications: [],
      productionNotes: ['カスタム糸'],
      risks: [],
      priceLevel: 3,
    };

    onSave(customYarn);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">糸の名前</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="例: オリジナル混紡糸"
          className="w-full p-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">番手 (Ne): {ne}</label>
        <input
          type="range"
          min={6}
          max={120}
          value={ne}
          onChange={e => setNe(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">素材構成</label>
          {fibers.length < 4 && (
            <button
              onClick={addFiber}
              className="text-sm text-blue-600 hover:underline"
            >
              + 素材追加
            </button>
          )}
        </div>
        <div className="space-y-2">
          {fibers.map((fiber, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                value={fiber.fiber}
                onChange={e => updateFiber(index, 'fiber', e.target.value)}
                className="flex-1 p-2 border rounded-lg text-sm"
              >
                {fiberOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
              <input
                type="number"
                value={fiber.percentage}
                onChange={e => updateFiber(index, 'percentage', e.target.value)}
                min={0}
                max={100}
                className="w-20 p-2 border rounded-lg text-sm text-center"
              />
              <span className="text-sm text-neutral-500">%</span>
              {fibers.length > 1 && (
                <button
                  onClick={() => removeFiber(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <div className={`mt-2 text-sm ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
          合計: {totalPercentage}% {totalPercentage !== 100 && '(100%にしてください)'}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border rounded-lg text-sm"
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || totalPercentage !== 100}
          className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          保存
        </button>
      </div>
    </div>
  );
}
