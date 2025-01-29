import React, { useState, useEffect } from 'react';
import './Carousel.css';
import { CircleArrowRight, CircleArrowLeft } from 'lucide-react';


const Carousel = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 5000); // Cambia de imagen cada 5 segundos

    return () => clearInterval(interval);
  }, [items.length]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  return (
    <div className="carousel">
      <div className="carousel-inner">
        {items.map((item, index) => (
          <div key={index} className={`carousel-item ${index === currentIndex ? 'active' : ''}`}>
            <div className="carousel-left">
              <img src={item.image} alt={`Slide ${index}`} />
            </div>
            <div className="carousel-right">
              <p className="carousel-text">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Carousel;