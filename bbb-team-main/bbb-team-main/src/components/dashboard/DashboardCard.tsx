"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  color = "text-primary",
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-md transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </CardTitle>
          <Icon className={`h-5 w-5 ${color}`} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
