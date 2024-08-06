'use client';
import '@mdxeditor/editor/style.css';
import { useEffect, useRef, useState } from 'react';
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  linkDialogPlugin,
  CreateLink,
  imagePlugin,
  InsertImage,
  InsertTable,
  tablePlugin,
  ListsToggle,
  BlockTypeSelect,
  DialogButton,
  usePublisher,
  insertDirective$,
  directivesPlugin,
  DirectiveDescriptor,
  linkPlugin,
} from '@mdxeditor/editor';
import { message } from 'antd';
import useBlogPosts from '@/hooks/useBlogPosts';
import { IconBrandYoutube } from '@tabler/icons-react';
import './style.css';
import { marked } from 'marked';
import { debounce } from 'lodash';

const YouTubeButton = () => {
  // grab the insertDirective action (a.k.a. publisher) from the
  // state management system of the directivesPlugin
  const insertDirective = usePublisher(insertDirective$)

  return (
    <DialogButton
      tooltipTitle="Insert Youtube video"
      submitButtonTitle="Insert video"
      dialogInputPlaceholder="Paste the youtube video URL"
      buttonContent={<IconBrandYoutube stroke={1.25} />}
      onSubmit={(url) => {
        const videoId = new URL(url).searchParams.get('v')
        if (videoId) {
          insertDirective({
            name: 'youtube',
            type: 'textDirective',
            attributes: { id: videoId },
            children: []
          } as any)
        } else {
          alert('Invalid YouTube URL')
        }
      }}
    />
  )
}

const YoutubeDirective: DirectiveDescriptor = {
  name: 'youtube',
  testNode(node) {
    return node.name === 'youtube'
  },
  attributes: [],
  hasChildren: false,
  type: "textDirective",
  Editor: (props) => {
    console.log(props)
    return (
      <iframe width="560" height="315" src={`https://www.youtube.com/embed/${props.mdastNode.attributes.id}`} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    )
  }
}

type Props = {
  articleId: number;
  onChange?: (markdown: string) => void
}

const MDEditor = ({
  articleId,
  onChange,
  ...props
}: MDXEditorProps & Props) => {
  const { getOne, update: updateBlogPost } = useBlogPosts()
  const { data: article } = getOne(articleId);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<MDXEditorMethods>(null);

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true)
    }, 1000)
  }, []);

  const debounceUpdate = (newMarkdown: string) => {
    if (isLoaded && article.markdown !== newMarkdown) {
      updateBlogPost.mutate({
        id: article.id,
        markdown: newMarkdown,
        html: marked.parse(newMarkdown),
      });
      onChange?.(newMarkdown)
      message.success('Saved.');
    }
  }

  return (
    <MDXEditor
      plugins={[
        directivesPlugin({ directiveDescriptors: [YoutubeDirective] }),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              {' '}
              <UndoRedo />
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <InsertTable />
              <ListsToggle />
              <YouTubeButton />
              <InsertImage />
              <CreateLink />
            </>
          )
        }),
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        linkPlugin(),
        thematicBreakPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        tablePlugin(),
        listsPlugin(),
        markdownShortcutPlugin(),
      ]}
      onChange={debounce(debounceUpdate, 1500)}
      {...props}
      ref={ref}
      className={`prose min-w-full w-fit ${props.className ?? ""}`}
    />
  );
}

export default MDEditor