"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { createDiscount, toggleDiscount, deleteDiscount } from "@/action/discount";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

export default function DiscountClient({ plans, initialDiscounts }: { plans: any[], initialDiscounts: any[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [percentage, setPercentage] = useState<string>("");

  async function handleAddDiscount() {
    if (!selectedPlanId || !percentage) {
      toast.error("Please fill all fields.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("planId", selectedPlanId);
    formData.append("percentage", percentage);

    const res = await createDiscount(formData);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(res.message);
      setIsDialogOpen(false);
      setSelectedPlanId("");
      setPercentage("");
    } else {
      toast.error(res.message);
    }
  }

  async function handleToggle(id: string, currentStatus: boolean, planId: string) {
    const res = await toggleDiscount(id, currentStatus, planId);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this discount?")) return;
    const res = await deleteDiscount(id);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Discount
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Discount</DialogTitle>
              <DialogDescription>
                Assign a percentage discount to an existing plan.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Plan</Label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans
                      .filter((plan) => Number(plan.price) !== 0)
                      .map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.title} (₹{plan.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Discount Percentage (%)</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g. 20"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDiscount} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Discount"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialDiscounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No discounts found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              initialDiscounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="font-medium">
                    {discount.plan?.title || "Unknown Plan"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      {discount.percentage}% OFF
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={discount.isActive}
                      onCheckedChange={() => handleToggle(discount.id, discount.isActive, discount.planId)}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(discount.createdAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(discount.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
