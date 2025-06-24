import React from "react";
import { FaRegUser } from "react-icons/fa";
import { CgCalendarToday } from "react-icons/cg";
import { TiDocument } from "react-icons/ti";
import { PiSignatureDuotone } from "react-icons/pi";
import { IoMdCheckmark } from "react-icons/io";
import { BsAppIndicator } from "react-icons/bs";
import { RiEditCircleLine } from "react-icons/ri";
import { GrFormNextLink } from "react-icons/gr";
import { MdDownloading } from "react-icons/md";
import '@/app/globals.css';

const MobileInfoSheet = ({ inter, lexend, onClose }) => (
  <>
    {/* Blurred Backdrop */}
    <div
      className="fixed inset-0 z-40 backdrop-blur-xs transition-all"
      onClick={onClose}
    />
    {/* Bottom Sheet */}
    <div className="fixed z-50 left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl p-4 max-h-[90vh] overflow-y-auto animate-slideUp scrollbar-hide ">
    <div className="flex justify-between items-center mb-2 ">
      <h2 className="text-lg font-bold">Document Info</h2>
      <button onClick={onClose} className="text-xl p-1 w-6 h-6 bg-black rounded-full text-white flex items-center justify-center">&times;</button>
    </div>
    <div className="space-y-4 w-full h-full items-center justify-center flex flex-col">
      <div className="flex space-x-4 flex-row w-[70%]">
        <div className="w-1/2 h-32 p-1 space-y-1 rounded-xl shadow-md">
          <h1 className={`${lexend.className} text-sm text-white w-full text-center text-bold p-1 bg-black rounded-lg`}>QR Code</h1>
          <div className="w-full h-3/4 bg-[url('/images/QRCode.png')] bg-contain rounded-xl"></div>
        </div>
        <div className="w-1/2 h-32 p-1 bg-white space-y-1 rounded-xl shadow-md">
          <h1 className={`${lexend.className} text-sm text-white w-full text-center text-bold p-1 bg-black rounded-lg`}>Status</h1>
          <div className="w-full h-3/4 items-center flex flex-col-reverse justify-around ">
            <h6 className={`${inter.className} text-xs text-blue-600 bg-blue-100 rounded-lg p-1.5`}>Signed</h6>
            <h6 className='text-black text-xs rotate-90'>...</h6>
            <h1 className={`${inter.className} bg-green-100 rounded-sm p-1.5 text-green-600 text-sm`}>Approved</h1>
          </div>
        </div>
      </div>
      <div className="w-full mb-4 mt-2 flex flex-row border-b border-gray-300 pb-2 items-center justify-between">
        <h2 className="text-lg font-semibold ml-2">Metadata</h2>
        <p className="text-lg text-black mr-2">...</p>
      </div>
      <div className="w-[80%] h-15 mb-4 mt-2 flex flex-col bg-white border border-gray-300 items-center justify-between rounded-xl p-2">
        <h2 className={`${inter.className} text-xs font-semibold w-full text-left `}>Created By.</h2>
        <div className=" w-full h-3/4 flex flex-row items-center justify-between">
          <h2 className={`${inter.className} text-sm font-semibold`}>John Doe</h2>
          <h2 className={`${inter.className} text-xs font-semibold text-blue-600 bg-blue-100 rounded-lg p-1.5 `}>Requester</h2>
          <FaRegUser className="text-blue-600 text-xl p-1 rounded-full h-6 w-6 bg-blue-100" />
        </div>
      </div>
      <div className="w-[80%] h-15 mb-4 mt-2 flex flex-col bg-white border border-gray-300 items-center justify-between rounded-xl p-2">
        <h2 className={`${inter.className} text-xs font-semibold w-full text-left `}>Document Name.</h2>
        <div className=" w-full h-3/4 flex flex-row items-center justify-between">
          <h2 className={`${inter.className} text-sm font-semibold truncate`}>User Modification Review for April</h2>
        </div>
      </div>
      <div className="w-[80%] h-15 mb-4 mt-2 flex flex-col bg-white border border-gray-300 items-center justify-between rounded-xl p-2">
        <h2 className={`${inter.className} text-xs font-semibold w-full text-left `}>Upload Date.</h2>
        <div className=" w-full h-3/4 flex flex-row items-center justify-between">
          <h2 className={`${inter.className} text-sm font-semibold truncate`}>10 Apr, 2025</h2>
          <h2 className={`${inter.className} text-xs font-semibold text-blue-600 bg-blue-100 rounded-lg p-1.5 w-1/3`}></h2>
          <CgCalendarToday className="text-blue-600 text-xl p-1 rounded-full h-6 w-6 bg-blue-100" />
        </div>
      </div>
      <div className="w-[80%] h-15 mb-4 mt-2 flex flex-col bg-white border border-gray-300 items-center justify-between rounded-xl p-2">
        <h2 className={`${inter.className} text-xs font-semibold w-full text-left `}>Document Type.</h2>
        <div className=" w-full h-3/4 flex flex-row items-center justify-between">
          <h2 className={`${inter.className} text-sm font-semibold truncate`}>PDF</h2>
          <h2 className={`${inter.className} text-xs font-semibold text-orange-600 bg-orange-200 rounded-lg p-1.5 w-1/2`}></h2>
          <TiDocument className="text-orange-600 text-xl p-1 rounded-full h-6 w-6 bg-orange-100" />
        </div>
      </div>
      <div className="w-[80%] h-15 mb-4 mt-2 flex flex-col bg-white border border-gray-300 items-center justify-between rounded-xl p-2">
        <h2 className={`${inter.className} text-xs font-semibold w-full text-left `}>Signed Date</h2>
        <div className=" w-full h-3/4 flex flex-row items-center justify-between">
          <h2 className={`${inter.className} text-sm font-semibold truncate`}>20 Apr, 2025</h2>
          <h2 className={`${inter.className} text-xs font-semibold text-blue-600 bg-blue-100 rounded-lg p-1.5 w-1/3`}></h2>
          <PiSignatureDuotone className="text-blue-600 text-xl p-1 rounded-full h-6 w-6 bg-blue-100" />
        </div>
      </div>
      <div className="w-[80%] h-15 mb-4 mt-2 flex flex-col bg-white border border-gray-300 items-center justify-between rounded-xl p-2">
        <h2 className={`${inter.className} text-xs font-semibold w-full text-left `}>Approval Date.</h2>
        <div className=" w-full h-3/4 flex flex-row items-center justify-between">
          <h2 className={`${inter.className} text-sm font-semibold truncate`}>15 Apr, 2025</h2>
          <h2 className={`${inter.className} text-xs font-semibold text-blue-600 bg-blue-100 rounded-lg p-1.5 w-1/3`}></h2>
          <IoMdCheckmark className="text-blue-600 text-xl p-1 rounded-full h-6 w-6 bg-blue-100" />
        </div>
      </div>
      <div className="w-[80%] h-15 mb-4 mt-2 flex flex-col bg-white border border-gray-300 items-center justify-between rounded-xl p-2">
        <h2 className={`${inter.className} text-xs font-semibold w-full text-left `}>System.</h2>
        <div className=" w-full h-3/4 flex flex-row items-center justify-between">
          <h2 className={`${inter.className} text-sm font-semibold truncate`}>D365 App Layer</h2>
          <h2 className={`${inter.className} text-xs font-semibold text-blue-600 bg-blue-100 rounded-lg p-1.5 w-1/3`}></h2>
          <BsAppIndicator className="text-blue-600 text-xl p-1 rounded-full h-6 w-6 bg-blue-100" />
        </div>
      </div>
      <div className="w-full h-[3.5%] mb-4 mt-2 flex flex-row border-b border-gray-300 pb-2 items-center justify-between">
        <h2 className="text-lg font-semibold ml-2">Actions</h2>
        <p className="text-lg text-black mr-2">...</p>
      </div>
      <div className="w-[80%] h-[17.5%] shadow-md flex flex-col bg-white border border-gray-300 items-center justify-around rounded-xl p-2">
        <div className="w-full h-[50%] flex flex-row items-center justify-around space-x-1 p-1">
          <div className="w-[35%] h-[100%] p-1 space-y-1 rounded-xl shadow-md justify-center items-center flex flex-col cursor-pointer">
            <RiEditCircleLine className="text-black text-xl p-1 rounded-full h-6 w-6 bg-black/10" />
            <h1 className={`${inter.className} text-xs text-black w-[100%] text-center text-bold p-1  `}>Edit</h1>
          </div>
          <div className="w-[35%] h-[100%] p-1 space-y-1 rounded-xl shadow-md justify-center items-center flex flex-col">
            <GrFormNextLink className="text-black text-xl p-1 rounded-full h-6 w-6 bg-black/10" />
            <h1 className={`${inter.className} text-xs text-black w-[100%] text-center text-bold p-1  `}>Next Doc</h1>
          </div>
        </div>
        <button className="w-full h-[33%] text-white p-2 rounded-full bg-black flex flex-row items-center justify-center">
          <MdDownloading className="text-2xl" />
          <p className={`${inter.className} text-xl font-semibold ml-2`}>Download</p>
        </button>
      </div>
    </div>
  </div>
  </>
);

export default MobileInfoSheet;
