import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";

const FondoBurbujas = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles-consultor"
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
              mode: "bubble", // Infla las burbujas bajo el mouse
            },
            onClick: {
              enable: true,
              mode: "push", // Genera más burbujas al hacer clic
            },
            resize: true,
          },
          modes: {
            bubble: {
              distance: 180,
              size: 14,
              opacity: 0.9,
              duration: 2,
              color: "#00d2ff" // Brillo cian en el cursor
            },
            push: {
              quantity: 4,
            },
          },
        },
        particles: {
          color: {
            value: ["#ffffff", "#e0f7fa", "#80deea", "#e1f5fe"], // Blanco y celestes translúcidos
          },
          links: {
            enable: false, // COMPLETAMENTE LIMPIO: Sin líneas ni mallas
          },
          collisions: {
            enable: false, // Se cruzan con elegancia
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "out", // Salen por los bordes y reaparecen orgánicamente
            },
            random: true,
            speed: 0.8, // Movimiento muy calmado e hipnótico
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 65, // Densidad balanceada para no saturar la pantalla
          },
          opacity: {
            value: { min: 0.15, max: 0.7 },
            animation: {
              enable: true,
              speed: 0.8,
              minimumValue: 0.1,
            },
          },
          shape: {
            type: "circle", // Círculos puros / Burbujas de luz
          },
          size: {
            value: { min: 3, max: 9 }, // Tamaños variados para profundidad 3D
            animation: {
              enable: true,
              speed: 2,
              minimumValue: 1,
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default FondoBurbujas;
