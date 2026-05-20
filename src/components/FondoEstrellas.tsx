import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";

const FondoEstrellas = () => {
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
              mode: "bubble", // Las estrellas se iluminan se agrandan levemente al pasar el mouse
            },
            onClick: {
              enable: true,
              mode: "push", // Genera algunas chispas más
            },
            resize: true,
          },
          modes: {
            bubble: {
              distance: 150,
              size: 4,
              opacity: 1,
              duration: 2,
              color: "#ffb74d", // Destello dorado
            },
            push: {
              quantity: 4,
            },
          },
        },
        particles: {
          color: {
            value: ["#ffffff", "#ffb74d", "#e1bee7", "#bc13fe", "#ffd54f"], // Blanco, oro, lavanda, violeta
          },
          links: {
            enable: false, // Sin líneas de conexión, es polvo estelar libre
          },
          collisions: {
            enable: false,
          },
          move: {
            direction: "bottom-left", // Flujo diagonal descendente muy lento
            enable: true,
            outModes: {
              default: "out",
            },
            random: true,
            speed: 0.3, // Movimiento sumamente pacífico y lento
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 100, // Una densidad agradable para simular una constelación
          },
          opacity: {
            value: { min: 0.2, max: 0.8 },
            animation: {
              enable: true,
              speed: 0.5,
              minimumValue: 0.1,
            },
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 3 }, // Estrellas diminutas para dar profundidad
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 0.5,
            },
          },
          twinkle: {
            particles: {
              enable: true, // Efecto de parpadeo realista
              color: "#ffffff",
              frequency: 0.08,
              opacity: 1,
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default FondoEstrellas;
