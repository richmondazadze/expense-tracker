import { MdOutlineQueryStats } from "react-icons/md";
import Image from "next/image";

function Nav() {
  return (
    <header className="container max-w-2xl px-6 py-6 mx-auto">
      <div className="flex items-center justify-center py-3">
        <Image
          src="/images/favicon.png"
          alt="logo"
          width={40}
          height={35}
          className="object-cover"
        />
        <Image
          src="/images/pt.png"
          alt="logo"
          width={140}
          height={35}
          className="object-cover"
        />
      </div>
      <div className="flex items-center justify-center">
        <hr className="py-3 w-1/3"></hr>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-[40px] w-[40px] rounded-full overflow-hidden">
            <Image
              src="/images/cprofile.jpeg"
              alt="profile-image"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>

          <h4>
            Hi, <span className="font-bold text-2l">Rich</span>
          </h4>
        </div>
        <nav className="flex items-center gap-4">
          <div className="text-2xl">
            <MdOutlineQueryStats className="hover:scale-110 transition-all duration-200" />
          </div>
          <div>
            <button className="btn btn-danger">Logout</button>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Nav;