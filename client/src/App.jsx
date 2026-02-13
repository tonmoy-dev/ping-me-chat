import { useEffect, useRef, useState } from "react"
import { connectWS } from "./lib/ws";
import toast, { Toaster } from 'react-hot-toast';

const ROOM_NAME = 'pingMeChatRoom';

// room events
const JOIN_ROOM = 'joinChatRoom';
const CHAT_MESSAGE = 'chatMessage';
const TYPING = 'userTyping';
const STOP_TYPING = 'userStopTyping';
const ROOM_NEWS = 'chatRoomNews';
const USER_LEAVE = 'userLeaveChatRoom';

const getCurrentTime = () => {
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  return currentTime;
}


function App() {
  const socketRef = useRef(null);
  const [userName, setUserName] = useState('');
  const [showNamePopUp, setShowNamePopUp] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [textMessage, setTextMessage] = useState('');

  useEffect(() => {
    socketRef.current = connectWS();

    // connect to room
    socketRef.current.on('connect', () => {

      socketRef.current.on(CHAT_MESSAGE, (message) => {
        // push messages to chat box
        setChatMessages((prevMessages) => [...prevMessages, message])
      });

      socketRef.current.on(ROOM_NEWS, (userName) => {
        const message = `${userName} is joined in this chat!`
        toast(message, {
          icon: '👏',
        });
      })
    })

    // console.log('socket', socketRef.current);

    // clean up functions
    return () => {
      socketRef.current.off(CHAT_MESSAGE);
    }
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();

    // emit join room
    socketRef.current.emit(JOIN_ROOM, userName);

    setShowNamePopUp(false);
  }

  const sendMessages = () => {
    const text = textMessage?.trim();
    if (!text) return;

    const message = {
      id: Date.now(),
      sender: userName,
      message: text,
      time: getCurrentTime()
    }
    socketRef.current.emit(CHAT_MESSAGE, message);

    setChatMessages((prev) => [...prev, message]);
    setTextMessage(' ');

    // emit the current message
  }

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    sendMessages()
  }

  const handleMessageKeyDown = (e) => {
    if (e.key == 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessages();
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4 font-inter">
        {showNamePopUp ? (
          <>
            {/* ENTER YOUR NAME TO START CHATTING */}
            <div className="fixed inset-0 flex items-center justify-center z-40">
              <div className="bg-white rounded-xl shadow-lg max-w-md p-6">
                <h1 className="text-xl font-semibold text-black">Enter your name</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your name to start chatting.
                </p>
                <form className="mt-4" onSubmit={handleNameSubmit}>
                  <input
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                    }}
                    autoFocus
                    className="w-full border border-gray-200 rounded-md px-3 py-2 outline-orange-500 placeholder-gray-400"
                    placeholder="Your name (e.g. Rx)"
                  />
                  <button
                    type="submit"
                    className="block ml-auto mt-3 px-4 py-1.5 rounded-lg bg-orange-500 text-white font-medium cursor-pointer">
                    Continue
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* CHAT WINDOW */}
            < div className="w-full max-w-2xl h-[90vh] bg-white rounded-xl shadow-md flex flex-col overflow-hidden">
              {/* CHAT HEADER */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
                <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                  {userName?.at(0)}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-green-500">● Online</div>
                </div>

                <div className="text-sm text-gray-500">
                  Joined as
                  <span className="font-medium text-[#303030] capitalize ml-2">
                    {userName}
                  </span>
                </div>
              </div>

              {
                chatMessages?.length > 0 ? (
                  <>
                    {/* CHAT MESSAGE LIST */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-100 flex flex-col">
                      {/* MESSAGE OF SENDER OR MESSAGE OF RECEIVER  */}
                      {
                        chatMessages.map(chat => {
                          const userOwnMessage = chat?.sender === userName;
                          return (
                            <div
                              key={chat?.id}
                              className={`flex ${userOwnMessage ? 'justify-end' : 'justify-start'}`}>
                              <div
                                className={`
                                  max-w-[78%] p-3 my-2 rounded-[18px] text-sm leading-5 shadow-sm ${userOwnMessage ? 'bg-orange-300 text-[#303030] rounded-br-2xl' : 'bg-white text-[#303030] rounded-bl-2xl'}`}
                              >
                                <div className="break-words whitespace-pre-wrap">
                                  {chat?.message}
                                </div>
                                <div className="flex justify-between items-center mt-3 gap-16">
                                  <div className="text-[11px]  text-gray-500 font-bold">{chat?.sender}</div>
                                  <div className="text-[11px] text-gray-500 text-right">
                                    {chat?.time}
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 text-right">✓✓</p>
                              </div>
                            </div>
                          )
                        })
                      }
                    </div>
                  </>
                ) : (
                  <>
                    {/* NO CHAT MESSAGES */}
                    <div className="flex flex-1 overflow-y-auto  bg-zinc-100 text-center text-gray-400 py-10 items-center justify-center">
                      <p>No messages yet. Start the conversation 👋</p>
                    </div>
                  </>
                )
              }
              {/* CHAT TEXTAREA */}
              <div className="px-4 py-3 border-t border-gray-200 bg-white">
                <form onSubmit={handleMessageSubmit}>
                  <div className="flex items-center justify-between gap-4 border border-gray-200 rounded-full">
                    <textarea
                      rows={1}
                      value={textMessage}
                      onChange={(e) => {
                        setTextMessage(e.target.value);
                      }}
                      onKeyDown={handleMessageKeyDown}
                      placeholder="Type a message..."
                      className="w-full resize-none px-4 py-4 text-sm outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-orange-500 text-white px-4 py-2 mr-2 rounded-full text-sm font-medium cursor-pointer">
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}

      </div>
      <div><Toaster /></div>
    </>
  )
}

export default App
