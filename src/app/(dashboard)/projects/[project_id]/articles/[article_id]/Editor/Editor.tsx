import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import useBlogPosts from "@/hooks/useBlogPosts";
import { useEffect, useState } from "react";
import { message } from "antd";
import { debounce } from "lodash";
import "./style.css";

type Props = {
  articleId: number;
}

export default function Editor({ articleId }: Props) {
  // Creates a new editor instance.
  const editor = useCreateBlockNote();
  const { getOne, update: updateBlogPost } = useBlogPosts()
  const { data: article } = getOne(articleId);
  const [isLoaded, setIsLoaded] = useState(false);

  const exportHTML = async () => {
    const content = await editor.blocksToHTMLLossy();
    return content
  }

  const exportMarkdown = async () => {
    const content = await editor.blocksToMarkdownLossy();
    return content
  }

  // For initialization; on mount, convert the initial HTML to blocks and replace the default editor's content
  useEffect(() => {
    async function init() {
      console.log(article.html);
      const blocks = await editor.tryParseHTMLToBlocks(article.html);
      console.log(blocks);
      editor.replaceBlocks(editor.document, blocks);
      setIsLoaded(true)
    }
    init();
  }, [editor, article]);

  const debounceUpdate = async () => {
    const markdown = await exportMarkdown();
    const html = await exportHTML();
    if (isLoaded && article.markdown !== markdown) {
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
    <BlockNoteView
      editor={editor}
      theme="light"
      editable
      onChange={debounce(debounceUpdate, 1500)}
      slashMenu
      linkToolbar
      formattingToolbar
      filePanel
    />
  );
}
