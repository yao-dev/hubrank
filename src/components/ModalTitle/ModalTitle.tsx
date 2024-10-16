import { ReactNode } from "react"

type Props = {
  children: ReactNode
}

const ModalTitle = ({ children }: Props) => {
  return (
    <p className='text-xl font-bold'>{children}</p>
  )
}

export default ModalTitle