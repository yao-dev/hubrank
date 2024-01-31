'use client';;
import { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import useBlogPosts from '@/hooks/useBlogPosts';
import { Button, Col, Flex, Row, Typography } from 'antd';
import { getSummary } from 'readability-cyr';
import { useRouter } from 'next/navigation';
import {
  CloudUploadOutlined,
  CopyOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';

const { Text } = Typography;

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
  const [stats, setStats] = useState(null);
  const router = useRouter();

  const editorRef = useRef(null);
  const html = useRef(null);

  if (!(!isError && !isLoading && article)) return null

  return (
    <Row>
      <Col span={6}>
        <Button onClick={() => router.back()} icon={<ArrowLeftOutlined />}>Back</Button>
      </Col>
      <Col span={12}>
        <Editor
          ref={editorRef}
          onInit={(evt, ref) => {
            html.current = ref.startContent
            // onSaveEditor(html.current);
            setStats(getSummary(ref.contentAreaContainer?.innerText || ""))
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
            content_css: 'default',
            height: '100%',
            // width: 700,
            // menubar: false,
            plugins: [
              'autolink', 'autoresize', 'link', 'lists', 'media',
              'image', 'quickbars', 'help'
            ],
            autosave_ask_before_unload: true,
            autosave_interval: '30s',
            skin: 'borderless',
            // toolbar: 'undo redo | blocks | forecolor backcolor | bold italic underline strikethrough | link image blockquote | align bullist numlist | code',
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
          `,
            toolbar: false,
            menubar: false,
            inline: true,
            quickbars_insert_toolbar: 'image media',
            quickbars_selection_toolbar: 'undo redo | blocks | forecolor backcolor | bold italic underline strikethrough | link blockquote | align bullist numlist | code',
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
            setStats(getSummary(editorRef.current?.editor?.contentAreaContainer?.innerText || ""))
          }}
        />
      </Col>
      <Col span={6}>
        {!!stats && (
          <Flex vertical align='end'>
            <Flex align='end' style={{ marginBottom: 16 }} gap="small">
              <Button icon={<CloudUploadOutlined />}>Export</Button>
              <Button icon={<CopyOutlined />}>Copy</Button>
            </Flex>

            <Flex vertical align='end' style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 16 }}>Readability</Text>
              <Text style={{ fontSize: 22 }} strong>Grade {Math.round(stats.FleschKincaidGrade)}</Text>
            </Flex>
            <Text style={{ fontSize: 16 }}>Reading time: <Text strong>{stats.readingTime}</Text></Text>
            <Text style={{ fontSize: 16 }}>Words: <Text strong>{stats.words}</Text></Text>
            <Text style={{ fontSize: 16 }}>Sentences: <Text strong>{stats.sentences}</Text></Text>
            <Text style={{ fontSize: 16 }}>Paragraphs: <Text strong>{stats.paragraphs}</Text></Text>
          </Flex>
        )}


        <div id="emojicom-widget-inline" />
      </Col>
    </Row>
  )

  // return !isError && !isLoading && article && (
  //   <Flex justify='center' style={{ height: "100%", width: 700, margin: "auto" }}>
  //     <Editor
  //       ref={editorRef}
  //       onInit={(evt, ref) => {
  //         html.current = ref.startContent
  //         // onSaveEditor(html.current);
  //       }}
  //       apiKey='nxfnn8l3r29y3xnokhfghz70vvqj5b8uut5pcyp3i8scsjhx'
  //       // setup={ (editor) => {
  //       //   editor.on('change', (e) => {
  //       //     $.ajax({
  //       //       type: 'POST',
  //       //       url: 'php/save.php',
  //       //       data: {
  //       //         editor: tinymce.get('editor').getContent()
  //       //       },
  //       //       success: function(data){
  //       //         $('#editor').val('');
  //       //         console.log(data)
  //       //       }
  //       //     })
  //       //   })
  //       // }}
  //       init={{
  //         content_css: 'default',
  //         height: '100%',
  //         width: 700,
  //         // menubar: false,
  //         plugins: [
  //           'autolink', 'autoresize', 'link', 'lists', 'media',
  //           'image', 'quickbars', 'help'
  //         ],
  //         autosave_ask_before_unload: true,
  //         autosave_interval: '30s',
  //         skin: 'borderless',
  //         // toolbar: 'undo redo | blocks | forecolor backcolor | bold italic underline strikethrough | link image blockquote | align bullist numlist | code',
  //         content_style: `
  //           img {
  //             max-width: 100%;
  //           }
  //           .tox-tinymce {
  //             border: 0 !important;
  //           }
  //           .tox-editor-header {
  //             box-shadow: none !important;
  //           }
  //         `,
  //         toolbar: false,
  //         menubar: false,
  //         inline: true,
  //         quickbars_insert_toolbar: 'image media',
  //         quickbars_selection_toolbar: 'undo redo | blocks | forecolor backcolor | bold italic underline strikethrough | link blockquote | align bullist numlist | code',
  //         // contextmenu: 'export wordcount ai tinymcespellchecker autocorrect a11ychecker typography inlinecss',
  //         // plugins: 'ai tinycomments mentions anchor autolink codesample emoticons image link lists media searchreplace table wordcount checklist mediaembed casechange export formatpainter pageembed permanentpen footnotes advtemplate advtable advcode editimage tableofcontents mergetags powerpaste tinymcespellchecker autocorrect a11ychecker typography inlinecss',
  //         // toolbar: 'export | undo redo | blocks fontfamily fontsize | bold italic underline strikethrough removeformat | link image media table | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons wordcount',
  //         // tinycomments_mode: 'embedded',
  //         // tinycomments_author: 'Author name',
  //         // ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
  //       }}
  //       initialValue={article.html}
  //       onEditorChange={(content) => {
  //         html.current = content
  //         setIsSaved(editorRef.current?.editor?.isNotDirty)
  //       }}
  //     />
  //   </Flex>
  // )
}

export default Article;