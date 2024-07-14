import { Modal } from "antd";
import PricingTable from "../PricingTable/PricingTable";
import usePricingModal from "@/hooks/usePricingModal";
import useUser from "@/hooks/useUser";

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
    >
      <PricingTable
        title={modal.title || customTitle || "You don't have enough credits"}
        subtitle={modal.subtitle || "Choose a plan to upgrade"}
      />
    </Modal>
  )
}

export default PricingModal