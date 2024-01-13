'use client';
import { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import useBlogPosts from '@/hooks/useBlogPosts';
import { Flex } from 'antd';

const Article = ({
  params,
}: {
  params: { article_id: number }
}) => {
  const articleId = +params.article_id;
  const {
    data: article,
    isLoading,
    isError
  } = useBlogPosts().getOne(articleId)
  const [isSaved, setIsSaved] = useState(true);

  const editorRef = useRef(null);
  const html = useRef(null);

  return !isError && !isLoading && article && (
    <Flex justify='center' style={{ height: "100%" }}>
      <Editor
        ref={editorRef}
        onInit={(evt, ref) => {
          html.current = ref.startContent
          // onSaveEditor(html.current);
        }}
        apiKey='nxfnn8l3r29y3xnokhfghz70vvqj5b8uut5pcyp3i8scsjhx'
        // setup={ (editor) => {
        //   editor.on('change', (e) => {
        //     $.ajax({
        //       type: 'POST',
        //       url: 'php/save.php',
        //       data: {
        //         editor: tinymce.get('editor').getContent()
        //       },
        //       success: function(data){
        //         $('#editor').val('');
        //         console.log(data)
        //       }
        //     })
        //   })
        // }}
        init={{
          height: '100%',
          width: 700,
          menubar: false,
          plugins: 'wordcount',
          autosave_ask_before_unload: true,
          autosave_interval: '30s',
          skin: 'borderless',
          toolbar: 'undo redo | blocks | forecolor backcolor | bold italic underline strikethrough | link image blockquote codesample | align bullist numlist | code',
          content_style: `
            img {
              max-width: 100%;
            }
            .tox-tinymce {
              border: 0 !important;
            }
            .tox-editor-header {
              box-shadow: none !important;
            }
          `
          // contextmenu: 'export wordcount ai tinymcespellchecker autocorrect a11ychecker typography inlinecss',
          // plugins: 'ai tinycomments mentions anchor autolink codesample emoticons image link lists media searchreplace table wordcount checklist mediaembed casechange export formatpainter pageembed permanentpen footnotes advtemplate advtable advcode editimage tableofcontents mergetags powerpaste tinymcespellchecker autocorrect a11ychecker typography inlinecss',
          // toolbar: 'export | undo redo | blocks fontfamily fontsize | bold italic underline strikethrough removeformat | link image media table | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons wordcount',
          // tinycomments_mode: 'embedded',
          // tinycomments_author: 'Author name',
          // ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
        }}
        initialValue={article.html}
        onEditorChange={(content) => {
          html.current = content
          setIsSaved(editorRef.current?.editor?.isNotDirty)
        }}
      />
    </Flex>
  )
}

export default Article;