'use client';;
import { isEmpty } from 'lodash';
import { Button, Image, Input, message, Modal, Select, Spin, Upload } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Blurhash } from "react-blurhash";
import axios from 'axios';
import { SearchOutlined } from '@ant-design/icons';
import { searchYouTubeVideos } from '@/app/app/actions';
import { IconSparkles } from '@tabler/icons-react';
import { imageStyles } from '@/options';
import usePricingModal from '@/hooks/usePricingModal';
import useUser from '@/hooks/useUser';
import queryKeys from '@/helpers/queryKeys';
import { useQueryClient } from '@tanstack/react-query';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (image?: any, video?: any) => void;
  disableYoutube?: boolean;
}

const AddMediaModal = ({ open, onClose, onSubmit, disableYoutube }: Props) => {
  const [tab, setTab] = useState("upload");
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [isSearchingVideos, setIsSearchingVideos] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ href: "", alt: "" });
  const [selectedVideo, setSelectedVideo] = useState();
  const [imageLink, setImageLink] = useState("");
  const [generatedImageLink, setGeneratedImageLink] = useState("");
  const [imageStyle, setImageStyle] = useState();
  const user = useUser();
  const pricingModal = usePricingModal();
  const queryClient = useQueryClient();

  const resetModal = () => {
    setImageLink("");
    setSelectedImage({ href: "", alt: "" });
    setSelectedVideo(undefined);
    setImageStyle(undefined);
    setGeneratedImageLink("");
    setImages([]);
    setVideos([]);
    setIsSearchingImage(false);
    setIsSearchingVideos(false);
    setIsGeneratingImage(false)
  }

  useEffect(() => {
    setTab("upload");
  }, [open])

  useEffect(() => {
    resetModal();
    const modals = document.querySelectorAll('.ant-modal-root');
    if (modals.length > 1) {
      modals[0].remove()
    }
  }, [tab])

  const onSearchImage = async (query: string) => {
    try {
      setIsSearchingImage(true)
      const { data: imagesFound } = await axios.post('/api/images/search', {
        query,
        count: 12,
      })
      setImages(imagesFound);
      setIsSearchingImage(false)
    } catch {
      setIsSearchingImage(false)
    }
  }

  const onSearchVideo = async (query: string) => {
    try {
      setIsSearchingVideos(true)
      const results = await searchYouTubeVideos(query)
      setVideos(results);
      setIsSearchingVideos(false)
    } catch {
      setIsSearchingVideos(false)
    }
  }

  const onGeneratingImage = async (query: string) => {
    try {
      if (!query || !imageStyle) return;

      if (!user.premium.ai_images) {
        return pricingModal.open(true)
      }

      setIsGeneratingImage(true)
      const { data: base64Url } = await axios.post('/api/images/generate', { user_id: user.id, query, image_style: imageStyle });

      queryClient.invalidateQueries({
        queryKey: queryKeys.user()
      });
      if (!base64Url) {
        message.info('We couldn\'t generate an image from your query')
        setIsGeneratingImage(false);
        return;
      }
      setGeneratedImageLink(base64Url)
      setIsGeneratingImage(false)
    } catch (e) {
      if (e?.response?.status === 401) {
        return pricingModal.open(true)
      }
      setIsGeneratingImage(false)
    }
  }

  const onSubmitImage = () => {
    if (tab === "upload" || tab === "link") {
      if (imageLink) {
        onSubmit({ src: imageLink, alt: "" })
      }
    }

    if (tab === "unsplash") {
      if (selectedImage.href) {
        onSubmit({ src: selectedImage.href, alt: selectedImage.alt })
      }
    }

    if (tab === "ai") {
      if (generatedImageLink) {
        onSubmit({ src: generatedImageLink, alt: "" })
      }
    }

    if (tab === "youtube") {
      if (selectedVideo) {
        onSubmit(undefined, selectedVideo)
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
      title="Add media"
      onOk={onSubmitImage}
      destroyOnClose
      okText="Add"
      width={tab === "youtube" && !isEmpty(videos) ? 1000 : tab === "ai" ? 700 : undefined}
      okButtonProps={{
        disabled:
          tab === "upload" && !imageLink ||
          tab === "link" && !imageLink ||
          tab === "unsplash" && !selectedImage.href ||
          tab === "ai" && !generatedImageLink ||
          tab === "youtube" && !selectedVideo ||
          isSearchingImage ||
          isSearchingVideos ||
          isGeneratingImage
      }}
      styles={{
        body: {
          maxHeight: 700,
          overflow: "scroll"
        }
      }}
    >
      <div className='flex flex-col gap-4 w-full mt-2'>
        <div className='flex flex-row gap-2'>
          <Button
            type={tab === "upload" ? "primary" : "default"}
            onClick={() => setTab("upload")}
          >
            Upload
          </Button>
          <Button
            type={tab === "link" ? "primary" : "default"}
            onClick={() => setTab("link")}
          >
            Link
          </Button>
          <Button
            type={tab === "unsplash" ? "primary" : "default"}
            onClick={() => setTab("unsplash")}
          >
            Unsplash
          </Button>
          {!disableYoutube && (
            <Button
              type={tab === "youtube" ? "primary" : "default"}
              onClick={() => setTab("youtube")}
            >
              Youtube
            </Button>
          )}
          <Button
            type={tab === "ai" ? "primary" : "default"}
            onClick={() => setTab("ai")}
          >
            <div className="flex flex-row gap-1 items-center justify-center">
              <p>AI</p>
              <IconSparkles stroke={1.5} size={18} />
            </div>
          </Button>
        </div>

        {tab === "upload" && (
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

        {tab === "link" && (
          <Input placeholder="Image link" onChange={(e) => setImageLink(e.currentTarget.value)} />
        )}

        {tab === "unsplash" && (
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-row gap-2'>
                <Input
                  id="input-unsplash-search"
                  placeholder="Search images"
                  allowClear
                  disabled={isSearchingImage}
                />
                <Button
                  onClick={() => onSearchImage(document.getElementById('input-unsplash-search').value)}
                  icon={<SearchOutlined />}
                  className='w-fit'
                  disabled={isSearchingImage}
                >
                  Search
                </Button>
              </div>
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

        {tab === "ai" && (
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-row gap-2'>
                <Input
                  id="input-ai-image"
                  placeholder="Describe the image you want to generate"
                  allowClear
                  disabled={isGeneratingImage}
                />
                <Select
                  showSearch
                  placeholder="Image styles"
                  className='w-[400px]'
                  options={imageStyles.map((i) => ({
                    ...i,
                    label: i.name,
                    value: i.name
                  }))}
                  onSelect={setImageStyle}
                  disabled={isGeneratingImage}
                />
                <Button
                  onClick={() => onGeneratingImage(document.getElementById('input-ai-image').value)}
                  // icon={<SearchOutlined />}
                  className='w-fit'
                  disabled={isGeneratingImage}
                >
                  Generate
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

        {tab === "youtube" && (
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-row gap-2'>
                <Input
                  id="input-youtube-search"
                  placeholder="Search Youtube video"
                  allowClear
                  disabled={isSearchingVideos}
                />
                <Button
                  onClick={() => onSearchVideo(document.getElementById('input-youtube-search').value)}
                  icon={<SearchOutlined />}
                  className='w-fit'
                  disabled={isSearchingVideos}
                >
                  Search
                </Button>
              </div>
              {isSearchingVideos && (
                <Spin spinning />
              )}
            </div>
            {videos.length > 0 && (
              <div className='grid grid-cols-4 gap-2 h-[500px] overflow-scroll'>
                {videos.map((video) => {
                  return (
                    <div
                      key={video.id.videoId}
                      className={`cursor-pointer rounded-md flex flex-col gap-2 border-2 hover:border-primary-500 p-1 transition-all ${selectedVideo?.id?.videoId === video.id.videoId ? "border-primary-500" : "border-transparent"}`}
                      onClick={() => setSelectedVideo(video)}
                    >
                      <img
                        src={video.snippet.thumbnails.high.url}
                        className="rounded-md"
                      />
                      <p>{video.snippet.title}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default AddMediaModal