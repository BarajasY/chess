import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { scene } from './main';

const loader = new OBJLoader();

loader.load("../assets/Pawn.obj", function(object) {
    scene.add(object)
})
