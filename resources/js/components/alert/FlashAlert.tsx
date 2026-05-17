import Theme from "@/types/Theme.type";
import normalizeThemeType from "@/utils/normalizeThemeType";
import { useEffect, useState } from "react";

export interface FlashAlertProps {
   type: Theme;
   message: string;
}

const FlashAlert = ({ type, message }: FlashAlertProps) => {
   const [visible, setVisible] = useState<boolean>(true);

   useEffect(() => {
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
   }, []);

   if (!visible) return null;

   return (
      <div
         data-theme="mintlify"
         className={`alert alert-${normalizeThemeType(type)} mb-4`}
         role="alert"
      >
         <span>{message}</span>
      </div>
   );
};

export default FlashAlert;
