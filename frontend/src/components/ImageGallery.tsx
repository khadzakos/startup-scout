import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  className?: string;
  showThumbnails?: boolean;
  maxThumbnails?: number;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className = '',
  showThumbnails = true,
  maxThumbnails = 4
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const openModal = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(images[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(images[prevIndex]);
  };

  const nextMainImage = () => {
    const nextIndex = (mainImageIndex + 1) % images.length;
    setMainImageIndex(nextIndex);
  };

  const prevMainImage = () => {
    const prevIndex = (mainImageIndex - 1 + images.length) % images.length;
    setMainImageIndex(prevIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowRight') {
      if (selectedImage) {
        nextImage();
      } else {
        nextMainImage();
      }
    } else if (e.key === 'ArrowLeft') {
      if (selectedImage) {
        prevImage();
      } else {
        prevMainImage();
      }
    }
  };

  const displayImages = showThumbnails ? images.slice(0, maxThumbnails) : images;
  const hasMoreImages = images.length > maxThumbnails;

  return (
    <>
      <div 
        className={`space-y-4 ${className}`}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Основное изображение */}
        <div className="relative group">
          <img
            src={images[mainImageIndex]}
            alt="Main project image"
            className="w-full h-64 md:h-80 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openModal(images[mainImageIndex], mainImageIndex)}
          />
          
          {/* Счетчик изображений */}
          {images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {mainImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Кнопки навигации */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevMainImage();
                }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextMainImage();
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Миниатюры */}
        {showThumbnails && images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {displayImages.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`Thumbnail ${index + 1}`}
                className={`w-full h-16 object-cover rounded cursor-pointer transition-all ${
                  index === mainImageIndex 
                    ? 'ring-2 ring-blue-500 opacity-100' 
                    : 'hover:opacity-70 opacity-60'
                }`}
                onClick={() => {
                  setMainImageIndex(index);
                  openModal(imageUrl, index);
                }}
              />
            ))}
            {hasMoreImages && (
              <div
                className="w-full h-16 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={() => {
                  const nextIndex = maxThumbnails;
                  setMainImageIndex(nextIndex);
                  openModal(images[nextIndex], nextIndex);
                }}
              >
                <span className="text-gray-600 text-sm font-medium">
                  +{images.length - maxThumbnails}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно для просмотра изображений */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            {/* Кнопка закрытия */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
              aria-label="Close gallery"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Навигационные кнопки */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Изображение */}
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Счетчик изображений */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
