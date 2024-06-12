import React from "react";

type GenericSelectProps<T> = {
  value: T | null | "";
  options: { value: T; label: string }[];
  placeholder?: string;
  onChange: (value: T) => void;
};

export const GenericSelect = <T extends string | number>({
  value,
  options,
  placeholder,
  onChange,
}: GenericSelectProps<T>) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    const option = options.find((o) => o.value.toString() === selectedValue);
    if (option) {
      onChange(option.value);
    } else {
      alert("Invalid value");
    }
  };

  return (
    <select
      value={value !== null ? value.toString() : ""}
      onChange={handleChange}
      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
    >
      <option value="" disabled={value === null}>
        {placeholder || "選択してください"}
      </option>
      {options.map((option, index) => (
        <option key={index} value={option.value.toString()}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
