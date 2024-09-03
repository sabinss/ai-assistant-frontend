"use client"
import http from '@/config/http';
import React, { useState } from 'react';

const Secret = () => {
    const [sampleText, setSampleText] = useState('Seed the Database with User Roles, User Status, Gpt models and Api key and get the api key');
    const [textAreaValue, setTextAreaValue] = useState('');

    const handleCopy = () => {
        navigator.clipboard.writeText(textAreaValue);
        alert('Text copied to clipboard!');
    };
    const handleClick = async () => {
        const res = await http.get("/seed")
        console.log(res.data)
        setSampleText("seeded successfully")
        setTextAreaValue(res?.data?.key)
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <p className="text-lg mb-4">{sampleText}</p>
            <button className="bg-[#174894] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                onClick={handleClick}
            >
                Begin Seeding
            </button>

            <div className="w-full max-w-md">
                <p
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    {textAreaValue}
                </p>
                <button
                    onClick={handleCopy}
                    className="mt-2 bg-[#174894] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Click to Copy
                </button>
            </div>
        </div>
    );
};

export default Secret
    ;