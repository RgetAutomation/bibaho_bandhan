const fs = require('fs');
const path = 'c:/xampp/htdocs/bbbrepo/bangalibibahobandhan-api-main/prisma/schema.prisma';
let text = fs.readFileSync(path, 'utf8');

// Replace in User model
text = text.replace(
  /shortlistedBy\s+Shortlist\[\]\s+@relation\("ShortlistedBy"\)/,
  `shortlistedBy              Shortlist[]                 @relation("ShortlistedBy")\n\n    privateNotesWritten        PrivateNote[]               @relation("UserPrivateNotes")\n    privateNotesTarget         PrivateNote[]               @relation("TargetPrivateNotes")`
);

// Append PrivateNote model after Shortlist model
const shortlistEndIndex = text.indexOf('@@index([profileId])\n}');
if (shortlistEndIndex > -1) {
  const insertIndex = shortlistEndIndex + '@@index([profileId])\n}'.length;
  const privateNoteStr = `\n\n// Private Note Model\nmodel PrivateNote {\n  id        String   @id @default(cuid())\n  userId    String\n  targetId  String\n  note      String   @db.Text\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  user       User @relation("UserPrivateNotes", fields: [userId], references: [id], onDelete: Cascade)\n  targetUser User @relation("TargetPrivateNotes", fields: [targetId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, targetId])\n  @@index([userId])\n  @@index([targetId])\n}`;
  
  text = text.slice(0, insertIndex) + privateNoteStr + text.slice(insertIndex);
} else {
  console.log("Could not find the end of Shortlist model");
}

fs.writeFileSync(path, text, 'utf8');
console.log('Modified schema');
