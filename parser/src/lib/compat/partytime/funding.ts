import { Phase1Funding } from "podcast-partytime";

export const fundingCompat = (funding: Phase1Funding) => {
  return {
    value: funding.message,
    url: funding.url
  };
};
