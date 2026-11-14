import { Component, Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";

const MODEL_BASE = "https://cdn.jsdelivr.net/gh/SeemaBansal1/3d-human-body-anatomy@main/web/public/models";
useGLTF.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");

const LAYERS = [
  { id: "skeleton", label: "Skeleton", color: "#e8d8b5" },
  { id: "organs", label: "Organs", color: "#e88a91" },
  { id: "muscles", label: "Muscles", color: "#c96b70" },
  { id: "arteries", label: "Arteries", color: "#e45d69" },
  { id: "veins", label: "Veins", color: "#6597e8" },
  { id: "nerves", label: "Nerves", color: "#e8d06a" },
  { id: "skin", label: "Skin", color: "#d6a07e" }
];

function ModelLayer({ layer, onSelect }) {
  const { scene } = useGLTF(`${MODEL_BASE}/${layer}.glb`);
  const model = useMemo(() => scene.clone(true), [scene]);

  return (
    <primitive
      object={model}
      onPointerDown={(event) => {
        event.stopPropagation();
        const object = event.object;
        const name = object.userData?.zname || object.name || "Anatomical structure";
        onSelect({ name, layer });
      }}
    />
  );
}

function LoadingModel() {
  return (
    <Html center>
      <div className="body3d-loading">Loading anatomical layers…</div>
    </Html>
  );
}

function AnatomyScene({ visibleLayers, onSelect }) {
  return (
    <>
      <color attach="background" args={["#061522"]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 6, 5]} intensity={2.1} />
      <directionalLight position={[-4, 2, -3]} intensity={1.1} color="#7edbd8" />
      <Suspense fallback={<LoadingModel />}>
        <group position={[0, 0, 0]} scale={1}>
          {visibleLayers.map((layer) => (
            <ModelLayer key={layer} layer={layer} onSelect={onSelect} />
          ))}
        </group>
      </Suspense>
      <OrbitControls
        makeDefault
        target={[0, 0.86, 0]}
        minDistance={1.2}
        maxDistance={7}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}


class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="body3d-error">
          <h3>3D model could not load</h3>
          <p>The anatomy assets could not be reached. Check the connection and reload ASTRA.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function classifyStructure(name) {
  if (/heart|atrium|ventricle|myocard|coronary/i.test(name)) return "heart";
  if (/lung|bronch/i.test(name)) return "lungs";
  if (/brain|cerebell|cerebrum|cortex|medulla|pons/i.test(name)) return "brain";
  return "other";
}

export default function HumanBody3D({ cardiovascular }) {
  const [visibleLayers, setVisibleLayers] = useState(["skeleton", "organs"]);
  const [selected, setSelected] = useState(null);

  const selectedSystem = selected ? classifyStructure(selected.name) : null;
  const cardio = cardiovascular?.data || {};

  function toggleLayer(id) {
    setVisibleLayers((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function openCardiovascular() {
    document.getElementById("cardiovascular")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="anatomy-atlas">
      <div className="atlas-header">
        <div className="atlas-heading">
          <span className="organ-label">ASTRA MEDICAL INTERFACE</span>
          <h2>Interactive Human Anatomy</h2>
          <p>Rotate, zoom and select anatomical structures. Toggle layers to explore the body.</p>
        </div>
        <span className="atlas-instructions">Drag to rotate · Scroll to zoom · Click a structure</span>
      </div>

      <div className="body3d-layout">
        <div className="body3d-viewer">
          <ModelErrorBoundary>
            <Canvas
              camera={{ position: [0, 1.05, 3.7], fov: 38, near: 0.01, far: 100 }}
              dpr={[1, 1.6]}
              onCreated={({ gl }) => {
                gl.setClearColor("#061522");
              }}
            >
              <AnatomyScene visibleLayers={visibleLayers} onSelect={setSelected} />
            </Canvas>
          </ModelErrorBoundary>
          <div className="body3d-viewer-label">FULL BODY · 3D ANATOMY</div>
        </div>

        <aside className="body3d-sidebar">
          <div className="body3d-panel-title">ANATOMICAL LAYERS</div>
          <div className="body3d-layer-list">
            {LAYERS.map((layer) => (
              <button
                type="button"
                key={layer.id}
                className={`body3d-layer ${visibleLayers.includes(layer.id) ? "active" : ""}`}
                onClick={() => toggleLayer(layer.id)}
                aria-pressed={visibleLayers.includes(layer.id)}
              >
                <span className="body3d-layer-dot" style={{ background: layer.color }} />
                <span>{layer.label}</span>
                <span className="body3d-layer-state">{visibleLayers.includes(layer.id) ? "ON" : "OFF"}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="body3d-reset"
            onClick={() => {
              setVisibleLayers(["skeleton", "organs"]);
              setSelected(null);
            }}
          >
            RESET VIEW
          </button>

          <div className="body3d-selection">
            <div className="body3d-panel-title">SELECTED STRUCTURE</div>
            {selected ? (
              <>
                <h3>{selected.name}</h3>
                <p className="body3d-selected-layer">{selected.layer.toUpperCase()}</p>
                {selectedSystem === "heart" && (
                  <div className="body3d-health-data">
                    <div><span>Heart rate</span><strong>{cardiovascular?.validation?.status === "VALID" ? `${cardio.heart_rate_bpm ?? "—"} bpm` : "No validated reading"}</strong></div>
                    <div><span>HRV</span><strong>{cardiovascular?.validation?.status === "VALID" ? `${cardio.hrv_ms ?? "—"} ms` : "—"}</strong></div>
                    <div><span>SpO₂</span><strong>{cardiovascular?.validation?.status === "VALID" ? `${cardio.spo2_percent ?? "—"}%` : "—"}</strong></div>
                    <button type="button" onClick={openCardiovascular}>OPEN CARDIOVASCULAR DATA →</button>
                  </div>
                )}
                {selectedSystem === "lungs" && <p className="body3d-note">SpO₂ is a blood-oxygen measurement, not a direct lung-function test. No pulmonary-specific API readings are currently connected.</p>}
                {selectedSystem === "brain" && <p className="body3d-note">Anatomical selection only. ASTRA currently has no validated neurological measurements connected.</p>}
                {selectedSystem === "other" && <p className="body3d-note">Anatomical structure selected. No dedicated health-data endpoint is connected for this structure.</p>}
              </>
            ) : (
              <p className="body3d-note">Click the heart, brain, lungs or another visible structure to inspect it.</p>
            )}
          </div>
        </aside>
      </div>

      <div className="atlas-footer">
        <span>ASTRA HEALTH / MEDICAL VISUALIZATION</span>
        <span>Educational reference · Not a diagnostic tool</span>
      </div>
      <p className="body3d-attribution">3D anatomy data: Z-Anatomy / BodyParts3D. See ANATOMY_ATTRIBUTION.txt for license and attribution details.</p>
    </section>
  );
}
