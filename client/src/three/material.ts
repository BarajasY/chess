import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { scene } from './main';
import { setChessModel } from '../utils/sharedSignals';

const loader = new OBJLoader();

loader.load("../assets/Pawn.obj", function(object) {
    setChessModel(object)
})
