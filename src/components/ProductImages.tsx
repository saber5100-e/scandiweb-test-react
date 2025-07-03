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
    <div data-testid="product-gallery" className="d-flex product-images-container">
      <div className="d-flex flex-column me-2 overflow-auto thumbnails-wrapper">
        {images.map((img, i) => (
          <img
            alt={`product-image-${i}`}
            key={img.ID}
            src={img.URL}
            onClick={() => setCurrentImageIndex(i)}
            className="img-thumbnail mb-2 thumbnail-img"
            style={{ cursor: "pointer" }}
          />
        ))}
      </div>

      <div className="position-relative main-image-wrapper">
        <img
          alt={`product-image-${currentImageIndex}`}
          src={images[currentImageIndex]?.URL}
          className="img-fluid main-image w-100"
        />
        <button className="carousel-arrow left" onClick={() => handleArrowClick("prev")}>
          ‹
        </button>
        <button className="carousel-arrow right" onClick={() => handleArrowClick("next")}>
          ›
        </button>
      </div>
    </div>
  );
}