'use client';;
import useBlogPosts from '@/hooks/useBlogPosts';
import { useCurrentEditor, EditorProvider, FloatingMenu, BubbleMenu, Editor } from '@tiptap/react';
import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Dropcursor from '@tiptap/extension-dropcursor';
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBlockquote,
  IconBold,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconPhoto,
  IconSparkles,
  IconUnderline,
} from '@tabler/icons-react';
import { IconStrikethrough } from '@tabler/icons-react';
import Youtube from '@tiptap/extension-youtube';
import { debounce } from 'lodash';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import Image from '@tiptap/extension-image';
import './style.css';
import { createContext, useContext, useState } from 'react';
import AddMediaModal from '@/components/AddMediaModal/AddMediaModal';
import { DOMSerializer } from '@tiptap/pm/model';
import { Dropdown } from 'antd';
import { getAIAutocomplete } from '@/app/app/actions';

const AIContext = createContext({ content: "" })

const AIMenu = ({ onClick }) => {
  const context = useContext(AIContext);

  if (!context?.content) return null;

  return (
    <Dropdown
      menu={{
        items: [
          { key: '1', label: "Fix spelling", onClick: () => onClick("Fix spelling", context) },
          { key: '3', label: "Expand", onClick: () => onClick("Expand", context) },
          { key: '5', label: "Simplify", onClick: () => onClick("Simplify", context) },
          { key: '6', label: "Rephrase", onClick: () => onClick("Rephrase", context) },
          { key: '7', label: "Paraphrase", onClick: () => onClick("Paraphrase", context) },
          { key: '8', label: "Summarize", onClick: () => onClick("Summarize", context) },
        ]
      }} trigger={['click']}>
      <div className={`cursor-pointer p-1 flex flex-row gap-1 items-center justify-center rounded-md hover:bg-primary-500 hover:text-white transition-all`}>
        <p>AI</p>
        <IconSparkles stroke={1.5} />
      </div>
    </Dropdown>
  )
}

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

  const addImage = () => {
    setIsImageModalOpen(true)
  }

  const onAI = async (type, selection) => {
    const response = await getAIAutocomplete(type, selection.content);
    editor.commands.setTextSelection({ from: selection.from, to: selection.to })
    editor.commands.insertContentAt({ from: selection.from, to: selection.to }, response.text)
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
        <AddMediaModal
          open={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onSubmit={(image, video) => {
            if (image?.src) {
              editor.chain().focus().setImage({ src: image.src, alt: image.alt }).run()
            }
            if (video) {
              editor.commands.setYoutubeVideo({
                src: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                // width: 'auto',
              });
            }
            document.querySelectorAll(`[rc-util-key^="rc-util-locker"]`).forEach(element => {
              element.remove();
            });
          }}
        />
      </div>
    ),
    ai: (
      <AIMenu onClick={onAI} />
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
    ai
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
      {ai}
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
  const { update: updateBlogPost } = useBlogPosts();
  const [htmlSelection, setHTMLSelection] = useState()

  const extensions = [
    Dropcursor,
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

  const getHTMLFromSelection = (editor: Editor, selection: Selection) => {
    const slice = selection.content();
    const serializer = DOMSerializer.fromSchema(editor.schema);
    const fragment = serializer.serializeFragment(slice.content);
    const div = document.createElement('div');
    div.appendChild(fragment);

    return div.innerHTML;
  }

  return (
    <AIContext.Provider value={htmlSelection}>
      <div id="hubrank-editor">
        <EditorProvider
          slotBefore={readOnly ? null : (
            <MenuBar />
          )}
          extensions={extensions}
          content={content}
          editorProps={{
            attributes: {
              class: 'prose prose-md focus:outline-none m-0 py-5',
            },
          }}
          /**
          * This option gives us the control to enable the default behavior of rendering the editor immediately.
          */
          immediatelyRender
          /**
  * This option gives us the control to disable the default behavior of re-rendering the editor on every transaction.
  */
          shouldRerenderOnTransaction
          // This function will be used to compare the previous and the next state
          // equalityFn={deepEqual}
          onUpdate={debounce(onEditorChange, 500) as any}
          editable={!readOnly}
          onSelectionUpdate={(props) => {
            if (props.transaction.selection.ranges[0].$from && props.transaction.selection.ranges[0].$to) {
              const htmlFromSelection = getHTMLFromSelection(props.editor, props.transaction.selection);
              setHTMLSelection({ content: htmlFromSelection, from: props.transaction.selection.ranges[0].$from.pos, to: props.transaction.selection.ranges[0].$to.pos })
            }
          }}
        >
          <FloatingMenus />
        </EditorProvider>
      </div>
    </AIContext.Provider>
  );
}

export default TiptapEditor