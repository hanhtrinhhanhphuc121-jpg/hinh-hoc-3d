import * as THREE from 'three';

export interface Unfolding3DResult {
  meshes: THREE.Mesh[];
  lines: THREE.Line[];
  hingeMarkers: THREE.Line[];
  metrics: {
    label: string;
    value: string;
    description: string;
  }[];
}

/**
 * Rodrigues' rotation formula:
 * Rotates a 3D vector v around an axis line passing through point p0 with unit direction u by angle theta.
 */
export function rotateAroundAxis(
  v: THREE.Vector3,
  p0: THREE.Vector3,
  u: THREE.Vector3,
  theta: number
): THREE.Vector3 {
  const p = new THREE.Vector3().subVectors(v, p0);
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const dot = u.dot(p);

  // v' = p0 + p*cos(theta) + (u x p)*sin(theta) + u*(u . p)*(1 - cos(theta))
  const cross = new THREE.Vector3().crossVectors(u, p);
  const res = new THREE.Vector3()
    .copy(p0)
    .addScaledVector(p, cosT)
    .addScaledVector(cross, sinT)
    .addScaledVector(u, dot * (1 - cosT));

  return res;
}

/**
 * Creates a flat polygon mesh and wireframe lines from an array of 3D vertices
 */
export function createPolygonMeshAndLines(
  vertices: THREE.Vector3[],
  color: number = 0x38bdf8,
  lineColor: number = 0x0284c7,
  opacity: number = 0.75
): { mesh: THREE.Mesh; line: THREE.Line } {
  // Triangulate convex polygon as a fan
  const triPos: number[] = [];
  for (let i = 1; i < vertices.length - 1; i++) {
    triPos.push(
      vertices[0].x, vertices[0].y, vertices[0].z,
      vertices[i].x, vertices[i].y, vertices[i].z,
      vertices[i + 1].x, vertices[i + 1].y, vertices[i + 1].z
    );
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(triPos, 3));
  geom.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.35,
    metalness: 0.1,
    side: THREE.DoubleSide,
    transparent: true,
    opacity,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });

  const mesh = new THREE.Mesh(geom, mat);

  // Wireframe outline lines
  const linePoints = [...vertices, vertices[0]];
  const lineGeom = new THREE.BufferGeometry().setFromPoints(linePoints);
  const lineMat = new THREE.LineBasicMaterial({
    color: lineColor,
    linewidth: 2,
  });
  const line = new THREE.Line(lineGeom, lineMat);

  return { mesh, line };
}

/**
 * Builds 3D physically hinged unfolding models for each supported geometry
 */
export function build3DUnfoldingScene(
  modelId: string,
  params: Record<string, number>,
  progress: number // 0 (closed 3D) to 1 (flat 2D net)
): Unfolding3DResult {
  const t = Math.max(0, Math.min(1, progress));
  const meshes: THREE.Mesh[] = [];
  const lines: THREE.Line[] = [];
  const hingeMarkers: THREE.Line[] = [];
  const metrics: { label: string; value: string; description: string }[] = [];

  // Helper to add hinge line marker
  const addHingeMarker = (p1: THREE.Vector3, p2: THREE.Vector3) => {
    const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const mat = new THREE.LineDashedMaterial({
      color: 0xf59e0b, // Amber for hinge edge
      dashSize: 0.15,
      gapSize: 0.1,
      linewidth: 3,
    });
    const line = new THREE.LineSegments(geo, mat);
    line.computeLineDistances();
    hingeMarkers.push(line);
  };

  // 1. CUBE (Hình lập phương)
  if (modelId === 'cube') {
    const a = params.a ?? 3;
    const h2 = a / 2;
    const rot = t * (Math.PI / 2); // 0 to 90 deg rotation for each lateral face

    // Base face (Bottom ABCD, stationary on plane y = -h2)
    const baseV = [
      new THREE.Vector3(-h2, -h2, -h2), // A
      new THREE.Vector3(h2, -h2, -h2),  // B
      new THREE.Vector3(h2, -h2, h2),   // C
      new THREE.Vector3(-h2, -h2, h2),  // D
    ];
    const base = createPolygonMeshAndLines(baseV, 0x6366f1, 0x4338ca);
    meshes.push(base.mesh);
    lines.push(base.line);

    // Face Front (CDD'C' hinged on edge CD)
    const hingeCD_p1 = new THREE.Vector3(h2, -h2, h2);
    const hingeCD_p2 = new THREE.Vector3(-h2, -h2, h2);
    const axisCD = new THREE.Vector3(1, 0, 0); // rotates down around X
    const frontV = [
      new THREE.Vector3(h2, -h2, h2),
      new THREE.Vector3(-h2, -h2, h2),
      new THREE.Vector3(-h2, h2, h2),
      new THREE.Vector3(h2, h2, h2),
    ].map((v, i) => (i < 2 ? v : rotateAroundAxis(v, hingeCD_p1, axisCD, rot)));
    const front = createPolygonMeshAndLines(frontV, 0x818cf8, 0x4f46e5);
    meshes.push(front.mesh);
    lines.push(front.line);
    addHingeMarker(hingeCD_p1, hingeCD_p2);

    // Face Back (ABB'A' hinged on edge AB)
    const hingeAB_p1 = new THREE.Vector3(-h2, -h2, -h2);
    const hingeAB_p2 = new THREE.Vector3(h2, -h2, -h2);
    const axisAB = new THREE.Vector3(-1, 0, 0);
    const backV = [
      new THREE.Vector3(-h2, -h2, -h2),
      new THREE.Vector3(h2, -h2, -h2),
      new THREE.Vector3(h2, h2, -h2),
      new THREE.Vector3(-h2, h2, -h2),
    ].map((v, i) => (i < 2 ? v : rotateAroundAxis(v, hingeAB_p1, axisAB, rot)));
    const back = createPolygonMeshAndLines(backV, 0x818cf8, 0x4f46e5);
    meshes.push(back.mesh);
    lines.push(back.line);
    addHingeMarker(hingeAB_p1, hingeAB_p2);

    // Face Right (BCC'B' hinged on edge BC)
    const hingeBC_p1 = new THREE.Vector3(h2, -h2, -h2);
    const hingeBC_p2 = new THREE.Vector3(h2, -h2, h2);
    const axisBC = new THREE.Vector3(0, 0, 1);
    const rightV = [
      new THREE.Vector3(h2, -h2, -h2),
      new THREE.Vector3(h2, -h2, h2),
      new THREE.Vector3(h2, h2, h2),
      new THREE.Vector3(h2, h2, -h2),
    ].map((v, i) => (i < 2 ? v : rotateAroundAxis(v, hingeBC_p1, axisBC, rot)));
    const right = createPolygonMeshAndLines(rightV, 0xa5b4fc, 0x4f46e5);
    meshes.push(right.mesh);
    lines.push(right.line);
    addHingeMarker(hingeBC_p1, hingeBC_p2);

    // Face Left (ADD'A' hinged on edge AD)
    const hingeAD_p1 = new THREE.Vector3(-h2, -h2, h2);
    const hingeAD_p2 = new THREE.Vector3(-h2, -h2, -h2);
    const axisAD = new THREE.Vector3(0, 0, -1);
    const leftV = [
      new THREE.Vector3(-h2, -h2, h2),
      new THREE.Vector3(-h2, -h2, -h2),
      new THREE.Vector3(-h2, h2, -h2),
      new THREE.Vector3(-h2, h2, h2),
    ].map((v, i) => (i < 2 ? v : rotateAroundAxis(v, hingeAD_p1, axisAD, rot)));
    const left = createPolygonMeshAndLines(leftV, 0xa5b4fc, 0x4f46e5);
    meshes.push(left.mesh);
    lines.push(left.line);
    addHingeMarker(hingeAD_p1, hingeAD_p2);

    // Face Top (A'B'C'D' hinged to Back face top edge A'B')
    // In folded state, Top face is at y = h2. It first follows Back face rotation around AB,
    // and additionally rotates around the moving edge A'(t)B'(t) by rot!
    const origTopV = [
      new THREE.Vector3(-h2, h2, -h2), // A'
      new THREE.Vector3(h2, h2, -h2),  // B'
      new THREE.Vector3(h2, h2, h2),   // C'
      new THREE.Vector3(-h2, h2, h2),   // D'
    ];
    // First rotate top face around moving hinge A'B' of back face
    const currentAprime = backV[3];
    const currentBprime = backV[2];
    const topV = origTopV.map((v, i) => {
      // First rotate with Back face
      const vAfterBack = rotateAroundAxis(v, hingeAB_p1, axisAB, rot);
      if (i < 2) return vAfterBack;
      // Then rotate around current A'B' edge
      return rotateAroundAxis(vAfterBack, currentAprime, axisAB, rot);
    });
    const top = createPolygonMeshAndLines(topV, 0xc7d2fe, 0x4338ca);
    meshes.push(top.mesh);
    lines.push(top.line);
    addHingeMarker(currentAprime, currentBprime);

    metrics.push(
      { label: 'Cạnh khối lập phương a', value: `${a} cm`, description: 'Độ dài cạnh không đổi qua mọi góc mở' },
      { label: 'Góc xoay bản lề', value: `${(t * 90).toFixed(1)}° / 90.0°`, description: 'Góc gập giữa các mặt kề nhau' },
      { label: 'Số mặt phẳng mở', value: '6 mặt vuông', description: 'Bản lề cấp 1 và cấp 2 mở thành hình chữ thập' }
    );
  }

  // 2. RECTANGULAR BOX (Hình hộp chữ nhật)
  else if (modelId === 'box' || modelId === 'right_prism') {
    const a = params.a ?? 4;
    const b = params.b ?? 2.5;
    const c = params.c ?? (params.h ?? 3);
    const x2 = a / 2;
    const z2 = b / 2;
    const yBottom = -c / 2;
    const rot = t * (Math.PI / 2);

    // Base ABCD
    const baseV = [
      new THREE.Vector3(-x2, yBottom, -z2),
      new THREE.Vector3(x2, yBottom, -z2),
      new THREE.Vector3(x2, yBottom, z2),
      new THREE.Vector3(-x2, yBottom, z2),
    ];
    const base = createPolygonMeshAndLines(baseV, 0x0284c7, 0x0369a1);
    meshes.push(base.mesh);
    lines.push(base.line);

    // Front (CD, height c)
    const hCD1 = baseV[2];
    const hCD2 = baseV[3];
    const axisCD = new THREE.Vector3(1, 0, 0);
    const frontV = [
      baseV[2].clone(),
      baseV[3].clone(),
      new THREE.Vector3(-x2, yBottom + c, z2),
      new THREE.Vector3(x2, yBottom + c, z2),
    ].map((v, i) => (i < 2 ? v : rotateAroundAxis(v, hCD1, axisCD, rot)));
    const front = createPolygonMeshAndLines(frontV, 0x38bdf8, 0x0284c7);
    meshes.push(front.mesh);
    lines.push(front.line);
    addHingeMarker(hCD1, hCD2);

    // Back (AB, height c)
    const hAB1 = baseV[0];
    const axisAB = new THREE.Vector3(-1, 0, 0);
    const backV = [
      baseV[0].clone(),
      baseV[1].clone(),
      new THREE.Vector3(x2, yBottom + c, -z2),
      new THREE.Vector3(-x2, yBottom + c, -z2),
    ].map((v, i) => (i < 2 ? v : rotateAroundAxis(v, hAB1, axisAB, rot)));
    const back = createPolygonMeshAndLines(backV, 0x38bdf8, 0x0284c7);
    meshes.push(back.mesh);
    lines.push(back.line);
    addHingeMarker(baseV[0], baseV[1]);

    // Right (BC, width b, height c)
    const hBC1 = baseV[1];
    const axisBC = new THREE.Vector3(0, 0, 1);
    const rightV = [
      baseV[1].clone(),
      baseV[2].clone(),
      new THREE.Vector3(x2, yBottom + c, z2),
      new THREE.Vector3(x2, yBottom + c, -z2),
    ].map((v, i) => (i < 2 ? v : rotateAroundAxis(v, hBC1, axisBC, rot)));
    const right = createPolygonMeshAndLines(rightV, 0x7dd3fc, 0x0284c7);
    meshes.push(right.mesh);
    lines.push(right.line);
    addHingeMarker(baseV[1], baseV[2]);

    // Left (AD, width b, height c)
    const hAD1 = baseV[3];
    const axisAD = new THREE.Vector3(0, 0, -1);
    const leftV = [
      baseV[3].clone(),
      baseV[0].clone(),
      new THREE.Vector3(-x2, yBottom + c, -z2),
      new THREE.Vector3(-x2, yBottom + c, z2),
    ].map((v, i) => (i < 2 ? v : rotateAroundAxis(v, hAD1, axisAD, rot)));
    const left = createPolygonMeshAndLines(leftV, 0x7dd3fc, 0x0284c7);
    meshes.push(left.mesh);
    lines.push(left.line);
    addHingeMarker(baseV[3], baseV[0]);

    // Top lid attached to Front face
    const curTop1 = frontV[3];
    const curTop2 = frontV[2];
    const topV = [
      new THREE.Vector3(x2, yBottom + c, z2),
      new THREE.Vector3(-x2, yBottom + c, z2),
      new THREE.Vector3(-x2, yBottom + c, z2 - b),
      new THREE.Vector3(x2, yBottom + c, z2 - b),
    ].map((v, i) => {
      const v1 = rotateAroundAxis(v, hCD1, axisCD, rot);
      if (i < 2) return v1;
      return rotateAroundAxis(v1, curTop1, axisCD, rot);
    });
    const top = createPolygonMeshAndLines(topV, 0xbae6fd, 0x0369a1);
    meshes.push(top.mesh);
    lines.push(top.line);
    addHingeMarker(curTop1, curTop2);

    metrics.push(
      { label: 'Kích thước hộp a × b × c', value: `${a} × ${b} × ${c} cm`, description: 'Chiều dài, chiều rộng và chiều cao' },
      { label: 'Góc xoay các cánh bản lề', value: `${(t * 90).toFixed(1)}°`, description: 'Góc mở phẳng 90 độ' },
      { label: 'Bảo toàn độ dài cạnh', value: '100% chính xác', description: 'Không bị méo mó hay biến dạng hình học' }
    );
  }

  // 3. REGULAR SQUARE PYRAMID (Chóp tứ giác đều)
  else if (modelId === 'regular_pyramid') {
    const a = params.a ?? 3.5;
    const h = params.h ?? 3.8;
    const a2 = a / 2;
    const yBottom = -h / 3;

    // Dihedral angle between lateral triangular face and base plane
    // tan(theta) = h / (a/2) => theta in radians
    const thetaDihedral = Math.atan2(h, a2);
    // Total opening angle from 3D to 2D flat plane: pi - thetaDihedral
    const rot = t * (Math.PI - thetaDihedral);

    // Square base ABCD
    const baseV = [
      new THREE.Vector3(-a2, yBottom, -a2), // A
      new THREE.Vector3(a2, yBottom, -a2),  // B
      new THREE.Vector3(a2, yBottom, a2),   // C
      new THREE.Vector3(-a2, yBottom, a2),  // D
    ];
    const base = createPolygonMeshAndLines(baseV, 0xeab308, 0xca8a04);
    meshes.push(base.mesh);
    lines.push(base.line);

    const apex3D = new THREE.Vector3(0, yBottom + h, 0);

    // Flap 1: SAB hinged on AB (rotate around axis AB)
    const hAB = baseV[0];
    const axisAB = new THREE.Vector3(-1, 0, 0);
    const apexAB = rotateAroundAxis(apex3D, hAB, axisAB, rot);
    const sabV = [baseV[0], baseV[1], apexAB];
    const sab = createPolygonMeshAndLines(sabV, 0xfacc15, 0xca8a04);
    meshes.push(sab.mesh);
    lines.push(sab.line);
    addHingeMarker(baseV[0], baseV[1]);

    // Flap 2: SBC hinged on BC
    const hBC = baseV[1];
    const axisBC = new THREE.Vector3(0, 0, 1);
    const apexBC = rotateAroundAxis(apex3D, hBC, axisBC, rot);
    const sbcV = [baseV[1], baseV[2], apexBC];
    const sbc = createPolygonMeshAndLines(sbcV, 0xfde047, 0xca8a04);
    meshes.push(sbc.mesh);
    lines.push(sbc.line);
    addHingeMarker(baseV[1], baseV[2]);

    // Flap 3: SCD hinged on CD
    const hCD = baseV[2];
    const axisCD = new THREE.Vector3(1, 0, 0);
    const apexCD = rotateAroundAxis(apex3D, hCD, axisCD, rot);
    const scdV = [baseV[2], baseV[3], apexCD];
    const scd = createPolygonMeshAndLines(scdV, 0xfacc15, 0xca8a04);
    meshes.push(scd.mesh);
    lines.push(scd.line);
    addHingeMarker(baseV[2], baseV[3]);

    // Flap 4: SDA hinged on DA
    const hDA = baseV[3];
    const axisDA = new THREE.Vector3(0, 0, -1);
    const apexDA = rotateAroundAxis(apex3D, hDA, axisDA, rot);
    const sdaV = [baseV[3], baseV[0], apexDA];
    const sda = createPolygonMeshAndLines(sdaV, 0xfde047, 0xca8a04);
    meshes.push(sda.mesh);
    lines.push(sda.line);
    addHingeMarker(baseV[3], baseV[0]);

    const slantEdge = Math.sqrt(h * h + (a * a) / 2);
    const trungDoan = Math.sqrt(h * h + a2 * a2);
    const currentAngleDeg = ((1 - t) * (thetaDihedral * 180 / Math.PI)).toFixed(1);

    metrics.push(
      { label: 'Cạnh đáy hình vuông a', value: `${a} cm`, description: 'Cạnh bản lề cố định của mỗi tam giác' },
      { label: 'Độ dài cạnh bên SA = SB = SC = SD', value: `${slantEdge.toFixed(2)} cm`, description: 'Giữ nguyên độ dài tuyệt đối khi mở' },
      { label: 'Trung đoạn d (đường cao mặt bên)', value: `${trungDoan.toFixed(2)} cm`, description: 'Đường cao của 4 cánh hoa tam giác' },
      { label: 'Góc nghiêng mặt bên hiện tại', value: `${currentAngleDeg}°`, description: 'Từ góc nhị diện 3D về 0° (trải phẳng)' }
    );
  }

  // 4. TRIANGULAR PYRAMID / TETRAHEDRON (Chóp tam giác / tứ diện đều)
  else if (modelId === 'triangular_pyramid' || modelId === 'regular_tetrahedron') {
    const a = params.a ?? 3.5;
    const h = params.h ?? (a * Math.sqrt(6) / 3);
    const rBase = a / Math.sqrt(3);
    const yBottom = -h / 3;

    // Equilateral base triangle ABC
    const angles = [Math.PI / 2, (7 * Math.PI) / 6, (11 * Math.PI) / 6];
    const baseV = angles.map((ang) => new THREE.Vector3(rBase * Math.cos(ang), yBottom, rBase * Math.sin(ang)));
    const base = createPolygonMeshAndLines(baseV, 0xf59e0b, 0xd97706);
    meshes.push(base.mesh);
    lines.push(base.line);

    const apex3D = new THREE.Vector3(0, yBottom + h, 0);
    const inRadius = a / (2 * Math.sqrt(3));
    const thetaDihedral = Math.atan2(h, inRadius);
    const rot = t * (Math.PI - thetaDihedral);

    // 3 lateral triangles hinged on AB, BC, CA
    for (let i = 0; i < 3; i++) {
      const p1 = baseV[i];
      const p2 = baseV[(i + 1) % 3];
      const axis = new THREE.Vector3().subVectors(p2, p1).normalize();
      const apexRot = rotateAroundAxis(apex3D, p1, axis, -rot);
      const flapV = [p1, p2, apexRot];
      const flap = createPolygonMeshAndLines(flapV, 0xfcd34d, 0xd97706);
      meshes.push(flap.mesh);
      lines.push(flap.line);
      addHingeMarker(p1, p2);
    }

    metrics.push(
      { label: 'Cạnh tam giác đáy a', value: `${a} cm`, description: 'Độ dài 3 cạnh bản lề' },
      { label: 'Góc mở mặt bên', value: `${((thetaDihedral * (1 - t)) * 180 / Math.PI).toFixed(1)}°`, description: 'Góc nhị diện hạ dần về 0° phẳng' }
    );
  }

  // 5. TRIANGULAR PRISM (Lăng trụ tam giác)
  else if (modelId === 'triangular_prism') {
    const a = params.a ?? 3;
    const h = params.h ?? 4;
    const yBottom = -h / 2;
    const rot = t * (Math.PI / 2);

    // Central rectangular face (width a, height h) lying flat at y = yBottom
    const p1 = new THREE.Vector3(-a / 2, yBottom, 0);
    const p2 = new THREE.Vector3(a / 2, yBottom, 0);
    const p3 = new THREE.Vector3(a / 2, yBottom + h, 0);
    const p4 = new THREE.Vector3(-a / 2, yBottom + h, 0);
    const centerFace = createPolygonMeshAndLines([p1, p2, p3, p4], 0x06b6d4, 0x0891b2);
    meshes.push(centerFace.mesh);
    lines.push(centerFace.line);

    // Left and right rectangular faces rotating around the long edges
    const leftAxis = new THREE.Vector3(0, 1, 0);
    const leftFaceV = [
      p4.clone(),
      p1.clone(),
      rotateAroundAxis(new THREE.Vector3(-a / 2 - a, yBottom, 0), p1, leftAxis, rot),
      rotateAroundAxis(new THREE.Vector3(-a / 2 - a, yBottom + h, 0), p4, leftAxis, rot),
    ];
    const leftFace = createPolygonMeshAndLines(leftFaceV, 0x22d3ee, 0x0891b2);
    meshes.push(leftFace.mesh);
    lines.push(leftFace.line);
    addHingeMarker(p1, p4);

    const rightAxis = new THREE.Vector3(0, -1, 0);
    const rightFaceV = [
      p2.clone(),
      p3.clone(),
      rotateAroundAxis(new THREE.Vector3(a / 2 + a, yBottom + h, 0), p3, rightAxis, rot),
      rotateAroundAxis(new THREE.Vector3(a / 2 + a, yBottom, 0), p2, rightAxis, rot),
    ];
    const rightFace = createPolygonMeshAndLines(rightFaceV, 0x22d3ee, 0x0891b2);
    meshes.push(rightFace.mesh);
    lines.push(rightFace.line);
    addHingeMarker(p2, p3);

    // Triangular base lids
    const th = (a * Math.sqrt(3)) / 2;
    const topTriApex = rotateAroundAxis(new THREE.Vector3(0, yBottom + h, th), p3, new THREE.Vector3(1, 0, 0), rot);
    const topTri = createPolygonMeshAndLines([p4, p3, topTriApex], 0x67e8f9, 0x0891b2);
    meshes.push(topTri.mesh);
    lines.push(topTri.line);

    const botTriApex = rotateAroundAxis(new THREE.Vector3(0, yBottom, th), p2, new THREE.Vector3(-1, 0, 0), rot);
    const botTri = createPolygonMeshAndLines([p1, p2, botTriApex], 0x67e8f9, 0x0891b2);
    meshes.push(botTri.mesh);
    lines.push(botTri.line);

    metrics.push(
      { label: 'Cạnh tam giác a', value: `${a} cm`, description: 'Cạnh của lăng trụ đều' },
      { label: 'Chiều cao lăng trụ h', value: `${h} cm`, description: 'Chiều dài dải 3 hình chữ nhật' }
    );
  }

  // 6. CONE (Hình nón - Unrolling into Circular Sector)
  else if (modelId === 'cone') {
    const r = params.r ?? 2.2;
    const h = params.h ?? 3.8;
    const l = Math.sqrt(r * r + h * h); // Đường sinh (slant height)
    const sectorAngleRad = 2 * Math.PI * (r / l); // theta = 2pi * (r / l)
    const sectorAngleDeg = (r / l) * 360;

    // Smooth developable surface unrolling:
    // At t=0: standard 3D cone with angle 2*PI, height h, radius r.
    // At t=1: flat circular sector with angle sectorAngleRad, height 0, radius l.
    const curTheta = 2 * Math.PI * (1 - t) + sectorAngleRad * t;
    const curR = (curTheta * l) / (2 * Math.PI); // preserved arc length C = theta * l
    const curH = Math.sqrt(Math.max(0, l * l - curR * curR));

    const segU = 36;
    const segV = 8;
    const positions: number[] = [];

    for (let j = 0; j < segV; j++) {
      const v1 = j / segV;
      const v2 = (j + 1) / segV;

      for (let i = 0; i < segU; i++) {
        const u1 = i / segU;
        const u2 = (i + 1) / segU;

        const ang1 = curTheta * (u1 - 0.5);
        const ang2 = curTheta * (u2 - 0.5);

        // Quad vertices on cone / unrolled surface
        const p11 = [v1 * curR * Math.sin(ang1), (1 - v1) * curH - h / 3, v1 * curR * Math.cos(ang1)];
        const p12 = [v2 * curR * Math.sin(ang1), (1 - v2) * curH - h / 3, v2 * curR * Math.cos(ang1)];
        const p21 = [v1 * curR * Math.sin(ang2), (1 - v1) * curH - h / 3, v1 * curR * Math.cos(ang2)];
        const p22 = [v2 * curR * Math.sin(ang2), (1 - v2) * curH - h / 3, v2 * curR * Math.cos(ang2)];

        // Tri 1
        positions.push(...p11, ...p12, ...p22);
        // Tri 2
        positions.push(...p11, ...p22, ...p21);
      }
    }

    const coneGeom = new THREE.BufferGeometry();
    coneGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    coneGeom.computeVertexNormals();

    const coneMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const coneMesh = new THREE.Mesh(coneGeom, coneMat);
    meshes.push(coneMesh);

    // Boundary wireframe lines
    const boundaryPts: THREE.Vector3[] = [new THREE.Vector3(0, curH - h / 3, 0)];
    for (let i = 0; i <= segU; i++) {
      const u = i / segU;
      const ang = curTheta * (u - 0.5);
      boundaryPts.push(new THREE.Vector3(curR * Math.sin(ang), -h / 3, curR * Math.cos(ang)));
    }
    boundaryPts.push(new THREE.Vector3(0, curH - h / 3, 0));
    const boundaryLineGeo = new THREE.BufferGeometry().setFromPoints(boundaryPts);
    const boundaryLineMat = new THREE.LineBasicMaterial({ color: 0xd97706, linewidth: 2 });
    lines.push(new THREE.Line(boundaryLineGeo, boundaryLineMat));

    // Base circular disc (tilts downward on hinge point to lie flat at t=1)
    const basePtsCount = 32;
    const discPos: number[] = [];
    const discCenterY = -h / 3;
    // Hinge at boundary point (u=0.5, ang=0) => (0, discCenterY, curR)
    const hingePoint = new THREE.Vector3(0, discCenterY, curR);
    const discTilt = t * (Math.PI / 2);

    for (let i = 0; i < basePtsCount; i++) {
      const a1 = (i * 2 * Math.PI) / basePtsCount;
      const a2 = ((i + 1) * 2 * Math.PI) / basePtsCount;

      const pCenter = rotateAroundAxis(new THREE.Vector3(0, discCenterY, 0), hingePoint, new THREE.Vector3(1, 0, 0), discTilt);
      const p1 = rotateAroundAxis(new THREE.Vector3(r * Math.sin(a1), discCenterY, r * Math.cos(a1)), hingePoint, new THREE.Vector3(1, 0, 0), discTilt);
      const p2 = rotateAroundAxis(new THREE.Vector3(r * Math.sin(a2), discCenterY, r * Math.cos(a2)), hingePoint, new THREE.Vector3(1, 0, 0), discTilt);

      discPos.push(pCenter.x, pCenter.y, pCenter.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }

    const discGeom = new THREE.BufferGeometry();
    discGeom.setAttribute('position', new THREE.Float32BufferAttribute(discPos, 3));
    discGeom.computeVertexNormals();
    const discMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      roughness: 0.4,
      transparent: true,
      opacity: 0.85,
    });
    meshes.push(new THREE.Mesh(discGeom, discMat));

    metrics.push(
      { label: 'Bán kính hình quạt tròn R = l', value: `${l.toFixed(2)} cm`, description: 'Đúng bằng độ dài đường sinh l = √(h² + r²)' },
      { label: 'Góc ở tâm hình quạt θ', value: `${sectorAngleDeg.toFixed(1)}°`, description: 'Công thức chính xác: 360° × (r / l)' },
      { label: 'Chu vi cung quạt tròn', value: `${(2 * Math.PI * r).toFixed(2)} cm`, description: 'Đúng bằng chu vi đường tròn đáy 2πr' },
      { label: 'Bán kính hình tròn đáy r', value: `${r} cm`, description: 'Hình tròn đáy gập phẳng cạnh hình quạt' }
    );
  }

  // 7. CYLINDER (Hình trụ - Unrolling into 2πr × h Rectangle)
  else if (modelId === 'cylinder') {
    const r = params.r ?? 2;
    const h = params.h ?? 3.5;
    const width = 2 * Math.PI * r;

    // Unrolling angle from 2*PI down to 0 (flat sheet)
    const curTheta = 2 * Math.PI * (1 - t);
    const curR = curTheta > 0.05 ? width / curTheta : 1000;

    const segU = 36;
    const positions: number[] = [];

    for (let i = 0; i < segU; i++) {
      const u1 = i / segU;
      const u2 = (i + 1) / segU;

      let p1_bot: [number, number, number];
      let p1_top: [number, number, number];
      let p2_bot: [number, number, number];
      let p2_top: [number, number, number];

      if (curTheta > 0.05) {
        const a1 = curTheta * (u1 - 0.5);
        const a2 = curTheta * (u2 - 0.5);
        p1_bot = [curR * Math.sin(a1), -h / 2, curR * Math.cos(a1) - curR + r];
        p1_top = [curR * Math.sin(a1), h / 2, curR * Math.cos(a1) - curR + r];
        p2_bot = [curR * Math.sin(a2), -h / 2, curR * Math.cos(a2) - curR + r];
        p2_top = [curR * Math.sin(a2), h / 2, curR * Math.cos(a2) - curR + r];
      } else {
        const x1 = (u1 - 0.5) * width;
        const x2 = (u2 - 0.5) * width;
        p1_bot = [x1, -h / 2, r];
        p1_top = [x1, h / 2, r];
        p2_bot = [x2, -h / 2, r];
        p2_top = [x2, h / 2, r];
      }

      positions.push(...p1_bot, ...p1_top, ...p2_top);
      positions.push(...p1_bot, ...p2_top, ...p2_bot);
    }

    const cylGeom = new THREE.BufferGeometry();
    coneGeomSetPos(cylGeom, positions);
    const cylMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    meshes.push(new THREE.Mesh(cylGeom, cylMat));

    // Two circular base lids
    const discPosTop: number[] = [];
    const discPosBot: number[] = [];
    const tilt = t * (Math.PI / 2);
    const hingeTop = new THREE.Vector3(0, h / 2, r);
    const hingeBot = new THREE.Vector3(0, -h / 2, r);

    for (let i = 0; i < 28; i++) {
      const a1 = (i * 2 * Math.PI) / 28;
      const a2 = ((i + 1) * 2 * Math.PI) / 28;

      // Top lid tilts up
      const pt_center = rotateAroundAxis(new THREE.Vector3(0, h / 2, 0), hingeTop, new THREE.Vector3(1, 0, 0), -tilt);
      const pt_1 = rotateAroundAxis(new THREE.Vector3(r * Math.sin(a1), h / 2, r * Math.cos(a1)), hingeTop, new THREE.Vector3(1, 0, 0), -tilt);
      const pt_2 = rotateAroundAxis(new THREE.Vector3(r * Math.sin(a2), h / 2, r * Math.cos(a2)), hingeTop, new THREE.Vector3(1, 0, 0), -tilt);
      discPosTop.push(pt_center.x, pt_center.y, pt_center.z, pt_1.x, pt_1.y, pt_1.z, pt_2.x, pt_2.y, pt_2.z);

      // Bottom lid tilts down
      const pb_center = rotateAroundAxis(new THREE.Vector3(0, -h / 2, 0), hingeBot, new THREE.Vector3(1, 0, 0), tilt);
      const pb_1 = rotateAroundAxis(new THREE.Vector3(r * Math.sin(a1), -h / 2, r * Math.cos(a1)), hingeBot, new THREE.Vector3(1, 0, 0), tilt);
      const pb_2 = rotateAroundAxis(new THREE.Vector3(r * Math.sin(a2), -h / 2, r * Math.cos(a2)), hingeBot, new THREE.Vector3(1, 0, 0), tilt);
      discPosBot.push(pb_center.x, pb_center.y, pb_center.z, pb_1.x, pb_1.y, pb_1.z, pb_2.x, pb_2.y, pb_2.z);
    }

    const gTop = new THREE.BufferGeometry();
    coneGeomSetPos(gTop, discPosTop);
    meshes.push(new THREE.Mesh(gTop, cylMat));

    const gBot = new THREE.BufferGeometry();
    coneGeomSetPos(gBot, discPosBot);
    meshes.push(new THREE.Mesh(gBot, cylMat));

    metrics.push(
      { label: 'Chiều dài tấm chữ nhật phẳng 2πr', value: `${width.toFixed(2)} cm`, description: 'Chu vi vòng tròn đáy' },
      { label: 'Chiều rộng tấm chữ nhật h', value: `${h} cm`, description: 'Bằng chính chiều cao hình trụ' },
      { label: 'Hai đáy hình tròn bán kính r', value: `${r} cm`, description: 'Gấp phẳng ở hai mép trên và dưới' }
    );
  }

  // Fallback for shapes without net
  else {
    metrics.push({
      label: 'Thông báo hình học',
      value: 'Mô hình không thể trải phẳng',
      description: 'Hình dạng này không có cách khai triển trải phẳng mà không bị biến dạng.',
    });
  }

  return { meshes, lines, hingeMarkers, metrics };
}

function coneGeomSetPos(geom: THREE.BufferGeometry, posArray: number[]) {
  geom.setAttribute('position', new THREE.Float32BufferAttribute(posArray, 3));
  geom.computeVertexNormals();
}
