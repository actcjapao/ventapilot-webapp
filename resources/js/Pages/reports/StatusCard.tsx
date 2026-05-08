import React from "react";

type StatCardProps = {
   label: string;
   isLoading: boolean;
   value: string;
   icon: string; // Tabler icon class
   colorClasses: string; // e.g. "bg-warning/20 text-warning"
   tooltip: string;
};

const StatusCard: React.FC<StatCardProps> = ({
   label,
   isLoading,
   value,
   icon,
   colorClasses,
   tooltip,
}) => {
   return (
      <div className="bg-white rounded-box flex gap-4 shadow-sm px-4 py-3">
         {/* Icon */}
         <div className="avatar avatar-placeholder">
            <div className={`rounded-field size-11.5 ${colorClasses}`}>
               <span className={`${icon} size-6`}></span>
            </div>
         </div>

         {/* Content */}
         <div className="flex flex-col">
            {/* Label + Info */}
            <div className="flex items-center gap-1 relative group">
               <span className="text-base-content/50 text-sm font-medium">
                  {label}
               </span>

               {/* Info icon */}
               <span className="icon-[tabler--info-circle] size-4 text-base-content/40 cursor-pointer"></span>

               {/* Tooltip */}
               <div className="absolute left-0 top-5 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 shadow-md">
                  {tooltip}
               </div>
            </div>

            {/* Value */}
            <span className="text-base-content text-2xl font-semibold">
               {isLoading ? <div className="skeleton h-8 w-30"></div> : value}
            </span>
         </div>
      </div>
   );
};

export default StatusCard;
