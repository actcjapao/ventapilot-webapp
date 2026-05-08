import MainPanelLayout from "@/components/MainPanelLayout";
import axios from "axios";
import React, { useEffect, useState } from "react";
import StatusCard from "./StatusCard";
import { PaginatedSale, Sale, Summary } from "./types";

const Reports = () => {
   const [dateRange, setDateRange] = useState<string>("Today");
   const [customStartDate, setCustomStartDate] = useState<string>("");
   const [customEndDate, setCustomEndDate] = useState<string>("");
   const [paginatedSales, setPaginatedSales] = useState<PaginatedSale | null>(
      null,
   );
   const [summary, setSummary] = useState<Summary>({
      total_sales: 0,
      total_cost: 0,
      total_profit: 0,
   });
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const [fetchError, setFetchError] = useState<string>("");
   const [queryParams, setQueryParams] = useState<string>("");

   // Reinitialize FlyonUI when component mounts
   // Without this, the modal won't work when navigating to this page via Inertia links
   useEffect(() => {
      // Access the global FlyonUI/HSStaticMethods
      if (window.HSStaticMethods) {
         window.HSStaticMethods.autoInit();
      }
   }, []);

   const formatCurrency = (value: number) =>
      `₱ ${value.toLocaleString(undefined, {
         minimumFractionDigits: 2,
         maximumFractionDigits: 2,
      })}`;

   const formatDate = (value: string) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
         return value;
      }
      return date.toLocaleDateString();
   };

   const applyClickHandler = () => {
      if (dateRange === "Custom" && (!customStartDate || !customEndDate)) {
         setFetchError("Please select both start and end dates.");
         return;
      }

      let query = `date_range=${encodeURIComponent(dateRange)}`;
      if (dateRange === "Custom") {
         query += `&start_date=${encodeURIComponent(customStartDate)}`;
         query += `&end_date=${encodeURIComponent(customEndDate)}`;
      }
      setQueryParams(query);
      fetchReports(query);
   };

   const fetchReports = async (query: string, url: string = "/api/reports") => {
      setPaginatedSales(null);
      setIsLoading(true);
      setFetchError("");

      // If the URL already has query parameters (e.g., ?page=2), we need to append with '&' instead of '?'
      const paramOperator =
         url.includes("?") || url.includes("?page") ? "&" : "?";
      try {
         const response = await axios.get(`${url}${paramOperator}${query}`);
         const data = response.data?.data;

         setPaginatedSales(data);
         setSummary(
            data?.summary ?? {
               total_sales: 0,
               total_cost: 0,
               total_profit: 0,
            },
         );
      } catch (error) {
         console.error("Error fetching report data:", error);
         setPaginatedSales(null);
         setSummary({ total_sales: 0, total_cost: 0, total_profit: 0 });
         setFetchError("Unable to load report data. Please try again.");
      } finally {
         setIsLoading(false);
      }
   };

   const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const nextRange = e.target.value;
      setDateRange(nextRange);

      if (nextRange !== "Custom") {
         setCustomStartDate("");
         setCustomEndDate("");
      }
   };

   useEffect(() => {
      fetchReports(`?date_range=${encodeURIComponent(dateRange)}`);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const isApplyDisabled =
      dateRange === "Custom" && (!customStartDate || !customEndDate);

   const navigatePagination = (navigationUrl: string | null) => {
      // if navigationUrl is null, the url will fallback to the default value
      fetchReports(queryParams, navigationUrl || undefined);
   };

   function SalesSkeletonRow() {
      return (
         <tr>
            <td className="py-3">
               <div className="skeleton h-4 w-25"></div>
            </td>

            <td className="py-3">
               <div className="skeleton h-4 w-20"></div>
            </td>

            <td className="py-3">
               <div className="skeleton h-4 w-15"></div>
            </td>

            <td className="py-3">
               <div className="skeleton h-4 w-15"></div>
            </td>

            <td className="py-3">
               <div className="skeleton h-4 w-15"></div>
            </td>

            <td className="py-3 text-right">
               <div className="skeleton h-8 w-8 rounded-full ml-auto"></div>
            </td>
         </tr>
      );
   }

   return (
      <>
         <div className="flex gap-4">
            <div className="w-[25%]">
               <label className="block text-sm font-medium mt-2">
                  Select date range
               </label>
               <select
                  data-theme="mintlify"
                  className="select mt-2"
                  value={dateRange}
                  onChange={handleDateRangeChange}
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
                        className="input input-bordered w-full mt-2"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                     />
                  </div>
                  <div className="w-[25%]">
                     <label className="block text-sm font-medium mt-2">
                        End date
                     </label>
                     <input
                        data-theme="mintlify"
                        type="date"
                        className="input input-bordered w-full mt-2"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                     />
                  </div>
               </>
            )}
            <div className="w-[10%]">
               <button
                  data-theme="mintlify"
                  className="btn btn-primary mt-9 w-full"
                  onClick={applyClickHandler}
                  disabled={isApplyDisabled || isLoading}
               >
                  {isLoading ? "Loading..." : "Apply"}
               </button>
            </div>
         </div>

         {fetchError && (
            <div className="alert alert-error mt-4">
               <span>{fetchError}</span>
            </div>
         )}

         <h5 className="font-semibold mt-5">Summary</h5>
         <div className="flex gap-4 mt-2">
            <div className="w-[33%]">
               <StatusCard
                  label="Sales"
                  isLoading={isLoading}
                  value={formatCurrency(summary.total_sales)}
                  icon="icon-[tabler--currency-dollar]"
                  colorClasses="text-warning bg-warning/20"
                  tooltip="Total sales for the selected date range"
               />
            </div>
            <div className="w-[33%]">
               <StatusCard
                  label="Cost"
                  isLoading={isLoading}
                  value={formatCurrency(summary.total_cost)}
                  icon="icon-[tabler--wallet]"
                  colorClasses="text-accent bg-accent/20"
                  tooltip="Total cost of goods sold within the selected date range."
               />
            </div>
            <div className="w-[33%]">
               <StatusCard
                  label="Profit"
                  isLoading={isLoading}
                  value={formatCurrency(summary.total_profit)}
                  icon="icon-[tabler--chart-bar]"
                  colorClasses="text-success bg-success/20"
                  tooltip="Total profit for the selected date range"
               />
            </div>
         </div>

         <div className="mt-5">
            <h5 className="font-semibold mb-1">Sales Record</h5>
            <div className="card w-full mt-2">
               <div className="overflow-x-auto">
                  <table className="table table-sm">
                     <thead>
                        <tr>
                           <th>Date</th>
                           <th>Method</th>
                           <th>Total</th>
                           <th>Payment</th>
                           <th>Change</th>
                           <th className="text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {paginatedSales === null ||
                        paginatedSales?.sales?.data.length === 0 ? (
                           <>
                              {isLoading ? (
                                 Array.from({ length: 5 }).map((_, i) => (
                                    <SalesSkeletonRow key={i} />
                                 ))
                              ) : (
                                 <tr>
                                    <div className="text-center py-8">
                                       No sales records found for the selected
                                       date range.
                                    </div>
                                 </tr>
                              )}
                           </>
                        ) : (
                           paginatedSales?.sales?.data.map((record: Sale) => (
                              <tr key={record.uuid}>
                                 <td>{formatDate(record.created_at)}</td>
                                 <td>
                                    {record.payment_method
                                       .charAt(0)
                                       .toUpperCase() +
                                       record.payment_method.slice(1)}
                                 </td>
                                 <td>{formatCurrency(record.total_amount)}</td>
                                 <td>
                                    {formatCurrency(record.payment_amount)}
                                 </td>
                                 <td>{formatCurrency(record.change_amount)}</td>
                                 <td className="text-right space-x-1">
                                    <button
                                       className="btn btn-circle btn-text btn-sm"
                                       aria-label="View sale details"
                                       onClick={() =>
                                          alert("Ready to view sales details")
                                       }
                                    >
                                       <span className="icon-[tabler--list-details] size-5"></span>
                                    </button>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
            {/* Pagination */}
            {paginatedSales !== null && paginatedSales.sales.last_page > 1 && (
               <div className="flex items-center justify-between mt-2 pt-4 border-base-300">
                  <div className="text-sm text-gray-500">
                     Showing {paginatedSales?.sales.from} to{" "}
                     {paginatedSales?.sales.to} of {paginatedSales?.sales.total}{" "}
                     products
                  </div>

                  <div className="flex gap-2">
                     {/* Previous Button */}
                     {paginatedSales.sales.prev_page_url ? (
                        <button
                           className="btn btn-sm btn-outline"
                           onClick={() =>
                              navigatePagination(
                                 paginatedSales.sales.prev_page_url,
                              )
                           }
                        >
                           <span className="icon-[tabler--chevron-left] size-4"></span>
                           Previous
                        </button>
                     ) : (
                        <button
                           className="btn btn-sm btn-outline opacity-50 cursor-not-allowed"
                           disabled
                        >
                           <span className="icon-[tabler--chevron-left] size-4"></span>
                           Previous
                        </button>
                     )}

                     {/* Page Numbers */}
                     <div className="flex gap-1">
                        {paginatedSales.sales.links.map((link, idx) => {
                           // Skip the first and last links (prev/next)
                           if (
                              link.label.includes("Previous") ||
                              link.label.includes("Next") ||
                              link.label === "&laquo;" ||
                              link.label === "&raquo;"
                           ) {
                              return null;
                           }

                           return (
                              <button
                                 key={idx}
                                 className={`btn btn-sm btn-outline ${link.active ? "custom-primary" : ""}`}
                                 onClick={() => navigatePagination(link.url)}
                              >
                                 {link.label}
                              </button>
                           );
                        })}
                     </div>

                     {/* Next Button */}
                     {paginatedSales.sales.next_page_url ? (
                        <button
                           className="btn btn-sm btn-outline"
                           onClick={() =>
                              navigatePagination(
                                 paginatedSales.sales.next_page_url,
                              )
                           }
                        >
                           Next
                           <span className="icon-[tabler--chevron-right] size-4"></span>
                        </button>
                     ) : (
                        <button
                           className="btn btn-sm btn-outline opacity-50 cursor-not-allowed"
                           disabled
                        >
                           Next
                           <span className="icon-[tabler--chevron-right] size-4"></span>
                        </button>
                     )}
                  </div>
               </div>
            )}
         </div>
      </>
   );
};

Reports.layout = (page: React.ReactNode) => (
   <MainPanelLayout title="Reports">{page}</MainPanelLayout>
);

export default Reports;
