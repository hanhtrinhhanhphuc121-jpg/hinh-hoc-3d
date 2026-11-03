export type BasePolygonType = 'square' | 'rectangle' | 'regular_triangle' | 'right_triangle';

export type ProblemType =
  | 'angle_line_plane'
  | 'dihedral_angle'
  | 'distance_point_plane'
  | 'distance_skew_lines'
  | 'cross_section';

export interface GeometricConstraintSpec {
  polyhedronType: 'pyramid_quad' | 'pyramid_tri' | 'prism_tri' | 'cube';
  baseType: BasePolygonType;
  baseParams: {
    a: number; // side length a
    b?: number; // width b (for rectangle)
  };
  heightParams: {
    vertexApex: string; // 'S'
    footOfAltitude: string; // 'A' or 'H' or 'O'
    heightValue: number; // e.g. 2 * a
    heightExpression: string; // '2a', 'a\sqrt{3}', etc.
  };
  targetTask: {
    type: ProblemType;
    lineName?: string; // 'SC'
    planeName?: string; // '(ABCD)'
    targetAngleName?: string; // '\widehat{SCA}'
    targetDistanceName?: string; // 'd(A, (SBC))'
  };
}

export interface SolvedStep {
  stepIndex: number;
  title: string;
  instruction: string;
  highlightVertices: string[];
  highlightEdges: string[];
  auxiliaryEdges: {
    from: [number, number, number];
    to: [number, number, number];
    label: string;
    color: string;
    dashed: boolean;
  }[];
  highlightFaceTriangles?: [number, number, number][][]; // Triangles to render highlighted
  rightAngleMarkers?: {
    vertex: [number, number, number];
    dir1: [number, number, number];
    dir2: [number, number, number];
  }[];
  katexMath?: string;
  studentInteractivePrompt?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface SolvedGeometricLesson {
  id: string;
  title: string;
  promptText: string;
  spec: GeometricConstraintSpec;
  vertices3D: { id: string; name: string; pos: [number, number, number] }[];
  edges3D: { id: string; v1: string; v2: string; name?: string; isHeight?: boolean }[];
  faces3D: { id: string; vertexIds: string[]; name?: string; color?: string }[];
  steps: SolvedStep[];
  finalResultKaTeX: string;
  createdDate: string;
}
