import { useCallback, memo } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";

const FondoClaro = memo(() => {
  const particlesInit = useCallback(async (engine: Engine) => {
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
        background: { color: "#f8fafc" }, // Fondo claro base
        fpsLimit: 60,
        particles: {
          color: {
            value: ["#1e88e5", "#00d2ff", "#7b1fa2", "#cbd5e1"], // Azul, cian, lavanda y plata pastel
          },
          links: {
            color: "#cbd5e1", // Líneas de enlace plateadas suaves
            distance: 140,
            enable: true,
            opacity: 0.4,
            width: 1.2,
          },
          collisions: {
            enable: false, // DESHABILITADO: Rebotar entre sí consume demasiada CPU (O(N^2))
          },
          move: {
            direction: "none",
            enable: true,
            outModes: { default: "bounce" }, // Rebotan sutilmente en los bordes
            random: true,
            speed: 1.5, // Velocidad elegante y muy visible (movimiento continuo)
            straight: false,
          },
          number: {
            density: { enable: true, area: 800 },
            value: 75, // Cantidad ideal para tener dinamismo sin saturar
          },
          opacity: {
            value: { min: 0.2, max: 0.6 },
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 0.15,
            },
          },
          shape: { type: "circle" },
          size: {
            value: { min: 2, max: 5 }, // Nodos visibles y variados
            animation: {
              enable: true,
              speed: 2,
              minimumValue: 1,
            },
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "grab", // ¡Crea conexiones dinámicas magnéticas con el mouse!
            },
            onClick: {
              enable: true,
              mode: "push", // Genera 4 partículas extra en cascada al dar click
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 180,
              links: {
                opacity: 0.6,
                color: "#1e88e5", // Líneas azuladas hacia tu cursor
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
  );
});

export default FondoClaro;