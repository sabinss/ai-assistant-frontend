import React, { useState, useEffect } from 'react';
import { FaCircle } from 'react-icons/fa';
import './RangeSlider.css';

const RangeSlider = ({ min = 0, max = 1, step = 0.1, defaultValue = 0, onChange }) => {
    const [value, setValue] = useState(defaultValue);
    const [key, setKey] = useState(0); // Add a key state

    useEffect(() => {
        setValue(defaultValue);
        setKey((prevKey) => prevKey + 1); // Update the key when defaultValue changes
    }, [defaultValue]);

    const handleChange = (event) => {
        const newValue = Number(event.target.value);
        setValue(newValue);
        onChange && onChange(newValue);
    };

    return (
        <div className="range-slider" key={key}> {/* Use the key prop */}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                style={{
                    background: `linear-gradient(90deg, #174894 ${((value - min) / (max - min)) * 100}%, #E5E7EB ${((value - min) / (max - min)) * 100}%)`,
                }}
            />
            <FaCircle />
            <span className="value">{value}</span>
        </div>
    );
};

export default RangeSlider;