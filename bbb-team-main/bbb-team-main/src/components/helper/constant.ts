export const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api/v1"
    : "https://api.bibahobandhan.com/api/v1";

export const APP_NAME = "Bangali Bibaho Bandhan";
export const APP_SHORT_NAME = "BBB";
export const APP_TAG_LINE = "";

export const PAYMENT_UPI_ID = "35661155@ybl";

export const companyDetails = {
  name: "Bangali Bibaho Bandhan",
  shortName: "Bbb",
  tagline: "Bangali Bibaho Bandhan",
  description:
    "Bangali Bibaho Bandhan is a platform that connects people who are looking for a partner to find their perfect match.",
  logo: "/logo.svg",
  darkLogo: "/logo/logo_dark.svg",
  lightLogo: "/logo/logo_light.svg",
  websiteLink: "https://bibahobandhan.com",
  contactNumber: "9735661155",
  contactMobile: "",
  email: "support@bibahobandhan.com",
  address: "Malda, West Bengal, India",
};

/*******************  TOKEN GENERATION   ************ */
export const COOKIES_REFRESH_TOKEN = "refreshToken";
export const COOKIES_REFRESH_TOKEN_PATH = "/";
export const COOKIES_ACCESS_TOKEN = "accessToken";
export const COOKIES_ACCESS_TOKEN_PATH = "/";
export const COOKIES_AUTHJS_TOKEN = "authjs.session-token";

export const ACCESS_TOKEN_EXPIRES_SECONDS = 1000 * 60;
export const REFRESH_TOKEN_EXPIRES_SECONDS = 365 * 24 * 60 * 60;

export const JWT_UPDATE_AGE = 1 * 60;
export const JWT_MAX_AGE = 365 * 24 * 60 * 60;
/************************************************* */

/*******************  ADMIN MENU TITLE & PATHS   *************** */
export const ADMIN_MENU_CONVERSATIONS_TITLE = "Conversations";
export const ADMIN_MENU_CONVERSATIONS_PATH = "/dashboard/conversations";

export const ADMIN_MENU_MATCHING_ROOM_TITLE = "Matching Room";
export const ADMIN_MENU_MATCHING_ROOM_PATH = "/dashboard/matching-room";

export const ADMIN_MENU_TOTAL_CONVERSATION_TITLE = "Total Conversation";
export const ADMIN_MENU_TOTAL_CONVERSATION_PATH =
  "/dashboard/total-conversation";

export const ADMIN_MENU_PAYMENT_TITLE = "Subscription Payments";
export const ADMIN_MENU_PAYMENT_PATH = "/dashboard/payments";

export const ADMIN_MENU_FREE_GROOMS_TITLE = "Free Grooms";
export const ADMIN_MENU_FREE_GROOMS_PATH = "/dashboard/grooms/free";

export const ADMIN_MENU_PAID_GROOMS_TITLE = "Paid Grooms";
export const ADMIN_MENU_PAID_GROOMS_PATH = "/dashboard/grooms/paid";

export const ADMIN_MENU_END_PLAN_GROOMS_TITLE = "End Plan Grooms";
export const ADMIN_MENU_END_PLAN_GROOMS_PATH = "/dashboard/grooms/end-plan";

export const ADMIN_MENU_BLOCKED_GROOMS_TITLE = "Blocked Grooms";
export const ADMIN_MENU_BLOCKED_GROOMS_PATH = "/dashboard/grooms/blocked";

export const ADMIN_MENU_PAID_MATCHING_TITLE = "Matched Grooms";
export const ADMIN_MENU_PAID_MATCHING_PATH = "/dashboard/grooms/paid-matching";

export const ADMIN_MENU_REPORTED_GROOM_TITLE = "Reported History";
export const ADMIN_MENU_REPORTED_GROOM_PATH = "/dashboard/report";

export const ADMIN_MENU_HELP_REQUEST_TITLE = "Help Request";
export const ADMIN_MENU_HELP_REQUEST_TITLE_PATH = "/dashboard/request/help";

export const ADMIN_MENU_MESSAGE_GROOMS_TITLE = "Message Groom";
export const ADMIN_MENU_MESSAGE_GROOMS_PATH = "/dashboard/message/grooms";

export const ADMIN_MENU_MESSAGE_TEAM_MEMBER_TITLE = "Message Team Member";
export const ADMIN_MENU_MESSAGE_TEAM_MEMBER_PATH =
  "/dashboard/message/moderator";

/************************************************* */

/*******************  TEAM MENU TITLE & PATHS   *************** */
export const TEAM_MENU_APPROVAL_CONVERSATIONS_TITLE = "Approval Conversation";
export const TEAM_MENU_APPROVAL_CONVERSATIONS_PATH =
  "/dashboard/moderator/approval";

export const TEAM_MENU_ASSIGNED_WORK_TITLE = "Assigned Work";
export const TEAM_MENU_ASSIGNED_WORK_PATH = "/dashboard/moderator/assigned";

export const TEAM_MENU_STARRED_CONVERSATIONS_TITLE = "Pre-Matching Room";
export const TEAM_MENU_STARRED_CONVERSATIONS_PATH =
  "/dashboard/moderator/starred";

export const TEAM_MENU_MATCHING_CONVERSATIONS_TITLE = "Matching Room";
export const TEAM_MENU_MATCHING_CONVERSATIONS_PATH =
  "/dashboard/moderator/matching-room";

export const TEAM_MENU_MESSAGE_BRIDE_TITLE = "Bride's Message";
export const TEAM_MENU_MESSAGE_BRIDE_PATH =
  "/dashboard/moderator/message/bride";

export const TEAM_MENU_MESSAGE_TEAM_MANAGER_TITLE = "Message Team Manager";
export const TEAM_MENU_MESSAGE_TEAM_MANAGER_PATH =
  "/dashboard/moderator/message/manager";

export const TEAM_MENU_REPORT_HISTORY_TITLE = "Report History";
export const TEAM_MENU_REPORT_HISTORY_PATH = "/dashboard/moderator/report";

export const TEAM_MENU_REJECTED_MESSAGE_TITLE = "Rejected Approval Chat";
export const TEAM_MENU_REJECTED_MESSAGE_PATH =
  "/dashboard/moderator/rejected-message";
/*************************************************************** */

/*******************  GHOTOK MENU TITLE & PATHS   *************** */
export const GHOTOK_MENU_MY_BRIDES_TITLE = "My Brides";
export const GHOTOK_MENU_MY_BRIDES_PATH = "/dashboard/ghotok/users/brides";

export const GHOTOK_MENU_MY_GROOMS_TITLE = "My Grooms";
export const GHOTOK_MENU_MY_GROOMS_PATH = "/dashboard/ghotok/users/grooms";

export const GHOTOK_MENU_BRIDES_CHATS_TITLE = "Brides Chats";
export const GHOTOK_MENU_BRIDES_CHATS_PATH = "/dashboard/ghotok/chats/brides";

export const GHOTOK_MENU_GROOMS_CHATS_TITLE = "Grooms Chats";
export const GHOTOK_MENU_GROOMS_CHATS_PATH = "/dashboard/ghotok/chats/grooms";

export const GHOTOK_MENU_CONNECTION_REQUEST_TITLE = "Connection Request";
export const GHOTOK_MENU_CONNECTION_REQUEST_PATH =
  "/dashboard/ghotok/request/connection";

export const GHOTOK_MENU_PAID_MATCHING_TITLE = "Paid Matching";
export const GHOTOK_MENU_PAID_MATCHING_PATH = "/dashboard/ghotok/paid-matching";

export const GHOTOK_MENU_REPORT_HISTORY_TITLE = "Report History";
export const GHOTOK_MENU_REPORT_HISTORY_PATH = "/dashboard/ghotok/report";

export const GHOTOK_MENU_CHAT_MATCH_GROOM_TITLE = "Chat Match Groom";
export const GHOTOK_MENU_CHAT_MATCH_GROOM_PATH = "/dashboard/ghotok/matching";
/*************************************************************** */

/******************* DEFAULT MENU PATHS   *************** */

export const DEFAULT_MENU_DASHBOARD_TITLE = "Dashboard";
export const DEFAULT_MENU_DASHBOARD_PATH = "/dashboard";

export const DEFAULT_MENU_MESSAGE_MANAGER_TITLE = "Message Team Head";
export const DEFAULT_MENU_MESSAGE_MANAGER_PATH = "/dashboard/message-manager";

export const DEFAULT_MENU_ACCOUNT_PROFILE_TITLE = "Profile";
export const DEFAULT_MENU_ACCOUNT_PROFILE_PATH = "/dashboard/account/profile";

export const DEFAULT_MENU_CHANGE_PASSWORD_TITLE = "Change Password";
export const DEFAULT_MENU_CHANGE_PASSWORD_PATH = "/dashboard/account/password";

/************************************************* */

/**************************************************  */

export const TEAM_MESSAGE_SEND = "team_message_send";
export const TEAM_MESSAGE_RECEIVE = "team_message_receive";
export const TEAM_MESSAGE_SENT_CONFIRM = "team_message_sent_confirm";
export const TEAM_MESSAGE_STATUS_UPDATE = "team_message_status_update";
export const TEAM_MESSAGE_READ = "team_message_read";
export const TEAM_USER_CONNECTED = "team_user_connected";
export const TEAM_STATUS = "team_status";
export const TEAM_TYPING = "team_typing";
export const TEAM_TYPING_START = "team_typing_start";
export const TEAM_TYPING_STOP = "team_typing_stop";
export const TEAM_LOAD_MESSAGES = "team_load_messages";
export const TEAM_MESSAGES = "team_messages";
