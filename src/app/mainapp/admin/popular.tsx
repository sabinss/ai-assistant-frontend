"use client"
import React, { useState } from 'react';
const PopularSources = () => {
    const [data, setData] = useState([
        {
            title: "Google",
            url: "https://www.google.com",
            views: 5
        },
        {
            title: "Youtube",
            url: "https://www.youtube.com",
            views: 7
        },
        {
            title: "Facebook",
            url: "https://www.facebook.com",
            views: 3
        },
        {
            title: "Amazon",
            url: "https://www.amazon.com",
            views: 11
        }
    ]);

    return (
        <div className='flex flex-col gap-4 bg-white rounded-md p-3 '>
            <div>
                <p className="text-xl font-bold">
                    Most Popular sources
                </p>
                <p className="text-gray-500">
                    Most frequent sources in user charts.
                </p>
            </div>

            {
                data.map((item, index) => (
                    <div className='flex gap-4 items-center' key={index}>
                        <div className='w-full'>
                            <p className="font-bold">{item.title}</p>
                            <div className="flex justify-between">
                                <p className="text-gray-500">{item.url}</p>
                                <p>{item.views}</p>
                            </div>
                        </div>
                    </div>
                ))}
        </div >
    )
}
export default PopularSources;
