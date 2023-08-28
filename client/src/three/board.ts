import * as THREE from "three";

const geometry = new THREE.PlaneGeometry(2, 2);

export const whiteGeometry = new THREE.MeshStandardMaterial({color:"#e3dac9", side: THREE.DoubleSide});
export const blackGeometry = new THREE.MeshStandardMaterial({color:"black", side: THREE.DoubleSide});


export const MakeBoard = () => {
    //Array of single planes
    const boardMeshArr:THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>[] = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const mesh = new THREE.Mesh(geometry, ((i+j)%2) == 0 ? blackGeometry : whiteGeometry)
            mesh.position.set(j*2, -1, i*2);
            mesh.rotation.x = 1.55
            boardMeshArr.push(mesh);
        }
    }
    return boardMeshArr;
}
