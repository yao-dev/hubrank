'use client';;
import useBlogPosts from '@/hooks/useBlogPosts';
import { useCurrentEditor, EditorProvider, FloatingMenu, BubbleMenu, Editor } from '@tiptap/react';
import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBlockquote,
  IconBold,
  IconBrandYoutube,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconPhoto,
  IconUnderline,
} from '@tabler/icons-react';
import { IconStrikethrough } from '@tabler/icons-react';
import Youtube from '@tiptap/extension-youtube';
import { debounce } from 'lodash';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import Image from '@tiptap/extension-image';
import './style.css';
import { useState } from 'react';
import AddImageModal from '@/components/AddImageModal/AddImageModal';

const MenuButton = ({
  Icon,
  actionName,
  toggleName,
  customOnClick,
  customIsActive,
}: {
  Icon: any;
  actionName?: string;
  toggleName?: string;
  customOnClick?: () => void;
  customIsActive?: boolean;
}) => {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  const isDisabled = toggleName && !editor?.can()?.chain()?.focus()?.[toggleName]?.()?.run?.();
  const onClick = () => isDisabled ? null : customOnClick ? customOnClick() : editor.chain().focus()?.[toggleName]().run();
  const isActive = customIsActive || actionName && editor.isActive(actionName)

  return (
    <div onClick={onClick} className={`cursor-pointer p-1 flex items-center justify-center rounded-md transition-all ${isActive ? 'bg-primary-500 text-white' : ''}  ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-primary-500 hover:text-white'}`}>
      <Icon stroke={1.5} />
    </div>
  )
}

const useMenuButtons = () => {
  const { editor } = useCurrentEditor();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  if (!editor) {
    return {}
  }

  const addYoutubeVideo = () => {
    const url = prompt('Enter YouTube URL')

    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 'auto',
      })
    }
  }

  const addImage = () => {
    setIsImageModalOpen(true)
  }

  return {
    undo: (
      <MenuButton
        Icon={IconArrowBackUp}
        actionName="undo"
        toggleName="undo"
      />
    ),
    redo: (
      <MenuButton
        Icon={IconArrowForwardUp}
        actionName="redo"
        toggleName="redo"
      />
    ),
    h1: (
      <MenuButton
        Icon={IconH1}
        customOnClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        customIsActive={editor.isActive('heading', { level: 1 })}
      />
    ),
    h2: (
      <MenuButton
        Icon={IconH2}
        customOnClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        customIsActive={editor.isActive('heading', { level: 2 })}
      />
    ),
    h3: (
      <MenuButton
        Icon={IconH3}
        customOnClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        customIsActive={editor.isActive('heading', { level: 3 })}
      />
    ),
    bold: (
      <MenuButton
        Icon={IconBold}
        actionName="bold"
        toggleName="toggleBold"
      />
    ),
    italic: (
      <MenuButton
        Icon={IconItalic}
        actionName="italic"
        toggleName="toggleItalic"
      />
    ),
    underline: (
      <MenuButton
        Icon={IconUnderline}
        actionName="underline"
        toggleName="toggleUnderline"
      />
    ),
    strike: (
      <MenuButton
        Icon={IconStrikethrough}
        actionName="strike"
        toggleName="toggleStrike"
      />
    ),
    codeBlock: (
      <MenuButton
        Icon={IconCode}
        actionName="codeBlock"
        toggleName="toggleCodeBlock"
      />
    ),
    bulletList: (
      <MenuButton
        Icon={IconList}
        actionName="bulletList"
        toggleName="toggleBulletList"
      />
    ),
    orderedList: (
      <MenuButton
        Icon={IconListNumbers}
        actionName="orderedList"
        toggleName="toggleOrderedList"
      />
    ),
    codeBlockquote: (
      <MenuButton
        Icon={IconBlockquote}
        actionName="codeBlockquote"
        toggleName="toggleBlockquote"
      />
    ),
    link: (
      <MenuButton
        Icon={IconLink}
        actionName="link"
        customOnClick={() => {
          if (editor.isActive('link')) {
            return editor.chain().focus().unsetLink().run()
          }
          const previousUrl = editor.getAttributes('link').href
          const url = window.prompt('URL', previousUrl)

          // cancelled
          if (url === null) {
            return
          }

          // empty
          if (url === '') {
            return editor.chain().focus().extendMarkRange('link').unsetLink().run()
          }

          // update link
          return editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }}
      />
    ),
    image: (
      <div>
        <div onClick={addImage} className={`cursor-pointer p-1 flex items-center justify-center rounded-md hover:bg-primary-500 hover:text-white transition-all`}>
          <IconPhoto stroke={1.5} />
        </div>
        <AddImageModal
          open={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onSubmit={(image) => {
            editor.chain().focus().setImage({ src: image.src, alt: image.alt }).run()
          }}
        />
      </div>
    ),
    youtube: (
      <div onClick={addYoutubeVideo} className={`cursor-pointer p-1 flex items-center justify-center rounded-md hover:bg-primary-500 hover:text-white transition-all`}>
        <IconBrandYoutube stroke={1.5} />
      </div>
    )
  }
}

const MenuBar = () => {
  const { editor } = useCurrentEditor();
  const {
    undo,
    redo,
  } = useMenuButtons();

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-row gap-1">
      {undo}
      {redo}
      {/* {h1}
        {h2}
        {h3}
        {bold}
        {italic}
        {underline}
        {strike}
        {codeBlock}
        {bulletList}
        {orderedList}
        {codeBlockquote}
        {link}
        {youtube} */}
    </div>

  )
}

const FloatingMenus = () => {
  const { editor } = useCurrentEditor()
  const {
    h1,
    h2,
    h3,
    bold,
    italic,
    underline,
    strike,
    codeBlock,
    bulletList,
    orderedList,
    codeBlockquote,
    link,
    image,
    youtube
  } = useMenuButtons();

  if (!editor) {
    return null
  }

  const menus = (
    <div className="w-fit flex flex-row gap-1 bg-white border rounded-md p-1 shadow-md transition-all">
      {h1}
      {h2}
      {h3}
      {bold}
      {italic}
      {underline}
      {strike}
      {codeBlock}
      {bulletList}
      {orderedList}
      {codeBlockquote}
      {link}
      {image}
      {youtube}
    </div>
  )

  return (
    <>
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        {menus}
      </BubbleMenu>
      <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
        {menus}
      </FloatingMenu>
    </>
  );
}

type Props = {
  articleId: number;
  onChange?: (markdown: string) => void;
  content: string;
  readOnly: boolean;
}

const TiptapEditor = ({
  articleId,
  onChange,
  content,
  readOnly
}: Props) => {
  const { update: updateBlogPost } = useBlogPosts()

  const extensions = [
    StarterKit.configure({
      history: {
        depth: 5,
        newGroupDelay: 1500
      },
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
      },
    }),
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'heading') {
          return 'What’s the title?'
        }

        return 'Write something …'
      },
    }),
    Youtube.configure({
      controls: true,
      nocookie: true,
      HTMLAttributes: {
        class: 'rounded-lg m-0 w-full',
      },
    }),
    Link.configure({
      openOnClick: true,
      autolink: true,
      defaultProtocol: 'https',
      linkOnPaste: true
    }),
    Image.configure({
      inline: true,
      allowBase64: true,
      HTMLAttributes: {
        class: 'rounded-lg m-0 w-full',
      },
    }),
  ]

  const onEditorChange = async ({ editor }: { editor: Editor }) => {
    try {
      const html = editor.getHTML();
      const markdown = NodeHtmlMarkdown.translate(html);
      await updateBlogPost.mutateAsync({
        id: articleId,
        markdown,
        html,
        text: editor.getText()
      });
      onChange?.(markdown)
    } catch (e) {
      console.log("onEditorChange error:", e);
    }
  }

  return (
    <>
      <EditorProvider
        slotBefore={readOnly ? null : <MenuBar />}
        extensions={extensions}
        content={content}
        editorProps={{
          attributes: {
            class: 'prose prose-md focus:outline-none m-0 py-5',
          },
        }}
        onUpdate={debounce(onEditorChange, 500) as any}
        editable={!readOnly}
      >
        <FloatingMenus />
      </EditorProvider>
    </>
  );
}

export default TiptapEditor