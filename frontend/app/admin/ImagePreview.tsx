"use client";

interface ImagePreviewProps {
  imagePreviews: string[];
  removeImagePreview: (index: number) => void;
}

export default function ImagePreview({ imagePreviews, removeImagePreview }: ImagePreviewProps) {
  return (
    <>
      {imagePreviews.length > 0 && (
        <div className="mt-4 flex gap-4">
          {imagePreviews.map((src, index) => (
            <div key={index} className="relative">
              <img
                src={src}
                alt={`Vista previa ${index + 1}`}
                className="w-24 h-24 object-cover rounded-md border border-gray-300"
              />
              <button
                onClick={() => removeImagePreview(index)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
