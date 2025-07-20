const RideauSvg = ({ color, dataGame }) => {
  return (
    <>
      <div
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden", // optionnel : coupe les débordements
        }}
      >
        <svg
          className="rideau"
          width="2046"
          height="2046"
          viewBox="0 0 2046 2046"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "250vw",
            height: "250vh",
            transform: "translate(-50%, -50%)",
            objectFit: "cover",
            opacity: "0.25",
          }}
        >
          <g clipPath="url(#clip0_133_2)">
            <path
              d="M513.413 -207.251L1023 1023L705.817 -286.948L513.413 -207.251Z"
              fill={color}
            />
            <path
              d="M1532.59 2253.25L1023 1023L1340.18 2332.95L1532.59 2253.25Z"
              fill={color}
            />
            <path
              d="M2253.25 513.413L1023 1023L2332.95 705.817L2253.25 513.413Z"
              fill={color}
            />
            <path
              d="M-207.251 1532.59L1023 1023L-286.947 1340.18L-207.251 1532.59Z"
              fill={color}
            />
            <path
              d="M1739.08 -705.765L1023 1023L2009.45 -593.775L1739.08 -705.765Z"
              fill={color}
            />
            <path
              d="M306.922 2751.76L1023 1023L36.5539 2639.77L306.922 2751.76Z"
              fill={color}
            />
            <path
              d="M2751.76 1739.08L1023 1023L2639.77 2009.45L2751.76 1739.08Z"
              fill={color}
            />
            <path
              d="M-705.765 306.922L1023 1023L-593.775 36.5544L-705.765 306.922Z"
              fill={color}
            />
            <path d="M1023 -64V1023L1193 -64H1023Z" fill={color} />
            <path d="M1023 2110V1023L853 2110H1023Z" fill={color} />
            <path
              d="M2110 1023L1023 1023L2110 1193L2110 1023Z"
              fill={color}
            />
            <path d="M-64 1023L1023 1023L-64 853L-64 1023Z" fill={color} />
            <path
              d="M2103.08 -57.082L1023 1023L2272 111.836L2103.08 -57.082Z"
              fill={color}
            />
            <path
              d="M-57.082 2103.08L1023 1023L-226 1934.16L-57.082 2103.08Z"
              fill={color}
            />
            <path
              d="M2103.08 2103.08L1023 1023L1934.16 2272L2103.08 2103.08Z"
              fill={color}
            />
            <path
              d="M-57.082 -57.082L1023 1023L111.836 -226L-57.082 -57.082Z"
              fill={color}
            />
            <g filter="url(#filter0_f_133_2)">
              <circle
                className="rideauCircle"
                cx="1022.5"
                cy="1023.5"
                r={dataGame == "play" ? 700 : 0}
                fill="white"
              />
            </g>
          </g>
          <defs>
            <filter
              id="filter0_f_133_2"
              x="0"
              y="0"
              width="10000"
              height="10000"
              filterUnits="userSpaceOnUse"
              colorinterpolation-filters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="50"
                result="effect1_foregroundBlur_133_2"
              />
            </filter>
          </defs>
        </svg>
      </div>
    </>
  );
};

export default RideauSvg;
