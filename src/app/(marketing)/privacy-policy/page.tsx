import Footer from "../components/Footer"
import Navbar from "../components/Navbar"

export default function PrivacyPolicy() {
  return (
    <div className="text-base font-light">
      <Navbar />
      <section className="flex flex-col gap-6 container mx-auto mt-8 px-12 lg:w-[40%]">
        <h1 className="text-3xl text-center font-bold">Privacy Policy</h1>

        <p>
          This Privacy Policy explains how <span className="text-primary-500 font-semibold">Hubrank</span> ("we", "us", or "our") collects, uses, and protects the personal information of users ("you" or "your") of our online Software as a Service (SaaS) platform ("the Service").
        </p>

        <div>
          <h3 className="font-bold">Information We Collect</h3>
          <p>We collect the following personal information from users:</p>
          <ol>
            <li>Email address</li>
          </ol>
        </div>

        <div>
          <h3 className="font-bold">How We Collect Information</h3>
          <p>Personal information is collected through:</p>
          <ol>
            <li>OTP authentication via email</li>
          </ol>
        </div>

        <div>
          <h3 className="font-bold">Purpose of Information Collection</h3>
          <p>We collect this information to facilitate the proper functioning of the Service, specifically to allow users to sign in and sign up.</p>
        </div>

        <div>
          <h3 className="font-bold">Data Storage and Protection</h3>
          <p>All data is stored securely on encrypted servers to ensure the safety and confidentiality of your information.</p>
        </div>

        <div>
          <h3 className="font-bold">Third-Party Analytics</h3>
          <p>We use third-party analytics services to improve the user experience and enhance our product. However, your personal information is not shared with these third parties.</p>
        </div>

        <div>
          <h3 className="font-bold">Accessing and Updating Personal Information</h3>
          <p>Users can access and update their information on their profile page. To delete their account, users should contact us at <a href="mailto:michael@usehubrank.com" target="_blank" className="text-primary-500 font-semibold">michael@usehubrank.com</a>.</p>
        </div>

        <div>
          <h3 className="font-bold">Use of Cookies</h3>
          <p>We use cookies solely for the purpose of user session management and authentication.</p>
        </div>

        <div>
          <h3 className="font-bold">Children's Privacy</h3>
          <p>
            Our Service is not directed at individuals under the age of 13. We do not knowingly collect personal information from anyone under 13 years old. If we discover that we have inadvertently collected such information, we will promptly delete it.
          </p>
        </div>

        <div>
          <h3 className="font-bold">Data Breaches</h3>
          <p>
            In the event of a data breach or security incident, we will promptly notify affected users and take appropriate measures to address the issue.
          </p>
        </div>

        <div>
          <h3 className="font-bold">Jurisdiction</h3>
          <p>
            This Privacy Policy is governed by the laws of the United Kingdom.
          </p>
        </div>

        <div>
          <h3 className="font-bold">Changes to this Policy</h3>
          <p>
            We reserve the right to amend this Privacy Policy and our Terms of Service at any time. We also reserve the right to terminate user accounts for misuse or unethical behavior.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  )
}