'use client';;
import { IconGripVertical } from "@tabler/icons-react";
import { Button, Card, Flex, Form, Input, Slider, Spin, Switch } from "antd";
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

export const Item = forwardRef(({ children, draggingHandle, closeIcon, style = {}, isActive, action }, ref) => {
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
  setLockedStep,
  submittingStep,
  setSubmittingStep,
  setCurrentStep,
  isLocked
}) => {
  const [activeItem, setActiveItem] = useState(null);
  const [items, setItems] = useState([]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getOutline = useMutation({
    mutationFn: async (data: any) => {
      return axios.post("/api/outline-ideas", data)
    },
    // onSuccess: () => {},
    // onError: () => {
    //   notification.error({ message: "We couldn't save your change" })
    // }
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
      setItems(data.outline.map((section) => {
        return {
          id: uniqueId(section.name),
          name: section.name,
          sub_sections: section.sub_sections?.map((subSection) => {
            return {
              id: uniqueId(subSection.name),
              name: subSection.name,
            }
          })
        }
      }))
    } catch (e) {
      console.error(e)
    }
  }

  const onFinish = async (formValues: any) => {
    await axios.post('/api/write', {
      ...values,
      ...formValues,
      outline: items,
      purpose: values.purpose.replaceAll("_", " "),
      tone: values.tones?.join?.(","),
      contentType: values.content_type.replaceAll("_", " "),
      clickbait: !!values.clickbait
    })


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
    <Spin spinning={getOutline.isLoading} tip="We are generating a new outline">
      <Form
        form={form}
        name="outline"
        disabled={submittingStep !== undefined || getOutline.isLoading}
        initialValues={{
          title: values.title,
          heading_count: 5,
          with_introduction: true,
          with_conclusion: true,
          with_key_takeways: false,
          with_faq: false,
        }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        onSubmitCapture={e => e.preventDefault()}
      >
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
            }}
            step={null}
            min={4}
            max={8}
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

        <Form.Item>
          <Flex justify="end">
            <Button htmlType="button" icon={<SyncOutlined />} onClick={onGenerateOutline} loading={getOutline.isLoading}>
              Generate new outline
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
      </Form>
    </Spin>
  )
}

export default OutlineForm;