
export default function HumanBody3D() {
  return (
    <section className="bone-model-section">
      <h2>3D Skeletal System</h2>
      <p>Interactive Human Skeleton Visualization</p>

      <div className="bone-model-viewer">
        <iframe
          title="Male Skeleton - Sketchfab"
          src="https://sketchfab.com/models/7ae059d4a29844e78fd2f97978bd886a/embed"
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
          loading="lazy"
        />
      </div>

      <small>
        3D Model by LeoVitalis on Sketchfab
      </small>
    </section>
  );
}
