'use client';;
import { IconCircleCheckFilled } from '@tabler/icons-react';
import { debounce } from 'lodash';
import { Button, Input, Modal, Spin, Upload } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { getImages } from '@/helpers/image';

const AddImageModal = ({ open, onClose, onSubmit }) => {
  const [imageTab, setImageTab] = useState("upload");
  const [images, setImages] = useState([]);
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ href: "", alt: "" });
  const [imageLink, setImageLink] = useState("");

  useEffect(() => {
    setImageTab("upload")
  }, [open])

  useEffect(() => {
    setImageLink("");
    setSelectedImage({ href: "", alt: "" })
    setImages([]);
  }, [imageTab])

  const onSearchImage = async (e: any) => {
    try {
      setIsSearchingImage(true)
      const imagesFound = await getImages(e.currentTarget.value, 12);
      setImages(imagesFound);
      setIsSearchingImage(false)
    } catch {
      setIsSearchingImage(false)
    }
  }

  const onSubmitImage = () => {
    if (imageTab === "upload" || imageTab === "link") {
      if (imageLink) {
        onSubmit({ src: imageLink, alt: "" })
      }
    }

    if (imageTab === "unsplash") {
      if (selectedImage.href) {
        onSubmit({ src: selectedImage.href, alt: selectedImage.alt })
      }
    }

    onClose()
  }

  const imageGallery = useMemo(() => {
    if (!images.length) return [];

    return images.map((image) => {
      return (
        <div key={image.href} className='relative mb-2 h-[128px]'>
          <img
            src={image.href}
            alt={image.alt}
            className={`absolute w-full h-full object-cover rounded-md`}
            loading="lazy"
          />
          <div
            className={`cursor-pointer absolute z-10 w-full h-full rounded-md opacity-0 hover:opacity-100 flex items-center justify-center hover:bg-primary-500/50 transition-all ${selectedImage.href === image.href ? "bg-primary-500/50 opacity-100" : ""}`}
            onClick={() => setSelectedImage(image)}
          >
            <IconCircleCheckFilled className='text-white' />
          </div>
        </div>

      )
    })
  }, [images, selectedImage])

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      title="Add image"
      onOk={onSubmitImage}
      destroyOnClose
      okButtonProps={{
        disabled: imageTab === "link" && !imageLink || imageTab === "unsplash" && !selectedImage.href
      }}
    >
      <div className='flex flex-col gap-4 w-full mt-2'>
        <div className='flex flex-row gap-2'>
          <Button
            type={imageTab === "upload" ? "primary" : "default"}
            onClick={() => setImageTab("upload")}
          >
            Upload
          </Button>
          <Button
            type={imageTab === "link" ? "primary" : "default"}
            onClick={() => setImageTab("link")}
          >
            Link
          </Button>
          <Button
            type={imageTab === "unsplash" ? "primary" : "default"}
            onClick={() => setImageTab("unsplash")}
          >
            Unsplash
          </Button>
        </div>

        {imageTab === "upload" && (
          <div className='flex flex-col gap-4'>
            <Upload.Dragger
              name={'image'}
              multiple={false}
              accept={"jpg,png,gif"}
              maxCount={1}
              onChange={(info) => {
                const { status } = info.file;
                if (status === 'done') {
                  const reader = new FileReader();
                  reader.addEventListener(
                    "load",
                    () => {
                      if (typeof reader.result === "string") {
                        console.log('reader.result', reader.result)
                        setImageLink(reader.result);
                      }
                    },
                    false,
                  );
                  reader.readAsDataURL(info.file.originFileObj);
                }
              }}
            >
              <p className="ant-upload-text">Click or drag your image to this area to upload</p>
              <p className="ant-upload-hint">
                Supported images (<b>jpg,png,gif</b>).
              </p>
            </Upload.Dragger>

            {imageLink && (
              <img src={imageLink} className='w-[200px] max-h-[300px] object-cover' />
            )}
          </div>
        )}

        {imageTab === "link" && (
          <Input placeholder="Image link" onChange={(e) => setImageLink(e.currentTarget.value)} />
        )}

        {imageTab === "unsplash" && (
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4'>
              <Input
                placeholder="Search image"
                onChange={debounce(onSearchImage, 1000)}
                allowClear
              />
              {isSearchingImage && (
                <Spin spinning />
              )}
            </div>
            {images.length > 0 && (
              <div className='columns-4 gap-2'>
                {imageGallery}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default AddImageModal