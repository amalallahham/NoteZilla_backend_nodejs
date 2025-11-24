// Message strings for internationalization and externalization
// AI Assistant: Message structure generated with assistance from GitHub Copilot

module.exports = {
  auth: {
    missingFields: "Missing required fields",
    invalidEmail: "Invalid email format",
    passwordTooShort: "Password must be at least 6 characters",
    emailExists: "Email already registered",
    registrationSuccess: "Registration successful",
    invalidCredentials: "Invalid credentials",
    loginSuccess: "Login successful",
    emailPasswordRequired: "Email and password are required",
    missingToken: "Missing token",
    invalidToken: "Invalid token",
    unauthorized: "Unauthenticated",
    forbidden: "Forbidden: admin only"
  },
  user: {
    notFound: "User not found",
    profileRetrieved: "Profile retrieved successfully"
  },
  video: {
    titleRequired: "Title is required",
    videoCreated: "Video created successfully",
    videoNotFound: "Video not found",
    videoUpdated: "Video updated successfully",
    videoDeleted: "Video deleted successfully",
    videosRetrieved: "Videos retrieved successfully"
  },
  api: {
    limitExceeded: "API call limit exceeded",
    limitMessage: "You have reached your maximum of 20 API calls",
    serverError: "Server error",
    failedToTrack: "Failed to track API usage"
  },
  admin: {
    accessDenied: "Access denied. Admin privileges required."
  }
};
