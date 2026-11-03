const paths = Array.from({ length: 18 }, (_, index) => {
  const offset = index * 22

  return {
    id: index,
    d: `M${-180 - offset} 390 C${30 - offset} ${265 - offset} ${100 + offset} ${-30 + offset} ${350 + offset} 110 S${640 + offset} ${350 - offset} ${850 + offset} -40`,
  }
})

/** Decorative, low contrast market-like paths for the landing hero. */
export function BackgroundPaths() {
  return (
    <div className="landing-paths" aria-hidden="true">
      <svg viewBox="0 0 900 400" preserveAspectRatio="xMidYMid slice" fill="none">
        {paths.map((path, index) => (
          <path
            key={path.id}
            d={path.d}
            className="landing-path"
            style={{
              opacity: 0.3 + (index % 6) * 0.055,
              animationDelay: `${index * -1.4}s`,
            }}
          />
        ))}
      </svg>
    </div>
  )
}
