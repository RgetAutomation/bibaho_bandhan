import re

file_path = 'c:/xampp/htdocs/bbbrepo/bangalibibahobandhan-api-main/src/controllers/user.controller.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We want to replace the whole getSelfDetails function
# Let's find it.
start_idx = content.find("export async function getSelfDetails(req: Request, res: Response) {")
if start_idx != -1:
    # Find the end of the function. We can look for the next export async function
    end_idx = content.find("export async function updateProfile(req: Request, res: Response) {", start_idx)
    
    if end_idx != -1:
        new_func = '''export async function getSelfDetails(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        phone: true,
        allowSocialPublish: true,
        isProfilePublic: true,
        verificationStatus: true,
        profile: {
          select: {
            dob: true,
            maritalStatus: true,
            children: true,
            bloodGroup: true,
            religion: true,
            gotra: true,
            caste: true,
            subCaste: true,
            manglikDosh: true,
            speciallyAble: true,
            height: true,
            weight: true,
            skinTone: true,
            bodyType: true,
            eatingHabits: true,
            drinkingHabits: true,
            smokingHabits: true,
            addressLine1: true,
            addressLine2: true,
            postOffice: true,
            policeStation: true,
            dist: true,
            state: true,
            pinCode: true,
            whatsappNumber: true,
            alternatePhone: true,
            aboutMyself: true,
            profession: true,
            education: true,
            hobbies: true,
            monthlyIncome: true,
            language: true,
            motherTongue: true,
            spokenLanguages: true,
            childrenLivingWith: true,
            familyMembers: true,
            fatherProfession: true,
            employmentType: true,
            occupationDetails: true,
            designation: true,
            companyName: true,
            candidatePreference: true,
            locationPreference: true,
            aboutMyPartner: true,
            rashi: true,
            nakshatra: true,
            birthTime: true,
            cityOfBirth: true,
            countryOfBirth: true,
            relationshipWithBrideGroom: true,
            familyType: true,
            myFamilyStatus: true,
            familyValues: true,
            mothersOccupation: true,
            noOfBrothers: true,
            noOfSisters: true,
            brothersMarriedCount: true,
            sistersMarriedCount: true,
            familyDescription: true,
            familyBackground: true,
            culturalValues: true,
            partnerWeightRange: true,
            partnerEmploymentType: true,
            partnerSubCaste: true,
            partnerGothra: true,
            partnerDrinkingHabit: true,
            partnerSmokingHabit: true,
            partnerDisabilityAcceptable: true,
            partnerPersonalityExpectation: true,
            partnerFamilyExpectation: true,
            partnerFamilyDetails: true,
            familyStatusPreference: true,
            familyTypePreference: true,
            familyValuesPreference: true,
            workExperience: true,
            collegeInstitution: true,
            fieldOfStudy: true,
            organizationName: true,
            country: true,
            citizenship: true,
            ancestralOrigin: true,
            healthScreening: true,
            partnerAgeRange: true,
            partnerHeightRange: true,
            partnerMaritalStatus: true,
            partnerReligion: true,
            partnerMotherTongue: true,
            partnerSpokenLanguages: true,
            partnerPreferredCountry: true,
            partnerPreferredState: true,
            partnerPreferredDistrict: true,
            partnerDiet: true,
            partnerDescription: true,
          },
        },
      },
    });

    const formattedData = {
        isProfilePublic: user?.isProfilePublic,
        allowSocialPublish: user?.allowSocialPublish,
        verificationStatus: user?.verificationStatus,
        id: user?.id,
        firstName: user?.firstName,
        middleName: user?.middleName,
        lastName: user?.lastName,
        email: user?.email,
        phone: user?.phone,
        ...user?.profile,
      };

    res.json(new ApiResponse(200, "User fetched successfully", formattedData));
  } catch (err) {
    console.error(err);
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

'''
        new_content = content[:start_idx] + new_func + content[end_idx:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Replaced getSelfDetails successfully")
    else:
        print("Could not find end of function")
else:
    print("Could not find start of function")
