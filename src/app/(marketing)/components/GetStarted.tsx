import { Button } from "antd"

const GetStarted = ({ className }: { className?: string }) => {
  return (
    <Button size="large" href="/login" className={`bg-primary-500 text-white hover:border-transparent mb-8 ${className}`}>
      Get started
    </Button>
  )
}

export default GetStarted