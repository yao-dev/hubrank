const testimonials = [
  {
    id: 1,
    review: "Their product was great, it helped our team understand what we were doing wrong. Now we can move faster than 99% of the market. Thanks!"
  },
  {
    id: 2,
    review: "Their product was great, it helped our team understand what we were doing wrong. Now we can move faster than 99% of the market. Thanks!"
  },
  {
    id: 3,
    review: "Their product was great, it helped our team understand what we were doing wrong. Now we can move faster than 99% of the market. Thanks!"
  },
  {
    id: 4,
    review: "Their product was great, it helped our team understand what we were doing wrong. Now we can move faster than 99% of the market. Thanks!"
  },
  {
    id: 5,
    review: "Their product was great, it helped our team understand what we were doing wrong. Now we can move faster than 99% of the market. Thanks!"
  },
  {
    id: 6,
    review: "Their product was great, it helped our team understand what we were doing wrong. Now we can move faster than 99% of the market. Thanks!"
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="container mx-auto flex flex-col items-center px-4 lg:px-40 py-5 lg:py-20 gap-6">
      <span className="uppercase text-right text-primary-500">Testimonials</span>
      <h3 className="text-2xl font-semibold mb-6">Listen to what others have to say about us</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 px-6">
        {testimonials.map((item) => {
          return (
            <p key={item.id} className="text-center font-light text-zinc-600 mb-8">{item.review}</p>
          )
        })}
      </div>
    </section>
  )
}

export default Testimonials