const logo = "/images/brand/logo-horizontal.webp";

export function Opening() {
  function skip() {
    document.documentElement.dataset.intro = "done";
    window.dispatchEvent(new Event("kmz:skip-intro"));
  }
  return (
    <>
      <svg className="intro-filters" aria-hidden="true" focusable="false">
        <defs>
          <filter
            id="kmz-logo-edge"
            x="-5%"
            y="-15%"
            width="110%"
            height="130%"
            colorInterpolationFilters="sRGB"
          >
            <feMorphology
              in="SourceAlpha"
              operator="dilate"
              radius="1.05"
              result="expanded"
            />
            <feComposite
              in="expanded"
              in2="SourceAlpha"
              operator="out"
              result="edge"
            />
            <feFlood floodColor="#F7F6F2" floodOpacity="0.9" result="ink" />
            <feComposite in="ink" in2="edge" operator="in" />
          </filter>
        </defs>
      </svg>
      <div className="brand-intro" aria-hidden="true">
        <div className="brand-intro__panel">
          <div className="brand-intro__mark">
            <img
              className="brand-intro__outline"
              src={logo}
              width="480"
              height="76"
              alt=""
              draggable={false}
            />
            <img
              className="brand-intro__fill"
              src={logo}
              width="480"
              height="76"
              alt=""
              draggable={false}
            />
          </div>
        </div>
      </div>
      <button type="button" className="intro-skip" onClick={skip}>
        Pular abertura <span aria-hidden="true">↗</span>
      </button>
    </>
  );
}

export function ReplayOpening() {
  function replay() {
    window.scrollTo({ top: 0, behavior: "instant" });
    window.dispatchEvent(new Event("kmz:replay-intro"));
  }
  return (
    <button type="button" className="intro-replay" onClick={replay}>
      <span aria-hidden="true">↻</span> Rever abertura
    </button>
  );
}
