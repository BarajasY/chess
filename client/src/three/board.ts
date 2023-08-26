import * as THREE from "three";

const geometry = new THREE.PlaneGeometry(1, 1);

export const whiteGeometry = new THREE.MeshBasicMaterial({color:"white", side: THREE.DoubleSide});
export const blackGeometry = new THREE.MeshBasicMaterial({color:"black", side: THREE.DoubleSide});


export const MakeBoard = () => {
    //Array of single planes
    const boardMeshArr:THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const mesh = new THREE.Mesh(geometry, (i+j%2) == 0 ? blackGeometry : whiteGeometry)
            mesh.position.set(i, -2, j);
            mesh.rotation.x = 80
            boardMeshArr.push(mesh);
        }
    }
    return boardMeshArr;
}
