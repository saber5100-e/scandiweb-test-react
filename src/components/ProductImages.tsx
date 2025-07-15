import { useEffect, useState } from "react";

import { ImageType } from '../lib/types'

type Props = {
  images: ImageType[];
};

export default function ProductImages({ images }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  useEffect(() => {
    if (images.length > 0) setCurrentImageIndex(0);
  }, [images]);

  const handleArrowClick = (direction: 'prev' | 'next') => {
    setCurrentImageIndex((prev) => {
      if (direction === 'prev') {
        return prev === 0 ? images.length - 1 : prev - 1;
      } else {
        return prev === images.length - 1 ? 0 : prev + 1;
      }
    });
  };

  return (
    <div data-testid="product-gallery" className="image-block">
      <div className="thumbnail-sidebar">
        {images.map((img, i) => (
          <img
            alt={`product-image-${i+1}`}
            key={img.id}
            src={img.url}
            onClick={() => setCurrentImageIndex(i)}
            className="thumbnail"
          />
        ))}
      </div>

      <div className="main-image">
        <div className="image-container">
          <img
            alt={`product-image-${currentImageIndex}`}
            src={images[currentImageIndex]?.url}
            className="thumbnail"
          />
          <button className="nav left" onClick={() => handleArrowClick("prev")}>
            &#10094;
          </button>
          <button className="nav right" onClick={() => handleArrowClick("next")}>
            &#10095;
        </button>
        </div>
      </div>
    </div>
  );
}