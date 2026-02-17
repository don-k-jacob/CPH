export type ProductSubmissionPayload = {
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  logoUrl?: string;
  topicNames: string[];
  launchDate?: string;
};
