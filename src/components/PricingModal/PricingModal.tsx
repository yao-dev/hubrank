import { Modal } from "antd";
import usePricingModal from "@/hooks/usePricingModal";
import useUser from "@/hooks/useUser";
import PricingCard from "../PricingCard/PricingCard";

const PricingModal = () => {
  const modal = usePricingModal();
  const user = useUser();
  const customTitle = user?.subscription?.credits === 0 && "You ran out of credits"
  return (
    <Modal
      open={modal.isOpen}
      width="fit-content"
      footer={null}
      style={{ top: 50, left: 100 }}
      onCancel={() => modal.open(false)}
      maskClosable={false}
    >
      {/* <PricingTable
        title={modal.title || customTitle || "You don't have enough credits"}
        subtitle={modal.subtitle || "Choose a plan to upgrade"}
      /> */}
      <PricingCard
        borderless
        title={modal.title || customTitle || "You don't have enough credits"}
        subtitle={modal.subtitle}
      />
    </Modal>
  )
}

export default PricingModal