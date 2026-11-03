import { GeometryModel, Vertex3D, Edge3D } from '../types/geometry';

export const interdisciplinaryModels: GeometryModel[] = [
  // 27. Mô hình dao động con lắc
  {
    id: 'pendulum_motion',
    name: 'Mô hình dao động con lắc',
    category: 'interdisciplinary',
    categoryName: 'Mô hình liên môn (Vật lý - Hóa học)',
    gradeLevel: 'all',
    description: 'Mô hình dao động con lắc đơn trong không gian: dây treo chiều dài L, góc lệch cực đại α₀, quỹ đạo cong và lực căng dây kết hợp trọng lực.',
    tags: ['Vật lý', 'Dao động cơ', 'Mô hình liên môn'],
    params: [
      { id: 'L', label: 'Chiều dài dây treo (L)', min: 1.5, max: 5, step: 0.5, default: 3.5, unit: 'm' },
      { id: 'alpha', label: 'Góc lệch cực đại (alpha)', min: 10, max: 60, step: 5, default: 30, unit: 'độ' },
    ],
    defaultParams: { L: 3.5, alpha: 30 },
    educationalNotes: [
      'Gắn kết chặt chẽ giữa hình học không gian và vật lý: Dây treo cố định tại điểm O, vật nặng chuyển động trên một cung tròn trong mặt phẳng đứng.',
      'Độ cao cực đại của vật so với vị trí cân bằng: Δh = L(1 - cos α₀).',
      'Chu kỳ dao động điều hòa (khi α₀ nhỏ): T = 2π√(L/g) (với g ≈ 9.8 m/s²).',
      'Khi con lắc quay tròn đều theo quỹ đạo nón, dây treo quét nên một mặt nón (con lắc nón).',
    ],
    generateGeometry: (params) => {
      const L = params.L ?? 3.5;
      const alphaDeg = params.alpha ?? 30;
      const alphaRad = (alphaDeg * Math.PI) / 180;

      const yTop = L * 0.4;
      const yBottom = yTop - L * Math.cos(alphaRad);
      const xRight = L * Math.sin(alphaRad);

      const vertices: Vertex3D[] = [
        { id: 'O', name: 'O (điểm treo)', pos: [0, yTop, 0], color: '#ef4444' },
        { id: 'O_eq', name: 'Vị trí cân bằng', pos: [0, yTop - L, 0], color: '#94a3b8' },
        { id: 'M_pos', name: `M (+${alphaDeg}°)`, pos: [xRight, yBottom, 0], color: '#f59e0b' },
        { id: 'M_neg', name: `M' (-${alphaDeg}°)`, pos: [-xRight, yBottom, 0], color: '#f59e0b' },
        { id: 'P_cen', name: 'Tâm quỹ đạo', pos: [0, yBottom, 0], color: '#10b981' },
      ];

      // Arc points for trajectory
      const arcSteps = 16;
      for (let i = 0; i <= arcSteps; i++) {
        const a = -alphaRad + (2 * alphaRad * i) / arcSteps;
        const x = L * Math.sin(a);
        const y = yTop - L * Math.cos(a);
        vertices.push({ id: `arc_${i}`, name: '', pos: [x, y, 0] });
      }

      const edges: Edge3D[] = [
        // Suspension wire to current pos
        { id: 'wire_right', v1: 'O', v2: 'M_pos', name: 'Dây treo L', color: '#f59e0b' },
        { id: 'wire_eq', v1: 'O', v2: 'O_eq', name: 'Trục thẳng đứng', isHeight: true, color: '#94a3b8' },
        { id: 'wire_left', v1: 'O', v2: 'M_neg', name: 'Vị trí biên đối diện', color: '#fbbf24' },
        // Height marker
        { id: 'h_line', v1: 'P_cen', v2: 'M_pos', isHeight: true, color: '#10b981' },
      ];

      // Trajectory arc edges
      for (let i = 0; i < arcSteps; i++) {
        edges.push({ id: `e_arc_${i}`, v1: `arc_${i}`, v2: `arc_${i + 1}`, color: '#06b6d4' });
      }

      const faces: any[] = [];

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const L = params.L ?? 3.5;
      const alphaDeg = params.alpha ?? 30;
      const alphaRad = (alphaDeg * Math.PI) / 180;
      const g = 9.8;
      const deltaH = L * (1 - Math.cos(alphaRad));
      const T = 2 * Math.PI * Math.sqrt(L / g);
      const vMax = Math.sqrt(2 * g * deltaH);

      return [
        {
          name: 'Độ nâng cực đại',
          latexSymbol: '\\Delta h',
          latexFormula: '\\Delta h = L(1 - \\cos \\alpha_0)',
          substitution: `${L}(1 - \\cos ${alphaDeg}^\\circ) \\approx ${deltaH.toFixed(2)}`,
          result: Number(deltaH.toFixed(2)),
          unit,
          explanation: 'Chênh lệch độ cao từ vị trí biên đến vị trí cân bằng',
        },
        {
          name: 'Chu kỳ dao động con lắc',
          latexSymbol: 'T',
          latexFormula: 'T = 2\\pi \\sqrt{\\frac{L}{g}}',
          substitution: `2\\pi \\sqrt{\\frac{${L}}{9.8}} \\approx ${T.toFixed(2)}`,
          result: Number(T.toFixed(2)),
          unit: 'giây (s)',
          explanation: 'Thời gian thực hiện một dao động toàn phần',
        },
        {
          name: 'Vận tốc cực đại tại vị trí cân bằng',
          latexSymbol: 'v_{max}',
          latexFormula: 'v_{max} = \\sqrt{2g\\Delta h}',
          substitution: `\\sqrt{2 \\times 9.8 \\times ${deltaH.toFixed(2)}} \\approx ${vMax.toFixed(2)}`,
          result: Number(vMax.toFixed(2)),
          unit: `${unit}/s`,
          explanation: 'Định luật bảo toàn cơ năng (thế năng chuyển hóa toàn bộ thành động năng)',
        },
      ];
    },
  },

  // 28. Mô hình chuyển động tròn
  {
    id: 'circular_motion_cone',
    name: 'Chuyển động tròn và Quét hình nón',
    category: 'interdisciplinary',
    categoryName: 'Mô hình liên môn (Vật lý - Hóa học)',
    gradeLevel: 'all',
    description: 'Chuyển động tròn đều của một chất điểm trong không gian tạo nên đường tròn quỹ đạo và quét nên mặt nón tròn xoay.',
    tags: ['Vật lý', 'Chuyển động tròn', 'Mặt nón'],
    params: [
      { id: 'r', label: 'Bán kính quỹ đạo (r)', min: 1, max: 4, step: 0.25, default: 2.5, unit: 'm' },
      { id: 'h', label: 'Khoảng cách từ đỉnh (h)', min: 1.5, max: 5, step: 0.5, default: 3.2, unit: 'm' },
      { id: 'omega', label: 'Tốc độ góc (omega)', min: 1, max: 10, step: 1, default: 4, unit: 'rad/s' },
    ],
    defaultParams: { r: 2.5, h: 3.2, omega: 4 },
    educationalNotes: [
      'Chất điểm chuyển động với tốc độ góc ω không đổi trên đường tròn bán kính r.',
      'Đoạn thẳng nối điểm treo O trên trục với chất điểm quét nên mặt nón có đường sinh l = √(h² + r²).',
      'Lực hướng tâm: F_ht = m·ω²·r = m·v²/r.',
      'Sự kết hợp giữa hình học không gian (mặt nón, đường tròn) và động lực học chất điểm.',
    ],
    generateGeometry: (params) => {
      const r = params.r ?? 2.5;
      const h = params.h ?? 3.2;
      const seg = 24;
      const yTop = h / 2;
      const yBot = -h / 2;

      const vertices: any[] = [];
      const edges: any[] = [];
      const faces: any[] = [];

      vertices.push({ id: 'O', name: 'O (đỉnh quét)', pos: [0, yTop, 0], color: '#ef4444' });
      vertices.push({ id: 'C_cen', name: 'Tâm đường tròn', pos: [0, yBot, 0], color: '#ef4444' });

      for (let i = 0; i < seg; i++) {
        const ang = (i * 2 * Math.PI) / seg;
        vertices.push({ id: `c_${i}`, name: i === 0 ? 'M (vật)' : '', pos: [r * Math.cos(ang), yBot, r * Math.sin(ang)] });
      }

      // Circle edges
      for (let i = 0; i < seg; i++) {
        const next = (i + 1) % seg;
        edges.push({ id: `ec_${i}`, v1: `c_${i}`, v2: `c_${next}`, color: '#06b6d4' });
      }

      // Swept generator lines
      edges.push({ id: 'gen_M', v1: 'O', v2: 'c_0', name: 'Dây quét OM', color: '#f59e0b' });
      edges.push({ id: 'gen_opp', v1: 'O', v2: `c_${Math.floor(seg / 2)}`, color: '#fde047' });
      edges.push({ id: 'axis_OC', v1: 'O', v2: 'C_cen', name: 'Trục thẳng đứng h', isHeight: true, color: '#ef4444' });
      edges.push({ id: 'r_line', v1: 'C_cen', v2: 'c_0', name: 'Bán kính r', isHeight: true, color: '#10b981' });

      // Translucent swept cone faces
      for (let i = 0; i < seg; i++) {
        const next = (i + 1) % seg;
        faces.push({
          id: `f_cone_${i}`,
          vertexIds: ['O', `c_${next}`, `c_${i}`],
          name: 'Mặt nón quét',
          color: '#38bdf8',
          opacity: 0.35,
        });
      }

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const r = params.r ?? 2.5;
      const h = params.h ?? 3.2;
      const omega = params.omega ?? 4;
      const v = omega * r;
      const a_ht = omega * omega * r;
      const l = Math.sqrt(h * h + r * r);

      return [
        {
          name: 'Vận tốc dài của chất điểm',
          latexSymbol: 'v',
          latexFormula: 'v = \\omega \\times r',
          substitution: `${omega} \\times ${r} = ${v.toFixed(2)}`,
          result: Number(v.toFixed(2)),
          unit: `${unit}/s`,
          explanation: 'Tốc độ chuyển động trên quỹ đạo tròn',
        },
        {
          name: 'Gia tốc hướng tâm',
          latexSymbol: 'a_{ht}',
          latexFormula: 'a_{ht} = \\omega^2 r = \\frac{v^2}{r}',
          substitution: `${omega}^2 \\times ${r} = ${a_ht.toFixed(2)}`,
          result: Number(a_ht.toFixed(2)),
          unit: `${unit}/s²`,
          explanation: 'Gia tốc luôn hướng về tâm quỹ đạo tròn',
        },
        {
          name: 'Độ dài đường sinh của hình nón quét',
          latexSymbol: 'l',
          latexFormula: 'l = \\sqrt{h^2 + r^2}',
          substitution: `\\sqrt{${h}^2 + ${r}^2} \\approx ${l.toFixed(2)}`,
          result: Number(l.toFixed(2)),
          unit,
          explanation: 'Chiều dài dây quét trong không gian',
        },
      ];
    },
  },

  // 29. Mô hình phân tử nước H₂O
  {
    id: 'molecule_h2o',
    name: 'Mô hình phân tử H₂O',
    category: 'interdisciplinary',
    categoryName: 'Mô hình liên môn (Vật lý - Hóa học)',
    gradeLevel: 'all',
    description: 'Cấu trúc hình học không gian dạng góc của phân tử nước H₂O: Nguyên tử Oxy ở đỉnh, hai nguyên tử Hydro tạo góc liên kết thực nghiệm 104.5° do lực đẩy của 2 cặp electron không liên kết.',
    tags: ['Hóa học', 'Phân tử', 'Cấu trúc không gian'],
    params: [
      { id: 'scale', label: 'Tỉ lệ kích thước', min: 1, max: 4, step: 0.5, default: 2.2, unit: '' },
      { id: 'angle', label: 'Góc liên kết H-O-H (độ)', min: 90, max: 120, step: 0.5, default: 104.5, unit: 'độ' },
    ],
    defaultParams: { scale: 2.2, angle: 104.5 },
    educationalNotes: [
      'Nguyên tử Oxy lai hóa sp³: 4 obitan lai hóa hướng về 4 đỉnh của một hình tứ diện gần đều.',
      'Do 2 cặp electron tự do (lone pairs) chiếm không gian lớn và đẩy mạnh hơn các cặp liên kết, góc liên kết H-O-H bị thu hẹp từ 109.5° xuống còn 104.5°.',
      'Cấu trúc dạng góc tạo nên tính phân cực mạnh của phân tử nước, tạo điều kiện hình thành liên kết hydro - nguồn gốc của sự sống.',
    ],
    generateGeometry: (params) => {
      const s = params.scale ?? 2.2;
      const angleDeg = params.angle ?? 104.5;
      const halfAngle = (angleDeg * Math.PI) / 360;

      const bondLength = s * 1.2;

      const vertices = [
        // Oxygen at top-center
        { id: 'O', name: 'Oxy (O)', pos: [0, s * 0.4, 0] as [number, number, number], color: '#ef4444' },
        // Two Hydrogen atoms
        { id: 'H1', name: 'Hydro (H1)', pos: [-bondLength * Math.sin(halfAngle), s * 0.4 - bondLength * Math.cos(halfAngle), 0] as [number, number, number], color: '#38bdf8' },
        { id: 'H2', name: 'Hydro (H2)', pos: [bondLength * Math.sin(halfAngle), s * 0.4 - bondLength * Math.cos(halfAngle), 0] as [number, number, number], color: '#38bdf8' },
        // Electron lone pair clouds representation
        { id: 'LP1', name: 'Cặp e tự do 1', pos: [0, s * 0.7, -bondLength * 0.7] as [number, number, number], color: '#a855f7' },
        { id: 'LP2', name: 'Cặp e tự do 2', pos: [0, s * 0.7, bondLength * 0.7] as [number, number, number], color: '#a855f7' },
      ];

      const edges = [
        // O-H bonds
        { id: 'bond_OH1', v1: 'O', v2: 'H1', name: 'Liên kết O-H1', color: '#94a3b8' },
        { id: 'bond_OH2', v1: 'O', v2: 'H2', name: 'Liên kết O-H2', color: '#94a3b8' },
        // Lone pair vectors
        { id: 'lp_1', v1: 'O', v2: 'LP1', isHeight: true, color: '#c084fc' },
        { id: 'lp_2', v1: 'O', v2: 'LP2', isHeight: true, color: '#c084fc' },
        // Angle chord
        { id: 'chord_HH', v1: 'H1', v2: 'H2', isHeight: true, color: '#38bdf8' },
      ];

      const faces: any[] = [];

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const angleDeg = params.angle ?? 104.5;
      const d_OH = 0.96; // Angstrom
      const halfAngle = (angleDeg * Math.PI) / 360;
      const d_HH = 2 * d_OH * Math.sin(halfAngle);

      return [
        {
          name: 'Góc liên kết thực nghiệm H-O-H',
          latexSymbol: '\\angle H-O-H',
          latexFormula: '\\theta = 104.5^\\circ',
          substitution: `${angleDeg}^\\circ`,
          result: angleDeg,
          unit: 'độ (°)',
          explanation: 'Bị ép nhỏ hơn góc tứ diện 109.5° do 2 cặp electron tự do đẩy mạnh',
        },
        {
          name: 'Khoảng cách liên kết O-H',
          latexSymbol: 'd_{O-H}',
          latexFormula: 'd_{O-H} \\approx 0.96 \\text{ Å} = 0.096 \\text{ nm}',
          substitution: '0.96',
          result: 0.96,
          unit: 'Å',
          explanation: 'Độ dài liên kết cộng hóa trị có cực O-H',
        },
        {
          name: 'Khoảng cách giữa hai nguyên tử H',
          latexSymbol: 'd_{H-H}',
          latexFormula: 'd_{H-H} = 2 d_{O-H} \\sin(\\theta/2)',
          substitution: `2 \\times 0.96 \\times \\sin(${(angleDeg / 2).toFixed(1)}^\\circ) \\approx ${d_HH.toFixed(2)}`,
          result: Number(d_HH.toFixed(2)),
          unit: 'Å',
          explanation: 'Khoảng cách không gian giữa hai tâm nguyên tử Hydro',
        },
      ];
    },
  },

  // 30. Mô hình phân tử metan CH₄
  {
    id: 'molecule_ch4',
    name: 'Mô hình phân tử CH₄ (Metan)',
    category: 'interdisciplinary',
    categoryName: 'Mô hình liên môn (Vật lý - Hóa học)',
    gradeLevel: 'all',
    description: 'Cấu trúc không gian tứ diện đều hoàn hảo của phân tử metan CH₄: Nguyên tử Cacbon ở tâm, 4 nguyên tử Hydro ở 4 đỉnh của hình tứ diện đều với góc liên kết 109.5°.',
    tags: ['Hóa học', 'Tứ diện đều', 'Liên kết sp³'],
    params: [
      { id: 'scale', label: 'Tỉ lệ kích thước', min: 1, max: 4, step: 0.5, default: 2.2, unit: '' },
    ],
    defaultParams: { scale: 2.2 },
    educationalNotes: [
      'Nguyên tử Cacbon ở trạng thái lai hóa sp³ hoàn hảo.',
      '4 obitan lai hóa hoàn toàn đồng nhất hướng về 4 đỉnh của hình tứ diện đều bao quanh tâm C.',
      'Góc liên kết H-C-H bằng chính xác arccos(-1/3) ≈ 109°28\' (109.5°).',
      'Minh chứng kinh điển cho sự kết nối giữa hình học không gian (khối tứ diện đều Platon) và lý thuyết hóa học lượng tử!',
    ],
    generateGeometry: (params) => {
      const s = params.scale ?? 2.2;
      const d = s * 1.1;

      // Regular tetrahedron vertices around center (0,0,0)
      const vertices = [
        // Carbon at center
        { id: 'C', name: 'Cacbon (C - tâm)', pos: [0, 0, 0] as [number, number, number], color: '#334155' },
        // 4 Hydrogens at tetrahedron vertices
        { id: 'H1', name: 'H1', pos: [d, d, d] as [number, number, number], color: '#38bdf8' },
        { id: 'H2', name: 'H2', pos: [-d, -d, d] as [number, number, number], color: '#38bdf8' },
        { id: 'H3', name: 'H3', pos: [-d, d, -d] as [number, number, number], color: '#38bdf8' },
        { id: 'H4', name: 'H4', pos: [d, -d, -d] as [number, number, number], color: '#38bdf8' },
      ];

      const edges = [
        // 4 C-H chemical bonds
        { id: 'b_CH1', v1: 'C', v2: 'H1', name: 'Liên kết C-H1', color: '#f59e0b' },
        { id: 'b_CH2', v1: 'C', v2: 'H2', name: 'Liên kết C-H2', color: '#f59e0b' },
        { id: 'b_CH3', v1: 'C', v2: 'H3', name: 'Liên kết C-H3', color: '#f59e0b' },
        { id: 'b_CH4', v1: 'C', v2: 'H4', name: 'Liên kết C-H4', color: '#f59e0b' },
        // Tetrahedron wireframe outline
        { id: 'th_12', v1: 'H1', v2: 'H2', isHeight: true, color: '#818cf8' },
        { id: 'th_23', v1: 'H2', v2: 'H3', isHeight: true, color: '#818cf8' },
        { id: 'th_31', v1: 'H3', v2: 'H1', isHeight: true, color: '#818cf8' },
        { id: 'th_14', v1: 'H1', v2: 'H4', isHeight: true, color: '#818cf8' },
        { id: 'th_24', v1: 'H2', v2: 'H4', isHeight: true, color: '#818cf8' },
        { id: 'th_34', v1: 'H3', v2: 'H4', isHeight: true, color: '#818cf8' },
      ];

      const faces = [
        { id: 'f_H123', vertexIds: ['H1', 'H2', 'H3'], name: 'Mặt tứ diện H1-H2-H3', color: '#6366f1', opacity: 0.15 },
        { id: 'f_H124', vertexIds: ['H1', 'H4', 'H2'], name: 'Mặt tứ diện', color: '#6366f1', opacity: 0.15 },
        { id: 'f_H234', vertexIds: ['H2', 'H4', 'H3'], name: 'Mặt tứ diện', color: '#6366f1', opacity: 0.15 },
        { id: 'f_H314', vertexIds: ['H3', 'H4', 'H1'], name: 'Mặt tứ diện', color: '#6366f1', opacity: 0.15 },
      ];

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const angle = 109.47;
      const d_CH = 1.09; // Angstrom

      return [
        {
          name: 'Góc liên kết tứ diện H-C-H',
          latexSymbol: '\\theta',
          latexFormula: '\\theta = \\arccos\\left(-\\frac{1}{3}\\right) \\approx 109.5^\\circ',
          substitution: '109.47^\\circ',
          result: angle,
          unit: 'độ (°)',
          explanation: 'Góc tạo bởi hai liên kết C-H bất kỳ từ tâm ra hai đỉnh tứ diện',
        },
        {
          name: 'Độ dài liên kết C-H',
          latexSymbol: 'd_{C-H}',
          latexFormula: 'd_{C-H} \\approx 1.09 \\text{ Å}',
          substitution: '1.09',
          result: d_CH,
          unit: 'Å',
          explanation: 'Khoảng cách giữa hạt nhân Cacbon và hạt nhân Hydro',
        },
        {
          name: 'Số liên kết sigma (σ)',
          latexSymbol: '\\sigma',
          latexFormula: '4 \\times \\sigma_{sp^3-s}',
          substitution: '4 liên kết cộng hóa trị đơn',
          result: 4,
          unit: 'liên kết',
          explanation: 'Tạo bởi sự xen phủ trục giữa 4 obitan lai hóa sp³ của C với obitan 1s của 4 nguyên tử H',
        },
      ];
    },
  },
];
