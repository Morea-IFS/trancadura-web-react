"use client";

import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface MeteringChartProps {
  title: string;
  data: number[];
  labels: string[];
  unit: string;
  color?: string;
}

export default function MeteringChart({ title, data, labels, unit, color = "#007bff" }: MeteringChartProps) {
  // Formata as datas para hora:minuto (Ex: 14:30)
  const formattedCategories = labels.map((dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  });

  const options: Highcharts.Options = {
    chart: {
      type: "area",
      backgroundColor: "transparent",
      height: 350,
    },
    title: {
      text: title,
      style: { color: "#333", fontSize: "18px", fontWeight: "bold" },
    },
    xAxis: {
      categories: formattedCategories,
      labels: { style: { color: "#666" } },
      lineColor: "#ccc",
    },
    yAxis: {
      title: { text: unit, style: { color: "#666" } },
      gridLineColor: "#eee",
      labels: { style: { color: "#666" } },
    },
    tooltip: {
      shared: true,
      valueSuffix: ` ${unit}`,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      style: { color: "#fff" },
    },
    plotOptions: {
      area: {
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, color],
            [1, "rgba(255,255,255,0)"],
          ],
        },
        marker: {
          radius: 2,
        },
        lineWidth: 2,
        states: {
          hover: {
            lineWidth: 3,
          },
        },
        threshold: null,
      },
    },
    series: [
      {
        type: "area",
        name: title,
        data: data,
        color: color,
        showInLegend: false,
      },
    ],
    credits: { enabled: false },
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}