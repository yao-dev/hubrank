'use client'
import '@mdxeditor/editor/style.css';
import { type ForwardedRef } from 'react';
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

const CalloutCustomDirectiveDescriptor: DirectiveDescriptor = {
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
}

export default function MDEditor({
  ref,
  articleId,
  ...props
}: { ref: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps & Props) {
  const { getOne, update: updateBlogPost } = useBlogPosts()
  const { data: article } = getOne(articleId);

  const exportHTML = async () => {
    // const content = await editor.blocksToHTMLLossy();
    // return content
  }

  const exportMarkdown = async () => {
    return ref?.current?.getMarkdown()
  }

  // For initialization; on mount, convert the initial HTML to blocks and replace the default editor's content
  // useEffect(() => {
  //   if (article?.markdown) {
  //     ref?.current?.setMarkdown(article.markdown)
  //   }
  // }, [article]);

  const debounceUpdate = async () => {
    const markdown = await exportMarkdown();
    const html = await exportHTML();
    if (article.markdown !== markdown) {
      await updateBlogPost.mutateAsync({
        id: article.id,
        markdown,
        html,
      });
      message.success('Saved.');
    }
  }

  if (!article) return null;

  return (
    <MDXEditor
      plugins={[
        // diffSourcePlugin({ diffMarkdown: props.markdown, viewMode: 'rich-text' }),
        directivesPlugin({ directiveDescriptors: [CalloutCustomDirectiveDescriptor] }),
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
      {...props}
      ref={ref}
    />
  );
}
