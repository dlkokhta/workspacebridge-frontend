interface SuccessMessageTypes {
  message: string;
}

export const SuccessMessage: React.FC<SuccessMessageTypes> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div className="w-1/3 rounded bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold">Success!</h2>
        <p className="mb-4">{message}</p>
      </div>
    </div>
  );
};
