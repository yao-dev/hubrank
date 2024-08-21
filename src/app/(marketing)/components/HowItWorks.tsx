"use client";

import { Segmented, Timeline } from 'antd';
import GetStarted from './GetStarted';
import { useState } from 'react';

const items = {
  blog: [
    {
      children: 'Create a services site 2015-09-01',
    },
    {
      children: 'Solve initial network problems 2015-09-01',
    },
    {
      children: 'Technical testing 2015-09-01',
    },
    {
      children: 'Network problems being solved 2015-09-01',
      dot: "🚀"
    },
  ],
  socials: [
    {
      children: 'Create a services site 2015-09-01',
    },
    {
      children: 'Solve initial network problems 2015-09-01',
    },
    {
      children: 'Network problems being solved 2015-09-01',
      dot: "🚀"
    },
  ]
}

const HowItWorks = () => {
  const [content, setContent] = useState<string>("blog");

  return (
    <section className="container flex flex-col items-center gap-2 px-4 lg:px-40 mx-auto mb-16">
      <div className='flex flex-col gap-4 items-center'>
        <span className="uppercase text-primary-500 text-center text-base">How it works</span>
        <h3 className="text-3xl font-semibold text-center">💡 From idea to content</h3>

        <p className="text-zinc-600 text-base font-light text-center lg:w-2/3">
          We get it - ranking high on Google is way harder than it looks. You've written blog post after blog post targeting keywords in your niche. But your website still gets crickets when it comes to organic search traffic.
        </p>

        <Segmented
          size="large"
          options={[
            { label: "Blog", value: "blog" },
            { label: "Socials", value: "socials" },
          ]}
          style={{ width: "fit-content" }}
          value={content}
          onChange={(value) => setContent(value)}
          className='mb-12'
        />
      </div>

      <div>
        <Timeline
          items={items[content]}
        />
      </div>

      <GetStarted title="Get 5 Free Credits" className='w-fit' />
    </section>
  )
}

export default HowItWorks