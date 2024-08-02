import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Highlight = ({ children }: any) => {
  return (
    <span className="text-primary-500 font-semibold">{children}</span>
  )
}

export default function TermsAndConditions() {
  const email = <Highlight><a href="mailto:michael@usehubrank.com" target="_blank" className="text-primary-500 font-semibold">michael@usehubrank.com</a></Highlight>
  return (
    <div className="text-base font-light">
      <Navbar />
      <section className="flex flex-col gap-6 container mx-auto mt-8 px-12 lg:w-[40%]">
        <h1 className="text-3xl text-center font-bold">Terms & Conditions</h1>

        <p>
          Welcome to Hubrank. These Terms & Conditions ("Terms") govern your use of our online Software as a Service (SaaS) platform ("the Service") available at <Highlight>https://usehubrank.com</Highlight> ("the Website"). By using the Service, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use the Service.
        </p>

        <div>
          <h3 className="font-bold">Subscriptions and Credits</h3>
          <ol>
            <li>
              Hubrank offers three subscription plans. Each plan provides a certain number of credits for the current month only.
            </li>
            <li>
              Credits do not roll over to the next month and will expire if not used within the current month.
            </li>
          </ol>
        </div>

        <div>
          <h3 className="font-bold">Refund Policy</h3>
          <ol>
            <li>
              You can request a refund within 6 hours after subscribing or being charged, provided that you have not used any credits during that timeframe.
            </li>
            <li>
              To request a refund, contact us at {email} with the subject "Refund request" or use the live chat feature on our Website.
            </li>
            <li>
              Refunds will be processed only if the request is made within the stipulated time and no credits have been used.
            </li>
          </ol>
        </div>

        <div>
          <h3 className="font-bold">Contacting Us</h3>
          <ol>
            <li>
              For any inquiries or requests, you can contact us via email at {email} or through the live chat feature on our Website.
            </li>
            <li>
              We will do our best to respond to your requests in a reasonable time.
            </li>
          </ol>
        </div>

        <div>
          <h3 className="font-bold">Account Termination and Ban</h3>
          <ol>
            <li>
              We reserve the right to ban or terminate any account that attempts to abuse the system, including but not limited to fraudulent activities, misuse of credits, or violating these Terms.
            </li>
          </ol>
        </div>

        <div>
          <h3 className="font-bold">Changes to the Terms</h3>
          <ol>
            <li>
              We reserve the right to amend these Terms at any time. Any changes will be posted on this page, and it is your responsibility to review these Terms periodically.
            </li>
            <li>
              Continued use of the Service after any changes constitutes acceptance of the new Terms.
            </li>
          </ol>
        </div>

        <div>
          <h3 className="font-bold">Governing Law</h3>
          <ol>
            <li>
              These Terms are governed by the laws of the United Kingdom. Any disputes arising from these Terms or the use of the Service will be subject to the exclusive jurisdiction of the courts of the United Kingdom.
            </li>
          </ol>
        </div>

        <div>
          <h3 className="font-bold">Disclaimer of Warranties</h3>
          <ol>
            <li>
              The Service is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components.
            </li>
          </ol>
        </div>

        <div>
          <h3 className="font-bold">Limitation of Liability</h3>
          <ol>
            <li>
              To the maximum extent permitted by law, Hubrank shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your use of the Service.
            </li>
          </ol>
        </div>

        <p>
          By using Hubrank, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. If you have any questions or concerns, please contact us at {email}.
        </p>
      </section>
      <Footer />
    </div>
  )
}