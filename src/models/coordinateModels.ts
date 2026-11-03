import { GeometryModel } from '../types/geometry';

export const coordinateModels: GeometryModel[] = [
  // 23. Hệ trục tọa độ Oxyz
  {
    id: 'oxyz_axes',
    name: 'Hệ trục tọa độ Oxyz',
    category: 'coordinate',
    categoryName: 'Hệ tọa độ không gian',
    gradeLevel: 'THPT',
    description: 'Hệ gồm ba trục Ox, Oy, Oz vuông góc với nhau từng đôi một tại gốc tọa độ O. Đi kèm 3 vectơ đơn vị i, j, k và 3 mặt phẳng tọa độ (Oxy), (Oyz), (Ozx).',
    tags: ['Oxyz', 'Hệ trục', 'Hình học giải tích'],
    params: [
      { id: 'length', label: 'Độ dài trục', min: 2, max: 7, step: 0.5, default: 4.5, unit: 'đv' },
    ],
    defaultParams: { length: 4.5 },
    educationalNotes: [
      'Gốc tọa độ O(0, 0, 0).',
      'Ba trục tọa độ: Trục hoành Ox (vectơ đơn vị i = (1,0,0)), trục tung Oy (j = (0,1,0)), trục cao Oz (k = (0,0,1)).',
      'Độ dài |i| = |j| = |k| = 1 và i ⟂ j, j ⟂ k, k ⟂ i.',
      'Ba mặt phẳng tọa độ: (Oxy): z = 0, (Oyz): x = 0, (Ozx): y = 0.',
    ],
    generateGeometry: (params) => {
      const L = params.length ?? 4.5;

      const vertices = [
        { id: 'O', name: 'O (0,0,0)', pos: [0, 0, 0] as [number, number, number], color: '#ef4444' },
        { id: 'X_pos', name: 'x (Ox)', pos: [L, 0, 0] as [number, number, number], color: '#ef4444' },
        { id: 'X_neg', name: '', pos: [-L * 0.4, 0, 0] as [number, number, number] },
        { id: 'Y_pos', name: 'y (Oy)', pos: [0, L, 0] as [number, number, number], color: '#10b981' },
        { id: 'Y_neg', name: '', pos: [0, -L * 0.4, 0] as [number, number, number] },
        { id: 'Z_pos', name: 'z (Oz)', pos: [0, 0, L] as [number, number, number], color: '#3b82f6' },
        { id: 'Z_neg', name: '', pos: [0, 0, -L * 0.4] as [number, number, number] },
        // Unit vectors endpoints
        { id: 'vec_i', name: 'i (1,0,0)', pos: [1.2, 0, 0] as [number, number, number], color: '#ef4444' },
        { id: 'vec_j', name: 'j (0,1,0)', pos: [0, 1.2, 0] as [number, number, number], color: '#10b981' },
        { id: 'vec_k', name: 'k (0,0,1)', pos: [0, 0, 1.2] as [number, number, number], color: '#3b82f6' },
        // Grid plane corners
        { id: 'oxy_1', name: '', pos: [L * 0.6, 0, L * 0.6] as [number, number, number] },
        { id: 'oxz_1', name: '', pos: [L * 0.6, L * 0.6, 0] as [number, number, number] },
        { id: 'oyz_1', name: '', pos: [0, L * 0.6, L * 0.6] as [number, number, number] },
      ];

      const edges = [
        { id: 'e_ox', v1: 'X_neg', v2: 'X_pos', name: 'Trục Ox', isAxis: true, color: '#ef4444' },
        { id: 'e_oy', v1: 'Y_neg', v2: 'Y_pos', name: 'Trục Oy', isAxis: true, color: '#10b981' },
        { id: 'e_oz', v1: 'Z_neg', v2: 'Z_pos', name: 'Trục Oz', isAxis: true, color: '#3b82f6' },
        // Unit vector highlights
        { id: 'e_ui', v1: 'O', v2: 'vec_i', name: 'Vectơ i', color: '#ef4444' },
        { id: 'e_uj', v1: 'O', v2: 'vec_j', name: 'Vectơ j', color: '#10b981' },
        { id: 'e_uk', v1: 'O', v2: 'vec_k', name: 'Vectơ k', color: '#3b82f6' },
      ];

      const faces = [
        // Grid floor Oxy (y = 0)
        { id: 'f_oxy', vertexIds: ['O', 'X_pos', 'oxy_1', 'Z_pos'], name: 'Mặt phẳng tọa độ (Oxz: y=0)', color: '#38bdf8', opacity: 0.15 },
        // Grid plane Oyx (z = 0)
        { id: 'f_oyx', vertexIds: ['O', 'X_pos', 'oxz_1', 'Y_pos'], name: 'Mặt phẳng tọa độ (Oxy: z=0)', color: '#a855f7', opacity: 0.15 },
        // Grid plane Oyz (x = 0)
        { id: 'f_oyz', vertexIds: ['O', 'Z_pos', 'oyz_1', 'Y_pos'], name: 'Mặt phẳng tọa độ (Oyz: x=0)', color: '#10b981', opacity: 0.15 },
      ];

      const rightAngleMarkers = [
        { vertex: [0, 0, 0] as [number, number, number], dir1: [1, 0, 0] as [number, number, number], dir2: [0, 1, 0] as [number, number, number], size: 0.4 },
        { vertex: [0, 0, 0] as [number, number, number], dir1: [1, 0, 0] as [number, number, number], dir2: [0, 0, 1] as [number, number, number], size: 0.4 },
        { vertex: [0, 0, 0] as [number, number, number], dir1: [0, 1, 0] as [number, number, number], dir2: [0, 0, 1] as [number, number, number], size: 0.4 },
      ];

      return { vertices, edges, faces, rightAngleMarkers };
    },
    calculateFormulas: (params, unit) => {
      const L = params.length ?? 4.5;
      return [
        {
          name: 'Vectơ đơn vị trục Ox',
          latexSymbol: '\\vec{i}',
          latexFormula: '\\vec{i} = (1, 0, 0)',
          substitution: '|\\vec{i}| = 1',
          result: 1,
          unit: 'đv',
          explanation: 'Vectơ chỉ phương của trục hoành Ox',
        },
        {
          name: 'Vectơ đơn vị trục Oy',
          latexSymbol: '\\vec{j}',
          latexFormula: '\\vec{j} = (0, 1, 0)',
          substitution: '|\\vec{j}| = 1',
          result: 1,
          unit: 'đv',
          explanation: 'Vectơ chỉ phương của trục tung Oy',
        },
        {
          name: 'Vectơ đơn vị trục Oz',
          latexSymbol: '\\vec{k}',
          latexFormula: '\\vec{k} = (0, 0, 1)',
          substitution: '|\\vec{k}| = 1',
          result: 1,
          unit: 'đv',
          explanation: 'Vectơ chỉ phương của trục cao Oz',
        },
        {
          name: 'Tích vô hướng giữa các cặp trục',
          latexSymbol: '\\vec{i} \\cdot \\vec{j} = \\vec{j} \\cdot \\vec{k} = \\vec{k} \\cdot \\vec{i}',
          latexFormula: '\\cos 90^\\circ = 0',
          substitution: '0',
          result: 0,
          unit: '',
          explanation: 'Ba trục vuông góc nhau từng đôi một',
        },
      ];
    },
  },

  // 24. Điểm và vectơ trong không gian
  {
    id: 'point_and_vector',
    name: 'Điểm và vectơ trong Oxyz',
    category: 'coordinate',
    categoryName: 'Hệ tọa độ không gian',
    gradeLevel: 'THPT',
    description: 'Biểu diễn điểm M(x, y, z) cùng vectơ vị trí OM = xi + yj + zk và các hình chiếu vuông góc lên các trục, các mặt phẳng tọa độ (hộp tọa độ).',
    tags: ['Tọa độ điểm', 'Vectơ vị trí', 'Hình chiếu'],
    params: [
      { id: 'x', label: 'Hoành độ x', min: -4, max: 4, step: 0.5, default: 2.5, unit: 'đv' },
      { id: 'y', label: 'Tung độ y', min: -4, max: 4, step: 0.5, default: 3, unit: 'đv' },
      { id: 'z', label: 'Cao độ z', min: -4, max: 4, step: 0.5, default: 2, unit: 'đv' },
    ],
    defaultParams: { x: 2.5, y: 3, z: 2 },
    educationalNotes: [
      'Điểm M(x, y, z) tương đương vectơ OM = x·i + y·j + z·k.',
      'Độ dài đoạn OM: |OM| = √(x² + y² + z²).',
      'Hình chiếu vuông góc của M lên trục Ox là M_x(x, 0, 0), lên Oy là M_y(0, y, 0), lên Oz là M_z(0, 0, z).',
      'Hình chiếu lên (Oxy) là M_xy(x, y, 0), lên (Oyz) là M_yz(0, y, z), lên (Ozx) là M_zx(x, 0, z).',
    ],
    generateGeometry: (params) => {
      const x = params.x ?? 2.5;
      const y = params.y ?? 3;
      const z = params.z ?? 2;
      const axisLen = Math.max(Math.abs(x), Math.abs(y), Math.abs(z), 3) + 1.2;

      const vertices = [
        { id: 'O', name: 'O(0,0,0)', pos: [0, 0, 0] as [number, number, number], color: '#94a3b8' },
        { id: 'M', name: `M(${x}, ${y}, ${z})`, pos: [x, y, z] as [number, number, number], color: '#f59e0b' },
        // Projections on axes
        { id: 'Mx', name: `Mx(${x},0,0)`, pos: [x, 0, 0] as [number, number, number], color: '#ef4444' },
        { id: 'My', name: `My(0,${y},0)`, pos: [0, y, 0] as [number, number, number], color: '#10b981' },
        { id: 'Mz', name: `Mz(0,0,${z})`, pos: [0, 0, z] as [number, number, number], color: '#3b82f6' },
        // Projections on planes
        { id: 'Mxy', name: `Mxy(${x},${y},0)`, pos: [x, y, 0] as [number, number, number], color: '#a855f7' },
        { id: 'Myz', name: `Myz(0,${y},${z})`, pos: [0, y, z] as [number, number, number], color: '#06b6d4' },
        { id: 'Mzx', name: `Mzx(${x},0,${z})`, pos: [x, 0, z] as [number, number, number], color: '#eab308' },
        // Axes ends
        { id: 'AxX', name: 'x', pos: [axisLen, 0, 0] as [number, number, number], color: '#ef4444' },
        { id: 'AxY', name: 'y', pos: [0, axisLen, 0] as [number, number, number], color: '#10b981' },
        { id: 'AxZ', name: 'z', pos: [0, 0, axisLen] as [number, number, number], color: '#3b82f6' },
      ];

      const edges = [
        // Main axes
        { id: 'ax_x', v1: 'O', v2: 'AxX', name: 'Ox', isAxis: true, color: '#ef4444' },
        { id: 'ax_y', v1: 'O', v2: 'AxY', name: 'Oy', isAxis: true, color: '#10b981' },
        { id: 'ax_z', v1: 'O', v2: 'AxZ', name: 'Oz', isAxis: true, color: '#3b82f6' },
        // Vector OM
        { id: 'vec_OM', v1: 'O', v2: 'M', name: 'Vectơ OM', color: '#f59e0b' },
        // Projection bounding box (dashed lines)
        { id: 'p_MMxy', v1: 'M', v2: 'Mxy', isHeight: true, color: '#94a3b8' },
        { id: 'p_MMxz', v1: 'M', v2: 'Mzx', isHeight: true, color: '#94a3b8' },
        { id: 'p_MMyz', v1: 'M', v2: 'Myz', isHeight: true, color: '#94a3b8' },
        { id: 'p_MxyMx', v1: 'Mxy', v2: 'Mx', isHeight: true, color: '#94a3b8' },
        { id: 'p_MxyMy', v1: 'Mxy', v2: 'My', isHeight: true, color: '#94a3b8' },
        { id: 'p_MzxMx', v1: 'Mzx', v2: 'Mx', isHeight: true, color: '#94a3b8' },
        { id: 'p_MzxMz', v1: 'Mzx', v2: 'Mz', isHeight: true, color: '#94a3b8' },
        { id: 'p_MyzMy', v1: 'Myz', v2: 'My', isHeight: true, color: '#94a3b8' },
        { id: 'p_MyzMz', v1: 'Myz', v2: 'Mz', isHeight: true, color: '#94a3b8' },
      ];

      const faces = [
        // Box faces forming projection prism
        { id: 'f_bot', vertexIds: ['O', 'Mx', 'Mxy', 'My'], name: 'Mặt phẳng hình chiếu Oxy', color: '#6366f1', opacity: 0.15 },
        { id: 'f_front', vertexIds: ['Mz', 'Mzx', 'M', 'Myz'], name: 'Mặt đối diện', color: '#6366f1', opacity: 0.15 },
      ];

      const rightAngleMarkers = [
        { vertex: [x, 0, z] as [number, number, number], dir1: [0, 1, 0] as [number, number, number], dir2: [-1, 0, 0] as [number, number, number], size: 0.3 },
      ];

      return { vertices, edges, faces, rightAngleMarkers };
    },
    calculateFormulas: (params, unit) => {
      const x = params.x ?? 2.5;
      const y = params.y ?? 3;
      const z = params.z ?? 2;
      const lengthOM = Math.sqrt(x * x + y * y + z * z);
      const dOxy = Math.abs(z);
      const dOyz = Math.abs(x);
      const dOzx = Math.abs(y);

      return [
        {
          name: 'Độ dài vectơ vị trí OM',
          latexSymbol: '|\\vec{OM}|',
          latexFormula: '|\\vec{OM}| = \\sqrt{x^2 + y^2 + z^2}',
          substitution: `\\sqrt{${x}^2 + ${y}^2 + ${z}^2} \\approx ${lengthOM.toFixed(2)}`,
          result: Number(lengthOM.toFixed(2)),
          unit,
          explanation: 'Khoảng cách từ gốc O đến điểm M',
        },
        {
          name: 'Khoảng cách từ M đến mặt phẳng (Oxy)',
          latexSymbol: 'd(M, (Oxy))',
          latexFormula: 'd = |z|',
          substitution: `|${z}| = ${dOxy}`,
          result: dOxy,
          unit,
          explanation: 'Độ dài đoạn vuông góc từ M hạ xuống mặt phẳng Oxy',
        },
        {
          name: 'Khoảng cách từ M đến trục Oz',
          latexSymbol: 'd(M, Oz)',
          latexFormula: 'd = \\sqrt{x^2 + y^2}',
          substitution: `\\sqrt{${x}^2 + ${y}^2} \\approx ${Math.hypot(x, y).toFixed(2)}`,
          result: Number(Math.hypot(x, y).toFixed(2)),
          unit,
          explanation: 'Bán kính hình trụ chiếu từ M quanh trục Oz',
        },
      ];
    },
  },

  // 25. Mặt phẳng trong hệ tọa độ Oxyz
  {
    id: 'plane_oxyz',
    name: 'Mặt phẳng trong Oxyz',
    category: 'coordinate',
    categoryName: 'Hệ tọa độ không gian',
    gradeLevel: 'THPT',
    description: 'Phương trình tổng quát mặt phẳng (P): Ax + By + Cz + D = 0. Hiển thị vectơ pháp tuyến n = (A, B, C) vuông góc với mặt phẳng và các giao điểm trên trục tọa độ.',
    tags: ['Mặt phẳng', 'Vectơ pháp tuyến', 'Oxyz'],
    params: [
      { id: 'A', label: 'Hệ số A (pháp tuyến)', min: -3, max: 3, step: 0.5, default: 1, unit: '' },
      { id: 'B', label: 'Hệ số B (pháp tuyến)', min: -3, max: 3, step: 0.5, default: 1.5, unit: '' },
      { id: 'C', label: 'Hệ số C (pháp tuyến)', min: 0.5, max: 3, step: 0.5, default: 1, unit: '' },
      { id: 'D', label: 'Hệ số tự do D', min: -6, max: 6, step: 0.5, default: -3, unit: '' },
    ],
    defaultParams: { A: 1, B: 1.5, C: 1, D: -3 },
    educationalNotes: [
      'Phương trình tổng quát: Ax + By + Cz + D = 0 với A² + B² + C² > 0.',
      'Vectơ n = (A, B, C) là vectơ pháp tuyến (vuông góc với mọi vectơ nằm trong mặt phẳng).',
      'Nếu A, B, C, D đều khác 0, ta có phương trình đoạn chắn: x/a + y/b + z/c = 1 với a = -D/A, b = -D/B, c = -D/C.',
      'Khoảng cách từ M0(x0, y0, z0) đến (P): d = |Ax0 + By0 + Cz0 + D| / √(A² + B² + C²).',
    ],
    generateGeometry: (params) => {
      const A = params.A ?? 1;
      const B = params.B ?? 1.5;
      const C = params.C ?? 1;
      const D = params.D ?? -3;

      // Intercepts
      const a = A !== 0 ? -D / A : 3;
      const b = B !== 0 ? -D / B : 3;
      const c = C !== 0 ? -D / C : 3;

      const normLen = Math.sqrt(A * A + B * B + C * C);
      const nx = (A / normLen) * 2;
      const ny = (B / normLen) * 2;
      const nz = (C / normLen) * 2;

      // Center point on plane for normal vector
      const cx = a / 3;
      const cy = b / 3;
      const cz = c / 3;

      const vertices = [
        { id: 'O', name: 'O(0,0,0)', pos: [0, 0, 0] as [number, number, number], color: '#94a3b8' },
        { id: 'A_pt', name: `A(${a.toFixed(1)},0,0)`, pos: [a, 0, 0] as [number, number, number], color: '#ef4444' },
        { id: 'B_pt', name: `B(0,${b.toFixed(1)},0)`, pos: [0, b, 0] as [number, number, number], color: '#10b981' },
        { id: 'C_pt', name: `C(0,0,${c.toFixed(1)})`, pos: [0, 0, c] as [number, number, number], color: '#3b82f6' },
        // Normal vector
        { id: 'M_cen', name: 'M (tâm tam giác)', pos: [cx, cy, cz] as [number, number, number], color: '#f59e0b' },
        { id: 'N_end', name: `n(${A}, ${B}, ${C})`, pos: [cx + nx, cy + ny, cz + nz] as [number, number, number], color: '#f59e0b' },
        // Axes
        { id: 'AxX', name: 'x', pos: [Math.max(a, 3) + 1.5, 0, 0] as [number, number, number] },
        { id: 'AxY', name: 'y', pos: [0, Math.max(b, 3) + 1.5, 0] as [number, number, number] },
        { id: 'AxZ', name: 'z', pos: [0, 0, Math.max(c, 3) + 1.5] as [number, number, number] },
      ];

      const edges = [
        { id: 'ax_x', v1: 'O', v2: 'AxX', isAxis: true, color: '#ef4444' },
        { id: 'ax_y', v1: 'O', v2: 'AxY', isAxis: true, color: '#10b981' },
        { id: 'ax_z', v1: 'O', v2: 'AxZ', isAxis: true, color: '#3b82f6' },
        // Intercept triangle edges
        { id: 'e_AB', v1: 'A_pt', v2: 'B_pt', color: '#6366f1' },
        { id: 'e_BC', v1: 'B_pt', v2: 'C_pt', color: '#6366f1' },
        { id: 'e_CA', v1: 'C_pt', v2: 'A_pt', color: '#6366f1' },
        // Normal vector line
        { id: 'e_norm', v1: 'M_cen', v2: 'N_end', name: 'Vectơ pháp tuyến n', color: '#f59e0b' },
      ];

      const faces = [
        { id: 'f_plane', vertexIds: ['A_pt', 'B_pt', 'C_pt'], name: 'Mặt phẳng (ABC)', color: '#8b5cf6', opacity: 0.6 },
      ];

      const rightAngleMarkers = [
        { vertex: [cx, cy, cz] as [number, number, number], dir1: [nx, ny, nz] as [number, number, number], dir2: [a - cx, -cy, -cz] as [number, number, number], size: 0.35 },
      ];

      return { vertices, edges, faces, rightAngleMarkers };
    },
    calculateFormulas: (params, unit) => {
      const A = params.A ?? 1;
      const B = params.B ?? 1.5;
      const C = params.C ?? 1;
      const D = params.D ?? -3;
      const normLen = Math.sqrt(A * A + B * B + C * C);
      const dO = Math.abs(D) / normLen;

      return [
        {
          name: 'Phương trình tổng quát',
          latexSymbol: '(P)',
          latexFormula: `${A}x + ${B}y + ${C}z + (${D}) = 0`,
          substitution: 'Ax + By + Cz + D = 0',
          result: 0,
          unit: '',
          explanation: 'Mỗi bộ ba số (A, B, C) không đồng thời bằng 0 xác định một mặt phẳng',
        },
        {
          name: 'Độ dài vectơ pháp tuyến |n|',
          latexSymbol: '|\\vec{n}|',
          latexFormula: '|\\vec{n}| = \\sqrt{A^2 + B^2 + C^2}',
          substitution: `\\sqrt{${A}^2 + ${B}^2 + ${C}^2} \\approx ${normLen.toFixed(2)}`,
          result: Number(normLen.toFixed(2)),
          unit,
          explanation: 'Độ lớn của vectơ pháp tuyến n = (A, B, C)',
        },
        {
          name: 'Khoảng cách từ gốc tọa độ O đến mặt phẳng',
          latexSymbol: 'd(O, (P))',
          latexFormula: 'd = \\frac{|D|}{\\sqrt{A^2 + B^2 + C^2}}',
          substitution: `\\frac{|${D}|}{${normLen.toFixed(2)}} \\approx ${dO.toFixed(2)}`,
          result: Number(dO.toFixed(2)),
          unit,
          explanation: 'Độ dài đoạn vuông góc hạ từ O(0,0,0) xuống (P)',
        },
      ];
    },
  },

  // 26. Đường thẳng trong không gian Oxyz
  {
    id: 'line_oxyz',
    name: 'Đường thẳng trong Oxyz',
    category: 'coordinate',
    categoryName: 'Hệ tọa độ không gian',
    gradeLevel: 'THPT',
    description: 'Đường thẳng Δ đi qua điểm M₀(x₀, y₀, z₀) và có vectơ chỉ phương u = (a, b, c). Thể hiện phương trình tham số và góc nghiêng với các trục.',
    tags: ['Đường thẳng', 'Vectơ chỉ phương', 'Oxyz'],
    params: [
      { id: 'x0', label: 'Điểm qua x0', min: -3, max: 3, step: 0.5, default: 1, unit: '' },
      { id: 'y0', label: 'Điểm qua y0', min: -3, max: 3, step: 0.5, default: 1, unit: '' },
      { id: 'z0', label: 'Điểm qua z0', min: -3, max: 3, step: 0.5, default: 0.5, unit: '' },
      { id: 'a', label: 'Vectơ u_x (a)', min: -2, max: 2, step: 0.5, default: 1.5, unit: '' },
      { id: 'b', label: 'Vectơ u_y (b)', min: -2, max: 2, step: 0.5, default: 1, unit: '' },
      { id: 'c', label: 'Vectơ u_z (c)', min: -2, max: 2, step: 0.5, default: 1.2, unit: '' },
    ],
    defaultParams: { x0: 1, y0: 1, z0: 0.5, a: 1.5, b: 1, c: 1.2 },
    educationalNotes: [
      'Phương trình tham số: x = x0 + at, y = y0 + bt, z = z0 + ct (t ∈ ℝ).',
      'Phương trình chính tắc (khi a, b, c ≠ 0): (x - x0)/a = (y - y0)/b = (z - z0)/c.',
      'Vectơ u = (a, b, c) song song hoặc trùng với đường thẳng Δ.',
    ],
    generateGeometry: (params) => {
      const x0 = params.x0 ?? 1;
      const y0 = params.y0 ?? 1;
      const z0 = params.z0 ?? 0.5;
      const a = params.a ?? 1.5;
      const b = params.b ?? 1;
      const c = params.c ?? 1.2;

      const tMin = -2.5;
      const tMax = 2.5;

      const pStart = [x0 + a * tMin, y0 + b * tMin, z0 + c * tMin] as [number, number, number];
      const pEnd = [x0 + a * tMax, y0 + b * tMax, z0 + c * tMax] as [number, number, number];

      const vertices = [
        { id: 'O', name: 'O(0,0,0)', pos: [0, 0, 0] as [number, number, number], color: '#94a3b8' },
        { id: 'M0', name: `M0(${x0}, ${y0}, ${z0})`, pos: [x0, y0, z0] as [number, number, number], color: '#ef4444' },
        { id: 'p_start', name: '', pos: pStart },
        { id: 'p_end', name: 'Đường thẳng Δ', pos: pEnd, color: '#38bdf8' },
        // Vector u marker
        { id: 'u_end', name: `u(${a}, ${b}, ${c})`, pos: [x0 + a, y0 + b, z0 + c] as [number, number, number], color: '#f59e0b' },
        // Axes
        { id: 'AxX', name: 'x', pos: [4, 0, 0] as [number, number, number] },
        { id: 'AxY', name: 'y', pos: [0, 4, 0] as [number, number, number] },
        { id: 'AxZ', name: 'z', pos: [0, 0, 4] as [number, number, number] },
      ];

      const edges = [
        { id: 'ax_x', v1: 'O', v2: 'AxX', isAxis: true, color: '#ef4444' },
        { id: 'ax_y', v1: 'O', v2: 'AxY', isAxis: true, color: '#10b981' },
        { id: 'ax_z', v1: 'O', v2: 'AxZ', isAxis: true, color: '#3b82f6' },
        // Line Δ
        { id: 'line_delta', v1: 'p_start', v2: 'p_end', name: 'Đường thẳng Δ', color: '#0284c7' },
        // Direction vector
        { id: 'vec_u', v1: 'M0', v2: 'u_end', name: 'Vectơ chỉ phương u', color: '#f59e0b' },
      ];

      const faces: any[] = [];

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const x0 = params.x0 ?? 1;
      const y0 = params.y0 ?? 1;
      const z0 = params.z0 ?? 0.5;
      const a = params.a ?? 1.5;
      const b = params.b ?? 1;
      const c = params.c ?? 1.2;
      const uLen = Math.sqrt(a * a + b * b + c * c);

      return [
        {
          name: 'Hệ phương trình tham số',
          latexSymbol: '\\Delta',
          latexFormula: `\\begin{cases} x = ${x0} + ${a}t \\\\ y = ${y0} + ${b}t \\\\ z = ${z0} + ${c}t \\end{cases}`,
          substitution: 't \\in \\mathbb{R}',
          result: 0,
          unit: '',
          explanation: 'Phương trình tham số của đường thẳng đi qua M0',
        },
        {
          name: 'Độ dài vectơ chỉ phương |u|',
          latexSymbol: '|\\vec{u}|',
          latexFormula: '|\\vec{u}| = \\sqrt{a^2 + b^2 + c^2}',
          substitution: `\\sqrt{${a}^2 + ${b}^2 + ${c}^2} \\approx ${uLen.toFixed(2)}`,
          result: Number(uLen.toFixed(2)),
          unit,
          explanation: 'Độ lớn vectơ chỉ phương',
        },
      ];
    },
  },
];
