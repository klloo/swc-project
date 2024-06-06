import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const WaveShaderMaterial = shaderMaterial(
  // Uniform
  {
    uMouse: new THREE.Vector2(0.5, 0.5),
    uTexture: new THREE.Texture(),
  },
  // Vertex Shader
  `
    precision mediump float;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  // Fragment Shader
  `
    precision mediump float;
    uniform vec2 uMouse;
    uniform sampler2D uTexture;
    varying vec2 vUv;

    vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 permute(vec4 x) {
        return mod289(((x * 34.0) + 1.0) * x);
    }

    vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
    }

    float snoise3(vec3 v) { 
        const vec2  C = vec2(1.0/6.0, 1.0/3.0);
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

        i = mod289(i); 
        vec4 p = permute(permute(permute( 
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0)) 
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 1.0 / 7.0;
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
    }

    void main() {
        vec2 uv = vUv;

        float noise = snoise3(vec3(vUv * uMouse * 1.5, 0));
        uv += vec2(noise, noise) * 0.08;

        // 텍스처 샘플링
        vec3 textureColor = texture2D(uTexture, uv).rgb;
        gl_FragColor = vec4(textureColor, 1.0);
    }
    `
);
extend({ WaveShaderMaterial });

function Background() {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const { viewport, mouse } = useThree();
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5));

  useFrame(() => {
    if (ref.current) {
      // 마우스 위치를 부드럽게 보간
      mouseRef.current.lerp(
        new THREE.Vector2(mouse.x * 0.7 + 0.7, mouse.y * 0.7 + 0.7),
        0.05
      );
      ref.current.uniforms.uMouse.value.copy(mouseRef.current);
    }
  });

  const [image] = useLoader(THREE.TextureLoader, ['/images/home-bg.jpg']);

  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height, 50, 50]} />
      <waveShaderMaterial side={THREE.DoubleSide} ref={ref} uTexture={image} />
    </mesh>
  );
}

export default Background;
