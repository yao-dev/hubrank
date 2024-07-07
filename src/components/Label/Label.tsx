type Props = {
  name: string;
  style?: { [key: string]: string | number };
}

const Label = ({ name, style = {} }: Props) => {
  return (
    <label style={{ fontWeight: 500, ...style }}>{name}</label>
  )
}

export default Label