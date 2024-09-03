import useFormStore from "@/store/formdata";
import { useState } from "react";

export const FeedbackFilter = () => {
    const { feedbackTable, updateFeedbackTable } = useFormStore();

    const feedbackTypeOptions = [
        { value: 'both', label: 'Both' },
        { value: 'liked', label: 'Liked' },
        { value: 'disliked', label: 'Disliked' },
    ];

    const statusOptions = [
        { value: 'all', label: 'All' },
        { value: 'new', label: 'New' },
        { value: 'updated', label: 'Updated' },
        { value: 'removed', label: 'Removed' },
    ];

    const handleFeedbackTypeChange = (feedbackType) => {
        updateFeedbackTable("feedbackType", feedbackType);
    };

    const handleStatusChange = (status) => {
        updateFeedbackTable("status", status);
    };

    return (
        <div className="flex flex-col border p-2 w-full rounded-md z-50 bg-white ring-1 ring-gray-300">
            <div className="m-0.5 flex justify-start items-center">
                <label className="mr-3">Feedback Type</label>
                <CustomSelect
                    options={feedbackTypeOptions}
                    value={feedbackTable.feedbackType}
                    onChange={handleFeedbackTypeChange}
                />
            </div>
            <div className="m-0.5 flex justify-start items-center">
                <label className="mr-7">Status</label>
                <CustomSelect
                    options={statusOptions}
                    value={feedbackTable.status}
                    onChange={handleStatusChange}
                />
            </div>
        </div>
    );
};

const CustomSelect = ({ options, value, onChange }) => {
    const handleChange = (e) => {
        onChange(e.target.value);
    };

    return (
        <div className="relative">
            <select
                className="block appearance-none w-36 bg-white border border-gray-400 hover:border-gray-500 p-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                value={value}
                onChange={handleChange}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                >
                    <path d="M10 12l-6-6 1.41-1.41L10 9.17l4.59-4.58L16 6z" />
                </svg>
            </div>
        </div>
    );
};