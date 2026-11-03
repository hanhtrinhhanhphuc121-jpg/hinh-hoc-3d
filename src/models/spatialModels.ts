import { GeometryModel, FormulaStep, NetPolygon2D } from '../types/geometry';

export const spatialModels: GeometryModel[] = [
  // 1. Hình lập phương (Cube)
  {
    id: 'cube',
    name: 'Hình lập phương',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Hình đa diện có 6 mặt đều là các hình vuông bằng nhau, 8 đỉnh và 12 cạnh bằng nhau.',
    tags: ['Đa diện đều', 'Lăng trụ', 'Khối đa diện'],
    params: [
      { id: 'a', label: 'Độ dài cạnh (a)', min: 1, max: 6, step: 0.5, default: 3, unit: 'cm' },
    ],
    defaultParams: { a: 3 },
    educationalNotes: [
      'Có 6 mặt là hình vuông bằng nhau.',
      '12 cạnh có độ dài bằng nhau.',
      'Có 8 đỉnh, mỗi đỉnh là đỉnh chung của đúng 3 cạnh.',
      'Có 9 mặt phẳng đối xứng và 4 đường chéo cắt nhau tại trung điểm mỗi đường.',
    ],
    generateGeometry: (params) => {
      const a = params.a ?? 3;
      const h2 = a / 2;
      const vertices = [
        { id: 'A', name: 'A', pos: [-h2, -h2, -h2] as [number, number, number] },
        { id: 'B', name: 'B', pos: [h2, -h2, -h2] as [number, number, number] },
        { id: 'C', name: 'C', pos: [h2, -h2, h2] as [number, number, number] },
        { id: 'D', name: 'D', pos: [-h2, -h2, h2] as [number, number, number] },
        { id: "A'", name: "A'", pos: [-h2, h2, -h2] as [number, number, number] },
        { id: "B'", name: "B'", pos: [h2, h2, -h2] as [number, number, number] },
        { id: "C'", name: "C'", pos: [h2, h2, h2] as [number, number, number] },
        { id: "D'", name: "D'", pos: [-h2, h2, h2] as [number, number, number] },
      ];

      const edges = [
        // Đáy dưới ABCD
        { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
        { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
        { id: 'e_CD', v1: 'C', v2: 'D', name: 'CD' },
        { id: 'e_DA', v1: 'D', v2: 'A', name: 'DA' },
        // Đáy trên A'B'C'D'
        { id: 'e_ApBp', v1: "A'", v2: "B'", name: "A'B'" },
        { id: 'e_BpCp', v1: "B'", v2: "C'", name: "B'C'" },
        { id: 'e_CpDp', v1: "C'", v2: "D'", name: "C'D'" },
        { id: 'e_DpAp', v1: "D'", v2: "A'", name: "D'A'" },
        // Cạnh bên
        { id: 'e_AAp', v1: 'A', v2: "A'", name: "AA'" },
        { id: 'e_BBp', v1: 'B', v2: "B'", name: "BB'" },
        { id: 'e_CCp', v1: 'C', v2: "C'", name: "CC'" },
        { id: 'e_DDp', v1: 'D', v2: "D'", name: "DD'" },
      ];

      const faces = [
        // Đáy dưới (normal hướng xuống -Y)
        { id: 'f_bottom', vertexIds: ['A', 'B', 'C', 'D'], name: 'Đáy ABCD', color: '#6366f1' },
        // Đáy trên (normal hướng lên +Y)
        { id: 'f_top', vertexIds: ["A'", "D'", "C'", "B'"], name: "Đáy A'B'C'D'", color: '#6366f1' },
        // Mặt trước (normal hướng +Z)
        { id: 'f_front', vertexIds: ['D', 'C', "C'", "D'"], name: "Mặt CDD'C'", color: '#818cf8' },
        // Mặt sau (normal hướng -Z)
        { id: 'f_back', vertexIds: ['B', 'A', "A'", "B'"], name: "Mặt ABB'A'", color: '#818cf8' },
        // Mặt trái (normal hướng -X)
        { id: 'f_left', vertexIds: ['A', 'D', "D'", "A'"], name: "Mặt ADD'A'", color: '#a5b4fc' },
        // Mặt phải (normal hướng +X)
        { id: 'f_right', vertexIds: ['C', 'B', "B'", "C'"], name: "Mặt BCC'B'", color: '#a5b4fc' },
      ];

      const rightAngleMarkers = [
        { vertex: [-h2, -h2, -h2] as [number, number, number], dir1: [1, 0, 0] as [number, number, number], dir2: [0, 1, 0] as [number, number, number], size: 0.3 },
        { vertex: [-h2, -h2, -h2] as [number, number, number], dir1: [1, 0, 0] as [number, number, number], dir2: [0, 0, 1] as [number, number, number], size: 0.3 },
      ];

      return { vertices, edges, faces, rightAngleMarkers };
    },
    calculateFormulas: (params, unit) => {
      const a = params.a ?? 3;
      const S_day = a * a;
      const S_xq = 4 * a * a;
      const S_tp = 6 * a * a;
      const V = a * a * a;
      const d = a * Math.sqrt(3);

      return [
        {
          name: 'Diện tích một mặt đáy',
          latexSymbol: 'S_đ',
          latexFormula: 'S_đ = a^2',
          substitution: `${a}^2 = ${S_day}`,
          result: Number(S_day.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích của một mặt vuông với cạnh a',
        },
        {
          name: 'Diện tích xung quanh',
          latexSymbol: 'S_{xq}',
          latexFormula: 'S_{xq} = 4a^2',
          substitution: `4 \\times ${a}^2 = 4 \\times ${S_day} = ${S_xq}`,
          result: Number(S_xq.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Tổng diện tích của 4 mặt bên',
        },
        {
          name: 'Diện tích toàn phần',
          latexSymbol: 'S_{tp}',
          latexFormula: 'S_{tp} = 6a^2',
          substitution: `6 \\times ${a}^2 = 6 \\times ${S_day} = ${S_tp}`,
          result: Number(S_tp.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Tổng diện tích của tất cả 6 mặt',
        },
        {
          name: 'Thể tích hình lập phương',
          latexSymbol: 'V',
          latexFormula: 'V = a^3',
          substitution: `${a}^3 = ${V}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Tích ba kích thước dài × rộng × cao (a = b = c)',
        },
        {
          name: 'Độ dài đường chéo không gian',
          latexSymbol: 'd',
          latexFormula: 'd = a\\sqrt{3}',
          substitution: `${a}\\sqrt{3} \\approx ${d.toFixed(2)}`,
          result: Number(d.toFixed(2)),
          unit,
          explanation: 'Đoạn nối hai đỉnh đối diện nhau qua tâm khối',
        },
      ];
    },
    netDefinition: {
      canUnfold: true,
      unfoldTitle: 'Hình khai triển chữ T (Cross Net)',
      explanation: 'Khối lập phương mở phẳng thành hình chữ thập gồm 6 hình vuông cạnh a.',
      unfold2DPolygons: (params) => {
        const a = (params.a ?? 3) * 20; // scale for 2D canvas
        // 6 squares arranged as a cross
        return [
          { id: 'sq_center', name: 'Đáy', points: [[0, 0], [a, 0], [a, a], [0, a]], color: '#e0e7ff', strokeColor: '#4f46e5' },
          { id: 'sq_top', name: 'Mặt trên', points: [[0, -a], [a, -a], [a, 0], [0, 0]], color: '#c7d2fe', strokeColor: '#4f46e5' },
          { id: 'sq_bottom', name: 'Mặt dưới', points: [[0, a], [a, a], [a, 2 * a], [0, 2 * a]], color: '#c7d2fe', strokeColor: '#4f46e5' },
          { id: 'sq_far_bottom', name: 'Mặt nắp', points: [[0, 2 * a], [a, 2 * a], [a, 3 * a], [0, 3 * a]], color: '#a5b4fc', strokeColor: '#4f46e5' },
          { id: 'sq_left', name: 'Mặt trái', points: [[-a, 0], [0, 0], [0, a], [-a, a]], color: '#c7d2fe', strokeColor: '#4f46e5' },
          { id: 'sq_right', name: 'Mặt phải', points: [[a, 0], [2 * a, 0], [2 * a, a], [a, a]], color: '#c7d2fe', strokeColor: '#4f46e5' },
        ];
      },
    },
    guidedSteps: [
      {
        id: 1,
        title: 'Đếm số đỉnh, cạnh, mặt',
        question: 'Hãy xoay hình 3D và đếm xem hình lập phương có bao nhiêu đỉnh, bao nhiêu cạnh và bao nhiêu mặt?',
        hint: 'Đếm 4 đỉnh đáy dưới và 4 đỉnh đáy trên. Đếm các cạnh đáy và các cạnh bên.',
        answerExplanation: 'Hình lập phương có đúng 8 đỉnh, 12 cạnh bằng nhau và 6 mặt hình vuông bằng nhau.',
        expectedObservation: '8 đỉnh, 12 cạnh, 6 mặt.',
      },
      {
        id: 2,
        title: 'Mối quan hệ vuông góc',
        question: 'Mỗi cạnh bên như AA\' có vuông góc với mặt phẳng đáy (ABCD) không?',
        hint: 'AA\' vuông góc với cả AB và AD tại đỉnh A.',
        answerExplanation: 'Vì AA\' ⟂ AB và AA\' ⟂ AD mà AB, AD cắt nhau trong mp(ABCD), nên cạnh bên AA\' vuông góc với toàn bộ mặt đáy.',
        expectedObservation: 'Cạnh bên vuông góc với mặt đáy.',
      },
      {
        id: 3,
        title: 'Đường chéo và thể tích',
        question: 'Khi cạnh a tăng gấp đôi thì thể tích V tăng lên bao nhiêu lần?',
        hint: 'Công thức V = a³. Thay a bằng 2a.',
        answerExplanation: 'V\' = (2a)³ = 8a³ = 8V. Khi cạnh tăng 2 lần thì thể tích tăng 8 lần!',
        expectedObservation: 'Thể tích tăng 8 lần.',
      },
    ],
  },

  // 2. Hình hộp chữ nhật (Rectangular Parallelepiped)
  {
    id: 'box',
    name: 'Hình hộp chữ nhật',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Hình lăng trụ có đáy là hình chữ nhật và các cạnh bên vuông góc với mặt đáy. Có 6 mặt đều là hình chữ nhật.',
    tags: ['Lăng trụ đứng', 'Khối hộp'],
    params: [
      { id: 'a', label: 'Chiều dài (a)', min: 1, max: 6, step: 0.5, default: 4, unit: 'cm' },
      { id: 'b', label: 'Chiều rộng (b)', min: 1, max: 6, step: 0.5, default: 2.5, unit: 'cm' },
      { id: 'c', label: 'Chiều cao (c)', min: 1, max: 6, step: 0.5, default: 3, unit: 'cm' },
    ],
    defaultParams: { a: 4, b: 2.5, c: 3 },
    educationalNotes: [
      'Có 6 mặt là hình chữ nhật, các mặt đối diện bằng nhau từng đôi một.',
      '12 cạnh chia thành 3 nhóm có độ dài bằng nhau: chiều dài (a), chiều rộng (b), chiều cao (c).',
      '4 đường chéo có độ dài bằng nhau và cắt nhau tại trung điểm mỗi đường.',
    ],
    generateGeometry: (params) => {
      const a = params.a ?? 4;
      const b = params.b ?? 2.5;
      const c = params.c ?? 3;
      const x2 = a / 2;
      const y2 = c / 2;
      const z2 = b / 2;

      const vertices = [
        { id: 'A', name: 'A', pos: [-x2, -y2, -z2] as [number, number, number] },
        { id: 'B', name: 'B', pos: [x2, -y2, -z2] as [number, number, number] },
        { id: 'C', name: 'C', pos: [x2, -y2, z2] as [number, number, number] },
        { id: 'D', name: 'D', pos: [-x2, -y2, z2] as [number, number, number] },
        { id: "A'", name: "A'", pos: [-x2, y2, -z2] as [number, number, number] },
        { id: "B'", name: "B'", pos: [x2, y2, -z2] as [number, number, number] },
        { id: "C'", name: "C'", pos: [x2, y2, z2] as [number, number, number] },
        { id: "D'", name: "D'", pos: [-x2, y2, z2] as [number, number, number] },
      ];

      const edges = [
        { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
        { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
        { id: 'e_CD', v1: 'C', v2: 'D', name: 'CD' },
        { id: 'e_DA', v1: 'D', v2: 'A', name: 'DA' },
        { id: 'e_ApBp', v1: "A'", v2: "B'", name: "A'B'" },
        { id: 'e_BpCp', v1: "B'", v2: "C'", name: "B'C'" },
        { id: 'e_CpDp', v1: "C'", v2: "D'", name: "C'D'" },
        { id: 'e_DpAp', v1: "D'", v2: "A'", name: "D'A'" },
        { id: 'e_AAp', v1: 'A', v2: "A'", name: "AA'" },
        { id: 'e_BBp', v1: 'B', v2: "B'", name: "BB'" },
        { id: 'e_CCp', v1: 'C', v2: "C'", name: "CC'" },
        { id: 'e_DDp', v1: 'D', v2: "D'", name: "DD'" },
      ];

      const faces = [
        { id: 'f_bottom', vertexIds: ['A', 'B', 'C', 'D'], name: 'Đáy ABCD', color: '#0ea5e9' },
        { id: 'f_top', vertexIds: ["A'", "D'", "C'", "B'"], name: "Đáy A'B'C'D'", color: '#0ea5e9' },
        { id: 'f_front', vertexIds: ['D', 'C', "C'", "D'"], name: "Mặt CDD'C'", color: '#38bdf8' },
        { id: 'f_back', vertexIds: ['B', 'A', "A'", "B'"], name: "Mặt ABB'A'", color: '#38bdf8' },
        { id: 'f_left', vertexIds: ['A', 'D', "D'", "A'"], name: "Mặt ADD'A'", color: '#7dd3fc' },
        { id: 'f_right', vertexIds: ['C', 'B', "B'", "C'"], name: "Mặt BCC'B'", color: '#7dd3fc' },
      ];

      const rightAngleMarkers = [
        { vertex: [-x2, -y2, -z2] as [number, number, number], dir1: [1, 0, 0] as [number, number, number], dir2: [0, 1, 0] as [number, number, number], size: 0.3 },
      ];

      return { vertices, edges, faces, rightAngleMarkers };
    },
    calculateFormulas: (params, unit) => {
      const a = params.a ?? 4;
      const b = params.b ?? 2.5;
      const c = params.c ?? 3;
      const S_day = a * b;
      const P_day = 2 * (a + b);
      const S_xq = 2 * (a + b) * c;
      const S_tp = S_xq + 2 * S_day;
      const V = a * b * c;
      const d = Math.sqrt(a * a + b * b + c * c);

      return [
        {
          name: 'Diện tích mặt đáy',
          latexSymbol: 'S_đ',
          latexFormula: 'S_đ = a \\times b',
          substitution: `${a} \\times ${b} = ${S_day}`,
          result: Number(S_day.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích hình chữ nhật đáy',
        },
        {
          name: 'Chu vi đáy',
          latexSymbol: 'P_đ',
          latexFormula: 'P_đ = 2(a + b)',
          substitution: `2(${a} + ${b}) = ${P_day}`,
          result: Number(P_day.toFixed(2)),
          unit,
          explanation: 'Chu vi đường bao của đáy',
        },
        {
          name: 'Diện tích xung quanh',
          latexSymbol: 'S_{xq}',
          latexFormula: 'S_{xq} = 2(a + b)c = P_đ \\times c',
          substitution: `2(${a} + ${b}) \\times ${c} = ${S_xq}`,
          result: Number(S_xq.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Chu vi đáy nhân với chiều cao',
        },
        {
          name: 'Diện tích toàn phần',
          latexSymbol: 'S_{tp}',
          latexFormula: 'S_{tp} = S_{xq} + 2S_đ',
          substitution: `${S_xq} + 2 \\times ${S_day} = ${S_tp}`,
          result: Number(S_tp.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Tổng diện tích xung quanh và hai đáy',
        },
        {
          name: 'Thể tích hình hộp chữ nhật',
          latexSymbol: 'V',
          latexFormula: 'V = a \\times b \\times c = S_đ \\times c',
          substitution: `${a} \\times ${b} \\times ${c} = ${V}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Tích 3 kích thước: dài × rộng × cao',
        },
        {
          name: 'Độ dài đường chéo không gian',
          latexSymbol: 'd',
          latexFormula: 'd = \\sqrt{a^2 + b^2 + c^2}',
          substitution: `\\sqrt{${a}^2 + ${b}^2 + ${c}^2} \\approx ${d.toFixed(2)}`,
          result: Number(d.toFixed(2)),
          unit,
          explanation: 'Đường chéo từ một đỉnh đến đỉnh đối diện qua tâm',
        },
      ];
    },
    netDefinition: {
      canUnfold: true,
      unfoldTitle: 'Khai triển hình hộp chữ nhật',
      explanation: 'Mở phẳng 4 mặt bên thành dải chữ nhật dài (a+b+a+b) nhân c, gắn kèm 2 nắp đáy axb.',
      unfold2DPolygons: (params) => {
        const a = (params.a ?? 4) * 15;
        const b = (params.b ?? 2.5) * 15;
        const c = (params.c ?? 3) * 15;
        return [
          { id: 'f1', name: 'Mặt trước (a×c)', points: [[0, 0], [a, 0], [a, c], [0, c]], color: '#bae6fd', strokeColor: '#0284c7' },
          { id: 'f2', name: 'Mặt phải (b×c)', points: [[a, 0], [a + b, 0], [a + b, c], [a, c]], color: '#e0f2fe', strokeColor: '#0284c7' },
          { id: 'f3', name: 'Mặt sau (a×c)', points: [[a + b, 0], [2 * a + b, 0], [2 * a + b, c], [a + b, c]], color: '#bae6fd', strokeColor: '#0284c7' },
          { id: 'f4', name: 'Mặt trái (b×c)', points: [[2 * a + b, 0], [2 * (a + b), 0], [2 * (a + b), c], [2 * a + b, c]], color: '#e0f2fe', strokeColor: '#0284c7' },
          { id: 'f_top', name: 'Đáy trên (a×b)', points: [[0, -b], [a, -b], [a, 0], [0, 0]], color: '#7dd3fc', strokeColor: '#0284c7' },
          { id: 'f_bot', name: 'Đáy dưới (a×b)', points: [[0, c], [a, c], [a, c + b], [0, c + b]], color: '#7dd3fc', strokeColor: '#0284c7' },
        ];
      },
    },
    guidedSteps: [
      {
        id: 1,
        title: 'Mối quan hệ song song',
        question: 'Hãy chỉ ra các cặp mặt phẳng song song với nhau trong hình hộp chữ nhật?',
        hint: 'Quan sát hai mặt đáy và các mặt đối diện.',
        answerExplanation: 'Có 3 cặp mặt đối diện song song: (ABCD) // (A\'B\'C\'D\'), (ABB\'A\') // (CDD\'C\'), (ADD\'A\') // (BCC\'B\').',
        expectedObservation: '3 cặp mặt đối diện song song.',
      },
    ],
  },

  // 3. Hình hộp xiên (Oblique Parallelepiped)
  {
    id: 'oblique_box',
    name: 'Hình hộp xiên',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'THPT',
    description: 'Hình lăng trụ có đáy là hình bình hành hoặc hình chữ nhật, các cạnh bên không vuông góc với đáy mà nghiêng một góc α.',
    tags: ['Lăng trụ xiên', 'Khối hộp'],
    params: [
      { id: 'a', label: 'Cạnh đáy a', min: 1, max: 5, step: 0.5, default: 3, unit: 'cm' },
      { id: 'b', label: 'Cạnh đáy b', min: 1, max: 5, step: 0.5, default: 2.5, unit: 'cm' },
      { id: 'h', label: 'Chiều cao h', min: 1, max: 5, step: 0.5, default: 3, unit: 'cm' },
      { id: 'tilt', label: 'Độ nghiêng (denta x)', min: 0.2, max: 2, step: 0.2, default: 1, unit: 'cm' },
    ],
    defaultParams: { a: 3, b: 2.5, h: 3, tilt: 1 },
    educationalNotes: [
      'Cạnh bên không vuông góc với mặt phẳng đáy.',
      'Độ dài cạnh bên lớn hơn chiều cao vuông góc h: l = √(h² + tilt²).',
      'Thể tích luôn bằng diện tích đáy nhân với chiều cao vuông góc h (nguyên lý Cavalieri).',
    ],
    generateGeometry: (params) => {
      const a = params.a ?? 3;
      const b = params.b ?? 2.5;
      const h = params.h ?? 3;
      const tilt = params.tilt ?? 1;

      const x2 = a / 2;
      const z2 = b / 2;
      const y2 = h / 2;

      // Base bottom centered at y = -y2, top shifted by tilt at x
      const vertices = [
        { id: 'A', name: 'A', pos: [-x2, -y2, -z2] as [number, number, number] },
        { id: 'B', name: 'B', pos: [x2, -y2, -z2] as [number, number, number] },
        { id: 'C', name: 'C', pos: [x2, -y2, z2] as [number, number, number] },
        { id: 'D', name: 'D', pos: [-x2, -y2, z2] as [number, number, number] },
        { id: "A'", name: "A'", pos: [-x2 + tilt, y2, -z2] as [number, number, number] },
        { id: "B'", name: "B'", pos: [x2 + tilt, y2, -z2] as [number, number, number] },
        { id: "C'", name: "C'", pos: [x2 + tilt, y2, z2] as [number, number, number] },
        { id: "D'", name: "D'", pos: [-x2 + tilt, y2, z2] as [number, number, number] },
        // Height foot H on bottom
        { id: 'H', name: 'H', pos: [-x2 + tilt, -y2, -z2] as [number, number, number], color: '#f43f5e' },
      ];

      const edges = [
        { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
        { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
        { id: 'e_CD', v1: 'C', v2: 'D', name: 'CD' },
        { id: 'e_DA', v1: 'D', v2: 'A', name: 'DA' },
        { id: 'e_ApBp', v1: "A'", v2: "B'", name: "A'B'" },
        { id: 'e_BpCp', v1: "B'", v2: "C'", name: "B'C'" },
        { id: 'e_CpDp', v1: "C'", v2: "D'", name: "C'D'" },
        { id: 'e_DpAp', v1: "D'", v2: "A'", name: "D'A'" },
        { id: 'e_AAp', v1: 'A', v2: "A'", name: "AA'", isSlant: true },
        { id: 'e_BBp', v1: 'B', v2: "B'", name: "BB'", isSlant: true },
        { id: 'e_CCp', v1: 'C', v2: "C'", name: "CC'", isSlant: true },
        { id: 'e_DDp', v1: 'D', v2: "D'", name: "DD'", isSlant: true },
        // Height line A'H
        { id: 'e_ApH', v1: "A'", v2: 'H', name: "A'H (chiều cao)", isHeight: true },
      ];

      const faces = [
        { id: 'f_bottom', vertexIds: ['A', 'B', 'C', 'D'], name: 'Đáy ABCD', color: '#10b981' },
        { id: 'f_top', vertexIds: ["A'", "D'", "C'", "B'"], name: "Đáy A'B'C'D'", color: '#10b981' },
        { id: 'f_front', vertexIds: ['D', 'C', "C'", "D'"], name: "Mặt CDD'C'", color: '#34d399' },
        { id: 'f_back', vertexIds: ['B', 'A', "A'", "B'"], name: "Mặt ABB'A'", color: '#34d399' },
        { id: 'f_left', vertexIds: ['A', 'D', "D'", "A'"], name: "Mặt ADD'A'", color: '#6ee7b7' },
        { id: 'f_right', vertexIds: ['C', 'B', "B'", "C'"], name: "Mặt BCC'B'", color: '#6ee7b7' },
      ];

      const rightAngleMarkers = [
        { vertex: [-x2 + tilt, -y2, -z2] as [number, number, number], dir1: [-1, 0, 0] as [number, number, number], dir2: [0, 1, 0] as [number, number, number], size: 0.3 },
      ];

      return { vertices, edges, faces, rightAngleMarkers };
    },
    calculateFormulas: (params, unit) => {
      const a = params.a ?? 3;
      const b = params.b ?? 2.5;
      const h = params.h ?? 3;
      const tilt = params.tilt ?? 1;
      const S_day = a * b;
      const slantEdge = Math.sqrt(h * h + tilt * tilt);
      const V = S_day * h;

      return [
        {
          name: 'Diện tích đáy',
          latexSymbol: 'S_đ',
          latexFormula: 'S_đ = a \\times b',
          substitution: `${a} \\times ${b} = ${S_day}`,
          result: Number(S_day.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích mặt đáy hình chữ nhật',
        },
        {
          name: 'Chiều cao vuông góc',
          latexSymbol: 'h',
          latexFormula: 'h = d(đáy_1, đáy_2)',
          substitution: `${h}`,
          result: h,
          unit,
          explanation: 'Khoảng cách vuông góc giữa hai mặt phẳng đáy',
        },
        {
          name: 'Độ dài cạnh bên (xiên)',
          latexSymbol: 'l',
          latexFormula: 'l = \\sqrt{h^2 + \\Delta x^2}',
          substitution: `\\sqrt{${h}^2 + ${tilt}^2} \\approx ${slantEdge.toFixed(2)}`,
          result: Number(slantEdge.toFixed(2)),
          unit,
          explanation: 'Cạnh bên dài hơn chiều cao h do độ nghiêng',
        },
        {
          name: 'Thể tích hình hộp xiên',
          latexSymbol: 'V',
          latexFormula: 'V = S_đ \\times h',
          substitution: `${S_day} \\times ${h} = ${V}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'V vẫn bằng diện tích đáy nhân chiều cao vuông góc h (không phụ thuộc góc nghiêng)',
        },
      ];
    },
  },

  // 4. Hình lăng trụ đứng (Right Prism - tứ giác)
  {
    id: 'right_prism',
    name: 'Hình lăng trụ đứng',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Hình lăng trụ có các cạnh bên vuông góc với các mặt phẳng đáy. Các mặt bên là các hình chữ nhật.',
    tags: ['Lăng trụ đứng', 'Hình lăng trụ'],
    params: [
      { id: 'a', label: 'Cạnh đáy a', min: 1, max: 5, step: 0.5, default: 3, unit: 'cm' },
      { id: 'b', label: 'Cạnh đáy b', min: 1, max: 5, step: 0.5, default: 2.5, unit: 'cm' },
      { id: 'h', label: 'Chiều cao (cạnh bên)', min: 1, max: 6, step: 0.5, default: 4, unit: 'cm' },
    ],
    defaultParams: { a: 3, b: 2.5, h: 4 },
    educationalNotes: [
      'Cạnh bên vuông góc với đáy nên độ dài cạnh bên bằng chính chiều cao h của lăng trụ.',
      'Hai mặt đáy là hai đa giác bằng nhau và nằm trên hai mặt phẳng song song.',
      'Các mặt bên là những hình chữ nhật.',
    ],
    generateGeometry: (params) => {
      const a = params.a ?? 3;
      const b = params.b ?? 2.5;
      const h = params.h ?? 4;
      const x2 = a / 2;
      const y2 = h / 2;
      const z2 = b / 2;

      const vertices = [
        { id: 'A', name: 'A', pos: [-x2, -y2, -z2] as [number, number, number] },
        { id: 'B', name: 'B', pos: [x2, -y2, -z2] as [number, number, number] },
        { id: 'C', name: 'C', pos: [x2, -y2, z2] as [number, number, number] },
        { id: 'D', name: 'D', pos: [-x2, -y2, z2] as [number, number, number] },
        { id: "A'", name: "A'", pos: [-x2, y2, -z2] as [number, number, number] },
        { id: "B'", name: "B'", pos: [x2, y2, -z2] as [number, number, number] },
        { id: "C'", name: "C'", pos: [x2, y2, z2] as [number, number, number] },
        { id: "D'", name: "D'", pos: [-x2, y2, z2] as [number, number, number] },
      ];

      const edges = [
        { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
        { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
        { id: 'e_CD', v1: 'C', v2: 'D', name: 'CD' },
        { id: 'e_DA', v1: 'D', v2: 'A', name: 'DA' },
        { id: 'e_ApBp', v1: "A'", v2: "B'", name: "A'B'" },
        { id: 'e_BpCp', v1: "B'", v2: "C'", name: "B'C'" },
        { id: 'e_CpDp', v1: "C'", v2: "D'", name: "C'D'" },
        { id: 'e_DpAp', v1: "D'", v2: "A'", name: "D'A'" },
        { id: 'e_AAp', v1: 'A', v2: "A'", name: "AA'" },
        { id: 'e_BBp', v1: 'B', v2: "B'", name: "BB'" },
        { id: 'e_CCp', v1: 'C', v2: "C'", name: "CC'" },
        { id: 'e_DDp', v1: 'D', v2: "D'", name: "DD'" },
      ];

      const faces = [
        { id: 'f_bottom', vertexIds: ['A', 'B', 'C', 'D'], name: 'Đáy ABCD', color: '#6366f1' },
        { id: 'f_top', vertexIds: ["A'", "D'", "C'", "B'"], name: "Đáy A'B'C'D'", color: '#6366f1' },
        { id: 'f_front', vertexIds: ['D', 'C', "C'", "D'"], name: "Mặt CDD'C'", color: '#818cf8' },
        { id: 'f_back', vertexIds: ['B', 'A', "A'", "B'"], name: "Mặt ABB'A'", color: '#818cf8' },
        { id: 'f_left', vertexIds: ['A', 'D', "D'", "A'"], name: "Mặt ADD'A'", color: '#a5b4fc' },
        { id: 'f_right', vertexIds: ['C', 'B', "B'", "C'"], name: "Mặt BCC'B'", color: '#a5b4fc' },
      ];

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const a = params.a ?? 3;
      const b = params.b ?? 2.5;
      const h = params.h ?? 4;
      const S_day = a * b;
      const P_day = 2 * (a + b);
      const S_xq = P_day * h;
      const S_tp = S_xq + 2 * S_day;
      const V = S_day * h;

      return [
        {
          name: 'Diện tích đáy',
          latexSymbol: 'S_đ',
          latexFormula: 'S_đ = a \\times b',
          substitution: `${a} \\times ${b} = ${S_day}`,
          result: Number(S_day.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích mặt đáy',
        },
        {
          name: 'Chu vi đáy',
          latexSymbol: 'P_đ',
          latexFormula: 'P_đ = 2(a + b)',
          substitution: `2(${a} + ${b}) = ${P_day}`,
          result: Number(P_day.toFixed(2)),
          unit,
          explanation: 'Chu vi đa giác đáy',
        },
        {
          name: 'Diện tích xung quanh',
          latexSymbol: 'S_{xq}',
          latexFormula: 'S_{xq} = P_đ \\times h',
          substitution: `${P_day} \\times ${h} = ${S_xq}`,
          result: Number(S_xq.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Chu vi đáy nhân với chiều cao',
        },
        {
          name: 'Thể tích lăng trụ đứng',
          latexSymbol: 'V',
          latexFormula: 'V = S_đ \\times h',
          substitution: `${S_day} \\times ${h} = ${V}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Diện tích đáy nhân chiều cao',
        },
      ];
    },
  },

  // 5. Hình lăng trụ xiên (Oblique Prism)
  {
    id: 'oblique_prism',
    name: 'Hình lăng trụ xiên',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'THPT',
    description: 'Hình lăng trụ có cạnh bên không vuông góc với mặt phẳng đáy. Các mặt bên là những hình bình hành.',
    tags: ['Lăng trụ xiên'],
    params: [
      { id: 'a', label: 'Cạnh đáy a', min: 1, max: 5, step: 0.5, default: 3, unit: 'cm' },
      { id: 'b', label: 'Cạnh đáy b', min: 1, max: 5, step: 0.5, default: 2.5, unit: 'cm' },
      { id: 'h', label: 'Chiều cao vuông góc h', min: 1, max: 5, step: 0.5, default: 3.5, unit: 'cm' },
      { id: 'shift', label: 'Độ lệch cạnh bên', min: 0.5, max: 2, step: 0.25, default: 1.2, unit: 'cm' },
    ],
    defaultParams: { a: 3, b: 2.5, h: 3.5, shift: 1.2 },
    educationalNotes: [
      'Các mặt bên là hình bình hành (không phải hình chữ nhật như lăng trụ đứng).',
      'Độ dài cạnh bên l = √(h² + shift²).',
      'Thể tích V = S_đáy × h (h là khoảng cách vuông góc giữa hai đáy).',
    ],
    generateGeometry: (params) => {
      const a = params.a ?? 3;
      const b = params.b ?? 2.5;
      const h = params.h ?? 3.5;
      const shift = params.shift ?? 1.2;
      const x2 = a / 2;
      const y2 = h / 2;
      const z2 = b / 2;

      const vertices = [
        { id: 'A', name: 'A', pos: [-x2, -y2, -z2] as [number, number, number] },
        { id: 'B', name: 'B', pos: [x2, -y2, -z2] as [number, number, number] },
        { id: 'C', name: 'C', pos: [x2, -y2, z2] as [number, number, number] },
        { id: 'D', name: 'D', pos: [-x2, -y2, z2] as [number, number, number] },
        { id: "A'", name: "A'", pos: [-x2 + shift, y2, -z2 + 0.3 * shift] as [number, number, number] },
        { id: "B'", name: "B'", pos: [x2 + shift, y2, -z2 + 0.3 * shift] as [number, number, number] },
        { id: "C'", name: "C'", pos: [x2 + shift, y2, z2 + 0.3 * shift] as [number, number, number] },
        { id: "D'", name: "D'", pos: [-x2 + shift, y2, z2 + 0.3 * shift] as [number, number, number] },
      ];

      const edges = [
        { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
        { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
        { id: 'e_CD', v1: 'C', v2: 'D', name: 'CD' },
        { id: 'e_DA', v1: 'D', v2: 'A', name: 'DA' },
        { id: 'e_ApBp', v1: "A'", v2: "B'", name: "A'B'" },
        { id: 'e_BpCp', v1: "B'", v2: "C'", name: "B'C'" },
        { id: 'e_CpDp', v1: "C'", v2: "D'", name: "C'D'" },
        { id: 'e_DpAp', v1: "D'", v2: "A'", name: "D'A'" },
        { id: 'e_AAp', v1: 'A', v2: "A'", name: "AA'", isSlant: true },
        { id: 'e_BBp', v1: 'B', v2: "B'", name: "BB'", isSlant: true },
        { id: 'e_CCp', v1: 'C', v2: "C'", name: "CC'", isSlant: true },
        { id: 'e_DDp', v1: 'D', v2: "D'", name: "DD'", isSlant: true },
      ];

      const faces = [
        { id: 'f_bottom', vertexIds: ['A', 'B', 'C', 'D'], name: 'Đáy ABCD', color: '#8b5cf6' },
        { id: 'f_top', vertexIds: ["A'", "D'", "C'", "B'"], name: "Đáy A'B'C'D'", color: '#8b5cf6' },
        { id: 'f_front', vertexIds: ['D', 'C', "C'", "D'"], name: "Mặt CDD'C'", color: '#a78bfa' },
        { id: 'f_back', vertexIds: ['B', 'A', "A'", "B'"], name: "Mặt ABB'A'", color: '#a78bfa' },
        { id: 'f_left', vertexIds: ['A', 'D', "D'", "A'"], name: "Mặt ADD'A'", color: '#c4b5fd' },
        { id: 'f_right', vertexIds: ['C', 'B', "B'", "C'"], name: "Mặt BCC'B'", color: '#c4b5fd' },
      ];

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const a = params.a ?? 3;
      const b = params.b ?? 2.5;
      const h = params.h ?? 3.5;
      const shift = params.shift ?? 1.2;
      const S_day = a * b;
      const V = S_day * h;
      const l = Math.sqrt(h * h + shift * shift);

      return [
        {
          name: 'Diện tích đáy',
          latexSymbol: 'S_đ',
          latexFormula: 'S_đ = a \\times b',
          substitution: `${a} \\times ${b} = ${S_day}`,
          result: Number(S_day.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích đa giác đáy',
        },
        {
          name: 'Độ dài cạnh bên',
          latexSymbol: 'l',
          latexFormula: 'l = \\sqrt{h^2 + \\text{shift}^2}',
          substitution: `\\sqrt{${h}^2 + ${shift}^2} \\approx ${l.toFixed(2)}`,
          result: Number(l.toFixed(2)),
          unit,
          explanation: 'Độ dài đoạn xiên AA\'',
        },
        {
          name: 'Thể tích lăng trụ xiên',
          latexSymbol: 'V',
          latexFormula: 'V = S_đ \\times h',
          substitution: `${S_day} \\times ${h} = ${V}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Thể tích bằng diện tích đáy nhân chiều cao vuông góc h',
        },
      ];
    },
  },

  // 6. Hình lăng trụ tam giác (Triangular Prism)
  {
    id: 'triangular_prism',
    name: 'Hình lăng trụ tam giác',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Hình lăng trụ đứng có 2 mặt đáy là tam giác bằng nhau, 3 mặt bên là các hình chữ nhật. Có 6 đỉnh và 9 cạnh.',
    tags: ['Lăng trụ đứng', 'Tam giác'],
    params: [
      { id: 'a', label: 'Cạnh tam giác đáy a', min: 1, max: 5, step: 0.5, default: 3, unit: 'cm' },
      { id: 'h', label: 'Chiều cao lăng trụ h', min: 1, max: 6, step: 0.5, default: 4, unit: 'cm' },
    ],
    defaultParams: { a: 3, h: 4 },
    educationalNotes: [
      'Có 2 đáy là tam giác đều/tam giác bằng nhau.',
      'Có 3 mặt bên là hình chữ nhật.',
      'Có 6 đỉnh, 9 cạnh (3 cạnh bên bằng nhau và vuông góc với 2 đáy).',
    ],
    generateGeometry: (params) => {
      const a = params.a ?? 3;
      const h = params.h ?? 4;
      const r = a / Math.sqrt(3);
      const y2 = h / 2;

      // Equilateral triangle base
      const angles = [Math.PI / 2, (7 * Math.PI) / 6, (11 * Math.PI) / 6];
      const bottomPts = angles.map((ang) => [r * Math.cos(ang), -y2, r * Math.sin(ang)] as [number, number, number]);
      const topPts = angles.map((ang) => [r * Math.cos(ang), y2, r * Math.sin(ang)] as [number, number, number]);

      const vertices = [
        { id: 'A', name: 'A', pos: bottomPts[0] },
        { id: 'B', name: 'B', pos: bottomPts[1] },
        { id: 'C', name: 'C', pos: bottomPts[2] },
        { id: "A'", name: "A'", pos: topPts[0] },
        { id: "B'", name: "B'", pos: topPts[1] },
        { id: "C'", name: "C'", pos: topPts[2] },
      ];

      const edges = [
        // Đáy dưới ABC
        { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
        { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
        { id: 'e_CA', v1: 'C', v2: 'A', name: 'CA' },
        // Đáy trên A'B'C'
        { id: 'e_ApBp', v1: "A'", v2: "B'", name: "A'B'" },
        { id: 'e_BpCp', v1: "B'", v2: "C'", name: "B'C'" },
        { id: 'e_CpAp', v1: "C'", v2: "A'", name: "C'A'" },
        // Cạnh bên
        { id: 'e_AAp', v1: 'A', v2: "A'", name: "AA'" },
        { id: 'e_BBp', v1: 'B', v2: "B'", name: "BB'" },
        { id: 'e_CCp', v1: 'C', v2: "C'", name: "CC'" },
      ];

      const faces = [
        { id: 'f_bottom', vertexIds: ['A', 'B', 'C'], name: 'Đáy ABC', color: '#06b6d4' },
        { id: 'f_top', vertexIds: ["A'", "C'", "B'"], name: "Đáy A'B'C'", color: '#06b6d4' },
        { id: 'f_side1', vertexIds: ['A', 'B', "B'", "A'"], name: "Mặt ABB'A'", color: '#22d3ee' },
        { id: 'f_side2', vertexIds: ['B', 'C', "C'", "B'"], name: "Mặt BCC'B'", color: '#67e8f9' },
        { id: 'f_side3', vertexIds: ['C', 'A', "A'", "C'"], name: "Mặt ACC'A'", color: '#22d3ee' },
      ];

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const a = params.a ?? 3;
      const h = params.h ?? 4;
      const S_day = (a * a * Math.sqrt(3)) / 4;
      const P_day = 3 * a;
      const S_xq = P_day * h;
      const S_tp = S_xq + 2 * S_day;
      const V = S_day * h;

      return [
        {
          name: 'Diện tích tam giác đều đáy',
          latexSymbol: 'S_đ',
          latexFormula: 'S_đ = \\frac{a^2\\sqrt{3}}{4}',
          substitution: `\\frac{${a}^2\\sqrt{3}}{4} \\approx ${S_day.toFixed(2)}`,
          result: Number(S_day.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích tam giác đều cạnh a',
        },
        {
          name: 'Chu vi đáy',
          latexSymbol: 'P_đ',
          latexFormula: 'P_đ = 3a',
          substitution: `3 \\times ${a} = ${P_day}`,
          result: Number(P_day.toFixed(2)),
          unit,
          explanation: 'Tổng độ dài 3 cạnh đáy',
        },
        {
          name: 'Diện tích xung quanh',
          latexSymbol: 'S_{xq}',
          latexFormula: 'S_{xq} = P_đ \\times h = 3ah',
          substitution: `3 \\times ${a} \\times ${h} = ${S_xq}`,
          result: Number(S_xq.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Tổng diện tích 3 mặt chữ nhật bên',
        },
        {
          name: 'Diện tích toàn phần',
          latexSymbol: 'S_{tp}',
          latexFormula: 'S_{tp} = S_{xq} + 2S_đ',
          substitution: `${S_xq} + 2 \\times ${S_day.toFixed(2)} \\approx ${S_tp.toFixed(2)}`,
          result: Number(S_tp.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích xung quanh cộng 2 đáy',
        },
        {
          name: 'Thể tích lăng trụ tam giác',
          latexSymbol: 'V',
          latexFormula: 'V = S_đ \\times h = \\frac{a^2\\sqrt{3}}{4} h',
          substitution: `${S_day.toFixed(2)} \\times ${h} \\approx ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Diện tích đáy nhân chiều cao',
        },
      ];
    },
    netDefinition: {
      canUnfold: true,
      unfoldTitle: 'Khai triển lăng trụ tam giác',
      explanation: 'Gồm dải 3 hình chữ nhật cạnh a×h và 2 tam giác đều gắn ở 2 mép.',
      unfold2DPolygons: (params) => {
        const a = (params.a ?? 3) * 18;
        const h = (params.h ?? 4) * 18;
        const th = (a * Math.sqrt(3)) / 2;
        return [
          { id: 'f1', name: 'Mặt bên 1', points: [[0, 0], [a, 0], [a, h], [0, h]], color: '#a5f3fc', strokeColor: '#0891b2' },
          { id: 'f2', name: 'Mặt bên 2', points: [[a, 0], [2 * a, 0], [2 * a, h], [a, h]], color: '#cffafe', strokeColor: '#0891b2' },
          { id: 'f3', name: 'Mặt bên 3', points: [[2 * a, 0], [3 * a, 0], [3 * a, h], [2 * a, h]], color: '#a5f3fc', strokeColor: '#0891b2' },
          { id: 't_top', name: 'Đáy trên', points: [[a, 0], [2 * a, 0], [1.5 * a, -th]], color: '#67e8f9', strokeColor: '#0891b2' },
          { id: 't_bot', name: 'Đáy dưới', points: [[a, h], [2 * a, h], [1.5 * a, h + th]], color: '#67e8f9', strokeColor: '#0891b2' },
        ];
      },
    },
  },

  // 7. Hình lăng trụ đều (Regular Hexagonal Prism)
  {
    id: 'regular_prism',
    name: 'Hình lăng trụ lục giác đều',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Hình lăng trụ đứng có đáy là đa giác đều (lục giác đều). Tất cả các mặt bên là các hình chữ nhật bằng nhau.',
    tags: ['Lăng trụ đứng', 'Đa giác đều'],
    params: [
      { id: 'a', label: 'Cạnh lục giác đáy a', min: 1, max: 4, step: 0.5, default: 2.2, unit: 'cm' },
      { id: 'h', label: 'Chiều cao lăng trụ h', min: 1, max: 6, step: 0.5, default: 4, unit: 'cm' },
    ],
    defaultParams: { a: 2.2, h: 4 },
    educationalNotes: [
      'Hai đáy là 2 hình lục giác đều bằng nhau.',
      'Có 6 mặt bên là các hình chữ nhật bằng nhau.',
      'Có 12 đỉnh và 18 cạnh (6 cạnh đáy dưới, 6 cạnh đáy trên, 6 cạnh bên).',
    ],
    generateGeometry: (params) => {
      const a = params.a ?? 2.2;
      const h = params.h ?? 4;
      const y2 = h / 2;

      const bottomPts: [number, number, number][] = [];
      const topPts: [number, number, number][] = [];

      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        bottomPts.push([a * Math.cos(ang), -y2, a * Math.sin(ang)]);
        topPts.push([a * Math.cos(ang), y2, a * Math.sin(ang)]);
      }

      const names = ['A', 'B', 'C', 'D', 'E', 'F'];
      const topNames = ["A'", "B'", "C'", "D'", "E'", "F'"];

      const vertices = [
        ...bottomPts.map((p, i) => ({ id: names[i], name: names[i], pos: p })),
        ...topPts.map((p, i) => ({ id: topNames[i], name: topNames[i], pos: p })),
      ];

      const edges: any[] = [];
      // Bottom edges
      for (let i = 0; i < 6; i++) {
        edges.push({ id: `e_${names[i]}${names[(i + 1) % 6]}`, v1: names[i], v2: names[(i + 1) % 6], name: `${names[i]}${names[(i + 1) % 6]}` });
        edges.push({ id: `e_${topNames[i]}${topNames[(i + 1) % 6]}`, v1: topNames[i], v2: topNames[(i + 1) % 6], name: `${topNames[i]}${topNames[(i + 1) % 6]}` });
        edges.push({ id: `e_${names[i]}${topNames[i]}`, v1: names[i], v2: topNames[i], name: `${names[i]}${topNames[i]}` });
      }

      const faces = [
        { id: 'f_bottom', vertexIds: [...names], name: 'Đáy lục giác dưới', color: '#14b8a6' },
        { id: 'f_top', vertexIds: [...topNames].reverse(), name: 'Đáy lục giác trên', color: '#14b8a6' },
        ...names.map((n, i) => {
          const next = names[(i + 1) % 6];
          const topN = topNames[i];
          const topNext = topNames[(i + 1) % 6];
          return {
            id: `f_side_${i}`,
            vertexIds: [n, next, topNext, topN],
            name: `Mặt bên ${n}${next}`,
            color: '#2dd4bf',
          };
        }),
      ];

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const a = params.a ?? 2.2;
      const h = params.h ?? 4;
      const S_day = (3 * Math.sqrt(3) * a * a) / 2;
      const P_day = 6 * a;
      const S_xq = P_day * h;
      const S_tp = S_xq + 2 * S_day;
      const V = S_day * h;

      return [
        {
          name: 'Diện tích đáy lục giác đều',
          latexSymbol: 'S_đ',
          latexFormula: 'S_đ = \\frac{3\\sqrt{3}a^2}{2}',
          substitution: `\\frac{3\\sqrt{3} \\times ${a}^2}{2} \\approx ${S_day.toFixed(2)}`,
          result: Number(S_day.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Gồm 6 tam giác đều cạnh a ghép lại',
        },
        {
          name: 'Diện tích xung quanh',
          latexSymbol: 'S_{xq}',
          latexFormula: 'S_{xq} = 6ah',
          substitution: `6 \\times ${a} \\times ${h} = ${S_xq.toFixed(2)}`,
          result: Number(S_xq.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Tổng diện tích 6 mặt chữ nhật bên',
        },
        {
          name: 'Thể tích lăng trụ lục giác đều',
          latexSymbol: 'V',
          latexFormula: 'V = S_đ \\times h',
          substitution: `${S_day.toFixed(2)} \\times ${h} \\approx ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Diện tích đáy nhân chiều cao',
        },
      ];
    },
  },

  // 8. Hình chóp tam giác (Triangular Pyramid)
  {
    id: 'triangular_pyramid',
    name: 'Hình chóp tam giác',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Hình chóp có đáy là một hình tam giác và 3 mặt bên là các hình tam giác có chung đỉnh S.',
    tags: ['Hình chóp', 'Tam giác'],
    params: [
      { id: 'a', label: 'Cạnh đáy a', min: 1, max: 5, step: 0.5, default: 3.5, unit: 'cm' },
      { id: 'h', label: 'Chiều cao h', min: 1, max: 6, step: 0.5, default: 4, unit: 'cm' },
    ],
    defaultParams: { a: 3.5, h: 4 },
    educationalNotes: [
      'Đáy là một tam giác ABC.',
      'Có 4 đỉnh (đỉnh S và 3 đỉnh đáy A, B, C) và 6 cạnh.',
      'Có 4 mặt đều là tam giác (còn gọi là hình tứ diện).',
    ],
    generateGeometry: (params) => {
      const a = params.a ?? 3.5;
      const h = params.h ?? 4;
      const r = a / Math.sqrt(3);
      const yBottom = -h / 3;
      const yTop = (2 * h) / 3;

      const angles = [Math.PI / 2, (7 * Math.PI) / 6, (11 * Math.PI) / 6];
      const bottomPts = angles.map((ang) => [r * Math.cos(ang), yBottom, r * Math.sin(ang)] as [number, number, number]);

      const vertices = [
        { id: 'S', name: 'S', pos: [0, yTop, 0] as [number, number, number], color: '#f59e0b' },
        { id: 'A', name: 'A', pos: bottomPts[0] },
        { id: 'B', name: 'B', pos: bottomPts[1] },
        { id: 'C', name: 'C', pos: bottomPts[2] },
        { id: 'H', name: 'H', pos: [0, yBottom, 0] as [number, number, number], color: '#f43f5e' },
      ];

      const edges = [
        { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
        { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
        { id: 'e_CA', v1: 'C', v2: 'A', name: 'CA' },
        { id: 'e_SA', v1: 'S', v2: 'A', name: 'SA' },
        { id: 'e_SB', v1: 'S', v2: 'B', name: 'SB' },
        { id: 'e_SC', v1: 'S', v2: 'C', name: 'SC' },
        { id: 'e_SH', v1: 'S', v2: 'H', name: 'SH (chiều cao)', isHeight: true },
      ];

      const faces = [
        { id: 'f_bottom', vertexIds: ['A', 'B', 'C'], name: 'Đáy ABC', color: '#f59e0b' },
        { id: 'f_SAB', vertexIds: ['S', 'B', 'A'], name: 'Mặt bên SAB', color: '#fbbf24' },
        { id: 'f_SBC', vertexIds: ['S', 'C', 'B'], name: 'Mặt bên SBC', color: '#fcd34d' },
        { id: 'f_SCA', vertexIds: ['S', 'A', 'C'], name: 'Mặt bên SCA', color: '#fbbf24' },
      ];

      const rightAngleMarkers = [
        { vertex: [0, yBottom, 0] as [number, number, number], dir1: [0, 1, 0] as [number, number, number], dir2: [1, 0, 0] as [number, number, number], size: 0.3 },
      ];

      return { vertices, edges, faces, rightAngleMarkers };
    },
    calculateFormulas: (params, unit) => {
      const a = params.a ?? 3.5;
      const h = params.h ?? 4;
      const S_day = (a * a * Math.sqrt(3)) / 4;
      const V = (1 / 3) * S_day * h;
      const slantHeight = Math.sqrt(h * h + (a / (2 * Math.sqrt(3))) ** 2);
      const S_xq = 3 * ((a * slantHeight) / 2);
      const S_tp = S_xq + S_day;

      return [
        {
          name: 'Diện tích tam giác đáy',
          latexSymbol: 'S_đ',
          latexFormula: 'S_đ = \\frac{a^2\\sqrt{3}}{4}',
          substitution: `\\frac{${a}^2\\sqrt{3}}{4} \\approx ${S_day.toFixed(2)}`,
          result: Number(S_day.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích tam giác đều đáy',
        },
        {
          name: 'Chiều cao hình chóp',
          latexSymbol: 'h',
          latexFormula: 'h = SH \\perp (ABC)',
          substitution: `${h}`,
          result: h,
          unit,
          explanation: 'Khoảng cách vuông góc từ đỉnh S đến mặt đáy',
        },
        {
          name: 'Thể tích hình chóp tam giác',
          latexSymbol: 'V',
          latexFormula: 'V = \\frac{1}{3} S_đ \\times h',
          substitution: `\\frac{1}{3} \\times ${S_day.toFixed(2)} \\times ${h} \\approx ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Bằng một phần ba diện tích đáy nhân chiều cao',
        },
      ];
    },
    netDefinition: {
      canUnfold: true,
      unfoldTitle: 'Khai triển chóp tam giác',
      explanation: 'Mở phẳng 3 tam giác mặt bên xoay quanh 3 cạnh của tam giác đáy.',
      unfold2DPolygons: (params) => {
        const a = (params.a ?? 3.5) * 20;
        const h = params.h ?? 4;
        const th = (a * Math.sqrt(3)) / 2;
        const slant = Math.sqrt(h * h + (a / (2 * Math.sqrt(3))) ** 2) * 15;
        return [
          { id: 'base', name: 'Đáy ABC', points: [[0, 0], [a, 0], [a / 2, th]], color: '#fef3c7', strokeColor: '#d97706' },
          { id: 'f1', name: 'Mặt SAB', points: [[0, 0], [a, 0], [a / 2, -slant]], color: '#fde68a', strokeColor: '#d97706' },
          { id: 'f2', name: 'Mặt SBC', points: [[a, 0], [a / 2, th], [a + slant * 0.866, th / 2 + slant * 0.5]], color: '#fde68a', strokeColor: '#d97706' },
          { id: 'f3', name: 'Mặt SCA', points: [[a / 2, th], [0, 0], [-slant * 0.866, th / 2 + slant * 0.5]], color: '#fde68a', strokeColor: '#d97706' },
        ];
      },
    },
  },

  // 9. Hình chóp tứ giác (Quadrilateral Pyramid)
  {
    id: 'quad_pyramid',
    name: 'Hình chóp tứ giác',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Hình chóp có đáy là một tứ giác (hình bình hành, hình chữ nhật) và 4 mặt bên là các tam giác chung đỉnh S.',
    tags: ['Hình chóp', 'Tứ giác'],
    params: [
      { id: 'a', label: 'Cạnh đáy a', min: 1, max: 5, step: 0.5, default: 3.5, unit: 'cm' },
      { id: 'b', label: 'Cạnh đáy b', min: 1, max: 5, step: 0.5, default: 2.5, unit: 'cm' },
      { id: 'h', label: 'Chiều cao h', min: 1, max: 6, step: 0.5, default: 4, unit: 'cm' },
    ],
    defaultParams: { a: 3.5, b: 2.5, h: 4 },
    educationalNotes: [
      'Đáy là tứ giác ABCD.',
      'Có 5 đỉnh (đỉnh S và 4 đỉnh đáy A, B, C, D) và 8 cạnh.',
      'Có 5 mặt (1 mặt đáy tứ giác và 4 mặt bên tam giác).',
    ],
    generateGeometry: (params) => {
      const a = params.a ?? 3.5;
      const b = params.b ?? 2.5;
      const h = params.h ?? 4;
      const x2 = a / 2;
      const z2 = b / 2;
      const yBottom = -h / 3;
      const yTop = (2 * h) / 3;

      const vertices = [
        { id: 'S', name: 'S', pos: [0, yTop, 0] as [number, number, number], color: '#f59e0b' },
        { id: 'A', name: 'A', pos: [-x2, yBottom, -z2] as [number, number, number] },
        { id: 'B', name: 'B', pos: [x2, yBottom, -z2] as [number, number, number] },
        { id: 'C', name: 'C', pos: [x2, yBottom, z2] as [number, number, number] },
        { id: 'D', name: 'D', pos: [-x2, yBottom, z2] as [number, number, number] },
        { id: 'O', name: 'O', pos: [0, yBottom, 0] as [number, number, number], color: '#f43f5e' },
      ];

      const edges = [
        { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
        { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
        { id: 'e_CD', v1: 'C', v2: 'D', name: 'CD' },
        { id: 'e_DA', v1: 'D', v2: 'A', name: 'DA' },
        { id: 'e_SA', v1: 'S', v2: 'A', name: 'SA' },
        { id: 'e_SB', v1: 'S', v2: 'B', name: 'SB' },
        { id: 'e_SC', v1: 'S', v2: 'C', name: 'SC' },
        { id: 'e_SD', v1: 'S', v2: 'D', name: 'SD' },
        { id: 'e_SO', v1: 'S', v2: 'O', name: 'SO (chiều cao)', isHeight: true },
      ];

      const faces = [
        { id: 'f_bottom', vertexIds: ['A', 'B', 'C', 'D'], name: 'Đáy ABCD', color: '#f59e0b' },
        { id: 'f_SAB', vertexIds: ['S', 'B', 'A'], name: 'Mặt bên SAB', color: '#fbbf24' },
        { id: 'f_SBC', vertexIds: ['S', 'C', 'B'], name: 'Mặt bên SBC', color: '#fcd34d' },
        { id: 'f_SCD', vertexIds: ['S', 'D', 'C'], name: 'Mặt bên SCD', color: '#fbbf24' },
        { id: 'f_SDA', vertexIds: ['S', 'A', 'D'], name: 'Mặt bên SDA', color: '#fcd34d' },
      ];

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const a = params.a ?? 3.5;
      const b = params.b ?? 2.5;
      const h = params.h ?? 4;
      const S_day = a * b;
      const V = (1 / 3) * S_day * h;

      return [
        {
          name: 'Diện tích đáy tứ giác',
          latexSymbol: 'S_đ',
          latexFormula: 'S_đ = a \\times b',
          substitution: `${a} \\times ${b} = ${S_day}`,
          result: Number(S_day.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích mặt đáy hình chữ nhật',
        },
        {
          name: 'Thể tích hình chóp tứ giác',
          latexSymbol: 'V',
          latexFormula: 'V = \\frac{1}{3} S_đ \\times h',
          substitution: `\\frac{1}{3} \\times ${S_day} \\times ${h} = ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Một phần ba diện tích đáy nhân chiều cao',
        },
      ];
    },
  },

  // 10. Hình chóp đều (Regular Square Pyramid - Chóp tứ giác đều)
  {
    id: 'regular_pyramid',
    name: 'Hình chóp tứ giác đều',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Hình chóp có đáy là hình vuông, các cạnh bên bằng nhau và chân đường cao trùng với tâm đáy.',
    tags: ['Chóp đều', 'Đa diện đều'],
    params: [
      { id: 'a', label: 'Cạnh đáy hình vuông (a)', min: 1, max: 5, step: 0.5, default: 3.5, unit: 'cm' },
      { id: 'h', label: 'Chiều cao hình chóp (h)', min: 1, max: 6, step: 0.5, default: 3.8, unit: 'cm' },
    ],
    defaultParams: { a: 3.5, h: 3.8 },
    educationalNotes: [
      'Đáy là hình vuông tâm O.',
      'Đoạn thẳng SO vuông góc với mặt phẳng đáy (SO là chiều cao của hình chóp).',
      'Các cạnh bên bằng nhau: SA = SB = SC = SD = √(h² + a²/2).',
      'Các mặt bên là các tam giác cân bằng nhau.',
      'Trung đoạn d là đường cao kẻ từ đỉnh S của mỗi mặt bên: d = √(h² + (a/2)²).',
    ],
    generateGeometry: (params) => {
      const a = params.a ?? 3.5;
      const h = params.h ?? 3.8;
      const a2 = a / 2;
      const yBottom = -h / 3;
      const yTop = (2 * h) / 3;

      const vertices = [
        { id: 'S', name: 'S', pos: [0, yTop, 0] as [number, number, number], color: '#f59e0b' },
        { id: 'A', name: 'A', pos: [-a2, yBottom, -a2] as [number, number, number] },
        { id: 'B', name: 'B', pos: [a2, yBottom, -a2] as [number, number, number] },
        { id: 'C', name: 'C', pos: [a2, yBottom, a2] as [number, number, number] },
        { id: 'D', name: 'D', pos: [-a2, yBottom, a2] as [number, number, number] },
        { id: 'O', name: 'O', pos: [0, yBottom, 0] as [number, number, number], color: '#ef4444' },
        { id: 'M', name: 'M (trung điểm BC)', pos: [a2, yBottom, 0] as [number, number, number], color: '#10b981' },
      ];

      const edges = [
        { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
        { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
        { id: 'e_CD', v1: 'C', v2: 'D', name: 'CD' },
        { id: 'e_DA', v1: 'D', v2: 'A', name: 'DA' },
        { id: 'e_SA', v1: 'S', v2: 'A', name: 'SA' },
        { id: 'e_SB', v1: 'S', v2: 'B', name: 'SB' },
        { id: 'e_SC', v1: 'S', v2: 'C', name: 'SC' },
        { id: 'e_SD', v1: 'S', v2: 'D', name: 'SD' },
        { id: 'e_SO', v1: 'S', v2: 'O', name: 'SO (chiều cao)', isHeight: true },
        { id: 'e_SM', v1: 'S', v2: 'M', name: 'SM (trung đoạn d)', isSlant: true },
        { id: 'e_OM', v1: 'O', v2: 'M', name: 'OM', isHeight: true },
      ];

      const faces = [
        { id: 'f_bottom', vertexIds: ['A', 'B', 'C', 'D'], name: 'Đáy hình vuông ABCD', color: '#eab308' },
        { id: 'f_SAB', vertexIds: ['S', 'B', 'A'], name: 'Mặt bên SAB', color: '#facc15' },
        { id: 'f_SBC', vertexIds: ['S', 'C', 'B'], name: 'Mặt bên SBC', color: '#fde047' },
        { id: 'f_SCD', vertexIds: ['S', 'D', 'C'], name: 'Mặt bên SCD', color: '#facc15' },
        { id: 'f_SDA', vertexIds: ['S', 'A', 'D'], name: 'Mặt bên SDA', color: '#fde047' },
      ];

      const rightAngleMarkers = [
        { vertex: [0, yBottom, 0] as [number, number, number], dir1: [0, 1, 0] as [number, number, number], dir2: [1, 0, 0] as [number, number, number], size: 0.3 },
        { vertex: [a2, yBottom, 0] as [number, number, number], dir1: [-1, 0, 0] as [number, number, number], dir2: [0, 0, 1] as [number, number, number], size: 0.25 },
      ];

      return { vertices, edges, faces, rightAngleMarkers };
    },
    calculateFormulas: (params, unit) => {
      const a = params.a ?? 3.5;
      const h = params.h ?? 3.8;
      const S_day = a * a;
      const V = (1 / 3) * S_day * h;
      const d = Math.sqrt(h * h + (a / 2) * (a / 2)); // trung đoạn
      const slantEdge = Math.sqrt(h * h + (a * a) / 2); // cạnh bên
      const S_xq = 4 * ((a * d) / 2);
      const S_tp = S_xq + S_day;

      return [
        {
          name: 'Diện tích đáy hình vuông',
          latexSymbol: 'S_đ',
          latexFormula: 'S_đ = a^2',
          substitution: `${a}^2 = ${S_day}`,
          result: Number(S_day.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích hình vuông đáy ABCD',
        },
        {
          name: 'Độ dài trung đoạn',
          latexSymbol: 'd',
          latexFormula: 'd = \\sqrt{h^2 + \\left(\\frac{a}{2}\\right)^2}',
          substitution: `\\sqrt{${h}^2 + (${(a / 2).toFixed(2)})^2} \\approx ${d.toFixed(2)}`,
          result: Number(d.toFixed(2)),
          unit,
          explanation: 'Đường cao của mặt tam giác bên',
        },
        {
          name: 'Độ dài cạnh bên',
          latexSymbol: 'b',
          latexFormula: 'b = \\sqrt{h^2 + \\frac{a^2}{2}}',
          substitution: `\\sqrt{${h}^2 + \\frac{${a}^2}{2}} \\approx ${slantEdge.toFixed(2)}`,
          result: Number(slantEdge.toFixed(2)),
          unit,
          explanation: 'Độ dài các cạnh SA = SB = SC = SD',
        },
        {
          name: 'Diện tích xung quanh',
          latexSymbol: 'S_{xq}',
          latexFormula: 'S_{xq} = 2a \\cdot d = p \\cdot d',
          substitution: `2 \\times ${a} \\times ${d.toFixed(2)} \\approx ${S_xq.toFixed(2)}`,
          result: Number(S_xq.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Nửa chu vi đáy nhân với trung đoạn',
        },
        {
          name: 'Thể tích hình chóp đều',
          latexSymbol: 'V',
          latexFormula: 'V = \\frac{1}{3} S_đ \\times h = \\frac{1}{3} a^2 h',
          substitution: `\\frac{1}{3} \\times ${S_day} \\times ${h} \\approx ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Một phần ba diện tích đáy nhân chiều cao',
        },
      ];
    },
    netDefinition: {
      canUnfold: true,
      unfoldTitle: 'Khai triển chóp tứ giác đều',
      explanation: 'Hình khai triển gồm một hình vuông đáy ở giữa và 4 cánh hoa tam giác cân mở phẳng sang 4 phía.',
      unfold2DPolygons: (params) => {
        const a = (params.a ?? 3.5) * 16;
        const h = params.h ?? 3.8;
        const d = Math.sqrt(h * h + (a / 32) ** 2) * 16;
        const a2 = a / 2;
        return [
          { id: 'base', name: 'Đáy hình vuông', points: [[-a2, -a2], [a2, -a2], [a2, a2], [-a2, a2]], color: '#fef08a', strokeColor: '#ca8a04' },
          { id: 't_top', name: 'Mặt trên (SAB)', points: [[-a2, -a2], [a2, -a2], [0, -a2 - d]], color: '#fde047', strokeColor: '#ca8a04' },
          { id: 't_bot', name: 'Mặt dưới (SCD)', points: [[a2, a2], [-a2, a2], [0, a2 + d]], color: '#fde047', strokeColor: '#ca8a04' },
          { id: 't_left', name: 'Mặt trái (SDA)', points: [[-a2, a2], [-a2, -a2], [-a2 - d, 0]], color: '#fde047', strokeColor: '#ca8a04' },
          { id: 't_right', name: 'Mặt phải (SBC)', points: [[a2, -a2], [a2, a2], [a2 + d, 0]], color: '#fde047', strokeColor: '#ca8a04' },
        ];
      },
    },
  },

  // 11. Hình chóp có cạnh bên SA vuông góc với đáy (Pyramid with edge SA ⟂ Base)
  {
    id: 'pyramid_sa_perp_base',
    name: 'Chóp có cạnh bên SA ⟂ đáy',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'THPT',
    description: 'Dạng toán kinh điển THPT: Hình chóp S.ABCD có cạnh bên SA vuông góc với mặt phẳng đáy (ABCD). SA chính là chiều cao h.',
    tags: ['Quan hệ vuông góc', 'THPT', 'Hình chóp'],
    params: [
      { id: 'a', label: 'Cạnh đáy AB (a)', min: 1, max: 5, step: 0.5, default: 3.5, unit: 'cm' },
      { id: 'b', label: 'Cạnh đáy AD (b)', min: 1, max: 5, step: 0.5, default: 2.5, unit: 'cm' },
      { id: 'sa', label: 'Độ dài SA (chiều cao h)', min: 1, max: 6, step: 0.5, default: 3.8, unit: 'cm' },
    ],
    defaultParams: { a: 3.5, b: 2.5, sa: 3.8 },
    educationalNotes: [
      'SA ⟂ (ABCD) nên SA ⟂ AB, SA ⟂ AD, SA ⟂ AC, SA ⟂ BD.',
      'Tam giác SAB vuông tại A, tam giác SAD vuông tại A.',
      'Nếu ABCD là hình chữ nhật: BC ⟂ AB và BC ⟂ SA ⇒ BC ⟂ (SAB) ⇒ Tam giác SBC vuông tại B!',
      'Tương tự, CD ⟂ (SAD) ⇒ Tam giác SCD vuông tại D!',
      'Đây là mô hình trọng tâm trong các đề thi tốt nghiệp và đại học.',
    ],
    generateGeometry: (params) => {
      const a = params.a ?? 3.5;
      const b = params.b ?? 2.5;
      const sa = params.sa ?? 3.8;
      const yBottom = -sa / 3;
      const yTop = (2 * sa) / 3;

      // Place A at (-a/2, yBottom, -b/2)
      const ax = -a / 2;
      const az = -b / 2;

      const vertices = [
        { id: 'S', name: 'S', pos: [ax, yTop, az] as [number, number, number], color: '#ef4444' },
        { id: 'A', name: 'A', pos: [ax, yBottom, az] as [number, number, number], color: '#ef4444' },
        { id: 'B', name: 'B', pos: [ax + a, yBottom, az] as [number, number, number] },
        { id: 'C', name: 'C', pos: [ax + a, yBottom, az + b] as [number, number, number] },
        { id: 'D', name: 'D', pos: [ax, yBottom, az + b] as [number, number, number] },
      ];

      const edges = [
        { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
        { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
        { id: 'e_CD', v1: 'C', v2: 'D', name: 'CD' },
        { id: 'e_DA', v1: 'D', v2: 'A', name: 'DA' },
        { id: 'e_SA', v1: 'S', v2: 'A', name: 'SA (đường cao)', isHeight: true, color: '#ef4444' },
        { id: 'e_SB', v1: 'S', v2: 'B', name: 'SB' },
        { id: 'e_SC', v1: 'S', v2: 'C', name: 'SC' },
        { id: 'e_SD', v1: 'S', v2: 'D', name: 'SD' },
      ];

      const faces = [
        { id: 'f_bottom', vertexIds: ['A', 'B', 'C', 'D'], name: 'Đáy ABCD', color: '#f43f5e' },
        { id: 'f_SAB', vertexIds: ['S', 'B', 'A'], name: 'Mặt bên vuông SAB', color: '#fb7185' },
        { id: 'f_SBC', vertexIds: ['S', 'C', 'B'], name: 'Mặt bên vuông SBC', color: '#fda4af' },
        { id: 'f_SCD', vertexIds: ['S', 'D', 'C'], name: 'Mặt bên vuông SCD', color: '#fb7185' },
        { id: 'f_SDA', vertexIds: ['S', 'A', 'D'], name: 'Mặt bên vuông SDA', color: '#fda4af' },
      ];

      const rightAngleMarkers = [
        // SA perp AB at A
        { vertex: [ax, yBottom, az] as [number, number, number], dir1: [0, 1, 0] as [number, number, number], dir2: [1, 0, 0] as [number, number, number], size: 0.3 },
        // SA perp AD at A
        { vertex: [ax, yBottom, az] as [number, number, number], dir1: [0, 1, 0] as [number, number, number], dir2: [0, 0, 1] as [number, number, number], size: 0.3 },
        // BC perp SB at B
        { vertex: [ax + a, yBottom, az] as [number, number, number], dir1: [-1, 0, 0] as [number, number, number], dir2: [0, 0, 1] as [number, number, number], size: 0.25 },
      ];

      return { vertices, edges, faces, rightAngleMarkers };
    },
    calculateFormulas: (params, unit) => {
      const a = params.a ?? 3.5;
      const b = params.b ?? 2.5;
      const sa = params.sa ?? 3.8;
      const S_day = a * b;
      const V = (1 / 3) * S_day * sa;
      const SB = Math.sqrt(sa * sa + a * a);
      const SD = Math.sqrt(sa * sa + b * b);
      const SC = Math.sqrt(sa * sa + a * a + b * b);

      return [
        {
          name: 'Diện tích đáy ABCD',
          latexSymbol: 'S_{ABCD}',
          latexFormula: 'S = a \\times b',
          substitution: `${a} \\times ${b} = ${S_day}`,
          result: Number(S_day.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích hình chữ nhật đáy',
        },
        {
          name: 'Chiều cao hình chóp h',
          latexSymbol: 'h = SA',
          latexFormula: 'h = SA \\perp (ABCD)',
          substitution: `${sa}`,
          result: sa,
          unit,
          explanation: 'Cạnh SA đóng vai trò là chiều cao vuông góc',
        },
        {
          name: 'Thể tích khối chóp S.ABCD',
          latexSymbol: 'V',
          latexFormula: 'V = \\frac{1}{3} S_{ABCD} \\times SA',
          substitution: `\\frac{1}{3} \\times ${S_day} \\times ${sa} \\approx ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Một phần ba diện tích đáy nhân chiều cao SA',
        },
        {
          name: 'Độ dài cạnh SC',
          latexSymbol: 'SC',
          latexFormula: 'SC = \\sqrt{SA^2 + a^2 + b^2}',
          substitution: `\\sqrt{${sa}^2 + ${a}^2 + ${b}^2} \\approx ${SC.toFixed(2)}`,
          result: Number(SC.toFixed(2)),
          unit,
          explanation: 'Đường chéo xa nhất từ đỉnh S tới C',
        },
      ];
    },
    guidedSteps: [
      {
        id: 1,
        title: 'Chứng minh BC vuông góc (SAB)',
        question: 'Tại sao cạnh BC lại vuông góc với cả mặt phẳng (SAB)?',
        hint: 'BC vuông góc với AB (do ABCD là hình chữ nhật) và BC vuông góc với SA (do SA ⟂ đáy).',
        answerExplanation: 'Vì BC ⟂ AB và BC ⟂ SA mà AB và SA cắt nhau tại A trong (SAB), nên BC ⟂ (SAB). Do đó tam giác SBC vuông tại B!',
        expectedObservation: 'BC ⟂ (SAB) và ΔSBC vuông tại B.',
      },
    ],
  },

  // 12. Hình chóp có mặt bên vuông góc với đáy (Pyramid with lateral face ⟂ Base)
  {
    id: 'pyramid_side_perp_base',
    name: 'Chóp có mặt bên ⟂ đáy',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'THPT',
    description: 'Hình chóp có mặt bên (SAB) là tam giác đều/cân và nằm trong mặt phẳng vuông góc với mặt phẳng đáy.',
    tags: ['Quan hệ vuông góc', 'THPT'],
    params: [
      { id: 'a', label: 'Cạnh đáy AB (a)', min: 1, max: 5, step: 0.5, default: 3.5, unit: 'cm' },
      { id: 'b', label: 'Cạnh đáy AD (b)', min: 1, max: 5, step: 0.5, default: 2.5, unit: 'cm' },
      { id: 'h', label: 'Chiều cao SH', min: 1, max: 6, step: 0.5, default: 3.5, unit: 'cm' },
    ],
    defaultParams: { a: 3.5, b: 2.5, h: 3.5 },
    educationalNotes: [
      'Giao tuyến của (SAB) và (ABCD) là đoạn thẳng AB.',
      'Gọi H là chân đường cao kẻ từ S xuống AB trong tam giác SAB. Khi đó SH ⟂ (ABCD).',
      'Định lý: Nếu hai mặt phẳng vuông góc với nhau thì bất kỳ đường thẳng nào nằm trong mặt này và vuông góc với giao tuyến sẽ vuông góc với mặt kia.',
    ],
    generateGeometry: (params) => {
      const a = params.a ?? 3.5;
      const b = params.b ?? 2.5;
      const h = params.h ?? 3.5;
      const x2 = a / 2;
      const z2 = b / 2;
      const yBottom = -h / 3;
      const yTop = (2 * h) / 3;

      // H is the midpoint of AB: (0, yBottom, -z2)
      const vertices = [
        { id: 'S', name: 'S', pos: [0, yTop, -z2] as [number, number, number], color: '#f59e0b' },
        { id: 'A', name: 'A', pos: [-x2, yBottom, -z2] as [number, number, number] },
        { id: 'B', name: 'B', pos: [x2, yBottom, -z2] as [number, number, number] },
        { id: 'C', name: 'C', pos: [x2, yBottom, z2] as [number, number, number] },
        { id: 'D', name: 'D', pos: [-x2, yBottom, z2] as [number, number, number] },
        { id: 'H', name: 'H (trung điểm AB)', pos: [0, yBottom, -z2] as [number, number, number], color: '#ef4444' },
      ];

      const edges = [
        { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
        { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
        { id: 'e_CD', v1: 'C', v2: 'D', name: 'CD' },
        { id: 'e_DA', v1: 'D', v2: 'A', name: 'DA' },
        { id: 'e_SA', v1: 'S', v2: 'A', name: 'SA' },
        { id: 'e_SB', v1: 'S', v2: 'B', name: 'SB' },
        { id: 'e_SC', v1: 'S', v2: 'C', name: 'SC' },
        { id: 'e_SD', v1: 'S', v2: 'D', name: 'SD' },
        { id: 'e_SH', v1: 'S', v2: 'H', name: 'SH ⟂ (ABCD)', isHeight: true, color: '#ef4444' },
      ];

      const faces = [
        { id: 'f_bottom', vertexIds: ['A', 'B', 'C', 'D'], name: 'Đáy ABCD', color: '#f97316' },
        { id: 'f_SAB', vertexIds: ['S', 'B', 'A'], name: 'Mặt bên vuông góc (SAB)', color: '#ea580c' },
        { id: 'f_SBC', vertexIds: ['S', 'C', 'B'], name: 'Mặt bên SBC', color: '#fb923c' },
        { id: 'f_SCD', vertexIds: ['S', 'D', 'C'], name: 'Mặt bên SCD', color: '#fdba74' },
        { id: 'f_SDA', vertexIds: ['S', 'A', 'D'], name: 'Mặt bên SDA', color: '#fb923c' },
      ];

      const rightAngleMarkers = [
        { vertex: [0, yBottom, -z2] as [number, number, number], dir1: [0, 1, 0] as [number, number, number], dir2: [1, 0, 0] as [number, number, number], size: 0.3 },
        { vertex: [0, yBottom, -z2] as [number, number, number], dir1: [0, 1, 0] as [number, number, number], dir2: [0, 0, 1] as [number, number, number], size: 0.3 },
      ];

      return { vertices, edges, faces, rightAngleMarkers };
    },
    calculateFormulas: (params, unit) => {
      const a = params.a ?? 3.5;
      const b = params.b ?? 2.5;
      const h = params.h ?? 3.5;
      const S_day = a * b;
      const V = (1 / 3) * S_day * h;

      return [
        {
          name: 'Diện tích đáy ABCD',
          latexSymbol: 'S_{đ}',
          latexFormula: 'S = a \\times b',
          substitution: `${a} \\times ${b} = ${S_day}`,
          result: Number(S_day.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích hình chữ nhật đáy',
        },
        {
          name: 'Chiều cao khối chóp SH',
          latexSymbol: 'h = SH',
          latexFormula: 'SH \\perp AB \\Rightarrow SH \\perp (ABCD)',
          substitution: `${h}`,
          result: h,
          unit,
          explanation: 'Đường cao của tam giác mặt bên SAB',
        },
        {
          name: 'Thể tích khối chóp',
          latexSymbol: 'V',
          latexFormula: 'V = \\frac{1}{3} S_đ \\times h',
          substitution: `\\frac{1}{3} \\times ${S_day} \\times ${h} \\approx ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Một phần ba diện tích đáy nhân chiều cao SH',
        },
      ];
    },
  },

  // 13. Hình tứ diện (General Tetrahedron)
  {
    id: 'tetrahedron_general',
    name: 'Hình tứ diện',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Hình không gian gồm 4 đỉnh không đồng phẳng và 4 mặt đều là tam giác. Bất kỳ đỉnh nào cũng có thể coi là đỉnh chóp.',
    tags: ['Tứ diện', 'Hình chóp'],
    params: [
      { id: 'scale', label: 'Tỉ lệ kích thước', min: 1, max: 5, step: 0.5, default: 3, unit: 'cm' },
    ],
    defaultParams: { scale: 3 },
    educationalNotes: [
      'Gồm 4 đỉnh A, B, C, D và 6 cạnh: AB, BC, CD, DA, AC, BD.',
      'Hai cạnh không có điểm chung gọi là hai cạnh đối diện (ví dụ AB và CD).',
      'Có 4 mặt đều là tam giác.',
    ],
    generateGeometry: (params) => {
      const s = params.scale ?? 3;
      const vertices = [
        { id: 'A', name: 'A', pos: [0, s * 0.7, 0] as [number, number, number] },
        { id: 'B', name: 'B', pos: [-s * 0.5, -s * 0.35, -s * 0.4] as [number, number, number] },
        { id: 'C', name: 'C', pos: [s * 0.6, -s * 0.35, -s * 0.2] as [number, number, number] },
        { id: 'D', name: 'D', pos: [-s * 0.1, -s * 0.35, s * 0.5] as [number, number, number] },
      ];

      const edges = [
        { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
        { id: 'e_AC', v1: 'A', v2: 'C', name: 'AC' },
        { id: 'e_AD', v1: 'A', v2: 'D', name: 'AD' },
        { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
        { id: 'e_CD', v1: 'C', v2: 'D', name: 'CD' },
        { id: 'e_DB', v1: 'D', v2: 'B', name: 'DB' },
      ];

      const faces = [
        { id: 'f_BCD', vertexIds: ['B', 'C', 'D'], name: 'Mặt BCD', color: '#8b5cf6' },
        { id: 'f_ABC', vertexIds: ['A', 'B', 'C'], name: 'Mặt ABC', color: '#a78bfa' },
        { id: 'f_ACD', vertexIds: ['A', 'C', 'D'], name: 'Mặt ACD', color: '#c4b5fd' },
        { id: 'f_ADB', vertexIds: ['A', 'D', 'B'], name: 'Mặt ADB', color: '#8b5cf6' },
      ];

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const s = params.scale ?? 3;
      const V = (Math.sqrt(2) / 12) * s * s * s;
      return [
        {
          name: 'Số đỉnh, số cạnh, số mặt',
          latexSymbol: 'V - E + F = 2',
          latexFormula: '4 - 6 + 4 = 2',
          substitution: 'Định lý Euler cho đa diện',
          result: 2,
          unit: '',
          explanation: 'Tứ diện có 4 đỉnh, 6 cạnh, 4 mặt',
        },
        {
          name: 'Thể tích tứ diện ước lượng',
          latexSymbol: 'V',
          latexFormula: 'V = \\frac{1}{6} |[\\vec{AB}, \\vec{AC}] \\cdot \\vec{AD}|',
          substitution: `\\approx ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Một phần sáu tích hỗn tạp của 3 vectơ xuất phát từ cùng một đỉnh',
        },
      ];
    },
  },

  // 14. Hình tứ diện đều (Regular Tetrahedron)
  {
    id: 'regular_tetrahedron',
    name: 'Hình tứ diện đều',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Một trong năm khối đa diện đều Platon. Có 4 mặt là các tam giác đều bằng nhau, 6 cạnh bằng nhau và 4 đỉnh.',
    tags: ['Đa diện đều', 'Platon', 'Tứ diện'],
    params: [
      { id: 'a', label: 'Độ dài cạnh (a)', min: 1, max: 5, step: 0.5, default: 3.5, unit: 'cm' },
    ],
    defaultParams: { a: 3.5 },
    educationalNotes: [
      'Tất cả 6 cạnh đều có độ dài bằng a.',
      '4 mặt đều là tam giác đều cạnh a.',
      'Góc giữa hai mặt phẳng bất kỳ xấp xỉ 70°32\'.',
      'Tâm mặt cầu ngoại tiếp và nội tiếp trùng với trọng tâm của tứ diện đều.',
    ],
    generateGeometry: (params) => {
      const a = params.a ?? 3.5;
      const s = a / Math.sqrt(2);
      // Canonical coordinates of regular tetrahedron
      const vertices = [
        { id: 'A', name: 'A', pos: [s / 2, s / 2, s / 2] as [number, number, number] },
        { id: 'B', name: 'B', pos: [-s / 2, -s / 2, s / 2] as [number, number, number] },
        { id: 'C', name: 'C', pos: [-s / 2, s / 2, -s / 2] as [number, number, number] },
        { id: 'D', name: 'D', pos: [s / 2, -s / 2, -s / 2] as [number, number, number] },
      ];

      const edges = [
        { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
        { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
        { id: 'e_CA', v1: 'C', v2: 'A', name: 'CA' },
        { id: 'e_AD', v1: 'A', v2: 'D', name: 'AD' },
        { id: 'e_BD', v1: 'B', v2: 'D', name: 'BD' },
        { id: 'e_CD', v1: 'C', v2: 'D', name: 'CD' },
      ];

      const faces = [
        { id: 'f_ABC', vertexIds: ['A', 'B', 'C'], name: 'Mặt ABC', color: '#6366f1' },
        { id: 'f_ABD', vertexIds: ['A', 'D', 'B'], name: 'Mặt ABD', color: '#818cf8' },
        { id: 'f_BCD', vertexIds: ['B', 'D', 'C'], name: 'Mặt BCD', color: '#a5b4fc' },
        { id: 'f_CAD', vertexIds: ['C', 'D', 'A'], name: 'Mặt CAD', color: '#818cf8' },
      ];

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const a = params.a ?? 3.5;
      const S_one = (a * a * Math.sqrt(3)) / 4;
      const S_tp = a * a * Math.sqrt(3);
      const h = (a * Math.sqrt(6)) / 3;
      const V = (a * a * a * Math.sqrt(2)) / 12;

      return [
        {
          name: 'Diện tích một mặt tam giác đều',
          latexSymbol: 'S_1',
          latexFormula: 'S_1 = \\frac{a^2\\sqrt{3}}{4}',
          substitution: `\\frac{${a}^2\\sqrt{3}}{4} \\approx ${S_one.toFixed(2)}`,
          result: Number(S_one.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích tam giác đều cạnh a',
        },
        {
          name: 'Diện tích toàn phần',
          latexSymbol: 'S_{tp}',
          latexFormula: 'S_{tp} = 4S_1 = a^2\\sqrt{3}',
          substitution: `${a}^2\\sqrt{3} \\approx ${S_tp.toFixed(2)}`,
          result: Number(S_tp.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Tổng diện tích 4 mặt tam giác đều',
        },
        {
          name: 'Chiều cao khối tứ diện đều',
          latexSymbol: 'h',
          latexFormula: 'h = \\frac{a\\sqrt{6}}{3}',
          substitution: `\\frac{${a}\\sqrt{6}}{3} \\approx ${h.toFixed(2)}`,
          result: Number(h.toFixed(2)),
          unit,
          explanation: 'Khoảng cách từ đỉnh đến trọng tâm mặt đối diện',
        },
        {
          name: 'Thể tích khối tứ diện đều',
          latexSymbol: 'V',
          latexFormula: 'V = \\frac{a^3\\sqrt{2}}{12}',
          substitution: `\\frac{${a}^3\\sqrt{2}}{12} \\approx ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Thể tích chuẩn xác theo cạnh a',
        },
      ];
    },
    netDefinition: {
      canUnfold: true,
      unfoldTitle: 'Khai triển tứ diện đều',
      explanation: 'Gồm 1 tam giác đều trung tâm và 3 tam giác đều gắn quanh 3 cạnh tạo thành một tam giác lớn cạnh 2a.',
      unfold2DPolygons: (params) => {
        const a = (params.a ?? 3.5) * 20;
        const th = (a * Math.sqrt(3)) / 2;
        return [
          { id: 'center', name: 'Đáy BCD', points: [[0, 0], [a, 0], [a / 2, th]], color: '#e0e7ff', strokeColor: '#4338ca' },
          { id: 't1', name: 'Mặt ABD', points: [[0, 0], [a, 0], [a / 2, -th]], color: '#c7d2fe', strokeColor: '#4338ca' },
          { id: 't2', name: 'Mặt ABC', points: [[a, 0], [a / 2, th], [1.5 * a, th]], color: '#c7d2fe', strokeColor: '#4338ca' },
          { id: 't3', name: 'Mặt ACD', points: [[0, 0], [a / 2, th], [-a / 2, th]], color: '#c7d2fe', strokeColor: '#4338ca' },
        ];
      },
    },
  },

  // 15. Hình trụ (Cylinder)
  {
    id: 'cylinder',
    name: 'Hình trụ',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Hình tròn xoay sinh ra khi quay hình chữ nhật quanh một trục cố định là một cạnh của nó.',
    tags: ['Hình tròn xoay', 'Mặt trụ'],
    params: [
      { id: 'r', label: 'Bán kính đáy (r)', min: 0.5, max: 4, step: 0.25, default: 2, unit: 'cm' },
      { id: 'h', label: 'Chiều cao / Đường sinh (h = l)', min: 1, max: 6, step: 0.5, default: 3.5, unit: 'cm' },
    ],
    defaultParams: { r: 2, h: 3.5 },
    educationalNotes: [
      'Hai mặt đáy là hai hình tròn bằng nhau nằm trên hai mặt phẳng song song.',
      'Đường sinh l song song với trục và có độ dài bằng chiều cao: l = h.',
      'Khi cắt hình trụ bởi mặt phẳng song song với trục thu được thiết diện là hình chữ nhật.',
      'Khi cắt bởi mặt phẳng vuông góc với trục thu được thiết diện là hình tròn bằng đáy.',
    ],
    generateGeometry: (params) => {
      const r = params.r ?? 2;
      const h = params.h ?? 3.5;
      const seg = 24;
      const y2 = h / 2;

      const vertices: any[] = [];
      const edges: any[] = [];
      const faces: any[] = [];

      // Top and bottom circle vertices
      for (let i = 0; i < seg; i++) {
        const ang = (i * 2 * Math.PI) / seg;
        const x = r * Math.cos(ang);
        const z = r * Math.sin(ang);
        vertices.push({ id: `b_${i}`, name: i % 6 === 0 ? `B${i}` : '', pos: [x, -y2, z] });
        vertices.push({ id: `t_${i}`, name: i % 6 === 0 ? `T${i}` : '', pos: [x, y2, z] });
      }

      // Axis center vertices
      vertices.push({ id: 'O', name: 'O (tâm dưới)', pos: [0, -y2, 0], color: '#ef4444' });
      vertices.push({ id: "O'", name: "O' (tâm trên)", pos: [0, y2, 0], color: '#ef4444' });

      // Edges: circle loops
      for (let i = 0; i < seg; i++) {
        const next = (i + 1) % seg;
        edges.push({ id: `eb_${i}`, v1: `b_${i}`, v2: `b_${next}` });
        edges.push({ id: `et_${i}`, v1: `t_${i}`, v2: `t_${next}` });
      }

      // Generator lines (đường sinh) at 4 cardinal points
      edges.push({ id: 'gen_0', v1: 'b_0', v2: 't_0', name: 'Đường sinh l' });
      edges.push({ id: 'gen_6', v1: 'b_6', v2: 't_6', name: 'Đường sinh' });
      edges.push({ id: 'gen_12', v1: 'b_12', v2: 't_12', name: 'Đường sinh' });
      edges.push({ id: 'gen_18', v1: 'b_18', v2: 't_18', name: 'Đường sinh' });
      // Axis OO'
      edges.push({ id: 'axis_OO', v1: 'O', v2: "O'", name: "Trục OO'", isAxis: true, color: '#ef4444' });

      // Faces: bottom disc, top disc, and side quads
      const botFaceIds = Array.from({ length: seg }, (_, i) => `b_${i}`);
      const topFaceIds = Array.from({ length: seg }, (_, i) => `t_${seg - 1 - i}`);
      faces.push({ id: 'f_bottom', vertexIds: botFaceIds, name: 'Đáy tròn dưới', color: '#0284c7' });
      faces.push({ id: 'f_top', vertexIds: topFaceIds, name: 'Đáy tròn trên', color: '#0284c7' });

      for (let i = 0; i < seg; i++) {
        const next = (i + 1) % seg;
        faces.push({
          id: `f_side_${i}`,
          vertexIds: [`b_${i}`, `b_${next}`, `t_${next}`, `t_${i}`],
          name: 'Mặt xung quanh',
          color: '#38bdf8',
        });
      }

      const rightAngleMarkers = [
        { vertex: [0, -y2, 0] as [number, number, number], dir1: [0, 1, 0] as [number, number, number], dir2: [1, 0, 0] as [number, number, number], size: 0.3 },
      ];

      return { vertices, edges, faces, rightAngleMarkers };
    },
    calculateFormulas: (params, unit) => {
      const r = params.r ?? 2;
      const h = params.h ?? 3.5;
      const S_day = Math.PI * r * r;
      const C_day = 2 * Math.PI * r;
      const S_xq = 2 * Math.PI * r * h;
      const S_tp = S_xq + 2 * S_day;
      const V = Math.PI * r * r * h;

      return [
        {
          name: 'Diện tích một mặt đáy tròn',
          latexSymbol: 'S_đ',
          latexFormula: 'S_đ = \\pi r^2',
          substitution: `\\pi \\times ${r}^2 \\approx ${S_day.toFixed(2)}`,
          result: Number(S_day.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích hình tròn bán kính r',
        },
        {
          name: 'Chu vi đáy',
          latexSymbol: 'C_đ',
          latexFormula: 'C_đ = 2\\pi r',
          substitution: `2\\pi \\times ${r} \\approx ${C_day.toFixed(2)}`,
          result: Number(C_day.toFixed(2)),
          unit,
          explanation: 'Chiều dài dải hình chữ nhật khi mở phẳng mặt xung quanh',
        },
        {
          name: 'Diện tích xung quanh',
          latexSymbol: 'S_{xq}',
          latexFormula: 'S_{xq} = 2\\pi r h = 2\\pi r l',
          substitution: `2\\pi \\times ${r} \\times ${h} \\approx ${S_xq.toFixed(2)}`,
          result: Number(S_xq.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Chu vi đáy nhân với chiều cao/đường sinh',
        },
        {
          name: 'Diện tích toàn phần',
          latexSymbol: 'S_{tp}',
          latexFormula: 'S_{tp} = S_{xq} + 2S_đ = 2\\pi r(h + r)',
          substitution: `2\\pi \\times ${r} \\times (${h} + ${r}) \\approx ${S_tp.toFixed(2)}`,
          result: Number(S_tp.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Tổng diện tích xung quanh và 2 đáy tròn',
        },
        {
          name: 'Thể tích hình trụ',
          latexSymbol: 'V',
          latexFormula: 'V = \\pi r^2 h = S_đ \\times h',
          substitution: `\\pi \\times ${r}^2 \\times ${h} \\approx ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Diện tích đáy nhân chiều cao',
        },
      ];
    },
    netDefinition: {
      canUnfold: true,
      unfoldTitle: 'Khai triển hình trụ (2 Đáy tròn + Hình chữ nhật)',
      explanation: 'Mặt xung quanh trải phẳng thành hình chữ nhật kích thước (2πr × h), kèm 2 hình tròn đáy bán kính r gắn ở hai mép.',
      unfold2DPolygons: (params) => {
        const r = (params.r ?? 2) * 15;
        const h = (params.h ?? 3.5) * 15;
        const width = 2 * Math.PI * r;

        // Approximate circles with 20 points
        const circlePts = (cx: number, cy: number, radius: number): [number, number][] => {
          const pts: [number, number][] = [];
          for (let i = 0; i < 20; i++) {
            const ang = (i * 2 * Math.PI) / 20;
            pts.push([cx + radius * Math.cos(ang), cy + radius * Math.sin(ang)]);
          }
          return pts;
        };

        return [
          { id: 'rect', name: 'Mặt xung quanh (2πr × h)', points: [[0, 0], [width, 0], [width, h], [0, h]], color: '#bae6fd', strokeColor: '#0284c7' },
          { id: 'c_top', name: 'Đáy tròn trên', points: circlePts(width / 2, -r, r), color: '#7dd3fc', strokeColor: '#0284c7' },
          { id: 'c_bot', name: 'Đáy tròn dưới', points: circlePts(width / 2, h + r, r), color: '#7dd3fc', strokeColor: '#0284c7' },
        ];
      },
    },
    guidedSteps: [
      {
        id: 1,
        title: 'Mối liên hệ giữa đường sinh và chiều cao',
        question: 'Trong hình trụ tròn xoay, đường sinh l và chiều cao h có mối quan hệ gì?',
        hint: 'Đường sinh là đoạn thẳng nằm trên mặt xung quanh, nối hai đường tròn đáy và song song với trục.',
        answerExplanation: 'Trong hình trụ, mọi đường sinh đều song song và bằng trục, do đó đường sinh l luôn bằng chiều cao h (l = h).',
        expectedObservation: 'l = h.',
      },
    ],
  },

  // 16. Hình nón (Cone)
  {
    id: 'cone',
    name: 'Hình nón',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Hình tròn xoay sinh ra khi quay một tam giác vuông quanh một cạnh góc vuông cố định làm trục.',
    tags: ['Hình tròn xoay', 'Mặt nón'],
    params: [
      { id: 'r', label: 'Bán kính đáy (r)', min: 0.5, max: 4, step: 0.25, default: 2.2, unit: 'cm' },
      { id: 'h', label: 'Chiều cao (h)', min: 1, max: 6, step: 0.5, default: 3.8, unit: 'cm' },
    ],
    defaultParams: { r: 2.2, h: 3.8 },
    educationalNotes: [
      'Tam giác vuông SOA quay quanh trục SO sinh ra hình nón.',
      'Mối liên hệ Pythagore cốt lõi: l² = h² + r² (đường sinh l, chiều cao h, bán kính r).',
      'Đỉnh S chiếu vuông góc xuống tâm O của hình tròn đáy.',
      'Góc ở đỉnh của hình nón là 2α với tan α = r / h.',
    ],
    generateGeometry: (params) => {
      const r = params.r ?? 2.2;
      const h = params.h ?? 3.8;
      const seg = 24;
      const yBottom = -h / 3;
      const yTop = (2 * h) / 3;

      const vertices: any[] = [];
      const edges: any[] = [];
      const faces: any[] = [];

      vertices.push({ id: 'S', name: 'S (đỉnh)', pos: [0, yTop, 0], color: '#f59e0b' });
      vertices.push({ id: 'O', name: 'O (tâm đáy)', pos: [0, yBottom, 0], color: '#ef4444' });

      for (let i = 0; i < seg; i++) {
        const ang = (i * 2 * Math.PI) / seg;
        const x = r * Math.cos(ang);
        const z = r * Math.sin(ang);
        vertices.push({ id: `b_${i}`, name: i === 0 ? 'A' : '', pos: [x, yBottom, z] });
      }

      // Base circle edge loop
      for (let i = 0; i < seg; i++) {
        const next = (i + 1) % seg;
        edges.push({ id: `eb_${i}`, v1: `b_${i}`, v2: `b_${next}` });
      }

      // Generator lines (đường sinh)
      edges.push({ id: 'gen_0', v1: 'S', v2: 'b_0', name: 'Đường sinh l' });
      edges.push({ id: 'gen_12', v1: 'S', v2: 'b_12', name: 'Đường sinh l' });
      // Height and radius lines
      edges.push({ id: 'h_SO', v1: 'S', v2: 'O', name: 'Chiều cao h (SO)', isHeight: true, color: '#ef4444' });
      edges.push({ id: 'r_OA', v1: 'O', v2: 'b_0', name: 'Bán kính r (OA)', isHeight: true, color: '#10b981' });

      // Faces: bottom circular disc and cone side triangles
      const botFaceIds = Array.from({ length: seg }, (_, i) => `b_${i}`);
      faces.push({ id: 'f_bottom', vertexIds: botFaceIds, name: 'Đáy hình tròn', color: '#f59e0b' });

      for (let i = 0; i < seg; i++) {
        const next = (i + 1) % seg;
        faces.push({
          id: `f_side_${i}`,
          vertexIds: ['S', `b_${next}`, `b_${i}`],
          name: 'Mặt xung quanh',
          color: '#fbbf24',
        });
      }

      const rightAngleMarkers = [
        { vertex: [0, yBottom, 0] as [number, number, number], dir1: [0, 1, 0] as [number, number, number], dir2: [1, 0, 0] as [number, number, number], size: 0.3 },
      ];

      return { vertices, edges, faces, rightAngleMarkers };
    },
    calculateFormulas: (params, unit) => {
      const r = params.r ?? 2.2;
      const h = params.h ?? 3.8;
      const l = Math.sqrt(r * r + h * h);
      const S_day = Math.PI * r * r;
      const S_xq = Math.PI * r * l;
      const S_tp = S_xq + S_day;
      const V = (1 / 3) * Math.PI * r * r * h;
      const sectorAngleDeg = (r / l) * 360;

      return [
        {
          name: 'Độ dài đường sinh',
          latexSymbol: 'l',
          latexFormula: 'l = \\sqrt{h^2 + r^2}',
          substitution: `\\sqrt{${h}^2 + ${r}^2} \\approx ${l.toFixed(2)}`,
          result: Number(l.toFixed(2)),
          unit,
          explanation: 'Cạnh huyền của tam giác vuông SOA',
        },
        {
          name: 'Diện tích mặt đáy',
          latexSymbol: 'S_đ',
          latexFormula: 'S_đ = \\pi r^2',
          substitution: `\\pi \\times ${r}^2 \\approx ${S_day.toFixed(2)}`,
          result: Number(S_day.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích hình tròn đáy',
        },
        {
          name: 'Diện tích xung quanh',
          latexSymbol: 'S_{xq}',
          latexFormula: 'S_{xq} = \\pi r l',
          substitution: `\\pi \\times ${r} \\times ${l.toFixed(2)} \\approx ${S_xq.toFixed(2)}`,
          result: Number(S_xq.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Bán kính đáy nhân đường sinh nhân pi',
        },
        {
          name: 'Diện tích toàn phần',
          latexSymbol: 'S_{tp}',
          latexFormula: 'S_{tp} = S_{xq} + S_đ = \\pi r(l + r)',
          substitution: `\\pi \\times ${r} \\times (${l.toFixed(2)} + ${r}) \\approx ${S_tp.toFixed(2)}`,
          result: Number(S_tp.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Tổng diện tích xung quanh và đáy',
        },
        {
          name: 'Thể tích hình nón',
          latexSymbol: 'V',
          latexFormula: 'V = \\frac{1}{3} \\pi r^2 h = \\frac{1}{3} S_đ \\times h',
          substitution: `\\frac{1}{3} \\times \\pi \\times ${r}^2 \\times ${h} \\approx ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Bằng một phần ba thể tích hình trụ có cùng bán kính đáy và chiều cao',
        },
        {
          name: 'Góc ở tâm hình quạt khi khai triển',
          latexSymbol: '\\alpha^\\circ',
          latexFormula: '\\alpha = \\frac{r}{l} \\times 360^\\circ',
          substitution: `\\frac{${r}}{${l.toFixed(2)}} \\times 360^\\circ \\approx ${sectorAngleDeg.toFixed(1)}^\\circ`,
          result: Number(sectorAngleDeg.toFixed(1)),
          unit: 'độ (°)',
          explanation: 'Góc mở của hình quạt tròn tạo nên mặt xung quanh',
        },
      ];
    },
    netDefinition: {
      canUnfold: true,
      unfoldTitle: 'Khai triển hình nón (Hình quạt tròn + Đáy tròn)',
      explanation: 'Mặt xung quanh mở thành một hình quạt tròn bán kính l có góc ở tâm α = (r/l)×360°, gắn kèm hình tròn đáy bán kính r.',
      unfold2DPolygons: (params) => {
        const r = (params.r ?? 2.2) * 15;
        const h = (params.h ?? 3.8) * 15;
        const l = Math.sqrt(r * r + h * h);
        const theta = (r / l) * 2 * Math.PI;

        const fanPts: [number, number][] = [[0, 0]];
        const fanSteps = 24;
        for (let i = 0; i <= fanSteps; i++) {
          const a = -theta / 2 + (i * theta) / fanSteps;
          fanPts.push([l * Math.sin(a), l * Math.cos(a)]);
        }

        const circlePts: [number, number][] = [];
        for (let i = 0; i < 20; i++) {
          const a = (i * 2 * Math.PI) / 20;
          circlePts.push([r * Math.cos(a), l + r + r * Math.sin(a)]);
        }

        return [
          { id: 'fan', name: 'Hình quạt tròn xung quanh', points: fanPts, color: '#fef08a', strokeColor: '#d97706' },
          { id: 'base_circle', name: 'Đáy hình tròn', points: circlePts, color: '#fed7aa', strokeColor: '#ea580c' },
        ];
      },
    },
    guidedSteps: [
      {
        id: 1,
        title: 'Tam giác vuông tạo bởi trục',
        question: 'Hãy quan sát tam giác SOA. Ba yếu tố h, r, l liên hệ với nhau theo định lý nào?',
        hint: 'Tam giác SOA vuông tại O. SO là chiều cao h, OA là bán kính r, SA là đường sinh l.',
        answerExplanation: 'Theo định lý Pythagore trong tam giác vuông SOA tại O, ta có l² = h² + r² hay l = √(h² + r²).',
        expectedObservation: 'l² = h² + r² (Định lý Pythagore).',
      },
    ],
  },

  // 17. Hình nón cụt (Truncated Cone / Frustum)
  {
    id: 'cone_frustum',
    name: 'Hình nón cụt',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Phần hình nón nằm giữa mặt phẳng đáy và một mặt phẳng song song với đáy cắt hình nón.',
    tags: ['Hình tròn xoay', 'Mặt nón'],
    params: [
      { id: 'R', label: 'Bán kính đáy lớn (R)', min: 1.5, max: 4, step: 0.25, default: 2.8, unit: 'cm' },
      { id: 'r', label: 'Bán kính đáy nhỏ (r)', min: 0.5, max: 2.5, step: 0.25, default: 1.4, unit: 'cm' },
      { id: 'h', label: 'Chiều cao (h)', min: 1, max: 5, step: 0.5, default: 3, unit: 'cm' },
    ],
    defaultParams: { R: 2.8, r: 1.4, h: 3 },
    educationalNotes: [
      'Có hai đáy là hai hình tròn song song có bán kính khác nhau (R > r).',
      'Đường sinh: l = √(h² + (R - r)²).',
      'Công thức thể tích kinh điển: V = (1/3)πh(R² + r² + Rr).',
    ],
    generateGeometry: (params) => {
      const R = params.R ?? 2.8;
      const r = params.r ?? 1.4;
      const h = params.h ?? 3;
      const seg = 24;
      const yBottom = -h / 2;
      const yTop = h / 2;

      const vertices: any[] = [];
      const edges: any[] = [];
      const faces: any[] = [];

      // Base circles
      for (let i = 0; i < seg; i++) {
        const ang = (i * 2 * Math.PI) / seg;
        vertices.push({ id: `b_${i}`, name: '', pos: [R * Math.cos(ang), yBottom, R * Math.sin(ang)] });
        vertices.push({ id: `t_${i}`, name: '', pos: [r * Math.cos(ang), yTop, r * Math.sin(ang)] });
      }

      vertices.push({ id: 'O1', name: 'O (đáy lớn)', pos: [0, yBottom, 0], color: '#ef4444' });
      vertices.push({ id: 'O2', name: "O' (đáy nhỏ)", pos: [0, yTop, 0], color: '#ef4444' });

      for (let i = 0; i < seg; i++) {
        const next = (i + 1) % seg;
        edges.push({ id: `eb_${i}`, v1: `b_${i}`, v2: `b_${next}` });
        edges.push({ id: `et_${i}`, v1: `t_${i}`, v2: `t_${next}` });
      }

      // Generator lines
      edges.push({ id: 'gen_0', v1: 'b_0', v2: 't_0', name: 'Đường sinh l' });
      edges.push({ id: 'gen_12', v1: 'b_12', v2: 't_12', name: 'Đường sinh l' });
      edges.push({ id: 'axis', v1: 'O1', v2: 'O2', name: 'Trục OO\' (chiều cao h)', isHeight: true, color: '#ef4444' });

      const botFaceIds = Array.from({ length: seg }, (_, i) => `b_${i}`);
      const topFaceIds = Array.from({ length: seg }, (_, i) => `t_${seg - 1 - i}`);
      faces.push({ id: 'f_bottom', vertexIds: botFaceIds, name: 'Đáy tròn lớn (R)', color: '#f59e0b' });
      faces.push({ id: 'f_top', vertexIds: topFaceIds, name: 'Đáy tròn nhỏ (r)', color: '#f59e0b' });

      for (let i = 0; i < seg; i++) {
        const next = (i + 1) % seg;
        faces.push({
          id: `f_side_${i}`,
          vertexIds: [`b_${i}`, `b_${next}`, `t_${next}`, `t_${i}`],
          name: 'Mặt xung quanh',
          color: '#fbbf24',
        });
      }

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const R = params.R ?? 2.8;
      const r = params.r ?? 1.4;
      const h = params.h ?? 3;
      const l = Math.sqrt(h * h + (R - r) * (R - r));
      const S_xq = Math.PI * (R + r) * l;
      const S_dayLon = Math.PI * R * R;
      const S_dayNho = Math.PI * r * r;
      const S_tp = S_xq + S_dayLon + S_dayNho;
      const V = (1 / 3) * Math.PI * h * (R * R + r * r + R * r);

      return [
        {
          name: 'Độ dài đường sinh',
          latexSymbol: 'l',
          latexFormula: 'l = \\sqrt{h^2 + (R - r)^2}',
          substitution: `\\sqrt{${h}^2 + (${R} - ${r})^2} \\approx ${l.toFixed(2)}`,
          result: Number(l.toFixed(2)),
          unit,
          explanation: 'Đoạn nối hai mép đường tròn đáy',
        },
        {
          name: 'Diện tích xung quanh',
          latexSymbol: 'S_{xq}',
          latexFormula: 'S_{xq} = \\pi (R + r)l',
          substitution: `\\pi \\times (${R} + ${r}) \\times ${l.toFixed(2)} \\approx ${S_xq.toFixed(2)}`,
          result: Number(S_xq.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích mặt bên hình nón cụt',
        },
        {
          name: 'Diện tích toàn phần',
          latexSymbol: 'S_{tp}',
          latexFormula: 'S_{tp} = S_{xq} + \\pi R^2 + \\pi r^2',
          substitution: `${S_xq.toFixed(2)} + ${S_dayLon.toFixed(2)} + ${S_dayNho.toFixed(2)} \\approx ${S_tp.toFixed(2)}`,
          result: Number(S_tp.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Tổng diện tích xung quanh và 2 đáy tròn',
        },
        {
          name: 'Thể tích hình nón cụt',
          latexSymbol: 'V',
          latexFormula: 'V = \\frac{1}{3}\\pi h (R^2 + r^2 + Rr)',
          substitution: `\\frac{1}{3}\\pi \\times ${h} \\times (${R}^2 + ${r}^2 + ${R}\\times${r}) \\approx ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Công thức thể tích nón cụt',
        },
      ];
    },
  },

  // 18. Hình cầu (Sphere)
  {
    id: 'sphere',
    name: 'Hình cầu và Mặt cầu',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Tập hợp các điểm trong không gian cách một điểm O cố định một khoảng cách không đổi R.',
    tags: ['Hình tròn xoay', 'Mặt cầu'],
    params: [
      { id: 'r', label: 'Bán kính hình cầu (R)', min: 0.5, max: 4, step: 0.25, default: 2.2, unit: 'cm' },
    ],
    defaultParams: { r: 2.2 },
    educationalNotes: [
      'Mặt cầu là biên giới hạn của khối cầu.',
      'Mọi thiết diện qua tâm đều là hình tròn lớn có bán kính R và chu vi 2πR.',
      'Định lý Egregium của Gauss chứng minh: Mặt cầu có độ cong Gauss dương (K = 1/R² > 0) nên KHÔNG THỂ trải phẳng chính xác lên mặt phẳng (K = 0) mà không bị biến dạng, kéo giãn hoặc rách mép!',
    ],
    generateGeometry: (params) => {
      const r = params.r ?? 2.2;
      const rings = 16;
      const segs = 20;

      const vertices: any[] = [];
      const edges: any[] = [];
      const faces: any[] = [];

      // Center O
      vertices.push({ id: 'O', name: 'O (tâm)', pos: [0, 0, 0], color: '#ef4444' });

      // Generate latitude and longitude wire rings
      for (let i = 0; i < segs; i++) {
        const ang = (i * 2 * Math.PI) / segs;
        // Equator ring
        vertices.push({ id: `eq_${i}`, name: i === 0 ? 'M' : '', pos: [r * Math.cos(ang), 0, r * Math.sin(ang)] });
        // Meridian ring
        vertices.push({ id: `mer_${i}`, name: '', pos: [0, r * Math.sin(ang), r * Math.cos(ang)] });
      }

      for (let i = 0; i < segs; i++) {
        const next = (i + 1) % segs;
        edges.push({ id: `e_eq_${i}`, v1: `eq_${i}`, v2: `eq_${next}`, color: '#38bdf8' });
        edges.push({ id: `e_mer_${i}`, v1: `mer_${i}`, v2: `mer_${next}`, color: '#38bdf8' });
      }

      // Radius OM
      edges.push({ id: 'r_OM', v1: 'O', v2: 'eq_0', name: 'Bán kính R', isHeight: true, color: '#ef4444' });

      // Create UV sphere faces for 3D solid rendering
      for (let lat = 0; lat < rings; lat++) {
        const theta1 = (lat * Math.PI) / rings;
        const theta2 = ((lat + 1) * Math.PI) / rings;

        for (let lon = 0; lon < segs; lon++) {
          const phi1 = (lon * 2 * Math.PI) / segs;
          const phi2 = ((lon + 1) * 2 * Math.PI) / segs;

          const p1 = [r * Math.sin(theta1) * Math.cos(phi1), r * Math.cos(theta1), r * Math.sin(theta1) * Math.sin(phi1)] as [number, number, number];
          const p2 = [r * Math.sin(theta1) * Math.cos(phi2), r * Math.cos(theta1), r * Math.sin(theta1) * Math.sin(phi2)] as [number, number, number];
          const p3 = [r * Math.sin(theta2) * Math.cos(phi2), r * Math.cos(theta2), r * Math.sin(theta2) * Math.sin(phi2)] as [number, number, number];
          const p4 = [r * Math.sin(theta2) * Math.cos(phi1), r * Math.cos(theta2), r * Math.sin(theta2) * Math.sin(phi1)] as [number, number, number];

          const vId1 = `sph_${lat}_${lon}_1`;
          const vId2 = `sph_${lat}_${lon}_2`;
          const vId3 = `sph_${lat}_${lon}_3`;
          const vId4 = `sph_${lat}_${lon}_4`;

          vertices.push({ id: vId1, name: '', pos: p1 });
          vertices.push({ id: vId2, name: '', pos: p2 });
          vertices.push({ id: vId3, name: '', pos: p3 });
          vertices.push({ id: vId4, name: '', pos: p4 });

          faces.push({
            id: `f_sph_${lat}_${lon}`,
            vertexIds: [vId1, vId2, vId3, vId4],
            name: 'Mặt cầu',
            color: '#0284c7',
            opacity: 0.65,
          });
        }
      }

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const r = params.r ?? 2.2;
      const S = 4 * Math.PI * r * r;
      const V = (4 / 3) * Math.PI * r * r * r;
      const C_lon = 2 * Math.PI * r;

      return [
        {
          name: 'Diện tích mặt cầu',
          latexSymbol: 'S',
          latexFormula: 'S = 4\\pi R^2',
          substitution: `4\\pi \\times ${r}^2 \\approx ${S.toFixed(2)}`,
          result: Number(S.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Bằng 4 lần diện tích hình tròn lớn đi qua tâm',
        },
        {
          name: 'Thể tích khối cầu',
          latexSymbol: 'V',
          latexFormula: 'V = \\frac{4}{3}\\pi R^3',
          substitution: `\\frac{4}{3}\\pi \\times ${r}^3 \\approx ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Thể tích không gian chiếm bởi khối cầu',
        },
        {
          name: 'Chu vi đường tròn lớn',
          latexSymbol: 'C',
          latexFormula: 'C = 2\\pi R',
          substitution: `2\\pi \\times ${r} \\approx ${C_lon.toFixed(2)}`,
          result: Number(C_lon.toFixed(2)),
          unit,
          explanation: 'Chu vi đường xích đạo của hình cầu',
        },
      ];
    },
    netDefinition: {
      canUnfold: false,
      unfoldTitle: 'Định lý Egregium của Gauss (Không thể trải phẳng chính xác)',
      explanation: 'Theo Định lý Theorema Egregium của nhà toán học C.F. Gauss, độ cong Gauss của mặt cầu là K = 1/R² > 0, trong khi mặt phẳng có K = 0. Do đó, KHÔNG THỂ mở phẳng hoàn hảo một mặt cầu thành một hình phẳng mà không làm méo mó, co giãn kích thước hoặc rách mép (đây là lý do mọi bản đồ thế giới phẳng đều bị biến dạng diện tích hoặc hình dạng!). Để xấp xỉ, người ta thường dùng phép chiếu múi cam (Gore segments).',
    },
    guidedSteps: [
      {
        id: 1,
        title: 'Tỉ số thể tích và diện tích',
        question: 'Khi bán kính R tăng lên gấp đôi thì diện tích mặt cầu và thể tích khối cầu tăng lên bao nhiêu lần?',
        hint: 'S tỉ lệ với R², V tỉ lệ với R³.',
        answerExplanation: 'Diện tích mặt cầu tăng 2² = 4 lần. Thể tích khối cầu tăng 2³ = 8 lần!',
        expectedObservation: 'Diện tích tăng 4 lần, Thể tích tăng 8 lần.',
      },
    ],
  },

  // 19. Hình bán cầu (Hemisphere)
  {
    id: 'hemisphere',
    name: 'Hình bán cầu',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Một nửa hình cầu bị chia cắt bởi một mặt phẳng đi qua tâm.',
    tags: ['Hình tròn xoay', 'Mặt cầu'],
    params: [
      { id: 'r', label: 'Bán kính (R)', min: 0.5, max: 4, step: 0.25, default: 2.2, unit: 'cm' },
    ],
    defaultParams: { r: 2.2 },
    educationalNotes: [
      'Gồm một mặt cong bán cầu và một mặt phẳng đáy tròn bán kính R.',
      'Diện tích toàn phần gồm diện tích mặt cong (2πR²) cộng diện tích đáy tròn (πR²), tổng bằng 3πR².',
      'Thể tích bằng một nửa thể tích hình cầu: V = (2/3)πR³.',
    ],
    generateGeometry: (params) => {
      const r = params.r ?? 2.2;
      const rings = 10;
      const segs = 20;

      const vertices: any[] = [];
      const edges: any[] = [];
      const faces: any[] = [];

      vertices.push({ id: 'O', name: 'O (tâm đáy)', pos: [0, 0, 0], color: '#ef4444' });

      // Equator base circle
      for (let i = 0; i < segs; i++) {
        const ang = (i * 2 * Math.PI) / segs;
        vertices.push({ id: `b_${i}`, name: i === 0 ? 'A' : '', pos: [r * Math.cos(ang), 0, r * Math.sin(ang)] });
      }

      for (let i = 0; i < segs; i++) {
        const next = (i + 1) % segs;
        edges.push({ id: `eb_${i}`, v1: `b_${i}`, v2: `b_${next}`, color: '#38bdf8' });
      }

      edges.push({ id: 'r_OA', v1: 'O', v2: 'b_0', name: 'Bán kính R', isHeight: true, color: '#ef4444' });

      // Circular base face
      const botFaceIds = Array.from({ length: segs }, (_, i) => `b_${i}`);
      faces.push({ id: 'f_bottom', vertexIds: botFaceIds, name: 'Đáy tròn bán cầu', color: '#0284c7' });

      // Top dome faces
      for (let lat = 0; lat < rings; lat++) {
        const theta1 = (lat * (Math.PI / 2)) / rings;
        const theta2 = ((lat + 1) * (Math.PI / 2)) / rings;

        for (let lon = 0; lon < segs; lon++) {
          const phi1 = (lon * 2 * Math.PI) / segs;
          const phi2 = ((lon + 1) * 2 * Math.PI) / segs;

          const p1 = [r * Math.cos(theta1) * Math.cos(phi1), r * Math.sin(theta1), r * Math.cos(theta1) * Math.sin(phi1)] as [number, number, number];
          const p2 = [r * Math.cos(theta1) * Math.cos(phi2), r * Math.sin(theta1), r * Math.cos(theta1) * Math.sin(phi2)] as [number, number, number];
          const p3 = [r * Math.cos(theta2) * Math.cos(phi2), r * Math.sin(theta2), r * Math.cos(theta2) * Math.sin(phi2)] as [number, number, number];
          const p4 = [r * Math.cos(theta2) * Math.cos(phi1), r * Math.sin(theta2), r * Math.cos(theta2) * Math.sin(phi1)] as [number, number, number];

          const v1 = `hemi_${lat}_${lon}_1`;
          const v2 = `hemi_${lat}_${lon}_2`;
          const v3 = `hemi_${lat}_${lon}_3`;
          const v4 = `hemi_${lat}_${lon}_4`;

          vertices.push({ id: v1, name: '', pos: p1 });
          vertices.push({ id: v2, name: '', pos: p2 });
          vertices.push({ id: v3, name: '', pos: p3 });
          vertices.push({ id: v4, name: '', pos: p4 });

          faces.push({ id: `f_dome_${lat}_${lon}`, vertexIds: [v1, v2, v3, v4], name: 'Mặt cong bán cầu', color: '#38bdf8', opacity: 0.75 });
        }
      }

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const r = params.r ?? 2.2;
      const S_cong = 2 * Math.PI * r * r;
      const S_day = Math.PI * r * r;
      const S_tp = 3 * Math.PI * r * r;
      const V = (2 / 3) * Math.PI * r * r * r;

      return [
        {
          name: 'Diện tích mặt cong',
          latexSymbol: 'S_{cong}',
          latexFormula: 'S = 2\\pi R^2',
          substitution: `2\\pi \\times ${r}^2 \\approx ${S_cong.toFixed(2)}`,
          result: Number(S_cong.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Một nửa diện tích mặt cầu',
        },
        {
          name: 'Diện tích toàn phần',
          latexSymbol: 'S_{tp}',
          latexFormula: 'S_{tp} = 2\\pi R^2 + \\pi R^2 = 3\\pi R^2',
          substitution: `3\\pi \\times ${r}^2 \\approx ${S_tp.toFixed(2)}`,
          result: Number(S_tp.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích mặt cong cộng mặt phẳng đáy tròn',
        },
        {
          name: 'Thể tích hình bán cầu',
          latexSymbol: 'V',
          latexFormula: 'V = \\frac{2}{3}\\pi R^3',
          substitution: `\\frac{2}{3}\\pi \\times ${r}^3 \\approx ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Một nửa thể tích hình cầu',
        },
      ];
    },
  },

  // 20. Hình chóp cụt (Truncated Pyramid / Frustum of Pyramid)
  {
    id: 'pyramid_frustum',
    name: 'Hình chóp cụt đều',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Phần hình chóp đều nằm giữa mặt đáy và một mặt phẳng song song với đáy cắt các cạnh bên của hình chóp.',
    tags: ['Chóp đều', 'Đa diện'],
    params: [
      { id: 'a', label: 'Cạnh đáy lớn (a)', min: 1.5, max: 5, step: 0.5, default: 3.6, unit: 'cm' },
      { id: 'b', label: 'Cạnh đáy nhỏ (b)', min: 0.5, max: 3, step: 0.5, default: 1.8, unit: 'cm' },
      { id: 'h', label: 'Chiều cao (h)', min: 1, max: 5, step: 0.5, default: 3, unit: 'cm' },
    ],
    defaultParams: { a: 3.6, b: 1.8, h: 3 },
    educationalNotes: [
      'Hai mặt đáy là hai hình vuông song song và đồng dạng với nhau.',
      'Các mặt bên là các hình thang cân bằng nhau.',
      'Công thức thể tích kinh điển: V = (1/3)h(B1 + B2 + √(B1·B2)).',
    ],
    generateGeometry: (params) => {
      const a = params.a ?? 3.6;
      const b = params.b ?? 1.8;
      const h = params.h ?? 3;
      const a2 = a / 2;
      const b2 = b / 2;
      const yBottom = -h / 2;
      const yTop = h / 2;

      const vertices = [
        // Bottom square
        { id: 'A', name: 'A', pos: [-a2, yBottom, -a2] as [number, number, number] },
        { id: 'B', name: 'B', pos: [a2, yBottom, -a2] as [number, number, number] },
        { id: 'C', name: 'C', pos: [a2, yBottom, a2] as [number, number, number] },
        { id: 'D', name: 'D', pos: [-a2, yBottom, a2] as [number, number, number] },
        // Top square
        { id: "A'", name: "A'", pos: [-b2, yTop, -b2] as [number, number, number] },
        { id: "B'", name: "B'", pos: [b2, yTop, -b2] as [number, number, number] },
        { id: "C'", name: "C'", pos: [b2, yTop, b2] as [number, number, number] },
        { id: "D'", name: "D'", pos: [-b2, yTop, b2] as [number, number, number] },
        // Centers
        { id: 'O', name: 'O', pos: [0, yBottom, 0] as [number, number, number], color: '#ef4444' },
        { id: "O'", name: "O'", pos: [0, yTop, 0] as [number, number, number], color: '#ef4444' },
      ];

      const edges = [
        { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
        { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
        { id: 'e_CD', v1: 'C', v2: 'D', name: 'CD' },
        { id: 'e_DA', v1: 'D', v2: 'A', name: 'DA' },
        { id: 'e_ApBp', v1: "A'", v2: "B'", name: "A'B'" },
        { id: 'e_BpCp', v1: "B'", v2: "C'", name: "B'C'" },
        { id: 'e_CpDp', v1: "C'", v2: "D'", name: "C'D'" },
        { id: 'e_DpAp', v1: "D'", v2: "A'", name: "D'A'" },
        { id: 'e_AAp', v1: 'A', v2: "A'", name: "AA'" },
        { id: 'e_BBp', v1: 'B', v2: "BB'", name: "BB'" },
        { id: 'e_CCp', v1: 'C', v2: "C'", name: "CC'" },
        { id: 'e_DDp', v1: 'D', v2: "D'", name: "DD'" },
        { id: 'e_OO', v1: 'O', v2: "O'", name: "OO' (chiều cao h)", isHeight: true, color: '#ef4444' },
      ];

      const faces = [
        { id: 'f_bottom', vertexIds: ['A', 'B', 'C', 'D'], name: 'Đáy lớn ABCD', color: '#f59e0b' },
        { id: 'f_top', vertexIds: ["A'", "D'", "C'", "B'"], name: "Đáy nhỏ A'B'C'D'", color: '#f59e0b' },
        { id: 'f_front', vertexIds: ['D', 'C', "C'", "D'"], name: "Mặt bên CDD'C'", color: '#fbbf24' },
        { id: 'f_back', vertexIds: ['B', 'A', "A'", "B'"], name: "Mặt bên ABB'A'", color: '#fbbf24' },
        { id: 'f_left', vertexIds: ['A', 'D', "D'", "A'"], name: "Mặt bên ADD'A'", color: '#fcd34d' },
        { id: 'f_right', vertexIds: ['C', 'B', "B'", "C'"], name: "Mặt bên BCC'B'", color: '#fcd34d' },
      ];

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const a = params.a ?? 3.6;
      const b = params.b ?? 1.8;
      const h = params.h ?? 3;
      const B1 = a * a;
      const B2 = b * b;
      const V = (1 / 3) * h * (B1 + B2 + Math.sqrt(B1 * B2));
      const d = Math.sqrt(h * h + ((a - b) / 2) ** 2); // trung đoạn hình thang
      const S_xq = 4 * (((a + b) * d) / 2);
      const S_tp = S_xq + B1 + B2;

      return [
        {
          name: 'Diện tích đáy lớn',
          latexSymbol: 'B_1',
          latexFormula: 'B_1 = a^2',
          substitution: `${a}^2 = ${B1.toFixed(2)}`,
          result: Number(B1.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích hình vuông đáy lớn',
        },
        {
          name: 'Diện tích đáy nhỏ',
          latexSymbol: 'B_2',
          latexFormula: 'B_2 = b^2',
          substitution: `${b}^2 = ${B2.toFixed(2)}`,
          result: Number(B2.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Diện tích hình vuông đáy nhỏ',
        },
        {
          name: 'Diện tích xung quanh',
          latexSymbol: 'S_{xq}',
          latexFormula: 'S_{xq} = 4 \\times \\frac{(a + b)d}{2} = 2(a + b)d',
          substitution: `2(${a} + ${b}) \\times ${d.toFixed(2)} \\approx ${S_xq.toFixed(2)}`,
          result: Number(S_xq.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Tổng diện tích 4 hình thang cân bên',
        },
        {
          name: 'Thể tích hình chóp cụt đều',
          latexSymbol: 'V',
          latexFormula: 'V = \\frac{1}{3}h (B_1 + B_2 + \\sqrt{B_1 B_2})',
          substitution: `\\frac{1}{3} \\times ${h} (${B1.toFixed(2)} + ${B2.toFixed(2)} + \\sqrt{${(B1 * B2).toFixed(2)}}) \\approx ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Công thức thể tích khối chóp cụt chuẩn',
        },
      ];
    },
  },

  // 21. Hình đa diện (Bát diện đều / Regular Octahedron)
  {
    id: 'octahedron',
    name: 'Bát diện đều',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'all',
    description: 'Một trong năm khối đa diện đều Platon (loại {3, 4}). Có 8 mặt là tam giác đều bằng nhau, 6 đỉnh và 12 cạnh bằng nhau.',
    tags: ['Đa diện đều', 'Platon'],
    params: [
      { id: 'a', label: 'Độ dài cạnh (a)', min: 1, max: 5, step: 0.5, default: 3, unit: 'cm' },
    ],
    defaultParams: { a: 3 },
    educationalNotes: [
      'Gồm 6 đỉnh: 2 đỉnh trên trục thẳng đứng và 4 đỉnh tạo thành hình vuông nằm ngang.',
      'Có 12 cạnh bằng nhau và 8 mặt tam giác đều.',
      'Có 9 mặt phẳng đối xứng và 3 trục đối xứng bậc 4.',
      'Là khối đa diện liên hợp (dual polyhedron) của hình lập phương.',
    ],
    generateGeometry: (params) => {
      const a = params.a ?? 3;
      const s = (a * Math.sqrt(2)) / 2;

      const vertices = [
        { id: 'T', name: 'T (đỉnh trên)', pos: [0, s, 0] as [number, number, number], color: '#f59e0b' },
        { id: 'B', name: 'B (đỉnh dưới)', pos: [0, -s, 0] as [number, number, number], color: '#f59e0b' },
        { id: 'A1', name: 'A1', pos: [s, 0, 0] as [number, number, number] },
        { id: 'A2', name: 'A2', pos: [0, 0, s] as [number, number, number] },
        { id: 'A3', name: 'A3', pos: [-s, 0, 0] as [number, number, number] },
        { id: 'A4', name: 'A4', pos: [0, 0, -s] as [number, number, number] },
      ];

      const edges = [
        // Horizontal square
        { id: 'e_12', v1: 'A1', v2: 'A2' },
        { id: 'e_23', v1: 'A2', v2: 'A3' },
        { id: 'e_34', v1: 'A3', v2: 'A4' },
        { id: 'e_41', v1: 'A4', v2: 'A1' },
        // Top pyramid edges
        { id: 'e_T1', v1: 'T', v2: 'A1' },
        { id: 'e_T2', v1: 'T', v2: 'A2' },
        { id: 'e_T3', v1: 'T', v2: 'A3' },
        { id: 'e_T4', v1: 'T', v2: 'A4' },
        // Bottom pyramid edges
        { id: 'e_B1', v1: 'B', v2: 'A1' },
        { id: 'e_B2', v1: 'B', v2: 'A2' },
        { id: 'e_B3', v1: 'B', v2: 'A3' },
        { id: 'e_B4', v1: 'B', v2: 'A4' },
      ];

      const faces = [
        { id: 'f_T12', vertexIds: ['T', 'A1', 'A2'], color: '#8b5cf6' },
        { id: 'f_T23', vertexIds: ['T', 'A2', 'A3'], color: '#a78bfa' },
        { id: 'f_T34', vertexIds: ['T', 'A3', 'A4'], color: '#c4b5fd' },
        { id: 'f_T41', vertexIds: ['T', 'A4', 'A1'], color: '#8b5cf6' },
        { id: 'f_B21', vertexIds: ['B', 'A2', 'A1'], color: '#7c3aed' },
        { id: 'f_B32', vertexIds: ['B', 'A3', 'A2'], color: '#6d28d9' },
        { id: 'f_B43', vertexIds: ['B', 'A4', 'A3'], color: '#5b21b6' },
        { id: 'f_B14', vertexIds: ['B', 'A1', 'A4'], color: '#7c3aed' },
      ];

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const a = params.a ?? 3;
      const S_tp = 2 * Math.sqrt(3) * a * a;
      const V = (Math.sqrt(2) / 3) * a * a * a;

      return [
        {
          name: 'Diện tích toàn phần (8 mặt)',
          latexSymbol: 'S_{tp}',
          latexFormula: 'S_{tp} = 8 \\times \\frac{a^2\\sqrt{3}}{4} = 2a^2\\sqrt{3}',
          substitution: `2 \\times ${a}^2\\sqrt{3} \\approx ${S_tp.toFixed(2)}`,
          result: Number(S_tp.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Tổng diện tích của 8 tam giác đều bằng nhau',
        },
        {
          name: 'Thể tích bát diện đều',
          latexSymbol: 'V',
          latexFormula: 'V = \\frac{\\sqrt{2}}{3} a^3',
          substitution: `\\frac{\\sqrt{2}}{3} \\times ${a}^3 \\approx ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Ghép từ hai hình chóp tứ giác đều đối xứng nhau qua mặt phẳng hình vuông',
        },
      ];
    },
  },

  // 22. Hình tròn xoay (Hình xuyến / Torus)
  {
    id: 'torus',
    name: 'Hình tròn xoay (Hình xuyến - Torus)',
    category: 'spatial',
    categoryName: 'Hình học không gian',
    gradeLevel: 'THPT',
    description: 'Hình tròn xoay sinh ra khi quay một hình tròn bán kính r quanh một trục nằm trong cùng mặt phẳng nhưng không cắt hình tròn (bán kính vòng R).',
    tags: ['Hình tròn xoay', 'Torus'],
    params: [
      { id: 'R', label: 'Bán kính vòng lớn (R)', min: 1.5, max: 4, step: 0.25, default: 2.6, unit: 'cm' },
      { id: 'r', label: 'Bán kính ống nhỏ (r)', min: 0.3, max: 1.5, step: 0.1, default: 0.8, unit: 'cm' },
    ],
    defaultParams: { R: 2.6, r: 0.8 },
    educationalNotes: [
      'Định lý Guldin - Pappus: Diện tích mặt tròn xoay bằng tích của chu vi đường sinh (2πr) với quãng đường đi của trọng tâm (2πR): S = 4π²Rr.',
      'Thể tích hình xuyến bằng diện tích hình tròn sinh (πr²) nhân quãng đường trọng tâm: V = 2π²Rr².',
      'Mô hình kinh điển trong topo học và vật lý hạt nhân (buồng Tokamak tạo từ trường giam giữ plasma).',
    ],
    generateGeometry: (params) => {
      const R = params.R ?? 2.6;
      const r = params.r ?? 0.8;
      const majorSeg = 24;
      const minorSeg = 12;

      const vertices: any[] = [];
      const edges: any[] = [];
      const faces: any[] = [];

      for (let i = 0; i < majorSeg; i++) {
        const u = (i * 2 * Math.PI) / majorSeg;
        for (let j = 0; j < minorSeg; j++) {
          const v = (j * 2 * Math.PI) / minorSeg;
          const x = (R + r * Math.cos(v)) * Math.cos(u);
          const y = r * Math.sin(v);
          const z = (R + r * Math.cos(v)) * Math.sin(u);
          vertices.push({ id: `t_${i}_${j}`, name: '', pos: [x, y, z] });
        }
      }

      // Axis center marker
      vertices.push({ id: 'O', name: 'O (trục xoay)', pos: [0, 0, 0], color: '#ef4444' });

      // Edges along major and minor circles
      for (let i = 0; i < majorSeg; i++) {
        const nextI = (i + 1) % majorSeg;
        for (let j = 0; j < minorSeg; j++) {
          const nextJ = (j + 1) % minorSeg;
          if (j % 3 === 0) {
            edges.push({ id: `e_maj_${i}_${j}`, v1: `t_${i}_${j}`, v2: `t_${nextI}_${j}`, color: '#06b6d4' });
          }
          if (i % 6 === 0) {
            edges.push({ id: `e_min_${i}_${j}`, v1: `t_${i}_${j}`, v2: `t_${i}_${nextJ}`, color: '#06b6d4' });
          }
          faces.push({
            id: `f_${i}_${j}`,
            vertexIds: [`t_${i}_${j}`, `t_${nextI}_${j}`, `t_${nextI}_${nextJ}`, `t_${i}_${nextJ}`],
            name: 'Mặt xuyến',
            color: '#0891b2',
            opacity: 0.8,
          });
        }
      }

      return { vertices, edges, faces };
    },
    calculateFormulas: (params, unit) => {
      const R = params.R ?? 2.6;
      const r = params.r ?? 0.8;
      const S = 4 * Math.PI * Math.PI * R * r;
      const V = 2 * Math.PI * Math.PI * R * r * r;

      return [
        {
          name: 'Diện tích bề mặt (Định lý Pappus)',
          latexSymbol: 'S',
          latexFormula: 'S = (2\\pi r)(2\\pi R) = 4\\pi^2 R r',
          substitution: `4\\pi^2 \\times ${R} \\times ${r} \\approx ${S.toFixed(2)}`,
          result: Number(S.toFixed(2)),
          unit: `${unit}²`,
          explanation: 'Chu vi đường tròn sinh nhân quãng đường di chuyển của tâm',
        },
        {
          name: 'Thể tích hình xuyến',
          latexSymbol: 'V',
          latexFormula: 'V = (\\pi r^2)(2\\pi R) = 2\\pi^2 R r^2',
          substitution: `2\\pi^2 \\times ${R} \\times ${r}^2 \\approx ${V.toFixed(2)}`,
          result: Number(V.toFixed(2)),
          unit: `${unit}³`,
          explanation: 'Diện tích hình tròn thiết diện nhân chu vi quỹ đạo tâm',
        },
      ];
    },
  },
];
