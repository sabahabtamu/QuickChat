import { useContext } from "react";
import assets from "../assets/assets";
import { AuthContext, ChatContext } from "../../context/contexts";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const msgImages = messages.filter((message) => message.image);

  return selectedUser && (
    <div className="bg-[#8185B2]/10 text-white w-full h-full min-h-0 flex flex-col overflow-hidden max-md:hidden">
      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto shrink-0">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-20 aspect-square rounded-full"
        />
        <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500" />
          )}
          {selectedUser.fullName}
        </h1>
        <p className="px-10 mx-auto">{selectedUser.bio}</p>
      </div>

      <hr className="border-[#ffffff50] my-4 shrink-0" />

      <div className="px-5 text-xs flex-1 min-h-0 flex flex-col">
        <p>Media</p>
        <div className="media-gallery mt-2 flex-1 min-h-0 overflow-y-auto overscroll-y-contain grid grid-cols-2 auto-rows-max content-start gap-4 opacity-80">
          {msgImages.map((message) => (
            <button
              key={message._id}
              type="button"
              onClick={() => window.open(message.image, "_blank", "noopener,noreferrer")}
              className="cursor-pointer rounded"
              aria-label="Open shared image"
            >
              <img
                src={message.image}
                alt="Shared in chat"
                className="block w-full aspect-square object-cover rounded-md"
              />
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={logout}
        className="mt-4 mb-5 mx-auto shrink-0 bg-linear-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-18 rounded-full cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;
