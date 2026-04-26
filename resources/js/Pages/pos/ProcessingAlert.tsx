import { BaseResponse } from "@/common/types";

const ProcessingAlert = ({ response }: { response: BaseResponse }) => {
   const isSuccess = response.key === "success" && response.status_code === 201;

   const config = isSuccess
      ? {
           background: "primary",
           iconClass: "icon-[tabler--circle-check]",
        }
      : {
           background: "error",
           iconClass: "icon-[tabler--circle-x]",
        };

   return (
      <div
         data-theme="mintlify"
         className={`alert alert-${config.background} py-2 flex items-center gap-2`}
         role="alert"
      >
         <span className={`${config.iconClass} size-5`} />
         <small>{response.message}</small>
      </div>
   );
};

export default ProcessingAlert;
