import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const FondoClaro = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles-light"
      init={particlesInit}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
      options={{
        fullScreen: { enable: false },
        background: { color: "#f8fafc" }, // Fondo blanco base
        fpsLimit: 60,
        particles: {
          color: { value: "#e2e8f0" }, // Puntos casi invisibles
          links: {
            color: "#cbd5e1", // Líneas de las ondas (gris muy suave)
            distance: 200,
            enable: true,
            opacity: 0.6,
            width: 1.5,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: { default: "out" },
            random: true,
            speed: 0.6, // Movimiento muy lento para efecto de respiración
            straight: false, // Permite que se curven suavemente
          },
          number: {
            density: { enable: true, area: 800 },
            value: 60, // Densidad perfecta para crear las líneas topográficas
          },
          opacity: { value: { min: 0.1, max: 0.3 } },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 2 } }, // Nodos muy pequeños
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "repulse", // Las ondas se apartan suavemente del cursor
            },
            resize: true,
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4,
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default FondoClaro;