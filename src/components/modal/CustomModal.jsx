const CustomModal = ({ text, buttonText, onClose, onAction, closeText }) => {
    return (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-3 rounded-lg shadow-lg w-11/12 sm:w-1/3">
                <h2 className="text-xl text-main font-medium text-center mb-4">{text}</h2>
                <div className="flex justify-end">
                    <div className="gap-4 flex">
                        <button
                            className="mx-1 text-black bg-white hover:bg-gray-200 px-4 py-2 rounded-full outline-1 outline outline-red-600 shadow-md transition-colors"
                            onClick={() => {
                                console.log("Cancel clicked");
                                onClose();
                            }}
                        >
                            {closeText}
                        </button>
                        <button
                            className="bg-blue-500 mx-1 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-600 transition-colors"
                            onClick={() => {
                                console.log("Delete clicked");
                                onAction();
                            }}
                        >
                            {buttonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomModal;