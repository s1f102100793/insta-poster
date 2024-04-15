import React from 'react';

interface TextInputProps {
  value: string;
  setValue:  (value: React.SetStateAction<string>) => void;
  placeholder?: string;
  className?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ value, setValue, placeholder, className }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };
  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${className}`}
    />
  );
};
