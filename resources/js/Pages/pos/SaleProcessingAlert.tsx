import { ProcessSaleResponse } from "./types";

const SaleProcessingAlert = ({
   processSaleResponse,
}: {
   processSaleResponse: ProcessSaleResponse;
}) => {
   const isSuccess =
      processSaleResponse.key === "success" &&
      processSaleResponse.status_code === 201;

   const config = isSuccess
      ? {
           background: "primary",
           icon: "circle-check",
        }
      : {
           background: "error",
           icon: "circle-x",
        };

   return (
      <div
         data-theme="mintlify"
         className={`alert alert-${config.background} py-2 flex items-center gap-2`}
         role="alert"
      >
         <span className={`icon-[tabler--${config.icon}] size-5`} />
         <small>{processSaleResponse.message}</small>
      </div>
   );
};

export default SaleProcessingAlert;
