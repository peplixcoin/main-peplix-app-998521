import { useState } from "react";

function InputRead({ labelTitle, labelStyle, type, containerStyle, defaultValue, placeholder, updateFormValue, updateType, disabled }) {

  const [value, setValue] = useState(defaultValue);

  const updateInputValue = (val) => {
    if (!disabled) {  // Only update if not disabled
      setValue(val);
      updateFormValue({ updateType, value: val });
    }
  };

  return (
    <div className={`form-control w-full ${containerStyle}`}>
      <label className="label">
        <span className={"label-text text-base-content " + labelStyle}>{labelTitle}</span>
      </label>
      <input
        type={type || "text"}
        value={value}
        placeholder={placeholder || ""}
        onChange={(e) => updateInputValue(e.target.value)}
        disabled={disabled}
        className={`input input-bordered w-full ${disabled ? 'bg-gray-200 text-gray-700 cursor-not-allowed' : ''}`}  // text-gray-700 for darker text
        style={disabled ? { color: '#374151', backgroundColor: '#d1d5db' } : {}}  // Custom darker color if needed
      />
    </div>
  );
}

export default InputRead;
