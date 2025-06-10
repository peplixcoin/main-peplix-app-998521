import { useState } from "react";

function Aibot() {
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const handleSendMessage = () => {
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000); // Hide popup after 3 seconds
    };

    return (<>
            {/* Chatbot Container */}
            <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow-lg flex flex-col h-[80vh] sm:h-[70vh] overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Stocklink AI</h2>
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                </div>

                {/* Chat Area with Centered Icon */}
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 p-4">
                    <svg className="w-16 h-16 text-gray-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        <path d="M12 6v6l4 2" />
                    </svg>
                    <p className="mt-4 text-lg text-gray-400">Model Build in Progress</p>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                        {/* Photo Attachment Icon (Demo) */}
                        <svg className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        />
                        <button
                            onClick={handleSendMessage}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-md hover:from-blue-700 hover:to-purple-700 transition-colors duration-300"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>

            {/* Popup for Model in Progress */}
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 animate-fadeIn">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white flex items-center space-x-4">
                        <svg className="w-8 h-8 text-gray-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                            <path d="M12 6v6l4 2" />
                        </svg>
                        <p className="text-lg">Model Build in Progress</p>
                    </div>
                </div>
            )}

           </>
        
    );
}

export default Aibot;