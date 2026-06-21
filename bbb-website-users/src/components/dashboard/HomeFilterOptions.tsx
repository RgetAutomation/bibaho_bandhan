"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

export default function HomeFilterOptions({
  onApplyFilters,
}: {
  onApplyFilters?: (filters: any) => void;
}) {
  const [name, setName] = useState<string>("");
  const [minAge, setMinAge] = useState<string>("");
  const [maxAge, setMaxAge] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [religion, setReligion] = useState<string>("");
  const [maritalStatus, setMaritalStatus] = useState<string>("");
  const [education, setEducation] = useState<string>("");
  const [profession, setProfession] = useState<string>("");
  const [caste, setCaste] = useState<string>("");
  const [subCaste, setSubCaste] = useState<string>("");
  const [eatingHabits, setEatingHabits] = useState<string>("");
  const [drinkingHabits, setDrinkingHabits] = useState<string>("");
  const [smokingHabits, setSmokingHabits] = useState<string>("");

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters({
        name: name || undefined,
        minAge: minAge ? parseInt(minAge) : undefined,
        maxAge: maxAge ? parseInt(maxAge) : undefined,
        location: location || undefined,
        religion: religion || undefined,
        maritalStatus: maritalStatus || undefined,
        education: education || undefined,
        profession: profession || undefined,
        caste: caste || undefined,
        subCaste: subCaste || undefined,
        eatingHabits: eatingHabits || undefined,
        drinkingHabits: drinkingHabits || undefined,
        smokingHabits: smokingHabits || undefined,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border-r h-full bg-card/50 overflow-y-auto">
      <div className="flex items-center gap-2 pb-4 border-b">
        <SlidersHorizontal className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>

      <div className="flex flex-col gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Search by Name or ID</label>
          <input 
            type="text" 
            placeholder="e.g. John Doe, BBB-1234..." 
            className="w-full h-10 bg-muted rounded-md border px-3 text-sm text-foreground"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Age Range</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="Min" 
              className="w-full h-10 bg-muted rounded-md border px-3 text-sm text-foreground"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
            />
            <span className="text-muted-foreground">-</span>
            <input 
              type="number" 
              placeholder="Max" 
              className="w-full h-10 bg-muted rounded-md border px-3 text-sm text-foreground"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
          <select 
            className="w-full h-10 bg-muted rounded-md border px-3 text-sm text-foreground"
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
          >
            <option value="">Any Status</option>
            <option value="SINGLE">Never Married</option>
            <option value="DIVORCED">Divorced</option>
            <option value="WIDOWED">Widowed</option>
            <option value="SEPARATED">Separated</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Religion</label>
          <select 
            className="w-full h-10 bg-muted rounded-md border px-3 text-sm text-foreground"
            value={religion}
            onChange={(e) => setReligion(e.target.value)}
          >
            <option value="">Any Religion</option>
            <option value="Islam">Islam</option>
            <option value="Hinduism">Hinduism</option>
            <option value="Christianity">Christianity</option>
            <option value="Buddhism">Buddhism</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Caste</label>
          <input 
            type="text" 
            placeholder="e.g. Brahmin..." 
            className="w-full h-10 bg-muted rounded-md border px-3 text-sm text-foreground"
            value={caste}
            onChange={(e) => setCaste(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Sub Caste</label>
          <input 
            type="text" 
            placeholder="e.g. Kulin..." 
            className="w-full h-10 bg-muted rounded-md border px-3 text-sm text-foreground"
            value={subCaste}
            onChange={(e) => setSubCaste(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Location</label>
          <input 
            type="text" 
            placeholder="City/State..." 
            className="w-full h-10 bg-muted rounded-md border px-3 text-sm text-foreground"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Education</label>
          <input 
            type="text" 
            placeholder="e.g. B.Tech, MBA..." 
            className="w-full h-10 bg-muted rounded-md border px-3 text-sm text-foreground"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Profession</label>
          <input 
            type="text" 
            placeholder="e.g. Software Engineer..." 
            className="w-full h-10 bg-muted rounded-md border px-3 text-sm text-foreground"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Eating Habits</label>
          <select 
            className="w-full h-10 bg-muted rounded-md border px-3 text-sm text-foreground"
            value={eatingHabits}
            onChange={(e) => setEatingHabits(e.target.value)}
          >
            <option value="">Any Habit</option>
            <option value="VEGETARIAN">Vegetarian</option>
            <option value="NON_VEGETARIAN">Non-Vegetarian</option>
            <option value="EGGETARIAN">Eggetarian</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Drinking Habits</label>
          <select 
            className="w-full h-10 bg-muted rounded-md border px-3 text-sm text-foreground"
            value={drinkingHabits}
            onChange={(e) => setDrinkingHabits(e.target.value)}
          >
            <option value="">Any Habit</option>
            <option value="NO">No</option>
            <option value="OCCASIONALLY">Occasionally</option>
            <option value="REGULAR">Regularly</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Smoking Habits</label>
          <select 
            className="w-full h-10 bg-muted rounded-md border px-3 text-sm text-foreground"
            value={smokingHabits}
            onChange={(e) => setSmokingHabits(e.target.value)}
          >
            <option value="">Any Habit</option>
            <option value="NO">No</option>
            <option value="OCCASIONALLY">Occasionally</option>
            <option value="REGULAR">Regularly</option>
          </select>
        </div>
      </div>

      <Button className="mt-4 w-full rounded-full" onClick={handleApply}>Apply Filters</Button>
    </div>
  );
}
