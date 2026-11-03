/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GeometricConstraintSpec,
  SolvedGeometricLesson,
  SolvedStep,
} from '../types/lessonDesigner';

/**
 * Predefined exemplar lessons including the user's requested problem:
 * "Cho hình chóp S.ABCD có đáy ABCD là hình vuông cạnh a, SA vuông góc với mặt phẳng (ABCD), SA = 2a..."
 */
export const PRESET_GEOMETRIC_LESSONS: SolvedGeometricLesson[] = [
  {
    id: 'lesson-chop-s-abcd-sa-vuong-goc-day',
    title: 'Góc giữa đường thẳng và mặt phẳng: Hình chóp S.ABCD (SA ⊥ đáy)',
    promptText:
      'Cho hình chóp S.ABCD có đáy ABCD là hình vuông cạnh a, SA vuông góc với mặt phẳng (ABCD), SA = 2a. Hãy dựng mô hình, xác định góc giữa SC và mặt phẳng đáy, sau đó hướng dẫn học sinh tính góc này.',
    spec: {
      polyhedronType: 'pyramid_quad',
      baseType: 'square',
      baseParams: { a: 2 },
      heightParams: {
        vertexApex: 'S',
        footOfAltitude: 'A',
        heightValue: 4,
        heightExpression: '2a',
      },
      targetTask: {
        type: 'angle_line_plane',
        lineName: 'SC',
        planeName: '(ABCD)',
        targetAngleName: '\\widehat{SCA}',
      },
    },
    vertices3D: [
      { id: 'A', name: 'A', pos: [-1.2, -1.2, 1.2] },
      { id: 'B', name: 'B', pos: [1.2, -1.2, 1.2] },
      { id: 'C', name: 'C', pos: [1.2, -1.2, -1.2] },
      { id: 'D', name: 'D', pos: [-1.2, -1.2, -1.2] },
      { id: 'S', name: 'S', pos: [-1.2, 2.8, 1.2] },
    ],
    edges3D: [
      { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
      { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
      { id: 'e_CD', v1: 'C', v2: 'D', name: 'CD' },
      { id: 'e_DA', v1: 'D', v2: 'A', name: 'DA' },
      { id: 'e_SA', v1: 'S', v2: 'A', name: 'SA', isHeight: true },
      { id: 'e_SB', v1: 'S', v2: 'B', name: 'SB' },
      { id: 'e_SC', v1: 'S', v2: 'C', name: 'SC' },
      { id: 'e_SD', v1: 'S', v2: 'D', name: 'SD' },
    ],
    faces3D: [
      { id: 'f_ABCD', vertexIds: ['A', 'B', 'C', 'D'], name: 'Đáy (ABCD)', color: '#38bdf8' },
      { id: 'f_SAB', vertexIds: ['S', 'A', 'B'], name: 'Mặt bên (SAB)', color: '#818cf8' },
      { id: 'f_SBC', vertexIds: ['S', 'B', 'C'], name: 'Mặt bên (SBC)', color: '#a78bfa' },
      { id: 'f_SCD', vertexIds: ['S', 'C', 'D'], name: 'Mặt bên (SCD)', color: '#c084fc' },
      { id: 'f_SDA', vertexIds: ['S', 'D', 'A'], name: 'Mặt bên (SDA)', color: '#60a5fa' },
    ],
    finalResultKaTeX: '\\tan\\widehat{SCA} = \\sqrt{2} \\implies \\widehat{SCA} \\approx 54^{\\circ}44\'',
    createdDate: '2025-05-10',
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Phân tích giả thiết và dựng mô hình 3D chuẩn xác',
        instruction:
          'Quan sát hình chóp S.ABCD: Đáy ABCD là hình vuông cạnh a. Cạnh bên SA ⊥ (ABCD) nên SA vuông góc với mọi đường thẳng trong đáy, đặc biệt SA ⊥ AB, SA ⊥ AD, SA ⊥ AC.',
        highlightVertices: ['S', 'A'],
        highlightEdges: ['e_SA', 'e_AB', 'e_DA'],
        auxiliaryEdges: [],
        rightAngleMarkers: [
          { vertex: [-1.2, -1.2, 1.2], dir1: [0, 0.4, 0], dir2: [0.4, 0, 0] },
          { vertex: [-1.2, -1.2, 1.2], dir1: [0, 0.4, 0], dir2: [0, 0, -0.4] },
          { vertex: [-1.2, -1.2, 1.2], dir1: [0.4, 0, 0], dir2: [0, 0, -0.4] },
        ],
        katexMath: 'SA \\perp (ABCD) \\implies SA \\perp d, \\quad \\forall d \\subset (ABCD)',
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Tìm hình chiếu vuông góc của SC lên mặt phẳng đáy',
        instruction:
          'Để tìm góc giữa đường thẳng SC và mặt đáy (ABCD), ta cần tìm hình chiếu vuông góc của SC lên (ABCD):\n• Vì SA ⊥ (ABCD) tại A, nên hình chiếu của đỉnh S lên (ABCD) chính là điểm A.\n• Điểm C thuộc mặt đáy (ABCD) nên hình chiếu của C chính là chính nó (C).\nDo đó, hình chiếu vuông góc của đoạn SC lên mặt phẳng (ABCD) là đoạn thẳng AC.',
        highlightVertices: ['S', 'A', 'C'],
        highlightEdges: ['e_SA', 'e_SC'],
        auxiliaryEdges: [
          {
            from: [-1.2, -1.2, 1.2],
            to: [1.2, -1.2, -1.2],
            label: 'Hình chiếu AC = a√2',
            color: '#f59e0b',
            dashed: true,
          },
        ],
        katexMath: 'Pr_{(ABCD)}(S) = A, \\quad Pr_{(ABCD)}(C) = C \\implies Pr_{(ABCD)}(SC) = AC',
      },
      {
        stepIndex: 3,
        title: 'Bước 3: Xác định góc giữa đường thẳng và mặt phẳng',
        instruction:
          'Theo định nghĩa: Góc giữa đường thẳng và mặt phẳng là góc giữa đường thẳng đó và hình chiếu vuông góc của nó lên mặt phẳng.\nVậy: (SC, (ABCD)) = (SC, AC) = \\widehat{SCA}.\nVì SA ⊥ (ABCD) nên SA ⊥ AC, tam giác SAC vuông tại A. Do đó góc \\widehat{SCA} luôn là góc nhọn.',
        highlightVertices: ['S', 'A', 'C'],
        highlightEdges: ['e_SA', 'e_SC'],
        auxiliaryEdges: [
          {
            from: [-1.2, -1.2, 1.2],
            to: [1.2, -1.2, -1.2],
            label: 'AC',
            color: '#f59e0b',
            dashed: true,
          },
        ],
        highlightFaceTriangles: [
          [
            [-1.2, 2.8, 1.2],
            [-1.2, -1.2, 1.2],
            [1.2, -1.2, -1.2],
          ],
        ],
        rightAngleMarkers: [
          { vertex: [-1.2, -1.2, 1.2], dir1: [0, 0.4, 0], dir2: [0.28, 0, -0.28] },
        ],
        katexMath: '\\widehat{(SC, (ABCD))} = \\widehat{(SC, AC)} = \\widehat{SCA}',
      },
      {
        stepIndex: 4,
        title: 'Bước 4: Học sinh tương tác dự đoán và thiết lập công thức',
        instruction:
          'Em hãy quan sát tam giác vuông phụ trợ SAC (vuông tại A) và dự đoán tỷ số lượng giác tan của góc \\widehat{SCA}!',
        highlightVertices: ['S', 'A', 'C'],
        highlightEdges: ['e_SA', 'e_SC'],
        auxiliaryEdges: [
          {
            from: [-1.2, -1.2, 1.2],
            to: [1.2, -1.2, -1.2],
            label: 'AC = a√2',
            color: '#f59e0b',
            dashed: true,
          },
        ],
        highlightFaceTriangles: [
          [
            [-1.2, 2.8, 1.2],
            [-1.2, -1.2, 1.2],
            [1.2, -1.2, -1.2],
          ],
        ],
        katexMath: '\\tan\\widehat{SCA} = \\frac{\\text{Đối}}{\\text{Kề}} = \\frac{SA}{AC} = \\, ?',
        studentInteractivePrompt: {
          question:
            'Biết ABCD là hình vuông cạnh a và SA = 2a, giá trị của tan(SCA) bằng bao nhiêu?',
          options: [
            'tan(SCA) = 1 / √2',
            'tan(SCA) = √2',
            'tan(SCA) = 2',
            'tan(SCA) = √3 / 2',
          ],
          correctIndex: 1,
          explanation:
            'Chính xác! Đáy hình vuông cạnh a có đường chéo AC = a√2. Trong tam giác SAC vuông tại A: tan(SCA) = SA / AC = 2a / (a√2) = √2.',
        },
      },
      {
        stepIndex: 5,
        title: 'Bước 5: Lời giải toán học chuẩn mực và kết luận sư phạm',
        instruction:
          '1. Tính độ dài đường chéo AC của đáy:\nTam giác ABC vuông tại B: AC = √(AB² + BC²) = √(a² + a²) = a√2.\n2. Xét tam giác SAC vuông tại A (do SA ⊥ (ABCD) ⇒ SA ⊥ AC):\n\\tan\\widehat{SCA} = \\frac{SA}{AC} = \\frac{2a}{a\\sqrt{2}} = \\sqrt{2}.\n3. Kết luận: \\widehat{SCA} = \\arctan(\\sqrt{2}) \\approx 54^{\\circ}44\' (khoảng 54.74°).',
        highlightVertices: ['S', 'A', 'C'],
        highlightEdges: ['e_SA', 'e_SC'],
        auxiliaryEdges: [
          {
            from: [-1.2, -1.2, 1.2],
            to: [1.2, -1.2, -1.2],
            label: 'AC = a√2',
            color: '#10b981',
            dashed: true,
          },
        ],
        highlightFaceTriangles: [
          [
            [-1.2, 2.8, 1.2],
            [-1.2, -1.2, 1.2],
            [1.2, -1.2, -1.2],
          ],
        ],
        rightAngleMarkers: [
          { vertex: [-1.2, -1.2, 1.2], dir1: [0, 0.4, 0], dir2: [0.28, 0, -0.28] },
        ],
        katexMath:
          'AC = a\\sqrt{2} \\implies \\tan\\widehat{SCA} = \\frac{SA}{AC} = \\frac{2a}{a\\sqrt{2}} = \\sqrt{2} \\implies \\widehat{SCA} \\approx 54.74^{\\circ}',
      },
    ],
  },
  {
    id: 'lesson-chop-s-abc-sa-vuong-goc-day',
    title: 'Góc giữa cạnh bên và mặt đáy: Hình chóp tam giác S.ABC',
    promptText:
      'Cho hình chóp S.ABC có đáy ABC là tam giác đều cạnh a, SA vuông góc với đáy (ABC), SA = a√3. Xác định và tính số đo góc giữa cạnh bên SB và mặt phẳng đáy (ABC).',
    spec: {
      polyhedronType: 'pyramid_tri',
      baseType: 'regular_triangle',
      baseParams: { a: 2 },
      heightParams: {
        vertexApex: 'S',
        footOfAltitude: 'A',
        heightValue: 2 * Math.sqrt(3),
        heightExpression: 'a\\sqrt{3}',
      },
      targetTask: {
        type: 'angle_line_plane',
        lineName: 'SB',
        planeName: '(ABC)',
        targetAngleName: '\\widehat{SBA}',
      },
    },
    vertices3D: [
      { id: 'A', name: 'A', pos: [-1.2, -1.0, 1.0] },
      { id: 'B', name: 'B', pos: [1.2, -1.0, 1.0] },
      { id: 'C', name: 'C', pos: [0.0, -1.0, -1.0] },
      { id: 'S', name: 'S', pos: [-1.2, 2.5, 1.0] },
    ],
    edges3D: [
      { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
      { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
      { id: 'e_CA', v1: 'C', v2: 'A', name: 'CA' },
      { id: 'e_SA', v1: 'S', v2: 'A', name: 'SA', isHeight: true },
      { id: 'e_SB', v1: 'S', v2: 'B', name: 'SB' },
      { id: 'e_SC', v1: 'S', v2: 'C', name: 'SC' },
    ],
    faces3D: [
      { id: 'f_ABC', vertexIds: ['A', 'B', 'C'], name: 'Đáy (ABC)', color: '#38bdf8' },
      { id: 'f_SAB', vertexIds: ['S', 'A', 'B'], name: 'Mặt bên (SAB)', color: '#818cf8' },
      { id: 'f_SBC', vertexIds: ['S', 'B', 'C'], name: 'Mặt bên (SBC)', color: '#a78bfa' },
      { id: 'f_SCA', vertexIds: ['S', 'C', 'A'], name: 'Mặt bên (SCA)', color: '#60a5fa' },
    ],
    finalResultKaTeX: '\\tan\\widehat{SBA} = \\sqrt{3} \\implies \\widehat{SBA} = 60^{\\circ}',
    createdDate: '2025-05-10',
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Phân tích giả thiết hình học',
        instruction:
          'Đáy ABC là tam giác đều cạnh a. Đường cao SA ⊥ (ABC) nên SA ⊥ AB và SA ⊥ AC. Độ dài SA = a√3.',
        highlightVertices: ['S', 'A'],
        highlightEdges: ['e_SA', 'e_AB'],
        auxiliaryEdges: [],
        rightAngleMarkers: [
          { vertex: [-1.2, -1.0, 1.0], dir1: [0, 0.4, 0], dir2: [0.4, 0, 0] },
        ],
        katexMath: 'SA \\perp (ABC) \\implies SA \\perp AB',
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Tìm hình chiếu vuông góc của SB lên đáy (ABC)',
        instruction:
          'S có hình chiếu là A (vì SA ⊥ (ABC)). B thuộc (ABC) nên hình chiếu của B là chính B.\nVậy hình chiếu vuông góc của SB lên (ABC) là đoạn AB.',
        highlightVertices: ['S', 'A', 'B'],
        highlightEdges: ['e_SA', 'e_SB', 'e_AB'],
        auxiliaryEdges: [],
        katexMath: 'Pr_{(ABC)}(SB) = AB',
      },
      {
        stepIndex: 3,
        title: 'Bước 3: Xác định góc giữa SB và mặt phẳng đáy',
        instruction:
          'Góc giữa SB và mặt phẳng (ABC) chính là góc giữa SB và hình chiếu AB, tức là góc \\widehat{SBA}.',
        highlightVertices: ['S', 'A', 'B'],
        highlightEdges: ['e_SB', 'e_AB'],
        auxiliaryEdges: [],
        highlightFaceTriangles: [
          [
            [-1.2, 2.5, 1.0],
            [-1.2, -1.0, 1.0],
            [1.2, -1.0, 1.0],
          ],
        ],
        katexMath: '\\widehat{(SB, (ABC))} = \\widehat{(SB, AB)} = \\widehat{SBA}',
      },
      {
        stepIndex: 4,
        title: 'Bước 4: Học sinh thực hành tính toán',
        instruction:
          'Trong tam giác vuông SAB vuông tại A, hãy tính tan của góc \\widehat{SBA} và suy ra số đo góc!',
        highlightVertices: ['S', 'A', 'B'],
        highlightEdges: ['e_SA', 'e_AB', 'e_SB'],
        auxiliaryEdges: [],
        katexMath: '\\tan\\widehat{SBA} = \\frac{SA}{AB} = \\frac{a\\sqrt{3}}{a} = \\, ?',
        studentInteractivePrompt: {
          question: 'Giá trị tan(SBA) = √3, vậy góc SBA có số đo bằng bao nhiêu độ?',
          options: ['30°', '45°', '60°', '90°'],
          correctIndex: 2,
          explanation: 'Chính xác! tan(60°) = √3, nên góc SBA = 60°.',
        },
      },
      {
        stepIndex: 5,
        title: 'Bước 5: Kết luận lời giải',
        instruction:
          'Ta có: \\tan\\widehat{SBA} = \\frac{SA}{AB} = \\frac{a\\sqrt{3}}{a} = \\sqrt{3} \\implies \\widehat{SBA} = 60^{\\circ}.',
        highlightVertices: ['S', 'A', 'B'],
        highlightEdges: ['e_SA', 'e_AB', 'e_SB'],
        auxiliaryEdges: [],
        highlightFaceTriangles: [
          [
            [-1.2, 2.5, 1.0],
            [-1.2, -1.0, 1.0],
            [1.2, -1.0, 1.0],
          ],
        ],
        rightAngleMarkers: [
          { vertex: [-1.2, -1.0, 1.0], dir1: [0, 0.4, 0], dir2: [0.4, 0, 0] },
        ],
        katexMath: '\\widehat{SBA} = 60^{\\circ}',
      },
    ],
  },
  {
    id: 'lesson-chop-s-abcd-hinh-chu-nhat',
    title: 'Góc giữa SD và mặt đáy: Hình chóp S.ABCD đáy chữ nhật',
    promptText:
      'Cho hình chóp S.ABCD có đáy ABCD là hình chữ nhật với AB = a, AD = 2a. Cạnh bên SA ⊥ (ABCD) và SA = a√2. Xác định và tính góc giữa đường thẳng SD và mặt đáy (ABCD).',
    spec: {
      polyhedronType: 'pyramid_quad',
      baseType: 'rectangle',
      baseParams: { a: 1.5, b: 3.0 },
      heightParams: {
        vertexApex: 'S',
        footOfAltitude: 'A',
        heightValue: 1.5 * Math.SQRT2,
        heightExpression: 'a\\sqrt{2}',
      },
      targetTask: {
        type: 'angle_line_plane',
        lineName: 'SD',
        planeName: '(ABCD)',
        targetAngleName: '\\widehat{SDA}',
      },
    },
    vertices3D: [
      { id: 'A', name: 'A', pos: [-1.5, -1.0, 1.0] },
      { id: 'B', name: 'B', pos: [1.5, -1.0, 1.0] },
      { id: 'C', name: 'C', pos: [1.5, -1.0, -1.5] },
      { id: 'D', name: 'D', pos: [-1.5, -1.0, -1.5] },
      { id: 'S', name: 'S', pos: [-1.5, 2.2, 1.0] },
    ],
    edges3D: [
      { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
      { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
      { id: 'e_CD', v1: 'C', v2: 'D', name: 'CD' },
      { id: 'e_DA', v1: 'D', v2: 'A', name: 'DA' },
      { id: 'e_SA', v1: 'S', v2: 'A', name: 'SA', isHeight: true },
      { id: 'e_SB', v1: 'S', v2: 'B', name: 'SB' },
      { id: 'e_SC', v1: 'S', v2: 'C', name: 'SC' },
      { id: 'e_SD', v1: 'S', v2: 'D', name: 'SD' },
    ],
    faces3D: [
      { id: 'f_ABCD', vertexIds: ['A', 'B', 'C', 'D'], name: 'Đáy (ABCD)', color: '#38bdf8' },
      { id: 'f_SAB', vertexIds: ['S', 'A', 'B'], name: 'Mặt bên (SAB)', color: '#818cf8' },
      { id: 'f_SBC', vertexIds: ['S', 'B', 'C'], name: 'Mặt bên (SBC)', color: '#a78bfa' },
      { id: 'f_SCD', vertexIds: ['S', 'C', 'D'], name: 'Mặt bên (SCD)', color: '#c084fc' },
      { id: 'f_SDA', vertexIds: ['S', 'D', 'A'], name: 'Mặt bên (SDA)', color: '#60a5fa' },
    ],
    finalResultKaTeX: '\\tan\\widehat{SDA} = \\frac{\\sqrt{2}}{2} \\implies \\widehat{SDA} \\approx 35.26^{\\circ}',
    createdDate: '2025-05-10',
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Phân tích mô hình và Giả thiết hình chữ nhật',
        instruction:
          'Đáy ABCD là hình chữ nhật: AB = a, AD = 2a. SA ⊥ (ABCD) nên SA ⊥ AD.',
        highlightVertices: ['S', 'A', 'D'],
        highlightEdges: ['e_SA', 'e_DA'],
        auxiliaryEdges: [],
        rightAngleMarkers: [
          { vertex: [-1.5, -1.0, 1.0], dir1: [0, 0.4, 0], dir2: [0, 0, -0.4] },
        ],
        katexMath: 'SA \\perp (ABCD) \\implies SA \\perp AD, \\quad AD = 2a',
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Tìm hình chiếu của SD lên mặt đáy (ABCD)',
        instruction:
          'Hình chiếu của S lên (ABCD) là A (do SA ⊥ (ABCD)).\nHình chiếu của D lên (ABCD) là D.\nDo đó hình chiếu của SD lên (ABCD) là đoạn thẳng AD.',
        highlightVertices: ['S', 'A', 'D'],
        highlightEdges: ['e_SA', 'e_SD', 'e_DA'],
        auxiliaryEdges: [],
        katexMath: 'Pr_{(ABCD)}(SD) = AD',
      },
      {
        stepIndex: 3,
        title: 'Bước 3: Xác định góc giữa đường thẳng SD và mặt đáy',
        instruction:
          'Góc giữa SD và (ABCD) là góc giữa SD và AD: \\widehat{(SD, (ABCD))} = \\widehat{SDA}.\nTam giác SAD vuông tại A.',
        highlightVertices: ['S', 'A', 'D'],
        highlightEdges: ['e_SD', 'e_DA'],
        auxiliaryEdges: [],
        highlightFaceTriangles: [
          [
            [-1.5, 2.2, 1.0],
            [-1.5, -1.0, 1.0],
            [-1.5, -1.0, -1.5],
          ],
        ],
        katexMath: '\\widehat{(SD, (ABCD))} = \\widehat{(SD, AD)} = \\widehat{SDA}',
      },
      {
        stepIndex: 4,
        title: 'Bước 4: Học sinh thực hành tính toán',
        instruction:
          'Xét tam giác vuông SAD vuông tại A, hãy tính tan của góc \\widehat{SDA} với SA = a√2 và AD = 2a.',
        highlightVertices: ['S', 'A', 'D'],
        highlightEdges: ['e_SA', 'e_DA', 'e_SD'],
        auxiliaryEdges: [],
        katexMath: '\\tan\\widehat{SDA} = \\frac{SA}{AD} = \\frac{a\\sqrt{2}}{2a} = \\, ?',
        studentInteractivePrompt: {
          question: 'Giá trị của tan(SDA) bằng bao nhiêu?',
          options: ['√2 / 2', '√2', '1 / 2', '2 / √2'],
          correctIndex: 0,
          explanation: 'Đúng! tan(SDA) = SA / AD = (a√2) / (2a) = √2 / 2 ≈ 0.707.',
        },
      },
      {
        stepIndex: 5,
        title: 'Bước 5: Lời giải hoàn chỉnh',
        instruction:
          '\\tan\\widehat{SDA} = \\frac{\\sqrt{2}}{2} \\implies \\widehat{SDA} = \\arctan\\left(\\frac{\\sqrt{2}}{2}\\right) \\approx 35.26^{\\circ} \\approx 35^{\\circ}16\'.',
        highlightVertices: ['S', 'A', 'D'],
        highlightEdges: ['e_SA', 'e_DA', 'e_SD'],
        auxiliaryEdges: [],
        highlightFaceTriangles: [
          [
            [-1.5, 2.2, 1.0],
            [-1.5, -1.0, 1.0],
            [-1.5, -1.0, -1.5],
          ],
        ],
        rightAngleMarkers: [
          { vertex: [-1.5, -1.0, 1.0], dir1: [0, 0.4, 0], dir2: [0, 0, -0.4] },
        ],
        katexMath: '\\tan\\widehat{SDA} = \\frac{\\sqrt{2}}{2} \\implies \\widehat{SDA} \\approx 35.26^{\\circ}',
      },
    ],
  },
];

/**
 * Deterministically generates or solves a geometric lesson based on teacher constraints
 */
export function solveGeometricLessonFromSpec(
  spec: GeometricConstraintSpec,
  userPromptText: string,
  lessonTitle?: string
): SolvedGeometricLesson {
  const a = spec.baseParams.a || 2;
  const b = spec.baseParams.b || (spec.baseType === 'rectangle' ? 3 : 2);
  const h = spec.heightParams.heightValue || 4;
  const hExpr = spec.heightParams.heightExpression || '2a';

  if (spec.polyhedronType === 'pyramid_quad') {
    const halfA = a / 2;
    const halfB = b / 2;
    const yBase = -1.2;
    const yApex = yBase + h * 0.9;

    let footX = -halfA;
    let footZ = halfB;

    if (spec.heightParams.footOfAltitude === 'O') {
      footX = 0;
      footZ = 0;
    }

    const vertices3D = [
      { id: 'A', name: 'A', pos: [-halfA, yBase, halfB] as [number, number, number] },
      { id: 'B', name: 'B', pos: [halfA, yBase, halfB] as [number, number, number] },
      { id: 'C', name: 'C', pos: [halfA, yBase, -halfB] as [number, number, number] },
      { id: 'D', name: 'D', pos: [-halfA, yBase, -halfB] as [number, number, number] },
      { id: 'S', name: 'S', pos: [footX, yApex, footZ] as [number, number, number] },
    ];

    const edges3D = [
      { id: 'e_AB', v1: 'A', v2: 'B', name: 'AB' },
      { id: 'e_BC', v1: 'B', v2: 'C', name: 'BC' },
      { id: 'e_CD', v1: 'C', v2: 'D', name: 'CD' },
      { id: 'e_DA', v1: 'D', v2: 'A', name: 'DA' },
      { id: 'e_SA', v1: 'S', v2: 'A', name: 'SA', isHeight: spec.heightParams.footOfAltitude === 'A' },
      { id: 'e_SB', v1: 'S', v2: 'B', name: 'SB' },
      { id: 'e_SC', v1: 'S', v2: 'C', name: 'SC' },
      { id: 'e_SD', v1: 'S', v2: 'D', name: 'SD' },
    ];

    const faces3D = [
      { id: 'f_ABCD', vertexIds: ['A', 'B', 'C', 'D'], name: 'Đáy (ABCD)', color: '#38bdf8' },
      { id: 'f_SAB', vertexIds: ['S', 'A', 'B'], name: 'Mặt bên (SAB)', color: '#818cf8' },
      { id: 'f_SBC', vertexIds: ['S', 'B', 'C'], name: 'Mặt bên (SBC)', color: '#a78bfa' },
      { id: 'f_SCD', vertexIds: ['S', 'C', 'D'], name: 'Mặt bên (SCD)', color: '#c084fc' },
      { id: 'f_SDA', vertexIds: ['S', 'D', 'A'], name: 'Mặt bên (SDA)', color: '#60a5fa' },
    ];

    // Compute exact diagonal AC
    const diagAC = Math.sqrt(a * a + b * b);
    const tanAngle = h / diagAC;
    const angleDeg = (Math.atan(tanAngle) * 180) / Math.PI;

    const steps: SolvedStep[] = [
      {
        stepIndex: 1,
        title: 'Bước 1: Khảo sát giả thiết hình học',
        instruction: `Dựng hình chóp S.ABCD: Đáy ${spec.baseType === 'square' ? 'hình vuông cạnh a' : 'hình chữ nhật'}. Cạnh bên SA ⊥ (ABCD) với SA = ${hExpr}. Đánh dấu ký hiệu góc vuông tại chân đường cao.`,
        highlightVertices: ['S', 'A'],
        highlightEdges: ['e_SA', 'e_AB', 'e_DA'],
        auxiliaryEdges: [],
        rightAngleMarkers: [
          { vertex: [-halfA, yBase, halfB], dir1: [0, 0.4, 0], dir2: [0.4, 0, 0] },
          { vertex: [-halfA, yBase, halfB], dir1: [0, 0.4, 0], dir2: [0, 0, -0.4] },
        ],
        katexMath: `SA \\perp (ABCD), \\quad SA = ${hExpr}`,
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Tìm hình chiếu vuông góc lên đáy',
        instruction:
          'S chiếu lên (ABCD) là điểm A (do SA ⊥ (ABCD)).\nC thuộc (ABCD) nên hình chiếu là chính C.\nDo đó, hình chiếu vuông góc của SC lên mặt đáy (ABCD) là đoạn thẳng AC.',
        highlightVertices: ['S', 'A', 'C'],
        highlightEdges: ['e_SA', 'e_SC'],
        auxiliaryEdges: [
          {
            from: [-halfA, yBase, halfB],
            to: [halfA, yBase, -halfB],
            label: 'Hình chiếu AC',
            color: '#f59e0b',
            dashed: true,
          },
        ],
        katexMath: 'Pr_{(ABCD)}(SC) = AC',
      },
      {
        stepIndex: 3,
        title: 'Bước 3: Xác định góc giữa đường thẳng và mặt phẳng',
        instruction:
          'Góc giữa SC và mặt đáy (ABCD) là góc giữa SC và hình chiếu AC:\n\\widehat{(SC, (ABCD))} = \\widehat{(SC, AC)} = \\widehat{SCA}.\nTam giác SAC vuông tại A.',
        highlightVertices: ['S', 'A', 'C'],
        highlightEdges: ['e_SA', 'e_SC'],
        auxiliaryEdges: [
          {
            from: [-halfA, yBase, halfB],
            to: [halfA, yBase, -halfB],
            label: 'AC',
            color: '#f59e0b',
            dashed: true,
          },
        ],
        highlightFaceTriangles: [
          [
            [footX, yApex, footZ],
            [-halfA, yBase, halfB],
            [halfA, yBase, -halfB],
          ],
        ],
        rightAngleMarkers: [
          { vertex: [-halfA, yBase, halfB], dir1: [0, 0.4, 0], dir2: [0.28, 0, -0.28] },
        ],
        katexMath: '\\widehat{(SC, (ABCD))} = \\widehat{SCA}',
      },
      {
        stepIndex: 4,
        title: 'Bước 4: Học sinh thực hành tính toán góc SCA',
        instruction: `Hãy tính giá trị của \\tan\\widehat{SCA} = \\frac{SA}{AC} với SA = ${hExpr} và AC là đường chéo của đáy.`,
        highlightVertices: ['S', 'A', 'C'],
        highlightEdges: ['e_SA', 'e_SC'],
        auxiliaryEdges: [
          {
            from: [-halfA, yBase, halfB],
            to: [halfA, yBase, -halfB],
            label: 'AC',
            color: '#f59e0b',
            dashed: true,
          },
        ],
        highlightFaceTriangles: [
          [
            [footX, yApex, footZ],
            [-halfA, yBase, halfB],
            [halfA, yBase, -halfB],
          ],
        ],
        katexMath: `\\tan\\widehat{SCA} = \\frac{SA}{AC} = \\frac{${hExpr}}{AC}`,
        studentInteractivePrompt: {
          question: `Giá trị góc SCA xấp xỉ bằng bao nhiêu độ? (tan(SCA) ≈ ${tanAngle.toFixed(3)})`,
          options: [
            `${(angleDeg - 15).toFixed(1)}°`,
            `${angleDeg.toFixed(1)}° (Chính xác)`,
            `${(angleDeg + 12).toFixed(1)}°`,
            `90°`,
          ],
          correctIndex: 1,
          explanation: `Chính xác! tan(SCA) = ${tanAngle.toFixed(3)} ⇒ góc SCA ≈ ${angleDeg.toFixed(2)}°.`,
        },
      },
      {
        stepIndex: 5,
        title: 'Bước 5: Lời giải toán học chi tiết và Kết luận',
        instruction: `Độ dài đường chéo AC = \\sqrt{AB^2 + BC^2} = \\sqrt{${a}^2 + ${b}^2}.\nTrong tam giác SAC vuông tại A: \\tan\\widehat{SCA} = \\frac{SA}{AC} = ${tanAngle.toFixed(3)}.\nSuy ra \\widehat{SCA} \\approx ${angleDeg.toFixed(2)}^\\circ.`,
        highlightVertices: ['S', 'A', 'C'],
        highlightEdges: ['e_SA', 'e_SC'],
        auxiliaryEdges: [
          {
            from: [-halfA, yBase, halfB],
            to: [halfA, yBase, -halfB],
            label: 'AC',
            color: '#10b981',
            dashed: true,
          },
        ],
        highlightFaceTriangles: [
          [
            [footX, yApex, footZ],
            [-halfA, yBase, halfB],
            [halfA, yBase, -halfB],
          ],
        ],
        rightAngleMarkers: [
          { vertex: [-halfA, yBase, halfB], dir1: [0, 0.4, 0], dir2: [0.28, 0, -0.28] },
        ],
        katexMath: `\\tan\\widehat{SCA} \\approx ${tanAngle.toFixed(3)} \\implies \\widehat{SCA} \\approx ${angleDeg.toFixed(2)}^{\\circ}`,
      },
    ];

    return {
      id: `lesson-custom-${Date.now()}`,
      title: lessonTitle || `Bài học hình học 3D: Chóp S.ABCD (${spec.targetTask.lineName || 'SC'} và mặt đáy)`,
      promptText: userPromptText,
      spec,
      vertices3D,
      edges3D,
      faces3D,
      steps,
      finalResultKaTeX: `\\tan\\widehat{SCA} \\approx ${tanAngle.toFixed(3)} \\implies \\widehat{SCA} \\approx ${angleDeg.toFixed(2)}^{\\circ}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
  }

  // Fallback default
  return PRESET_GEOMETRIC_LESSONS[0];
}
