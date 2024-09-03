import React from "react";
import Image from "next/image"
import LessThanIcon from '@/assets/images/less-than.svg'

const QuickLinks = ({links, title}) => {
    return (
        <div className="bg-[#E7E7E7] rounded-lg px-5 py-4 mt-32">
        <div className="w-full">
          <h4 className="text-[#333333] text-[16px] mb-3">{title}</h4>
          <div className="flex flex-col">
            {
              links?.map((item, index)=>(
                  <div key={index} className="flex justify-start mx-3 my-1"><Image src={LessThanIcon} alt="link image" className="mr-2"/> <a href={item?.path} target="_blank" className="text-[13px] text-[#535353]">{item?.name}</a></div>
              ))
            }
          </div>
        </div>
      </div>
    )
}

export default QuickLinks;