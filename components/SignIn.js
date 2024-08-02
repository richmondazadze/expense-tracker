import React, { useState, useContext } from "react";
import { authContext } from "@/lib/store/auth-context";
import Image from "next/image";

export const metadata = {
  title: "PennyTrack - Sign In",
};

function SignIn() {
  const { googleLoginHandler } = useContext(authContext);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const openTermsModal = () => setShowTerms(true);
  const closeTermsModal = () => setShowTerms(false);
  const openPrivacyModal = () => setShowPrivacy(true);
  const closePrivacyModal = () => setShowPrivacy(false);

  return (
    <>
      <section className="bg-gray-50 min-h-screen md:min-h-svh flex items-center justify-center">
        <div className="bg-gray-300 flex rounded-3xl shadow-lg max-w-3xl p-5 items-center py-20">
          <div className="md:w-1/2 px-8 md:px-16">
            <h2 className="font-bold text-4xl text-lime-900">Login</h2>
            <p className="text-x mt-4 text-slate-900">
              Track your expenses effortlessly!
            </p>

            <div className="mt-8 grid grid-cols-3 items-center text-gray-500">
              <hr className="border-gray-400" />
              <p className="text-center text-sm font-bold">Login with</p>
              <hr className="border-gray-400" />
            </div>

            <button
              onClick={googleLoginHandler}
              className="bg-white border py-3 w-full rounded-2xl mt-5 flex justify-center items-center text-2sm hover:scale-110 duration-400"
            >
              <svg
                className="mr-3"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="25px"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              <span className="font-bold text-slate-900">Google</span>
            </button>
            <p className="text-center mt-6 text-slate-900 text-sm">
              By continuing, you agree to our <br />
              <button
                className="underline mr-2 font-bold"
                onClick={openTermsModal}
              >
                Terms of Service
              </button>
              &
              <button
                className="underline ml-2 font-bold"
                onClick={openPrivacyModal}
              >
                Privacy Policy
              </button>
            </p>
          </div>

          <div className="md:block hidden w-1/2 bg-slate-900 rounded-3xl ">
            <Image
              className="rounded-2xl py-20"
              width={500}
              height={500}
              src="/images/logo.png"
              alt="Login"
            />
          </div>
        </div>
      </section>

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="modal-overlay" onClick={closeTermsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-slate-900 font-bold text-3xl text-center">
              Terms of Service
            </h2>
            <hr></hr>
            <br></br>
            <div className="overflow-y-scroll flex flex-col max-h-[300px] my-4 mx-2 scrollbar-thumb-rounded-2xl scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-lime-400 scrollbar-track-slate-900">
              <p className="text-slate-900">
                Welcome to PennyTrack! By using this app, you agree to the
                following terms:
                <br />
                <br></br>
                1. <span className="font-bold">User Account:</span> You are
                responsible for maintaining the confidentiality of your account
                and password. You are also responsible for all activities that
                occur under your account.
                <br />
                <br></br>
                2. <span className="font-bold">Google Login:</span> Our app
                requires login through Google. By logging in, you allow us to
                access your basic profile information and email address.
                <br />
                <br></br>
                3. <span className="font-bold">Usage:</span> You agree to use
                PennyTrack only for lawful purposes. You are not permitted to
                use the app to violate any laws or infringe on the rights of
                others.
                <br />
                <br></br>
                4. <span className="font-bold">Data Accuracy:</span> We strive
                to provide accurate financial tracking. However, you are
                responsible for ensuring the accuracy of your data inputs and
                reviewing your financial data.
                <br />
                <br></br>
                5. <span className="font-bold">
                  Limitation of Liability:
                </span>{" "}
                PennyTrack is provided on an "as-is" basis. We do not guarantee
                that the app will meet your requirements or be available
                uninterrupted or error-free. We are not liable for any losses or
                damages resulting from the use of the app.
                <br />
                <br></br>
                6. <span className="font-bold">Modifications:</span> We reserve
                the right to modify these terms at any time. Continued use of
                the app signifies your acceptance of the updated terms.
              </p>
            </div>
            <button className="close-button" onClick={closeTermsModal}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="modal-overlay" onClick={closePrivacyModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-slate-900 font-bold text-3xl text-center">
              Privacy Policy
            </h2>
            <hr />
            <br />
            <div className="overflow-y-scroll flex flex-col max-h-[300px] my-4 mx-2 scrollbar-thumb-rounded-2xl scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-lime-400 scrollbar-track-slate-900">
              <p className="text-slate-900">
                At PennyTrack, we value your privacy. This policy outlines how
                we handle your data:
                <br />
                <br />
                1. <span className="font-bold">Data Collection:</span> We
                collect personal information such as your name and email address
                when you log in through Google. We also collect data related to
                your income and expenses as you use the app.
                <br />
                <br />
                2. <span className="font-bold">Data Usage:</span> We use your
                data to provide you with accurate financial tracking and
                insights. We do not sell or share your personal information with
                third parties, except as required by law.
                <br />
                <br />
                3. <span className="font-bold">Data Security:</span> We
                implement security measures to protect your data. However, we
                cannot guarantee absolute security due to the nature of the
                internet.
                <br />
                <br />
                4. <span className="font-bold">Data Retention:</span> We retain
                your data as long as necessary to provide our services and for
                legal compliance. You may request deletion of your data at any
                time by contacting us.
                <br />
                <br />
                5. <span className="font-bold">Cookies:</span> We use cookies to
                enhance your experience. You can control cookie settings through
                your browser.
                <br />
                <br />
                6. <span className="font-bold">Changes to this Policy:</span> We
                may update this Privacy Policy from time to time. We will notify
                you of any significant changes.
              </p>
            </div>

            <button className="close-button" onClick={closePrivacyModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SignIn;
