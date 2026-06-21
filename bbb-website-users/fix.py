f = 'src/app/users/(all)/(main)/account/edit/profile/page.tsx'
with open(f, 'r', encoding='utf-8') as file:
    lines = file.readlines()

lines.insert(1210, '                name=\"postOffice\"\n')
lines.insert(1231, '                name=\"policeStation\"\n')
lines.insert(1661, '                name=\"passingYear\"\n')

with open(f, 'w', encoding='utf-8') as file:
    file.writelines(lines)
