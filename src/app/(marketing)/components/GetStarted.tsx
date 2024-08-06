import { Button } from "antd"

const GetStarted = ({ className }: { className?: string }) => {
  return (
    <Button size="large" href="/login" className={`bg-primary-500 text-white hover:border-transparent mb-8 ${className}`}>
      {/* Try for FREE */}
      {/* Try for FREE (5 credits) */}
      Get 5 Free Credits
    </Button>
  )
}

export default GetStarted