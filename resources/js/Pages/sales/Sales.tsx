import MainPanelLayout from "@/components/MainPanelLayout";
import React, { useEffect, useState } from "react";
import StatusCard from "./StatusCard";

const Sales = () => {
   // Reinitialize FlyonUI when component mounts
   // Without this, the modal won't work when navigating to this page via Inertia links
   useEffect(() => {
      // Access the global FlyonUI/HSStaticMethods
      if (window.HSStaticMethods) {
         window.HSStaticMethods.autoInit();
      }
   }, []);

   const [dateRange, setDateRange] = useState<string>("Today");

   const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setDateRange(e.target.value);
   };

   return (
      <>
         <div className="flex gap-4">
            <div className="w-[25%]">
               <label className="block text-sm font-medium mt-2">
                  Select date range
               </label>
               <select
                  data-theme="mintlify"
                  className="select mt-1"
                  id="favorite-simpson"
                  value={dateRange}
                  onChange={handleChange}
               >
                  <option value="Today">Today</option>
                  <option value="This week">This week</option>
                  <option value="This month">This month</option>
                  <option value="Custom">Custom</option>
               </select>
            </div>
            {dateRange === "Custom" && (
               <>
                  <div className="w-[25%]">
                     <label className="block text-sm font-medium mt-2">
                        Start date
                     </label>
                     <input
                        data-theme="mintlify"
                        type="date"
                        className={`input input-bordered w-full mt-1`}
                        value={""}
                        disabled={false}
                        onChange={() => {}}
                     />
                  </div>
                  <div className="w-[25%]">
                     <label className="block text-sm font-medium mt-2">
                        End date
                     </label>
                     <input
                        data-theme="mintlify"
                        type="date"
                        className={`input input-bordered w-full mt-1`}
                        value={""}
                        disabled={false}
                        onChange={() => {}}
                     />
                  </div>
               </>
            )}
            <div className={`w-[10%]`}>
               <button
                  data-theme="mintlify"
                  className="btn btn-primary mt-8 w-full"
                  onClick={() => alert("Ready!")}
                  disabled={false}
               >
                  Apply
               </button>
            </div>
         </div>
         <div className="flex gap-4 mt-5">
            <div className="w-[30%]">
               {/* Single card */}
               <StatusCard
                  label="Sales"
                  value="₱ 11,548"
                  icon="icon-[tabler--currency-dollar]"
                  colorClasses="text-warning bg-warning/20"
                  tooltip="Total sales for the selected date range"
               />
            </div>
            <div className="w-[30%]">
               {/* Single card */}
               <StatusCard
                  label="Cost"
                  value="₱ 11,548"
                  icon="icon-[tabler--wallet]"
                  colorClasses="text-accent bg-accent/20"
                  tooltip="Total cost of goods sold within the selected date range."
               />
            </div>
            <div className="w-[30%]">
               {/* Single card */}
               <StatusCard
                  label="Profit"
                  value="₱ 11,548"
                  icon="icon-[tabler--chart-bar]"
                  colorClasses="text-success bg-success/20"
                  tooltip="Total profit for the selected date range"
               />
            </div>
         </div>
      </>
   );
};

Sales.layout = (page: React.ReactNode) => (
   <MainPanelLayout title="Sales">{page}</MainPanelLayout>
);

export default Sales;
