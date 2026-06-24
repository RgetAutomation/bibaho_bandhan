import re

filepath = r"c:\xampp\htdocs\bbbrepo\bbb-website-users\src\app\(website)\(other)\helpcenter\status\[requestId]\statusClient.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    (
        '<div className="bg-card flex flex-col rounded-2xl border p-4 shadow-lg">',
        '<div className="bg-transparent md:bg-card flex flex-col rounded-none md:rounded-2xl border-0 md:border p-0 md:p-4 shadow-none md:shadow-lg">'
    ),
    (
        '<div className="divide-border bg-card flex flex-col divide-y overflow-hidden rounded-xl border shadow-sm">',
        '<div className="divide-border bg-transparent md:bg-card flex flex-col divide-y overflow-hidden rounded-none md:rounded-xl border-0 md:border shadow-none md:shadow-sm">'
    ),
    (
        '<div className="flex flex-col gap-2 rounded-xl border bg-gray-50 p-3 shadow-sm transition-shadow duration-200 hover:shadow-md dark:bg-zinc-800">',
        '<div className="flex flex-col gap-2 rounded-none md:rounded-xl border-0 border-y md:border bg-transparent md:bg-gray-50 py-3 px-0 md:p-3 shadow-none md:shadow-sm md:transition-shadow md:duration-200 md:hover:shadow-md md:dark:bg-zinc-800">'
    ),
    (
        '<div className="bg-muted mt-1 flex flex-col gap-2 rounded-xl border p-3 text-sm">',
        '<div className="bg-transparent md:bg-muted mt-1 flex flex-col gap-2 rounded-none md:rounded-xl border-0 border-y md:border p-0 py-3 md:p-3 text-sm">'
    ),
    (
        '<div className="flex items-center gap-2 p-3">',
        '<div className="flex items-center gap-2 p-0 py-3 md:p-3">'
    ),
    (
        '<div className="flex items-center gap-2 px-3 py-1 bg-muted/50">',
        '<div className="flex items-center gap-2 px-0 md:px-3 py-1 bg-transparent md:bg-muted/50">'
    ),
    (
        '<div className="flex items-center gap-2 px-3 py-2">',
        '<div className="flex items-center gap-2 px-0 md:px-3 py-2">'
    )
]

for old, new in replacements:
    content = content.replace(old, new)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Flattened card styles in Ticket Details for mobile view.")
