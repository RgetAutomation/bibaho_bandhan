//********************* START SOCKET CONSTANTS ************************* */
export const SOCKET_CONNECT = "connection";
export const SOCKET_DISCONNECT = "disconnect";

export const USER_CONNECTED = "user_connect";
export const USER_STATUS = "user_status";
export const USER_GET_STATUS = "get_user_status";

export const MESSAGE_RECEIVE = "receive_message";
export const MESSAGE_SEND = "send_message";
export const MESSAGE_READ = "message_read";
export const MESSAGE_STATUS_UPDATE = "message_status_update";
export const MESSAGE_SENT_CONFIRM = "message_sent_confirm";
export const MESSAGE_ERROR = "message_error";

export const USER_TYPING = "user_typing";
export const USER_TYPING_START = "user_typing_start";
export const USER_TYPING_STOP = "user_typing_stop";
export const USER_STOP_TYPING = "user_stop_typing";

//********************* END SOCKET CONSTANTS ************************* */

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

export const socialLinks = {
  facebookLink: "https://www.facebook.com/BangaliBibahoBandhan",
  instaLink: "https://www.instagram.com/bangalibibahobandhan/",
  twitterLink: "",
  youtubeLink: "",
  linkedIn: "",
  githubLink: "",
  dribbbleLink: "",
};

export const footerLinks = {
  policy: [
    {
      lable: "Privacy Policy",
      href: "/policies/privacy",
    },
    {
      lable: "Terms of Service",
      href: "/policies/terms",
    },
    {
      lable: "Refund Policy",
      href: "/policies/refund",
    },
  ],
  about: [
    {
      lable: "About Us",
      href: "/about",
    },
    {
      lable: "Join As Matchmaker",
      href: "/matchmaker",
    },
    {
      lable: "Help Center",
      href: "/helpcenter",
    },
    {
      lable: "Feedback",
      href: "/feedback",
    },
  ],
  help: [
    {
      lable: "FAQ",
      href: "/faq",
    },
    {
      lable: "Support",
      href: "/support",
    },
    {
      lable: "Live Chat",
      href: "/live-chat",
      hasIndicator: true,
    },
  ],
};

export const USER_ACCESS_TOKEN = "userAccessToken";
export const USER_REFRESH_TOKEN = "userRefreshToken";

export const SYSTEM_ACCESS_TOKEN = "systemAccessToken";
export const SYSTEM_REFRESH_TOKEN = "systemRefreshToken";

export const PAYMENT_UPI_ID = "35661155@ybl";

export const PREMIUM_PLAN_LINK = "/users/plan";
export const PROFILE_EDIT_PAGE_LINK = "/users/account/complete";
export const PROFILE_CHANGE_AVATAR_LINK = "/users/account/update-images";
export const PROFILE_EDIT_CONTACT_DETAILS_LINK = "/users/account/edit/contact";
export const PROFILE_EDIT_PROFILE_DETAILS_LINK = "/users/account/edit/profile";
export const PROFILE_EDIT_CHANGE_PASSWORD_LINK = "/users/account/password";
export const REPORTED_USER_LINK = "/users/reported-users";
export const HELP_CENTER_LINK = "/users/helpcenter";
export const MATCHING_LINK = "/users/matching";
export const PLANS_LINK = "/users/plan";
export const PAYMENTS_LIST_LINK = "/users/payments";
export const SUBSCRIPTION_PAGE_LINK = "/users/membership";
export const BLOCKED_USER_LINK = "/users/blocked";

export const AUTHENTICATION_LOGIN = "/auth/login";
export const AUTHENTICATION_REGISTER = "/auth/register";
