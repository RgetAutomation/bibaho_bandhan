const fs = require('fs');
const path = 'c:/xampp/htdocs/bbbrepo/bangalibibahobandhan-api-main/src/controllers/user.controller.ts';

const content = `

export async function getPrivateNotes(req: Request, res: Response) {
  try {
    const userId = req.user.id as string;
    const notes = await prisma.privateNote.findMany({
      where: { userId }
    });
    return res.status(200).json(new ApiResponse(200, notes, 'Private notes fetched successfully'));
  } catch (error) {
    console.error('Error fetching private notes', error);
    return res.status(500).json(new ApiError(500, 'Internal Server Error'));
  }
}

export async function upsertPrivateNote(req: Request, res: Response) {
  try {
    const userId = req.user.id as string;
    const targetId = req.params.targetId as string;
    const { note } = req.body;

    if (!targetId || note === undefined) {
      return res.status(400).json(new ApiError(400, 'Missing targetId or note text'));
    }

    const savedNote = await prisma.privateNote.upsert({
      where: {
        userId_targetId: {
          userId,
          targetId
        }
      },
      update: { note },
      create: { userId, targetId, note }
    });

    return res.status(200).json(new ApiResponse(200, savedNote, 'Private note saved successfully'));
  } catch (error) {
    console.error('Error saving private note', error);
    return res.status(500).json(new ApiError(500, 'Internal Server Error'));
  }
}
`;

fs.appendFileSync(path, content);
console.log('Appended to user.controller.ts');
