import re

filepath = r"c:\xampp\htdocs\bbbrepo\bbb-website-users\src\app\(website)\(other)\helpcenter\status\[requestId]\statusClient.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace top-14 with top-[60px] in overlay
content = content.replace('className="fixed top-14 bottom-0 left-0 right-0 bg-black/50 z-40 md:hidden"', 'className="fixed top-[65px] bottom-0 left-0 right-0 bg-black/50 z-40 md:hidden"')

# Replace max-md:top-14 with max-md:top-[65px] in drawer
content = content.replace('max-md:top-14', 'max-md:top-[65px]')

# Add useEffect for body overflow
use_effect_code = """  useEffect(() => {
    if (isMobileDetailsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDetailsOpen]);"""

if "document.body.style.overflow" not in content:
    old_state = "const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);"
    new_state = old_state + "\n\n" + use_effect_code
    content = content.replace(old_state, new_state)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched HelpTicketCard successfully with top-[65px] and body overflow hidden.")
