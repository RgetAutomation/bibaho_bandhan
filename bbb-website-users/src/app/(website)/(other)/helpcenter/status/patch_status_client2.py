import re

filepath = r"c:\xampp\htdocs\bbbrepo\bbb-website-users\src\app\(website)\(other)\helpcenter\status\[requestId]\statusClient.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add X to lucide-react imports if not there
if "X," not in content and " X " not in content:
    content = content.replace("ShieldCheck,", "ShieldCheck,\n  X,")

# Add useState to HelpTicketCard
old_help_ticket_card_start = """function HelpTicketCard({ data }: { data: IHelpTicket }) {
  const statusColors: Record<string, string> = {"""

new_help_ticket_card_start = """function HelpTicketCard({ data }: { data: IHelpTicket }) {
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);

  const statusColors: Record<string, string> = {"""

if "const [isMobileDetailsOpen" not in content:
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

if "onClick={() => setIsMobileDetailsOpen(true)}" not in content:
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
      <div className={`flex w-full flex-col gap-4 md:w-[320px] shrink-0 overflow-y-auto pb-4 pr-1 max-md:fixed max-md:inset-y-0 max-md:right-0 max-md:z-50 max-md:w-[85vw] max-md:bg-background max-md:p-4 max-md:transition-transform max-md:duration-300 max-md:shadow-2xl ${
        isMobileDetailsOpen ? "max-md:translate-x-0" : "max-md:translate-x-full"
      }`}>
        <div className="md:hidden flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Ticket Details</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileDetailsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>"""

if "isMobileDetailsOpen ? \"max-md:translate-x-0\"" not in content:
    content = content.replace(old_right_col, new_right_col)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched HelpTicketCard successfully with max-md scoped classes.")
