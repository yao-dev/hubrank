type Props = {
  name: string;
  style?: { [key: string]: string | number };
  className?: string;
}

const Label = ({ name, style = {}, className = "" }: Props) => {
  return (
    <label style={{ fontWeight: 500, ...style }} className={className}>{name}</label>
  )
}

export default Label