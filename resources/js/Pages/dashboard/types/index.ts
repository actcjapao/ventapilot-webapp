export type Metrics = {
   total_products: number;
   total_sales_cost: number;
   total_sales: number;
   total_profit: number;
};

export type SalesOverview = {
   date: string;
   sales: number;
   profit: number;
};

export type WeeklySales = {
   date: string;
   day: string;
   total_sales: number;
   total_profit: number;
};

export type TopProducts = {
   name: string;
   brand: string;
   sales_today: number;
   overall_sales: number;
   stock_left: number;
};

export type DashboardProps = {
   dashboardData: {
      metrics: Metrics;
      sales_overview_chart: SalesOverview[];
      weekly_sales: WeeklySales[];
      top_products: TopProducts[];
   };
};
