import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";

const FondoExtravagante = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
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
        background: {
          color: "transparent", 
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "grab", // Conecta el mouse con la malla
            },
            onClick: {
              enable: true,
              mode: "push", // Explota más partículas al hacer clic
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 250,
              links: {
                opacity: 0.8,
                color: "#00ffff", // Líneas láser cian hacia tu cursor
              },
            },
            push: { quantity: 5 },
          },
        },
        particles: {
          color: {
            value: ["#00e5ff", "#bc13fe", "#ff8800", "#1e90ff"], // Cian, Morado, Naranja, Azul brillante
          },
          links: {
            color: "random", // Cada línea toma un color distinto
            distance: 120,
            enable: true,
            opacity: 0.6,
            width: 1.5,
            triangles: {
              enable: true, // ¡ESTO ES LO EXTRAVAGANTE! Crea un relleno de malla 3D entre los nodos
              opacity: 0.05,
            },
          },
          collisions: {
            enable: true, // Rebotan entre sí
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce", // Rebotan en los bordes para mantener la densidad
            },
            random: true,
            speed: 2.5, // Movimiento rápido y fluido
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 120, // Densidad muy alta para crear la "matriz"
          },
          opacity: {
            value: { min: 0.3, max: 0.9 },
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 0.1,
            },
          },
          shape: {
            type: ["circle", "triangle", "polygon"], // Formas mixtas
            polygon: { sides: 6 },
          },
          size: {
            value: { min: 2, max: 6 },
            animation: {
              enable: true,
              speed: 4,
              minimumValue: 1,
            },
          },
          twinkle: {
            particles: {
              enable: true, // Efecto de chispas/estrellas parpadeando
              color: "#ffffff",
              frequency: 0.05,
              opacity: 1,
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default FondoExtravagante;