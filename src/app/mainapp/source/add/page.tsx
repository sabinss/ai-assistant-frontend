"use client"
import { useState, useCallback } from "react";
import { Files, Sheet } from "lucide-react";
import { useDropzone } from 'react-dropzone';
import { FaGlobe, FaGoogleDrive, FaQuestionCircle } from "react-icons/fa";
import http from "@/config/http";
import { useRouter } from "next/navigation"
import useAuth from "@/store/user";

export default function page() {
    const { user_data } = useAuth(); // Call useAuth here
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<String>('files');

    const data = [{
        name: 'Files',
        key: 'files',
        description: 'Upload a file or Drag a file.(PDF, PPT, DOC upto 10MB).',
        icon: <Files className={`${activeTab === 'files' ? 'text-white' : 'text-[#A7A7A7]'} mx-2`} size={40} />,
    },
        // {
        //     name: 'Table',
        //     key: 'table',
        //     description: 'Upload CSV, XLSX and XLS file containing structured text data.',
        //     icon: <Sheet className={`${activeTab === 'table' ? 'text-white' : 'text-[#A7A7A7]'} mx-2`} size={40} />,
        // },
        // {
        //     name: 'Google Drive',
        //     key: 'google-drive',
        //     description: 'Upload CSV, XLSX and XLS file containing structured text data.',
        //     icon: <FaGoogleDrive className={`${activeTab === 'google-drive' ? 'text-white' : 'text-[#A7A7A7]'} mx-2`} size={40} />,
        // },
        // {
        //     name: 'Website',
        //     key: 'website',
        //     description: 'Add URL to be  scrapped and indexed from training.',
        //     icon: <FaGlobe className={`${activeTab === 'website' ? 'text-white' : 'text-[#A7A7A7]'} mx-2`} size={40} />,
        // }
    ]

    const handleFileTabs = (tab) => {
        setActiveTab(tab);
    }

    let isUploadInProgress = false;

    const onDrop = useCallback((acceptedFiles) => {
        acceptedFiles.forEach((file) => {
            const reader = new FileReader()

            reader.onabort = () => console.log('file reading was aborted')
            reader.onerror = () => console.log('file reading has failed')
            reader.onload = () => {
                // Do whatever you want with the file contents
                const binaryStr = reader.result
                handlePdfUpload([file]);
            }
            reader.readAsArrayBuffer(file)
        })

    }, [])
    const { getRootProps, getInputProps } = useDropzone({ onDrop })

    const handlePdfUpload = async (files) => {
        setIsLoading(true)
        const pdfFiles = files.filter(file => file.type === 'application/pdf');
        if (pdfFiles.length > 0) {
            try {
                await http.pdfUpload(user_data?.organization, pdfFiles);
                setIsLoading(false)
                router.push('/mainapp/source');
            } catch (error) {

                console.error(error);
                setIsLoading(false)

            } finally {
                setIsLoading(false)
                router.push('/mainapp/source');

            }
        }
    };

    const dropzoneStyle = {
        border: '2px dashed #cccccc',
        borderRadius: '4px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        marginBottom: '20px',
    };

    const loaderStyle = {
        fontSize: '18px',
        fontWeight: 'bold',
    };
    return (
        <div className="w-full text-[#333333] text-sm bg-white p-3 rounded-md">
            <p className="text-xl inline font-semibold">Data Sources</p>
            <FaQuestionCircle className="text-[#1E5DC0] inline bg-white rounded-full ml-2" />
            <div className="bg-[#E7E7E7] border-[#CCCCCC] box px-4 py-2 w-full rounded-md my-4">
                File Data Source
            </div>
            <p className=" pl-3">Upload new data source file for your project.</p>
            <div className="flex md:flex-row mt-3 gap-2 flex-col-reverse">
                <div className="cards md:w-2/5 w-full md:p-6 flex flex-col gap-6 ">
                    {
                        data?.map((item) => {
                            return (
                                <div key={item?.key} onClick={() => handleFileTabs(item?.key)} className={`hover:bg-muted rounded-lg file border-b cursor-pointer border-[#D7D7D7] p-4 ${activeTab === item?.key ? 'bg-[#174894] text-white' : ''}`}>
                                    <p>{item?.name}</p>
                                    <div className="flex py-6">
                                        {item?.icon}
                                        <p className={`${activeTab === item?.key ? 'text-white' : 'text-[#535353]'}`}>{item?.description}</p>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                <div className="uploadscreen md:w-3/5 w-full md:p-6 cursor-pointer ">
                    <div className="h-full w-full bg-[#E7E7E7] border-dashed border-black border-2 rounded-md flex flex-col justify-center items-center">
                        <div className="p-3 font-semibold">
                            <div {...getRootProps({ className: 'dropzone' })} style={dropzoneStyle}>
                                <input {...getInputProps()} />
                                {
                                    isLoading ? (<div style={loaderStyle}>Loading...</div>) : (<p>Drag 'n' drop some files here, or click to select files</p>)
                                }

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}