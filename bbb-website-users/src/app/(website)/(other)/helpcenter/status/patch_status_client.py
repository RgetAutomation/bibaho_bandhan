import re
import os

filepath = r"c:\xampp\htdocs\bbbrepo\bbb-website-users\src\app\(website)\(other)\helpcenter\status\[requestId]\statusClient.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add X to lucide-react imports if not there
if "X," not in content and " X " not in content:
    content = content.replace("ShieldCheck,", "ShieldCheck,\n  X,")

# Replacement for HelpTicketCard
old_help_ticket_card_start = """function HelpTicketCard({ data }: { data: IHelpTicket }) {
  const statusColors: Record<string, string> = {"""

new_help_ticket_card_start = """function HelpTicketCard({ data }: { data: IHelpTicket }) {
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);

  const statusColors: Record<string, string> = {"""

content = content.replace(old_help_ticket_card_start, new_help_ticket_card_start)

# Replace Header
old_header = """        <div className="bg-muted p-4 border-b">
          <h2 className="text-lg font-bold">Chat with Support</h2>
          <p className="text-sm text-muted-foreground">Support thread for request #{data.id.slice(-6)}</p>
        </div>"""

new_header = """        <div className="bg-muted p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Chat with Support</h2>
            <p className="text-sm text-muted-foreground">Support thread for request #{data.id.slice(-6)}</p>
          </div>
          <Button variant="outline" size="sm" className="md:hidden flex items-center gap-1 bg-background" onClick={() => setIsMobileDetailsOpen(true)}>
            <Info className="h-4 w-4" /> <span className="text-xs">Details</span>
          </Button>
        </div>"""

content = content.replace(old_header, new_header)

# Replace Right Column
old_right_col = """      {/* Right Column - User Details and Feedback Form */}
      <div className="flex w-full flex-col gap-4 md:w-[320px] shrink-0 overflow-y-auto pb-4 pr-1">"""

new_right_col = """      {/* Overlay for mobile */}
      {isMobileDetailsOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileDetailsOpen(false)}
        />
      )}
      
      {/* Right Column - User Details and Feedback Form */}
      <div className={`fixed inset-y-0 right-0 z-50 w-[85vw] sm:w-[320px] bg-background md:bg-transparent transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col gap-4 shrink-0 overflow-y-auto p-4 md:p-0 ${
        isMobileDetailsOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="md:hidden flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Ticket Details</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileDetailsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>"""

content = content.replace(old_right_col, new_right_col)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched HelpTicketCard successfully.")
