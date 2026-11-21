// helicopter.js — CONDOR-1: hover/oscillate above player, spotlight cone + ground circle.
import * as THREE from 'three';
export function createHelicopter(G) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.6, 5.2), new THREE.MeshLambertMaterial({ color: 0x22304a })); group.add(body);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 4), new THREE.MeshLambertMaterial({ color: 0x22304a })); tail.position.set(0, 0.3, -4.2); group.add(tail);
  const rotor = new THREE.Mesh(new THREE.BoxGeometry(9, 0.08, 0.5), new THREE.MeshLambertMaterial({ color: 0x111111 })); rotor.position.y = 1.1; rotor.name = 'rotor'; group.add(rotor);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(9, 34, 14, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
  cone.position.y = -18; group.add(cone);
  const circle = new THREE.Mesh(new THREE.CircleGeometry(8, 20), new THREE.MeshBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.3, depthWrite: false }));
  circle.rotation.x = -Math.PI / 2; G.scene.add(circle);
  group.visible = false; circle.visible = false; G.scene.add(group);
  const heli = { group, circle, active: false, angle: 0,
    setActive(on) { heli.active = on; group.visible = on; circle.visible = on; },
    update(dt) {
      const want = G.wanted && G.wanted.stars >= 4;
      if (want !== heli.active) heli.setActive(want);
      if (!heli.active || !G.playerObj) return;
      heli.angle += dt * 0.7; rotor.rotation.y += dt * 22;
      const p = G.playerObj.pos();
      const tx = p.x + Math.cos(heli.angle) * 12, tz = p.z + Math.sin(heli.angle) * 12;
      group.position.lerp(new THREE.Vector3(tx, 34 + Math.sin(heli.angle * 2) * 2, tz), Math.min(1, dt * 1.5));
      group.lookAt(p.x, 0, p.z);
      circle.position.set(p.x, 0.35, p.z);
      // Searchlight keeps the player "seen" for the wanted system
      if (G.wanted && Math.hypot(group.position.x - p.x, group.position.z - p.z) < 30) { G.wanted.lastSeen.set(p.x, 0, p.z); }
    },
    placeAbove(x, z) { group.position.set(x + 8, 34, z + 6); heli.setActive(true); circle.position.set(x, 0.35, z); circle.visible = true; },
  };
  return heli;
}
