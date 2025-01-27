import React from "react";

const FormInput = ({ label, placeholder, value, updateInput }) => {
  return (
    <div className="w-full">
      <label
        htmlFor="position"
        className="block text-sm font-medium leading-6 text-slate-900"
      >
        {label}
      </label>
      <div className="mt-2">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
          <input
            type="text"
            name="position"
            id="position"
            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
            placeholder={placeholder}
            value={value}
            onChange={updateInput}
          />
        </div>
      </div>
    </div>
  );
};

export default FormInput;
