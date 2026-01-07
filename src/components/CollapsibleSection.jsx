import React, { useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
const CollapsibleSection = ({ title, body, bodyStyle }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col my-2 w-full">
      {/* Header Section */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-row justify-between items-center cursor-pointer"
      >
        <div className="font-bold text-md">{title}</div>
        {isOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
      </div>

      {/* Body Section */}
      {isOpen && (
        <div className="text-sm">
          <div className={`${bodyStyle}`}>{body}</div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
