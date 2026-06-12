import { useCallback, memo } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";

const FondoClaro = memo(() => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  return (
    <div className="fondo-claro-wrapper">
      <style>{`
        .fondo-claro-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          background-color: #f3f7fa;
          overflow: hidden;
        }

        /* Luces atmosféricas de alta visibilidad */
        .weather-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px); /* Difuminado menor para que resalten más */
          pointer-events: none;
          mix-blend-mode: multiply;
          opacity: 0.48;
          animation: floatGlow 22s infinite alternate ease-in-out;
        }

        /* Sol Radiante (Oro) */
        .glow-sun {
          width: 650px;
          height: 650px;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.28) 0%, rgba(245, 158, 11, 0.05) 75%);
          top: -8%;
          right: -5%;
          animation-duration: 20s;
        }

        /* Lluvia Tropical (Cian) */
        .glow-rain {
          width: 750px;
          height: 750px;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.24) 0%, rgba(59, 130, 246, 0.05) 75%);
          bottom: -12%;
          left: -8%;
          animation-delay: -5s;
          animation-duration: 26s;
        }

        /* Viento Térmico (Lavanda) */
        .glow-wind {
          width: 550px;
          height: 550px;
          background: radial-gradient(circle, rgba(167, 139, 250, 0.22) 0%, rgba(139, 92, 246, 0.05) 75%);
          top: 35%;
          left: 25%;
          animation-delay: -10s;
        }

        /* Ondas / Corrientes atmosféricas fluidas de alta visibilidad */
        .weather-waves {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          opacity: 0.42;
          pointer-events: none;
          z-index: 1;
        }

        .wave-path {
          fill: none;
          stroke-linecap: round;
          filter: drop-shadow(0 0 10px rgba(14, 165, 233, 0.25));
          animation: pulseWave 15s infinite alternate ease-in-out;
        }

        @keyframes floatGlow {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(50px, -50px) scale(1.08);
          }
          100% {
            transform: translate(-30px, 40px) scale(0.92);
          }
        }

        @keyframes pulseWave {
          0% {
            transform: translateY(0px) scaleY(1);
          }
          50% {
            transform: translateY(-25px) scaleY(1.05);
          }
          100% {
            transform: translateY(15px) scaleY(0.95);
          }
        }
      `}</style>

      {/* Orbes de color de fondo notable */}
      <div className="weather-glow glow-sun"></div>
      <div className="weather-glow glow-rain"></div>
      <div className="weather-glow glow-wind"></div>

      {/* Grilla técnica y corrientes de aire fluidas */}
      <svg className="weather-waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wave-cyan-blue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="wave-orange-pink" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="wave-green-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Grilla técnica de latitud/longitud */}
        <g stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1">
          <line x1="0" y1="180" x2="1440" y2="180" />
          <line x1="0" y1="360" x2="1440" y2="360" />
          <line x1="0" y1="540" x2="1440" y2="540" />
          <line x1="0" y1="720" x2="1440" y2="720" />
          
          <line x1="240" y1="0" x2="240" y2="900" />
          <line x1="480" y1="0" x2="480" y2="900" />
          <line x1="720" y1="0" x2="720" y2="900" />
          <line x1="960" y1="0" x2="960" y2="900" />
          <line x1="1200" y1="0" x2="1200" y2="900" />
        </g>

        {/* Corrientes fluyentes con colores degradados notables */}
        <path className="wave-path" d="M -100,250 C 300,100 500,450 900,250 C 1200,100 1300,350 1600,250" stroke="url(#wave-cyan-blue)" strokeWidth="4" />
        <path className="wave-path" d="M -100,500 C 400,350 600,650 1000,450 C 1300,350 1400,550 1600,500" stroke="url(#wave-orange-pink)" strokeWidth="3.5" style={{ animationDelay: "-4s", animationDuration: "18s" }} />
        <path className="wave-path" d="M -100,750 C 350,650 550,850 950,700 C 1250,600 1350,800 1600,750" stroke="url(#wave-green-cyan)" strokeWidth="4.5" style={{ animationDelay: "-8s", animationDuration: "22s" }} />

        {/* Texto barométrico y coordenadas */}
        <g fill="rgba(100, 116, 139, 0.35)" fontSize="9.5" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.8px">
          <text x="30" y="870">S 0° 13' 24" / W 78° 29' 38"</text>
          <text x="1410" y="870" textAnchor="end">INAMHI - RED DE BIENES</text>
        </g>
      </svg>

      {/* Nodos y conexiones de red en tonos coloridos notables */}
      <Particles
        id="tsparticles-light"
        init={particlesInit}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 2,
        }}
        options={{
          fullScreen: { enable: false },
          background: { color: "transparent" },
          fpsLimit: 60,
          particles: {
            color: {
              value: ["#06b6d4", "#3b82f6", "#ec4899", "#10b981", "#f59e0b"],
            },
            links: {
              color: "#93c5fd", // Enlaces de red azulados suaves
              distance: 140,
              enable: true,
              opacity: 0.45,
              width: 1.2,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: { default: "bounce" },
              random: true,
              speed: 1.6, // Movimiento continuo notable
              straight: false,
            },
            number: {
              density: { enable: true, area: 800 },
              value: 65, // Cantidad ideal de nodos
            },
            opacity: {
              value: { min: 0.25, max: 0.7 },
              animation: {
                enable: true,
                speed: 1,
                minimumValue: 0.2,
              },
            },
            shape: { type: "circle" },
            size: {
              value: { min: 3, max: 6.5 }, // Nodos notablemente visibles
            },
          },
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "grab", // Interactividad magnética con cursor
              },
              onClick: {
                enable: true,
                mode: "push",
              },
              resize: true,
            },
            modes: {
              grab: {
                distance: 180,
                links: {
                  opacity: 0.7,
                  color: "#3b82f6",
                },
              },
              push: {
                quantity: 4,
              },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
});

export default FondoClaro;