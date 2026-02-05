import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

const gui = new GUI({ width: 250 })
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

const parameters = {}
parameters.count = 100000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColour = '#ff6030'
parameters.outsideColour = '#1b3984'

let geometry = null
let material = null
let points = null
let glowMaterial = null
let glowPoints = null

scene.fog = new THREE.FogExp2('#000011', 0.05)

const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#000011')

const starGeometry = new THREE.BufferGeometry()
const starCount = 2000
const starPositions = new Float32Array(starCount * 3)

for (let i = 0; i < starCount * 3; i++) {
  starPositions[i] = (Math.random() - 0.5) * 200
}

starGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(starPositions, 3)
)

const starMaterial = new THREE.PointsMaterial({
  color: '#ffffff',
  size: 0.5,
  sizeAttenuation: true
})

const starField = new THREE.Points(starGeometry, starMaterial)
scene.add(starField)

const generateGalaxy = () => {
  if (points !== null) {
    geometry.dispose()
    material.dispose()
    scene.remove(points)
  }

  if (glowPoints !== null) {
    glowMaterial.dispose()
    scene.remove(glowPoints)
  }

  geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(parameters.count * 3)
  const colours = new Float32Array(parameters.count * 3)

  const colourInside = new THREE.Color(parameters.insideColour)
  const colourOutside = new THREE.Color(parameters.outsideColour)

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3
    const radius = Math.random() * parameters.radius
    const spinAngle = radius * parameters.spin
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1)

    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1)

    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1)

    positions[i3] =
      Math.cos(branchAngle + spinAngle) * radius + randomX
    positions[i3 + 1] = randomY
    positions[i3 + 2] =
      Math.sin(branchAngle + spinAngle) * radius + randomZ

    const mixedColour = colourInside.clone()
    mixedColour.lerp(colourOutside, radius / parameters.radius)

    colours[i3] = mixedColour.r
    colours[i3 + 1] = mixedColour.g
    colours[i3 + 2] = mixedColour.b
  }

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  )

  geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colours, 3)
  )

  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    opacity: 0.9
  })

  points = new THREE.Points(geometry, material)
  scene.add(points)

  glowMaterial = new THREE.PointsMaterial({
    size: parameters.size * 3,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    opacity: 0.2
  })

  glowPoints = new THREE.Points(geometry, glowMaterial)
  scene.add(glowPoints)
}

generateGalaxy()

gui
  .add(parameters, 'count')
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'size')
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'radius')
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'branches')
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'spin')
  .min(-5)
  .max(5)
  .step(0.001)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'randomness')
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'randomnessPower')
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy)
gui
  .addColor(parameters, 'insideColour')
  .onFinishChange(generateGalaxy)
gui
  .addColor(parameters, 'outsideColour')
  .onFinishChange(generateGalaxy)

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.rotateSpeed = 0.4
controls.zoomSpeed = 0.5
controls.minDistance = 2
controls.maxDistance = 12

const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  if (points) {
    points.rotation.y = elapsedTime * 0.02
  }
  if (glowPoints) {
    glowPoints.rotation.y = elapsedTime * 0.02
  }

  camera.position.y = 3 + Math.sin(elapsedTime * 0.2) * 0.2

  if (material) {
    material.size =
      parameters.size +
      Math.sin(elapsedTime * 0.5) * parameters.size * 0.3
  }
  if (glowMaterial) {
    glowMaterial.size =
      parameters.size * 3 +
      Math.sin(elapsedTime * 0.5) * parameters.size * 0.9
  }

  if (material) {
    const hueShift = (Math.sin(elapsedTime * 0.1) + 1) / 2
    material.color.setHSL(hueShift, 0.7, 0.5)
  }

  starField.rotation.y = elapsedTime * 0.005

  controls.update()
  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

tick()

