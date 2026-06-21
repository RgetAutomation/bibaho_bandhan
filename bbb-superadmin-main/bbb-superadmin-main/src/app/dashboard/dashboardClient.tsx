"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line as LineChartJS, Pie as PieChartJS } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ArcElement,
  Tooltip as ChartTooltipJS,
  Legend as ChartLegendJS,
} from "chart.js";
import {
  IPaymentStatus,
  IUserJoinSeries,
} from "@/components/interface/IDahboard";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ArcElement,
  ChartTooltipJS,
  ChartLegendJS
);

export function UserJoinAndPaymentChart({
  joinData,
  paymentStatus,
}: {
  joinData: IUserJoinSeries[];
  paymentStatus: IPaymentStatus[];
}) {
  const lineData = {
    labels: joinData.map((r) => r.month),
    datasets: [
      {
        label: "Join",
        data: joinData.map((r) => r.count),
        borderColor: "rgb(59,130,246)",
        backgroundColor: "rgba(59,130,246,0.5)",
        tension: 0.4,
      },
    ],
  };

  const pieData = {
    labels: paymentStatus.map((p) => p.name),
    datasets: [
      {
        data: paymentStatus.map((p) => p.value),
        backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="rounded-2xl h-72">
        <CardHeader>
          <CardTitle>User Join — Last 6 months</CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          <LineChartJS
            data={lineData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl h-72">
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          <PieChartJS
            data={pieData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
