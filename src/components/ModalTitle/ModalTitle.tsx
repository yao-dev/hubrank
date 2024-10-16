import { ReactNode } from "react"

type Props = {
  children: ReactNode
}

const ModalTitle = ({ children }: Props) => {
  return (
    <p className='text-xl font-bold flex flex-row items-center gap-2'>{children}</p>
  )
}

export default ModalTitle