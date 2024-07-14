'use client';;
import { Card, Col, Flex, Image, Modal, Row, Grid, Tabs, Button } from 'antd';
import { useEffect, useState } from 'react';
import { brandsLogo } from '@/brands-logo';
import { useRouter } from 'next/navigation';
import { useZapier } from '@/hooks/useZapier';
import { TabsProps } from "antd/lib";
import Link from 'next/link';
import axios from 'axios';
import PageTitle from '@/components/PageTitle/PageTitle';

export default function Integrations() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hover, setHover] = useState("")
  const [selectedIntegration, setSelectedIntegration] = useState("")
  const [activeTab, setActiveTab] = useState("zapier")
  const router = useRouter();
  const zapier = useZapier()
  const screens = Grid.useBreakpoint();

  useEffect(() => {
    router.replace("/dashboard")
  }, [])

  // const onAddIntegration = () => {
  //   switch (selectedIntegration) {
  //     case "zapier":
  //       zapier.authorize()
  //     // return router.push("https://zapier.com/developer/public-invite/205776/126f9abfb3a7cfe8264ddacfc0abeae5/")
  //   }
  // }

  const onChange = (key: string) => {
    setActiveTab(key)
  };

  const publishBlogPost = async () => {
    try {
      axios.get("/api/ping")
      // await axios.post("https://hooks.zapier.com/hooks/standard/2046199/986e600a38f34a319dc3b8c17ba68cd1/", [{
      //   "id": 345,
      //   "created_at": "2024-05-31 15:21:50.357459+00",
      //   "html": "<h3>Understanding the Benefits of Squats for Women</h3>\n<p>Squats are a powerhouse exercise for women aiming to lose weight. They target multiple muscle groups, including the glutes, quads, and hamstrings, which helps in burning more calories. Squats also improve your metabolism and build lean muscle mass. This combination is essential for effective weight loss.</p>\n<p><iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/I5EemgwqtGg\" title=\"\" frameBorder=\"0\"   allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\"  allowFullScreen></iframe></p>\n\n<h3>Setting Realistic Weight Loss Goals with Squats</h3>\n<p>Before diving into your squat routine, set achievable goals. Consider how much weight you want to lose and over what period. Break down your goals into smaller milestones. This makes your journey manageable and keeps you motivated. Remember, consistency is key.</p>\n<h3>Creating a Squat Routine for Women</h3>\n<p>Design a routine that suits your fitness level. Start with basic squats and gradually incorporate variations like sumo squats and jump squats. Aim for at least three sessions per week. Include a mix of high-rep, low-weight days and low-rep, high-weight days to keep your muscles challenged.</p>\n<h3>Combining Squats with Cardio for Maximum Results</h3>\n<p>Pairing squats with cardio workouts accelerates weight loss. Cardio exercises like running, cycling, or jumping rope increase your heart rate and burn additional calories. Alternate between squats and cardio to keep your regimen balanced and effective.</p>\n<p><iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/uPaRRdMVU1I\" title=\"\" frameBorder=\"0\"   allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\"  allowFullScreen></iframe></p>\n\n<h3>Nutrition Tips to Complement Your Squat Workouts</h3>\n<p>Fuel your body with the right nutrients. Focus on a balanced diet rich in protein, healthy fats, and complex carbohydrates. Protein aids muscle repair and growth, while carbs provide the energy needed for intense workouts. Stay hydrated and avoid processed foods.</p>\n<p>For more on meal planning, check out these resources:</p>\n<ul>\n<li><a href=\"https://getfiit.app/blog/budget-friendly-meal-prep-eating-well-on-a-budget\">Budget-Friendly Meal Prep: Eating Well on a Budget</a></li>\n<li><a href=\"https://getfiit.app/blog/high-protein-meal-plans-fuel-your-body-right\">High-Protein Meal Plans: Fuel Your Body Right</a></li>\n</ul>\n<h3>Tracking Your Progress and Staying Motivated</h3>\n<p>Keep a workout journal to track your progress. Note down the number of squats, sets, and reps you complete each session. Celebrate small victories to stay motivated. When you see tangible progress, it fuels your drive to continue.</p>\n<h3>Common Mistakes to Avoid with Squats for Women</h3>\n<p>Avoid these pitfalls to maximize your results:</p>\n<ul>\n<li><strong>Poor Form</strong>: Ensure your knees don’t go past your toes and your back remains straight.</li>\n<li><strong>Overtraining</strong>: Give your muscles time to recover. Overworking can lead to injuries.</li>\n<li><strong>Ignoring Warm-Ups</strong>: Always warm up to prepare your muscles and prevent strains.</li>\n</ul>\n<p>For more insights, visit:</p>\n<ul>\n<li><a href=\"https://getfiit.app/blog/cardio-workouts-demystified-a-beginners-guide\">Cardio Workouts Demystified: A Beginner&#39;s Guide</a></li>\n<li><a href=\"https://getfiit.app/blog/calorie-counting-made-simple-how-getfiit-helps-you-stay-on-track\">Calorie Counting Made Simple: How GetFiit Helps You Stay on Track</a></li>\n</ul>",
      //   "markdown": "### Understanding the Benefits of Squats for Women\n\nSquats are a powerhouse exercise for women aiming to lose weight. They target multiple muscle groups, including the glutes, quads, and hamstrings, which helps in burning more calories. Squats also improve your metabolism and build lean muscle mass. This combination is essential for effective weight loss.\n\n<p><iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/I5EemgwqtGg\" title=\"\" frameBorder=\"0\"   allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\"  allowFullScreen></iframe></p>\n\n### Setting Realistic Weight Loss Goals with Squats\n\nBefore diving into your squat routine, set achievable goals. Consider how much weight you want to lose and over what period. Break down your goals into smaller milestones. This makes your journey manageable and keeps you motivated. Remember, consistency is key.\n\n### Creating a Squat Routine for Women\n\nDesign a routine that suits your fitness level. Start with basic squats and gradually incorporate variations like sumo squats and jump squats. Aim for at least three sessions per week. Include a mix of high-rep, low-weight days and low-rep, high-weight days to keep your muscles challenged.\n\n### Combining Squats with Cardio for Maximum Results\n\nPairing squats with cardio workouts accelerates weight loss. Cardio exercises like running, cycling, or jumping rope increase your heart rate and burn additional calories. Alternate between squats and cardio to keep your regimen balanced and effective.\n\n<p><iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/uPaRRdMVU1I\" title=\"\" frameBorder=\"0\"   allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\"  allowFullScreen></iframe></p>\n\n### Nutrition Tips to Complement Your Squat Workouts\n\nFuel your body with the right nutrients. Focus on a balanced diet rich in protein, healthy fats, and complex carbohydrates. Protein aids muscle repair and growth, while carbs provide the energy needed for intense workouts. Stay hydrated and avoid processed foods.\n\nFor more on meal planning, check out these resources:\n- [Budget-Friendly Meal Prep: Eating Well on a Budget](https://getfiit.app/blog/budget-friendly-meal-prep-eating-well-on-a-budget)\n- [High-Protein Meal Plans: Fuel Your Body Right](https://getfiit.app/blog/high-protein-meal-plans-fuel-your-body-right)\n\n### Tracking Your Progress and Staying Motivated\n\nKeep a workout journal to track your progress. Note down the number of squats, sets, and reps you complete each session. Celebrate small victories to stay motivated. When you see tangible progress, it fuels your drive to continue.\n\n### Common Mistakes to Avoid with Squats for Women\n\nAvoid these pitfalls to maximize your results:\n- **Poor Form**: Ensure your knees don’t go past your toes and your back remains straight.\n- **Overtraining**: Give your muscles time to recover. Overworking can lead to injuries.\n- **Ignoring Warm-Ups**: Always warm up to prepare your muscles and prevent strains.\n\nFor more insights, visit:\n- [Cardio Workouts Demystified: A Beginner's Guide](https://getfiit.app/blog/cardio-workouts-demystified-a-beginners-guide)\n- [Calorie Counting Made Simple: How GetFiit Helps You Stay on Track](https://getfiit.app/blog/calorie-counting-made-simple-how-getfiit-helps-you-stay-on-track)",
      //   "title": "Zapier webhook testing",
      //   "seed_keyword": "lose weight",
      //   "keywords": "",
      //   "meta_description": "Discover how to lose weight with squats for women. This guide offers step-by-step instructions to help you shed pounds and tone your body effectively.",
      //   "featured_image": "",
      //   "schema_markups": []
      // }])
    } catch (e) {
      console.log(e)
    }
  }

  const items: TabsProps['items'] = Object.keys(brandsLogo).map((brandName) => {
    let content = null;

    switch (brandName) {
      case "zapier":
        content = (
          <Link href="https://zap.new" target="_blank">
            <Button>Create new zap</Button>
          </Link>
        )
        break;
    }

    return {
      key: brandName,
      // label: `${brandName[0].toUpperCase()}${brandName.slice(1)}`,
      label: "",
      icon: <Image width={65} src={brandsLogo[brandName]} preview={false} />,
      children: content,
    }
  });

  return (
    <>
      <Modal
        title="New integration"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText="Add integration"
        okButtonProps={{
          disabled: !selectedIntegration
        }}
        // onOk={onAddIntegration}
        style={{ top: 20 }}
        width={700}
      >
        <Row>
          {Object.keys(brandsLogo).map((brandName) => {
            return (
              <Col key={brandName} style={{ width: "31%", margin: 5, overflow: "hidden" }} onMouseEnter={() => setHover(brandName)} onMouseLeave={() => setHover("")}>
                <Card
                  style={{
                    height: 125,
                    display: "flex",
                    borderColor: [hover, selectedIntegration].includes(brandName) ? "rgb(93 95 239)" : undefined,
                    borderWidth: [hover, selectedIntegration].includes(brandName) ? 3 : 1,
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                  onClick={() => setSelectedIntegration(brandName)}
                >
                  <Image width={100} src={brandsLogo[brandName]} preview={false} />
                </Card>
              </Col>
            )
          })}
        </Row>
      </Modal>
      <Flex vertical style={{ height: "100%" }} gap="large">
        <Flex
          gap="md"
          justify="space-between"
          align="center"
        >
          <PageTitle title="Integrations" />
          {/* {screens.xs ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              style={{ width: 150 }}
            >
              New
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              style={{ width: 150 }}
            >
              New integration
            </Button>
          )} */}
        </Flex>
        <Button onClick={publishBlogPost}>Publish blog post</Button>
        <Tabs
          // tabPosition="left"
          defaultActiveKey="zapier"
          activeKey={activeTab}
          onChange={onChange}
          items={items}
        />
        {/* <IntegrationsTable isLoading={zapier.isLoading} /> */}
        {/* <Flex vertical flex={1} justify="center" align="center" gap={50}>
        <Image
          preview={false}
          src="/image-4.png"
          width={460}
        />
        <Typography.Text>This feature is coming soon</Typography.Text>
      </Flex> */}
      </Flex>
    </>
  )
}