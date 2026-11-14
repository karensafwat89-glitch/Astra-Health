
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const bodyParts = {
  brain: {
    name: "Brain",
    description: "Central nervous system monitoring.",
    metric: "Neurological monitoring"
  },
  heart: {
    name: "Heart",
    description: "Cardiovascular system monitoring.",
    metric: "Heart rate / HRV"
  },
  lungs: {
    name: "Lungs",
    description: "Respiratory system monitoring.",
    metric: "Oxygen saturation (SpO2)"
  },
  stomach: {
    name: "Digestive System",
    description: "Digestive system monitoring.",
    metric: "General health indicators"
  },
  body: {
    name: "Body",
    description: "General astronaut health overview.",
    metric: "Fatigue / Radiation"
  }
};

function Part({ position, scale, color, onClick, geometry = "sphere" }) {
  return (
    <mesh position={position} scale={scale} onClick={onClick}>
      {geometry === "capsule" ? (
        <capsuleGeometry args={[1, 1, 8, 16]} />
      ) : (
        <sphereGeometry args={[1, 32, 32]} />
      )}
      <meshStandardMaterial
        color={color}
        roughness={0.45}
        metalness={0.15}
      />
    </mesh>
  );
}

function HumanBody({ onSelect }) {
  const select = (part) => (event) => {
    event.stopPropagation();
    onSelect(part);
  };

  return (
    <group>
      {/* Head */}
      <Part
        position={[0, 2.35, 0]}
        scale={[0.38, 0.43, 0.34]}
        color="#b8d9e8"
        onClick={select("brain")}
      />

      {/* Neck */}
      <Part
        position={[0, 1.82, 0]}
        scale={[0.16, 0.2, 0.17]}
        color="#91b8ca"
      />

      {/* Torso */}
      <Part
        position={[0, 1.05, 0]}
        scale={[0.63, 0.82, 0.34]}
        color="#91b8ca"
        onClick={select("body")}
      />

      {/* Shoulders */}
      <Part position={[-0.68, 1.55, 0]} scale={[0.23, 0.25, 0.25]} color="#91b8ca" />
      <Part position={[0.68, 1.55, 0]} scale={[0.23, 0.25, 0.25]} color="#91b8ca" />

      {/* Arms */}
      <Part position={[-0.88, 0.95, 0]} scale={[0.17, 0.65, 0.17]} color="#91b8ca" />
      <Part position={[0.88, 0.95, 0]} scale={[0.17, 0.65, 0.17]} color="#91b8ca" />

      {/* Hands */}
      <Part position={[-0.9, 0.22, 0]} scale={[0.15, 0.2, 0.13]} color="#b8d9e8" />
      <Part position={[0.9, 0.22, 0]} scale={[0.15, 0.2, 0.13]} color="#b8d9e8" />

      {/* Legs */}
      <Part position={[-0.3, -0.15, 0]} scale={[0.23, 0.75, 0.23]} color="#91b8ca" />
      <Part position={[0.3, -0.15, 0]} scale={[0.23, 0.75, 0.23]} color="#91b8ca" />

      {/* Heart */}
      <Part
        position={[-0.12, 1.28, 0.34]}
        scale={[0.17, 0.2, 0.13]}
        color="#ff496c"
        onClick={select("heart")}
      />

      {/* Lungs */}
      <Part
        position={[-0.29, 1.48, 0.3]}
        scale={[0.2, 0.29, 0.12]}
        color="#55b9d6"
        onClick={select("lungs")}
      />
      <Part
        position={[0.29, 1.48, 0.3]}
        scale={[0.2, 0.29, 0.12]}
        color="#55b9d6"
        onClick={select("lungs")}
      />

      {/* Digestive system */}
      <Part
        position={[0.05, 0.65, 0.33]}
        scale={[0.24, 0.2, 0.13]}
        color="#e5a34b"
        onClick={select("stomach")}
      />
    </group>
  );
}

export default function HumanBody3D() {
  const [selected, setSelected] = useState("body");
  const info = bodyParts[selected];

  return (
    <div className="human-body-panel">
      <div className="human-body-view">
        <Canvas camera={{ position: [0, 1, 7], fov: 40 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[4, 5, 5]} intensity={2} />
          <pointLight position={[-4, 2, 3]} intensity={1} color="#55b9d6" />

          <HumanBody onSelect={setSelected} />

          <OrbitControls
            enablePan={false}
            minDistance={4}
            maxDistance={9}
          />
        </Canvas>
      </div>

      <div className="organ-info">
        <span className="organ-label">SELECTED SYSTEM</span>
        <h2>{info.name}</h2>
        <p>{info.description}</p>
        <div className="organ-metric">
          <span>MONITORING</span>
          <strong>{info.metric}</strong>
        </div>
        <p className="organ-hint">
          Select another body part to explore.
        </p>
      </div>
    </div>
  );
}

