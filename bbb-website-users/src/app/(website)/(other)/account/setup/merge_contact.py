import os
import re

setup_file = "page.tsx"
contact_file = "contact/page.tsx"

with open(setup_file, "r", encoding="utf-8") as f:
    setup_content = f.read()

with open(contact_file, "r", encoding="utf-8") as f:
    contact_content = f.read()

# 1. Update imports in setup_file
setup_content = setup_content.replace(
    'import { profilePersonalSchema } from "@/schema/updateProfileSchema";',
    'import { profilePersonalSchema, profileContactSchema } from "@/schema/updateProfileSchema";\nconst combinedSchema = profilePersonalSchema.and(profileContactSchema);\ntype CombinedSchema = z.infer<typeof combinedSchema>;'
)

# 2. Extract state variables from contact_file
state_vars_match = re.search(r'(const addressLine1 = useUpdatingProfileStore.*?const relationshipWithBrideGroom = useUpdatingProfileStore.*?\);)', contact_content, re.DOTALL)
if state_vars_match:
    state_vars = state_vars_match.group(1)
    # Replace 'state' conflict if any, but in zustand it's fine.
    
    # Insert state vars in setup_file
    setup_content = setup_content.replace(
        'const countryOfBirth = useUpdatingProfileStore((state) => state.countryOfBirth);',
        'const countryOfBirth = useUpdatingProfileStore((state) => state.countryOfBirth);\n  ' + state_vars
    )

# 3. Extract default values
defaults_match = re.search(r'defaultValues: \{.*?(addressLine1:.*?relationshipWithBrideGroom:.*?,).*?\},', contact_content, re.DOTALL)
if defaults_match:
    defaults = defaults_match.group(1)
    
    setup_content = setup_content.replace(
        'cityOfBirth: cityOfBirth ? cityOfBirth : "",',
        'cityOfBirth: cityOfBirth ? cityOfBirth : "",\n      ' + defaults
    )

# 4. Update the form type
setup_content = setup_content.replace(
    'const form = useForm<z.infer<typeof profilePersonalSchema>>({',
    'const form = useForm<CombinedSchema>({'
).replace(
    'resolver: zodResolver(profilePersonalSchema) as unknown as Resolver<\n      z.infer<typeof profilePersonalSchema>\n    >,',
    'resolver: zodResolver(combinedSchema) as unknown as Resolver<CombinedSchema>,'
).replace(
    'resolver: zodResolver(profilePersonalSchema) as unknown as Resolver<z.infer<typeof profilePersonalSchema>>',
    'resolver: zodResolver(combinedSchema) as unknown as Resolver<CombinedSchema>'
)

setup_content = re.sub(
    r'resolver: zodResolver\(profilePersonalSchema\).*?>,',
    'resolver: zodResolver(combinedSchema) as unknown as Resolver<CombinedSchema>,',
    setup_content,
    flags=re.DOTALL
)

# 5. Extract JSX fields
jsx_match = re.search(r'<div className="space-y-4">\s*<h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">\s*My Location\s*</h2>(.*?)className="flex justify-between border-t pt-4 mt-6"', contact_content, re.DOTALL)
if jsx_match:
    jsx_fields = '<div className="space-y-6 pt-8">\n            <div className="flex items-center gap-2 border-b pb-2">\n              <h3 className="text-xl font-semibold text-slate-800">Contact Details</h3>\n            </div>\n            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">\n              ' + jsx_match.group(1).rsplit('</div>', 1)[0] + '\n            </div>\n          </div>'
    
    # Inject before the info box
    setup_content = setup_content.replace(
        '<div className="bg-primary/5 rounded-2xl p-4 flex items-center gap-3 mt-6 border border-primary/10">',
        jsx_fields + '\n\n        <div className="bg-primary/5 rounded-2xl p-4 flex items-center gap-3 mt-6 border border-primary/10">'
    )

# 6. Change onSubmit to handle CombinedSchema and next step
setup_content = setup_content.replace(
    'onSubmit(data: z.infer<typeof profilePersonalSchema>)',
    'onSubmit(data: CombinedSchema)'
)

with open(setup_file, "w", encoding="utf-8") as f:
    f.write(setup_content)

print("Done merging!")
