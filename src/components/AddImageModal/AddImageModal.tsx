'use client';;
import { debounce } from 'lodash';
import { Button, Image, Input, message, Modal, Spin, Upload } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Blurhash } from "react-blurhash";
import axios from 'axios';
import { SearchOutlined } from '@ant-design/icons';

const AddImageModal = ({ open, onClose, onSubmit }) => {
  const [imageTab, setImageTab] = useState("upload");
  const [images, setImages] = useState([]);
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ href: "", alt: "" });
  const [imageLink, setImageLink] = useState("");
  const [generatedImageLink, setGeneratedImageLink] = useState("");

  const resetModal = () => {
    setImageLink("");
    setSelectedImage({ href: "", alt: "" });
    setGeneratedImageLink("");
    setImages([]);
    setIsSearchingImage(false);
    setIsGeneratingImage(false)
  }

  useEffect(() => {
    setImageTab("upload")
  }, [open])

  useEffect(() => {
    resetModal()
  }, [imageTab])

  const onSearchImage = async (e: any) => {
    try {
      setIsSearchingImage(true)
      const { data: imagesFound } = await axios.post('/api/images/search', {
        query: e.currentTarget.value,
        count: 12,
      })
      setImages(imagesFound);
      setIsSearchingImage(false)
    } catch {
      setIsSearchingImage(false)
    }
  }

  const onGeneratingImage = async (query: string) => {
    try {
      if (!query) return;
      setIsGeneratingImage(true)
      const { data: generatedImageBlob } = await axios.post('/api/images/generate', { query })
      if (!generatedImageBlob) {
        message.info('We couldn\'t generate an image from your query')
        setIsGeneratingImage(false);
        return;
      }
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          if (typeof reader.result === "string") {
            console.log('reader.result', reader.result)
            setGeneratedImageLink(reader.result)
          }
        },
        false,
      );
      reader.readAsDataURL(generatedImageBlob);
      setIsGeneratingImage(false)
    } catch {
      setIsGeneratingImage(false)
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

    if (imageTab === "ai") {
      if (generatedImageLink) {
        onSubmit({ src: generatedImageLink, alt: "" })
      }
    }

    onClose();
    resetModal();
  }

  const imageGallery = useMemo(() => {
    if (!images.length) return [];

    return images.map((image) => {
      return (
        <div key={image.href} className='relative mb-2 h-[128px]'>
          <Image
            src={image.thumb}
            alt={image.alt}
            className={`w-full h-full object-cover rounded-md hover:border-2 hover:border-primary-500 hover:p-1 transition-all ${selectedImage.href === image.href ? "border-2 border-primary-500 p-1" : ""}`}
            preview={false}
            width="100%"
            height="100%"
            onClick={() => setSelectedImage(image)}
            placeholder={(
              <Blurhash
                hash={image.hash}
                width="100%"
                height="100%"
                resolutionX={32}
                resolutionY={32}
                punch={1}
              />
            )}
          />
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
      okText="Add"
      okButtonProps={{
        disabled: imageTab === "upload" && !imageLink || imageTab === "link" && !imageLink || imageTab === "unsplash" && !selectedImage.href || imageTab === "ai" && !generatedImageLink || isSearchingImage || isGeneratingImage
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
          <Button
            type={imageTab === "ai" ? "primary" : "default"}
            onClick={() => setImageTab("ai")}
          >
            AI
          </Button>
        </div>

        {imageTab === "upload" && (
          <div className='flex flex-col gap-4'>
            <Upload.Dragger
              name={'image'}
              multiple={false}
              accept={"image/jpg,image/png,image/gif"}
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

        {imageTab === "ai" && (
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-row gap-2'>
                <Input
                  id="input-ai-image"
                  placeholder="Describe the image you want to generate"
                  allowClear
                  disabled={isGeneratingImage}
                />
                <Button
                  onClick={() => onGeneratingImage(document.getElementById('input-ai-image').value)}
                  icon={<SearchOutlined />}
                  className='w-fit'
                  disabled={isGeneratingImage}
                >
                  Search
                </Button>
              </div>

              {isGeneratingImage && (
                <Spin spinning tip="This can take few seconds" />
              )}
            </div>
            {generatedImageLink && (
              <div className='columns-2'>
                <img
                  src={generatedImageLink}
                  className={`h-[250px] rounded-md`}
                  loading="lazy"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default AddImageModal