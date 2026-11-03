export type EdgeStyleOverride = 'auto' | 'solid' | 'dashed';

export interface CustomRightAngleMarker {
  id: string;
  vertexId: string;
  edge1Id: string;
  edge2Id: string;
  pos: [number, number, number];
  dir1: [number, number, number];
  dir2: [number, number, number];
  description: string;
}

export interface TeacherQuestion {
  id: string;
  title: string;
  prompt: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  solution: string; // Detailed step-by-step math explanation
  grade: 'THCS' | 'THPT';
  topic: string;
}

export interface TeacherLessonConfig {
  id: string;
  title: string;
  author: string; // Cao Thị Thu Thảo - GV trường THCS và THPT Long Hiệp
  school: string;
  modelId: string;
  params: Record<string, number>;
  vertexRenames: Record<string, string>; // originalId -> customName (e.g. 'A' -> 'S_1')
  edgeOverrides: Record<string, EdgeStyleOverride>; // edgeId -> 'auto' | 'solid' | 'dashed'
  rightAngleMarkers: CustomRightAngleMarker[];
  highlightedFaces: string[]; // face IDs highlighted
  questions: TeacherQuestion[];
  createdDate: string;
  notes?: string;
}
