import { GeometryModel, QuizQuestion } from '../types/geometry';
import { spatialModels } from './spatialModels';
import { coordinateModels } from './coordinateModels';
import { interdisciplinaryModels } from './interdisciplinaryModels';

export const allModels: GeometryModel[] = [
  ...spatialModels,
  ...coordinateModels,
  ...interdisciplinaryModels,
];

export const getModelById = (id: string): GeometryModel => {
  const found = allModels.find((m) => m.id === id);
  return found || spatialModels[0]; // fallback to cube
};

export const categoriesConfig = [
  { id: 'all', label: 'Tất cả (30 mô hình)', count: 30 },
  { id: 'spatial', label: 'A. Hình học không gian (22)', count: 22 },
  { id: 'coordinate', label: 'B. Hệ tọa độ Oxyz (4)', count: 4 },
  { id: 'interdisciplinary', label: 'C. Mô hình liên môn (4)', count: 4 },
];

export const sampleQuizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    modelId: 'cube',
    modelName: 'Hình lập phương',
    topic: 'properties',
    question: 'Hình lập phương có tổng cộng bao nhiêu đỉnh, bao nhiêu cạnh và bao nhiêu mặt phẳng đối xứng?',
    options: [
      '8 đỉnh, 12 cạnh, 9 mặt phẳng đối xứng',
      '6 đỉnh, 8 cạnh, 6 mặt phẳng đối xứng',
      '8 đỉnh, 12 cạnh, 6 mặt phẳng đối xứng',
      '12 đỉnh, 8 cạnh, 4 mặt phẳng đối xứng',
    ],
    correctIndex: 0,
    explanation: 'Hình lập phương có 8 đỉnh, 12 cạnh bằng nhau, 6 mặt vuông và đúng 9 mặt phẳng đối xứng (3 mặt phẳng song song với các cặp mặt đối diện và 6 mặt phẳng đi qua các cặp cạnh đối diện).',
  },
  {
    id: 'q2',
    modelId: 'regular_pyramid',
    modelName: 'Hình chóp tứ giác đều',
    topic: 'properties',
    question: 'Trong hình chóp tứ giác đều S.ABCD có tâm đáy là O, khẳng định nào sau đây là ĐÚNG?',
    options: [
      'Đoạn thẳng SO vuông góc với mặt phẳng đáy (ABCD)',
      'Các cạnh bên có độ dài khác nhau',
      'Các mặt bên là các tam giác vuông tại đỉnh S',
      'Trung đoạn d bằng đúng chiều cao SO',
    ],
    correctIndex: 0,
    explanation: 'Hình chóp đều có đỉnh S chiếu vuông góc trùng với tâm O của đa giác đáy, do đó SO ⟂ (ABCD).',
  },
  {
    id: 'q3',
    modelId: 'pyramid_sa_perp_base',
    modelName: 'Chóp có SA ⟂ đáy',
    topic: 'relation',
    question: 'Cho hình chóp S.ABCD có đáy ABCD là hình chữ nhật và cạnh bên SA vuông góc với đáy. Tam giác SBC là tam giác gì?',
    options: [
      'Tam giác vuông tại B',
      'Tam giác đều',
      'Tam giác cân tại S',
      'Tam giác tù tại B',
    ],
    correctIndex: 0,
    explanation: 'Vì BC ⟂ AB (ABCD là hình chữ nhật) và BC ⟂ SA (do SA ⟂ đáy), suy ra BC ⟂ mp(SAB). Từ đó BC ⟂ SB, vậy tam giác SBC vuông tại B!',
  },
  {
    id: 'q4',
    modelId: 'cone',
    modelName: 'Hình nón',
    topic: 'calculation',
    question: 'Một hình nón có bán kính đáy r = 3 cm và chiều cao h = 4 cm. Độ dài đường sinh l và diện tích xung quanh S_xq của hình nón là:',
    options: [
      'l = 5 cm; S_xq = 15π cm²',
      'l = 7 cm; S_xq = 21π cm²',
      'l = 5 cm; S_xq = 30π cm²',
      'l = \\sqrt{7} cm; S_xq = 12π cm²',
    ],
    correctIndex: 0,
    explanation: 'Theo định lý Pythagore: l = √(h² + r²) = √(4² + 3²) = 5 cm. Diện tích xung quanh: S_xq = π·r·l = π × 3 × 5 = 15π cm².',
  },
  {
    id: 'q5',
    modelId: 'cylinder',
    modelName: 'Hình trụ',
    topic: 'calculation',
    question: 'Khi cắt một hình trụ tròn xoay bởi một mặt phẳng song song và cách trục một khoảng, thiết diện nhận được là hình gì?',
    options: [
      'Hình chữ nhật',
      'Hình tròn',
      'Hình elip',
      'Hình tam giác cân',
    ],
    correctIndex: 0,
    explanation: 'Mọi thiết diện của hình trụ cắt bởi mặt phẳng song song với trục đều là hình chữ nhật (nếu đi qua trục là thiết diện qua trục).',
  },
  {
    id: 'q6',
    modelId: 'sphere',
    modelName: 'Hình cầu',
    topic: 'properties',
    question: 'Theo Định lý Egregium của Gauss, tại sao một mặt cầu không thể trải phẳng chính xác lên mặt phẳng?',
    options: [
      'Vì độ cong Gauss của mặt cầu là dương (K > 0) trong khi mặt phẳng có K = 0',
      'Vì mặt cầu không có đỉnh hay cạnh',
      'Vì thể tích mặt cầu luôn là số vô tỉ',
      'Vì mặt cầu chỉ có một tâm đối xứng',
    ],
    correctIndex: 0,
    explanation: 'Độ cong Gauss là một bất biến đẳng cự (intrinsic curvature). Mặt cầu có K = 1/R² > 0, còn mặt phẳng có K = 0, nên không thể có phép biến đổi bảo toàn khoảng cách giữa hai mặt phẳng này.',
  },
  {
    id: 'q7',
    modelId: 'molecule_ch4',
    modelName: 'Phân tử metan CH₄',
    topic: 'recognition',
    question: 'Phân tử metan CH₄ có cấu trúc hình học không gian trùng với khối đa diện đều nào?',
    options: [
      'Hình tứ diện đều (Regular Tetrahedron)',
      'Hình bát diện đều (Octahedron)',
      'Hình lập phương (Cube)',
      'Hình chóp tứ giác đều',
    ],
    correctIndex: 0,
    explanation: '4 nguyên tử Hydro nằm tại 4 đỉnh của một hình tứ diện đều, nguyên tử Cacbon ở tâm với góc liên kết 109.5°.',
  },
  {
    id: 'q8',
    modelId: 'point_and_vector',
    modelName: 'Điểm và vectơ Oxyz',
    topic: 'calculation',
    question: 'Trong không gian Oxyz, khoảng cách từ điểm M(3, -4, 5) đến trục Oz bằng bao nhiêu?',
    options: [
      '5',
      '3',
      '4',
      '√50',
    ],
    correctIndex: 0,
    explanation: 'Khoảng cách từ điểm M(x, y, z) đến trục Oz bằng d = √(x² + y²) = √(3² + (-4)²) = √25 = 5.',
  },
];
