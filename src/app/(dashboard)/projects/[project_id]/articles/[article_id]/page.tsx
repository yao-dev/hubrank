'use client';;
import { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import useBlogPosts from '@/hooks/useBlogPosts';
import { App, Button, Col, Dropdown, Flex, Form, Input, Row, Spin, Typography } from 'antd';
import { getSummary } from 'readability-cyr';
import { useRouter } from 'next/navigation';
import { CloudUploadOutlined, CopyOutlined } from '@ant-design/icons';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import "./styles.css";
import { Metadata } from 'next';

const { Text } = Typography;

const Article = ({
  params,
}: {
  params: { article_id: number }
}) => {
  const articleId = +params.article_id;
  const {
    data: article,
    isPending,
    isError
  } = useBlogPosts().getOne(articleId)
  const [isSaved, setIsSaved] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();
  const { message } = App.useApp()

  const editorRef = useRef<any>(null);
  const html = useRef<any>(null);
  const text = useRef<any>(null);
  const markdown = useRef<any>(null);

  const getReadabilityName = (value: any) => {
    if (isNaN(value)) {
      return ""
    }

    const readabilityScore = Math.round(value);

    if (readabilityScore >= 90) {
      return '5th grade'
    }
    if (readabilityScore >= 80) {
      return '6th grade'
    }
    if (readabilityScore >= 70) {
      return '7th grade'
    }
    if (readabilityScore >= 60) {
      return '8th/9th grade'
    }
    if (readabilityScore >= 50) {
      return '10th/12th grade'
    }
    if (readabilityScore >= 30) {
      return 'College'
    }
    if (readabilityScore >= 10) {
      return 'College graduate'
    }
    return 'Professional'
  }

  if (isError) return null

  return (
    <Spin spinning={isPending || !article}>
      <Row>
        <Col xs={0} sm={6} md={0} lg={6} />
        <Col xs={24} sm={11} md={16} lg={11}>
          {article && (
            <Editor
              ref={editorRef}
              onInit={(evt, ref) => {
                html.current = ref.startContent
                text.current = ref.contentAreaContainer?.innerText || ""
                markdown.current = NodeHtmlMarkdown.translate(ref.startContent)
                // onSaveEditor(html.current);
                setStats(getSummary(text.current))
              }}
              apiKey='nxfnn8l3r29y3xnokhfghz70vvqj5b8uut5pcyp3i8scsjhx'
              // setup={ (editor) => {
              //   editor.on('change', (e) => {
              // tinymce.get('editor').getContent()
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
                text.current = editorRef.current?.editor?.contentAreaContainer?.innerText || ""
                markdown.current = NodeHtmlMarkdown.translate(content)
                setIsSaved(editorRef.current?.editor?.isNotDirty)
                setStats(getSummary(text.current))
              }}
            />
          )}
        </Col>
        <Col xs={0} sm={5} md={6} lg={{ span: 6, offset: 1 }} >
          {!!stats && (
            <Flex vertical style={{ position: "sticky", top: 16 }}>
              <Flex justify='end' style={{ marginBottom: 16 }} gap="small">
                <Button icon={<CloudUploadOutlined />}>Export</Button>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: '1',
                        label: "html",
                        onClick: () => {
                          navigator.clipboard.writeText(html.current);
                          message.success("html copied to clipboard")
                        }
                      },
                      {
                        key: '2',
                        label: "markdown",
                        onClick: () => {
                          navigator.clipboard.writeText(markdown.current);
                          message.success("markdown copied to clipboard")
                        }
                      },
                      {
                        key: '3',
                        label: "text",
                        onClick: () => {
                          navigator.clipboard.writeText(text.current);
                          message.success("text copied to clipboard")
                        }
                      },
                    ]
                  }}
                  placement="bottomLeft"
                >
                  <Button icon={<CopyOutlined />}>Copy</Button>
                </Dropdown>
              </Flex>

              <Form
                autoComplete="off"
                layout="vertical"
              >
                <Form.Item label="Slug" rules={[{ required: true, type: "string", message: "Add a slug" }]}>
                  <Input placeholder='Add a slug' />
                </Form.Item>
                <Form.Item label="Meta description" rules={[{ required: false, type: "string", max: 160, message: "Add a meta description" }]}>
                  <Input placeholder='Add a meta description' count={{ show: true, max: 160 }} />
                </Form.Item>
              </Form>

              <Text strong>Readability</Text>
              <Text style={{ marginBottom: 6 }}>{getReadabilityName(stats.FleschKincaidGrade)}</Text>

              <Text strong>Reading time</Text>
              <Text style={{ marginBottom: 6 }}>{stats.readingTime}</Text>

              <Text strong>Words</Text>
              <Text style={{ marginBottom: 6 }}>{stats.words}</Text>

              <Text strong>Sentences</Text>
              <Text style={{ marginBottom: 6 }}>{stats.sentences}</Text>

              <Text strong>Paragraphs</Text>
              <Text style={{ marginBottom: 6 }}>{stats.paragraphs}</Text>
            </Flex>
          )}


          <div id="emojicom-widget-inline" />
        </Col>
      </Row>
    </Spin>
  )

  // return !isError && !isPending && article && (
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