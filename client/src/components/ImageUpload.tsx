import React, { Dispatch, SetStateAction } from 'react';

type ImageUploadProps = {
  image: File | null;
  setImage: Dispatch<SetStateAction<File | null>>;
  label: string;
  id: string;
};

export const ImageUpload = ({ image, setImage, label, id }: ImageUploadProps) => {
  const getImageUrl = (image: File | null) =>
    image ? URL.createObjectURL(image) : "";
  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<File | null>>,
  ) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col justify-end gap-4">
      {image && (
        <img
          src={getImageUrl(image)}
          alt={label}
          className="w-72"
        />
      )}
      <input
        type="file"
        id={`${id}-input`}
        onChange={(e) => handleImageChange(e, setImage)}
        className="p-1"
      />
      <label
        htmlFor={`${id}-input`}
        className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-300"
      >
        {label}
      </label>
    </div>
  );
}
