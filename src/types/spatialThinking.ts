export type SpatialGrade = 'THCS' | 'THPT';

export type SpatialCategory = 'projection' | 'hidden_line' | 'relations' | 'net_prediction';

export interface SpatialOption {
  id: string;
  label: string;
  svgIcon?: string; // Optional SVG miniature for visual projection/net options
  isCorrect: boolean;
}

export interface SpatialThinkingExercise {
  id: string;
  title: string;
  gradeLevel: SpatialGrade;
  category: SpatialCategory;
  categoryLabel: string;
  modelId: string;
  modelName: string;
  modelParams: Record<string, number>;
  prompt: string;
  options: SpatialOption[];
  // 3D verification parameters
  targetCameraAngle?: [number, number, number]; // Position to snap camera for verification
  targetLookAt?: [number, number, number];
  highlightElements?: {
    type: 'edge' | 'face' | 'vertex';
    id: string;
    label?: string;
  }[];
  supportsUnfolding?: boolean;
  explanation: string;
  spatialTip: string; // Tip for developing spatial cognition
}
