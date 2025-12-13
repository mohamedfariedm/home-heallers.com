'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import cn from '@/utils/class-names';
// import fs from 'fs'
import {
  PiArrowLineDownBold,
  PiDownloadBold,
  PiDownloadFill,
  PiFile,
  PiFileCsv,
  PiFileDoc,
  PiFilePdf,
  PiFileXls,
  PiFileZip,
  PiTrashBold,
  PiXBold,
} from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import Upload from '@/components/ui/upload';
import { useModal } from '@/app/shared/modal-views/use-modal';
import SimpleBar from '@/components/ui/simplebar';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Cookies from 'js-cookie';
import { getToken } from '@/framework/utils/get-token';

type AcceptedFiles = 'img' | 'pdf' | 'csv' | 'xlsx' | 'imgAndPdf' | 'all';
let excelFile:any="fard";
export default function FileUpload({
  label = 'Upload Files',
  btnLabel = 'Upload',
  fieldLabel,
  multiple = true,
  accept = 'all',
  url,
}: {
  label?: string;
  fieldLabel?: string;
  btnLabel?: string;
  multiple?: boolean;
  accept?: AcceptedFiles;
  url:string;
}) {
  const { closeModal } = useModal();

  return (
    <div className="m-auto px-5 pb-8 pt-5 @lg:pt-6 @2xl:px-7">
      <div className="mb-6 flex items-center justify-between">
        <Title as="h3" className="text-lg">
          {label}
        </Title>
        <ActionIcon
          size="sm"
          variant="text"
          onClick={() => closeModal()}
          className="p-0 text-gray-500 hover:!text-gray-900"
        >
          <PiXBold className="h-[18px] w-[18px]" />
        </ActionIcon>
      </div>

      <FileInput
        accept={accept}
        multiple={multiple}
        label={fieldLabel}
        btnLabel={btnLabel}
        url={url}
      />
    </div>
  );
}

const fileType = {
  'text/csv': <PiFileCsv className="h-5 w-5" />,
  'text/plain': <PiFile className="h-5 w-5" />,
  'application/pdf': <PiFilePdf className="h-5 w-5" />,
  'application/xml': <PiFileXls className="h-5 w-5" />,
  'application/zip': <PiFileZip className="h-5 w-5" />,
  'application/gzip': <PiFileZip className="h-5 w-5" />,
  'application/msword': <PiFileDoc className="h-5 w-5" />,
} as { [key: string]: React.ReactElement };

export const FileInput = ({
  label,
  btnLabel = 'Upload',
  multiple = true,
  accept = 'img',
  className,
  url,
}: {
  className?: string;
  label?: React.ReactNode;
  multiple?: boolean;
  btnLabel?: string;
  accept?: AcceptedFiles;
  url:string
}) => {
  const { closeModal } = useModal();
  const [files, setFiles] = useState<Array<File>>([]);
  const imageRef = useRef<HTMLInputElement>(null);

  function handleFileDrop(event: React.ChangeEvent<HTMLInputElement>) {
    const uploadedFiles = (event.target as HTMLInputElement).files;
    const newFiles = Object.entries(uploadedFiles as object)
      .map((file) => {
        if (file[1]) return file[1];
      })
      .filter((file) => file !== undefined);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }

  function handleImageDelete(index: number) {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    (imageRef.current as HTMLInputElement).value = '';
  }

  async function handleFileUpload() {
    if (files.length) {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const token = getToken();
        const baseURL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://api.energizeplus.app/api';
        
        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${baseURL}/${url}`,
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          data: formData
        };
        
        const response = await axios.request(config);
        
        // Handle response based on API contract
        if (response.data) {
          const data = response.data;
          if (data.status === 'success' || data.status === 'partial_success') {
            const message = data.status === 'success' 
              ? `Successfully imported ${data.successful_imports} row(s)`
              : `Import completed: ${data.successful_imports} successful, ${data.failed_imports} failed`;
            toast.success(<Text as="b">{message}</Text>);
            
            // Show errors if any
            if (data.errors && data.errors.length > 0) {
              console.warn('Import errors:', data.errors);
            }
          } else {
            toast.success(<Text as="b">File successfully uploaded</Text>);
          }
        } else {
          toast.success(<Text as="b">File successfully uploaded</Text>);
        }

        setTimeout(() => {
          closeModal();
        }, 200);
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to upload file';
        toast.error(<Text as="b">{errorMessage}</Text>);
      }
    } else {
      toast.error(<Text as="b">Please select a file</Text>);
    }
  }

  return (
    <div className={className}>
      <Upload
        label={label}
        ref={imageRef}
        accept={accept}
        multiple={multiple}
        onChange={(event) => handleFileDrop(event)}
        className="mb-6 min-h-[280px] justify-center border-dashed bg-gray-50 dark:bg-transparent"
      />

      {files.length > 1 ? (
        <Text className="mb-2 text-gray-500">{files.length} files</Text>
      ) : null}

      {files.length > 0 && (
        <SimpleBar className="max-h-[280px]">
          <div className="grid grid-cols-1 gap-4">
            {files?.map((file: File, index: number) => (
              <div
                className="flex min-h-[58px] w-full items-center rounded-xl border border-gray-200 px-3 dark:border-gray-300"
                key={file.name}
              >
                <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 object-cover px-2 py-1.5 dark:bg-transparent">
                  {file.type.includes('image') ? (
                    <Image
                      src={URL.createObjectURL(file)}
                      fill
                      className=" object-contain"
                      priority
                      alt={file.name}
                      sizes="(max-width: 768px) 100vw"
                    />
                  ) : (
                    <>{fileType[file.type]}</>
                  )}
                </div>
                <div className="truncate px-2.5">{file.name}</div>
                <ActionIcon
                  onClick={() => handleImageDelete(index)}
                  size="sm"
                  variant="flat"
                  color="danger"
                  className="ms-auto flex-shrink-0 p-0 dark:bg-red-dark/20"
                >
                  <PiTrashBold className="w-6" />
                </ActionIcon>
              </div>
            ))}
          </div>
        </SimpleBar>
      )}
      <div className="mt-4 flex justify-end gap-3">
        <Button
          variant="outline"
          className={cn(!files.length && 'hidden', 'w-full')}
          onClick={() => setFiles([])}
        >
          Reset
        </Button>
        <Button className="w-full" onClick={() => handleFileUpload()}>
          <PiArrowLineDownBold className="me-1.5 h-[17px] w-[17px]" />
          {btnLabel}
        </Button>
        <Button 
          className="w-full" 
          variant="outline"
          onClick={async () => {
            try {
              const token = getToken();
              const baseURL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://api.energizeplus.app/api';
              
              // Determine the endpoint based on URL pattern
              let endpoint = '';
              if (url === 'reservations/import' || url.includes('reservations')) {
                endpoint = '/reservations-sample-sheet';
              } else if (url === 'customer-supports/import' || url.includes('customer-supports')) {
                endpoint = '/customer-supports/download-sample-sheet';
              } else {
                toast.error('Unknown import type');
                return;
              }

              const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.data?.download_url) {
                const link = document.createElement('a');
                link.href = response.data.download_url;
                link.download = response.data.file_name || 'sample_sheet.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Sample sheet downloaded successfully');
              } else {
                toast.error('Failed to get download URL');
              }
            } catch (error: any) {
              const errorMessage = error?.response?.data?.message || error?.message || 'Failed to download sample sheet';
              toast.error(errorMessage);
            }
          }}
        >
          <PiDownloadFill className="me-1.5 h-[17px] w-[17px]" />
          Download Sample
        </Button>
      </div>
    </div>
  );
};

// function handleFileUpload() {
//   if (files.length) {
//     console.log('uploaded files:', files[0]);
//     let data = new FormData();
//     data.append('file', files[0]);
//     // data.append('fileName', files[0].name);
//     let config:any = {
//       method: 'post',
//       maxBodyLength: Infinity,
//       url: 'https://api.energizeplus.app/api/import_journeys',
//       headers: { 
//         'Authorization': 'Bearer H0TvcNlagj6BeoHz3pHNSnxOTmdpEU8N9Y6KukAkc42ebbc4', 
//         ...data
//       },
//       data : data
//     };
    
//     axios.request(config)
//     .then((response) => {
//       console.log(JSON.stringify(response.data));
//     })
//     .catch((error) => {
//       console.log(error);
//     });
//     toast.success(<Text as="b">File successfully added</Text>);

//     setTimeout(() => {
//       closeModal();
//     }, 200);
//   } else {
//     toast.error(<Text as="b">Please drop your file</Text>);
//   }
// }