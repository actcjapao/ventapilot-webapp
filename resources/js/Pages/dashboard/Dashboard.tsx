/**
 * Dashboard.tsx
 *
 * UI/UX Direction:
 * - SaaS-style admin dashboard
 * - Clean analytics-first layout
 * - Mintlify + Tailwind aesthetic
 * - Focused on sari-sari store insights
 * - Mobile responsive
 * - Inventory + sales intelligence oriented
 *
 * Suggested chart library:
 * npm install recharts
 *
 * Recommended backend payload:
 *
 * dashboard = {
 *   metrics: {
 *      total_sales_count: number,
 *      total_products: number,
 *      overall_cost: number,
 *      overall_sales: number,
 *      overall_profit: number,
 *   },
 *
 *   sales_overview_chart: [
 *      { date: '', sales: 0, profit: 0 }
 *   ],
 *
 *   weekly_sales: [
 *      {
 *        date: '',
 *        day: '',
 *        total_sales: 0,
 *        total_profit: 0
 *      }
 *   ],
 *
 *   top_products: [
 *      {
 *        name: '',
 *        brand: '',
 *        daily_sales: 0,
 *        overall_sales: 0,
 *        stock_left: 0
 *      }
 *   ]
 * }
 */
import MainPanelLayout from "@/components/MainPanelLayout";
import React from "react";
import {
   ResponsiveContainer,
   AreaChart,
   Area,
   CartesianGrid,
   Tooltip,
   XAxis,
   YAxis,
   Legend,
} from "recharts";
import { DashboardProps, WeeklySales } from "./types";

const Dashboard = ({ dashboardData }: DashboardProps) => {
   const showFutureEnhancement = false; // Toggle for extra features to be displayed

   // ================================
   // SERVER DATA (replace with props)
   // This is the sample data structure for the chart expected from the server.
   // ================================

   // const salesOverviewChart = [
   //    { date: "Mon", sales: 12000, profit: 3000 },
   //    { date: "Tue", sales: 18000, profit: 5000 },
   //    { date: "Wed", sales: 15000, profit: 4500 },
   //    { date: "Thu", sales: 21000, profit: 7000 },
   //    { date: "Fri", sales: 26000, profit: 8000 },
   //    { date: "Sat", sales: 30000, profit: 12000 },
   //    { date: "Sun", sales: 24000, profit: 6500 },
   // ];

   const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("en-PH", {
         style: "currency",
         currency: "PHP",
      }).format(value);
   };

   return (
      <>
         <div className="space-y-6">
            {/* ===================================================== */}
            {/* DASHBOARD HEADER */}
            {/* ===================================================== */}

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
               <div>
                  <h1 className="text-3xl font-semibold text-base-content tracking-tight">
                     Business Dashboard
                  </h1>

                  <p className="text-sm text-base-content/65 mt-1 max-w-2xl leading-7">
                     Monitor your inventory, sales performance, and profit
                     trends with clear, actionable insights.
                  </p>
               </div>

               {/* OPTIONAL:
               Add date filter / branch filter / export button here
            */}
               <div className="flex gap-2">
                  <button className="btn btn-outline btn-sm rounded-4xl">
                     <span className="icon-[tabler--calendar] size-4"></span>
                     This Week
                  </button>

                  <button
                     data-theme="mintlify"
                     className="btn btn-primary btn-sm"
                  >
                     <span className="icon-[tabler--download] size-4"></span>
                     Export
                  </button>
               </div>
            </div>

            {/* ===================================================== */}
            {/* KPI CARDS */}
            {/* ===================================================== */}
            {/* MOST IMPORTANT SECTION */}
            {/* Should be fetched from server */}
            {/* Keep cards visually different */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
               {/* TOTAL PRODUCTS */}
               <div className="card bg-base-100 shadow-md border border-base-200 transition-shadow">
                  <div className="card-body">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                              Products
                           </p>

                           <h2 className="text-2xl font-bold mt-2 text-base-content/85">
                              {dashboardData.metrics.total_products}
                           </h2>
                        </div>

                        <div className="bg-warning/15 text-warning p-3 pb-2 rounded-lg">
                           <span className="icon-[tabler--package] size-6"></span>
                        </div>
                     </div>

                     <p className="text-xs text-base-content/50 mt-4">
                        Active inventory items
                     </p>
                  </div>
               </div>

               {/* TOTAL SALES COST TRANSACTIONS */}
               <div className="card bg-base-100 shadow-md border border-base-200 transition-shadow">
                  <div className="card-body">
                     <div className="flex items-start justify-between gap-3">
                        {/* CONTENT */}
                        <div className="min-w-0 flex-1">
                           <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                              Total Sales Cost
                           </p>

                           {/* 
                              truncate prevents overflow
                              break-all is optional for VERY huge values
                           */}
                           <h2 className="text-xl font-bold mt-2 truncate text-base-content/85">
                              {formatCurrency(
                                 dashboardData.metrics.total_sales_cost,
                              )}
                           </h2>
                        </div>

                        {/* ICON */}
                        {/* shrink-0 prevents icon compression */}
                        <div className="shrink-0 bg-accent/15 text-accent p-3 pb-2 rounded-lg">
                           <span className="icon-[tabler--wallet] size-6"></span>
                        </div>
                     </div>

                     <p className="text-xs text-base-content/50 mt-4">
                        Total expenses for sold products
                     </p>
                  </div>
               </div>

               {/* TOTAL SALES TRANSACTIONS */}
               <div className="card bg-base-100 shadow-md border border-base-200 transition-shadow">
                  <div className="card-body">
                     <div className="flex items-start justify-between gap-3">
                        {/* CONTENT */}
                        <div className="min-w-0 flex-1">
                           <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                              Total Sales
                           </p>

                           {/* 
                              truncate prevents overflow
                              break-all is optional for VERY huge values
                           */}
                           <h2 className="text-xl font-bold mt-2 truncate text-base-content/85">
                              {formatCurrency(
                                 dashboardData.metrics.total_sales,
                              )}
                           </h2>
                        </div>

                        {/* ICON */}
                        {/* shrink-0 prevents icon compression */}
                        <div className="shrink-0 bg-success/15 text-success p-3 pb-2 rounded-lg">
                           <span className="icon-[tabler--shopping-cart] size-6"></span>
                        </div>
                     </div>

                     <p className="text-xs text-success/80 mt-4 font-medium">
                        +12% compared last week
                     </p>
                  </div>
               </div>

               {/* TOTAL PROFIT */}
               <div className="card bg-linear-to-br from-success/5 to-base-100 border border-success/20 shadow-md transition-shadow">
                  <div className="card-body">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-xs font-semibold text-success/60 uppercase tracking-wide">
                              Net Profit
                           </p>

                           <h2 className="text-2xl font-bold text-success mt-2">
                              {formatCurrency(
                                 dashboardData.metrics.total_profit,
                              )}
                           </h2>
                        </div>

                        <div className="bg-success/15 text-success p-3 pb-2 rounded-lg">
                           <span className="icon-[tabler--chart-line] size-6"></span>
                        </div>
                     </div>

                     <p className="text-xs text-success/60 mt-4">
                        Business is profitable
                     </p>
                  </div>
               </div>
            </div>

            {/* ===================================================== */}
            {/* CHARTS SECTION */}
            {/* ===================================================== */}
            {/* Main analytics area */}

            <div className="grid grid-cols-1 gap-4">
               {/* SALES + PROFIT TREND */}
               <div className="xl:col-span-2 card bg-base-100 border border-base-200 shadow-md">
                  <div className="card-body">
                     <div className="flex items-center justify-between mb-6">
                        <div>
                           <h2 className="font-semibold text-lg text-base-content">
                              Sales & Profit Trend
                           </h2>

                           <p className="text-sm text-base-content/60">
                              Visualize revenue and profit movement over time.
                           </p>
                        </div>

                        <button
                           className="btn btn-sm btn-outline rounded-4xl"
                           onClick={() => alert("Go to Report Page")}
                        >
                           View Report
                        </button>
                     </div>

                     {/* ================================= */}
                     {/* AREA CHART */}
                     {/* SERVER: salesOverviewChart */}
                     {/* ================================= */}

                     <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                           {/* This is the main chart engine or type of chart to render */}
                           <AreaChart
                              data={dashboardData.sales_overview_chart}
                              margin={{
                                 top: 5,
                                 right: 20,
                                 left: 0,
                                 bottom: 0,
                              }}
                           >
                              {/* Defining gradients to be used for the area fills below */}
                              <defs>
                                 <linearGradient
                                    id="sales"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                 >
                                    <stop
                                       offset="5%"
                                       stopColor="#10b981"
                                       stopOpacity={0.25}
                                    />
                                    <stop
                                       offset="95%"
                                       stopColor="#10b981"
                                       stopOpacity={0}
                                    />
                                 </linearGradient>

                                 <linearGradient
                                    id="profit"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                 >
                                    <stop
                                       offset="5%"
                                       stopColor="#3b82f6"
                                       stopOpacity={0.25}
                                    />
                                    <stop
                                       offset="95%"
                                       stopColor="#3b82f6"
                                       stopOpacity={0}
                                    />
                                 </linearGradient>
                              </defs>

                              {/* 
                                 Renders the grid lines in the background both vertical and horizontal
                                 strokeDasharray="3 3" means 3px line, 3px gap pattern
                              */}
                              <CartesianGrid
                                 strokeDasharray="3 3"
                                 stroke="#e5e7eb"
                              />

                              {/* Defines/controls the horizontal labels */}
                              <XAxis
                                 dataKey="date"
                                 axisLine={false} // removes the horizontal line at the bottom
                                 tickLine={false} // removes the small vertical ticks on the X axis
                                 tick={{ fontSize: 12 }}
                              />

                              {/* 
                                 Defines/controls the vertical labels
                                 By default, it will auto-scale based on the data range.
                                 Will automatically calculates (min value, max value, and spacing/intervals) based on the data set provided (sales and profit values)
                              */}
                              <YAxis
                                 axisLine={false} // removes the vertical line on the left
                                 tickLine={false} // removes the small horizontal ticks on the Y axis
                                 tick={{ fontSize: 12 }}
                              />

                              {/* 
                                 Renders the tooltip when hovering over data points
                                 
                                 Sales: 12000
                                 Profit: 3000

                                 Can use custom tooltip:
                                 <Tooltip content={<CustomTooltip />} />
                              */}
                              <Tooltip
                                 contentStyle={{
                                    backgroundColor:
                                       "rgba(255, 255, 255, 0.98)",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "12px",
                                 }}
                              />

                              {/* 
                                 Renders the legend under the chart that shows
                                 which color corresponds to which data key (sales and profit)
                              */}
                              <Legend verticalAlign="top" height={36} />

                              {/* 
                                 Renders the area charts for "sales" data based on dataKey
                                 which corresponds to the keys in the data objects (salesOverviewChart)
                              */}
                              <Area
                                 type="monotone" // makes the line smooth and curve
                                 dataKey="sales"
                                 stroke="#10b981" // line color
                                 strokeWidth={1.5} // line thickness
                                 activeDot={{ r: 5 }} // makes the dot bigger when active/hovered
                                 fillOpacity={1}
                                 fill="url(#sales)" // Refers to the gradient defined in defs above
                              />

                              {/* 
                                 Renders the area charts for "profit" data based on dataKey
                                 which corresponds to the keys in the data objects (salesOverviewChart)
                              */}
                              <Area
                                 type="monotone" // makes the line smooth and curve
                                 dataKey="profit"
                                 stroke="#3b82f6" // line color
                                 strokeWidth={1.5} // line thickness
                                 activeDot={{ r: 5 }} // makes the dot bigger when active/hovered
                                 fillOpacity={1}
                                 fill="url(#profit)" // Refers to the gradient defined in defs above
                              />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </div>
            </div>

            {/* ===================================================== */}
            {/* TABLES SECTION */}
            {/* ===================================================== */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
               {/* WEEKLY SALES TABLE */}
               <div className="card bg-base-100 border border-gray-200 shadow-sm">
                  <div className="card-body">
                     <div className="flex items-center justify-between">
                        <div>
                           <h2 className="font-semibold text-lg">
                              Last 7 Days Sales
                           </h2>

                           <p className="text-sm text-base-content/60">
                              Daily revenue and profit tracking
                           </p>
                        </div>

                        <button className="btn btn-sm btn-text rounded-4xl">
                           See All
                        </button>
                     </div>

                     <div className="overflow-x-auto mt-4">
                        <table className="table table-sm">
                           <thead className="bg-base-200">
                              <tr>
                                 <th>Date</th>
                                 <th>Day</th>
                                 <th className="text-right">Daily Sales</th>
                                 <th className="text-right">Profit</th>
                              </tr>
                           </thead>

                           <tbody>
                              {dashboardData.weekly_sales.map(
                                 (sale: WeeklySales, index) => (
                                    <tr
                                       key={index}
                                       className="hover:bg-base-200"
                                    >
                                       <td>{sale.date}</td>

                                       <td>{sale.day}</td>

                                       <td className="text-right font-medium">
                                          {formatCurrency(sale.total_sales)}
                                       </td>

                                       <td className="text-right text-success font-semibold">
                                          {formatCurrency(sale.total_profit)}
                                       </td>
                                    </tr>
                                 ),
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>

               {/* TOP PRODUCTS */}
               <div className="card bg-base-100 border border-gray-200 shadow-sm">
                  <div className="card-body">
                     <div className="flex items-center justify-between">
                        <div>
                           <h2 className="font-semibold text-lg">
                              Top Selling Products
                           </h2>

                           <p className="text-sm text-base-content/60">
                              Most purchased items ranking
                           </p>
                        </div>

                        <button className="btn btn-sm btn-text rounded-4xl">
                           View Inventory
                        </button>
                     </div>

                     <div className="overflow-x-auto mt-4">
                        <table className="table table-sm">
                           <thead className="bg-base-200">
                              <tr>
                                 <th>Product</th>
                                 <th>Brand</th>
                                 <th className="text-center">Today</th>
                                 <th className="text-center">Overall</th>
                                 <th className="text-center">Stock</th>
                              </tr>
                           </thead>

                           <tbody>
                              {dashboardData.top_products.map(
                                 (product, index) => (
                                    <tr
                                       key={index}
                                       className="hover:bg-base-200"
                                    >
                                       <td className="font-medium">
                                          {product.name}
                                       </td>

                                       <td>{product.brand ?? "--"}</td>

                                       <td className="text-center">
                                          {product.sales_today}
                                       </td>

                                       <td className="text-center font-semibold">
                                          {product.overall_sales}
                                       </td>

                                       {/* ================================= */}
                                       {/* LOW STOCK VISUAL WARNING */}
                                       {/* ================================= */}

                                       <td className="text-center">
                                          <span
                                             className={`badge ${
                                                product.stock_left <= 15
                                                   ? "badge-error"
                                                   : "badge-success"
                                             }`}
                                          >
                                             {product.stock_left}
                                          </span>
                                       </td>
                                    </tr>
                                 ),
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            </div>

            {/* ===================================================== */}
            {/* EXTRA ANALYTICS / FUTURE FEATURES */}
            {/* ===================================================== */}
            {/* IDEAS:
               - Low stock alerts
               - Outstanding debts
               - Best profit margin products
               - Expiring products
               - Recent transactions
               - Employee activity
               - Peak sales hour
               - Sales heatmap
            */}

            {showFutureEnhancement && (
               <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {/* LOW STOCK ALERT */}
                     <div className="card bg-error/5 border border-error/20">
                        <div className="card-body">
                           <div className="flex items-center gap-3">
                              <div className="bg-error/15 text-error p-3 rounded-xl">
                                 <span className="icon-[tabler--alert-triangle] size-6"></span>
                              </div>

                              <div>
                                 <h2 className="font-semibold">
                                    Low Stock Alert
                                 </h2>

                                 <p className="text-sm text-base-content/60">
                                    8 products running low
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* DEBTS */}
                     <div className="card bg-warning/5 border border-warning/20">
                        <div className="card-body">
                           <div className="flex items-center gap-3">
                              <div className="bg-warning/15 text-warning p-3 rounded-xl">
                                 <span className="icon-[tabler--receipt-2] size-6"></span>
                              </div>

                              <div>
                                 <h2 className="font-semibold">
                                    Outstanding Debts
                                 </h2>

                                 <p className="text-sm text-base-content/60">
                                    ₱4,520 collectible amount
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* INVENTORY HEALTH */}
                     <div className="card bg-success/5 border border-success/20">
                        <div className="card-body">
                           <div className="flex items-center gap-3">
                              <div className="bg-success/15 text-success p-3 rounded-xl">
                                 <span className="icon-[tabler--activity-heartbeat] size-6"></span>
                              </div>

                              <div>
                                 <h2 className="font-semibold">
                                    Inventory Health
                                 </h2>

                                 <p className="text-sm text-base-content/60">
                                    Inventory performing well
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </>
            )}
         </div>
      </>
   );
};

Dashboard.layout = (page: React.ReactNode) => (
   <MainPanelLayout title="Dashboard">{page}</MainPanelLayout>
);

export default Dashboard;
