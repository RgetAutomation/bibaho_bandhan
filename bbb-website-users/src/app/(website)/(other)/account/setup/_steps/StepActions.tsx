import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, ArrowLeft } from "lucide-react";

interface StepActionsProps {
  loading: boolean;
  showBack?: boolean;
  onBack?: () => void;
  submitLabel?: string;
}

export default function StepActions({ loading, showBack = false, onBack, submitLabel = "Save & Continue" }: StepActionsProps) {
  return (
    <div className="flex justify-end gap-4 mt-8 pb-4">
      {showBack && onBack && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      )}
      <Button 
        type="submit" 
        className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[150px]"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          submitLabel
        )}
        {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
      </Button>
    </div>
  );
}
