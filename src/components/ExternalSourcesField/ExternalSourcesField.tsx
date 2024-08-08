import { IconCircleMinus } from "@tabler/icons-react";
import { Alert, Button, Flex, Form, Input } from "antd";
import Label from "../Label/Label";

type Props = {
  name: string
}

const ExternalSourcesField = ({ name }: Props) => {
  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <div style={{ marginBottom: 12 }}>
          <Label name="External sources" />
          <Alert
            type="info"
            message="Add links to help the AI write content from external sources (links with empty objective will be ignored)"
            style={{ marginTop: 6, marginBottom: 12 }}
          />
          {fields.map((field) => {
            return (
              <Form.Item
                key={field.key}
                style={{ marginBottom: 8 }}
              >
                <Flex align="center" gap="small">
                  <Form.Item
                    {...field}
                    name={[field.name, 'url']}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[{ required: false, message: 'Please enter a valid url', type: "url" }]}
                    noStyle

                  >
                    <Input placeholder="Url" />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    name={[field.name, 'objective']}
                    validateTrigger={['onChange', 'onBlur']}
                    noStyle

                  >
                    <Input placeholder="Objective" />
                  </Form.Item>

                  {fields.length > 1 ? (
                    <IconCircleMinus size={24} onClick={() => remove(field.name)} style={{ cursor: 'pointer' }} />
                  ) : null}

                </Flex>
              </Form.Item>
            )
          })}
          {fields.length < 3 && (
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block>
                + Add url
              </Button>
            </Form.Item>
          )}
        </div>
      )}
    </Form.List>
  )
}

export default ExternalSourcesField