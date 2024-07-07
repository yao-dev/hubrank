'use client';;
import { Button, Drawer, Flex } from "antd";
import DrawerTitle from "../DrawerTitle/DrawerTitle";
import NewArticleForm from "../NewBlogPostForm/NewBlogPostForm";

type Props = {
  open: boolean;
  onClose: () => void;
}

const NewArticleDrawer = ({ open, onClose }: Props) => {
  return (
    <Drawer
      title={<DrawerTitle title="New title" />}
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
            Write (3 credits)
          </Button>
        </Flex>
      }
    >
      <NewArticleForm />
    </Drawer>
  )
}

export default NewArticleDrawer