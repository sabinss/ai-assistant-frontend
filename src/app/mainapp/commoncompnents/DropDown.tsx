import React, { FC, useState } from 'react';
import { VscTriangleDown } from 'react-icons/vsc';

interface DropdownProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
}

const Dropdown: FC<DropdownProps> = ({ options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const toggleDropdown = () => setIsOpen(!isOpen);
    const handleOptionClick = (option: string) => {
        onChange(option); // Call the onChange prop with the new option
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left w-full">
            <div
                className="cursor-pointer justify-between gap-4 h-10 items-center w-full px-4 py-2 text-[#737373] border rounded-md shadow-sm bg-[#e7e7e7] border-[#CCCCCC] hover:bg-gray-50"
                onClick={toggleDropdown}
            >
                {value}
                <VscTriangleDown className="ml-2 -mr-1 h-5 w-5 inline  float-right" aria-hidden="true" />
            </div>

            {isOpen && (
                <div className="absolute z-10 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <ul className="py-1 text-sm text-gray-700" aria-labelledby="dropdownMenuButton">
                        {options?.map((option, index) => (
                            <li
                                key={index}
                                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                                onClick={() => handleOptionClick(option)}
                            >
                                {option}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dropdown;