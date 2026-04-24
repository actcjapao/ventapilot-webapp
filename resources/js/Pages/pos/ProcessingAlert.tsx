import { ProcessDebtResponse, ProcessSaleResponse } from "./types";

const ProcessingAlert = ({
   response,
}: {
   response: ProcessSaleResponse | ProcessDebtResponse;
}) => {
   const isSuccess = response.key === "success" && response.status_code === 201;

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
         <small>{response.message}</small>
      </div>
   );
};

export default ProcessingAlert;
