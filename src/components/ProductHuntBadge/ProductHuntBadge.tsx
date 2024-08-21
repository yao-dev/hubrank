type Props = {
  className?: string;
}

const ProductHuntBadge = ({ className = "" }: Props) => {
  return (
    <a
      href="https://www.producthunt.com/posts/hubrank-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-hubrank-2"
      target="_blank"
    >
      <img
        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=481509&theme=light"
        alt="Hubrank - Grow 10x Faster with AI Content Marketing for Your Business. | Product Hunt"
        style={{ width: 250, height: 54 }}
        width={250}
        height={54}
        className={className}
      />
    </a>

  )
}

export default ProductHuntBadge