import React, { useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
const CollapsibleSection = ({ title, body }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col my-2">
      {/* Header Section */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-row justify-between items-center cursor-pointer"
      >
        <div className="font-semibold text-sm">{title}</div>
        {isOpen ? <MdKeyboardArrowDown /> : <MdKeyboardArrowUp />}
      </div>

      {/* Body Section */}
      {isOpen && <div className=" text-sm">{body}</div>}
    </div>
  );
};

export default CollapsibleSection;
