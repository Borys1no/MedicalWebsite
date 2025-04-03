import { useState } from "react";
import { ArrowRight } from "lucide-react";
import "./HeroSection.css";

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  const phrases = [
    "Especialistas en el tratamiento de enfermedades reumáticas",
    "Consultas médicas virtuales vía Zoom",
    "Atención personalizada con el Dr. Emilio Aroca Briones",
    "Diagnóstico y tratamiento de Artritis, Artrosis, Lupus y más",
  ];

  return (
    <section className="hero-section">
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="container">
          <div className="hero-text">
            <div className="hero-carousel">
            </div>
            <p className="hero-description">
              Brindamos atención médica especializada en reumatología a través
              de consultas virtuales, permitiéndole recibir diagnóstico y
              tratamiento desde la comodidad de su hogar.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary">
                Agendar consulta
                <ArrowRight className="icon" />
              </button>
              <button className="btn btn-outline">Nuestros servicios</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
