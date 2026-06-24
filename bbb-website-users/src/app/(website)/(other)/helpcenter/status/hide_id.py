import re

filepath = r"c:\xampp\htdocs\bbbrepo\bbb-website-users\src\app\(website)\(other)\helpcenter\status\[requestId]\statusClient.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove ID from header
old_header_p = '<p className="text-sm text-muted-foreground">Support thread for request #{data.id.slice(-6)}</p>'
new_header_p = '<p className="text-sm text-muted-foreground">Support thread</p>'
content = content.replace(old_header_p, new_header_p)

# 2. Remove Ticket ID section from Ticket Details
old_ticket_id_section = """              {/* Ticket ID */}
              <div className="flex items-center gap-2 px-0 md:px-3 py-1 bg-transparent md:bg-muted/50">
                <Info className="size-4 text-muted-foreground" />
                <div className="flex-1 text-xs font-mono break-all">
                  ID: {data.id}
                </div>
                <CopyButton text={data.id} />
              </div>"""
content = content.replace(old_ticket_id_section, "")

# 3. Change Note at the bottom
old_note = 'Note: Please bookmark this page or save your Ticket ID to check the status of your request later.'
new_note = 'Note: Please bookmark this page to check the status of your request later.'
content = content.replace(old_note, new_note)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Hidden conversation ID successfully.")
