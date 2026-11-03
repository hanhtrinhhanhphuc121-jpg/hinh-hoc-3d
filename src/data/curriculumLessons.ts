export interface CurriculumLesson {
  id: string;
  grade: 'Lớp 7' | 'Lớp 8' | 'Lớp 9' | 'Lớp 11' | 'Lớp 12';
  title: string;
  modelId: string;
  summary: string;
  formulas: { label: string; math: string }[];
  worksheetQuestions: {
    id: string;
    question: string;
    type: 'multiple-choice' | 'essay';
    options?: string[];
    correctAnswer: string;
    guide: string;
  }[];
}

export const curriculumLessons: CurriculumLesson[] = [
  {
    id: 'lesson-grade7-cuboid',
    grade: 'Lớp 7',
    title: 'Hình hộp chữ nhật và Hình lập phương',
    modelId: 'cube',
    summary: 'Hình hộp chữ nhật có 6 mặt là các hình chữ nhật, 8 đỉnh và 12 cạnh. Các mặt đối diện bằng nhau và song song.',
    formulas: [
      { label: 'Diện tích xung quanh', math: 'S_{xq} = 2(a + b) \\cdot h' },
      { label: 'Thể tích', math: 'V = a \\cdot b \\cdot h' },
    ],
    worksheetQuestions: [
      {
        id: 'q1',
        question: 'Một hình hộp chữ nhật có chiều dài 6 cm, chiều rộng 4 cm, chiều cao 5 cm. Thể tích của hình hộp là bao nhiêu?',
        type: 'multiple-choice',
        options: ['120 cm³', '100 cm³', '60 cm³', '150 cm³'],
        correctAnswer: '120 cm³',
        guide: 'V = a . b . h = 6 . 4 . 5 = 120 cm³.',
      },
      {
        id: 'q2',
        question: 'Hình lập phương có cạnh bằng 4 cm. Tính diện tích toàn phần của hình lập phương đó.',
        type: 'essay',
        correctAnswer: '96 cm²',
        guide: 'S_{tp} = 6 . a² = 6 . 4² = 6 . 16 = 96 cm².',
      },
    ],
  },
  {
    id: 'lesson-grade8-pyramid',
    grade: 'Lớp 8',
    title: 'Hình chóp tam giác đều và Hình chóp tứ giác đều',
    modelId: 'pyramid_quad',
    summary: 'Hình chóp đều có đáy là đa giác đều, chân đường cao trùng với tâm của đáy, các cạnh bên bằng nhau và các mặt bên là tam giác cân bằng nhau.',
    formulas: [
      { label: 'Diện tích xung quanh', math: 'S_{xq} = p \\cdot d \\quad (p: \\text{nửa chu vi đáy}, d: \\text{trung đoạn})' },
      { label: 'Thể tích hình chóp', math: 'V = \\frac{1}{3} S_{\\text{đáy}} \\cdot h' },
    ],
    worksheetQuestions: [
      {
        id: 'q1',
        question: 'Hình chóp tứ giác đều có cạnh đáy bằng 6 cm, chiều cao bằng 4 cm. Thể tích hình chóp là:',
        type: 'multiple-choice',
        options: ['48 cm³', '144 cm³', '72 cm³', '36 cm³'],
        correctAnswer: '48 cm³',
        guide: 'S_{đáy} = 6² = 36 cm². V = 1/3 . S_{đáy} . h = 1/3 . 36 . 4 = 48 cm³.',
      },
    ],
  },
  {
    id: 'lesson-grade9-cone-cylinder-sphere',
    grade: 'Lớp 9',
    title: 'Hình trụ, Hình nón và Hình cầu (Khối tròn xoay)',
    modelId: 'cylinder',
    summary: 'Khi quay các hình phẳng quanh một trục cố định, ta nhận được khối tròn xoay: chữ nhật quay tạo hình trụ, tam giác vuông quay tạo hình nón, nửa hình tròn quay tạo hình cầu.',
    formulas: [
      { label: 'Thể tích hình trụ', math: 'V_{\\text{trụ}} = \\pi r^2 h' },
      { label: 'Thể tích hình nón', math: 'V_{\\text{nón}} = \\frac{1}{3} \\pi r^2 h' },
      { label: 'Thể tích khối cầu', math: 'V_{\\text{cầu}} = \\frac{4}{3} \\pi R^3' },
    ],
    worksheetQuestions: [
      {
        id: 'q1',
        question: 'Một hình nón có bán kính đáy r = 3 cm và chiều cao h = 4 cm. Đường sinh l của hình nón bằng:',
        type: 'multiple-choice',
        options: ['5 cm', '7 cm', '25 cm', '12 cm'],
        correctAnswer: '5 cm',
        guide: 'Đường sinh l = √(r² + h²) = √(3² + 4²) = √25 = 5 cm.',
      },
    ],
  },
  {
    id: 'lesson-grade11-perp-distance',
    grade: 'Lớp 11',
    title: 'Quan hệ vuông góc và Khoảng cách trong không gian',
    modelId: 'pyramid_sa_perp_base',
    summary: 'Quy tắc xác định góc giữa đường thẳng và mặt phẳng, góc phẳng nhị diện, khoảng cách từ điểm đến mặt phẳng, và phương pháp dựng đoạn vuông góc chung.',
    formulas: [
      { label: 'Khoảng cách từ chân đường cao', math: '\\frac{1}{h^2} = \\frac{1}{a^2} + \\frac{1}{b^2} + \\frac{1}{c^2}' },
      { label: 'Tỉ số khoảng cách', math: '\\frac{d(M, (P))}{d(A, (P))} = \\frac{MI}{AI}' },
    ],
    worksheetQuestions: [
      {
        id: 'q1',
        question: 'Cho hình chóp S.ABCD có SA ⊥ (ABCD), đáy ABCD là hình vuông cạnh a, SA = a. Góc giữa SC và mặt phẳng (ABCD) bằng:',
        type: 'multiple-choice',
        options: ['35.26° (hoặc arctan(√2/2))', '45°', '60°', '30°'],
        correctAnswer: '35.26° (hoặc arctan(√2/2))',
        guide: 'Hình chiếu của SC lên (ABCD) là AC = a√2. tan(∠SCA) = SA / AC = a / (a√2) = 1/√2 => ∠SCA ≈ 35.26°.',
      },
    ],
  },
  {
    id: 'lesson-grade12-oxyz',
    grade: 'Lớp 12',
    title: 'Phương pháp tọa độ trong không gian Oxyz',
    modelId: 'coord_axes',
    summary: 'Tọa độ vectơ, phương trình mặt cầu, phương trình mặt phẳng, phương trình đường thẳng, tính khoảng cách và giải toán hình học không gian bằng tọa độ.',
    formulas: [
      { label: 'Phương trình mặt phẳng', math: 'Ax + By + Cz + D = 0' },
      { label: 'Khoảng cách điểm đến mặt phẳng', math: 'd(M, (P)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}' },
    ],
    worksheetQuestions: [
      {
        id: 'q1',
        question: 'Khoảng cách từ điểm M(1; 2; 3) đến mặt phẳng (P): 2x - 2y + z + 5 = 0 bằng:',
        type: 'multiple-choice',
        options: ['2', '6', '3', '1'],
        correctAnswer: '2',
        guide: 'd(M, (P)) = |2(1) - 2(2) + 3 + 5| / √(2² + (-2)² + 1²) = |2 - 4 + 3 + 5| / 3 = 6 / 3 = 2.',
      },
    ],
  },
];
