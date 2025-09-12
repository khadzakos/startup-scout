import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  multiple?: boolean;
  maxImages?: number;
  className?: string;
}

interface UploadResponse {
  success: boolean;
  file_name: string;
  image_url: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  multiple = false,
  maxImages = 5,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Функция для извлечения имени файла из URL
  const getFileNameFromUrl = (url: string): string => {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    // Убираем расширение для отображения
    return fileName.split('.')[0];
  };

  // Обработчики drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  }, []);

  // Общая функция для обработки файлов (из input или drag&drop)
  const handleFiles = async (files: File[]) => {
    if (!user) {
      setError('Необходимо войти в систему для загрузки изображений');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // Проверяем тип файла
        if (!file.type.startsWith('image/')) {
          throw new Error(`Файл ${file.name} не является изображением`);
        }

        // Проверяем размер файла (10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`Файл ${file.name} слишком большой (максимум 10MB)`);
        }

        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.IMAGE_UPLOAD}`, {
          method: 'POST',
          credentials: 'include', // важно для отправки cookies
          body: formData,
        });

        if (!response.ok) {
          let errorMessage = 'Ошибка загрузки изображения';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // Если ответ не JSON, используем текст ответа
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const responseText = await response.text();
        
        let data: UploadResponse;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error('Неверный формат ответа сервера');
        }
        return data.image_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      if (multiple) {
        const newImages = [...uploadedImages, ...uploadedUrls];
        if (newImages.length > maxImages) {
          setError(`Максимум ${maxImages} изображений`);
          return;
        }
        setUploadedImages(newImages);
        newImages.forEach(url => onImageUploaded(url));
      } else {
        setUploadedImages(uploadedUrls);
        onImageUploaded(uploadedUrls[0]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки изображений');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    handleFiles(Array.from(files));
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag and Drop зона */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading || (multiple && uploadedImages.length >= maxImages)
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer'
          }
        `}
        onClick={openFileDialog}
      >
        <div className="space-y-4">
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isUploading ? 'Загрузка...' : 'Перетащите изображения сюда'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              или <span className="text-blue-600 font-medium">нажмите для выбора файлов</span>
            </p>
          </div>
          
          {multiple && (
            <p className="text-sm text-gray-600">
              {uploadedImages.length}/{maxImages} изображений
            </p>
          )}
        </div>
      </div>

      {/* Скрытый input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Ошибки */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Предварительный просмотр загруженных изображений */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Загруженные изображения:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedImages.map((imageUrl, index) => (
              <div key={index} className="relative group border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <img
                    src={imageUrl}
                    alt={`Uploaded ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getFileNameFromUrl(imageUrl)}
                    </p>
                    <p className="text-xs text-gray-500">Изображение {index + 1}</p>
                  </div>
                  {multiple && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Информация о поддерживаемых форматах */}
      <div className="text-sm text-gray-500">
        Поддерживаемые форматы: JPG, PNG, GIF, WebP. Максимальный размер: 10MB
      </div>
    </div>
  );
};
