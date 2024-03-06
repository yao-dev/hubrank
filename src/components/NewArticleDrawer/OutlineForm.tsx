'use client';;
import { IconGripVertical } from "@tabler/icons-react";
import { App, Button, Card, Flex, Form, Input, Slider, Spin, Switch } from "antd";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { forwardRef, useState } from "react";
import { PlusOutlined, CloseOutlined, SyncOutlined } from "@ant-design/icons";
import { uniqueId } from "lodash";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { getUserId } from "@/helpers/user";
import useProjectId from "@/hooks/useProjectId";
import { useRouter } from "next/navigation";

export const Item = forwardRef(({ children, draggingHandle, closeIcon, style = {}, isActive, action }: any, ref: any) => {
  let customStyle = {
    ...style,
    transition: '0.2s'
  };

  return (
    <div ref={ref} style={customStyle}>
      <Card style={{ cursor: "pointer" }} bodyStyle={{ padding: 10 }}>
        <Flex align="center" justify="space-between" style={{ opacity: isActive ? 0.2 : 1 }}>
          <Flex gap="small" align="center" style={{ width: "100%" }}>
            {draggingHandle}
            {children}
          </Flex>
          <Flex gap="small">
            {action}
            {closeIcon}
          </Flex>
        </Flex>
      </Card>
    </div>
  )
});

export function SortableItem(props: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Item
      isActive={props.isActive}
      ref={setNodeRef}
      style={style}
      draggingHandle={(
        <div {...attributes}   {...listeners}>
          <IconGripVertical />
        </div>
      )}
      closeIcon={(
        <CloseOutlined onClick={props.onRemoveHeading} />
      )}
    >
      <input placeholder="Heading name" value={props.name} onChange={e => props.onChange(e.target.value)} style={{ border: 0, outline: 0, width: '100%' }} />
    </Item>
  );
}

const OutlineForm = ({
  form,
  values,
  submittingStep,
  prev
}: any) => {
  const { message, notification } = App.useApp();
  const [activeItem, setActiveItem] = useState(null);
  const [items, setItems] = useState([]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const projectId = useProjectId();
  const router = useRouter();

  const getOutline = useMutation({
    mutationFn: async (data: any) => {
      return axios.post("/api/outline-ideas", data)
    },
  });

  const onGenerateOutline = async () => {
    try {
      const { data } = await getOutline.mutateAsync({
        title: values.title,
        heading_count: form.getFieldValue("heading_count"),
        introduction: form.getFieldValue("with_introduction"),
        conclusion: form.getFieldValue("with_conclusion"),
        key_takeways: form.getFieldValue("with_key_takeways"),
        faq: form.getFieldValue("with_faq"),
        word_count: values.word_count,
        language_id: values.language_id,
        project_id: values.project_id,
        seed_keyword: values.seed_keyword,
      });
      setItems(data.outline.map((sectionName) => {
        return {
          id: uniqueId(sectionName),
          name: sectionName.startsWith("-") ? sectionName.slice(1).trim() : sectionName,
          // sub_sections: section.sub_sections?.map((subSection) => {
          //   return {
          //     id: uniqueId(subSection.name),
          //     name: subSection.name,
          //   }
          // })
        }
      }))
    } catch {
      notification.error({ message: "Something went wrong, please try again." })
    }
  }

  const onFinish = async (formValues: any) => {
    try {
      router.push(`/projects/${projectId}?tab=articles`)

      message.success('Article added in the queue!');
      // notification.success({
      //   message: "Article added in the queue!",
      //   placement: "bottomRight",
      //   role: "alert",
      // });

      axios.post('/api/write', {
        ...values,
        ...formValues,
        outline: items.map(i => i.name),
        purpose: values.purpose.replaceAll("_", " "),
        tone: values.tones?.join?.(","),
        contentType: values.content_type.replaceAll("_", " "),
        clickbait: !!values.clickbait,
        userId: await getUserId()
      })
    } catch {
      notification.error({
        message: "We had an issue adding your article in the queue please try again",
        placement: "bottomRight",
        role: "alert",
      })
    }


    // TODO: redirect to /articles


    // setSubmittingStep(2);
    // setTimeout(() => {
    //   setCurrentStep(3)
    //   setLockedStep(2);
    //   setSubmittingStep(undefined);
    // }, 4000)
  };

  const onAddHeading = () => {
    if (items.length < 10) {
      setItems([
        ...items,
        {
          id: uniqueId(),
        }
      ])
    }
  }

  const onRemoveHeading = (id: any) => {
    setItems(items.filter(i => i.id !== id))
  }

  const onUpdateOutlineName = (name, id) => {
    const tmpItems = items.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          name,
        }
      }
      return i
    });

    setItems(tmpItems);
  }

  function handleDragStart(event: any) {
    const { active } = event;
    setActiveItem(items.find(i => i.id === active.id));
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex(i => i.id === active.id);
        const newIndex = prev.findIndex(i => i.id === over.id);

        return arrayMove(prev, oldIndex, newIndex);
      });
    }

    setActiveItem(null);
  }

  return (
    <Flex vertical style={{ height: "100%" }}>
      <Spin spinning={getOutline.isPending} tip="We are generating a new outline" style={{ height: "inherit" }}>
        <Form
          form={form}
          name="outline-form"
          disabled={submittingStep !== undefined || getOutline.isPending}
          initialValues={{
            title: values.title,
            heading_count: 7,
            with_introduction: true,
            with_conclusion: true,
            with_key_takeways: false,
            with_faq: false,
          }}
          autoComplete="off"
          layout="vertical"
          onFinish={onFinish}
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <div>
            <Form.Item name="title" label="Article title" rules={[{ required: true, type: "string", max: 75, message: "Add an article title" }]} hasFeedback>
              <Input placeholder="Article title" />
            </Form.Item>

            <Form.Item name="heading_count" label="How many headings?" help="Your selection doesn't take in account the sections below" rules={[]} style={{ margin: 0 }}>
              <Slider
                marks={{
                  4: "4",
                  5: "5",
                  6: "6",
                  7: "7",
                  8: "8",
                  9: "9",
                  10: "10",
                }}
                step={null}
                min={4}
                max={10}
              />
            </Form.Item>

            <Flex gap="small" align="center" style={{ marginBottom: 12, marginTop: 12 }}>
              <Form.Item name="with_introduction" rules={[]} style={{ margin: 0 }}>
                <Switch />
              </Form.Item>
              <span>Introduction</span>
            </Flex>

            <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
              <Form.Item name="with_conclusion" rules={[]} style={{ margin: 0 }}>
                <Switch />
              </Form.Item>
              <span>Conclusion</span>
            </Flex>

            <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
              <Form.Item name="with_key_takeways" rules={[]} style={{ margin: 0 }}>
                <Switch />
              </Form.Item>
              <span>Key takeways</span>
            </Flex>

            <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
              <Form.Item name="with_faq" rules={[]} style={{ margin: 0 }}>
                <Switch />
              </Form.Item>
              <span>FAQ</span>
            </Flex>

            <Form.Item style={{ marginTop: 32 }}>
              <Flex justify="end">
                <Button htmlType="button" icon={<SyncOutlined />} onClick={onGenerateOutline} loading={getOutline.isPending}>
                  Generate new outline (3 credits)
                </Button>
              </Flex>
            </Form.Item>

            <Form.Item>
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <Flex vertical gap="small">
                  <SortableContext
                    items={items}
                    strategy={verticalListSortingStrategy}
                  >
                    {items.map(item => (
                      <SortableItem
                        key={item.id}
                        id={item.id}
                        isActive={item.id === activeItem?.id}
                        name={item.name}
                        onRemoveHeading={() => onRemoveHeading(item.id)}
                        onChange={(value) => onUpdateOutlineName(value, item.id)}
                      />
                    ))}
                  </SortableContext>
                  <DragOverlay>
                    {activeItem ? (
                      <Item
                        draggingHandle={(
                          <IconGripVertical size={18} />
                        )}
                        style={{ width: "fit-content" }}
                      >
                        <span>{activeItem?.name}</span>
                      </Item>
                    ) : null}
                  </DragOverlay>
                </Flex>
              </DndContext>


            </Form.Item>
            {items.length > 0 && items.length < 10 && (
              <Form.Item>
                <Flex justify="end">
                  <Button onClick={onAddHeading} icon={<PlusOutlined size={12} />} />
                </Flex>
              </Form.Item>
            )}
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <Flex justify="end" align="center" gap="middle">
              <Button disabled={submittingStep !== undefined} onClick={() => prev()}>
                Previous
              </Button>

              <Button disabled={!items.length} onClick={() => form.submit()} type="primary" htmlType="button" loading={submittingStep === 2}>
                Write article (10 credits)
              </Button>
            </Flex>
            {/* <ShowCoinsForAction value="1" style={{ marginTop: 12 }} /> */}
          </Form.Item>
        </Form>
      </Spin>
    </Flex>
  )
}

export default OutlineForm;