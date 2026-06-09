import { Gender } from "../types/gender.js";
import { Role } from "../types/roles.js";

export class ChatValidationService {
  private readonly roleGenderRestrictions: Map<Role, Gender[]> = new Map([
    [Role.ADMIN, [Gender.MALE]], // Admin can only chat with Male users
    [Role.MODERATOR, [Gender.FEMALE]], // Moderator can only chat with Female users
    [Role.SUPERADMIN, [Gender.MALE, Gender.FEMALE]], // Superadmin can chat with both Male and Female users
  ]);

  /**
   * Check if a sender can message a receiver based on gender restrictions
   */
  canChat(
    senderRole: Role,
    receiverGender: Gender
  ): { allowed: boolean; reason?: string } {
    const allowedGenders = this.roleGenderRestrictions.get(senderRole);

    if (!allowedGenders) {
      return { allowed: true }; // No restrictions for this role
    }

    if (allowedGenders.includes(receiverGender)) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `${senderRole} can only chat with ${this.formatGenders(allowedGenders)} users`,
    };
  }

  /**
   * Check if team member can message user based on gender restrictions
   */
  canTeamMemberChat(
    teamMemberRole: Role,
    userGender: Gender
  ): { allowed: boolean; reason?: string } {
    return this.canChat(teamMemberRole, userGender);
  }

  /**
   * Validate conversation creation between users
   */
  validateUserToUserChat(
    senderRole: Role,
    senderGender: Gender,
    receiverRole: Role,
    receiverGender: Gender
  ): { allowed: boolean; reason?: string } {
    // Check if sender can message receiver
    const senderCheck = this.canChat(senderRole, receiverGender);
    if (!senderCheck.allowed) {
      return senderCheck;
    }

    // Check if receiver can message sender (for two-way communication)
    const receiverCheck = this.canChat(receiverRole, senderGender);
    if (!receiverCheck.allowed) {
      return {
        allowed: false,
        reason: `Receiver (${receiverRole}) cannot chat with ${this.formatGender(senderGender)} users`,
      };
    }

    return { allowed: true };
  }

  /**
   * Get all allowed genders for a specific role
   */
  getAllowedGenders(role: Role): Gender[] {
    return this.roleGenderRestrictions.get(role) || []; // Return empty array if role is not found
  }

  /**
   * Check if role has gender restrictions
   */
  hasGenderRestrictions(role: Role): boolean {
    const allowedGenders = this.roleGenderRestrictions.get(role);
    return allowedGenders ? allowedGenders.length < 3 : false; // Less than all genders means restrictions
  }

  private formatGenders(genders: Gender[]): string {
    return genders.map((g) => g.toLowerCase()).join(" or ");
  }

  private formatGender(gender: Gender): string {
    return gender.toLowerCase();
  }
}
