export type ModelCategory = 'spatial' | 'coordinate' | 'interdisciplinary';

export type GradeLevel = 'THCS' | 'THPT' | 'all';

export interface ModelParam {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
  description?: string;
}

export interface Vertex3D {
  id: string;
  name: string;
  pos: [number, number, number];
  color?: string;
}

export interface Edge3D {
  id: string;
  v1: string;
  v2: string;
  name?: string;
  isAxis?: boolean;
  isHeight?: boolean;
  isSlant?: boolean;
  color?: string;
}

export interface Face3D {
  id: string;
  vertexIds: string[];
  name?: string;
  color?: string;
  opacity?: number;
}

export interface RightAngleMarker3D {
  vertex: [number, number, number];
  dir1: [number, number, number];
  dir2: [number, number, number];
  size?: number;
}

export interface FormulaStep {
  name: string;
  latexSymbol: string;
  latexFormula: string;
  substitution: string;
  result: number;
  unit: string;
  explanation: string;
}

export interface NetPolygon2D {
  id: string;
  name: string;
  points: [number, number][]; // 2D flat coordinates
  color?: string;
  strokeColor?: string;
  label?: string;
}

export interface NetUnfold3DPart {
  id: string;
  name: string;
  pivot: [number, number, number];
  axis: [number, number, number]; // rotation axis for unfolding
  angle: number; // max rotation angle in radians (usually 90 deg or face dihedral angle)
  verticesFolded: [number, number, number][];
  faceIndices: number[]; // triangles
}

export interface NetDefinition {
  canUnfold: boolean;
  explanation?: string;
  flatNetSvgPath?: string;
  unfoldTitle?: string;
  unfold2DPolygons?: (params: Record<string, number>) => NetPolygon2D[];
}

export interface GuidedStep {
  id: number;
  title: string;
  question: string;
  hint: string;
  answerExplanation: string;
  expectedObservation: string;
}

export interface GeometryModel {
  id: string;
  name: string;
  category: ModelCategory;
  categoryName: string;
  gradeLevel: GradeLevel;
  description: string;
  tags: string[];
  params: ModelParam[];
  defaultParams: Record<string, number>;
  educationalNotes: string[];
  generateGeometry: (params: Record<string, number>) => {
    vertices: Vertex3D[];
    edges: Edge3D[];
    faces: Face3D[];
    heightLines?: Edge3D[];
    rightAngleMarkers?: RightAngleMarker3D[];
    centerPoint?: [number, number, number];
    customMeshes?: any[]; // For smooth cylinders, cones, spheres, molecules, torus
  };
  calculateFormulas: (params: Record<string, number>, unit: string) => FormulaStep[];
  netDefinition?: NetDefinition;
  guidedSteps?: GuidedStep[];
}

export interface SelectedElement {
  type: 'vertex' | 'edge' | 'face' | 'none';
  id?: string;
  name?: string;
  details?: Record<string, string | number>;
}

export interface QuizQuestion {
  id: string;
  modelId: string;
  modelName: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: 'recognition' | 'properties' | 'calculation' | 'relation';
}
