import { Button } from "antd"

const GetStarted = ({ className }: { className?: string }) => {
  return (
    <Button size="large" href="/login" className={`bg-primary-500 text-white border-primary-500 mb-8 hover:scale-105 ${className}`}>
      {/* Try for FREE */}
      {/* Try for FREE (5 credits) */}
      Get 5 Free Credits
    </Button>
  )
}

export default GetStarted