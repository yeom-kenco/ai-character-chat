const SNOWFLAKE_COUNT = 50;

function generateSnowflakes() {
  return Array.from({ length: SNOWFLAKE_COUNT }, (_, i) => {
    const size = (Math.random() * 4 + 1) * 0.2;
    const left = Math.random() * 100;
    const driftStart = (Math.random() * 20 - 10);
    const driftEnd = (Math.random() * 20 - 10);
    const duration = 5 + Math.random() * 10;
    const delay = -(Math.random() * 10);
    const blur = i % 6 === 0;

    return (
      <div
        key={i}
        className="snowflake"
        style={{
          width: `${size}vw`,
          height: `${size}vw`,
          left: `${left}vw`,
          opacity: blur ? 0.5 : 0.8,
          filter: blur ? 'blur(1px)' : undefined,
          ['--drift-start' as string]: `${driftStart}vw`,
          ['--drift-end' as string]: `${driftEnd}vw`,
          animation: `snowfall ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
        }}
      />
    );
  });
}

const snowflakes = generateSnowflakes();

export default function SnowBackground() {
  return (
    <div className="snow-bg">
      {snowflakes}
    </div>
  );
}
