import { MdOutlineQueryStats } from "react-icons/md";

function Nav() {
  return (
    <header className="container max-w-2xl px-6 py-6 mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-[40px] w-[40px] rounded-full overflow-hidden">
            <img
              className="object-cover w-full h-full"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlie4MsQ9pJSSKY7DoEpxn3uBAq-rT7in1sA&s"
              alt="profile-image"
            />
          </div>

          <h4>Hi, Rich</h4>
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
