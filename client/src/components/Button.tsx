import React from "react";

interface ButtonProps {
  color: string;
  text: string;
  onClick: () => void;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  color,
  text,
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-white p-2 rounded cursor-pointer ${color} ${className}`}
    >
      {text}
    </button>
  );
};
