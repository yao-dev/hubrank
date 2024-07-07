'use client';;
import { Button, Drawer, Flex } from "antd";
import DrawerTitle from "../DrawerTitle/DrawerTitle";
import NewNewsletterForm from "../NewNewsletterForm/NewNewsletterForm";

type Props = {
  open: boolean;
  onClose: () => void;
}

const NewNewsletterDrawer = ({ open, onClose }: Props) => {
  return (
    <Drawer
      title={<DrawerTitle title="New newsletter" />}
      width={600}
      onClose={() => {
        onClose();
      }}
      open={open}
      destroyOnClose
      styles={{
        body: {
          paddingBottom: 80,
        },
      }}
      footer={
        <Flex justify="end">
          <Button type="primary">
            Write (1 credits)
          </Button>
        </Flex>
      }
    >
      <NewNewsletterForm />
    </Drawer>
  )
}

export default NewNewsletterDrawer