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
import { Trash2, PlusCircle, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import { createCoupon, toggleCoupon, deleteCoupon } from "@/action/coupon";
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

export default function CouponClient({ plans, initialCoupons }: { plans: any[], initialCoupons: any[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [code, setCode] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [percentage, setPercentage] = useState<string>("");

  async function handleAddCoupon() {
    if (!code || !selectedPlanId || !percentage) {
      toast.error("Please fill all fields.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("code", code);
    formData.append("planId", selectedPlanId);
    formData.append("percentage", percentage);

    const res = await createCoupon(formData);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(res.message);
      setIsDialogOpen(false);
      setCode("");
      setSelectedPlanId("");
      setPercentage("");
    } else {
      toast.error(res.message);
    }
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    const res = await toggleCoupon(id, currentStatus);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    const res = await deleteCoupon(id);
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
              <PlusCircle className="mr-2 h-4 w-4" /> Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>
                Create a promo code that users can apply to a specific plan.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <Input
                  type="text"
                  placeholder="e.g. SUMMER50"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
              </div>
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
              <Button onClick={handleAddCoupon} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Coupon"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialCoupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No coupons found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              initialCoupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-bold font-mono text-primary">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      {coupon.code}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {coupon.plan?.title || "Unknown Plan"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                      {coupon.percentage}% OFF
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={coupon.isActive}
                      onCheckedChange={() => handleToggle(coupon.id, coupon.isActive)}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(coupon.createdAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(coupon.id)}
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
