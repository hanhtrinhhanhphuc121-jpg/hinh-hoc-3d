export interface ProofStep {
  stepNumber: number;
  title: string;
  explanation: string;
  mathExpression?: string; // KaTeX expression
  highlightElements: {
    vertices?: string[];
    edges?: string[];
    faces?: string[];
    auxiliaryLines?: {
      from: [number, number, number];
      to: [number, number, number];
      color: string;
      dashed?: boolean;
      label?: string;
    }[];
    rightAngles?: {
      pos: [number, number, number];
      dir1: [number, number, number];
      dir2: [number, number, number];
    }[];
  };
  cameraTarget?: [number, number, number];
  cameraPosition?: [number, number, number];
}

export interface GeometricProofScenario {
  id: string;
  title: string;
  grade: '11' | '12';
  category: 'Vuông góc' | 'Góc' | 'Khoảng cách' | 'Thiết diện';
  baseModelId: string;
  description: string;
  givenText: string;
  toProveText: string;
  steps: ProofStep[];
}

export const geometricProofScenarios: GeometricProofScenario[] = [
  {
    id: 'perp-line-to-plane-sa-abcd',
    title: 'Chứng minh đường thẳng vuông góc với mặt phẳng: BC ⊥ (SAB)',
    grade: '11',
    category: 'Vuông góc',
    baseModelId: 'pyramid_sa_perp_base',
    description: 'Cho hình chóp S.ABCD có đáy ABCD là hình chữ nhật, cạnh bên SA ⊥ (ABCD). Chứng minh BC ⊥ (SAB).',
    givenText: 'Cho hình chóp S.ABCD, đáy ABCD là hình chữ nhật, SA ⊥ (ABCD).',
    toProveText: 'Chứng minh rằng BC ⊥ (SAB).',
    steps: [
      {
        stepNumber: 1,
        title: 'Nhận diện quan hệ vuông góc ở đáy',
        explanation: 'Vì đáy ABCD là hình chữ nhật, ta có góc ∠ABC = 90°, do đó cạnh BC vuông góc với cạnh AB.',
        mathExpression: 'BC \\perp AB \\quad (1)',
        highlightElements: {
          vertices: ['A', 'B', 'C'],
          edges: ['A-B', 'B-C'],
          rightAngles: [
            { pos: [1.2, -1, 1], dir1: [-1, 0, 0], dir2: [0, 0, -1] }
          ]
        },
        cameraPosition: [3, 2, 4],
      },
      {
        stepNumber: 2,
        title: 'Sử dụng giả thiết SA vuông góc với mặt phẳng đáy',
        explanation: 'Do cạnh bên SA vuông góc với toàn bộ mặt phẳng đáy (ABCD), mà đường thẳng BC nằm trọn vẹn trong mặt phẳng đáy (ABCD), nên SA vuông góc với BC.',
        mathExpression: 'SA \\perp (ABCD), \\ BC \\subset (ABCD) \\implies BC \\perp SA \\quad (2)',
        highlightElements: {
          vertices: ['S', 'A', 'B', 'C'],
          edges: ['S-A', 'B-C'],
          rightAngles: [
            { pos: [-1.2, -1, 1], dir1: [1, 0, 0], dir2: [0, 1, 0] }
          ]
        },
        cameraPosition: [3.5, 1.8, 3.5],
      },
      {
        stepNumber: 3,
        title: 'Kết luận đường thẳng vuông góc với mặt phẳng',
        explanation: 'Từ (1) và (2), đường thẳng BC vuông góc với hai đường thẳng cắt nhau AB và SA cùng nằm trong mặt phẳng (SAB). Suy ra BC ⊥ (SAB). Hệ quả: tam giác SBC vuông tại B!',
        mathExpression: '\\begin{cases} BC \\perp AB \\\\ BC \\perp SA \\\\ AB \\cap SA = A \\subset (SAB) \\end{cases} \\implies BC \\perp (SAB) \\implies BC \\perp SB',
        highlightElements: {
          vertices: ['S', 'A', 'B', 'C'],
          edges: ['S-A', 'A-B', 'S-B', 'B-C'],
          faces: ['S-A-B'],
          rightAngles: [
            { pos: [1.2, -1, 1], dir1: [-1, 0, 0], dir2: [0, 0, -1] },
            { pos: [1.2, -1, 1], dir1: [-0.6, 0.8, 0], dir2: [0, 0, -1] }
          ]
        },
        cameraPosition: [2.5, 1.5, 3],
      }
    ]
  },
  {
    id: 'angle-line-plane-sc-abcd',
    title: 'Xác định và tính góc giữa đường thẳng SC và mặt phẳng đáy (ABCD)',
    grade: '11',
    category: 'Góc',
    baseModelId: 'pyramid_sa_perp_base',
    description: 'Tìm góc giữa đường thẳng SC và mặt phẳng (ABCD) trong hình chóp có SA vuông góc đáy.',
    givenText: 'Hình chóp S.ABCD có đáy là hình vuông cạnh a, SA ⊥ (ABCD), SA = a√2.',
    toProveText: 'Xác định góc giữa SC và (ABCD) và tính số đo của góc đó.',
    steps: [
      {
        stepNumber: 1,
        title: 'Tìm hình chiếu vuông góc của đường thẳng SC lên mặt đáy',
        explanation: 'Điểm C thuộc mặt phẳng (ABCD) nên hình chiếu của C chính là C. Vì SA ⊥ (ABCD) nên hình chiếu vuông góc của đỉnh S lên (ABCD) chính là điểm A.',
        mathExpression: 'SA \\perp (ABCD) \\implies A \\text{ là hình chiếu của } S \\text{ lên } (ABCD)',
        highlightElements: {
          vertices: ['S', 'A', 'C'],
          edges: ['S-A', 'S-C'],
          auxiliaryLines: [
            { from: [-1.2, -1, 1], to: [1.2, -1, -1], color: '#f59e0b', dashed: true, label: 'AC' }
          ]
        },
        cameraPosition: [3.5, 2.5, 4],
      },
      {
        stepNumber: 2,
        title: 'Xác định góc giữa đường thẳng và hình chiếu',
        explanation: 'Hình chiếu vuông góc của đoạn SC lên mặt phẳng (ABCD) là đoạn thẳng AC. Do đó, góc giữa đường thẳng SC và mặt phẳng (ABCD) chính là góc giữa SC và AC, tức là góc ∠SCA.',
        mathExpression: '\\widehat{(SC, (ABCD))} = \\widehat{(SC, AC)} = \\widehat{SCA}',
        highlightElements: {
          vertices: ['S', 'A', 'C'],
          edges: ['S-A', 'S-C'],
          auxiliaryLines: [
            { from: [-1.2, -1, 1], to: [1.2, -1, -1], color: '#10b981', dashed: false, label: 'AC' }
          ],
          rightAngles: [
            { pos: [-1.2, -1, 1], dir1: [0.707, 0, -0.707], dir2: [0, 1, 0] }
          ]
        },
        cameraPosition: [2, 1.8, 3.5],
      },
      {
        stepNumber: 3,
        title: 'Tính toán góc lượng giác trong tam giác vuông SAC',
        explanation: 'Tam giác SAC vuông tại A. Đáy là hình vuông cạnh a nên AC = a√2. Ta có SA = a√2. Do đó tan(∠SCA) = SA / AC = a√2 / a√2 = 1. Suy ra ∠SCA = 45°!',
        mathExpression: '\\tan \\widehat{SCA} = \\frac{SA}{AC} = \\frac{a\\sqrt{2}}{a\\sqrt{2}} = 1 \\implies \\widehat{SCA} = 45^\\circ',
        highlightElements: {
          vertices: ['S', 'A', 'C'],
          edges: ['S-A', 'S-C'],
          faces: ['S-A-C'],
          auxiliaryLines: [
            { from: [-1.2, -1, 1], to: [1.2, -1, -1], color: '#10b981', dashed: false }
          ]
        },
        cameraPosition: [1.5, 1.2, 3],
      }
    ]
  },
  {
    id: 'distance-point-to-plane-a-sbc',
    title: 'Dựng và tính khoảng cách từ điểm A đến mặt phẳng (SBC)',
    grade: '11',
    category: 'Khoảng cách',
    baseModelId: 'pyramid_sa_perp_base',
    description: 'Phương pháp dựng đoạn vuông góc kẻ từ chân đường cao A đến mặt phẳng bên (SBC).',
    givenText: 'Hình chóp S.ABCD có SA ⊥ (ABCD), AB = a, SA = a√3, đáy ABCD là hình chữ nhật.',
    toProveText: 'Dựng đoạn vuông góc AH ⊥ (SBC) và tính d(A, (SBC)).',
    steps: [
      {
        stepNumber: 1,
        title: 'Kẻ đường thẳng AH vuông góc với giao tuyến SB',
        explanation: 'Trong tam giác vuông SAB, từ đỉnh A ta kẻ đường cao AH vuông góc với cạnh huyền SB (H nằm trên SB).',
        mathExpression: '\\text{Kẻ } AH \\perp SB \\quad (H \\in SB) \\quad (1)',
        highlightElements: {
          vertices: ['S', 'A', 'B'],
          edges: ['S-A', 'A-B', 'S-B'],
          auxiliaryLines: [
            { from: [-1.2, -1, 1], to: [0.6, 0.2, 1], color: '#ec4899', dashed: false, label: 'AH' }
          ]
        },
        cameraPosition: [3, 1.5, 3.5],
      },
      {
        stepNumber: 2,
        title: 'Chứng minh AH vuông góc với toàn bộ mặt phẳng (SBC)',
        explanation: 'Vì BC ⊥ (SAB) (đã chứng minh ở bài trước), mà AH nằm trong mặt phẳng (SAB) nên BC ⊥ AH. Như vậy AH vừa vuông góc với SB, vừa vuông góc với BC. Suy ra AH ⊥ (SBC)!',
        mathExpression: '\\begin{cases} AH \\perp SB \\\\ AH \\perp BC \\text{ (do } BC \\perp (SAB)) \\end{cases} \\implies AH \\perp (SBC)',
        highlightElements: {
          vertices: ['S', 'A', 'B', 'C'],
          edges: ['S-B', 'B-C'],
          faces: ['S-B-C'],
          auxiliaryLines: [
            { from: [-1.2, -1, 1], to: [0.6, 0.2, 1], color: '#ec4899', dashed: false, label: 'AH ⊥ (SBC)' }
          ],
          rightAngles: [
            { pos: [0.6, 0.2, 1], dir1: [-0.6, -0.8, 0], dir2: [0, 0, -1] }
          ]
        },
        cameraPosition: [2.5, 1.8, 2.8],
      },
      {
        stepNumber: 3,
        title: 'Áp dụng hệ thức lượng tính độ dài AH',
        explanation: 'Đoạn AH chính là khoảng cách từ điểm A đến mặt phẳng (SBC). Trong tam giác vuông SAB tại A có đường cao AH: 1/AH² = 1/SA² + 1/AB² = 1/(3a²) + 1/a² = 4/(3a²). Do đó AH = a√3 / 2.',
        mathExpression: 'd(A, (SBC)) = AH = \\frac{SA \\cdot AB}{\\sqrt{SA^2 + AB^2}} = \\frac{a\\sqrt{3} \\cdot a}{\\sqrt{3a^2 + a^2}} = \\frac{a\\sqrt{3}}{2}',
        highlightElements: {
          vertices: ['S', 'A', 'B'],
          edges: ['S-A', 'A-B', 'S-B'],
          auxiliaryLines: [
            { from: [-1.2, -1, 1], to: [0.6, 0.2, 1], color: '#ec4899', dashed: false, label: 'd = a√3/2' }
          ]
        },
        cameraPosition: [2, 1.5, 3],
      }
    ]
  },
  {
    id: 'dihedral-angle-s-bc-a',
    title: 'Xác định góc nhị diện (Góc giữa hai mặt phẳng (SBC) và (ABCD))',
    grade: '11',
    category: 'Góc',
    baseModelId: 'pyramid_sa_perp_base',
    description: 'Xác định góc phẳng nhị diện giữa mặt bên (SBC) và mặt phẳng đáy (ABCD).',
    givenText: 'Cho hình chóp S.ABCD, SA ⊥ (ABCD), đáy ABCD là hình chữ nhật.',
    toProveText: 'Xác định góc giữa (SBC) và (ABCD).',
    steps: [
      {
        stepNumber: 1,
        title: 'Tìm giao tuyến của hai mặt phẳng',
        explanation: 'Mặt phẳng (SBC) và mặt phẳng (ABCD) có hai điểm chung là B và C, do đó giao tuyến là đoạn thẳng BC.',
        mathExpression: '(SBC) \\cap (ABCD) = BC',
        highlightElements: {
          vertices: ['B', 'C'],
          edges: ['B-C'],
        },
        cameraPosition: [3.5, 2, 3.5],
      },
      {
        stepNumber: 2,
        title: 'Tìm hai đường thẳng lần lượt nằm trong hai mặt phẳng và cùng vuông góc với giao tuyến tại điểm B',
        explanation: 'Trong đáy (ABCD), ta có AB ⊥ BC tại B. Trong mặt phẳng (SBC), ta có SB ⊥ BC tại B (định lý ba đường vuông góc).',
        mathExpression: '\\begin{cases} AB \\subset (ABCD), \\ AB \\perp BC \\\\ SB \\subset (SBC), \\ SB \\perp BC \\end{cases}',
        highlightElements: {
          vertices: ['S', 'A', 'B', 'C'],
          edges: ['A-B', 'S-B', 'B-C'],
          rightAngles: [
            { pos: [1.2, -1, 1], dir1: [-1, 0, 0], dir2: [0, 0, -1] },
            { pos: [1.2, -1, 1], dir1: [-0.6, 0.8, 0], dir2: [0, 0, -1] }
          ]
        },
        cameraPosition: [2.5, 1.5, 2.5],
      },
      {
        stepNumber: 3,
        title: 'Kết luận góc phẳng nhị diện',
        explanation: 'Góc giữa hai mặt phẳng (SBC) và (ABCD) chính là góc giữa hai tia BA và BS, tức là góc ∠SBA.',
        mathExpression: '\\widehat{((SBC), (ABCD))} = \\widehat{(SB, AB)} = \\widehat{SBA}',
        highlightElements: {
          vertices: ['S', 'A', 'B'],
          edges: ['S-A', 'A-B', 'S-B'],
          faces: ['S-A-B']
        },
        cameraPosition: [2.5, 1.2, 3],
      }
    ]
  }
];
