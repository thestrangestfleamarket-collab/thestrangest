// MIDNIGHT CRUMBS' libraries for its classic scripts: three (with GLTFLoader, SkeletonUtils, BufferGeometryUtils) and Rapier as globals
import * as T from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import RAPIER from '@dimforge/rapier3d-compat';
window.THREE = Object.assign({}, T, { GLTFLoader, SkeletonUtils, BufferGeometryUtils });
window.RAPIER = RAPIER;
