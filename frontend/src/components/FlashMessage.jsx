import { useEffect } from "react";

export default function FlashMessage({ type = "info", message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose && onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const base = "p-3 rounded-lg text-sm mb-3";
  const styles = {
    success: `${base} bg-green-100 text-green-700 border border-green-300`,
    error: `${base} bg-red-100 text-red-700 border border-red-300`,
    info: `${base} bg-blue-100 text-blue-700 border border-blue-300`,
  };

  return (
    <div className="flex justify-center">
      <div className={styles[type]}>
        <span>{message}</span>
      </div>
    </div>
  );
}
