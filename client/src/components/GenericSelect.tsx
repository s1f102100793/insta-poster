import React from "react";

type GenericSelectProps<T> = {
  value: T;
  options: T[];
  placeholder?: string;
  onChange: (value: T) => void;
};

export const GenericSelect = <T extends string>({
  value,
  options,
  placeholder,
  onChange,
}: GenericSelectProps<T>) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectvalue = event.target.value as T;
    if (options.includes(selectvalue)) {
      onChange(selectvalue);
    } else {
      alert("Invalid value");
    }
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
    >
      <option value="" disabled={value === ""}>
        {placeholder || "選択してください"}
      </option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};
